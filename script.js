import simphi from './js/simphi.js';
import { audio } from '/utils/aup.js';
import { full, Timer, getConstructorName, urls, isUndefined, loadJS, frameTimer, time2Str, orientation } from './js/common.js';
import { uploader, readZip } from './js/reader.js';
import InterAct from '/utils/interact.js';
self._i = ['Phi\x67ros模拟器', [1, 4, 22, 'b25'], 1611795955, 1677295116];
const $ = query => document.getElementById(query);
const $$ = query => document.body.querySelector(query);
const $$$ = query => document.body.querySelectorAll(query);
const tween = {
	easeInSine: pos => 1 - Math.cos(pos * Math.PI / 2),
	easeOutSine: pos => Math.sin(pos * Math.PI / 2),
	easeOutCubic: pos => 1 + (pos - 1) ** 3,
}
document.oncontextmenu = e => e.preventDefault(); //qwq
for (const i of $('view-nav').children) {
	i.addEventListener('click', function() {
		for (const j of this.parentElement.children) j.classList.remove('active');
		const doc = $('view-doc');
		const msg = $('view-msg');
		this.classList.add('active');
		if (i.id === 'msg') {
			doc.classList.add('hide');
			msg.classList.remove('hide');
		} else {
			if (doc.getAttribute('src') !== `docs/${i.id}.html`) doc.src = `docs/${i.id}.html`;
			msg.classList.add('hide');
			doc.classList.remove('hide');
		}
	});
}
$('cover-dark').addEventListener('click', () => {
	$('cover-dark').classList.add('fade');
	$('cover-view').classList.add('fade');
	$('cover-config').classList.add('fade');
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
$('btn-more').addEventListener('click', () => {
	$('cover-dark').classList.remove('fade');
	$('cover-config').classList.remove('fade');
});
const msgHandler = {
	nodeText: $('msg-out'),
	nodeView: $('view-msg'),
	lastMessage: '',
	msgbox(msg, type, fatal) {
		const msgbox = document.createElement('div');
		msgbox.innerHTML = msg;
		msgbox.setAttribute('type', type);
		msgbox.classList.add('msgbox');
		const btn = document.createElement('a');
		btn.innerText = '忽略';
		btn.style.float = 'right';
		btn.onclick = () => {
			msgbox.remove();
			this.sendMessage(this.lastMessage);
		}
		if (fatal) btn.classList.add('disabled');
		msgbox.appendChild(btn);
		this.nodeView.appendChild(msgbox);
	},
	sendMessage(msg, type) {
		const num = this.nodeView.querySelectorAll('.msgbox[type=warn]').length;
		if (type === 'error') {
			this.nodeText.className = 'error';
			this.nodeText.innerText = msg;
		} else {
			this.nodeText.className = num ? 'warning' : 'accept';
			this.nodeText.innerText = msg + (num ? `（发现${num}个问题，点击查看）` : '');
			this.lastMessage = msg;
		}
	},
	sendWarning(msg, isHTML) {
		const msgText = isHTML ? msg : Utils.escapeHTML(msg);
		this.msgbox(msgText, 'warn');
		this.sendMessage(this.lastMessage);
	},
	sendError(msg, html, fatal) {
		if (html) {
			const exp = /([A-Za-z][A-Za-z+-.]{2,}:\/\/|www\.)[^\s\x00-\x20\x7f-\x9f"]{2,}[^\s\x00-\x20\x7f-\x9f"!'),.:;?\]}]/g;
			const ahtml = html.replace(exp, (match = '') => {
				const url = match.startsWith('www.') ? `//${match}` : match;
				const rpath = match.replace(`${location.origin}/`, '');
				if (match.indexOf(location.origin) > -1) return `<a href="#"style="color:#023b8f;text-decoration:underline;">${rpath}</a>`;
				return `<a href="${url}"target="_blank"style="color:#023b8f;text-decoration:underline;">${rpath}</a>`;
			});
			this.msgbox(ahtml, 'error', fatal);
		}
		this.sendMessage(msg, 'error');
		return false;
	}
}
//
const stat = new simphi.Stat();
const app = new simphi.Renderer($('stage')); //test
const { canvas, ctx, canvasos, ctxos } = app;
const selectbg = $('select-bg');
const btnPlay = $('btn-play');
const btnPause = $('btn-pause');
const selectbgm = $('select-bgm');
const selectchart = $('select-chart');
$('select-note-scale').addEventListener('change', evt => {
	app.setNoteScale(evt.target.value);
});
$('select-aspect-ratio').addEventListener('change', evt => {
	stage.resize(evt.target.value);
});
$('select-background-dim').addEventListener('change', evt => {
	app.brightness = Number(evt.target.value);
});
$('highLight').addEventListener('change', evt => {
	app.multiHint = evt.target.checked;
});
$('highLight').dispatchEvent(new Event('change'));
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
	if (arr.length === 0) return '';
	return `(${arr.join('+')})`;
}
const inputName = $('input-name');
const inputArtist = $('input-artist');
const inputCharter = $('input-charter');
const inputIllustrator = $('input-illustrator');
const selectDifficulty = $('select-difficulty');
const selectLevel = $('select-level');
let levelText = '';
const updateLevelText = type => {
	const table = { SP: [0, 0], EZ: [1, 7], HD: [3, 12], IN: [6, 15], AT: [13, 16] };
	let diffStr = selectDifficulty.value || 'SP';
	let levelNum = selectLevel.value | 0;
	if (type === 0) {
		const diff = table[diffStr];
		if (levelNum < diff[0]) levelNum = diff[0];
		if (levelNum > diff[1]) levelNum = diff[1];
		selectLevel.value = levelNum;
		selectLevel.value = selectLevel.value;
	} else if (type === 1) {
		const keys = Object.keys(table);
		if (table[diffStr][1] < levelNum)
			for (let i = 0; i < keys.length; i++) {
				if (table[keys[i]][1] < levelNum) continue;
				diffStr = keys[i];
				break;
			}
		else if (table[diffStr][0] > levelNum) {
			for (let i = keys.length - 1; i >= 0; i--) {
				if (table[keys[i]][0] > levelNum) continue;
				diffStr = keys[i];
				break;
			}
		}
		selectDifficulty.value = diffStr;
		selectDifficulty.value = selectDifficulty.value;
	}
	const diffString = selectDifficulty.value || 'SP';
	const levelString = selectLevel.value || '?';
	levelText = [diffString, levelString].join('  Lv.');
};
updateLevelText();
selectDifficulty.addEventListener('change', updateLevelText.bind(null, 0));
selectLevel.addEventListener('change', updateLevelText.bind(null, 1));
$('select-volume').addEventListener('change', evt => {
	const volume = Number(evt.target.value);
	app.musicVolume = Math.min(1, 1 / volume);
	app.soundVolume = Math.min(1, volume);
	btnPause.click();
	btnPause.click();
});
const inputOffset = $('input-offset');
const showPoint = $('showPoint');
const showAcc = $('showAcc');
const showStat = $('showStat');
const lineColor = $('lineColor');
$('autoplay').addEventListener('change', evt => {
	app.playMode = evt.target.checked ? 1 : 0;
});
$('autoplay').dispatchEvent(new Event('change'));
const showTransition = $('showTransition');
$('lowRes').addEventListener('change', evt => {
	app.setLowResFactor(evt.target.checked ? 0.5 : 1);
});
const bgs = new Map;
const bgsBlur = new Map;
const bgms = new Map;
const charts = new Map;
const chartsMD5 = new Map;
const chartLineData = []; //line.csv
const chartInfoData = []; //info.csv
async function checkSupport() {
	/** @param {Error} error */
	const sysError = (error, message) => {
		const type = getConstructorName(error);
		// if (message==='Script error.') return;
		let message2 = String(error);
		let detail = String(error);
		if (error instanceof Error) {
			const stack = error.stack || 'Stack not available';
			if (error.name === type) message2 = error.message;
			else message2 = `${error.name}: ${error.message}`;
			const idx = stack.indexOf(message2) + 1;
			if (idx) detail = `${message2}\n${stack.slice(idx+message2.length)}`;
			else detail = `${message2}\n    ${stack.split('\n').join('\n    ')}`; //Safari
		}
		if (message) message2 = message;
		const errMessage = `[${type}] ${message2.split('\n')[0]}`;
		const errDetail = `[${type}] ${detail}`;
		msgHandler.sendError(errMessage, Utils.escapeHTML(errDetail));
	};
	self.addEventListener('error', e => sysError(e.error, e.message));
	self.addEventListener('unhandledrejection', e => sysError(e.reason));
	const loadPlugin = async (name, urls, check) => {
		if (!check()) return true;
		const errmsg1 = `错误：${name}组件加载失败（点击查看详情）`;
		const errmsg2 = `${name}组件加载失败，请检查您的网络连接然后重试：`;
		const errmsg3 = `${name}组件加载失败，请检查浏览器兼容性`;
		msgHandler.sendMessage(`加载${name}组件...`);
		if (!await loadJS(urls).catch(e => msgHandler.sendError(errmsg1, e.message.replace(/.+/, errmsg2), true))) return false;
		if (!check()) return true;
		return msgHandler.sendError(errmsg1, errmsg3, true);
	};
	await Utils.addFont('Titillium Web', { alt: 'Custom' });
	//兼容性检测
	msgHandler.sendMessage('检查浏览器兼容性...');
	const isMobile = navigator.standalone !== undefined || navigator.platform.indexOf('Linux') > -1 && navigator.maxTouchPoints === 5;
	if (isMobile) $('uploader-select').style.display = 'none';
	if (navigator.userAgent.indexOf('MiuiBrowser') > -1) {
		//实测 v17.1.8 问题仍然存在，v17.4.80113 问题已修复
		const version = navigator.userAgent.match(/MiuiBrowser\/(\d+\.\d+)/);
		const text = '检测到小米浏览器且版本低于17.4，可能存在切后台声音消失的问题';
		if (version && version[1] >= 17.4);
		else msgHandler.sendWarning(text);
	}
	if (!await loadPlugin('ImageBitmap兼容', urls.bitmap, () => isUndefined('createImageBitmap'))) return -1;
	if (!await loadPlugin('StackBlur', urls.blur, () => isUndefined('StackBlur'))) return -2;
	if (!await loadPlugin('md5', urls.md5, () => isUndefined('md5'))) return -3;
	msgHandler.sendMessage('加载声音组件...');
	const oggCompatible = !!(new Audio).canPlayType('audio/ogg');
	if (!await loadPlugin('ogg格式兼容', '/lib/oggmented-bundle.js', () => !oggCompatible && isUndefined('oggmented'))) return -4;
	audio.init(oggCompatible ? self.AudioContext || self.webkitAudioContext : oggmented.OggmentedAudioContext); //兼容Safari
	const orientSupported = await orientation.checkSupport();
	if (!orientSupported) {
		$('lockOri').checked = false;
		$('lockOri').parentElement.classList.add('disabled');
	}
}
//qwq
selectbg.onchange = () => {
	app.bgImage = bgs.get(selectbg.value);
	app.bgImageBlur = bgsBlur.get(selectbg.value);
	stage.resize();
}
//自动填写歌曲信息
selectchart.addEventListener('change', adjustInfo);

function adjustInfo() {
	for (const i of chartInfoData) {
		if (selectchart.value === i.Chart) {
			if (i.Name) inputName.value = i.Name;
			if (i.Musician) inputArtist.value = i.Musician; //Alternative
			if (i.Composer) inputArtist.value = i.Composer; //Alternative
			if (i.Artist) inputArtist.value = i.Artist;
			if (i.Level) {
				levelText = i.Level;
				const p = levelText.toLocaleUpperCase().split('LV.').map(a => a.trim());
				if (p[0]) selectDifficulty.value = p[0];
				if (p[1]) selectLevel.value = p[1];
			}
			if (i.Illustrator) inputIllustrator.value = i.Illustrator;
			if (i.Designer) inputCharter.value = i.Designer;
			if (i.Charter) inputCharter.value = i.Charter;
			if (bgms.has(i.Music)) selectbgm.value = i.Music;
			if (bgs.has(i.Image)) {
				selectbg.value = i.Image;
				selectbg.dispatchEvent(new Event('change'));
			}
			if (isFinite(i.AspectRatio = parseFloat(i.AspectRatio))) {
				$('select-aspect-ratio').value = i.AspectRatio;
				stage.resize(i.AspectRatio); //qwq
			}
			if (isFinite(i.ScaleRatio = parseFloat(i.ScaleRatio))) { //Legacy
				$('select-note-scale').value = 8080 / i.ScaleRatio;
				app.setNoteScale(8080 / i.ScaleRatio);
			}
			if (isFinite(i.NoteScale = parseFloat(i.NoteScale))) {
				$('select-note-scale').value = i.NoteScale;
				app.setNoteScale(i.NoteScale);
			}
			if (isFinite(i.GlobalAlpha = parseFloat(i.GlobalAlpha))) { //Legacy
				$('select-background-dim').value = i.GlobalAlpha;
				app.brightness = Number(i.GlobalAlpha);
			}
			if (isFinite(i.BackgroundDim = parseFloat(i.BackgroundDim))) {
				$('select-background-dim').value = i.BackgroundDim;
				app.brightness = Number(i.BackgroundDim);
			}
			if (isFinite(i.Offset = parseFloat(i.Offset))) inputOffset.value = i.Offset;
		}
	}
}
const stage = {
	aspectRatio: 0,
	resize(ratio) {
		if (ratio) this.aspectRatio = Number(ratio) || 16 / 9;
		const stageWidth = Math.min(854, document.documentElement.clientWidth * 0.8);
		const stageHeight = stageWidth / this.aspectRatio;
		if (app.isFull) app.stage.style.cssText = ';position:fixed;top:0;left:0;bottom:0;right:0';
		else app.stage.style.cssText = `;width:${stageWidth.toFixed()}px;height:${stageHeight.toFixed()}px`;
	}
};
stage.resize(1.777778); //qwq
self.addEventListener('resize', () => stage.resize());
//uploader
{
	let uploader_done = 0;
	let uploader_total = 0;
	$('uploader-upload').addEventListener('click', uploader.uploadFile);
	$('uploader-file').addEventListener('click', uploader.uploadFile);
	$('uploader-dir').addEventListener('click', uploader.uploadDir);
	/** @type {((_:FileList) => void)} */
	uploader.onchange = e => {
		console.log(e.length);
		if (e.length) $('uploader').classList.add('disabled');
	}
	/** @type {((_:ProgressEvent<FileReader>,_:File) => void)} */
	uploader.onprogress = function(evt, i) { //显示加载文件进度
		msgHandler.sendMessage(`加载文件：${Math.floor(evt.loaded / evt.total * 100)}%`);
	};
	/** @type {((_:ProgressEvent<FileReader>,_:File) => void)} */
	uploader.onload = function(evt, i) {
		console.log(evt);
		readZip({
			name: i.name,
			buffer: evt.target.result,
			path: i.webkitRelativePath || i.name
		}, {
			createAudioBuffer() { return audio.decode(...arguments) },
			onloadstart: () => msgHandler.sendMessage('加载zip组件...'),
			onread: handleFile,
		});
	}
	/** 
	 * @param {ReaderData} data 
	 * @param {number} total
	 */
	async function handleFile(data, total) {
		uploader_total = total;
		console.log(data);
		switch (data.type) {
			case 'line':
				chartLineData.push(...data.data);
				break;
			case 'info':
				chartInfoData.push(...data.data);
				break;
			case 'media':
				bgms.set(data.name, data.data);
				selectbgm.appendChild(createOption(data.name, data.name));
				break;
			case 'audio':
				bgms.set(data.name, data.data);
				selectbgm.appendChild(createOption(data.name, data.name));
				break;
			case 'image':
				bgs.set(data.name, data.data);
				bgsBlur.set(data.name, await imgBlur(data.data));
				selectbg.appendChild(createOption(data.name, data.name));
				break;
			case 'chart':
				if (data.msg) data.msg.forEach(v => msgHandler.sendWarning(v));
				if (data.info) chartInfoData.push(data.info);
				if (data.line) chartLineData.push(...data.line);
				charts.set(data.name, data.data);
				chartsMD5.set(data.name, data.md5);
				selectchart.appendChild(createOption(data.name, data.name));
				break;
			default:
				console.error(data.data);
				msgHandler.sendWarning(`不支持的文件：${data.name}`);
		}
		msgHandler.sendMessage(`读取文件：${++uploader_done}/${uploader_total}`);
		if (uploader_done !== uploader_total) return;
		$('uploader').classList.remove('disabled');
		adjustInfo();
		/**
		 * @param {string} innerhtml 
		 * @param {string} value 
		 */
		function createOption(innerhtml, value) {
			const option = document.createElement('option');
			const isHidden = /(^|\/)\./.test(innerhtml);
			option.innerHTML = isHidden ? '' : innerhtml;
			option.value = value;
			if (isHidden) option.classList.add('hide');
			return option;
		}
	}
}
//qwq[water,demo,democlick]
const qwq = [true, false, 3, 0, 0, 0];
eval(atob('IWZ1bmN0aW9uKCl7Y29uc3QgdD1uZXcgRGF0ZTtpZigxIT10LmdldERhdGUoKXx8MyE9dC5nZXRNb250aCgpKXJldHVybjtjb25zdCBuPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoInNjcmlwdCIpO24udHlwZT0idGV4dC9qYXZhc2NyaXB0IixuLnNyYz0iLi9yLW1pbi5qcyIsZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoImhlYWQiKVswXS5hcHBlbmRDaGlsZChuKX0oKTs'));
$$('.title').addEventListener('click', function() {
	if (!--qwq[2]) $((new URLSearchParams(location.search)).has('test') ? 'demo' : 'legacy').classList.remove('hide');
});
$('demo').addEventListener('click', function(evt) {
	evt.target.classList.add('hide');
	const qwq = img => uploader.onload({ target: decode(img) }, { name: 'demo.zip' });
	const xhr = new XMLHttpRequest();
	xhr.open('get', 'src/demo.webp', true); //避免gitee的404
	xhr.responseType = 'blob';
	xhr.onprogress = evt => uploader.onprogress(evt);
	xhr.onload = () => createImageBitmap(xhr.response).then(qwq);
	xhr.send();

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
});
//qwq end
const exitFull = () => {
	document.removeEventListener(full.onchange, exitFull);
	hitManager.clear('keyboard'); //esc退出全屏只有onchange事件能检测到
	app.isFull = full.check();
	stage.resize();
}
//hit start
const specialClick = {
	time: [0, 0, 0, 0],
	func: [() => {
		btnPause.click();
	}, () => {
		btnPlay.click();
		btnPlay.click();
	}, () => {
		showStat.click();
	}, async () => {
		const isFull = app.isFull;
		try {
			await full.toggle();
			if (!(app.isFull = full.check())) return;
			document.addEventListener(full.onchange, exitFull);
			if (!$('lockOri').checked) return;
			await orientation.lockLandscape();
		} catch (e) {
			console.warn(e); //qwq
			app.isFull = !isFull;
		} finally {
			stage.resize();
		}
	}],
	click(id) {
		const now = performance.now();
		if (now - this.time[id] < 300) this.func[id]();
		this.time[id] = now;
	},
	qwq(offsetX, offsetY) {
		const { lineScale } = app;
		if (offsetX < lineScale * 1.5 && offsetY < lineScale * 1.5) this.click(0);
		if (offsetX > canvasos.width - lineScale * 1.5 && offsetY < lineScale * 1.5) this.click(1);
		if (offsetX < lineScale * 1.5 && offsetY > canvasos.height - lineScale * 1.5) this.click(2);
		if (offsetX > canvasos.width - lineScale * 1.5 && offsetY > canvasos.height - lineScale * 1.5) this.click(3);
		if (qwqEnd.second > 0) qwq[3] = qwq[3] > 0 ? -qwqEnd.second : qwqEnd.second;
	}
}
const hitManager = new simphi.HitManager();
class JudgeEvent {
	constructor(offsetX, offsetY, type, event) {
		this.offsetX = offsetX;
		this.offsetY = offsetY;
		this.type = type | 0; //1-Tap,2-Hold/Drag,3-Move
		this.judged = false; //是否被判定
		this.event = event; //flick专用回调
		this.preventBad = false; //是否阻止判定为Bad
	}
}
/**
 * 判定和音符的水平距离
 * @param {JudgeEvent} judgeEvent 
 * @param {Note} note 
 */
function getJudgeOffset(judgeEvent, note) {
	const { offsetX, offsetY } = judgeEvent;
	const { offsetX: x, offsetY: y, cosr, sinr } = note;
	return Math.abs((offsetX - x) * cosr + (offsetY - y) * sinr) || 0;
}
/**
 * 判定和音符的曼哈顿距离
 * @param {JudgeEvent} judgeEvent
 * @param {Note} note
 */
function getJudgeDistance(judgeEvent, note) {
	const { offsetX, offsetY } = judgeEvent;
	const { offsetX: x, offsetY: y, cosr, sinr } = note;
	return Math.abs((offsetX - x) * cosr + (offsetY - y) * sinr) + Math.abs((offsetX - x) * sinr - (offsetY - y) * cosr) || 0;
}
const judgeManager = {
	/**@type {JudgeEvent[]} */
	list: [],
	addEvent(notes, realTime) {
		const { list } = this;
		list.length = 0;
		if (app.playMode === 1) {
			const dispTime = Math.min(frameTimer.disp, 0.04);
			for (const i of notes) {
				if (i.scored) continue;
				const deltaTime = i.realTime - realTime;
				if (i.type === 1) {
					if (deltaTime < dispTime) list[list.length] = new JudgeEvent(i.offsetX, i.offsetY, 1);
				} else if (i.type === 2) {
					if (deltaTime < dispTime) list[list.length] = new JudgeEvent(i.offsetX, i.offsetY, 2);
				} else if (i.type === 3) {
					if (i.holdTapTime) list[list.length] = new JudgeEvent(i.offsetX, i.offsetY, 2);
					else if (deltaTime < dispTime) list[list.length] = new JudgeEvent(i.offsetX, i.offsetY, 1);
				} else if (i.type === 4) {
					if (deltaTime < dispTime) list[list.length] = new JudgeEvent(i.offsetX, i.offsetY, 3);
				}
			}
		} else if (!isPaused) {
			for (const i of hitManager.list) {
				if (!i.isTapped) list[list.length] = new JudgeEvent(i.offsetX, i.offsetY, 1);
				if (i.isActive) list[list.length] = new JudgeEvent(i.offsetX, i.offsetY, 2);
				if (i.type === 'keyboard') list[list.length] = new JudgeEvent(i.offsetX, i.offsetY, 3); //以后加上Flick判断
				if (i.flicking && !i.flicked) {
					list[list.length] = new JudgeEvent(i.offsetX, i.offsetY, 3, i);
					// i.flicked = true; 不能在这里判断，因为可能会判定不到
				}
			}
		}
	},
	/**
	 * 以后扩充Note定义
	 * @param {Note[]} notes
	 * @param {number} realTime
	 * @param {number} width
	 */
	execute(notes, realTime, width) {
		const { list } = this;
		for (const note of notes) {
			if (note.scored) continue; //跳过已判分的Note
			const deltaTime = note.realTime - realTime;
			if (deltaTime > 0.2) break; //跳过判定范围外的Note
			if (note.type !== 1 && deltaTime > 0.16) continue;
			if ((deltaTime < -0.16 && note.frameCount > 4) && !note.holdStatus) { //超时且不为Hold拖判，判为Miss
				// console.log('Miss', i.name);
				note.status = 2;
				stat.addCombo(2, note.type);
				note.scored = true;
			} else if (note.type === 2) { //Drag音符
				if (deltaTime > 0) {
					for (const judgeEvent of list) {
						if (judgeEvent.type !== 1) continue; //跳过非Tap判定
						if (getJudgeOffset(judgeEvent, note) > width) continue;
						judgeEvent.preventBad = true;
					}
				}
				if (note.status !== 4) {
					for (const judgeEvent of list) {
						if (judgeEvent.type !== 2) continue; //跳过非Drag判定
						if (getJudgeOffset(judgeEvent, note) > width) continue;
						// console.log('Perfect', i.name);
						note.status = 4;
						break;
					}
				} else if (deltaTime < 0) {
					audio.play(res['HitSong1'], { gainrate: app.soundVolume });
					hitEvents1.add(HitEvent1.perfect(note.projectX, note.projectY));
					stat.addCombo(4, 2);
					note.scored = true;
				}
			} else if (note.type === 4) { //Flick音符
				if (deltaTime > 0 || note.status !== 4) {
					for (const judgeEvent of list) {
						if (judgeEvent.type !== 1) continue; //跳过非Tap判定
						if (getJudgeOffset(judgeEvent, note) > width) continue;
						judgeEvent.preventBad = true;
					}
				}
				if (note.status !== 4) {
					for (const judgeEvent of list) {
						if (judgeEvent.type !== 3) continue; //跳过非Move判定
						if (getJudgeOffset(judgeEvent, note) > width) continue;
						let distance = getJudgeDistance(judgeEvent, note);
						let noteJudge = note;
						let nearcomp = false;
						for (const nearNote of note.nearNotes) {
							if (nearNote.status) continue;
							if (nearNote.realTime - realTime > 0.16) break;
							if (getJudgeOffset(judgeEvent, nearNote) > width) continue;
							const nearDistance = getJudgeDistance(judgeEvent, nearNote);
							if (nearDistance < distance) {
								distance = nearDistance;
								noteJudge = nearNote;
								nearcomp = true;
							}
						}
						//console.log('Perfect', i.name);
						if (!judgeEvent.event) {
							noteJudge.status = 4;
							if (!nearcomp) break;
						} else if (!judgeEvent.event.flicked) {
							noteJudge.status = 4;
							judgeEvent.event.flicked = true;
							if (!nearcomp) break;
						}
					}
				} else if (deltaTime < 0) {
					audio.play(res['HitSong2'], { gainrate: app.soundVolume });
					hitEvents1.add(HitEvent1.perfect(note.projectX, note.projectY));
					stat.addCombo(4, 4);
					note.scored = true;
				}
			} else { //Hold音符
				if (note.type === 3 && note.holdTapTime) { //是否触发头判
					if ((performance.now() - note.holdTapTime) * note.holdTime >= 1.6e4 * note.realHoldTime) { //间隔时间与bpm成反比
						if (note.holdStatus % 4 === 0) hitEvents1.add(HitEvent1.perfect(note.projectX, note.projectY));
						else if (note.holdStatus % 4 === 1) hitEvents1.add(HitEvent1.perfect(note.projectX, note.projectY));
						else if (note.holdStatus % 4 === 3) hitEvents1.add(HitEvent1.good(note.projectX, note.projectY));
						note.holdTapTime = performance.now();
					}
					if (deltaTime + note.realHoldTime < 0.2) {
						if (!note.status) stat.addCombo(note.status = note.holdStatus, 3);
						if (deltaTime + note.realHoldTime < 0) note.scored = true;
						continue;
					}
					note.holdBroken = true; //若1帧内未按住并使其转为false，则判定为Miss
				}
				for (const judgeEvent of list) {
					if (note.holdTapTime) { //头判
						if (judgeEvent.type !== 2) continue;
						if (getJudgeOffset(judgeEvent, note) <= width) {
							note.holdBroken = false;
							break;
						}
						continue;
					}
					if (judgeEvent.type !== 1) continue; //跳过非Tap判定
					if (judgeEvent.judged) continue; //跳过已触发的判定
					if (getJudgeOffset(judgeEvent, note) > width) continue;
					let deltaTime2 = deltaTime;
					let distance = getJudgeDistance(judgeEvent, note);
					let noteJudge = note;
					let nearcomp = false;
					for (const nearNote of note.nearNotes) {
						if (nearNote.status) continue;
						if (nearNote.holdTapTime) continue;
						const nearDeltaTime = nearNote.realTime - realTime;
						if (nearDeltaTime > 0.2) break;
						if (nearNote.type === 3 && nearDeltaTime > 0.16) continue;
						if (getJudgeOffset(judgeEvent, nearNote) > width) continue;
						const nearDistance = getJudgeDistance(judgeEvent, nearNote);
						if (nearDistance < distance) {
							deltaTime2 = nearDeltaTime;
							distance = nearDistance;
							noteJudge = nearNote;
							nearcomp = true;
						}
					}
					if (deltaTime2 > 0.16) {
						if (judgeEvent.preventBad) continue;
						noteJudge.status = 6; //console.log('Bad', i.name);
						noteJudge.badtime = performance.now();
					} else {
						stat.addDisp(Math.max(deltaTime2, (-1 - noteJudge.frameCount) * 0.04 || 0));
						audio.play(res['HitSong0'], { gainrate: app.soundVolume });
						if (deltaTime2 > 0.08) {
							noteJudge.holdStatus = 7; //console.log('Good(Early)', i.name);
							hitEvents1.add(HitEvent1.good(noteJudge.projectX, noteJudge.projectY));
							hitEvents2.add(HitEvent2.early(noteJudge.projectX, noteJudge.projectY));
						} else if (deltaTime2 > 0.04) {
							noteJudge.holdStatus = 5; //console.log('Perfect(Early)', i.name);
							hitEvents1.add(HitEvent1.perfect(noteJudge.projectX, noteJudge.projectY));
							hitEvents2.add(HitEvent2.early(noteJudge.projectX, noteJudge.projectY));
						} else if (deltaTime2 > -0.04 || noteJudge.frameCount < 1) {
							noteJudge.holdStatus = 4; //console.log('Perfect(Max)', i.name);
							hitEvents1.add(HitEvent1.perfect(noteJudge.projectX, noteJudge.projectY));
						} else if (deltaTime2 > -0.08 || noteJudge.frameCount < 2) {
							noteJudge.holdStatus = 1; //console.log('Perfect(Late)', i.name);
							hitEvents1.add(HitEvent1.perfect(noteJudge.projectX, noteJudge.projectY));
							hitEvents2.add(HitEvent2.late(noteJudge.projectX, noteJudge.projectY));
						} else {
							noteJudge.holdStatus = 3; //console.log('Good(Late)', i.name);
							hitEvents1.add(HitEvent1.good(noteJudge.projectX, noteJudge.projectY));
							hitEvents2.add(HitEvent2.late(noteJudge.projectX, noteJudge.projectY));
						}
						if (noteJudge.type === 1) noteJudge.status = noteJudge.holdStatus;
					}
					if (noteJudge.status) {
						stat.addCombo(noteJudge.status, 1);
						noteJudge.scored = true;
					} else {
						noteJudge.holdTapTime = performance.now();
						noteJudge.holdBroken = false;
					}
					judgeEvent.judged = true;
					noteJudge.statOffset = deltaTime2; //qwq也许是统计偏移量？
					if (!nearcomp) break;
				}
				if (!isPaused && note.holdTapTime && note.holdBroken) {
					note.status = 2; //console.log('Miss', i.name);
					stat.addCombo(2, 3);
					note.scored = true;
				}
			}
		}
	}
};
class HitEvents extends Array {
	constructor({ updateCallback, iterateCallback } = {}) {
		super();
		this.update = this.defilter.bind(this, updateCallback);
		this.animate = this.iterate.bind(this, iterateCallback);
	}
	/**	@param {(value)=>boolean} predicate */
	defilter(predicate) {
		let i = this.length;
		while (i--) predicate(this[i]) && this.splice(i, 1);
		return this;
	}
	/**	@param {(item)=>any} callback */
	iterate(callback) {
		for (const i of this) callback(i); //qwq
	}
	add(value) {
		this[this.length] = value;
	}
	clear() {
		this.length = 0;
	}
}
const hitEvents0 = new HitEvents({ //存放点击特效
	updateCallback: i => ++i.time > 0,
	iterateCallback: i => {
		ctxos.globalAlpha = 0.85;
		ctxos.setTransform(1, 0, 0, 1, i.offsetX, i.offsetY); //缩放
		ctxos.fillStyle = i.color;
		ctxos.beginPath();
		ctxos.arc(0, 0, app.lineScale * 0.5, 0, 2 * Math.PI);
		ctxos.fill();
	}
});
const hitEvents1 = new HitEvents({ //存放点击特效
	updateCallback: i => nowTime_ms >= i.time + i.duration,
	iterateCallback: i => {
		const tick = (nowTime_ms - i.time) / i.duration;
		ctxos.globalAlpha = 1;
		ctxos.setTransform(app.noteScaleRatio * 6, 0, 0, app.noteScaleRatio * 6, i.offsetX, i.offsetY); //缩放
		ctxos.drawImage(i.images[parseInt(tick * 30)] || i.images[i.images.length - 1], -128, -128); //停留约0.5秒
		ctxos.fillStyle = i.color;
		ctxos.globalAlpha = 1 - tick; //不透明度
		const r3 = 30 * (((0.2078 * tick - 1.6524) * tick + 1.6399) * tick + 0.4988); //方块大小
		for (const j of i.rand) {
			const ds = j[0] * (9 * tick / (8 * tick + 1)); //打击点距离
			ctxos.fillRect(ds * Math.cos(j[1]) - r3 / 2, ds * Math.sin(j[1]) - r3 / 2, r3, r3);
		}
	}
});
const hitEvents2 = new HitEvents({ //存放点击特效
	updateCallback: i => nowTime_ms >= i.time + i.duration,
	iterateCallback: i => {
		const tick = (nowTime_ms - i.time) / i.duration;
		ctxos.setTransform(1, 0, 0, 1, i.offsetX, i.offsetY); //缩放
		ctxos.font = `bold ${app.noteScaleRatio * (256 + 128 * (((0.2078 * tick - 1.6524) * tick + 1.6399) * tick + 0.4988))}px Custom,Noto Sans SC`;
		ctxos.textAlign = 'center';
		ctxos.fillStyle = i.color;
		ctxos.globalAlpha = 1 - tick; //不透明度
		ctxos.fillText(i.text, 0, -app.noteScaleRatio * 128);
	}
});
class HitEvent0 {
	constructor(offsetX, offsetY, n1, n2) {
		this.offsetX = Number(offsetX);
		this.offsetY = Number(offsetY);
		this.color = String(n1);
		this.text = String(n2);
		this.time = 0;
	}
	static tap(offsetX, offsetY) {
		//console.log('Tap', offsetX, offsetY);
		return new HitEvent0(offsetX, offsetY, 'cyan', '');
	}
	static hold(offsetX, offsetY) {
		//console.log('Hold', offsetX, offsetY);
		return new HitEvent0(offsetX, offsetY, 'lime', '');
	}
	static move(offsetX, offsetY) {
		//console.log('Move', offsetX, offsetY);
		return new HitEvent0(offsetX, offsetY, 'violet', '');
	}
}
class HitEvent1 {
	constructor(offsetX, offsetY, n1, n2, n3) {
		this.offsetX = Number(offsetX) || 0;
		this.offsetY = Number(offsetY) || 0;
		this.time = performance.now();
		this.duration = 500;
		this.images = res['HitFX'][n1]; //以后做缺少检测
		this.color = String(n3);
		this.rand = Array(Number(n2) || 0).fill().map(() => [Math.random() * 80 + 185, Math.random() * 2 * Math.PI]);
	}
	static perfect(offsetX, offsetY) {
		return new HitEvent1(offsetX, offsetY, 'rgba(255,236,160,0.8823529)', 4, '#ffeca0');
	}
	static good(offsetX, offsetY) {
		return new HitEvent1(offsetX, offsetY, 'rgba(180,225,255,0.9215686)', 3, '#b4e1ff');
	}
}
class HitEvent2 {
	constructor(offsetX, offsetY, n1, n2) {
		this.offsetX = Number(offsetX) || 0;
		this.offsetY = Number(offsetY) || 0;
		this.time = performance.now();
		this.duration = 250;
		this.color = String(n1);
		this.text = String(n2);
	}
	static early(offsetX, offsetY) {
		//console.log('Tap', offsetX, offsetY);
		return new HitEvent2(offsetX, offsetY, '#03aaf9', 'Early');
	}
	static late(offsetX, offsetY) {
		//console.log('Hold', offsetX, offsetY);
		return new HitEvent2(offsetX, offsetY, '#ff4612', 'Late');
	}
}
const interact = new InterAct(canvas);
//适配PC鼠标
interact.setMouseEvent({
	mousedownCallback(evt) {
		const idx = evt.button;
		const { x, y } = getPos(evt);
		if (idx === 1) hitManager.activate('mouse', 4, x, y);
		else if (idx === 2) hitManager.activate('mouse', 2, x, y);
		else hitManager.activate('mouse', 1 << idx, x, y);
		specialClick.qwq(x, y);
	},
	mousemoveCallback(evt) {
		const idx = evt.buttons;
		const { x, y } = getPos(evt);
		for (let i = 1; i < 32; i <<= 1) {
			// 同时按住多个键时，只有最后一个键的move事件会触发
			if (idx & i) hitManager.moving('mouse', i, x, y);
			else hitManager.deactivate('mouse', i);
		}
	},
	mouseupCallback(evt) {
		const idx = evt.button;
		if (idx === 1) hitManager.deactivate('mouse', 4);
		else if (idx === 2) hitManager.deactivate('mouse', 2);
		else hitManager.deactivate('mouse', 1 << idx);
	}
});
//适配键盘(喵喵喵?)
interact.setKeyboardEvent({
	keydownCallback(evt) {
		if (btnPlay.value !== '停止') return;
		if (evt.key === 'Shift') btnPause.click();
		else if (hitManager.list.find(i => i.type === 'keyboard' && i.id === evt.code)); //按住一个键时，会触发多次keydown事件
		else hitManager.activate('keyboard', evt.code, NaN, NaN);
	},
	keyupCallback(evt) {
		if (btnPlay.value !== '停止') return;
		if (evt.key !== 'Shift') hitManager.deactivate('keyboard', evt.code);
	}
});
self.addEventListener('blur', () => hitManager.clear('keyboard'));
//适配移动设备
interact.setTouchEvent({
	touchstartCallback(evt) {
		for (const i of evt.changedTouches) {
			const { x, y } = getPos(i);
			hitManager.activate('touch', i.identifier, x, y);
			specialClick.qwq(x, y);
		}
	},
	touchmoveCallback(evt) {
		for (const i of evt.changedTouches) {
			const { x, y } = getPos(i);
			hitManager.moving('touch', i.identifier, x, y);
		}
	},
	touchendCallback(evt) {
		for (const i of evt.changedTouches) {
			hitManager.deactivate('touch', i.identifier);
		}
	},
	touchcancelCallback(evt) {
		// if (!isPaused) btnPause.click();
		for (const i of evt.changedTouches) {
			hitManager.deactivate('touch', i.identifier);
		}
	}
});
/** @param {MouseEvent|Touch} obj */
function getPos(obj) {
	const rect = canvas.getBoundingClientRect();
	return {
		x: (obj.clientX - rect.left) / canvas.offsetWidth * canvas.width - (canvas.width - canvasos.width) / 2,
		y: (obj.clientY - rect.top) / canvas.offsetHeight * canvas.height
	};
}
//hit end
const res = {}; //存放资源
//初始化
document.addEventListener('DOMContentLoaded', async function qwq() {
	document.removeEventListener('DOMContentLoaded', qwq);
	canvas.classList.add('fade');
	let loadedNum = 0;
	let errorNum = 0;
	msgHandler.sendMessage('初始化...');
	if (await checkSupport()) return;
	const res0 = {};
	const raw = await fetch(atob('aHR0cHM6Ly9sY2h6aC5uZXQvZGF0YS9wYWNrLmpzb24=')).then(i => i.json());
	for (const j in raw.image || {}) res0[j] = raw.image[j];
	for (const j in raw.audio || {}) res0[j] = raw.audio[j];
	//加载资源
	await Promise.all(Object.entries(res0).map(([name, src], _i, arr) => new Promise(resolve => {
		const [url, ext] = src.split('|');
		fetch(url, { referrerPolicy: 'no-referrer' }).then(a => a.blob()).then(async blob => {
			const img = await createImageBitmap(blob);
			if (ext && ext[0] === 'm') {
				const data = decode(img, Number(ext.slice(1))).result;
				// 小米浏览器出现问题：decode出来的数据部分被有损压缩导致资源加载失败
				res[name] = await audio.decode(data).catch(async err => {
					const blob = await fetch(raw.alternative[name], { referrerPolicy: 'no-referrer' }).then(i => i.blob());
					return await createImageBitmap(blob).then(decodeAlt).then(audio.decode.bind(audio)).catch(err => {
						msgHandler.sendWarning(`您的浏览器存在问题，将导致以下音频无法正常播放：\n${name}(${err.message})\n如果多次刷新问题仍然存在，建议更换设备或浏览器。`);
						return audio.mute(1);
					});

					function decodeAlt(img) {
						const canvas = document.createElement('canvas');
						canvas.width = img.width;
						canvas.height = img.height;
						const ctx = canvas.getContext('2d');
						ctx.drawImage(img, 0, 0);
						const id = ctx.getImageData(0, 0, canvas.width, canvas.height);
						const ab = new Uint8Array(id.data.length / 4 * 3);
						const mask = (v, i) => v ^ (i ** 2 * 3473) & 255;
						for (let i = 0; i < ab.length; i++) ab[i] = id.data[((i / 3) | 0) * 4 + i % 3];
						const combined = new Uint8Array(ab.length / 2);
						for (let i = 0; i < ab.length / 2; i++) {
							combined[i] = mask((ab[i * 2] + 8) / 17 << 4 | (ab[i * 2 + 1] + 8) / 17, i);
						}
						const size = new DataView(combined.buffer, 0, 4).getUint32(0);
						return combined.buffer.slice(4, size + 4);
					}
				});
			} else {
				res[name] = await createImageBitmap(img, 0, 0, img.width, img.height /* , { imageOrientation: 'flipY' } */ );
			}
			msgHandler.sendMessage(`加载资源：${Math.floor(++loadedNum / arr.length * 100)}%`);
		}).catch(err => {
			console.error(err);
			msgHandler.sendError(`错误：${++errorNum}个资源加载失败（点击查看详情）`, `资源加载失败，请检查您的网络连接然后重试：\n${new URL(url,location)}`, true);
		}).finally(resolve);
	})));
	if (errorNum) return msgHandler.sendError(`错误：${errorNum}个资源加载失败（点击查看详情）`);
	res['NoImageBlack'] = await createImageBitmap(new ImageData(new Uint8ClampedArray(4).fill(0), 1, 1));
	res['NoImageWhite'] = await createImageBitmap(new ImageData(new Uint8ClampedArray(4).fill(255), 1, 1));
	res['JudgeLineMP'] = await imgShader(res['JudgeLine'], '#feffa9');
	res['JudgeLineFC'] = await imgShader(res['JudgeLine'], '#a2eeff');
	res['TapBad'] = await imgPainter(res['Tap'], '#6c4343');
	res['Ranks'] = await imgSplit(res['Rank']);
	res['Rank'].close();
	const hitRaw = await imgSplit(res['HitFXRaw']);
	res['HitFXRaw'].close();
	res['HitFX'] = {};
	res['HitFX']['rgba(255,236,160,0.8823529)'] = await Promise.all(hitRaw.map(img => imgShader(img, 'rgba(255,236,160,0.8823529)'))); //#fce491
	res['HitFX']['rgba(180,225,255,0.9215686)'] = await Promise.all(hitRaw.map(img => imgShader(img, 'rgba(180,225,255,0.9215686)'))); //#9ed5f3
	hitRaw.forEach(img => img.close());
	res['mute'] = audio.mute(1);
	if (!(() => {
			const b = document.createElement('canvas').getContext('2d');
			b.drawImage(res['JudgeLine'], 0, 0);
			return b.getImageData(0, 0, 1, 1).data[0];
		})()) return msgHandler.sendError('检测到图片加载异常，请关闭所有应用程序然后重试');
	msgHandler.sendMessage('等待上传文件...');
	$('uploader').classList.remove('disabled');
	$('select').classList.remove('disabled');
	btnPause.classList.add('disabled');

	function decode(img, clip = 0) {
		const canvas = document.createElement('canvas');
		canvas.width = img.width - clip * 2;
		canvas.height = img.height - clip * 2;
		const ctx = canvas.getContext('2d');
		ctx.drawImage(img, -clip, -clip);
		const id = ctx.getImageData(0, 0, canvas.width, canvas.width);
		const ab = new Uint8Array(id.data.length / 4 * 3);
		for (let i = 0; i < ab.length; i++) ab[i] = id.data[((i / 3) | 0) * 4 + i % 3] ^ (i * 3473);
		const size = new DataView(ab.buffer, 0, 4).getUint32(0);
		return { result: ab.buffer.slice(4, size + 4) };
	}
});
//必要组件
let stopDrawing = 0;
let nowTime_ms = 0; //当前绝对时间(ms)
let curTime = 0; //最近一次暂停的音乐时间(s)
let curTime_ms = 0; //最近一次播放的绝对时间(ms)
let timeBgm = 0; //当前音乐时间(s)
let timeChart = 0; //当前谱面时间(s)
let duration = 0; //音乐时长(s)
let isInEnd = false; //开头过渡动画
let isOutStart = false; //结尾过渡动画
let isOutEnd = false; //临时变量
let isPaused = true; //暂停
document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && btnPause.value === '暂停' && btnPause.click());
document.addEventListener('pagehide', () => document.visibilityState === 'hidden' && btnPause.value === '暂停' && btnPause.click()); //兼容Safari
const qwqIn = new Timer();
const qwqOut = new Timer();
const qwqEnd = new Timer();
//play
btnPlay.addEventListener('click', async function() {
	btnPause.value = '暂停';
	if (this.value === '播放') {
		if (!selectchart.value) return msgHandler.sendError('错误：未选择任何谱面');
		if (!selectbgm.value) return msgHandler.sendError('错误：未选择任何音乐');
		audio.play(res['mute'], { loop: true, isOut: false }); //播放空音频(防止音画不同步)
		app.prerenderChart(charts.get(selectchart.value)); //fuckqwq
		app.md5 = chartsMD5.get(selectchart.value);
		stat.level = Number(levelText.match(/\d+$/));
		stat.reset(app.chart.numOfNotes, app.md5, selectspeed.value);
		for (const i of app.lines) {
			i.imageW = 6220.8; //1920
			i.imageH = 7.68; //3
			i.imageL = [res['JudgeLine'], res['JudgeLineMP'], null, res['JudgeLineFC']];
			i.imageS = 1; //2.56
			i.imageA = 1; //1.5625
			i.imageD = false;
			i.imageC = true;
			i.imageU = true;
		}
		for (const i of chartLineData) {
			if (selectchart.value === i.Chart) {
				if (!app.lines[i.LineId]) { msgHandler.sendWarning(`指定id的判定线不存在：${i.LineId}`); continue; }
				if (!bgs.has(i.Image)) msgHandler.sendWarning(`图片不存在：${i.Image}`);
				/** @type {ImageBitmap} */
				const image = bgs.get(i.Image) || res['NoImageBlack'];
				app.lines[i.LineId].imageW = image.width;
				app.lines[i.LineId].imageH = image.height;
				if (!lineImages.has(image)) lineImages.set(image, new LineImage(image));
				const lineImage = lineImages.get(image);
				app.lines[i.LineId].imageL = [image, await lineImage.getMP(), await lineImage.getAP(), await lineImage.getFC()];
				if (isFinite(i.Vert = parseFloat(i.Vert))) { //Legacy
					app.lines[i.LineId].imageS = Math.abs(i.Vert) * 1080 / image.height;
					app.lines[i.LineId].imageU = i.Vert > 0;
				}
				if (isFinite(i.Horz = parseFloat(i.Horz))) app.lines[i.LineId].imageA = i.Horz; //Legacy
				if (isFinite(i.IsDark = parseFloat(i.IsDark))) app.lines[i.LineId].imageD = !!i.IsDark; //Legacy
				if (isFinite(i.Scale = parseFloat(i.Scale))) app.lines[i.LineId].imageS = i.Scale;
				if (isFinite(i.Aspect = parseFloat(i.Aspect))) app.lines[i.LineId].imageA = i.Aspect;
				if (isFinite(i.UseBackgroundDim = parseFloat(i.UseBackgroundDim))) app.lines[i.LineId].imageD = !!i.UseBackgroundDim;
				if (isFinite(i.UseLineColor = parseFloat(i.UseLineColor))) app.lines[i.LineId].imageC = !!i.UseLineColor;
				if (isFinite(i.UseLineScale = parseFloat(i.UseLineScale))) app.lines[i.LineId].imageU = !!i.UseLineScale;
			}
		}
		app.bgImage = bgs.get(selectbg.value) || res['NoImageWhite'];
		app.bgImageBlur = bgsBlur.get(selectbg.value) || res['NoImageWhite'];
		const bgm = bgms.get(selectbgm.value);
		app.bgMusic = bgm.audio;
		app.bgVideo = bgm.video;
		this.value = '停止';
		duration = app.bgMusic.duration / app.speed;
		isInEnd = false;
		isOutStart = false;
		isOutEnd = false;
		isPaused = false;
		timeBgm = 0;
		if (!showTransition.checked) qwqIn.addTime(3000);
		canvas.classList.remove('fade');
		$('mask').classList.add('fade');
		btnPause.classList.remove('disabled');
		for (const i of $$$('.disabled-when-playing')) i.classList.add('disabled');
		loop();
		qwqIn.play();
	} else {
		audio.stop();
		cancelAnimationFrame(stopDrawing);
		canvas.classList.add('fade');
		$('mask').classList.remove('fade');
		for (const i of $$$('.disabled-when-playing')) i.classList.remove('disabled');
		btnPause.classList.add('disabled');
		//清除原有数据
		fucktemp1 = false;
		fucktemp2 = false;
		hitEvents0.clear();
		hitEvents1.clear();
		hitEvents2.clear();
		qwqIn.reset();
		qwqOut.reset();
		qwqEnd.reset();
		curTime = 0;
		curTime_ms = 0;
		duration = 0;
		this.value = '播放';
	}
});
btnPause.addEventListener('click', async function() {
	if (this.classList.contains('disabled') || btnPlay.value === '播放') return;
	this.classList.add('disabled');
	if (this.value === '暂停') {
		if (app.bgVideo) app.bgVideo.pause();
		qwqIn.pause();
		if (showTransition.checked && isOutStart) qwqOut.pause();
		isPaused = true;
		this.value = '继续';
		curTime = timeBgm;
		audio.stop();
	} else {
		if (app.bgVideo) await playVideo(app.bgVideo, timeBgm * app.speed);
		qwqIn.play();
		if (showTransition.checked && isOutStart) qwqOut.play();
		isPaused = false;
		if (isInEnd && !isOutStart) playBgm(app.bgMusic, timeBgm * app.speed);
		// console.log(app.bgVideo);
		this.value = '暂停';
	}
	this.classList.remove('disabled');
});
inputOffset.addEventListener('input', function() {
	if (this.value < -400) this.value = -400;
	if (this.value > 600) this.value = 600;
});
//播放bgm
function playBgm(data, offset) {
	isPaused = false;
	if (!offset) offset = 0;
	curTime_ms = performance.now();
	audio.play(data, { offset: offset, playbackrate: app.speed, gainrate: app.musicVolume, interval: 1 });
}
/** @param {HTMLVideoElement} data */
function playVideo(data, offset) {
	if (!offset) offset = 0;
	data.currentTime = offset;
	data.playbackRate = app.speed;
	data.muted = true;
	return data.play();
}
// class CanvasText {
// 	constructor() {
// 		/** @type {HTMLCanvasElement} */
// 		this.canvas = self.OffscreenCanvas ? new OffscreenCanvas(300, 100) : document.createElement('canvas');
// 		this.ctx = this.canvas.getContext('2d');
// 		this.ctx.textAlign = 'center';
// 		this.ctx.font = '30px sans-serif';
// 		this.ctx.fillStyle = '#000';
// 		this.ctx.strokeStyle = '#fff';
// 		this.ctx.lineWidth = 2;
// 	}
// 	/** @param {string} text */
// 	setText(text) {
// 		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
// 		this.ctx.fillText(text, this.canvas.width / 2, this.canvas.height / 2);
// 		this.ctx.strokeText(text, this.canvas.width / 2, this.canvas.height / 2);
// 	}
// }
let fucktemp1 = false;
let fucktemp2 = false;
//作图
function loop() {
	frameTimer.addTick(); //计算fps
	const { lineScale } = app;
	nowTime_ms = performance.now();
	app.resizeCanvas();
	//计算时间
	if (qwqOut.second < 0.67) {
		calcqwq();
		qwqdraw1();
	} else if (!fucktemp1) qwqdraw2();
	if (fucktemp2) qwqdraw3(fucktemp2);
	ctx.globalAlpha = 1;
	const bgImage = $('imageBlur').checked ? app.bgImageBlur : app.bgImage;
	ctx.drawImage(bgImage, ...adjustSize(bgImage, canvas, 1.1));
	ctx.fillStyle = '#000';
	ctx.globalAlpha = 0.4;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.globalAlpha = 1;
	ctx.drawImage(canvasos, (canvas.width - canvasos.width) / 2, 0);
	//Copyright
	ctx.font = `${lineScale * 0.4}px Custom,Noto Sans SC`;
	ctx.fillStyle = '#ccc';
	ctx.globalAlpha = 0.8;
	ctx.textAlign = 'right';
	ctx.fillText(`Phi\x67ros Simulator v${_i[1].join('.')} - Code by lchz\x683\x3473`, (canvas.width + canvasos.width) / 2 - lineScale * 0.1, canvas.height - lineScale * 0.1);
	stopDrawing = requestAnimationFrame(loop); //回调更新动画
}

function calcqwq() {
	if (!isInEnd && qwqIn.second >= 3) {
		isInEnd = true;
		playBgm(app.bgMusic);
		if (app.bgVideo) playVideo(app.bgVideo);
	}
	if (!isPaused && isInEnd && !isOutStart) timeBgm = curTime + (nowTime_ms - curTime_ms) / 1e3;
	if (timeBgm >= duration) isOutStart = true;
	if (showTransition.checked && isOutStart && !isOutEnd) {
		isOutEnd = true;
		qwqOut.play();
	}
	timeChart = Math.max(timeBgm - (app.chart.offset + Number(inputOffset.value) / 1e3 || 0) / app.speed, 0);
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
			if (i.type !== 3) return (i.floorPosition - line.positionY) * i.speed;
			if (i.realTime < timeChart) return (i.realTime - timeChart) * i.speed * app.speed;
			return i.floorPosition - line.positionY;
		}

		function setAlpha(i, dx, dy) {
			i.projectX = line.offsetX + dx * i.cosr;
			i.offsetX = i.projectX + dy * i.sinr;
			i.projectY = line.offsetY + dx * i.sinr;
			i.offsetY = i.projectY - dy * i.cosr;
			i.visible = (i.offsetX - app.wlen) ** 2 + (i.offsetY - app.hlen) ** 2 < (app.wlen * 1.23625 + app.hlen + app.scaleY * i.realHoldTime * i.speed * app.speed) ** 2; //Math.hypot实测性能较低
			if (i.badtime) i.alpha = 1 - range((performance.now() - i.badtime) / 500);
			else if (i.realTime > timeChart) {
				if (dy > -1e-3 * app.scaleY) i.alpha = (i.type === 3 && i.speed === 0) ? (showPoint.checked ? 0.45 : 0) : qwq[5] ? Math.max(1 + (timeChart - i.realTime) / 1.5, 0) : 1; //过线前1.5s出现
				else i.alpha = showPoint.checked ? 0.45 : 0;
				//i.frameCount = 0;
			} else {
				if (i.type === 3) i.alpha = i.speed === 0 ? (showPoint.checked ? 0.45 : 0) : (i.status % 4 === 2 ? 0.45 : 1);
				else i.alpha = Math.max(1 - (timeChart - i.realTime) / 0.16, 0); //过线后0.16s消失
				i.frameCount = isNaN(i.frameCount) ? 0 : i.frameCount + 1;
			}
		}
	}
	//更新打击特效和触摸点动画
	hitEvents0.update();
	hitEvents1.update();
	hitEvents2.update();
	for (const i of hitManager.list) {
		if (i.type === 'keyboard') continue;
		if (!i.isTapped) hitEvents0.add(HitEvent0.tap(i.offsetX, i.offsetY));
		else if (i.isMoving) hitEvents0.add(HitEvent0.move(i.offsetX, i.offsetY)); //qwq
		else if (i.isActive) hitEvents0.add(HitEvent0.hold(i.offsetX, i.offsetY));
	}
	//触发判定和播放打击音效
	if (isInEnd) {
		const judgeWidth = canvasos.width * 0.118125;
		judgeManager.addEvent(app.notes, timeChart);
		judgeManager.execute(app.drags, timeChart, judgeWidth);
		judgeManager.execute(app.flicks, timeChart, judgeWidth);
		judgeManager.execute(app.tapholds, timeChart, judgeWidth);
	}
	//更新判定
	hitManager.update();
	if (qwq[4] && stat.good + stat.bad) {
		stat.level = Number(levelText.match(/\d+$/));
		stat.reset();
		btnPlay.click();
		btnPlay.click();
	}
}

function qwqdraw1() {
	const { lineScale, noteScaleRatio } = app;
	ctxos.clearRect(0, 0, canvasos.width, canvasos.height); //重置画面
	//绘制背景
	ctxos.globalAlpha = 1;
	const bgImage = $('imageBlur').checked ? app.bgImageBlur : app.bgImage;
	ctxos.drawImage(bgImage, ...adjustSize(bgImage, canvasos, 1));
	if (isInEnd && app.bgVideo) {
		const { videoWidth: width, videoHeight: height } = app.bgVideo;
		ctxos.drawImage(app.bgVideo, ...adjustSize({ width, height }, canvasos, 1));
	}
	if (qwq[4]) ctxos.filter = `hue-rotate(${energy*360/7}deg)`;
	if (qwqIn.second >= 2.5 && !stat.lineStatus) drawLine(0, lineScale); //绘制判定线(背景后0)
	if (qwq[4]) ctxos.filter = 'none';
	ctxos.resetTransform();
	ctxos.fillStyle = '#000'; //背景变暗
	ctxos.globalAlpha = app.brightness; //背景不透明度
	ctxos.fillRect(0, 0, canvasos.width, canvasos.height);
	if (qwq[4]) ctxos.filter = `hue-rotate(${energy*360/7}deg)`;
	if (qwqIn.second >= 2.5) drawLine(stat.lineStatus ? 2 : 1, lineScale); //绘制判定线(背景前1)
	if (qwq[4]) ctxos.filter = 'none';
	ctxos.resetTransform();
	if (qwqIn.second >= 3 && qwqOut.second === 0) {
		//绘制note
		for (const i of app.holds) drawHold(i, timeChart);
		for (const i of app.dragsReversed) drawDrag(i);
		for (const i of app.tapsReversed) drawTap(i);
		for (const i of app.flicksReversed) drawFlick(i);
		if (showPoint.checked) { //绘制定位点
			ctxos.font = `${lineScale}px Custom,Noto Sans SC`;
			ctxos.textAlign = 'center';
			for (const i of app.linesReversed) {
				ctxos.setTransform(i.cosr, i.sinr, -i.sinr, i.cosr, i.offsetX, i.offsetY);
				ctxos.globalAlpha = 1;
				ctxos.fillStyle = 'violet';
				ctxos.fillRect(-lineScale * 0.2, -lineScale * 0.2, lineScale * 0.4, lineScale * 0.4);
				ctxos.fillStyle = 'yellow';
				ctxos.globalAlpha = (i.alpha + 0.5) / 1.5;
				ctxos.fillText(i.lineId, 0, -lineScale * 0.3);
			}
			for (const i of app.notesReversed) {
				if (!i.visible) continue;
				ctxos.setTransform(i.cosr, i.sinr, -i.sinr, i.cosr, i.offsetX, i.offsetY);
				ctxos.globalAlpha = 1;
				ctxos.fillStyle = 'lime';
				ctxos.fillRect(-lineScale * 0.2, -lineScale * 0.2, lineScale * 0.4, lineScale * 0.4);
				ctxos.fillStyle = 'cyan';
				ctxos.globalAlpha = i.realTime > timeChart ? 1 : 0.5;
				ctxos.fillText(i.name, 0, -lineScale * 0.3);
			}
		}
	}
	if ($('feedback').checked) hitEvents0.animate(); //绘制打击特效0
	if (qwq[4]) ctxos.filter = `hue-rotate(${energy*360/7}deg)`;
	hitEvents1.animate(); //绘制打击特效1
	if (qwq[4]) ctxos.filter = 'none';
	if ($('showCE2').checked) hitEvents2.animate(); //绘制打击特效2
	ctxos.globalAlpha = 1;
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
		const name = inputName.value || inputName.placeholder;
		const artist = inputArtist.value;
		const illustrator = `Illustration designed by ${inputIllustrator.value || inputIllustrator.placeholder}`;
		const charter = `Level designed by ${inputCharter.value || inputCharter.placeholder}`;
		ctxos.textAlign = 'center';
		//曲名、曲师、曲绘和谱师
		fillTextNode(name, app.wlen, app.hlen * 0.75, lineScale * 1.1, canvasos.width - lineScale * 1.5);
		fillTextNode(artist, app.wlen, app.hlen * 0.75 + lineScale * 1.25, lineScale * 0.55, canvasos.width - lineScale * 1.5);
		fillTextNode(illustrator, app.wlen, app.hlen * 1.25 + lineScale * 0.55, lineScale * 0.55, canvasos.width - lineScale * 1.5);
		fillTextNode(charter, app.wlen, app.hlen * 1.25 + lineScale * 1.4, lineScale * 0.55, canvasos.width - lineScale * 1.5);
		//判定线(装饰用)
		ctxos.globalAlpha = 1;
		ctxos.setTransform(1, 0, 0, 1, app.wlen, app.hlen);
		const imgW = lineScale * 48 * (qwqIn.second < 0.67 ? tween.easeInSine(qwqIn.second * 1.5) : 1);
		const imgH = lineScale * 0.15; //0.1333...
		if (qwqIn.second >= 2.5) ctxos.globalAlpha = tween.easeOutSine(6 - qwqIn.second * 2);
		ctxos.drawImage(lineColor.checked ? res['JudgeLineMP'] : res['JudgeLine'], -imgW / 2, -imgH / 2, imgW, imgH);
	}
	//绘制分数和combo
	ctxos.globalAlpha = 1;
	ctxos.setTransform(1, 0, 0, 1, 0, lineScale * (qwqIn.second < 0.67 ? (tween.easeOutSine(qwqIn.second * 1.5) - 1) : -tween.easeOutSine(qwqOut.second * 1.5)) * 1.75);
	ctxos.font = `${lineScale * 0.95}px Custom,Noto Sans SC`;
	ctxos.textAlign = 'right';
	ctxos.fillText(stat.scoreStr, canvasos.width - lineScale * 0.65, lineScale * 1.375);
	if (showAcc.checked) {
		ctxos.font = `${lineScale * 0.66}px Custom,Noto Sans SC`;
		ctxos.fillText(stat.accStr, canvasos.width - lineScale * 0.65, lineScale * 2.05);
	}
	if (stat.combo > 2) {
		ctxos.textAlign = 'center';
		ctxos.font = `${lineScale * 1.32}px Custom,Noto Sans SC`;
		ctxos.fillText(stat.combo, app.wlen, lineScale * 1.375);
		ctxos.globalAlpha = qwqIn.second < 0.67 ? tween.easeOutSine(qwqIn.second * 1.5) : (1 - tween.easeOutSine(qwqOut.second * 1.5));
		ctxos.font = `${lineScale * 0.66}px Custom,Noto Sans SC`;
		ctxos.fillText(app.playMode === 1 ? 'Autoplay' : 'combo', app.wlen, lineScale * 2.05);
	}
	//绘制曲名和等级
	ctxos.globalAlpha = 1;
	ctxos.setTransform(1, 0, 0, 1, 0, lineScale * (qwqIn.second < 0.67 ? (1 - tween.easeOutSine(qwqIn.second * 1.5)) : tween.easeOutSine(qwqOut.second * 1.5)) * 1.75);
	ctxos.textAlign = 'right';
	fillTextNode(levelText, canvasos.width - lineScale * 0.75, canvasos.height - lineScale * 0.66, lineScale * 0.63, app.wlen - lineScale);
	ctxos.textAlign = 'left';
	fillTextNode(inputName.value || inputName.placeholder, lineScale * 0.65, canvasos.height - lineScale * 0.66, lineScale * 0.63, app.wlen - lineScale);
	ctxos.resetTransform();
	//绘制时间和帧率以及note打击数
	if (qwqIn.second < 0.67) ctxos.globalAlpha = tween.easeOutSine(qwqIn.second * 1.5);
	else ctxos.globalAlpha = 1 - tween.easeOutSine(qwqOut.second * 1.5);
	ctxos.font = `${lineScale * 0.4}px Custom,Noto Sans SC`;
	ctxos.textAlign = 'left';
	ctxos.fillText(`${time2Str(qwq[5]?duration-timeBgm:timeBgm)}/${time2Str(duration)}${scfg()}`, lineScale * 0.05, lineScale * 0.6);
	ctxos.textAlign = 'right';
	ctxos.fillText(frameTimer.fpsStr, canvasos.width - lineScale * 0.05, lineScale * 0.6);
	if (showStat.checked) {
		ctxos.textAlign = 'right';
		[stat.noteRank[6], stat.noteRank[7], stat.noteRank[5], stat.noteRank[4], stat.noteRank[1], stat.noteRank[3], stat.noteRank[2]].forEach((val, idx) => {
			const comboColor = ['#fe7b93', '#0ac3ff', 'lime', '#f0ed69', 'lime', '#0ac3ff', '#999'];
			ctxos.fillStyle = comboColor[idx];
			ctxos.fillText(val, canvasos.width - lineScale * 0.05, canvasos.height / 2 + lineScale * (idx - 2.8) * 0.5);
		});
		ctxos.fillStyle = '#fff';
		ctxos.textAlign = 'left';
		ctxos.fillText(`DSP:  ${stat.curDispStr}`, lineScale * 0.05, canvasos.height / 2 - lineScale * 0.15);
		ctxos.fillText(`AVG:  ${stat.avgDispStr}`, lineScale * 0.05, canvasos.height / 2 + lineScale * 0.35);
		ctxos.textAlign = 'center';
		stat.combos.forEach((val, idx) => {
			const comboColor = ['#fff', '#0ac3ff', '#f0ed69', '#a0e9fd', '#fe4365'];
			ctxos.fillStyle = comboColor[idx];
			ctxos.fillText(val, lineScale * (idx + 0.55) * 1.1, canvasos.height - lineScale * 0.1);
		});
	}
}
//判定线函数，undefined/0:默认,1:非,2:恒成立
function drawLine(bool, lineScale) {
	ctxos.globalAlpha = 1;
	const tw = 1 - tween.easeOutSine(qwqOut.second * 1.5);
	for (const i of app.linesReversed) {
		if (bool ^ i.imageD && qwqOut.second < 0.67) {
			ctxos.globalAlpha = i.alpha;
			ctxos.setTransform(i.cosr * tw, i.sinr, -i.sinr * tw, i.cosr, app.wlen + (i.offsetX - app.wlen) * tw, i.offsetY); //hiahiah
			const imgS = (i.imageU ? lineScale * 18.75 : canvasos.height) * i.imageS / 1080;
			const imgW = imgS * i.imageW * i.imageA;
			const imgH = imgS * i.imageH;
			ctxos.drawImage(i.imageL[i.imageC && lineColor.checked ? stat.lineStatus : 0], -imgW / 2, -imgH / 2, imgW, imgH);
		}
	}
}

function fillTextNode(text, x, y, size, maxWidth) {
	ctxos.font = `${size}px Custom,Noto Sans SC`;
	const dx = ctxos.measureText(text).width;
	if (dx > maxWidth) ctxos.font = `${size / dx * maxWidth}px Custom,Noto Sans SC`;
	ctxos.fillText(text, x, y);
	return dx;
}

function qwqdraw2() {
	fucktemp1 = true;
	btnPause.click(); //isPaused = true;
	audio.stop();
	cancelAnimationFrame(stopDrawing);
	btnPause.classList.add('disabled');
	ctxos.globalCompositeOperation = 'source-over';
	ctxos.resetTransform();
	ctxos.globalAlpha = 1;
	const bgImage = $('imageBlur').checked ? app.bgImageBlur : app.bgImage;
	ctxos.drawImage(bgImage, ...adjustSize(bgImage, canvasos, 1));
	ctxos.fillStyle = '#000'; //背景变暗
	ctxos.globalAlpha = app.brightness; //背景不透明度
	ctxos.fillRect(0, 0, canvasos.width, canvasos.height);
	const difficulty = ['ez', 'hd', 'in', 'at'].indexOf(levelText.slice(0, 2).toLocaleLowerCase());
	setTimeout(() => {
		if (!fucktemp1) return; //qwq
		audio.play(res[`LevelOver${difficulty < 0 ? 2 : difficulty}_v1`], { loop: true });
		qwqEnd.reset();
		qwqEnd.play();
		stat.level = Number(levelText.match(/\d+$/));
		fucktemp2 = stat.getData(app.playMode === 1, selectspeed.value);
	}, 1000);
}

function qwqdraw3(statData) {
	ctxos.resetTransform();
	ctxos.clearRect(0, 0, canvasos.width, canvasos.height);
	ctxos.globalAlpha = 1;
	const bgImage = $('imageBlur').checked ? app.bgImageBlur : app.bgImage;
	ctxos.drawImage(bgImage, ...adjustSize(bgImage, canvasos, 1));
	ctxos.fillStyle = '#000'; //背景变暗
	ctxos.globalAlpha = app.brightness; //背景不透明度
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
	//曲名和等级
	ctxos.fillStyle = '#fff';
	ctxos.textAlign = 'left';
	fillTextNode(inputName.value || inputName.placeholder, 700 * tween.easeOutCubic(range(qwqEnd.second * 1.25)) - 320, 160, 80, 1500);
	const lw = fillTextNode(levelText, 700 * tween.easeOutCubic(range(qwqEnd.second * 1.25)) - 317, 212, 30, 750);
	ctxos.font = '30px Custom,Noto Sans SC';
	//Rank图标
	ctxos.globalAlpha = range((qwqEnd.second - 1.87) * 3.75);
	const qwq2 = 293 + range((qwqEnd.second - 1.87) * 3.75) * 100;
	const qwq3 = 410 - range((qwqEnd.second - 1.87) * 2.14) * 164;
	ctxos.drawImage(res['LevelOver3'], 661 - qwq2 / 2, 545 - qwq2 / 2, qwq2, qwq2);
	ctxos.drawImage(res['Ranks'][stat.rankStatus], 661 - qwq3 / 2, 545 - qwq3 / 2, qwq3, qwq3);
	//各种数据
	ctxos.globalAlpha = range((qwqEnd.second - 0.87) * 2.50);
	ctxos.fillStyle = statData.newBestColor;
	ctxos.fillText(statData.newBestStr, 898, 433);
	ctxos.fillStyle = '#fff';
	ctxos.textAlign = 'center';
	ctxos.fillText(statData.scoreBest, 1180, 433);
	ctxos.globalAlpha = range((qwqEnd.second - 1.87) * 2.50);
	ctxos.textAlign = 'right';
	ctxos.fillText(statData.scoreDelta, 1414, 433);
	ctxos.globalAlpha = range((qwqEnd.second - 0.95) * 1.50);
	ctxos.textAlign = 'left';
	ctxos.fillText(stat.accStr, 352, 550);
	ctxos.fillText(stat.maxcombo, 1528, 550);
	ctxos.fillStyle = statData.textAboveColor;
	ctxos.fillText(app.speed === 1 ? '' : statData.textAboveStr.replace('{SPEED}', app.speed.toFixed(2)), 383 + Math.min(lw, 750), 212);
	ctxos.fillStyle = statData.textBelowColor;
	ctxos.fillText(statData.textBelowStr, 1355, 595);
	ctxos.fillStyle = '#fff';
	ctxos.textAlign = 'center';
	ctxos.font = '86px Custom,Noto Sans SC';
	ctxos.globalAlpha = range((qwqEnd.second - 1.12) * 2.00);
	ctxos.fillText(stat.scoreStr, 1075, 569);
	ctxos.font = '26px Custom,Noto Sans SC';
	ctxos.globalAlpha = range((qwqEnd.second - 0.87) * 2.50);
	ctxos.fillText(stat.perfect, 891, 650);
	ctxos.globalAlpha = range((qwqEnd.second - 1.07) * 2.50);
	ctxos.fillText(stat.good, 1043, 650);
	ctxos.globalAlpha = range((qwqEnd.second - 1.27) * 2.50);
	ctxos.fillText(stat.noteRank[6], 1196, 650);
	ctxos.globalAlpha = range((qwqEnd.second - 1.47) * 2.50);
	ctxos.fillText(stat.noteRank[2], 1349, 650);
	ctxos.font = '22px Custom,Noto Sans SC';
	const qwq4 = range((qwq[3] > 0 ? qwqEnd.second - qwq[3] : 0.2 - qwqEnd.second - qwq[3]) * 5.00);
	ctxos.globalAlpha = 0.8 * range((qwqEnd.second - 0.87) * 2.50) * qwq4;
	ctxos.fillStyle = '#696';
	ctxos.fill(new Path2D('M841,718s-10,0-10,10v80s0,10,10,10h100s10,0,10-10v-80s0-10-10-10h-40l-10-20-10,20h-40z'));
	ctxos.globalAlpha = 0.8 * range((qwqEnd.second - 1.07) * 2.50) * qwq4;
	ctxos.fillStyle = '#669';
	ctxos.fill(new Path2D('M993,718s-10,0-10,10v80s0,10,10,10h100s10,0,10-10v-80s0-10-10-10h-40l-10-20-10,20h-40z'));
	ctxos.fillStyle = '#fff';
	ctxos.globalAlpha = range((qwqEnd.second - 0.97) * 2.50) * qwq4;
	ctxos.fillText('Early: ' + stat.noteRank[5], 891, 759);
	ctxos.fillText('Late: ' + stat.noteRank[1], 891, 792);
	ctxos.globalAlpha = range((qwqEnd.second - 1.17) * 2.50) * qwq4;
	ctxos.fillText('Early: ' + stat.noteRank[7], 1043, 759);
	ctxos.fillText('Late: ' + stat.noteRank[3], 1043, 792);
	ctxos.resetTransform();
	ctxos.globalCompositeOperation = 'destination-over';
	ctxos.globalAlpha = 1;
	ctxos.fillStyle = '#000';
	ctxos.drawImage(app.bgImage, ...adjustSize(app.bgImage, canvasos, 1));
	ctxos.fillRect(0, 0, canvasos.width, canvasos.height);
	ctxos.globalCompositeOperation = 'source-over';
}

function range(num) {
	if (num < 0) return 0;
	if (num > 1) return 1;
	return num;
}
class NoteRender {
	constructor() {
		this.urlMap = new Map();
	}
	init(pack = {}) {
		this.res = {
			Tap: pack['Tap'],
			TapHL: pack['TapHL'],
			Drag: pack['Drag'],
			DragHL: pack['DragHL'],
			HoldHead: pack['HoldHead'],
			HoldHeadHL: pack['HoldHeadHL'],
			Hold: pack['Hold'],
			HoldHL: pack['HoldHL'],
			HoldEnd: pack['HoldEnd'],
			Flick: pack['Flick'],
			FlickHL: pack['FlickHL'],
		};
	}
	async load() {} //todo
}
//绘制Note
function drawTap(note) {
	const HL = note.isMulti && app.multiHint;
	const nsr = app.noteScaleRatio;
	if (!note.visible || note.scored && !note.badtime) return;
	ctxos.globalAlpha = note.alpha;
	ctxos.setTransform(nsr * note.cosr, nsr * note.sinr, -nsr * note.sinr, nsr * note.cosr, note.offsetX, note.offsetY);
	if (note.badtime) ctxos.drawImage(res['TapBad'], -res['TapBad'].width * 0.5, -res['TapBad'].height * 0.5);
	else if (HL) ctxos.drawImage(res['TapHL'], -res['TapHL'].width * 0.5, -res['TapHL'].height * 0.5);
	else ctxos.drawImage(res['Tap'], -res['Tap'].width * 0.5, -res['Tap'].height * 0.5);
}

function drawDrag(note) {
	const HL = note.isMulti && app.multiHint;
	const nsr = app.noteScaleRatio;
	if (!note.visible || note.scored && !note.badtime) return;
	ctxos.globalAlpha = note.alpha;
	ctxos.setTransform(nsr * note.cosr, nsr * note.sinr, -nsr * note.sinr, nsr * note.cosr, note.offsetX, note.offsetY);
	if (note.badtime);
	else if (HL) ctxos.drawImage(res['DragHL'], -res['DragHL'].width * 0.5, -res['DragHL'].height * 0.5);
	else ctxos.drawImage(res['Drag'], -res['Drag'].width * 0.5, -res['Drag'].height * 0.5);
}

function drawHold(note, realTime) {
	const HL = note.isMulti && app.multiHint;
	const nsr = app.noteScaleRatio;
	if (!note.visible || note.realTime + note.realHoldTime < realTime) return; //qwq
	ctxos.globalAlpha = note.alpha;
	ctxos.setTransform(nsr * note.cosr, nsr * note.sinr, -nsr * note.sinr, nsr * note.cosr, note.offsetX, note.offsetY);
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
	} else {
		if (HL) ctxos.drawImage(res['HoldHL'], -res['HoldHL'].width * 1.026 * 0.5, -holdLength, res['HoldHL'].width * 1.026, holdLength - baseLength * (realTime - note.realTime));
		else ctxos.drawImage(res['Hold'], -res['Hold'].width * 0.5, -holdLength, res['Hold'].width, holdLength - baseLength * (realTime - note.realTime));
	}
	ctxos.drawImage(res['HoldEnd'], -res['HoldEnd'].width * 0.5, -holdLength - res['HoldEnd'].height);
}

function drawFlick(note) {
	const HL = note.isMulti && app.multiHint;
	const nsr = app.noteScaleRatio;
	if (!note.visible || note.scored && !note.badtime) return;
	ctxos.globalAlpha = note.alpha;
	ctxos.setTransform(nsr * note.cosr, nsr * note.sinr, -nsr * note.sinr, nsr * note.cosr, note.offsetX, note.offsetY);
	if (note.badtime);
	else if (HL) ctxos.drawImage(res['FlickHL'], -res['FlickHL'].width * 0.5, -res['FlickHL'].height * 0.5);
	else ctxos.drawImage(res['Flick'], -res['Flick'].width * 0.5, -res['Flick'].height * 0.5);
}
//调节画面尺寸和全屏相关(返回source播放aegleseeker会出现迷之error)
function adjustSize(source, dest, scale) {
	const { width: sw, height: sh } = source;
	const { width: dw, height: dh } = dest;
	if (dw * sh > dh * sw) return [dw * (1 - scale) / 2, (dh - dw * sh / sw * scale) / 2, dw * scale, dw * sh / sw * scale];
	return [(dw - dh * sw / sh * scale) / 2, dh * (1 - scale) / 2, dh * sw / sh * scale, dh * scale];
}
/**@type {Map<ImageBitmap,LineImage>} */
const lineImages = new Map;
class LineImage {
	/**@param {ImageBitmap} image */
	constructor(image) {
		this.image = image;
		this.imageFC = null;
		this.imageAP = null;
		this.imageMP = null;
	}
	async getFC() {
		if (!this.imageFC) this.imageFC = await imgShader(this.image, '#a2eeff');
		return this.imageFC;
	}
	async getAP() {
		if (!this.imageAP) this.imageAP = await imgShader(this.image, '#a3ffac');
		return this.imageAP;
	}
	async getMP() {
		if (!this.imageMP) this.imageMP = await imgShader(this.image, '#feffa9');
		return this.imageMP;
	}
}
/**
 * 图片模糊(StackBlur)
 * @param {ImageBitmap} img 
 */
function imgBlur(img) {
	const canvas = document.createElement('canvas');
	const w = canvas.width = img.width;
	const h = canvas.height = img.height;
	const ctx = canvas.getContext('2d');
	ctx.drawImage(img, 0, 0);
	StackBlur.canvasRGBA(canvas, 0, 0, w, h, Math.ceil(Math.min(w, h) * 0.0125));
	return createImageBitmap(canvas);
}
/**
 * 给图片上色(limit用于解决iOS的InvalidStateError)
 * @param {ImageBitmap} img 
 */
function imgShader(img, color, limit = 512) {
	const dataRGBA = hex2rgba(color);
	const canvas = document.createElement('canvas');
	canvas.width = img.width;
	canvas.height = img.height;
	const ctx = canvas.getContext('2d', { willReadFrequently: true }); //warning
	ctx.drawImage(img, 0, 0);
	for (let dx = 0; dx < img.width; dx += limit) {
		for (let dy = 0; dy < img.height; dy += limit) {
			const imgData = ctx.getImageData(dx, dy, limit, limit);
			for (let i = 0; i < imgData.data.length / 4; i++) {
				imgData.data[i * 4] *= dataRGBA[0] / 255;
				imgData.data[i * 4 + 1] *= dataRGBA[1] / 255;
				imgData.data[i * 4 + 2] *= dataRGBA[2] / 255;
				imgData.data[i * 4 + 3] *= dataRGBA[3] / 255;
			}
			ctx.putImageData(imgData, dx, dy);
		}
	}
	return createImageBitmap(canvas);
}
/**
 * 给图片纯色(limit用于解决iOS的InvalidStateError)
 * @param {ImageBitmap} img 
 */
function imgPainter(img, color, limit = 512) {
	const dataRGBA = hex2rgba(color);
	const canvas = document.createElement('canvas');
	canvas.width = img.width;
	canvas.height = img.height;
	const ctx = canvas.getContext('2d', { willReadFrequently: true }); //warning
	ctx.drawImage(img, 0, 0);
	for (let dx = 0; dx < img.width; dx += limit) {
		for (let dy = 0; dy < img.height; dy += limit) {
			const imgData = ctx.getImageData(dx, dy, limit, limit);
			for (let i = 0; i < imgData.data.length / 4; i++) {
				imgData.data[i * 4] = dataRGBA[0];
				imgData.data[i * 4 + 1] = dataRGBA[1];
				imgData.data[i * 4 + 2] = dataRGBA[2];
				imgData.data[i * 4 + 3] *= dataRGBA[3] / 255;
			}
			ctx.putImageData(imgData, dx, dy);
		}
	}
	return createImageBitmap(canvas);
}
/**
 * 切割图片
 * @param {ImageBitmap} img 
 * @param {number} [limitX]
 * @param {number} [limitY]
 */
function imgSplit(img, limitX, limitY) {
	limitX = parseInt(limitX) || Math.min(img.width, img.height);
	limitY = parseInt(limitY) || limitX;
	const arr = [];
	for (let dx = 0; dx < img.width; dx += limitX) {
		for (let dy = 0; dy < img.height; dy += limitY) {
			arr.push(createImageBitmap(img, dx, dy, limitX, limitY));
		}
	}
	return Promise.all(arr);
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
//plugin(phizone)
inputName.addEventListener('input', function() {
	if (this.value == '/pz') setTimeout(() => {
		if (this.value == '/pz') {
			import('./js/phizone.js').then(({ dialog }) => dialog());
			this.value = '';
			this.dispatchEvent(new Event('input'));
		}
	}, 1e3);
});
//debug
self.app = app;
self.res = res;
self.audio = audio;