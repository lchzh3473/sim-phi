'use strict';
//全屏相关
const full = {
	toggle(elem) {
		if (!this.enabled) return false;
		if (this.element) {
			if (document.exitFullscreen) return document.exitFullscreen();
			if (document.cancelFullScreen) return document.cancelFullScreen();
			if (document.webkitCancelFullScreen) return document.webkitCancelFullScreen();
			if (document.mozCancelFullScreen) return document.mozCancelFullScreen();
			if (document.msExitFullscreen) return document.msExitFullscreen();
		} else {
			if (!(elem instanceof HTMLElement)) elem = document.body;
			if (elem.requestFullscreen) return elem.requestFullscreen();
			if (elem.webkitRequestFullscreen) return elem.webkitRequestFullscreen();
			if (elem.mozRequestFullScreen) return elem.mozRequestFullScreen();
			if (elem.msRequestFullscreen) return elem.msRequestFullscreen();
		}
	},
	check(elem) {
		if (!(elem instanceof HTMLElement)) elem = document.body;
		return this.element == elem;
	},
	get element() {
		return document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
	},
	get enabled() {
		return !!(document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled);
	}
};

function csv2array(data, isObject) {
	const strarr = data.replace(/\ufeff|\r/g, '').split('\n');
	const col = [];
	for (const i of strarr) {
		let rowstr = '';
		let isQuot = false;
		let beforeQuot = false;
		const row = [];
		for (const j of i) {
			if (j == '"') {
				if (!isQuot) isQuot = true;
				else if (beforeQuot) {
					rowstr += j;
					beforeQuot = false;
				} else beforeQuot = true;
			} else if (j == ',') {
				if (!isQuot) {
					row.push(rowstr);
					rowstr = '';
				} else if (beforeQuot) {
					row.push(rowstr);
					rowstr = '';
					isQuot = false;
					beforeQuot = false;
				} else rowstr += j;
			} else if (!beforeQuot) rowstr += j;
			else throw 'Error 1';
		}
		if (!isQuot) {
			row.push(rowstr);
			rowstr = '';
		} else if (beforeQuot) {
			row.push(rowstr);
			rowstr = '';
			isQuot = false;
			beforeQuot = false;
		} else throw 'Error 2';
		col.push(row);
	}
	if (!isObject) return col;
	const qwq = [];
	for (let i = 1; i < col.length; i++) {
		const obj = {};
		for (let j = 0; j < col[0].length; j++) obj[col[0][j]] = col[i][j];
		qwq.push(obj);
	}
	return qwq;
}

// function loadJS(url, callback) {
// 	const script = document.createElement('script');
// 	const fn = callback || function() {};
// 	script.type = 'text/javascript';
// 	script.onload = function() {
// 		fn();
// 	};
// 	script.src = url;
// 	document.getElementsByTagName('head')[0].appendChild(script);
// }
// function loadJS2(url) {
// 	return new Promise((resolve, reject) => {
// 		const script = document.createElement('script');
// 		script.type = 'text/javascript';
// 		script.onload = resolve;
// 		script.onerror = reject;
// 		script.src = url;
// 		document.getElementsByTagName('head')[0].appendChild(script);
// 	});
// }
// window.onerror=(...a)=>console.log('qwq',a);
// window.addEventListener('error',(...a)=>console.log('qwq',a));
function loadJS(qwq) {
	const a = (function*(arg) { yield* arg; })(qwq instanceof Array ? qwq.reverse() : arguments);
	const load = url => new Promise((resolve, reject) => {
		if (!url) return reject();
		const script = document.createElement('script');
		script.onload = () => resolve(script);
		script.onerror = () => load(a.next().value).then(script => resolve(script)).catch(e => reject(e));
		script.src = url;
		script.crossOrigin = 'anonymous';
		document.head.appendChild(script);
	});
	return load(a.next().value);
}