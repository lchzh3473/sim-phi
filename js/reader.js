//JSZip
function ljs(result) {
	JSZip.loadAsync(result).then(async zip => {
		const zipData = [];
		for (const i in zip.files) {
			if (i.replace(/.*\//, '')) zipData.push(zip.files[i]); //过滤文件夹
		}
		console.log(zipData);
		let loadedNum = 0;
		const zipRaw = await Promise.all(zipData.map(async i => {
			if (i.name == 'line.csv') {
				const data = await i.async('string');
				const chartLine = csv2array(data, true);
				chartLineData.push(...chartLine);
				loading(++loadedNum);
				return chartLine;
			}
			if (i.name == 'info.csv') {
				const data_2 = await i.async('string');
				const chartInfo = csv2array(data_2, true);
				chartInfoData.push(...chartInfo);
				loading(++loadedNum);
				return chartInfo;
			}
			return i.async('uint8array').then(async data => {
				const audioData = await audio.decode(data.buffer);
				bgms[i.name] = audioData;
				selectbgm.appendChild(createOption(i.name, i.name));
				loading(++loadedNum);
				return audioData;
			}).catch(async () => {
				const data = await i.async('blob');
				const imageData = await createImageBitmap(data);
				bgs[i.name] = imageData;
				bgsBlur[i.name] = await createImageBitmap(imgBlur(imageData));
				selectbg.appendChild(createOption(i.name, i.name));
				loading(++loadedNum);
				return imageData;
			}).catch(async () => {
				const data = await i.async('string');
				console.log(JSON.parse(data)); //test
				const jsonData = await chart123(JSON.parse(data));
				charts[i.name] = jsonData;
				charts[i.name]['md5'] = md5(data);
				selectchart.appendChild(createOption(i.name, i.name));
				loading(++loadedNum);
				return jsonData;
			}).catch(async () => {
				const data = await i.async('string');
				const pecData = pec2json(data, i.name);
				const jsonData = await chart123(pecData.data);
				for (const i of pecData.messages) message.sendWarning(i);
				charts[i.name] = jsonData;
				charts[i.name]['md5'] = md5(data);
				selectchart.appendChild(createOption(i.name, i.name));
				loading(++loadedNum);
				return jsonData;
			}).catch(error => {
				console.log(error);
				loading(++loadedNum);
				message.sendWarning(`不支持的文件：${i.name}`);
				return undefined;
			});
		}));

		function createOption(innerhtml, value) {
			const option = document.createElement('option');
			const isHidden = /(^|\/)\./.test(innerhtml);
			option.innerHTML = isHidden ? '' : innerhtml;
			option.value = value;
			if (isHidden) option.classList.add('hide');
			return option;
		}

		function loading(num) {
			message.sendMessage(`读取文件：${Math.floor(num / zipData.length * 100)}%`);
			if (num == zipData.length) {
				if (selectchart.children.length == 0) {
					message.sendError('读取出错：未发现谱面文件'); //test
				} else if (selectbgm.children.length == 0) {
					message.sendError('读取出错：未发现音乐文件'); //test
				} else {
					select.classList.remove('disabled');
					btnPause.classList.add('disabled');
					adjustInfo();
				}
			}
		}
		console.log(zipRaw);
	}, () => {
		message.sendError('读取出错：不是zip文件'); //test
	});
}
//gildas-lormeau.github.io/zip.js
function ljs2(result) {
	const reader = new zip.ZipReader(new zip.Uint8ArrayReader(new Uint8Array(result)));
	reader.getEntries().then(async zipDataRaw => {
		const zipData = [];
		for (const i of zipDataRaw) {
			if (i.filename.replace(/.*\//, '')) zipData.push(i); //过滤文件夹
		}
		console.log(zipData);
		let loadedNum = 0;
		const zipRaw = await Promise.all(zipData.map(async i => {
			if (i.filename == 'line.csv') {
				const data = await i.getData(new zip.TextWriter());
				const chartLine = csv2array(data, true);
				chartLineData.push(...chartLine);
				loading(++loadedNum);
				return chartLine;
			}
			if (i.filename == 'info.csv') {
				const data_2 = await i.getData(new zip.TextWriter());
				const chartInfo = csv2array(data_2, true);
				chartInfoData.push(...chartInfo);
				loading(++loadedNum);
				return chartInfo;
			}
			return i.getData(new zip.Uint8ArrayWriter()).then(async data => {
				const audioData = await audio.decode(data.buffer);
				bgms[i.filename] = audioData;
				selectbgm.appendChild(createOption(i.filename, i.filename));
				loading(++loadedNum);
				return audioData;
			}).catch(async () => {
				const data = await i.getData(new zip.BlobWriter());
				const imageData = await createImageBitmap(data);
				bgs[i.filename] = imageData;
				bgsBlur[i.filename] = await createImageBitmap(imgBlur(imageData));
				selectbg.appendChild(createOption(i.filename, i.filename));
				loading(++loadedNum);
				return imageData;
			}).catch(async () => {
				const data = await i.getData(new zip.TextWriter());
				console.log(JSON.parse(data)); //test
				const jsonData = await chart123(JSON.parse(data));
				charts[i.filename] = jsonData;
				charts[i.filename]['md5'] = md5(data);
				selectchart.appendChild(createOption(i.filename, i.filename));
				loading(++loadedNum);
				return jsonData;
			}).catch(async () => {
				const data = await i.getData(new zip.TextWriter());
				const jsonData = await chart123(chartp23(data, i.filename));
				charts[i.filename] = jsonData;
				charts[i.filename]['md5'] = md5(data);
				selectchart.appendChild(createOption(i.filename, i.filename));
				loading(++loadedNum);
				return jsonData;
			}).catch(error => {
				console.log(error);
				loading(++loadedNum);
				message.sendWarning(`不支持的文件：${i.filename}`);
				return undefined;
			});
		}));

		function createOption(innerhtml, value) {
			const option = document.createElement('option');
			const isHidden = /(^|\/)\./.test(innerhtml);
			option.innerHTML = isHidden ? '' : innerhtml;
			option.value = value;
			if (isHidden) option.classList.add('hide');
			return option;
		}

		function loading(num) {
			message.sendMessage(`读取文件：${Math.floor(num / zipData.length * 100)}%`);
			if (num == zipData.length) {
				if (selectchart.children.length == 0) {
					message.sendError('读取出错：未发现谱面文件'); //test
				} else if (selectbgm.children.length == 0) {
					message.sendError('读取出错：未发现音乐文件'); //test
				} else {
					select.classList.remove('disabled');
					btnPause.classList.add('disabled');
					adjustInfo();
				}
			}
		}
		console.log(zipRaw);
	}, () => {
		message.sendError('读取出错：不是zip文件'); //test
	});
	reader.close();
}

function imgBlur(img) {
	const canvas = document.createElement('canvas');
	canvas.width = img.width;
	canvas.height = img.height;
	const ctx = canvas.getContext('2d');
	ctx.drawImage(img, 0, 0);
	return StackBlur.imageDataRGB(ctx.getImageData(0, 0, img.width, img.height), 0, 0, img.width, img.height, Math.ceil(Math.min(img.width, img.height) * 0.0125));
}