import { uploader } from './reader.js';
const $id = query => document.getElementById(query);
const $ = query => document.body.querySelector(query);
export default function() {
	! function() {
		const t = new Date;
		if (1 != t.getDate() || 3 != t.getMonth()) return;
		import('./reverseChart.js');
	}();
	hook.kfcFkXqsVw50.push(function() {
		if (hook.chartsMD5.get(hook.selectchart.value) === 'ab9d2cc3eb569236ead459ad4caba109') {
			console.log('好耶');
			const analyser = hook.audio.actx.createAnalyser();
			analyser.fftSize = 4096;
			// analyser.minDecibels = -180;
			const getFreq = () => { //progress变为频谱图
				const bufferLength = analyser.frequencyBinCount;
				const freq = new Uint8Array(bufferLength);
				analyser.getByteFrequencyData(freq);
				const avg = freq.reduce((a, b) => a + b) / bufferLength;
				return Math.min(1, avg / 255 * 2.15); //qwq
			}
			let flagMusic = true;
			let flagPerfect = NaN;
			let flagGood = NaN;
			let flagBad = NaN;
			let flagEm = '';
			let flagN = false;
			const setFlag = (flag, em, n) => {
				flagEm = em;
				flagN = n;
				return flag;
			}
			hook['flag{qwq}'] = time => {
				time *= hook.app.speed * 1.95;
				const bgMusic = hook.tmps.bgMusic();
				if (bgMusic && bgMusic !== flagMusic) {
					bgMusic.connect(analyser); //?
					flagMusic = bgMusic;
				}
				if (time < 168) {
					hook.stat.numOfNotes = 305;
					hook.tmps.level = 'lN  Lv.I2';
					hook.tmps.progress = time / 218;
				} else if (time < 169) {
					const progress = 1 - (169 - time) ** 3; //easeCubicOut
					hook.stat.numOfNotes = (305 + 2195 * progress) | 0;
					hook.tmps.progress = getFreq();
				} else {
					hook.stat.numOfNotes = 2500;
					hook.tmps.progress = getFreq();
				}
				if (time > 325 && time < 358) {
					//监听判定变化
					const statusP = hook.stat.perfect;
					const statusG = hook.stat.good;
					const statusB = hook.stat.bad;
					if (isNaN(flagPerfect)) flagPerfect = statusP;
					if (isNaN(flagGood)) flagGood = statusG;
					if (isNaN(flagBad)) flagBad = statusB;
					if (statusP !== flagPerfect) flagPerfect = setFlag(statusP, '\uff2f(\u2267\u25bd\u2266)\uff2f', true);
					else if (statusG !== flagGood) flagGood = setFlag(statusG, '(\uff3e\u03c9\uff3e)', true);
					else if (statusB !== flagBad) flagBad = setFlag(statusB, '(\u2299\ufe4f\u2299;)', true);
					//监听时间变化
					if (time < 327) setFlag(null, '(\u2299o\u2299)', false);
					else if (time > 334 && time < 335) setFlag(null, '(\u2299o\u2299)', false);
					else if (time > 342 && time < 343) setFlag(null, '(\u2299o\u2299)', false);
					else if (time > 350 && time < 351) setFlag(null, '(\u2299o\u2299)', false);
					else if (!flagN) flagEm = '(\u2299ω\u2299)';
					hook.tmps.combo = flagEm;
				}
			};
		} else hook['flag{qwq}'] = () => {};
	});
	const id = setInterval(function() {
		if (!$('.title>small')) return;
		clearInterval(id);
		let tid = 3;
		$('.title>small').addEventListener('click', function() {
			if (--tid) return;
			const btn = document.createElement('button');
			$id('uploader').insertAdjacentElement('afterend', btn);
			$id('uploader').insertAdjacentText('afterend', ' ');
			if (new URLSearchParams(location.search).has('test')) {
				btn.innerText = 'Demo';
				btn.onclick = function() {
					btn.onclick = null;
					btn.remove();
					const handler = img => uploader.onload({ target: decode(img) }, { name: 'demo.zip' });
					fetch('src/demo.webp').then(res => res.blob()).then(createImageBitmap).then(handler);
				};
			} else {
				btn.innerText = 'Legacy';
				btn.onclick = function() {
					btn.onclick = null;
					btn.remove();
					location.replace('/sim-phi-legacy');
				};
			}
		});
	}, 500);
}

function decode(img) {
	const canvas = document.createElement('canvas');
	canvas.width = img.width;
	canvas.height = img.height;
	const ctx = canvas.getContext('2d');
	ctx.drawImage(img, 0, 0);
	const id = ctx.getImageData(0, 0, img.width, img.height);
	const ab = new Uint8Array(id.data.length / 4 * 3);
	for (let i = 0; i < ab.length; i++) ab[i] = id.data[((i / 3) | 0) * 4 + i % 3] ^ (i * 3473);
	const size = new DataView(ab.buffer, 0, 4).getUint32(0);
	return { result: ab.buffer.slice(4, size + 4) };
}