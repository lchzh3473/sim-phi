import { csv2array } from './common.js';
import Pec from './pec2json.js';
class FileEmitter extends EventTarget {
	// files: [],
	constructor() {
		super();
		const _this = this;
		this.input = Object.assign(document.createElement('input'), {
			type: 'file',
			accept: '',
			multiple: true,
			/**@this {HTMLInputElement} */
			onchange() {
				_this.fireChange(this.files);
				for (const i of this.files) { //加载文件
					const reader = new FileReader();
					reader.readAsArrayBuffer(i);
					reader.onprogress = evt => _this.fireProgress(evt.loaded, evt.total);
					reader.onload = evt => _this.fireLoad(i, evt.target.result);
				}
			}
		});
	}
	uploadFile() {
		uploader.input.webkitdirectory = false;
		uploader.input.click();
	}
	uploadDir() {
		uploader.input.webkitdirectory = true;
		uploader.input.click();
	}
	fireChange(files) {
		return this.dispatchEvent(Object.assign(new Event('change'), { files }));
	}
	fireProgress(loaded, total) {
		return this.dispatchEvent(new ProgressEvent('progress', { lengthComputable: true, loaded, total }));
	}
	fireLoad(file, buffer) {
		return this.dispatchEvent(Object.assign(new ProgressEvent('load'), { file, buffer }));
	}
}
export const uploader = new FileEmitter();
/**
 * @typedef {{type:'line'|'info',data:{}[]}} TextReaderData
 * @typedef {{name:string,type:'image',data:ImageBitmap}} ImageReaderData
 * @typedef {{name:string,type:'media'|'audio',data:AudioBuffer}} MediaReaderData
 * @typedef {{name:string,type:'chart',msg:string[],info:{}[],line:{}[],md5:string,data:any}} ChartReaderData
 * @typedef {TextReaderData|ImageReaderData|MediaReaderData|ChartReaderData} ReaderData
 * @property {string} name
 * @property {string} type
 * @property {ArrayBuffer|ImageBitmap|{}[]} data
 *
 * @typedef {object} DataType
 * @property {string} name
 * @property {string} path
 * @property {ArrayBuffer} buffer
 *
 * @typedef {object} ReaderOptions
 * @property {(data:DataType)=>Promise<ReaderData>} handler
 */
const stringify = async i => {
	const labels = ['utf-8', 'gbk', 'big5', 'shift_jis'];
	for (const label of labels) {
		const decoder = new TextDecoder(label, { fatal: true }); // '\ufffd'
		try {
			return decoder.decode(i);
		} catch (e) {
			if (label === labels[labels.length - 1]) throw e;
		}
	}
};
export class ZipReader extends EventTarget {
	/** @param {ReaderOptions} options */
	constructor({ handler = async data => data }) {
		super();
		this.worker = null;
		this.total = 0;
		this.handler = handler;
	}
	/** @param {DataType} result */
	read(result) {
		if (!this.worker) {
			this.dispatchEvent(new CustomEvent('loadstart'));
			const worker = new Worker('worker/zip.js'); //以后考虑indexedDB存储url
			worker.addEventListener('message', async msg => {
				/** @type {{data:DataType,total:number}} */
				const data = msg.data;
				this.total = data.total;
				const result = await this.handler(data.data);
				this.dispatchEvent(new CustomEvent('read', { detail: result }));
			});
			this.worker = worker;
			this.terminate = () => this.worker.terminate();
		}
		this.worker.postMessage(result, [result.buffer]);
	}
}
/**
 * @param {DataType} i
 * @returns {Promise<ReaderData>}
 */
export async function readFile(i, {
	createAudioBuffer = async arraybuffer => {
		/** @type {AudioContext} */
		const actx = new(window.AudioContext || window.webkitAudioContext)();
		await actx.close();
		return actx.decodeAudioData(arraybuffer);
	}
}) {
	const { name, path } = splitPath(i.name);
	if (name === 'line.csv') {
		const data = await stringify(i.buffer);
		const chartLine = joinPathInfo(csv2array(data, true), path);
		return { type: 'line', data: chartLine };
	}
	if (name === 'info.csv') {
		const data = await stringify(i.buffer);
		const chartInfo = joinPathInfo(csv2array(data, true), path);
		return { type: 'info', data: chartInfo };
	}
	if (name === 'Settings.txt' || name === 'info.txt') {
		const data = await stringify(i.buffer);
		const chartInfo = joinPathInfo(Pec.info(data), path);
		return { type: 'info', data: chartInfo };
	}
	return new Promise(() => {
		throw new Error('Just make it a promise');
	}).catch(async () => {
		const videoElement = document.createElement('video');
		videoElement.src = URL.createObjectURL(new Blob([i.buffer]));
		videoElement.preload = 'metadata';
		await new Promise((resolve, reject) => {
			videoElement.onloadedmetadata = resolve;
			videoElement.onerror = reject;
		});
		const { videoWidth: width, videoHeight: height } = videoElement;
		const data = {
			audio: await createAudioBuffer(i.buffer.slice()),
			video: width && height ? videoElement : null
		};
		return { type: 'media', name: i.name, data };
	}).catch(async () => {
		const data = { audio: await createAudioBuffer(i.buffer.slice()), video: null };
		return { type: 'media', name: i.name, data };
	}).catch(async () => {
		const data = new Blob([i.buffer]);
		const imageData = await createImageBitmap(data);
		return { type: 'image', name: i.name, data: imageData };
	}).catch(async () => {
		const data = await stringify(i.buffer);
		try {
			JSON.parse(data);
			return new Promise(() => {
				throw new Error('Just make it a promise');
			}).catch(async () => {
				const jsonData = await chart123(data, (_, value) => typeof value === 'number' ? Math.fround(value) : value);
				return { type: 'chart', name: i.name, md5: md5(data), data: jsonData };
			}).catch(async () => {
				const rpeData = Pec.parseRPE(data, i.name, path); //qwq
				const jsonData = await chart123(rpeData.data);
				const { messages: msg, info, line } = rpeData;
				return { type: 'chart', name: i.name, md5: md5(data), data: jsonData, msg, info, line };
			});
		} catch (e) {
			return new Promise(() => {
				throw new Error('Just make it a promise');
			}).catch(async () => {
				const pecData = Pec.parse(data, i.name);
				const jsonData = await chart123(pecData.data);
				return { type: 'chart', name: i.name, md5: md5(data), data: jsonData, msg: pecData.messages };
			});
		}
	}).catch(error => ({ type: 'error', name: i.name, data: error }));
}

function splitPath(i) {
	const j = i.lastIndexOf('/');
	const name = i.slice(j + 1);
	const path = ~j ? i.slice(0, j) : '';
	return { name, path };
}

function joinPathInfo(info, path) {
	if (!path) return info;
	for (const i of info) {
		if (i.Chart) i.Chart = `${path}/${i.Chart}`;
		if (i.Music) i.Music = `${path}/${i.Music}`;
		if (i.Image) i.Image = `${path}/${i.Image}`;
	}
	return info;
}
//test
function chart123(text, reviver) {
	const chart = typeof reviver === 'function' ? JSON.parse(text, reviver) : JSON.parse(text);
	if (chart.formatVersion === undefined) throw new Error('Invalid chart file');
	switch (parseInt(chart.formatVersion)) { //加花括号以避免beautify缩进bug
		case 1: {
			chart.formatVersion = 3;
			for (const i of chart.judgeLineList) {
				for (const j of i.judgeLineMoveEvents) {
					j.start2 = j.start % 1e3 / 520;
					j.end2 = j.end % 1e3 / 520;
					j.start = Math.floor(j.start / 1e3) / 880;
					j.end = Math.floor(j.end / 1e3) / 880;
				}
			}
		}
		case 3: {
			for (const i of chart.judgeLineList) {
				let y = 0;
				let y2 = 0; //float32
				for (const j of i.speedEvents) {
					if (j.startTime < 0) j.startTime = 0;
					j.floorPosition = y;
					j.floorPosition2 = y2;
					y += (j.endTime - j.startTime) / i.bpm * 1.875 * j.value;
					y2 += Math.fround((j.endTime - j.startTime) / i.bpm * 1.875) * j.value;
					y = Math.fround(y);
					y2 = Math.fround(y2);
				}
			}
		}
		case 3473:
			for (const i of chart.judgeLineList) {
				if (i.numOfNotes == null) {
					i.numOfNotes = 0;
					for (const j of i.notesAbove) {
						if (j.type === 1) i.numOfNotes++;
						if (j.type === 2) i.numOfNotes++;
						if (j.type === 3) i.numOfNotes++;
						if (j.type === 4) i.numOfNotes++;
					}
					for (const j of i.notesBelow) {
						if (j.type === 1) i.numOfNotes++;
						if (j.type === 2) i.numOfNotes++;
						if (j.type === 3) i.numOfNotes++;
						if (j.type === 4) i.numOfNotes++;
					}
				}
			}
			if (chart.numOfNotes == null) {
				chart.numOfNotes = 0;
				for (const i of chart.judgeLineList) {
					chart.numOfNotes += i.numOfNotes;
				}
			}
			break;
		default:
			throw new Error(`Unsupported formatVersion: ${chart.formatVersion}`);
	}
	return chart;
}