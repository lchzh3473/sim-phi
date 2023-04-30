export default hook.define({
	name: 'Skin',
	description: 'Customize skin',
	contents: [{
		type: 'command',
		meta: ['/skin', skin]
	}]
});
/**
 * @typedef {import("js/reader").ReaderData} ReaderData
 */
function skin() {
	const id = `skin${Date.now()}`;
	const files = [];
	const zip = new hook.ZipReader({ handler: async data => files.push(data) });
	zip.addEventListener('loadstart', () => hook.msgHandler.sendMessage('加载zip组件...'));
	zip.addEventListener('read', evt => hook.handleFile(id, zip.total, null, done));
	const input = Object.assign(document.createElement('input'), {
		type: 'file',
		accept: '',
		/**@this {HTMLInputElement} */
		onchange() {
			const file = this.files[0];
			const reader = new FileReader();
			reader.readAsArrayBuffer(file);
			reader.onload = evt => {
				zip.read({
					name: file.name,
					buffer: evt.target.result,
					path: file.webkitRelativePath || file.name
				});
			};
		}
	});
	input.click();
	async function done() {
		console.log(files);
		const config = await loadConfig(files);
		/**@type {Object<string, string[]>} */
		const alias = {
			Tap: ['Tap.png', 'click.png'],
			TapHL: ['TapHL.png', 'click_mh.png', 'Tap.png', 'click.png'],
			Drag: ['Drag.png', 'drag.png'],
			DragHL: ['DragHL.png', 'drag_mh.png', 'Drag.png', 'drag.png'],
			Hold: ['Hold.png', 'hold.png'],
			HoldHL: ['HoldHL.png', 'hold_mh.png', 'Hold.png', 'hold.png'],
			Flick: ['Flick.png', 'flick.png'],
			FlickHL: ['FlickHL.png', 'flick_mh.png', 'Flick.png', 'flick.png'],
			HitFX: ['HitFX.png', 'hit_fx.png']
		};
		//根据别名补全文件列表
		/**@type {Object<string, ReaderData>} */
		const entries = {};
		for (const a in alias) {
			const file = files.find(i => alias[a].find(j => String(i.name).endsWith(j)));
			if (file) entries[a] = file;
		}
		for (const i in entries) {
			if (!entries[i]) continue;
			const img = await createImageBitmap(new Blob([entries[i].buffer]));
			const noteScale = 1089 / img.width;
			if (i === 'Hold') {
				const [bottom, top] = config.holdAtlas;
				const compacted = config.holdCompact;
				hook.noteRender.update('HoldEnd', await createImageBitmap(img, 0, 0, img.width, bottom), noteScale, compacted);
				hook.noteRender.update('Hold', await createImageBitmap(img, 0, bottom, img.width, img.height - bottom - top), noteScale, compacted);
				hook.noteRender.update('HoldHead', await createImageBitmap(img, 0, img.height - top, img.width, top), noteScale, compacted);
			} else if (i === 'HoldHL') {
				const [bottom, top] = config.holdAtlas;
				const compacted = config.holdCompact;
				hook.noteRender.update('HoldEndHL', await createImageBitmap(img, 0, 0, img.width, bottom), noteScale, compacted);
				hook.noteRender.update('HoldHL', await createImageBitmap(img, 0, bottom, img.width, img.height - bottom - top), noteScale, compacted);
				hook.noteRender.update('HoldHeadHL', await createImageBitmap(img, 0, img.height - top, img.width, top), noteScale, compacted);
			} else if (i === 'HitFX') {
				const [x, y] = config.hitFx;
				const scale = config.hitFxScale / (img.width / x / 256);
				const hideParts = config.hideParticles;
				const duration = config.hitFxDuration * 1000 || 500;
				hook.noteRender.updateFX(img, scale, img.width / x, img.height / y, hideParts, duration);
			} else hook.noteRender.update(i, img, noteScale);
		}
		console.log(config, entries);
	}
}
async function loadConfig(files = []) {
	const config0 = files.find(i => String(i.name).endsWith('config.txt'));
	if (config0) return yaml2json(await stringify(config0.buffer), /;?\r?\n/);
	const config1 = files.find(i => String(i.name).endsWith('info.yml'));
	if (config1) return yaml2json(await stringify(config1.buffer));
	hook.msgHandler.sendError('未找到config.txt或info.yml');
	return {};
}

function yaml2json(text = '', split = /\r?\n/) {
	const parse = value => {
		try {
			return JSON.parse(value);
		} catch (e) {
			return value;
		}
	};
	return text.split(split).reduce((i, j) => {
		const [key, value] = j.split(/:(.+)/).map(i => i.trim());
		if (key) i[key] = parse(value);
		if (i[key] === 'True') i[key] = true;
		if (i[key] === 'False') i[key] = false;
		return i;
	}, {});
}
async function stringify(i) {
	const labels = ['utf-8', 'gbk', 'big5', 'shift_jis'];
	for (const label of labels) {
		const decoder = new TextDecoder(label, { fatal: true }); // '\ufffd'
		try {
			return decoder.decode(i);
		} catch (e) {
			if (label === labels[labels.length - 1]) throw e;
		}
	}
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