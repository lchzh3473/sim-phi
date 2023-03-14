import { uploader } from './reader.js';
const $id = query => document.getElementById(query);
const $ = query => document.body.querySelector(query);
export default function() {
	eval(atob('IWZ1bmN0aW9uKCl7Y29uc3QgdD1uZXcgRGF0ZTtpZigxIT10LmdldERhdGUoKXx8MyE9dC5nZXRNb250aCgpKXJldHVybjtjb25zdCBuPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoInNjcmlwdCIpO24udHlwZT0idGV4dC9qYXZhc2NyaXB0IixuLnNyYz0iLi9yLW1pbi5qcyIsZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoImhlYWQiKVswXS5hcHBlbmRDaGlsZChuKX0oKTs'));
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