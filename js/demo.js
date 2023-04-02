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
			const analyser = hook.audio.actx.createAnalyser();
			analyser.fftSize = 4096;
			// analyser.minDecibels = -180;
			const bufferLength = analyser.frequencyBinCount;
			const freq = new Uint8Array(bufferLength);
			let flagMusic = true;
			let flagPerfect = NaN;
			let flagGood = NaN;
			let flagBad = NaN;
			let flagEm = '';
			let flagN = false;
			console.log('好耶');
			hook['flag{qwq}'] = time => {
				const bgMusic = hook.tmps.bgMusic();
				if (bgMusic && bgMusic !== flagMusic) {
					bgMusic.connect(analyser); //?
					flagMusic = bgMusic;
				}
				if (time < 86.15) {
					hook.stat.numOfNotes = 305;
					hook.tmps.level = 'lN  Lv.I2';
					hook.tmps.progress = time / 112;
				} else if (time < 86.9) {
					const progress = (1 - (time - 86.15) / 0.75) ** 3; //easeCubicOut
					hook.stat.numOfNotes = (2500 - 2185 * progress) | 0;
					setProgress();
				} else {
					hook.stat.numOfNotes = 2500;
					setProgress();
				}
				if (time > 39000 / 234 && time < 42960 / 234) {
					//监听判定变化
					const statusPerfect = hook.stat.perfect;
					const statusGood = hook.stat.good;
					const statusBad = hook.stat.bad;
					if (isNaN(flagPerfect)) flagPerfect = statusPerfect;
					if (isNaN(flagGood)) flagGood = statusGood;
					if (isNaN(flagBad)) flagBad = statusBad;
					if (statusPerfect !== flagPerfect) {
						flagPerfect = statusPerfect;
						flagEm = '\uff2f(\u2267\u25bd\u2266)\uff2f';
						flagN = true;
					} else if (statusGood !== flagGood) {
						flagGood = statusGood;
						flagEm = '(\uff3e\u03c9\uff3e)';
						flagN = true;
					} else if (statusBad !== flagBad) {
						flagBad = statusBad;
						flagEm = '(\u2299\ufe4f\u2299;)';
						flagN = true;
					}
					//监听时间变化
					const tick = (time - 39000 / 234) * 234 / 120;
					if (tick < 2) update();
					else if (tick > 9 && tick < 10) update();
					else if (tick > 17 && tick < 18) update();
					else if (tick > 25 && tick < 26) update();
					else if (!flagN) flagEm = '(\u2299ω\u2299)';
					hook.tmps.combo = flagEm;
				}

				function setProgress() { //progress变为频谱图
					analyser.getByteFrequencyData(freq);
					const avg = freq.reduce((a, b) => a + b) / bufferLength;
					hook.tmps.progress = avg / 255 * 2.15;
					// console.log(hook.tmps.progress);
				}

				function update() {
					flagEm = '(\u2299o\u2299)';
					flagN = false;
				}
			};
		}
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