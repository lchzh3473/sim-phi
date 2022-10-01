const uploader = {
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
 * @typedef {{type:string,data:{}[]|ArrayBuffer|ImageBitmap}} ReaderData
 * @typedef {{name:string,path:string,buffer:ArrayBuffer}} DataType
 * @param {{name:string,path:string,buffer:ArrayBuffer}} result 
 * @param {{isJSZip:boolean,onread:(param1:ReaderData,param2:number)=>void}} param1 
 */
function readZip(result, { isJSZip, onread }) {
	const string = async i => {
		const decoder = new TextDecoder;
		return decoder.decode(i);
	};
	/**
	 * @param {DataType} i 
	 * @returns {Promise<ReaderData>}
	 */
	const it = async i => {
		if (i.name == 'line.csv') {
			const data = await string(i.buffer);
			const chartLine = csv2array(data, true);
			return { type: 'line', data: chartLine };
		}
		if (i.name == 'info.csv') {
			const data = await string(i.buffer);
			const chartInfo = csv2array(data, true);
			return { type: 'info', data: chartInfo };
		}
		return (async () => {
			const audioData = await audio.decode(i.buffer.slice());
			return { type: 'audio', name: i.name, data: audioData };
		})().catch(async () => {
			const data = new Blob([i.buffer]);
			const imageData = await createImageBitmap(data);
			return { type: 'image', name: i.name, data: imageData };
		}).catch(async () => {
			const data = await string(i.buffer);
			console.log(JSON.parse(data)); //test
			const jsonData = await chart123(JSON.parse(data));
			return { type: 'chart', name: i.name, md5: md5(data), data: jsonData };
		}).catch(async () => {
			const data = await string(i.buffer);
			console.log(i);
			const pecData = pec2json(data, i.name);
			const jsonData = await chart123(pecData.data);
			for (const i of pecData.messages) msgHandler.sendWarning(i);
			return { type: 'chart', name: i.name, md5: md5(data), data: jsonData };
		}).catch(error => ({ type: 'error', name: i.name, data: error }));
	};
	const tl = urls[isJSZip ? 'jszip' : 'zip'].reverse()[0];
	// 踩坑：worker实际上优化了性能，性能对比应该用zip测试而不是普通文件
	// if (!self._zip_reader) {
	// 	localStorage.setItem('zip_reader', tl);
	// 	loadJS('js/reader-zip.js').then(() => {
	// 		self._zip_reader = new ZipReader(isJSZip, async msg => {
	// 			/** @type {{data:{name:string,path:string,buffer:ArrayBuffer},total:number}} */
	// 			const data = msg.data;
	// 			uploader.total = data.total;
	// 			const result = await it(data.data);
	// 			return onread(result);
	// 		});
	// 		self._zip_reader.postMessage(result);
	// 	});
	// } else self._zip_reader.postMessage(result);
	if (!self._zip_worker) {
		const worker = new Worker(`js/worker-zip.js#${tl}`); //以后考虑indexedDB存储url
		let total = 0;
		worker.addEventListener('message', async msg => {
			/** @type {{data:{name:string,path:string,buffer:ArrayBuffer},total:number}} */
			const data = msg.data;
			total = data.total;
			const result = await it(data.data);
			return onread(result, total);
		});
		self._zip_worker = worker;
	}
	self._zip_worker.postMessage(result, [result.buffer]);
}