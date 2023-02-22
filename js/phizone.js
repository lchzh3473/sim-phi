import { uploader } from './reader.js';
const vtext = 'PhiZone API v0.2';
const vprompt = str => prompt(`${vtext}\n${str}`);
const valert = str => alert(`${vtext}\n${str}`);
export default async function query(id) {
	const response = await fetch(`https://api.phi.zone/songs/${id|0}/?query_charts=1`);
	if (!response.ok) return { charts: [] };
	const data = await response.json();
	console.log(data);
	return {
		charts: data.charts.filter(a => a.chart).map(a => ({
			id: a.id,
			chart: a.chart,
			level: `${a.level}  Lv.${a.difficulty|0}`,
			charter: a.charter.replace(/\[PZUser:\d+:([^\]]+)\]/g, '$1'),
		})),
		composer: data.composer,
		illustration: data.illustration,
		illustrator: data.illustrator,
		name: data.name,
		song: data.song,
		// offset: data.offset
	};
}
export async function dialog(num) {
	const id = num || vprompt('请输入歌曲ID');
	if (id === '') return valert('未输入歌曲ID，已取消操作');
	const data = await query(id);
	console.log(data);
	const charts = data.charts;
	if (!charts.length) return valert(`歌曲ID${id}对应的谱面不存在`);
	const dstr = str => decodeURIComponent(str.match(/[^/]+$/)[0]);
	await xhr3(data.song, dstr(data.song), 0, charts.length + 2);
	await xhr3(data.illustration, dstr(data.illustration), 1, charts.length + 2);
	charts.forEach(async (i, idx) => {
		await xhr3(i.chart, dstr(i.chart), idx + 2, charts.length + 2);
		const encoder = new TextEncoder();
		const offset = getOffset(i.id);
		const infoText = `
			#
			Name: ${data.name}
			Song: ${dstr(data.song)}
			Picture: ${dstr(data.illustration)}
			Chart: ${dstr(i.chart)}
			Level: ${i.level}
			Composer: ${data.composer}
			Charter: ${i.charter}
			Illustrator: ${data.illustrator}
			Offset: ${offset}
		`;
		const info = encoder.encode(infoText);
		uploader.onload({ target: { result: info.buffer } }, { name: 'info.txt' });
	});
	async function xhr3(url, name, loaded, total) {
		const result = await new Promise(resolve => xhr2(url, {
			onprogress(evt) { uploader.onprogress({ loaded: evt.total * loaded + evt.loaded, total: evt.total * total }) },
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
	if (id === 29) return 200; //45
	if (id === 31) return 100; //24
	if (id === 38) return 175; //64
	if (id === 41) return 50; //43
	if (id === 42) return 175; //13
	if (id === 44) return -150; //33
	if (id === 54) return -500; //8
	if (id === 57) return 100; //52
	if (id === 59) return 50; //61
	if (id === 60) return 150; //74
	if (id === 63) return 175; //59
	if (id === 64) return 150; //55
	if (id === 65) return 250; //22-2
	if (id === 69) return -100; //68
	if (id === 71) return 50; //72
	if (id === 73) return 200; //69-1
	if (id === 74) return 300; //80
	if (id === 76) return -50; //89
	if (id === 77) return 300; //99
	if (id === 78) return 200; //69-2
	if (id === 80) return 200; //94
	if (id === 81) return 250; //97-1
	if (id === 84) return 250; //93
	if (id === 85) return 400; //91
	if (id === 87) return -50; //88
	if (id === 88) return 225; //102
	if (id === 90) return 200; //101-1
	if (id === 91) return 200; //101-2
	if (id === 93) return 200; //101-3
	if (id === 95) return 175; //21
	if (id === 100) return 150; //109
	if (id === 101) return -100; //108
	if (id === 102) return -200; //110
	if (id === 103) return -50; //112
	if (id === 105) return -400; //92
	if (id === 106) return 250; //97-2
	if (id === 107) return 150; //83
	if (id === 108) return 200; //113
	if (id === 110) return 150; //66
	if (id === 115) return 200; //122
	return 0;
}
self.dialog = dialog;