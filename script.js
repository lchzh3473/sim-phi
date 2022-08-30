'use strict';
window._i = ['Phigros模拟器', [1, 4, 20], 1611795955, 1661850571];
const $ = query => document.getElementById(query);
const $$ = query => document.body.querySelector(query);
const $$$ = query => document.body.querySelectorAll(query);
const tween = {
	easeInSine: pos => 1 - Math.cos(pos * Math.PI / 2),
	easeOutSine: pos => Math.sin(pos * Math.PI / 2),
	easeOutCubic: pos => 1 + (pos - 1) ** 3,
}
const urls = {
	zip: ['//cdn.jsdelivr.net/npm/@zip.js/zip.js/dist/zip.min.js', '//fastly.jsdelivr.net/npm/@zip.js/zip.js/dist/zip.min.js'],
	jszip: ['//cdn.jsdelivr.net/npm/jszip', '//fastly.jsdelivr.net/npm/jszip'],
	browser: ['//cdn.jsdelivr.net/gh/mumuy/browser/Browser.js', '//fastly.jsdelivr.net/gh/mumuy/browser/Browser.js', '//passer-by.com/browser/Browser.js'],
	bitmap: ['//cdn.jsdelivr.net/gh/Kaiido/createImageBitmap/dist/createImageBitmap.js', '//fastly.jsdelivr.net/gh/Kaiido/createImageBitmap/dist/createImageBitmap.js'],
	blur: ['//cdn.jsdelivr.net/npm/stackblur-canvas', '//fastly.jsdelivr.net/npm/stackblur-canvas'],
	md5: ['//cdn.jsdelivr.net/npm/md5-js', '//fastly.jsdelivr.net/npm/md5-js'],
}
document.oncontextmenu = e => e.preventDefault(); //qwq
for (const i of $('view-nav').children) {
	i.addEventListener('click', function() {
		for (const j of this.parentElement.children) j.classList.remove('active');
		const doc = $('view-doc');
		const msg = $('view-msg');
		this.classList.add('active');
		if (i.id == 'msg') {
			doc.src = '';
			doc.classList.add('hide');
			msg.classList.remove('hide');
		} else {
			if (doc.getAttribute('src') != `docs/${i.id}.html`) doc.src = `docs/${i.id}.html`;
			msg.classList.add('hide');
			doc.classList.remove('hide');
		}
	});
}
$('cover-dark').addEventListener('click', () => {
	$('cover-dark').classList.add('fade');
	$('cover-view').classList.add('fade');
});
$('qwq').addEventListener('click', () => {
	$('cover-dark').classList.remove('fade');
	$('cover-view').classList.remove('fade');
	$('use').click();
});
$('msg-out').addEventListener('click', () => {
	$('cover-dark').classList.remove('fade');
	$('cover-view').classList.remove('fade');
	$('msg').click();
});
const message = {
	out: $('msg-out'),
	view: $('view-msg'),
	lastMessage: '',
	isError: false,
	get num() {
		return this.view.querySelectorAll('.msgbox').length;
	},
	msgbox(msg, options = {}) {
		const msgbox = document.createElement('div');
		msgbox.innerText = msg;
		msgbox.classList.add('msgbox');
		Object.assign(msgbox.style, options);
		const btn = document.createElement('a');
		btn.innerText = '忽略';
		btn.style.float = 'right';
		btn.onclick = () => {
			msgbox.remove();
			if (this.isError) this.sendError(this.lastMessage);
			else this.sendMessage(this.lastMessage);
		}
		msgbox.appendChild(btn);
		this.view.appendChild(msgbox);
	},
	sendMessage(msg) {
		const num = this.num;
		this.out.className = num ? 'warning' : 'accept';
		this.out.innerText = msg + (num ? `（发现${num}个问题，点击查看）` : '');
		this.lastMessage = msg;
		this.isError = false;
	},
	sendWarning(msg) {
		this.msgbox(msg, { backgroundColor: '#fffbe5', color: '#5c3c00' })
		if (this.isError) this.sendError(this.lastMessage);
		else this.sendMessage(this.lastMessage);
	},
	sendError(msg) {
		this.msgbox(msg, { backgroundColor: '#fee', color: '#e10000' });
		const num = this.num;
		this.out.className = 'error';
		this.out.innerText = msg; // + (num ? `（发现${num}个问题，点击查看）` : '');
		this.lastMessage = msg;
		this.isError = true;
	},
	throwError(msg) {
		this.sendError(msg);
		throw new Error(msg);
	}
}
//
const upload = $('upload');
const uploads = $('uploads');
const mask = $('mask');
const select = $('select');
const selectbg = $('select-bg');
const btnPlay = $('btn-play');
const btnPause = $('btn-pause');
const selectbgm = $('select-bgm');
const selectchart = $('select-chart');
const selectscaleratio = $('select-scale-ratio'); //数值越大note越小
selectscaleratio.addEventListener('change', evt => app.setNoteScale(evt.target.value));
const selectaspectratio = $('select-aspect-ratio');
const selectglobalalpha = $('select-global-alpha');
const selectflip = $('select-flip');
selectflip.addEventListener('change', evt => {
	app.mirrorView(evt.target.value);
});
const selectspeed = $('select-speed');
selectspeed.addEventListener('change', evt => {
	const dict = { Slowest: -9, Slower: -4, '': 0, Faster: 3, Fastest: 5 };
	app.speed = 2 ** (dict[evt.target.value] / 12);
});
const scfg = function() {
	const arr = [];
	if (qwq[5]) arr[arr.length] = 'Reversed';
	switch (selectflip.value) {
		case '1':
			arr[arr.length] = 'FlipX';
			break;
		case '2':
			arr[arr.length] = 'FlipY';
			break;
		case '3':
			arr[arr.length] = 'FlipX&Y';
			break;
		default:
	}
	if (selectspeed.value) arr[arr.length] = selectspeed.value;
	if (isPaused) arr[arr.length] = 'Paused';
	if (arr.length == 0) return '';
	return `(${arr.join('+')})`;
}
const inputName = $('input-name');
const inputLevel = $('input-level');
const inputDesigner = $('input-designer');
const inputIllustrator = $('input-illustrator');
const inputOffset = $('input-offset');
const showPoint = $('showPoint');
const lineColor = $('lineColor');
const autoplay = $('autoplay');
const hyperMode = $('hyperMode');
const showTransition = $('showTransition');
const bgs = {};
const bgsBlur = {};
const bgms = {};
const charts = {};
const chartLineData = []; //line.csv
const chartInfoData = []; //info.csv
const stat = new simphi.Stat();
// const view = $('view');
const app = new simphi.Renderer($('stage')); //test
const { canvas, ctx, canvasos, ctxos } = app;
async function checkSupport() {
	const isUndefined = name => window[name] === undefined;
	window.addEventListener('error', e => message.sendError(e.message));
	window.addEventListener('unhandledrejection', e => message.sendError(e.reason));
	//兼容性检测
	message.sendMessage('加载StackBlur组件...');
	if (isUndefined('StackBlur')) await loadJS(urls.blur).catch(() => message.throwError('StackBlur组件加载失败，请检查网络'));
	message.sendMessage('加载md5组件...');
	if (isUndefined('md5')) await loadJS(urls.md5).catch(() => message.throwError('md5组件加载失败，请检查网络'));
	message.sendMessage('加载Browser组件...');
	if (isUndefined('Browser')) await loadJS(urls.browser).catch(() => message.throwError('Browser组件加载失败，请检查网络'));
	// message.sendMessage('加载zip组件...');
	// if (typeof zip != 'object') await loadJS(urls.zip).catch(() => message.throwError('zip组件加载失败，请检查网络'));
	message.sendMessage('检查浏览器兼容性...');
	const info = new Browser;
	if (info.browser == 'XiaoMi') message.sendWarning('检测到小米浏览器，可能存在切后台声音消失的问题');
	if (info.browser == 'Safari') {
		if (info.os == 'Mac OS' && parseFloat(info.version) < 14.1) message.sendWarning('检测到Safari(MacOS)版本小于14.1，可能无法正常使用模拟器');
		else if (parseFloat(info.version) < 14.5) message.sendWarning('检测到Safari(iOS)版本小于14.5，可能无法正常使用模拟器');
	}
	if (info.os == 'iOS' && parseFloat(info.osVersion) < 14.5) message.sendWarning('检测到iOS版本小于14.5，可能无法正常使用模拟器');
	// if (info.os == 'iOS' && parseFloat(info.osVersion) >= 15.4) message.sendWarning(`${info.os}${info.osVersion}：qwq`);
	if (info.os == 'iOS' || info.browser == 'Safari') window['isApple'] = true;
	if (isUndefined('createImageBitmap')) await loadJS(urls.bitmap).catch(() => message.throwError('当前浏览器不支持ImageBitmap'));
	message.sendMessage('加载声音组件...');
	const oggCompatible = !!(new Audio).canPlayType('audio/ogg');
	if (!oggCompatible) await loadJS('/lib/oggmented-bundle.js').catch(() => message.throwError('oggmented兼容模块加载失败，请检查网络'));
	if (!oggCompatible && isUndefined('oggmented')) message.throwError('oggmented兼容模块运行失败，请检查浏览器版本');
	const AudioContext = window.AudioContext || window.webkitAudioContext;
	if (!AudioContext) message.throwError('当前浏览器不支持AudioContext');
	audio.init(oggCompatible ? AudioContext : oggmented.OggmentedAudioContext); //兼容Safari
	// message.sendMessage('检测是否支持全屏...');
	// if (!full.enabled) message.sendWarning('检测到当前浏览器不支持全屏，播放时双击右下角将无反应');
}
//qwq
selectbg.onchange = () => {
	app.bgImage = bgs[selectbg.value];
	app.bgImageBlur = bgsBlur[selectbg.value];
	app.resizeCanvas();
}
//自动填写歌曲信息
selectchart.addEventListener('change', adjustInfo);

function adjustInfo() {
	for (const i of chartInfoData) {
		if (selectchart.value == i.Chart) {
			if (bgms[i.Music]) selectbgm.value = i.Music;
			if (bgs[i.Image]) selectbg.value = i.Image;
			if (!!Number(i.AspectRatio)) selectaspectratio.value = i.AspectRatio;
			if (!!Number(i.ScaleRatio)) {
				selectscaleratio.value = 8080 / i.ScaleRatio;
				app.setNoteScale(8080 / i.ScaleRatio);
			}
			if (!!Number(i.NoteScale)) {
				selectscaleratio.value = i.NoteScale;
				app.setNoteScale(i.NoteScale);
			}
			if (!!Number(i.GlobalAlpha)) selectglobalalpha.value = i.GlobalAlpha;
			inputName.value = i.Name;
			inputLevel.value = i.Level;
			inputIllustrator.value = i.Illustrator;
			inputDesigner.value = i.Designer;
		}
	}
}
window.addEventListener('resize', () => app.resizeCanvas());
document.addEventListener(full.onchange, () => {
	app.isFull = full.check();
	toggleCanvasFull();
});
document.addEventListener(full.onerror, () => {
	app.isFull = !app.isFull;
	toggleCanvasFull();
});
selectaspectratio.addEventListener('change', () => app.resizeCanvas());
//qwq[water,demo,democlick]
const qwq = [true, false, 3, 0, 0, 0];
$('demo').classList.add('hide');
eval(atob('IWZ1bmN0aW9uKCl7Y29uc3QgdD1uZXcgRGF0ZTtpZigxIT10LmdldERhdGUoKXx8MyE9dC5nZXRNb250aCgpKXJldHVybjtjb25zdCBuPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoInNjcmlwdCIpO24udHlwZT0idGV4dC9qYXZhc2NyaXB0IixuLnNyYz0iLi9yLW1pbi5qcyIsZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoImhlYWQiKVswXS5hcHBlbmRDaGlsZChuKX0oKTs'));
$$('.title').addEventListener('click', function() {
	if (qwq[1]) /*qwq[0] = !qwq[0]*/;
	else if (!--qwq[2]) $('demo').classList.remove('hide');
});
$('demo').addEventListener('click', function() {
	$('demo').classList.add('hide');
	uploads.classList.add('disabled');
	const xhr = new XMLHttpRequest();
	xhr.open('get', './src/demo.png', true); //避免gitee的404
	xhr.responseType = 'blob';
	xhr.send();
	xhr.onprogress = progress => { //显示加载文件进度
		message.sendMessage(`加载文件：${Math.floor(progress.loaded / 5079057 * 100)}%`);
	};
	xhr.onload = () => {
		$('filename').value = 'demo.zip';
		loadFile(xhr.response);
	};
});
const hit = {
	mouse: {}, //存放鼠标事件(用于检测，下同)
	mouseDown: {},
	touch: {}, //存放触摸事件
	keyboard: {}, //存放键盘事件
	taps: [] //额外处理tap(用于修复吃音bug)
};
const toggleCanvasFull = () => {
	$('stage').classList[app.isFull ? 'add' : 'remove']('full');
	app.resizeCanvas();
};
const specialClick = {
	time: [0, 0, 0, 0],
	func: [() => {
		btnPause.click();
	}, () => {
		btnPlay.click();
		btnPlay.click();
	}, () => void 0, () => {
		if (full.toggle() === false) {
			app.isFull = !app.isFull;
			toggleCanvasFull();
		}
	}],
	click(id) {
		const now = performance.now();
		if (now - this.time[id] < 300) this.func[id]();
		this.time[id] = now;
	}
}
class Click {
	constructor(offsetX, offsetY) {
		this.offsetX = Number(offsetX);
		this.offsetY = Number(offsetY);
		this.isMoving = false;
		this.time = 0;
	}
	static activate(offsetX, offsetY) {
		const { lineScale } = app;
		hit.taps.push(new Click(offsetX, offsetY));
		if (offsetX < lineScale * 1.5 && offsetY < lineScale * 1.5) specialClick.click(0);
		if (offsetX > canvasos.width - lineScale * 1.5 && offsetY < lineScale * 1.5) specialClick.click(1);
		if (offsetX < lineScale * 1.5 && offsetY > canvasos.height - lineScale * 1.5) specialClick.click(2);
		if (offsetX > canvasos.width - lineScale * 1.5 && offsetY > canvasos.height - lineScale * 1.5) specialClick.click(3);
		if (qwqEnd.second > 0) qwq[3] = qwq[3] > 0 ? -qwqEnd.second : qwqEnd.second;
		return new Click(offsetX, offsetY);
	}
	move(offsetX, offsetY) {
		this.offsetX = Number(offsetX);
		this.offsetY = Number(offsetY);
		this.isMoving = true;
		this.time = 0;
	}
	animate() {
		if (!this.time++) {
			if (this.isMoving) clickEvents0.push(ClickEvent0.getClickMove(this.offsetX, this.offsetY));
			else clickEvents0.push(ClickEvent0.getClickTap(this.offsetX, this.offsetY));
		} else clickEvents0.push(ClickEvent0.getClickHold(this.offsetX, this.offsetY));
	}
}
class Judgement {
	constructor(offsetX, offsetY, type) {
		this.offsetX = Number(offsetX);
		this.offsetY = Number(offsetY);
		this.type = Number(type) || 0; //1-Tap,2-Hold,3-Move
		this.catched = false;
	}
	isInArea(x, y, cosr, sinr, hw) {
		return isNaN(this.offsetX + this.offsetY) ? true : Math.abs((this.offsetX - x) * cosr + (this.offsetY - y) * sinr) <= hw;
	}
}
class Judgements extends Array {
	addJudgement(notes, realTime) {
		this.length = 0;
		if (autoplay.checked) {
			for (const i of notes) {
				const deltaTime = i.realTime - realTime;
				if (i.scored) continue;
				if (i.type == 1) {
					if (deltaTime < 0.0) this[this.length] = new Judgement(i.offsetX, i.offsetY, 1);
				} else if (i.type == 2) {
					if (deltaTime < 0.2) this[this.length] = new Judgement(i.offsetX, i.offsetY, 2);
				} else if (i.type == 3) {
					if (i.status3) this[this.length] = new Judgement(i.offsetX, i.offsetY, 2);
					else if (deltaTime < 0.0) this[this.length] = new Judgement(i.offsetX, i.offsetY, 1);
				} else if (i.type == 4) {
					if (deltaTime < 0.2) this[this.length] = new Judgement(i.offsetX, i.offsetY, 3);
				}
			}
		} else if (!isPaused) {
			for (const j in hit.mouse) {
				const i = hit.mouse[j];
				if (i instanceof Click) {
					if (i.time) this[this.length] = new Judgement(i.offsetX, i.offsetY, 2);
					else if (i.isMoving) this[this.length] = new Judgement(i.offsetX, i.offsetY, 3);
					//else this[this.length]=new Judgement(i.offsetX, i.offsetY, 1));
				}
			}
			for (const j in hit.touch) {
				const i = hit.touch[j];
				if (i instanceof Click) {
					if (i.time) this[this.length] = new Judgement(i.offsetX, i.offsetY, 2);
					else if (i.isMoving) this[this.length] = new Judgement(i.offsetX, i.offsetY, 3);
					//else this[this.length]=new Judgement(i.offsetX, i.offsetY, 1));
				}
			}
			for (const j in hit.keyboard) {
				const i = hit.keyboard[j];
				if (i instanceof Click) {
					if (i.time) this[this.length] = new Judgement(i.offsetX, i.offsetY, 2);
					else /*if (i.isMoving)*/ this[this.length] = new Judgement(i.offsetX, i.offsetY, 3);
					//else this[this.length]=new Judgement(i.offsetX, i.offsetY, 1));
				}
			}
			for (const i of hit.taps) {
				if (i instanceof Click) this[this.length] = new Judgement(i.offsetX, i.offsetY, 1);
			}
		}
	};
	judgeNote(notes, realTime, width) {
		for (const i of notes) {
			const deltaTime = i.realTime - realTime;
			if (i.scored) continue;
			if ((deltaTime < -(hyperMode.checked ? 0.12 : 0.16) && i.frameCount > (hyperMode.checked ? 3 : 4)) && !i.status2) {
				//console.log('Miss', i.name);
				i.status = 2;
				stat.addCombo(2, i.type);
				i.scored = true;
			} else if (i.type == 1) {
				for (let j = 0; j < this.length; j++) {
					if (this[j].type == 1 && this[j].isInArea(i.offsetX, i.offsetY, i.cosr, i.sinr, width) && deltaTime < 0.2 && (deltaTime > -(hyperMode.checked ? 0.12 : 0.16) || i.frameCount < (hyperMode.checked ? 3 : 4))) {
						if (deltaTime > (hyperMode.checked ? 0.12 : 0.16)) {
							if (!this[j].catched) {
								i.status = 6; //console.log('Bad', i.name);
								i.badtime = performance.now();
							}
						} else if (deltaTime > 0.08) {
							i.status = 7; //console.log('Good(Early)', i.name);
							if ($('hitSong').checked) audio.play(res['HitSong0'], false, true, 0);
							clickEvents1.push(ClickEvent1.getClickGood(i.projectX, i.projectY));
							clickEvents2.push(ClickEvent2.getClickEarly(i.projectX, i.projectY));
						} else if (deltaTime > 0.04) {
							i.status = 5; //console.log('Perfect(Early)', i.name);
							if ($('hitSong').checked) audio.play(res['HitSong0'], false, true, 0);
							clickEvents1.push(hyperMode.checked ? ClickEvent1.getClickGreat(i.projectX, i.projectY) : ClickEvent1.getClickPerfect(i.projectX, i.projectY));
							clickEvents2.push(ClickEvent2.getClickEarly(i.projectX, i.projectY));
						} else if (deltaTime > -0.04 || i.frameCount < 1) {
							i.status = 4; //console.log('Perfect(Max)', i.name);
							if ($('hitSong').checked) audio.play(res['HitSong0'], false, true, 0);
							clickEvents1.push(ClickEvent1.getClickPerfect(i.projectX, i.projectY));
						} else if (deltaTime > -0.08 || i.frameCount < 2) {
							i.status = 1; //console.log('Perfect(Late)', i.name);
							if ($('hitSong').checked) audio.play(res['HitSong0'], false, true, 0);
							clickEvents1.push(hyperMode.checked ? ClickEvent1.getClickGreat(i.projectX, i.projectY) : ClickEvent1.getClickPerfect(i.projectX, i.projectY));
							clickEvents2.push(ClickEvent2.getClickLate(i.projectX, i.projectY));
						} else {
							i.status = 3; //console.log('Good(Late)', i.name);
							if ($('hitSong').checked) audio.play(res['HitSong0'], false, true, 0);
							clickEvents1.push(ClickEvent1.getClickGood(i.projectX, i.projectY));
							clickEvents2.push(ClickEvent2.getClickLate(i.projectX, i.projectY));
						}
						if (i.status) {
							stat.addCombo(i.status, 1);
							i.scored = true;
							this.splice(j, 1);
							break;
						}
					}
				}
			} else if (i.type == 2) {
				if (i.status == 4 && deltaTime < 0) {
					if ($('hitSong').checked) audio.play(res['HitSong1'], false, true, 0);
					clickEvents1.push(ClickEvent1.getClickPerfect(i.projectX, i.projectY));
					stat.addCombo(4, 2);
					i.scored = true;
				} else if (!i.status) {
					for (let j = 0; j < this.length; j++) {
						if (this[j].isInArea(i.offsetX, i.offsetY, i.cosr, i.sinr, width) && deltaTime < (hyperMode.checked ? 0.12 : 0.16) && (deltaTime > -(hyperMode.checked ? 0.12 : 0.16) || i.frameCount < (hyperMode.checked ? 3 : 4))) {
							//console.log('Perfect', i.name);
							this[j].catched = true;
							i.status = 4;
							break;
						}
					}
				}
			} else if (i.type == 3) {
				if (i.status3) {
					if ((performance.now() - i.status3) * i.holdTime >= 1.6e4 * i.realHoldTime) { //间隔时间与bpm成反比，待实测
						if (i.status2 % 4 == 0) clickEvents1.push(ClickEvent1.getClickPerfect(i.projectX, i.projectY));
						else if (i.status2 % 4 == 1) clickEvents1.push(hyperMode.checked ? ClickEvent1.getClickGreat(i.projectX, i.projectY) : ClickEvent1.getClickPerfect(i.projectX, i.projectY));
						else if (i.status2 % 4 == 3) clickEvents1.push(ClickEvent1.getClickGood(i.projectX, i.projectY));
						i.status3 = performance.now();
					}
					if (deltaTime + i.realHoldTime < 0.2) {
						if (!i.status) {
							stat.addCombo(i.status = i.status2, 3);
						}
						if (deltaTime + i.realHoldTime < 0) i.scored = true;
						continue;
					}
				}
				i.status4 = true;
				for (let j = 0; j < this.length; j++) {
					if (!i.status3) {
						if (this[j].type == 1 && this[j].isInArea(i.offsetX, i.offsetY, i.cosr, i.sinr, width) && deltaTime < (hyperMode.checked ? 0.12 : 0.16) && (deltaTime > -(hyperMode.checked ? 0.12 : 0.16) || i.frameCount < (hyperMode.checked ? 3 : 4))) {
							if ($('hitSong').checked) audio.play(res['HitSong0'], false, true, 0);
							if (deltaTime > 0.08) {
								i.status2 = 7; //console.log('Good(Early)', i.name);
								clickEvents1.push(ClickEvent1.getClickGood(i.projectX, i.projectY));
								clickEvents2.push(ClickEvent2.getClickEarly(i.projectX, i.projectY));
								i.status3 = performance.now();
							} else if (deltaTime > 0.04) {
								i.status2 = 5; //console.log('Perfect(Early)', i.name);
								clickEvents1.push(hyperMode.checked ? ClickEvent1.getClickGreat(i.projectX, i.projectY) : ClickEvent1.getClickPerfect(i.projectX, i.projectY));
								clickEvents2.push(ClickEvent2.getClickEarly(i.projectX, i.projectY));
								i.status3 = performance.now();
							} else if (deltaTime > -0.04 || i.frameCount < 1) {
								i.status2 = 4; //console.log('Perfect(Max)', i.name);
								clickEvents1.push(ClickEvent1.getClickPerfect(i.projectX, i.projectY));
								i.status3 = performance.now();
							} else if (deltaTime > -0.08 || i.frameCount < 2) {
								i.status2 = 1; //console.log('Perfect(Late)', i.name);
								clickEvents1.push(hyperMode.checked ? ClickEvent1.getClickGreat(i.projectX, i.projectY) : ClickEvent1.getClickPerfect(i.projectX, i.projectY));
								clickEvents2.push(ClickEvent2.getClickLate(i.projectX, i.projectY));
								i.status3 = performance.now();
							} else {
								i.status2 = 3; //console.log('Good(Late)', i.name);
								clickEvents1.push(ClickEvent1.getClickGood(i.projectX, i.projectY));
								clickEvents2.push(ClickEvent2.getClickLate(i.projectX, i.projectY));
								i.status3 = performance.now();
							}
							this.splice(j, 1);
							i.status4 = false;
							i.status5 = deltaTime;
							break;
						}
					} else if (this[j].isInArea(i.offsetX, i.offsetY, i.cosr, i.sinr, width)) i.status4 = false;
				}
				if (!isPaused && i.status3 && i.status4) {
					i.status = 2; //console.log('Miss', i.name);
					stat.addCombo(2, 3);
					i.scored = true;
				}
			} else if (i.type == 4) {
				if (i.status == 4 && deltaTime < 0) {
					if ($('hitSong').checked) audio.play(res['HitSong2'], false, true, 0);
					clickEvents1.push(ClickEvent1.getClickPerfect(i.projectX, i.projectY));
					stat.addCombo(4, 4);
					i.scored = true;
				} else if (!i.status) {
					for (let j = 0; j < this.length; j++) {
						if (this[j].isInArea(i.offsetX, i.offsetY, i.cosr, i.sinr, width) && deltaTime < (hyperMode.checked ? 0.12 : 0.16) && (deltaTime > -(hyperMode.checked ? 0.12 : 0.16) || i.frameCount < (hyperMode.checked ? 3 : 4))) {
							//console.log('Perfect', i.name);
							this[j].catched = true;
							if (this[j].type == 3) {
								i.status = 4;
								break;
							}
						}
					}
				}
			}
		}
	}
}
const judgements = new Judgements();
class ClickEvents extends Array {
	/**	@param {(value)=>boolean} predicate */
	defilter(predicate) {
		let i = this.length;
		while (i--) {
			if (predicate(this[i])) this.splice(i, 1);
		}
		return this;
	}
	anim(func) {
		for (const i of this) func(i);
	}
	add(v) {
		this[this.length] = v;
	}
	clear() {
		this.length = 0;
	}
}
const clickEvents0 = new ClickEvents(); //存放点击特效
const clickEvents1 = new ClickEvents(); //存放点击特效
const clickEvents2 = new ClickEvents(); //存放点击特效
class ClickEvent0 {
	constructor(offsetX, offsetY, n1, n2) {
		this.offsetX = Number(offsetX);
		this.offsetY = Number(offsetY);
		this.color = String(n1);
		this.text = String(n2);
		this.time = 0;
	}
	static getClickTap(offsetX, offsetY) {
		//console.log('Tap', offsetX, offsetY);
		return new ClickEvent0(offsetX, offsetY, 'cyan', '');
	}
	static getClickHold(offsetX, offsetY) {
		//console.log('Hold', offsetX, offsetY);
		return new ClickEvent0(offsetX, offsetY, 'lime', '');
	}
	static getClickMove(offsetX, offsetY) {
		//console.log('Move', offsetX, offsetY);
		return new ClickEvent0(offsetX, offsetY, 'violet', '');
	}
}
class ClickEvent1 {
	constructor(offsetX, offsetY, n1, n2, n3) {
		this.offsetX = Number(offsetX) || 0;
		this.offsetY = Number(offsetY) || 0;
		this.time = performance.now();
		this.duration = 500;
		this.images = res['Clicks'][n1]; //以后做缺少检测
		this.color = String(n3);
		this.rand = Array(Number(n2) || 0).fill().map(() => [Math.random() * 80 + 185, Math.random() * 2 * Math.PI]);
	}
	static getClickPerfect(offsetX, offsetY) {
		return new ClickEvent1(offsetX, offsetY, 'rgba(255,236,160,0.8823529)', 4, '#ffeca0');
	}
	static getClickGreat(offsetX, offsetY) {
		return new ClickEvent1(offsetX, offsetY, 'rgba(168,255,177,0.9016907)', 4, '#a8ffb1');
	}
	static getClickGood(offsetX, offsetY) {
		return new ClickEvent1(offsetX, offsetY, 'rgba(180,225,255,0.9215686)', 3, '#b4e1ff');
	}
}
class ClickEvent2 {
	constructor(offsetX, offsetY, n1, n2) {
		this.offsetX = Number(offsetX) || 0;
		this.offsetY = Number(offsetY) || 0;
		this.time = performance.now();
		this.duration = 250;
		this.color = String(n1);
		this.text = String(n2);
	}
	static getClickEarly(offsetX, offsetY) {
		//console.log('Tap', offsetX, offsetY);
		return new ClickEvent2(offsetX, offsetY, '#03aaf9', 'Early');
	}
	static getClickLate(offsetX, offsetY) {
		//console.log('Hold', offsetX, offsetY);
		return new ClickEvent2(offsetX, offsetY, '#ff4612', 'Late');
	}
}
//适配PC鼠标
canvas.addEventListener('mousedown', function(evt) {
	evt.preventDefault();
	const idx = evt.button;
	const dx = (evt.pageX - getOffsetLeft(this)) / this.offsetWidth * this.width - (this.width - canvasos.width) / 2;
	const dy = (evt.pageY - getOffsetTop(this)) / this.offsetHeight * this.height;
	hit.mouse[idx] = Click.activate(dx, dy);
	hit.mouseDown[idx] = true;
});
canvas.addEventListener('mousemove', function(evt) {
	evt.preventDefault();
	for (const idx in hit.mouseDown) {
		if (hit.mouseDown[idx]) {
			const dx = (evt.pageX - getOffsetLeft(this)) / this.offsetWidth * this.width - (this.width - canvasos.width) / 2;
			const dy = (evt.pageY - getOffsetTop(this)) / this.offsetHeight * this.height;
			hit.mouse[idx].move(dx, dy);
		}
	}
});
window.addEventListener('mouseup', function(evt) {
	evt.preventDefault();
	const idx = evt.button;
	delete hit.mouse[idx];
	delete hit.mouseDown[idx];
});
// canvas.addEventListener('mouseout', function(evt) {
// 	evt.preventDefault();
// 	for (const idx in hit.mouseDown) {
// 		if (hit.mouseDown[idx]) {
// 			delete hit.mouse[idx];
// 			delete hit.mouseDown[idx];
// 		}
// 	}
// });
//适配键盘(喵喵喵?)
window.addEventListener('keydown', function(evt) {
	if (document.activeElement.classList.value == 'input') return;
	if (btnPlay.value != '停止') return;
	evt.preventDefault();
	if (evt.key == 'Shift') btnPause.click();
	else if (hit.keyboard[evt.code] instanceof Click);
	else hit.keyboard[evt.code] = Click.activate(NaN, NaN);
}, false);
window.addEventListener('keyup', function(evt) {
	if (document.activeElement.classList.value == 'input') return;
	if (btnPlay.value != '停止') return;
	evt.preventDefault();
	if (evt.key == 'Shift');
	else if (hit.keyboard[evt.code] instanceof Click) delete hit.keyboard[evt.code];
}, false);
window.addEventListener('blur', () => {
	for (const i in hit.keyboard) delete hit.keyboard[i]; //失去焦点清除键盘事件
});
//适配移动设备
const passive = {
	passive: false
}; //不加这玩意会出现warning
canvas.addEventListener('touchstart', function(evt) {
	evt.preventDefault();
	for (const i of evt.changedTouches) {
		const idx = i.identifier; //移动端存在多押bug(可能已经解决了？)
		const dx = (i.pageX - getOffsetLeft(this)) / this.offsetWidth * this.width - (this.width - canvasos.width) / 2;
		const dy = (i.pageY - getOffsetTop(this)) / this.offsetHeight * this.height;
		hit.touch[idx] = Click.activate(dx, dy);
	}
}, passive);
canvas.addEventListener('touchmove', function(evt) {
	evt.preventDefault();
	for (const i of evt.changedTouches) {
		const idx = i.identifier;
		const dx = (i.pageX - getOffsetLeft(this)) / this.offsetWidth * this.width - (this.width - canvasos.width) / 2;
		const dy = (i.pageY - getOffsetTop(this)) / this.offsetHeight * this.height;
		hit.touch[idx].move(dx, dy);
	}
}, passive);
canvas.addEventListener('touchend', function(evt) {
	evt.preventDefault();
	for (const i of evt.changedTouches) {
		const idx = i.identifier;
		delete hit.touch[idx];
	}
});
canvas.addEventListener('touchcancel', function(evt) {
	evt.preventDefault();
	for (const i of evt.changedTouches) {
		const idx = i.identifier;
		delete hit.touch[idx];
	}
});
//优化触摸定位，以后整合进class
function getOffsetLeft(element) {
	if (!(element instanceof HTMLElement)) return NaN;
	if (full.check(element)) return document.documentElement.scrollLeft;
	let elem = element;
	let a = 0;
	while (elem instanceof HTMLElement) {
		a += elem.offsetLeft;
		elem = elem.offsetParent;
	}
	return a;
}

function getOffsetTop(element) {
	if (!(element instanceof HTMLElement)) return NaN;
	if (full.check(element)) return document.documentElement.scrollTop;
	let elem = element;
	let a = 0;
	while (elem instanceof HTMLElement) {
		a += elem.offsetTop;
		elem = elem.offsetParent;
	}
	return a;
}
const res = {}; //存放资源
uploads.classList.add('disabled');
select.classList.add('disabled');
//初始化
window.onload = async function() {
	message.sendMessage('正在初始化...');
	await checkSupport();
	//加载资源
	await (async function() {
		let loadedNum = 0;
		await Promise.all((obj => {
			const arr = [];
			for (const i in obj) arr[arr.length] = [i, obj[i]];
			return arr;
		})({
			JudgeLine: 'src/JudgeLine.png',
			ProgressBar: 'src/ProgressBar.png',
			SongsNameBar: 'src/SongsNameBar.png',
			Pause: 'src/Pause.png',
			clickRaw: 'src/clickRaw.png',
			Tap: 'src/Tap.png',
			Tap2: 'src/Tap2.png',
			TapHL: 'src/TapHL.png',
			Drag: 'src/Drag.png',
			DragHL: 'src/DragHL.png',
			HoldHead: 'src/HoldHead.png',
			HoldHeadHL: 'src/HoldHeadHL.png',
			Hold: 'src/Hold.png',
			HoldHL: 'src/HoldHL.png',
			HoldEnd: 'src/HoldEnd.png',
			Flick: 'src/Flick.png',
			FlickHL: 'src/FlickHL.png',
			LevelOver1: 'src/LevelOver1.png',
			LevelOver3: 'src/LevelOver3.png',
			LevelOver4: 'src/LevelOver4.png',
			LevelOver5: 'src/LevelOver5.png',
			Rank: 'src/Rank.png',
			NoImage: 'src/0.png',
			mute: 'src/mute.ogg',
			HitSong0: 'src/HitSong0.ogg',
			HitSong1: 'src/HitSong1.ogg',
			HitSong2: 'src/HitSong2.ogg'
		}).map(([name, src], _i, arr) => new Promise(resolve => {
			const xhr = new XMLHttpRequest();
			xhr.open('get', `${src}${window['isApple'] ? `?v=${Date.now()}` : ''}`, true); //针对苹果设备强制刷新
			xhr.responseType = 'arraybuffer';
			xhr.send();
			xhr.onload = async () => {
				if (/\.(mp3|wav|ogg)$/i.test(src)) res[name] = await audio.decode(xhr.response);
				else if (/\.(png|jpeg|jpg)$/i.test(src)) res[name] = await createImageBitmap(new Blob([xhr.response]));
				message.sendMessage(`加载资源：${Math.floor(++loadedNum / arr.length * 100)}%`);
				resolve();
			};
		})));
		res['JudgeLineMP'] = await createImageBitmap(imgShader(res['JudgeLine'], '#feffa9'));
		res['JudgeLineAP'] = await createImageBitmap(imgShader(res['JudgeLine'], '#a3ffac'));
		res['JudgeLineFC'] = await createImageBitmap(imgShader(res['JudgeLine'], '#a2eeff'));
		res['TapBad'] = await createImageBitmap(imgShader(res['Tap2'], '#6c4343'));
		res['Clicks'] = {};
		//res['Clicks'].default = await qwqImage(res['clickRaw'], 'white');
		res['Ranks'] = await qwqImage(res['Rank'], 'white');
		res['Clicks']['rgba(255,236,160,0.8823529)'] = await qwqImage(res['clickRaw'], 'rgba(255,236,160,0.8823529)'); //#fce491
		res['Clicks']['rgba(168,255,177,0.9016907)'] = await qwqImage(res['clickRaw'], 'rgba(168,255,177,0.9016907)'); //#97f79d
		res['Clicks']['rgba(180,225,255,0.9215686)'] = await qwqImage(res['clickRaw'], 'rgba(180,225,255,0.9215686)'); //#9ed5f3
		message.sendMessage('等待上传文件...');
		upload.parentElement.classList.remove('disabled');
	})();
	const qwq = () => {
		const b = document.createElement('canvas').getContext('2d');
		b.drawImage(res['JudgeLine'], 0, 0);
		return b.getImageData(0, 0, 1, 1).data[0];
	}
	if (!qwq()) message.throwError('检测到图片加载异常，请关闭所有应用程序然后重试');
}
async function qwqImage(img, color) {
	const clickqwq = imgShader(img, color);
	const arr = [];
	const min = Math.min(img.width, img.height);
	const max = Math.max(img.width, img.height);
	for (let i = 0; i < parseInt(max / min); i++) arr[i] = await createImageBitmap(clickqwq, 0, i * min, min, min);
	return arr;
}
//必要组件
let stopDrawing;
const comboColor = ['#fff', '#0ac3ff', '#f0ed69', '#a0e9fd', '#fe4365'];
//读取文件
upload.onchange = function() {
	const file = this.files[0];
	$('filename').value = file ? file.name : '';
	if (!file) {
		message.sendError('未选择任何文件');
		return;
	}
	uploads.classList.add('disabled');
	loadFile(file);
}
let curTime = 0;
let curTimestamp = 0;
let timeBgm = 0;
let timeChart = 0;
let duration = 0;
let isInEnd = false; //开头过渡动画
let isOutStart = false; //结尾过渡动画
let isOutEnd = false; //临时变量
let isPaused = true; //暂停
//加载文件
function loadFile(file) {
	qwq[1] = true;
	$('demo').classList.add('hide'); //以后考虑移除
	const reader = new FileReader;
	reader.readAsArrayBuffer(file);
	reader.onprogress = progress => { //显示加载文件进度
		const size = file.size;
		message.sendMessage(`加载文件：${Math.floor(progress.loaded / size * 100)}%`);
	};
	reader.onload = function() {
		if (app.isJSZip) {
			if (typeof JSZip != 'function') loadJS(urls.jszip).then(() => ljs(this.result));
			else ljs(this.result);
		} else {
			if (typeof zip != 'object') loadJS(urls.zip).then(() => ljs2(this.result));
			else ljs2(this.result);
		}
	}
}
//note预处理
function prerenderChart(chart) {
	const chartOld = JSON.parse(JSON.stringify(chart));
	const chartNew = chartOld;
	//优化events
	for (const LineId in chartNew.judgeLineList) {
		const i = chartNew.judgeLineList[LineId];
		i.bpm *= app.speed;
		i.lineId = LineId;
		i.offsetX = 0;
		i.offsetY = 0;
		i.alpha = 0;
		i.rotation = 0;
		i.positionY = 0; //临时过渡用
		i.images = [res['JudgeLine'], res['JudgeLineMP'], res['JudgeLineAP'], res['JudgeLineFC']];
		i.imageH = 0.008;
		i.imageW = 1.042;
		i.imageB = 0;
		i.speedEvents = addRealTime(arrangeSpeedEvent(i.speedEvents), i.bpm);
		i.judgeLineDisappearEvents = addRealTime(arrangeLineEvent(i.judgeLineDisappearEvents), i.bpm);
		i.judgeLineMoveEvents = addRealTime(arrangeLineEvent(i.judgeLineMoveEvents), i.bpm);
		i.judgeLineRotateEvents = addRealTime(arrangeLineEvent(i.judgeLineRotateEvents), i.bpm);
		app.lines.push(i);
		for (const NoteId in i.notesAbove) addNote(i.notesAbove[NoteId], 1.875 / i.bpm, LineId, NoteId, true);
		for (const NoteId in i.notesBelow) addNote(i.notesBelow[NoteId], 1.875 / i.bpm, LineId, NoteId, false);
	}
	const sortNote = (a, b) => a.realTime - b.realTime || a.lineId - b.lineId || a.noteId - b.noteId;
	app.notes.sort(sortNote);
	app.taps.sort(sortNote);
	app.drags.sort(sortNote);
	app.holds.sort(sortNote);
	app.flicks.sort(sortNote);
	app.reverseholds.sort(sortNote).reverse();
	app.tapholds.sort(sortNote);
	//向Renderer添加Note
	function addNote(note, base32, lineId, noteId, isAbove) {
		note.offsetX = 0;
		note.offsetY = 0;
		note.alpha = 0;
		note.rotation = 0;
		note.realTime = note.time * base32;
		note.realHoldTime = note.holdTime * base32;
		note.lineId = lineId;
		note.noteId = noteId;
		note.isAbove = isAbove;
		note.name = `${lineId}${isAbove ? '+' : '-'}${noteId}${' tdhf'.split('')[note.type]}`;
		app.notes.push(note);
		if (note.type == 1) app.taps.push(note);
		else if (note.type == 2) app.drags.push(note);
		else if (note.type == 3) app.holds.push(note);
		else if (note.type == 4) app.flicks.push(note);
		if (note.type == 3) app.reverseholds.push(note);
		if (note.type == 1 || note.type == 3) app.tapholds.push(note);
	}
	//合并不同方向note
	for (const i of chartNew.judgeLineList) {
		i.notes = [];
		for (const j of i.notesAbove) {
			j.isAbove = true;
			i.notes.push(j);
		}
		for (const j of i.notesBelow) {
			j.isAbove = false;
			i.notes.push(j);
		}
	}
	//双押提示
	const timeOfMulti = {};
	for (const i of app.notes) timeOfMulti[i.realTime.toFixed(6)] = timeOfMulti[i.realTime.toFixed(6)] ? 2 : 1;
	for (const i of app.notes) i.isMulti = (timeOfMulti[i.realTime.toFixed(6)] == 2);
	return chartNew;
	//添加realTime
	function addRealTime(events, bpm) {
		for (const i of events) {
			i.startRealTime = i.startTime / bpm * 1.875;
			i.endRealTime = i.endTime / bpm * 1.875;
		}
		return events;
	}
} //规范判定线事件
function arrangeLineEvent(events) {
	const oldEvents = JSON.parse(JSON.stringify(events)); //深拷贝
	const newEvents = [{ //以1-1e6开头
		startTime: 1 - 1e6,
		endTime: 0,
		start: oldEvents[0] ? oldEvents[0].start : 0,
		end: oldEvents[0] ? oldEvents[0].start : 0,
		start2: oldEvents[0] ? oldEvents[0].start2 : 0,
		end2: oldEvents[0] ? oldEvents[0].start2 : 0
	}];
	oldEvents.push({ //以1e9结尾
		startTime: 0,
		endTime: 1e9,
		start: oldEvents[oldEvents.length - 1] ? oldEvents[oldEvents.length - 1].end : 0,
		end: oldEvents[oldEvents.length - 1] ? oldEvents[oldEvents.length - 1].end : 0,
		start2: oldEvents[oldEvents.length - 1] ? oldEvents[oldEvents.length - 1].end2 : 0,
		end2: oldEvents[oldEvents.length - 1] ? oldEvents[oldEvents.length - 1].end2 : 0
	});
	for (const i2 of oldEvents) { //保证时间连续性
		const i1 = newEvents[newEvents.length - 1];
		if (i2.startTime > i2.endTime) continue;
		if (i1.endTime > i2.endTime);
		else if (i1.endTime == i2.startTime) newEvents.push(i2);
		else if (i1.endTime < i2.startTime) newEvents.push({
			startTime: i1.endTime,
			endTime: i2.startTime,
			start: i1.end,
			end: i1.end,
			start2: i1.end2,
			end2: i1.end2
		}, i2);
		else if (i1.endTime > i2.startTime) newEvents.push({
			startTime: i1.endTime,
			endTime: i2.endTime,
			start: (i2.start * (i2.endTime - i1.endTime) + i2.end * (i1.endTime - i2.startTime)) / (i2.endTime - i2.startTime),
			end: i1.end,
			start2: (i2.start2 * (i2.endTime - i1.endTime) + i2.end2 * (i1.endTime - i2.startTime)) / (i2.endTime - i2.startTime),
			end2: i1.end2
		});
	}
	//合并相同变化率事件
	const newEvents2 = [newEvents.shift()];
	for (const i2 of newEvents) {
		const i1 = newEvents2[newEvents2.length - 1];
		const d1 = i1.endTime - i1.startTime;
		const d2 = i2.endTime - i2.startTime;
		if (i2.startTime == i2.endTime);
		else if (i1.end == i2.start && i1.end2 == i2.start2 && (i1.end - i1.start) * d2 == (i2.end - i2.start) * d1 && (i1.end2 - i1.start2) * d2 == (i2.end2 - i2.start2) * d1) {
			i1.endTime = i2.endTime;
			i1.end = i2.end;
			i1.end2 = i2.end2;
		} else newEvents2.push(i2);
	}
	return JSON.parse(JSON.stringify(newEvents2));
}
//规范speedEvents
function arrangeSpeedEvent(events) {
	const newEvents = [];
	for (const i2 of events) {
		const i1 = newEvents[newEvents.length - 1];
		if (!i1 || i1.value != i2.value) newEvents.push(i2);
		else i1.endTime = i2.endTime;
	}
	return JSON.parse(JSON.stringify(newEvents));
}
document.addEventListener('visibilitychange', () => document.visibilityState == 'hidden' && btnPause.value == '暂停' && btnPause.click());
document.addEventListener('pagehide', () => document.visibilityState == 'hidden' && btnPause.value == '暂停' && btnPause.click()); //兼容Safari
const qwqIn = new Timer();
const qwqOut = new Timer();
const qwqEnd = new Timer();
//play
btnPlay.addEventListener('click', async function() {
	btnPause.value = '暂停';
	if (this.value == '播放') {
		audio.play(res['mute'], true, false, 0); //播放空音频(防止音画不同步)
		('lines,notes,taps,drags,flicks,holds,reverseholds,tapholds').split(',').map(i => app[i] = []);
		app.chart = prerenderChart(charts[selectchart.value]); //fuckqwq
		app.chart2 = JSON.parse(JSON.stringify(charts[selectchart.value])); //fuckqwq2
		stat.reset(app.chart.numOfNotes, app.chart.md5, selectspeed.value);
		for (const i of chartLineData) {
			if (selectchart.value == i.Chart) {
				app.chart.judgeLineList[i.LineId].images[0] = bgs[i.Image];
				app.chart.judgeLineList[i.LineId].images[1] = await createImageBitmap(imgShader(bgs[i.Image], '#feffa9'));
				app.chart.judgeLineList[i.LineId].images[2] = await createImageBitmap(imgShader(bgs[i.Image], '#a3ffac'));
				app.chart.judgeLineList[i.LineId].images[3] = await createImageBitmap(imgShader(bgs[i.Image], '#a2eeff'));
				app.chart.judgeLineList[i.LineId].imageH = Number(i.Vert);
				app.chart.judgeLineList[i.LineId].imageW = Number(i.Horz);
				app.chart.judgeLineList[i.LineId].imageB = Number(i.IsDark);
			}
		}
		app.bgImage = bgs[selectbg.value] || res['NoImage'];
		app.bgImageBlur = bgsBlur[selectbg.value] || res['NoImage'];
		app.bgMusic = bgms[selectbgm.value];
		this.value = '停止';
		app.resizeCanvas();
		duration = app.bgMusic.duration / app.speed;
		isInEnd = false;
		isOutStart = false;
		isOutEnd = false;
		isPaused = false;
		timeBgm = 0;
		if (!showTransition.checked) qwqIn.addTime(3000);
		canvas.classList.remove('fade');
		mask.classList.add('fade');
		btnPause.classList.remove('disabled');
		for (const i of $$$('.disabled-when-playing')) i.classList.add('disabled');
		loop();
		qwqIn.play();
	} else {
		audio.stop();
		cancelAnimationFrame(stopDrawing);
		app.resizeCanvas();
		canvas.classList.add('fade');
		mask.classList.remove('fade');
		for (const i of $$$('.disabled-when-playing')) i.classList.remove('disabled');
		btnPause.classList.add('disabled');
		//清除原有数据
		fucktemp = false;
		fucktemp2 = false;
		clickEvents0.clear();
		clickEvents1.clear();
		clickEvents2.clear();
		qwqIn.reset();
		qwqOut.reset();
		qwqEnd.reset();
		curTime = 0;
		curTimestamp = 0;
		duration = 0;
		this.value = '播放';
	}
});
btnPause.addEventListener('click', function() {
	if (this.classList.contains('disabled') || btnPlay.value == '播放') return;
	if (this.value == '暂停') {
		qwqIn.pause();
		if (showTransition.checked && isOutStart) qwqOut.pause();
		isPaused = true;
		this.value = '继续';
		curTime = timeBgm;
		audio.stop();
	} else {
		qwqIn.play();
		if (showTransition.checked && isOutStart) qwqOut.play();
		isPaused = false;
		if (isInEnd && !isOutStart) playBgm(app.bgMusic, timeBgm * app.speed);
		this.value = '暂停';
	}
});
inputOffset.addEventListener('input', function() {
	if (this.value < -400) this.value = -400;
	if (this.value > 600) this.value = 600;
});
//播放bgm
function playBgm(data, offset) {
	isPaused = false;
	if (!offset) offset = 0;
	curTimestamp = performance.now();
	audio.play(data, false, true, offset, app.speed);
}
let fucktemp = false;
let fucktemp2 = false;
//作图
function loop() {
	const { lineScale } = app;
	const now = performance.now();
	//计算时间
	if (qwqOut.second < 0.67) {
		calcqwq(now);
		qwqdraw1(now);
	} else if (!fucktemp) qwqdraw2();
	if (fucktemp2) qwqdraw3(fucktemp2);
	ctx.globalAlpha = 1;
	if ($('imageBlur').checked) ctx.drawImage(app.bgImageBlur, ...adjustSize(app.bgImageBlur, canvas, 1.1));
	else ctx.drawImage(app.bgImage, ...adjustSize(app.bgImage, canvas, 1.1));
	ctx.fillStyle = '#000';
	ctx.globalAlpha = 0.4;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.globalAlpha = 1;
	ctx.drawImage(canvasos, (canvas.width - canvasos.width) / 2, 0);
	//Copyright
	ctx.font = `${lineScale * 0.4}px Mina,Noto Sans SC`;
	ctx.fillStyle = '#ccc';
	ctx.globalAlpha = 0.8;
	ctx.textAlign = 'right';
	ctx.textBaseline = 'middle';
	ctx.fillText(`Phigros Simulator v${_i[1].join('.')} - Code by lchz\x683\x3473`, (canvas.width + canvasos.width) / 2 - lineScale * 0.1, canvas.height - lineScale * 0.2);
	stopDrawing = requestAnimationFrame(loop); //回调更新动画
}

function calcqwq(now) {
	if (!isInEnd && qwqIn.second >= 3) {
		isInEnd = true;
		playBgm(app.bgMusic);
	}
	if (!isPaused && isInEnd && !isOutStart) timeBgm = (now - curTimestamp) / 1e3 + curTime;
	if (timeBgm >= duration) isOutStart = true;
	if (showTransition.checked && isOutStart && !isOutEnd) {
		isOutEnd = true;
		qwqOut.play();
	}
	timeChart = Math.max(timeBgm - app.chart.offset / app.speed - (Number(inputOffset.value) / 1e3 || 0), 0);
	//遍历判定线events和Note
	for (const line of app.lines) {
		for (const i of line.judgeLineDisappearEvents) {
			if (timeChart < i.startRealTime) break;
			if (timeChart > i.endRealTime) continue;
			const t2 = (timeChart - i.startRealTime) / (i.endRealTime - i.startRealTime);
			const t1 = 1 - t2;
			line.alpha = i.start * t1 + i.end * t2;
		}
		for (const i of line.judgeLineMoveEvents) {
			if (timeChart < i.startRealTime) break;
			if (timeChart > i.endRealTime) continue;
			const t2 = (timeChart - i.startRealTime) / (i.endRealTime - i.startRealTime);
			const t1 = 1 - t2;
			line.offsetX = app.matX(i.start * t1 + i.end * t2);
			line.offsetY = app.matY(i.start2 * t1 + i.end2 * t2);
		}
		for (const i of line.judgeLineRotateEvents) {
			if (timeChart < i.startRealTime) break;
			if (timeChart > i.endRealTime) continue;
			const t2 = (timeChart - i.startRealTime) / (i.endRealTime - i.startRealTime);
			const t1 = 1 - t2;
			line.rotation = app.matR(i.start * t1 + i.end * t2);
			line.cosr = Math.cos(line.rotation);
			line.sinr = Math.sin(line.rotation);
		}
		for (const i of line.speedEvents) {
			if (timeChart < i.startRealTime) break;
			if (timeChart > i.endRealTime) continue;
			line.positionY = (timeChart - i.startRealTime) * i.value * app.speed + i.floorPosition;
		}
		for (const i of line.notesAbove) {
			i.cosr = line.cosr;
			i.sinr = line.sinr;
			setAlpha(i, app.scaleX * i.positionX, app.scaleY * getY(i));
		}
		for (const i of line.notesBelow) {
			i.cosr = -line.cosr;
			i.sinr = -line.sinr;
			setAlpha(i, -app.scaleX * i.positionX, app.scaleY * getY(i));
		}

		function getY(i) {
			if (!i.badtime) return realgetY(i);
			if (performance.now() - i.badtime > 500) delete i.badtime;
			if (!i.badY) i.badY = realgetY(i);
			return i.badY;
		}

		function realgetY(i) {
			if (i.type != 3) return (i.floorPosition - line.positionY) * i.speed;
			if (i.realTime < timeChart) return (i.realTime - timeChart) * i.speed * app.speed;
			return i.floorPosition - line.positionY;
		}

		function setAlpha(i, dx, dy) {
			i.projectX = line.offsetX + dx * i.cosr;
			i.offsetX = i.projectX + dy * i.sinr;
			i.projectY = line.offsetY + dx * i.sinr;
			i.offsetY = i.projectY - dy * i.cosr;
			i.visible = Math.hypot(i.offsetX - app.wlen, i.offsetY - app.hlen) < app.wlen * 1.23625 + app.hlen + app.scaleY * i.realHoldTime * i.speed * app.speed;
			if (i.badtime) i.alpha = 1 - range((performance.now() - i.badtime) / 500);
			else if (i.realTime > timeChart) {
				if (dy > -1e-3 * app.scaleY) i.alpha = (i.type == 3 && i.speed == 0) ? (showPoint.checked ? 0.45 : 0) : qwq[5] ? Math.max(1 + (timeChart - i.realTime) / 1.5, 0) : 1; //过线前1.5s出现
				else i.alpha = showPoint.checked ? 0.45 : 0;
				//i.frameCount = 0;
			} else {
				if (i.type == 3) i.alpha = i.speed == 0 ? (showPoint.checked ? 0.45 : 0) : (i.status % 4 == 2 ? 0.45 : 1);
				else i.alpha = Math.max(1 - (timeChart - i.realTime) / (hyperMode.checked ? 0.12 : 0.16), 0); //过线后0.16s消失
				i.frameCount = isNaN(i.frameCount) ? 0 : i.frameCount + 1;
			}
		}
	}
	if (isInEnd) {
		judgements.addJudgement(app.notes, timeChart);
		judgements.judgeNote(app.drags, timeChart, canvasos.width * 0.117775);
		judgements.judgeNote(app.flicks, timeChart, canvasos.width * 0.117775);
		judgements.judgeNote(app.tapholds, timeChart, canvasos.width * 0.117775); //播放打击音效和判定
	}
	hit.taps.length = 0; //qwq
	frameTimer.addTick(); //计算fps
	clickEvents0.defilter(i => i.time++ > 0); //清除打击特效
	clickEvents1.defilter(i => now >= i.time + i.duration); //清除打击特效
	clickEvents2.defilter(i => now >= i.time + i.duration); //清除打击特效
	for (const i in hit.mouse) hit.mouse[i] instanceof Click && hit.mouse[i].animate();
	for (const i in hit.touch) hit.touch[i] instanceof Click && hit.touch[i].animate();
	if (qwq[4] && stat.good + stat.bad) {
		stat.reset();
		specialClick.func[1]();
	}
}

function qwqdraw1(now) {
	const { lineScale, noteScaleRatio } = app;
	const anim0 = i => { //绘制打击特效0
		ctxos.globalAlpha = 0.85;
		ctxos.setTransform(1, 0, 0, 1, i.offsetX, i.offsetY); //缩放
		ctxos.fillStyle = i.color;
		ctxos.beginPath();
		ctxos.arc(0, 0, lineScale * 0.5, 0, 2 * Math.PI);
		ctxos.fill();
		i.time++;
	};
	const anim1 = i => { //绘制打击特效1
		const tick = (now - i.time) / i.duration;
		ctxos.globalAlpha = 1;
		ctxos.setTransform(noteScaleRatio * 6, 0, 0, noteScaleRatio * 6, i.offsetX, i.offsetY); //缩放
		ctxos.drawImage(i.images[parseInt(tick * 30)] || i.images[i.images.length - 1], -128, -128); //停留约0.5秒
		ctxos.fillStyle = i.color;
		ctxos.globalAlpha = 1 - tick; //不透明度
		const r3 = 30 * (((0.2078 * tick - 1.6524) * tick + 1.6399) * tick + 0.4988); //方块大小
		for (const j of i.rand) {
			const ds = j[0] * (9 * tick / (8 * tick + 1)); //打击点距离
			ctxos.fillRect(ds * Math.cos(j[1]) - r3 / 2, ds * Math.sin(j[1]) - r3 / 2, r3, r3);
		}
	};
	const anim2 = i => { //绘制打击特效2
		const tick = (now - i.time) / i.duration;
		ctxos.setTransform(1, 0, 0, 1, i.offsetX, i.offsetY); //缩放
		ctxos.font = `bold ${noteScaleRatio*(256+128* (((0.2078 * tick - 1.6524) * tick + 1.6399) * tick + 0.4988))}px Mina,Noto Sans SC`;
		ctxos.textAlign = 'center';
		ctxos.textBaseline = 'middle';
		ctxos.fillStyle = i.color;
		ctxos.globalAlpha = 1 - tick; //不透明度
		ctxos.fillText(i.text, 0, -noteScaleRatio * 192);
	};
	ctxos.clearRect(0, 0, canvasos.width, canvasos.height); //重置画面
	ctxos.globalCompositeOperation = 'destination-over'; //由后往前绘制
	if ($('showCE2').checked) clickEvents2.anim(anim2);
	if (qwq[4]) ctxos.filter = `hue-rotate(${energy*360/7}deg)`;
	clickEvents1.anim(anim1, now);
	if (qwq[4]) ctxos.filter = 'none';
	if ($('feedback').checked) clickEvents0.anim(anim0);
	if (qwqIn.second >= 3 && qwqOut.second == 0) {
		if (showPoint.checked) { //绘制定位点
			ctxos.font = `${lineScale}px Mina,Noto Sans SC`;
			ctxos.textAlign = 'center';
			ctxos.textBaseline = 'bottom';
			for (const i of app.notes) {
				if (!i.visible) continue;
				ctxos.setTransform(i.cosr, i.sinr, -i.sinr, i.cosr, i.offsetX, i.offsetY);
				ctxos.fillStyle = 'cyan';
				ctxos.globalAlpha = i.realTime > timeChart ? 1 : 0.5;
				ctxos.fillText(i.name, 0, -lineScale * 0.1);
				ctxos.globalAlpha = 1;
				ctxos.fillStyle = 'lime';
				ctxos.fillRect(-lineScale * 0.2, -lineScale * 0.2, lineScale * 0.4, lineScale * 0.4);
			}
			for (const i of app.lines) {
				ctxos.setTransform(i.cosr, i.sinr, -i.sinr, i.cosr, i.offsetX, i.offsetY);
				ctxos.fillStyle = 'yellow';
				ctxos.globalAlpha = (i.alpha + 0.5) / 1.5;
				ctxos.fillText(i.lineId, 0, -lineScale * 0.1);
				ctxos.globalAlpha = 1;
				ctxos.fillStyle = 'violet';
				ctxos.fillRect(-lineScale * 0.2, -lineScale * 0.2, lineScale * 0.4, lineScale * 0.4);
			}
		}
		//绘制note
		for (const i of app.flicks) drawNote(i, timeChart, 4);
		for (const i of app.taps) drawNote(i, timeChart, 1);
		for (const i of app.drags) drawNote(i, timeChart, 2);
		for (const i of app.reverseholds) drawNote(i, timeChart, 3);
	}
	//绘制背景
	if (qwq[4]) ctxos.filter = `hue-rotate(${energy*360/7}deg)`;
	if (qwqIn.second >= 2.5) drawLine(stat.lineStatus ? 2 : 1); //绘制判定线(背景前1)
	if (qwq[4]) ctxos.filter = 'none';
	ctxos.resetTransform();
	ctxos.fillStyle = '#000'; //背景变暗
	ctxos.globalAlpha = selectglobalalpha.value == '' ? 0.6 : selectglobalalpha.value; //背景不透明度
	ctxos.fillRect(0, 0, canvasos.width, canvasos.height);
	if (qwq[4]) ctxos.filter = `hue-rotate(${energy*360/7}deg)`;
	if (qwqIn.second >= 2.5 && !stat.lineStatus) drawLine(0); //绘制判定线(背景后0)
	if (qwq[4]) ctxos.filter = 'none';
	ctxos.globalAlpha = 1;
	ctxos.resetTransform();
	if ($('imageBlur').checked) {
		ctxos.drawImage(app.bgImageBlur, ...adjustSize(app.bgImageBlur, canvasos, 1));
	} else {
		ctxos.drawImage(app.bgImage, ...adjustSize(app.bgImage, canvasos, 1));
	}
	ctxos.fillRect(0, 0, canvasos.width, canvasos.height);
	ctxos.globalCompositeOperation = 'source-over';
	//绘制进度条
	ctxos.setTransform(canvasos.width / 1920, 0, 0, canvasos.width / 1920, 0, lineScale * (qwqIn.second < 0.67 ? (tween.easeOutSine(qwqIn.second * 1.5) - 1) : -tween.easeOutSine(qwqOut.second * 1.5)) * 1.75);
	ctxos.drawImage(res['ProgressBar'], (qwq[5] ? duration - timeBgm : timeBgm) / duration * 1920 - 1920, 0);
	//绘制文字
	ctxos.resetTransform();
	ctxos.fillStyle = '#fff';
	//开头过渡动画
	if (qwqIn.second < 3) {
		if (qwqIn.second < 0.67) ctxos.globalAlpha = tween.easeOutSine(qwqIn.second * 1.5);
		else if (qwqIn.second >= 2.5) ctxos.globalAlpha = tween.easeOutSine(6 - qwqIn.second * 2);
		ctxos.textAlign = 'center';
		//歌名
		ctxos.textBaseline = 'alphabetic';
		ctxos.font = `${lineScale * 1.1}px Mina,Noto Sans SC`;
		const dxsnm = ctxos.measureText(inputName.value || inputName.placeholder).width;
		if (dxsnm > canvasos.width - lineScale * 1.5) ctxos.font = `${(lineScale) * 1.1/dxsnm*(canvasos.width-lineScale*1.5)}px Mina,Noto Sans SC`;
		ctxos.fillText(inputName.value || inputName.placeholder, app.wlen, app.hlen * 0.75);
		//曲绘和谱师
		ctxos.textBaseline = 'top';
		ctxos.font = `${lineScale * 0.55}px Mina,Noto Sans SC`;
		const dxi = ctxos.measureText(`Illustration designed by ${inputIllustrator.value || inputIllustrator.placeholder}`).width;
		if (dxi > canvasos.width - lineScale * 1.5) ctxos.font = `${(lineScale) * 0.55/dxi*(canvasos.width-lineScale*1.5)}px Mina,Noto Sans SC`;
		ctxos.fillText(`Illustration designed by ${inputIllustrator.value || inputIllustrator.placeholder}`, app.wlen, app.hlen * 1.25 + lineScale * 0.15);
		ctxos.font = `${lineScale * 0.55}px Mina,Noto Sans SC`;
		const dxc = ctxos.measureText(`Level designed by ${inputDesigner.value || inputDesigner.placeholder}`).width;
		if (dxc > canvasos.width - lineScale * 1.5) ctxos.font = `${(lineScale) * 0.55/dxc*(canvasos.width-lineScale*1.5)}px Mina,Noto Sans SC`;
		ctxos.fillText(`Level designed by ${inputDesigner.value || inputDesigner.placeholder}`, app.wlen, app.hlen * 1.25 + lineScale * 1.0);
		//判定线(装饰用)
		ctxos.globalAlpha = 1;
		ctxos.setTransform(1, 0, 0, 1, app.wlen, app.hlen);
		const imgW = lineScale * 48 * (qwqIn.second < 0.67 ? tween.easeInSine(qwqIn.second * 1.5) : 1);
		const imgH = lineScale * 0.15;
		if (qwqIn.second >= 2.5) ctxos.globalAlpha = tween.easeOutSine(6 - qwqIn.second * 2);
		ctxos.drawImage(lineColor.checked ? res['JudgeLineMP'] : res['JudgeLine'], -imgW / 2, -imgH / 2, imgW, imgH);
	}
	//绘制分数和combo以及暂停按钮
	ctxos.globalAlpha = 1;
	ctxos.setTransform(1, 0, 0, 1, 0, lineScale * (qwqIn.second < 0.67 ? (tween.easeOutSine(qwqIn.second * 1.5) - 1) : -tween.easeOutSine(qwqOut.second * 1.5)) * 1.75);
	ctxos.textBaseline = 'alphabetic';
	ctxos.font = `${lineScale * 0.95}px Mina,Noto Sans SC`;
	ctxos.textAlign = 'right';
	ctxos.fillText(stat.scoreStr, canvasos.width - lineScale * 0.65, lineScale * 1.375);
	if (!qwq[0]) ctxos.drawImage(res['Pause'], lineScale * 0.6, lineScale * 0.7, lineScale * 0.63, lineScale * 0.7);
	if (stat.combo > 2) {
		ctxos.textAlign = 'center';
		ctxos.font = `${lineScale * 1.32}px Mina,Noto Sans SC`;
		ctxos.fillText(stat.combo, app.wlen, lineScale * 1.375);
		ctxos.globalAlpha = qwqIn.second < 0.67 ? tween.easeOutSine(qwqIn.second * 1.5) : (1 - tween.easeOutSine(qwqOut.second * 1.5));
		ctxos.font = `${lineScale * 0.66}px Mina,Noto Sans SC`;
		ctxos.fillText(autoplay.checked ? 'Autoplay' : 'combo', app.wlen, lineScale * 2.05);
	}
	//绘制歌名和等级
	ctxos.globalAlpha = 1;
	ctxos.setTransform(1, 0, 0, 1, 0, lineScale * (qwqIn.second < 0.67 ? (1 - tween.easeOutSine(qwqIn.second * 1.5)) : tween.easeOutSine(qwqOut.second * 1.5)) * 1.75);
	ctxos.textBaseline = 'alphabetic';
	ctxos.textAlign = 'right';
	ctxos.font = `${lineScale * 0.63}px Mina,Noto Sans SC`;
	const dxlvl = ctxos.measureText(inputLevel.value || inputLevel.placeholder).width;
	if (dxlvl > app.wlen - lineScale) ctxos.font = `${(lineScale) * 0.63/dxlvl*(app.wlen - lineScale )}px Mina,Noto Sans SC`;
	ctxos.fillText(inputLevel.value || inputLevel.placeholder, canvasos.width - lineScale * 0.75, canvasos.height - lineScale * 0.66);
	ctxos.drawImage(res['SongsNameBar'], lineScale * 0.53, canvasos.height - lineScale * 1.22, lineScale * 0.119, lineScale * 0.612);
	ctxos.textAlign = 'left';
	ctxos.font = `${lineScale * 0.63}px Mina,Noto Sans SC`;
	const dxsnm = ctxos.measureText(inputName.value || inputName.placeholder).width;
	if (dxsnm > app.wlen - lineScale) ctxos.font = `${(lineScale) * 0.63/dxsnm*(app.wlen - lineScale )}px Mina,Noto Sans SC`;
	ctxos.fillText(inputName.value || inputName.placeholder, lineScale * 0.85, canvasos.height - lineScale * 0.66);
	ctxos.resetTransform();
	if (qwq[0]) {
		//绘制时间和帧率以及note打击数
		if (qwqIn.second < 0.67) ctxos.globalAlpha = tween.easeOutSine(qwqIn.second * 1.5);
		else ctxos.globalAlpha = 1 - tween.easeOutSine(qwqOut.second * 1.5);
		ctxos.textBaseline = 'middle';
		ctxos.font = `${lineScale * 0.4}px Mina,Noto Sans SC`;
		ctxos.textAlign = 'left';
		ctxos.fillText(`${time2Str(qwq[5]?duration-timeBgm:timeBgm)}/${time2Str(duration)}${scfg()}`, lineScale * 0.05, lineScale * 0.5);
		ctxos.textAlign = 'right';
		ctxos.fillText(frameTimer.fps, canvasos.width - lineScale * 0.05, lineScale * 0.5);
		ctxos.textBaseline = 'alphabetic';
		if (showPoint.checked) stat.combos.forEach((val, idx) => {
			ctxos.fillStyle = comboColor[idx];
			ctxos.fillText(val, lineScale * (idx + 1) * 1.1, canvasos.height - lineScale * 0.1);
		});
	}
	//判定线函数，undefined/0:默认,1:非,2:恒成立
	function drawLine(bool) {
		ctxos.globalAlpha = 1;
		const tw = 1 - tween.easeOutSine(qwqOut.second * 1.5);
		for (const i of app.lines) {
			if (bool ^ i.imageB && qwqOut.second < 0.67) {
				ctxos.globalAlpha = i.alpha;
				ctxos.setTransform(i.cosr * tw, i.sinr, -i.sinr * tw, i.cosr, app.wlen + (i.offsetX - app.wlen) * tw, i.offsetY); //hiahiah
				const imgH = i.imageH > 0 ? lineScale * 18.75 * i.imageH : canvasos.height * -i.imageH; // hlen*0.008
				const imgW = imgH * i.images[0].width / i.images[0].height * i.imageW; //* 38.4*25 * i.imageH* i.imageW; //wlen*3
				ctxos.drawImage(i.images[lineColor.checked ? stat.lineStatus : 0], -imgW / 2, -imgH / 2, imgW, imgH);
			}
		}
	}
}

function qwqdraw2() {
	fucktemp = true;
	btnPause.click(); //isPaused = true;
	audio.stop();
	cancelAnimationFrame(stopDrawing);
	btnPause.classList.add('disabled');
	ctxos.globalCompositeOperation = 'source-over';
	ctxos.resetTransform();
	ctxos.globalAlpha = 1;
	if ($('imageBlur').checked) ctxos.drawImage(app.bgImageBlur, ...adjustSize(app.bgImageBlur, canvasos, 1));
	else ctxos.drawImage(app.bgImage, ...adjustSize(app.bgImage, canvasos, 1));
	ctxos.fillStyle = '#000'; //背景变暗
	ctxos.globalAlpha = selectglobalalpha.value == '' ? 0.6 : selectglobalalpha.value; //背景不透明度
	ctxos.fillRect(0, 0, canvasos.width, canvasos.height);
	const difficulty = ['ez', 'hd', 'in', 'at'].indexOf(inputLevel.value.slice(0, 2).toLocaleLowerCase());
	const xhr = new XMLHttpRequest();
	xhr.open('get', `src/LevelOver${difficulty < 0 ? 2 : difficulty}${hyperMode.checked ? '_v2' : ''}.ogg`, true);
	xhr.responseType = 'arraybuffer';
	xhr.send();
	xhr.onload = async () => {
		const bgm = await audio.decode(xhr.response);
		const timeout = setTimeout(() => {
			if (!fucktemp) return;
			audio.play(bgm, true, true, 0);
			qwqEnd.reset();
			qwqEnd.play();
			fucktemp2 = stat.getData(autoplay.checked, selectspeed.value);
		}, 1000);
	}
}

function qwqdraw3(statData) {
	ctxos.resetTransform();
	ctxos.globalCompositeOperation = 'source-over';
	ctxos.clearRect(0, 0, canvasos.width, canvasos.height);
	ctxos.globalAlpha = 1;
	if ($('imageBlur').checked) ctxos.drawImage(app.bgImageBlur, ...adjustSize(app.bgImageBlur, canvasos, 1));
	else ctxos.drawImage(app.bgImage, ...adjustSize(app.bgImage, canvasos, 1));
	ctxos.fillStyle = '#000'; //背景变暗
	ctxos.globalAlpha = selectglobalalpha.value == '' ? 0.6 : selectglobalalpha.value; //背景不透明度
	ctxos.fillRect(0, 0, canvasos.width, canvasos.height);
	ctxos.globalCompositeOperation = 'destination-out';
	ctxos.globalAlpha = 1;
	const k = 3.7320508075688776; //tan75°
	ctxos.setTransform(canvasos.width - canvasos.height / k, 0, -canvasos.height / k, canvasos.height, canvasos.height / k, 0);
	ctxos.fillRect(0, 0, 1, tween.easeOutCubic(range((qwqEnd.second - 0.13) * 0.94)));
	ctxos.resetTransform();
	ctxos.globalCompositeOperation = 'destination-over';
	const qwq0 = (canvasos.width - canvasos.height / k) / (16 - 9 / k);
	ctxos.setTransform(qwq0 / 120, 0, 0, qwq0 / 120, app.wlen - qwq0 * 8, app.hlen - qwq0 * 4.5); //?
	ctxos.drawImage(res['LevelOver4'], 183, 42, 1184, 228);
	ctxos.globalAlpha = range((qwqEnd.second - 0.27) / 0.83);
	ctxos.drawImage(res['LevelOver1'], 102, 378);
	ctxos.globalCompositeOperation = 'source-over';
	ctxos.globalAlpha = 1;
	ctxos.drawImage(res['LevelOver5'], 700 * tween.easeOutCubic(range(qwqEnd.second * 1.25)) - 369, 91, 20, 80);
	//歌名和等级
	ctxos.fillStyle = '#fff';
	ctxos.textBaseline = 'middle';
	ctxos.textAlign = 'left';
	ctxos.font = '80px Mina,Noto Sans SC';
	const dxsnm = ctxos.measureText(inputName.value || inputName.placeholder).width;
	if (dxsnm > 1500) ctxos.font = `${80/dxsnm*1500}px Mina,Noto Sans SC`;
	ctxos.fillText(inputName.value || inputName.placeholder, 700 * tween.easeOutCubic(range(qwqEnd.second * 1.25)) - 320, 145);
	ctxos.font = '30px Mina,Noto Sans SC';
	const dxlvl = ctxos.measureText(inputLevel.value || inputLevel.placeholder).width;
	if (dxlvl > 750) ctxos.font = `${30/dxlvl*750}px Mina,Noto Sans SC`;
	ctxos.fillText(inputLevel.value || inputLevel.placeholder, 700 * tween.easeOutCubic(range(qwqEnd.second * 1.25)) - 317, 208);
	ctxos.font = '30px Mina,Noto Sans SC';
	//Rank图标
	ctxos.globalAlpha = range((qwqEnd.second - 1.87) * 3.75);
	const qwq2 = 293 + range((qwqEnd.second - 1.87) * 3.75) * 100;
	const qwq3 = 410 - range((qwqEnd.second - 1.87) * 2.14) * 164;
	ctxos.drawImage(res['LevelOver3'], 661 - qwq2 / 2, 545 - qwq2 / 2, qwq2, qwq2);
	ctxos.drawImage(res['Ranks'][stat.rankStatus], 661 - qwq3 / 2, 545 - qwq3 / 2, qwq3, qwq3);
	//各种数据
	ctxos.globalAlpha = range((qwqEnd.second - 0.87) * 2.50);
	ctxos.fillStyle = statData.newBestColor;
	ctxos.fillText(statData.newBestStr, 898, 428);
	ctxos.fillStyle = '#fff';
	ctxos.textAlign = 'center';
	ctxos.fillText(statData.scoreBest, 1180, 428);
	ctxos.globalAlpha = range((qwqEnd.second - 1.87) * 2.50);
	ctxos.textAlign = 'right';
	ctxos.fillText(statData.scoreDelta, 1414, 428);
	ctxos.globalAlpha = range((qwqEnd.second - 0.95) * 1.50);
	ctxos.textAlign = 'left';
	ctxos.fillText(stat.accStr, 352, 545);
	ctxos.fillText(stat.maxcombo, 1528, 545);
	ctxos.fillStyle = statData.textAboveColor;
	ctxos.fillText(statData.textAboveStr, 383 + Math.min(dxlvl, 750), 208);
	ctxos.fillStyle = statData.textBelowColor;
	ctxos.fillText(statData.textBelowStr, 1355, 590);
	ctxos.fillStyle = '#fff';
	ctxos.textAlign = 'center';
	ctxos.font = '86px Mina,Noto Sans SC';
	ctxos.globalAlpha = range((qwqEnd.second - 1.12) * 2.00);
	ctxos.fillText(stat.scoreStr, 1075, 554);
	ctxos.font = '26px Mina,Noto Sans SC';
	ctxos.globalAlpha = range((qwqEnd.second - 0.87) * 2.50);
	ctxos.fillText(stat.perfect, 891, 645);
	ctxos.globalAlpha = range((qwqEnd.second - 1.07) * 2.50);
	ctxos.fillText(stat.good, 1043, 645);
	ctxos.globalAlpha = range((qwqEnd.second - 1.27) * 2.50);
	ctxos.fillText(stat.noteRank[6], 1196, 645);
	ctxos.globalAlpha = range((qwqEnd.second - 1.47) * 2.50);
	ctxos.fillText(stat.noteRank[2], 1349, 645);
	ctxos.font = '22px Mina,Noto Sans SC';
	const qwq4 = range((qwq[3] > 0 ? qwqEnd.second - qwq[3] : 0.2 - qwqEnd.second - qwq[3]) * 5.00);
	ctxos.globalAlpha = 0.8 * range((qwqEnd.second - 0.87) * 2.50) * qwq4;
	ctxos.fillStyle = '#696';
	ctxos.fill(new Path2D('M841,718s-10,0-10,10v80s0,10,10,10h100s10,0,10-10v-80s0-10-10-10h-40l-10-20-10,20h-40z'));
	ctxos.globalAlpha = 0.8 * range((qwqEnd.second - 1.07) * 2.50) * qwq4;
	ctxos.fillStyle = '#669';
	ctxos.fill(new Path2D('M993,718s-10,0-10,10v80s0,10,10,10h100s10,0,10-10v-80s0-10-10-10h-40l-10-20-10,20h-40z'));
	ctxos.fillStyle = '#fff';
	ctxos.globalAlpha = range((qwqEnd.second - 0.97) * 2.50) * qwq4;
	ctxos.fillText('Early: ' + stat.noteRank[5], 891, 755);
	ctxos.fillText('Late: ' + stat.noteRank[1], 891, 788);
	ctxos.globalAlpha = range((qwqEnd.second - 1.17) * 2.50) * qwq4;
	ctxos.fillText('Early: ' + stat.noteRank[7], 1043, 755);
	ctxos.fillText('Late: ' + stat.noteRank[3], 1043, 788);
	ctxos.resetTransform();
	ctxos.globalCompositeOperation = 'destination-over';
	ctxos.globalAlpha = 1;
	ctxos.fillStyle = '#000';
	ctxos.drawImage(app.bgImage, ...adjustSize(app.bgImage, canvasos, 1));
	ctxos.fillRect(0, 0, canvasos.width, canvasos.height);
}

function range(num) {
	if (num < 0) return 0;
	if (num > 1) return 1;
	return num;
}
//绘制Note
function drawNote(note, realTime, type) {
	const HL = note.isMulti && $('highLight').checked;
	const nsr = app.noteScaleRatio;
	if (!note.visible) return;
	if (note.type != 3 && note.scored && !note.badtime) return;
	if (note.type == 3 && note.realTime + note.realHoldTime < realTime) return; //qwq
	ctxos.globalAlpha = note.alpha;
	ctxos.setTransform(nsr * note.cosr, nsr * note.sinr, -nsr * note.sinr, nsr * note.cosr, note.offsetX, note.offsetY);
	if (type == 3) {
		const baseLength = app.scaleY / nsr * note.speed * app.speed;
		const holdLength = baseLength * note.realHoldTime;
		if (note.realTime > realTime) {
			if (HL) {
				ctxos.drawImage(res['HoldHeadHL'], -res['HoldHeadHL'].width * 1.026 * 0.5, 0, res['HoldHeadHL'].width * 1.026, res['HoldHeadHL'].height * 1.026);
				ctxos.drawImage(res['HoldHL'], -res['HoldHL'].width * 1.026 * 0.5, -holdLength, res['HoldHL'].width * 1.026, holdLength);
			} else {
				ctxos.drawImage(res['HoldHead'], -res['HoldHead'].width * 0.5, 0);
				ctxos.drawImage(res['Hold'], -res['Hold'].width * 0.5, -holdLength, res['Hold'].width, holdLength);
			}
			ctxos.drawImage(res['HoldEnd'], -res['HoldEnd'].width * 0.5, -holdLength - res['HoldEnd'].height);
		} else {
			if (HL) ctxos.drawImage(res['HoldHL'], -res['HoldHL'].width * 1.026 * 0.5, -holdLength, res['HoldHL'].width * 1.026, holdLength - baseLength * (realTime - note.realTime));
			else ctxos.drawImage(res['Hold'], -res['Hold'].width * 0.5, -holdLength, res['Hold'].width, holdLength - baseLength * (realTime - note.realTime));
			ctxos.drawImage(res['HoldEnd'], -res['HoldEnd'].width * 0.5, -holdLength - res['HoldEnd'].height);
		}
	} else if (note.badtime) {
		if (type == 1) ctxos.drawImage(res['TapBad'], -res['TapBad'].width * 0.5, -res['TapBad'].height * 0.5);
	} else if (HL) {
		if (type == 1) ctxos.drawImage(res['TapHL'], -res['TapHL'].width * 0.5, -res['TapHL'].height * 0.5);
		else if (type == 2) ctxos.drawImage(res['DragHL'], -res['DragHL'].width * 0.5, -res['DragHL'].height * 0.5);
		else if (type == 4) ctxos.drawImage(res['FlickHL'], -res['FlickHL'].width * 0.5, -res['FlickHL'].height * 0.5);
	} else {
		if (type == 1) ctxos.drawImage(res['Tap'], -res['Tap'].width * 0.5, -res['Tap'].height * 0.5);
		else if (type == 2) ctxos.drawImage(res['Drag'], -res['Drag'].width * 0.5, -res['Drag'].height * 0.5);
		else if (type == 4) ctxos.drawImage(res['Flick'], -res['Flick'].width * 0.5, -res['Flick'].height * 0.5);
	}
}
//test
function chart123(chart) {
	const newChart = JSON.parse(JSON.stringify(chart)); //深拷贝
	switch (newChart.formatVersion) { //加花括号以避免beautify缩进bug
		case 1: {
			newChart.formatVersion = 3;
			for (const i of newChart.judgeLineList) {
				for (const j of i.judgeLineDisappearEvents) {
					j.start2 = 0;
					j.end2 = 0;
				}
				for (const j of i.judgeLineMoveEvents) {
					j.start2 = j.start % 1e3 / 520;
					j.end2 = j.end % 1e3 / 520;
					j.start = parseInt(j.start / 1e3) / 880;
					j.end = parseInt(j.end / 1e3) / 880;
				}
				for (const j of i.judgeLineRotateEvents) {
					j.start2 = 0;
					j.end2 = 0;
				}
			}
		}
		case 3: {
			for (const i of newChart.judgeLineList) {
				let y = 0;
				for (const j of i.speedEvents) {
					if (j.startTime < 0) j.startTime = 0;
					j.floorPosition = y;
					y = Math.fround(y + (j.endTime - j.startTime) * j.value / i.bpm * 1.875); //float32
				}
			}
		}
		case 3473:
			break;
		default:
			throw `Unsupported formatVersion: ${newChart.formatVersion}`;
	}
	return newChart;
}
//调节画面尺寸和全屏相关(返回source播放aegleseeker会出现迷之error)
function adjustSize(source, dest, scale) {
	const [sw, sh, dw, dh] = [source.width, source.height, dest.width, dest.height];
	if (dw * sh > dh * sw) return [dw * (1 - scale) / 2, (dh - dw * sh / sw * scale) / 2, dw * scale, dw * sh / sw * scale];
	return [(dw - dh * sw / sh * scale) / 2, dh * (1 - scale) / 2, dh * sw / sh * scale, dh * scale];
}
//给图片上色(limit用于解决iOS的InvalidStateError)
function imgShader(img, color, limit = 512) {
	const canvas = document.createElement('canvas');
	canvas.width = img.width;
	canvas.height = img.height;
	const ctx = canvas.getContext('2d');
	ctx.drawImage(img, 0, 0);
	for (let dx = 0; dx < img.width; dx += limit) {
		for (let dy = 0; dy < img.height; dy += limit) {
			const imgData = ctx.getImageData(dx, dy, limit, limit);
			const data = hex2rgba(color);
			for (let i = 0; i < imgData.data.length / 4; i++) {
				imgData.data[i * 4] *= data[0] / 255;
				imgData.data[i * 4 + 1] *= data[1] / 255;
				imgData.data[i * 4 + 2] *= data[2] / 255;
				imgData.data[i * 4 + 3] *= data[3] / 255;
			}
			ctx.putImageData(imgData, dx, dy);
		}
	}
	return canvas;
}
//十六进制color转rgba数组
function hex2rgba(color) {
	const ctx = document.createElement('canvas').getContext('2d');
	ctx.fillStyle = color;
	ctx.fillRect(0, 0, 1, 1);
	return ctx.getImageData(0, 0, 1, 1).data;
}
//rgba数组(0-1)转十六进制
function rgba2hex(...rgba) {
	return '#' + rgba.map(i => ('00' + Math.round(Number(i) * 255 || 0).toString(16)).slice(-2)).join('');
}