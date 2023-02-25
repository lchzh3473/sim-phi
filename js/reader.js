import { urls, csv2array } from './common.js';
import Pec from './pec2json.js';
/** @type {Worker} */
let zip_worker = null;
let zip_total = 0;
export const uploader = {
	// files: [],
	input: Object.assign(document.createElement('input'), {
		type: 'file',
		accept: '',
		multiple: true,
		/**@this {HTMLInputElement} */
		onchange() {
			uploader.onchange(this.files);
			for (const i of this.files) { //加载文件
				const reader = new FileReader;
				reader.readAsArrayBuffer(i);
				reader.onprogress = evt => uploader.onprogress(evt, i);
				reader.onload = evt => uploader.onload(evt, i);
			}
		}
	}),
	uploadFile() {
		uploader.input.webkitdirectory = false;
		uploader.input.click();
	},
	uploadDir() {
		uploader.input.webkitdirectory = true;
		uploader.input.click();
	},
	onchange() {},
	onprogress() {},
	onload() {}
}
/**
 * @typedef {object} ReaderData
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
 * @property {()=>void} onloadstart
 * @property {(param1:ReaderData,param2:number)=>void} onread
 * @property {(param1:ArrayBuffer)=>Promise<AudioBuffer>} createAudioBuffer
 * 
 * @param {DataType} result 
 * @param {ReaderOptions} options 
 */
export function readZip(result, {
	createAudioBuffer = async arraybuffer => {
		/** @type {AudioContext} */
		const actx = new(window.AudioContext || window.webkitAudioContext);
		await actx.close();
		return actx.decodeAudioData(arraybuffer);
	},
	onloadstart = () => void 0,
	onread = () => void 0,
}) {
	const string = async i => {
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
	/**
	 * @param {DataType} i 
	 * @returns {Promise<ReaderData>}
	 */
	const it = async i => {
		const { name, path } = splitPath(i.name);
		if (name === 'line.csv') {
			const data = await string(i.buffer);
			const chartLine = joinPathInfo(csv2array(data, true), path);
			return { type: 'line', data: chartLine };
		}
		if (name === 'info.csv') {
			const data = await string(i.buffer);
			const chartInfo = joinPathInfo(csv2array(data, true), path);
			return { type: 'info', data: chartInfo };
		}
		if (name === 'Settings.txt' || name === 'info.txt') {
			const data = await string(i.buffer);
			const chartInfo = joinPathInfo(Pec.info(data), path);
			return { type: 'info', data: chartInfo };
		}
		return new Promise(() => { //binary
			throw new Error('Just make it a promise');
		}).catch(async () => { //video
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
			}
			return { type: 'media', name: i.name, data };
		}).catch(async () => { //audio
			const data = { audio: await createAudioBuffer(i.buffer.slice()), video: null };
			return { type: 'media', name: i.name, data };
		}).catch(async () => { //image
			const data = new Blob([i.buffer]);
			const imageData = await createImageBitmap(data);
			return { type: 'image', name: i.name, data: imageData };
		}).catch(async () => { //string
			const data = await string(i.buffer);
			try {
				JSON.parse(data);
				return new Promise(() => { //json
					throw new Error('Just make it a promise');
				}).catch(async () => { //chart
					const jsonData = await chart123(data, (_, value) => typeof value === 'number' ? Math.fround(value) : value);
					return { type: 'chart', name: i.name, md5: md5(data), data: jsonData };
				}).catch(async () => { //rpe
					const rpeData = Pec.parseRPE(data, i.name, path); //qwq
					const jsonData = await chart123(rpeData.data);
					const { messages: msg, info, line } = rpeData;
					return { type: 'chart', name: i.name, md5: md5(data), data: jsonData, msg, info, line };
				});
			} catch (e) {
				return new Promise(() => { //plain
					throw new Error('Just make it a promise');
				}).catch(async () => { //pec
					const pecData = Pec.parse(data, i.name);
					const jsonData = await chart123(pecData.data);
					return { type: 'chart', name: i.name, md5: md5(data), data: jsonData, msg: pecData.messages };
				});
			}
		}).catch(error => ({ type: 'error', name: i.name, data: error }));
	};
	if (!zip_worker) {
		onloadstart();
		const worker = new Worker('worker/zip.js'); //以后考虑indexedDB存储url
		worker.addEventListener('message', async msg => {
			/** @type {{data:{name:string,path:string,buffer:ArrayBuffer},total:number}} */
			const data = msg.data;
			zip_total = data.total;
			const result = await it(data.data);
			return onread(result, zip_total);
		});
		zip_worker = worker;
	}
	zip_worker.postMessage(result, [result.buffer]);
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
					j.start = parseInt(j.start / 1e3) / 880;
					j.end = parseInt(j.end / 1e3) / 880;
				}
			}
		}
		case 3: {
			for (const i of chart.judgeLineList) {
				let y = 0;
				for (const j of i.speedEvents) {
					if (j.startTime < 0) j.startTime = 0;
					j.floorPosition = y;
					y += (j.endTime - j.startTime) * j.value / i.bpm * 1.875;
					y = Math.fround(y); //float32
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