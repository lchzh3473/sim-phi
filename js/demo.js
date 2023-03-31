import { uploader } from './reader.js';
const $id = query => document.getElementById(query);
const $ = query => document.body.querySelector(query);
export default function() {
	! function() {
		const t = new Date;
		if (1 != t.getDate() || 3 != t.getMonth()) return;
		import('./reverseChart.js');
	}();
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