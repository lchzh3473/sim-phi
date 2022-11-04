{
	let total = 0;
	importScripts(...location.hash.substring(1).split(','));
	const string = i => {
		const labels = ['gbk', 'big5', 'shift_jis'];
		for (const label of labels) {
			const decoder = new TextDecoder(label, { fatal: true });
			try {
				return decoder.decode(i);
			} catch (e) {
				if (label === labels[labels.length - 1]) throw e;
			}
		}
	};
	/** @param {{name:string,path:string,buffer:ArrayBuffer}} data */
	const readZip = function(data) {
		if (self.JSZip) { //JSZip
			/** @param {ArrayBuffer} data */
			var loadAsync = data => JSZip.loadAsync(data, { checkCRC32: true });
			/** @param {import("jszip")} zip */
			var array = zip => Object.values(zip.files).filter(i => !i.dir);
			/** @param {import("jszip").JSZipObject} i */
			var uint8array = i => i.async('uint8array');
			/** @param {import("jszip").JSZipObject} i */
			var arraybuffer = i => i.async('arraybuffer');
		} else { //gildas-lormeau.github.io/zip.js
			/** @param {ArrayBuffer} data */
			var loadAsync = data => (new zip.ZipReader(new zip.Uint8ArrayReader(new Uint8Array(data)))).getEntries(); // reader.close();
			/** @param {import("@zip.js/zip.js").Entry[]} zip */
			var array = zip => zip.filter(i => (i.name = i.filenameUTF8 ? i.filename : string(i.rawFilename), !i.directory));
			/** @param {import("@zip.js/zip.js").Entry} i */
			var uint8array = i => i.getData(new zip.Uint8ArrayWriter());
			/** @param {import("@zip.js/zip.js").Entry} i */
			var arraybuffer = i => uint8array(i).then(i => i.buffer);
		}
		loadAsync(data.buffer).then(zip => {
			console.log(zip);
			const arr = array(zip);
			total += arr.length - 1;
			arr.forEach(i => arraybuffer(i).then(buffer => readZip({ name: i.name, path: `${data.path}/${i.name}`, buffer })));
		}, () => self.postMessage({ data, total }, [data.buffer]));
	}
	self.addEventListener('message', msg => readZip((total++, msg.data)));
}