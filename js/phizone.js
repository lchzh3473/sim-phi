import { uploader } from './reader.js';
const vtext = 'PhiZone API v1';
const vprompt = str => prompt(`${vtext}: ${str}`);
const valert = str => alert(`${vtext}: ${str}`);
export default async function query(id) {
	const response = await fetch(`https://api.phi.zone/songs/${id|0}/?query_charts=1`);
	if (!response.ok) return [];
	const data = await response.json();
	console.log(data);
	return data.charts.filter(a => a.chart).map(a => ({
		chart: a.chart,
		level: `${a.level}  Lv.${a.difficulty|0}`,
		charter: a.charter.replace(/\[PZUser:\d+:([^\]]+)\]/g, '$1'),
		composer: data.composer,
		illustration: data.illustration,
		illustrator: data.illustrator,
		name: data.name,
		song: data.song,
		// offset: data.offset
	}));
}
export async function dialog(num) {
	const id = num || vprompt('请输入歌曲ID');
	if (id) {
		const data = await query(id);
		console.log(data);
		if (data.length) {
			const dstr = str => decodeURIComponent(str.match(/[^/]+$/)[0]);
			await xhr3(data[0].chart, 0, dstr(data[0].chart));
			await xhr3(data[0].song, 1, dstr(data[0].song));
			await xhr3(data[0].illustration, 2, dstr(data[0].illustration));
			const encoder = new TextEncoder();
			const offset = getOffset(id);
			const infoText = `#
			Name: ${data[0].name}
			Song: ${dstr(data[0].song)}
			Picture: ${dstr(data[0].illustration)}
			Chart: ${dstr(data[0].chart)}
			Level: ${data[0].level}
			Composer: ${data[0].composer}
			Charter: ${data[0].charter}
			Illustrator: ${data[0].illustrator}
			Offset: ${offset}`;
			const info = encoder.encode(infoText);
			uploader.onload({ target: { result: info.buffer } }, { name: 'info.txt' });
		} else {
			valert(`歌曲ID${id}对应的谱面不存在`);
		}
	} else {
		valert('未输入歌曲ID，已取消操作');
	}
	async function xhr3(url, loaded, name) {
		const result = await new Promise(resolve => xhr2(url, {
			onprogress(evt) { uploader.onprogress({ loaded: evt.total * loaded + evt.loaded, total: evt.total * 3 }) },
			onload(evt) { resolve(evt.target.response) }
		}));
		uploader.onload({ target: { result } }, { name });
	}

	function xhr2(url, {
		onprogress = () => void 0,
		onload = () => void 0,
	} = {}) {
		const xhr = new XMLHttpRequest();
		xhr.open('get', url, true);
		xhr.responseType = 'arraybuffer';
		xhr.onprogress = onprogress;
		xhr.onload = onload;
		xhr.send();
	}
}

function getOffset(id) {
	if (id == 8) return -475;
	return 0;
}
self.dialog = dialog;