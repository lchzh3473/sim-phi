import simphi from './js/simphi.js';
import { audio } from '/utils/aup.js';
import { full, Timer, getConstructorName, urls, isUndefined, loadJS, frameTimer, time2Str, orientation, FrameAnimater } from './js/common.js';
import { uploader, ZipReader, readFile } from './js/reader.js';
import { InteractProxy } from '/utils/interact.js';
self['_i'] = ['PhigrosPlayer', [1, 4, 22, 'b51'], 1611795955, 1683631022];
/** @type {(arg0:string)=>any} */
const $id = query => document.getElementById(query);
/** @type {(arg0:string)=>any} */
const $ = query => document.body.querySelector(query);
/** @type {(arg0:string)=>any} */
const $$ = query => document.body.querySelectorAll(query);
/** @type {(width:number,height:number)=>HTMLCanvasElement} */
const createCanvas = (width, height) => {
	const canvas = document.createElement('canvas');
	return Object.assign(canvas, { width, height });
};
/** @type {Object<string,(pos:number)=>number>} */
const tween = {
	easeInSine: pos => 1 - Math.cos(pos * Math.PI / 2),
	easeOutSine: pos => Math.sin(pos * Math.PI / 2),
	easeOutCubic: pos => 1 + (pos - 1) ** 3,
};
const main = {};
/** @type {(arg0:any)=>any} */
main.modify = a => a;
main.pressTime = 0;
/** @type {Map<string,()=>any>} */
main.before = new Map();
/** @type {Map<string,(...arg0:any[])=>any>} */
main.now = new Map();
/** @type {Map<string,()=>any>} */
main.after = new Map();
/** @type {(ctx:CanvasRenderingContext2D,time:number)=>void} */
main.filter = null;
document.oncontextmenu = e => e.preventDefault(); //qwq
for (const i of $id('view-nav').children) {
	i.addEventListener('click', function() {
		for (const i of $id('view-nav').children) i.classList.toggle('active', i === this);
		if (!$id('view-doc').src) $id('view-doc').src = 'docs/use.html'; //避免阻塞页面
		$id('view-doc').classList.toggle('hide', this.id !== 'nav-use');
		$id('view-cfg').classList.toggle('hide', this.id !== 'nav-cfg');
		$id('view-msg').classList.toggle('hide', this.id !== 'nav-msg');
	});
}
$id('cover-dark').addEventListener('click', () => {
	$id('cover-dark').classList.add('fade');
	$id('cover-view').classList.add('fade');
});
$id('qwq').addEventListener('click', () => {
	$id('cover-dark').classList.remove('fade');
	$id('cover-view').classList.remove('fade');
	$id('nav-use').click();
});
$id('btn-more').addEventListener('click', () => {
	$id('cover-dark').classList.remove('fade');
	$id('cover-view').classList.remove('fade');
	$id('nav-cfg').click();
});
$id('msg-out').addEventListener('click', () => {
	$id('cover-dark').classList.remove('fade');
	$id('cover-view').classList.remove('fade');
	$id('nav-msg').click();
});
const msgHandler = {
	nodeText: $id('msg-out'),
	nodeView: $id('view-msg'),
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
		};
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
			this.nodeText.innerText = msg + (num ? `（发现${num}个问题，你可以选择忽略）` : '');
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
};
const stat = new simphi.Stat();
const app = new simphi.Renderer($id('stage')); //test
const { canvas, ctx, canvasos, ctxos } = app;
class Emitter extends EventTarget {
	constructor(statusInit) {
		super();
		this.status = statusInit;
	}
	emit(status) {
		if (this.status === status) return;
		this.status = status;
		this.dispatchEvent(new Event('change'));
	}
	eq(status) { return this.status === status; }
	ne(status) { return this.status !== status; }
}
const emitter = new Emitter('stop');
const status2 = {
	text: '',
	list: [],
	reg(target, type, handler) {
		this.list[this.list.length] = { toString: () => handler(target) };
		target.addEventListener(type, this.update.bind(this));
	},
	update() {
		const arr = this.list.map(String).filter(Boolean);
		this.text = arr.length === 0 ? '' : `(${arr.join('+')})`;
	}
};
let levelText = '';
const bgs = new Map();
const bgsBlur = new Map();
const bgms = new Map();
const charts = new Map();
const chartsMD5 = new Map();
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
	const loadLib = async (name, urls, check) => {
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
	const isMobile = navigator['standalone'] !== undefined || navigator.platform.indexOf('Linux') > -1 && navigator.maxTouchPoints === 5;
	if (isMobile) $id('uploader-select').style.display = 'none';
	if (navigator.userAgent.indexOf('MiuiBrowser') > -1) {
		//实测 v17.1.8 问题仍然存在，v17.4.80113 问题已修复
		const version = navigator.userAgent.match(/MiuiBrowser\/(\d+\.\d+)/);
		const text = '检测到小米浏览器且版本低于17.4，可能存在切后台声音消失的问题';
		if (!version || parseFloat(version[1]) < 17.4) msgHandler.sendWarning(text);
	}
	if (!await loadLib('ImageBitmap兼容', '/lib/createImageBitmap.js', () => isUndefined('createImageBitmap'))) return -1;
	if (!await loadLib('StackBlur', urls.blur, () => isUndefined('StackBlur'))) return -2;
	if (!await loadLib('md5', urls.md5, () => isUndefined('md5'))) return -3;
	msgHandler.sendMessage('加载声音组件...');
	const oggCompatible = !!(new Audio).canPlayType('audio/ogg');
	if (!await loadLib('ogg格式兼容', '/lib/oggmented-bundle.js', () => !oggCompatible && isUndefined('oggmented'))) return -4;
	audio.init(oggCompatible ? self.AudioContext || self['webkitAudioContext'] : self['oggmented'].OggmentedAudioContext); //兼容Safari
	const orientSupported = await orientation.checkSupport();
	if (!orientSupported) {
		lockOri.checked = false;
		lockOri.container.classList.add('disabled');
		lockOri.label.textContent += '(当前设备或浏览器不支持)';
	}
}
//自动填写歌曲信息
function adjustInfo() {
	for (const i of chartInfoData) {
		if (selectchart.value.trim() === i.Chart) {
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
				$id('select-aspect-ratio').value = i.AspectRatio;
				stage.resize(i.AspectRatio); //qwq
			}
			if (isFinite(i.ScaleRatio = parseFloat(i.ScaleRatio))) { //Legacy
				$id('select-note-scale').value = 8080 / i.ScaleRatio;
				app.setNoteScale(8080 / i.ScaleRatio);
			}
			if (isFinite(i.NoteScale = parseFloat(i.NoteScale))) {
				$id('select-note-scale').value = i.NoteScale;
				app.setNoteScale(i.NoteScale);
			}
			if (isFinite(i.GlobalAlpha = parseFloat(i.GlobalAlpha))) { //Legacy
				$id('select-background-dim').value = i.GlobalAlpha;
				app.brightness = Number(i.GlobalAlpha);
			}
			if (isFinite(i.BackgroundDim = parseFloat(i.BackgroundDim))) {
				$id('select-background-dim').value = i.BackgroundDim;
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
	const /** @type {Object<string,number>} */ dones = {};
	const /** @type {Object<string,number>} */ totals = {};
	let uploader_done = 0;
	let uploader_total = 0;
	/**
	 * @param {string} tag
	 * @param {number} total
	 */
	const handleFile = async (tag, total, promise, oncomplete = _ => {}) => {
		totals[tag] = total;
		uploader_total = Object.values(totals).reduce((a, b) => a + b, 0);
		if (!(promise instanceof Promise)) promise = Promise.resolve();
		await promise.catch(err => msgHandler.sendWarning(`不支持的文件：${err.cause.name}`));
		dones[tag] = (dones[tag] || 0) + 1;
		uploader_done = Object.values(dones).reduce((a, b) => a + b, 0);
		msgHandler.sendMessage(`读取文件：${uploader_done}/${uploader_total}`);
		if (dones[tag] === totals[tag]) oncomplete();
		loadComplete();
	}
	main.handleFile = handleFile;
	let file_total = 0;
	const options = { createAudioBuffer() { return audio.decode(...arguments) } };
	const zip = new ZipReader({ handler: data => readFile(data, options) });
	zip.addEventListener('loadstart', () => msgHandler.sendMessage('加载zip组件...'));
	zip.addEventListener('read', ( /** @type {CustomEvent<ReaderData>} */ evt) => handleFile('zip', zip.total, pick(evt.detail)));
	$id('uploader-upload').addEventListener('click', uploader.uploadFile);
	$id('uploader-file').addEventListener('click', uploader.uploadFile);
	$id('uploader-dir').addEventListener('click', uploader.uploadDir);
	/** @type {((_:FileList) => void)} */
	uploader.addEventListener('change', loadComplete);
	/** @type {((_:ProgressEvent<FileReader>) => void)} */
	uploader.addEventListener('progress', function( /** @type {ProgressEvent} */ evt) { //显示加载文件进度
		if (!evt.total) return;
		const percent = Math.floor(evt.loaded / evt.total * 100);
		msgHandler.sendMessage(`加载文件：${percent}% (${bytefm(evt.loaded)}/${bytefm(evt.total)})`);
	});
	uploader.addEventListener('load', /** @param {(ProgressEvent<FileReader>&{file:File,buffer:ArrayBuffer})} evt*/ function(evt) {
		console.log(evt);
		const { file: { name, webkitRelativePath: path }, buffer } = evt;
		const isZip = buffer.byteLength > 4 && new DataView(buffer).getUint32(0, false) === 0x504b0304;
		const data = { name: name, buffer, path: path || name };
		//检测buffer是否为zip
		if (isZip) zip.read(data);
		else {
			file_total++;
			readFile(data, options).then(result => handleFile('file', file_total, pick(result)));
		}
	});
	main.uploader = uploader;
	/**
	 * @typedef {import("./js/reader").ReaderData} ReaderData
	 * @param {ReaderData} data
	 */
	async function pick(data) {
		console.log(data);
		switch (data.type) {
			case 'line':
				chartLineData.push(...data.data);
				break;
			case 'info':
				chartInfoData.push(...data.data);
				break;
			case 'media':
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
				let basename = data.name;
				while (charts.has(basename)) basename += '\n'; //qwq
				charts.set(basename, data.data);
				chartsMD5.set(basename, data.md5);
				selectchart.appendChild(createOption(basename, data.name));
				break;
			default:
				console.error(data['data']);
				throw new Error(`Unsupported file: ${data['name']}`, { cause: data });
		}
	}
	/**
	 * @param {string} innerhtml 
	 * @param {string} value 
	 */
	function createOption(value, innerhtml) {
		const option = document.createElement('option');
		const isHidden = /(^|\/)\./.test(innerhtml);
		option.innerHTML = isHidden ? '' : innerhtml;
		option.value = value;
		if (isHidden) option.classList.add('hide');
		return option;
	}

	function loadComplete() {
		if (uploader_done === uploader_total) {
			$id('uploader').classList.remove('disabled');
			adjustInfo();
		} else $id('uploader').classList.add('disabled');
	}
}
//qwq[water,demo,democlick]
const qwq = [null, false, null, null, 0, null];
import('./js/demo.js').then(a => a.default());
//qwq end
const exitFull = () => {
	document.removeEventListener(full.onchange, exitFull);
	hitManager.clear('keyboard'); //esc退出全屏只有onchange事件能检测到
	app.isFull = full.check();
	stage.resize();
};
//hit start
const specialClick = {
	time: [0, 0, 0, 0],
	func: [() => {
		Promise.resolve().then(qwqPause);
	}, () => {
		Promise.resolve().then(qwqStop).then(qwqStop);
	}, () => {
		showStat.toggle();
	}, async () => {
		const isFull = app.isFull;
		try {
			await full.toggle();
			if (!(app.isFull = full.check())) return;
			document.addEventListener(full.onchange, exitFull);
			if (!lockOri.checked) return;
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
		if (qwqEnd.second > 0) main.pressTime = main.pressTime > 0 ? -qwqEnd.second : qwqEnd.second;
	}
};
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
/** @typedef {import('./js/simphi.js').NoteExtends} NoteExtends */
/**
 * 判定和音符的水平距离
 * @param {JudgeEvent} judgeEvent
 * @param {NoteExtends} note
 */
function getJudgeOffset(judgeEvent, note) {
	const { offsetX, offsetY } = judgeEvent;
	const { offsetX: x, offsetY: y, cosr, sinr } = note;
	return Math.abs((offsetX - x) * cosr + (offsetY - y) * sinr) || 0;
}
/**
 * 判定和音符的曼哈顿距离
 * @param {JudgeEvent} judgeEvent
 * @param {NoteExtends} note
 */
function getJudgeDistance(judgeEvent, note) {
	const { offsetX, offsetY } = judgeEvent;
	const { offsetX: x, offsetY: y, cosr, sinr } = note;
	return Math.abs((offsetX - x) * cosr + (offsetY - y) * sinr) + Math.abs((offsetX - x) * sinr - (offsetY - y) * cosr) || 0;
}
const judgeManager = {
	/**@type {JudgeEvent[]} */
	list: [],
	/**@param {NoteExtends[]} notes */
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
		} else if (emitter.eq('play')) {
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
	 * @param {NoteExtends[]} notes
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
					hitImageList.add(HitImage.perfect(note.projectX, note.projectY, note));
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
					hitImageList.add(HitImage.perfect(note.projectX, note.projectY, note));
					stat.addCombo(4, 4);
					note.scored = true;
				}
			} else { //Hold音符
				if (note.type === 3 && note.holdTapTime) { //是否触发头判
					if ((performance.now() - note.holdTapTime) * note.holdTime >= 1.6e4 * note.realHoldTime) { //间隔时间与bpm成反比
						if (note.holdStatus % 4 === 0) hitImageList.add(HitImage.perfect(note.projectX, note.projectY, note));
						else if (note.holdStatus % 4 === 1) hitImageList.add(HitImage.perfect(note.projectX, note.projectY, note));
						else if (note.holdStatus % 4 === 3) hitImageList.add(HitImage.good(note.projectX, note.projectY, note));
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
						noteJudge.badTime = performance.now();
					} else {
						const note = noteJudge;
						stat.addDisp(Math.max(deltaTime2, (-1 - note.frameCount) * 0.04 || 0));
						audio.play(res['HitSong0'], { gainrate: app.soundVolume });
						if (deltaTime2 > 0.08) {
							note.holdStatus = 7; //console.log('Good(Early)', i.name);
							hitImageList.add(HitImage.good(note.projectX, note.projectY, note));
							hitWordList.add(HitWord.early(note.projectX, note.projectY));
						} else if (deltaTime2 > 0.04) {
							note.holdStatus = 5; //console.log('Perfect(Early)', i.name);
							hitImageList.add(HitImage.perfect(note.projectX, note.projectY, note));
							hitWordList.add(HitWord.early(note.projectX, note.projectY));
						} else if (deltaTime2 > -0.04 || note.frameCount < 1) {
							note.holdStatus = 4; //console.log('Perfect(Max)', i.name);
							hitImageList.add(HitImage.perfect(note.projectX, note.projectY, note));
						} else if (deltaTime2 > -0.08 || note.frameCount < 2) {
							note.holdStatus = 1; //console.log('Perfect(Late)', i.name);
							hitImageList.add(HitImage.perfect(note.projectX, note.projectY, note));
							hitWordList.add(HitWord.late(note.projectX, note.projectY));
						} else {
							note.holdStatus = 3; //console.log('Good(Late)', i.name);
							hitImageList.add(HitImage.good(note.projectX, note.projectY, note));
							hitWordList.add(HitWord.late(note.projectX, note.projectY));
						}
						if (note.type === 1) note.status = note.holdStatus;
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
				if (emitter.eq('play') && note.holdTapTime && note.holdBroken) {
					note.status = 2; //console.log('Miss', i.name);
					stat.addCombo(2, 3);
					note.scored = true;
				}
			}
		}
	}
};
class HitEvents extends Array {
	constructor({
		updateCallback = _ => {},
		iterateCallback = _ => {}
	} = {}) {
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
const hitFeedbackList = new HitEvents({ //存放点击特效
	updateCallback: i => ++i.time > 0,
	/**	@param {HitFeedback} i */
	iterateCallback: i => {
		ctxos.globalAlpha = 0.85;
		ctxos.setTransform(1, 0, 0, 1, i.offsetX, i.offsetY); //缩放
		ctxos.fillStyle = i.color;
		ctxos.beginPath();
		ctxos.arc(0, 0, app.lineScale * 0.5, 0, 2 * Math.PI);
		ctxos.fill();
	}
});
const hitImageList = new HitEvents({ //存放点击特效
	updateCallback: i => nowTime_ms >= i.time + i.duration,
	/**	@param {HitImage} i */
	iterateCallback: i => {
		const tick = (nowTime_ms - i.time) / i.duration;
		const effects = i.effects;
		ctxos.globalAlpha = 1;
		ctxos.setTransform(app.noteScaleRatio * 6, 0, 0, app.noteScaleRatio * 6, i.offsetX, i.offsetY); //缩放
		// ctxos.rotate(i.rotation);
		(effects[Math.floor(tick * effects.length)] || effects[effects.length - 1]).full(ctxos); //停留约0.5秒
		ctxos.fillStyle = i.color;
		ctxos.globalAlpha = 1 - tick; //不透明度
		const r3 = 30 * (((0.2078 * tick - 1.6524) * tick + 1.6399) * tick + 0.4988); //方块大小
		for (const j of i.direction) {
			const ds = j[0] * (9 * tick / (8 * tick + 1)); //打击点距离
			ctxos.fillRect(ds * Math.cos(j[1]) - r3 / 2, ds * Math.sin(j[1]) - r3 / 2, r3, r3);
		}
	}
});
const hitWordList = new HitEvents({ //存放点击特效
	updateCallback: i => nowTime_ms >= i.time + i.duration,
	/**	@param {HitWord} i */
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
class HitFeedback {
	constructor(offsetX, offsetY, n1, n2) {
		this.offsetX = Number(offsetX);
		this.offsetY = Number(offsetY);
		this.color = String(n1);
		this.text = String(n2);
		this.time = 0;
	}
	static tap(offsetX, offsetY) {
		//console.log('Tap', offsetX, offsetY);
		return new HitFeedback(offsetX, offsetY, 'cyan', '');
	}
	static hold(offsetX, offsetY) {
		//console.log('Hold', offsetX, offsetY);
		return new HitFeedback(offsetX, offsetY, 'lime', '');
	}
	static move(offsetX, offsetY) {
		//console.log('Move', offsetX, offsetY);
		return new HitFeedback(offsetX, offsetY, 'violet', '');
	}
}
class HitImage {
	constructor(offsetX, offsetY, n1, n3) {
		const packs = noteRender.hitFX[n1];
		this.offsetX = Number(offsetX) || 0;
		this.offsetY = Number(offsetY) || 0;
		this.time = performance.now();
		this.duration = packs.duration;
		this.effects = packs.effects;
		this.direction = Array(packs.numOfParts || 0).fill().map(() => [Math.random() * 80 + 185, Math.random() * 2 * Math.PI]);
		this.color = String(n3);
	}
	static perfect(offsetX, offsetY, note) {
		// console.log(note);
		return new HitImage(offsetX, offsetY, 'Perfect', '#ffeca0');
	}
	static good(offsetX, offsetY, note) {
		// console.log(note);
		return new HitImage(offsetX, offsetY, 'Good', '#b4e1ff');
	}
}
class HitWord {
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
		return new HitWord(offsetX, offsetY, '#03aaf9', 'Early');
	}
	static late(offsetX, offsetY) {
		//console.log('Hold', offsetX, offsetY);
		return new HitWord(offsetX, offsetY, '#ff4612', 'Late');
	}
}
const interact = new InteractProxy(canvas);
//兼容PC鼠标
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
//兼容键盘(喵喵喵?)
interact.setKeyboardEvent({
	keydownCallback(evt) {
		if (emitter.eq('stop')) return;
		if (evt.key === 'Shift') btnPause.click();
		else if (hitManager.list.find(i => i.type === 'keyboard' && i.id === evt.code)) {} //按住一个键时，会触发多次keydown事件
		else hitManager.activate('keyboard', evt.code, NaN, NaN);
	},
	keyupCallback(evt) {
		if (emitter.eq('stop')) return;
		if (evt.key !== 'Shift') hitManager.deactivate('keyboard', evt.code);
	}
});
self.addEventListener('blur', () => hitManager.clear('keyboard'));
//兼容移动设备
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
		// if (emitter.eq('play')) qwqPause();
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
//初始化(踩坑：监听DOMContentLoaded似乎会阻塞页面导致长时间白屏)
window.addEventListener('load', async function() {
	canvas.classList.add('fade');
	let loadedNum = 0;
	let errorNum = 0;
	msgHandler.sendMessage('初始化...');
	if (await checkSupport()) return;
	const res0 = {};
	const raw = await fetch(atob('Li9kYXRhL3BhY2suanNvbg==')).then(i => i.json());
	for (const j in raw.image || {}) res0[j] = raw.image[j];
	for (const j in raw.audio || {}) res0[j] = raw.audio[j];
	//加载资源
	await Promise.all(Object.entries(res0).map(([name, src], _i, arr) => new Promise(resolve => {
		const [url, ext] = src.split('|');
		fetch(url, { referrerPolicy: 'no-referrer' }).then(a => a.blob()).then(async blob => {
			const img = await createImageBitmap(blob);
			if (ext && ext[0] === 'm') {
				const data = decode(img, Number(ext.slice(1))).result;
				img.close();
				res[name] = await audio.decode(data).catch(async err => {
					const blob = await fetch(raw.alternative[name], { referrerPolicy: 'no-referrer' }).then(i => i.blob());
					return await createImageBitmap(blob).then(decodeAlt).then(ab => audio.decode(ab)).catch(err => {
						msgHandler.sendWarning(`音频加载存在问题，将导致以下音频无法正常播放：\n${name}(${err.message})\n如果多次刷新问题仍然存在，建议更换设备或浏览器。`);
						return audio.mute(1);
					});

					function decodeAlt(img) {
						const canvas = createCanvas(img.width, img.height);
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
				res[name] = img;
			}
			msgHandler.sendMessage(`加载资源：${Math.floor(++loadedNum / arr.length * 100)}%`);
		}).catch(err => {
			console.error(err);
			msgHandler.sendError(`错误：${++errorNum}个资源加载失败（点击查看详情）`, `资源加载失败，请检查您的网络连接然后重试：\n${new URL(url,location.toString())}`, true);
		}).finally(() => resolve());
	})));
	if (errorNum) return msgHandler.sendError(`错误：${errorNum}个资源加载失败（点击查看详情）`);
	const entries = ['Tap', 'TapHL', 'Drag', 'DragHL', 'HoldHead', 'HoldHeadHL', 'Hold', 'HoldHL', 'HoldEnd', 'Flick', 'FlickHL'];
	for (const i of entries) await noteRender.update(i, res[i], 8080 / raw.image[i].split('|')[1]);
	await noteRender.updateFX(res['HitFXRaw'], 8080 / raw.image['HitFXRaw'].split('|')[1]);
	res['NoImageBlack'] = await createImageBitmap(new ImageData(new Uint8ClampedArray(4).fill(0), 1, 1));
	res['NoImageWhite'] = await createImageBitmap(new ImageData(new Uint8ClampedArray(4).fill(255), 1, 1));
	res['JudgeLineMP'] = await imgShader(res['JudgeLine'], '#feffa9');
	res['JudgeLineFC'] = await imgShader(res['JudgeLine'], '#a2eeff');
	res['Ranks'] = await imgSplit(res['Rank']);
	res['Rank'].close();
	res['mute'] = audio.mute(1);
	if (!(() => {
			const b = createCanvas(1, 1).getContext('2d');
			b.drawImage(res['JudgeLine'], 0, 0);
			return b.getImageData(0, 0, 1, 1).data[0];
		})()) return msgHandler.sendError('检测到图片加载异常，请关闭所有应用程序然后重试');
	msgHandler.sendMessage('等待上传文件...');
	$id('uploader').classList.remove('disabled');
	$id('select').classList.remove('disabled');
	emitter.dispatchEvent(new CustomEvent('change'));

	function decode(img, border = 0) {
		const canvas = createCanvas(img.width - border * 2, img.height - border * 2);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(img, -border, -border);
		const id = ctx.getImageData(0, 0, canvas.width, canvas.width);
		const ab = new Uint8Array(id.data.length / 4 * 3);
		for (let i = 0; i < ab.length; i++) ab[i] = id.data[((i / 3) | 0) * 4 + i % 3] ^ (i * 3473);
		const size = new DataView(ab.buffer, 0, 4).getUint32(0);
		return { result: ab.buffer.slice(4, size + 4) };
	}
}, { once: true });
//必要组件
const frameAnimater = new FrameAnimater();
frameAnimater.setCallback(mainLoop);
let nowTime_ms = 0; //当前绝对时间(ms)
let curTime = 0; //最近一次暂停的音乐时间(s)
let curTime_ms = 0; //最近一次播放的绝对时间(ms)
let timeBgm = 0; //当前音乐时间(s)
let timeChart = 0; //当前谱面时间(s)
let duration = 0; //音乐时长(s)
let isInEnd = false; //开头过渡动画
let isOutStart = false; //结尾过渡动画
let isOutEnd = false; //临时变量
document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && emitter.eq('play') && qwqPause());
document.addEventListener('pagehide', () => document.visibilityState === 'hidden' && emitter.eq('play') && qwqPause()); //兼容Safari
const qwqIn = new Timer();
const qwqOut = new Timer();
const qwqEnd = new Timer();
/**
 * 播放bgm
 * @param {AudioBuffer} data
 * @param {number} [offset]
 */
function playBgm(data, offset) {
	if (!offset) offset = 0;
	curTime_ms = performance.now();
	tmps.bgMusic = audio.play(data, { offset: offset, playbackrate: app.speed, gainrate: app.musicVolume, interval: autoDelay.checked ? 1 : 0 });
}
/**
 * @param {HTMLVideoElement} data
 * @param {number} [offset]
 */
function playVideo(data, offset) {
	if (!offset) offset = 0;
	data.currentTime = offset;
	data.playbackRate = app.speed;
	data.muted = true;
	return data.play();
}
let fucktemp1 = false;
let fucktemp2 = null;
const tmps = {
	bgImage: null,
	bgVideo: null,
	bgMusic: _ => {},
	progress: 0,
	name: '',
	artist: '',
	illustrator: '',
	charter: '',
	level: '',
	combo: '',
	combo2: ''
};
//作图
function mainLoop() {
	frameTimer.addTick(); //计算fps
	const { lineScale } = app;
	nowTime_ms = performance.now();
	app.resizeCanvas();
	//计算时间
	if (qwqOut.second < 0.67) {
		loopNoCanvas();
		for (const i of main.now.values()) i(timeBgm);
		loopCanvas();
	} else if (!fucktemp1) {
		fucktemp1 = true;
		audio.stop();
		btnPause.classList.add('disabled'); //qwq
		ctxos.globalCompositeOperation = 'source-over';
		ctxos.resetTransform();
		ctxos.globalAlpha = 1;
		const bgImage = $id('imageBlur').checked ? app.bgImageBlur : app.bgImage;
		ctxos.drawImage(bgImage, ...adjustSize(bgImage, canvasos, 1));
		ctxos.fillStyle = '#000'; //背景变暗
		ctxos.globalAlpha = app.brightness; //背景不透明度
		ctxos.fillRect(0, 0, canvasos.width, canvasos.height);
		setTimeout(() => {
			if (!fucktemp1) return; //避免快速重开后直接结算
			const difficulty = ['ez', 'hd', 'in', 'at'].indexOf(levelText.slice(0, 2).toLocaleLowerCase());
			audio.play(res[`LevelOver${difficulty < 0 ? 2 : difficulty}_v1`], { loop: true });
			qwqEnd.reset();
			qwqEnd.play();
			stat.level = Number(levelText.match(/\d+$/));
			fucktemp2 = stat.getData(app.playMode === 1, selectspeed.value);
		}, 1e3);
	} //只让它执行一次
	if (fucktemp2) qwqdraw3(fucktemp2);
	ctx.globalAlpha = 1;
	const bgImage = $id('imageBlur').checked ? app.bgImageBlur : app.bgImage;
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
	ctx.fillText(`lchz\x683\x3473`, (canvas.width + canvasos.width) / 2 - lineScale * 0.1, canvas.height - lineScale * 0.1);
}

function loopNoCanvas() {
	if (!isInEnd && qwqIn.second >= 3) {
		isInEnd = true;
		playBgm(app.bgMusic);
		if (app.bgVideo) playVideo(app.bgVideo);
	}
	if (emitter.eq('play') && isInEnd && !isOutStart) timeBgm = curTime + (nowTime_ms - curTime_ms) / 1e3;
	if (timeBgm >= duration) isOutStart = true;
	if (showTransition.checked && isOutStart && !isOutEnd) {
		isOutEnd = true;
		qwqOut.play();
	}
	timeChart = Math.max(timeBgm - (app.chart.offset + Number(inputOffset.value) / 1e3 || 0) / app.speed, 0);
	//遍历判定线events和Note
	app.updateByTime(timeChart);
	//更新打击特效和触摸点动画
	hitFeedbackList.update();
	hitImageList.update();
	hitWordList.update();
	for (const i of hitManager.list) {
		if (i.type === 'keyboard') continue;
		if (!i.isTapped) hitFeedbackList.add(HitFeedback.tap(i.offsetX, i.offsetY));
		else if (i.isMoving) hitFeedbackList.add(HitFeedback.move(i.offsetX, i.offsetY)); //qwq
		else if (i.isActive) hitFeedbackList.add(HitFeedback.hold(i.offsetX, i.offsetY));
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
	// if (qwq[4] && stat.good + stat.bad) {
	// 	stat.level = Number(levelText.match(/\d+$/));
	// 	stat.reset();
	// 	Promise.resolve().then(qwqStop).then(qwqStop);
	// }
	tmps.bgImage = $id('imageBlur').checked ? app.bgImageBlur : app.bgImage;
	tmps.bgVideo = app.bgVideo;
	tmps.progress = (main.qwqwq ? duration - timeBgm : timeBgm) / duration;
	tmps.name = inputName.value || inputName.placeholder;
	tmps.artist = inputArtist.value;
	tmps.illustrator = inputIllustrator.value || inputIllustrator.placeholder;
	tmps.charter = inputCharter.value || inputCharter.placeholder;
	tmps.level = levelText;
	if (stat.combo > 2) {
		tmps.combo = `${stat.combo}`;
		tmps.combo2 = app.playMode === 1 ? 'Autoplay' : 'combo';
	} else tmps.combo = tmps.combo2 = '';
}

function loopCanvas() { //尽量不要在这里出现app
	const { lineScale } = app;
	ctxos.clearRect(0, 0, canvasos.width, canvasos.height); //重置画面
	//绘制背景
	ctxos.globalAlpha = 1;
	ctxos.drawImage(tmps.bgImage, ...adjustSize(tmps.bgImage, canvasos, 1));
	if (isInEnd && tmps.bgVideo && !main.qwqwq) {
		const { videoWidth: width, videoHeight: height } = tmps.bgVideo;
		ctxos.drawImage(tmps.bgVideo, ...adjustSize({ width, height }, canvasos, 1));
	}
	// if (qwq[4]) ctxos.filter = `hue-rotate(${stat.combo*360/7}deg)`;
	if (qwqIn.second >= 2.5 && !stat.lineStatus) drawLine(0, lineScale); //绘制判定线(背景后0)
	// if (qwq[4]) ctxos.filter = 'none';
	ctxos.resetTransform();
	ctxos.fillStyle = '#000'; //背景变暗
	ctxos.globalAlpha = app.brightness; //背景不透明度
	ctxos.fillRect(0, 0, canvasos.width, canvasos.height);
	// if (qwq[4]) ctxos.filter = `hue-rotate(${stat.combo*360/7}deg)`;
	if (qwqIn.second >= 2.5) drawLine(stat.lineStatus ? 2 : 1, lineScale); //绘制判定线(背景前1)
	// if (qwq[4]) ctxos.filter = 'none';
	ctxos.resetTransform();
	if (qwqIn.second >= 3 && qwqOut.second === 0) {
		//绘制note
		drawNotes();
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
				ctxos.fillText(i.lineId.toString(), 0, -lineScale * 0.3);
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
	// if (qwq[4]) ctxos.filter = `hue-rotate(${stat.combo*360/7}deg)`;
	hitImageList.animate(); //绘制打击特效1
	// if (qwq[4]) ctxos.filter = 'none';
	if (showCE2.checked) hitWordList.animate(); //绘制打击特效2
	ctxos.globalAlpha = 1;
	//绘制进度条
	ctxos.setTransform(canvasos.width / 1920, 0, 0, canvasos.width / 1920, 0, lineScale * (qwqIn.second < 0.67 ? tween.easeOutSine(qwqIn.second * 1.5) - 1 : -tween.easeOutSine(qwqOut.second * 1.5)) * 1.75);
	ctxos.drawImage(res['ProgressBar'], tmps.progress * 1920 - 1920, 0);
	//绘制文字
	ctxos.resetTransform();
	for (const i of main.after.values()) i();
	ctxos.fillStyle = '#fff';
	//开头过渡动画
	if (qwqIn.second < 3) {
		if (qwqIn.second < 0.67) ctxos.globalAlpha = tween.easeOutSine(qwqIn.second * 1.5);
		else if (qwqIn.second >= 2.5) ctxos.globalAlpha = tween.easeOutSine(6 - qwqIn.second * 2);
		ctxos.textAlign = 'center';
		//曲名、曲师、曲绘和谱师
		fillTextNode(tmps.name, app.wlen, app.hlen * 0.75, lineScale * 1.1, canvasos.width - lineScale * 1.5);
		fillTextNode(tmps.artist, app.wlen, app.hlen * 0.75 + lineScale * 1.25, lineScale * 0.55, canvasos.width - lineScale * 1.5);
		fillTextNode(`Illustration designed by ${tmps.illustrator}`, app.wlen, app.hlen * 1.25 + lineScale * 0.55, lineScale * 0.55, canvasos.width - lineScale * 1.5);
		fillTextNode(`Level designed by ${tmps.charter}`, app.wlen, app.hlen * 1.25 + lineScale * 1.4, lineScale * 0.55, canvasos.width - lineScale * 1.5);
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
	ctxos.setTransform(1, 0, 0, 1, 0, lineScale * (qwqIn.second < 0.67 ? tween.easeOutSine(qwqIn.second * 1.5) - 1 : -tween.easeOutSine(qwqOut.second * 1.5)) * 1.75);
	ctxos.font = `${lineScale * 0.95}px Custom,Noto Sans SC`;
	ctxos.textAlign = 'right';
	ctxos.fillText(stat.scoreStr, canvasos.width - lineScale * 0.65, lineScale * 1.375);
	if (showAcc.checked) {
		ctxos.font = `${lineScale * 0.66}px Custom,Noto Sans SC`;
		ctxos.fillText(stat.accStr, canvasos.width - lineScale * 0.65, lineScale * 2.05);
	}
	ctxos.textAlign = 'center';
	ctxos.font = `${lineScale * 1.32}px Custom,Noto Sans SC`;
	ctxos.fillText(tmps.combo, app.wlen, lineScale * 1.375);
	ctxos.globalAlpha = qwqIn.second < 0.67 ? tween.easeOutSine(qwqIn.second * 1.5) : 1 - tween.easeOutSine(qwqOut.second * 1.5);
	ctxos.font = `${lineScale * 0.66}px Custom,Noto Sans SC`;
	ctxos.fillText(tmps.combo2, app.wlen, lineScale * 2.05);
	//绘制曲名和等级
	ctxos.globalAlpha = 1;
	ctxos.setTransform(1, 0, 0, 1, 0, lineScale * (qwqIn.second < 0.67 ? 1 - tween.easeOutSine(qwqIn.second * 1.5) : tween.easeOutSine(qwqOut.second * 1.5)) * 1.75);
	ctxos.textAlign = 'right';
	fillTextNode(tmps.level, canvasos.width - lineScale * 0.75, canvasos.height - lineScale * 0.66, lineScale * 0.63, app.wlen - lineScale);
	ctxos.textAlign = 'left';
	fillTextNode(tmps.name, lineScale * 0.65, canvasos.height - lineScale * 0.66, lineScale * 0.63, app.wlen - lineScale);
	ctxos.resetTransform();
	if (qwqIn.second > 3 && main.filter) main.filter(ctxos, nowTime_ms / 1e3); //滤镜处理
	if ($id('feedback').checked) hitFeedbackList.animate(); //绘制打击特效0
	ctxos.resetTransform();
	//绘制时间和帧率以及note打击数
	ctxos.fillStyle = '#fff';
	if (qwqIn.second < 0.67) ctxos.globalAlpha = tween.easeOutSine(qwqIn.second * 1.5);
	else ctxos.globalAlpha = 1 - tween.easeOutSine(qwqOut.second * 1.5);
	ctxos.font = `${lineScale * 0.4}px Custom,Noto Sans SC`;
	ctxos.textAlign = 'left';
	ctxos.fillText(`${time2Str(main.qwqwq?duration-timeBgm:timeBgm)}/${time2Str(duration)}${status2.text}`, lineScale * 0.05, lineScale * 0.6);
	ctxos.textAlign = 'right';
	ctxos.fillText(frameTimer.fpsStr, canvasos.width - lineScale * 0.05, lineScale * 0.6);
	if (showStat.checked) {
		ctxos.textAlign = 'right';
		[stat.noteRank[6], stat.noteRank[7], stat.noteRank[5], stat.noteRank[4], stat.noteRank[1], stat.noteRank[3], stat.noteRank[2]].forEach((val, idx) => {
			const comboColor = ['#fe7b93', '#0ac3ff', 'lime', '#f0ed69', 'lime', '#0ac3ff', '#999'];
			ctxos.fillStyle = comboColor[idx];
			ctxos.fillText(val.toString(), canvasos.width - lineScale * 0.05, canvasos.height / 2 + lineScale * (idx - 2.8) * 0.5);
		});
		ctxos.fillStyle = '#fff';
		ctxos.textAlign = 'left';
		ctxos.fillText(`DSP:  ${stat.curDispStr}`, lineScale * 0.05, canvasos.height / 2 - lineScale * 0.15);
		ctxos.fillText(`AVG:  ${stat.avgDispStr}`, lineScale * 0.05, canvasos.height / 2 + lineScale * 0.35);
		ctxos.textAlign = 'center';
		stat.combos.forEach((val, idx) => {
			const comboColor = ['#fff', '#0ac3ff', '#f0ed69', '#a0e9fd', '#fe4365'];
			ctxos.fillStyle = comboColor[idx];
			ctxos.fillText(val.toString(), lineScale * (idx + 0.55) * 1.1, canvasos.height - lineScale * 0.1);
		});
	}
}
//判定线函数，undefined/0:默认,1:非,2:恒成立
function drawLine(bool, lineScale) {
	ctxos.globalAlpha = 1;
	const tw = 1 - tween.easeOutSine(qwqOut.second * 1.5);
	for (const i of app.linesReversed) {
		if (bool ^ Number(i.imageD) && qwqOut.second < 0.67) {
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

function qwqdraw3(statData) {
	ctxos.resetTransform();
	ctxos.clearRect(0, 0, canvasos.width, canvasos.height);
	ctxos.globalAlpha = 1;
	const bgImage = $id('imageBlur').checked ? app.bgImageBlur : app.bgImage;
	ctxos.drawImage(bgImage, ...adjustSize(bgImage, canvasos, 1));
	ctxos.fillStyle = '#000'; //背景变暗
	ctxos.globalAlpha = app.brightness; //背景不透明度
	ctxos.fillRect(0, 0, canvasos.width, canvasos.height);
	ctxos.globalCompositeOperation = 'destination-out';
	ctxos.globalAlpha = 1;
	const k = 3.7320508075688776; //tan75°
	ctxos.setTransform(canvasos.width - canvasos.height / k, 0, -canvasos.height / k, canvasos.height, canvasos.height / k, 0);
	ctxos.fillRect(0, 0, 1, tween.easeOutCubic(clip((qwqEnd.second - 0.13) * 0.94)));
	ctxos.resetTransform();
	ctxos.globalCompositeOperation = 'destination-over';
	const qwq0 = (canvasos.width - canvasos.height / k) / (16 - 9 / k);
	ctxos.setTransform(qwq0 / 120, 0, 0, qwq0 / 120, app.wlen - qwq0 * 8, app.hlen - qwq0 * 4.5); //?
	ctxos.drawImage(res['LevelOver4'], 183, 42, 1184, 228);
	ctxos.globalAlpha = clip((qwqEnd.second - 0.27) / 0.83);
	ctxos.drawImage(res['LevelOver1'], 102, 378);
	ctxos.globalCompositeOperation = 'source-over';
	ctxos.globalAlpha = 1;
	ctxos.drawImage(res['LevelOver5'], 700 * tween.easeOutCubic(clip(qwqEnd.second * 1.25)) - 369, 91, 20, 80);
	//曲名和等级
	ctxos.fillStyle = '#fff';
	ctxos.textAlign = 'left';
	fillTextNode(inputName.value || inputName.placeholder, 700 * tween.easeOutCubic(clip(qwqEnd.second * 1.25)) - 320, 160, 80, 1500);
	const lw = fillTextNode(levelText, 700 * tween.easeOutCubic(clip(qwqEnd.second * 1.25)) - 317, 212, 30, 750);
	ctxos.font = '30px Custom,Noto Sans SC';
	//Rank图标
	ctxos.globalAlpha = clip((qwqEnd.second - 1.87) * 3.75);
	const qwq2 = 293 + clip((qwqEnd.second - 1.87) * 3.75) * 100;
	const qwq3 = 410 - clip((qwqEnd.second - 1.87) * 2.14) * 164;
	ctxos.drawImage(res['LevelOver3'], 661 - qwq2 / 2, 545 - qwq2 / 2, qwq2, qwq2);
	ctxos.drawImage(res['Ranks'][stat.rankStatus], 661 - qwq3 / 2, 545 - qwq3 / 2, qwq3, qwq3);
	//各种数据
	ctxos.globalAlpha = clip((qwqEnd.second - 0.87) * 2.50);
	ctxos.fillStyle = statData.newBestColor;
	ctxos.fillText(statData.newBestStr, 898, 433);
	ctxos.fillStyle = '#fff';
	ctxos.textAlign = 'center';
	ctxos.fillText(statData.scoreBest, 1180, 433);
	ctxos.globalAlpha = clip((qwqEnd.second - 1.87) * 2.50);
	ctxos.textAlign = 'right';
	ctxos.fillText(statData.scoreDelta, 1414, 433);
	ctxos.globalAlpha = clip((qwqEnd.second - 0.95) * 1.50);
	ctxos.textAlign = 'left';
	ctxos.fillText(stat.accStr, 352, 550);
	ctxos.fillText(stat.maxcombo.toString(), 1528, 550);
	ctxos.fillStyle = statData.textAboveColor;
	ctxos.fillText(app.speed === 1 ? '' : statData.textAboveStr.replace('{SPEED}', app.speed.toFixed(2)), 383 + Math.min(lw, 750), 212);
	ctxos.fillStyle = statData.textBelowColor;
	ctxos.fillText(statData.textBelowStr, 1355, 595);
	ctxos.fillStyle = '#fff';
	ctxos.textAlign = 'center';
	ctxos.font = '86px Custom,Noto Sans SC';
	ctxos.globalAlpha = clip((qwqEnd.second - 1.12) * 2.00);
	ctxos.fillText(stat.scoreStr, 1075, 569);
	ctxos.font = '26px Custom,Noto Sans SC';
	ctxos.globalAlpha = clip((qwqEnd.second - 0.87) * 2.50);
	ctxos.fillText(stat.perfect.toString(), 891, 650);
	ctxos.globalAlpha = clip((qwqEnd.second - 1.07) * 2.50);
	ctxos.fillText(stat.good.toString(), 1043, 650);
	ctxos.globalAlpha = clip((qwqEnd.second - 1.27) * 2.50);
	ctxos.fillText(stat.noteRank[6].toString(), 1196, 650);
	ctxos.globalAlpha = clip((qwqEnd.second - 1.47) * 2.50);
	ctxos.fillText(stat.noteRank[2].toString(), 1349, 650);
	ctxos.font = '22px Custom,Noto Sans SC';
	const qwq4 = clip((main.pressTime > 0 ? qwqEnd.second - main.pressTime : 0.2 - qwqEnd.second - main.pressTime) * 5.00);
	ctxos.globalAlpha = 0.8 * clip((qwqEnd.second - 0.87) * 2.50) * qwq4;
	ctxos.fillStyle = '#696';
	ctxos.fill(new Path2D('M841,718s-10,0-10,10v80s0,10,10,10h100s10,0,10-10v-80s0-10-10-10h-40l-10-20-10,20h-40z'));
	ctxos.globalAlpha = 0.8 * clip((qwqEnd.second - 1.07) * 2.50) * qwq4;
	ctxos.fillStyle = '#669';
	ctxos.fill(new Path2D('M993,718s-10,0-10,10v80s0,10,10,10h100s10,0,10-10v-80s0-10-10-10h-40l-10-20-10,20h-40z'));
	ctxos.fillStyle = '#fff';
	ctxos.globalAlpha = clip((qwqEnd.second - 0.97) * 2.50) * qwq4;
	ctxos.fillText('Early: ' + stat.noteRank[5], 891, 759);
	ctxos.fillText('Late: ' + stat.noteRank[1], 891, 792);
	ctxos.globalAlpha = clip((qwqEnd.second - 1.17) * 2.50) * qwq4;
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

function clip(num) {
	if (num < 0) return 0;
	if (num > 1) return 1;
	return num;
}
class ScaledNote {
	constructor(img, scale, compacted) {
		this.img = img;
		this.scale = scale;
		const dx = -img.width / 2 * scale;
		const dy = -img.height / 2 * scale;
		const dw = img.width * scale;
		const dh = img.height * scale;
		/** @param {CanvasRenderingContext2D} ctx */
		this.full = ctx => ctx.drawImage(img, dx, dy, dw, dh);
		/** @param {CanvasRenderingContext2D} ctx */
		this.head = ctx => ctx.drawImage(img, dx, 0, dw, dh);
		/** @param {CanvasRenderingContext2D} ctx */
		this.body = (ctx, offset, length) => ctx.drawImage(img, dx, offset, dw, length);
		/** @param {CanvasRenderingContext2D} ctx */
		this.tail = (ctx, offset) => ctx.drawImage(img, dx, offset - dh, dw, dh);
		if (compacted) {
			/** @param {CanvasRenderingContext2D} ctx */
			this.head = ctx => ctx.drawImage(img, dx, dy, dw, dh);
			/** @param {CanvasRenderingContext2D} ctx */
			this.tail = (ctx, offset) => ctx.drawImage(img, dx, offset - dh - dy, dw, dh);
		}
	}
}
/**
 * @typedef {Object} HitFX
 * @property {ScaledNote[]} effects
 * @property {number} numOfParts
 * @property {number} duration
 */
const noteRender = {
	/** @type {Object<string,ScaledNote>} */
	note: {},
	/** @type {Object<string,HitFX>} */
	hitFX: {},
	/**
	 * @param {string} name
	 * @param {ImageBitmap} img
	 * @param {number} scale
	 */
	async update(name, img, scale, compacted) {
		this.note[name] = new ScaledNote(img, scale, compacted);
		if (name === 'Tap') this.note['TapBad'] = new ScaledNote(await imgPainter(img, '#6c4343'), scale);
	},
	async updateFX(img, scale, limitX, limitY, hideParts, duration) {
		const hitRaw = await imgSplit(img, limitX, limitY);
		const hitPerfect = hitRaw.map(async img => new ScaledNote(await imgShader(img, 'rgba(255,236,160,0.8823529)'), scale)); //#fce491,#ffeca0e1
		const hitGood = hitRaw.map(async img => new ScaledNote(await imgShader(img, 'rgba(180,225,255,0.9215686)'), scale)); //#9ed5f3,#b4e1ffeb
		img.close();
		this.hitFX['Perfect'] = {
			effects: await Promise.all(hitPerfect),
			numOfParts: hideParts ? 0 : 4,
			duration: duration | 0 || 500
		};
		this.hitFX['Good'] = {
			effects: await Promise.all(hitGood),
			numOfParts: hideParts ? 0 : 3,
			duration: duration | 0 || 500
		};
		hitRaw.forEach(img => img.close());
	}
};
//绘制Note
function drawNotes() {
	for (const i of app.holds) drawHold(i, timeChart);
	for (const i of app.dragsReversed) drawDrag(i);
	for (const i of app.tapsReversed) drawTap(i);
	for (const i of app.flicksReversed) drawFlick(i);
}
/** @param {NoteExtends} note */
function drawTap(note) {
	const HL = note.isMulti && app.multiHint;
	const nsr = app.noteScaleRatio;
	if (!note.visible || note.scored && !note.badTime) return;
	ctxos.setTransform(nsr * note.cosr, nsr * note.sinr, -nsr * note.sinr, nsr * note.cosr, note.offsetX, note.offsetY);
	if (note.badTime) {
		ctxos.globalAlpha = 1 - clip((performance.now() - note.badTime) / 500);
		noteRender.note['TapBad'].full(ctxos);
	} else {
		ctxos.globalAlpha = note.alpha || (note.showPoint && showPoint.checked ? 0.45 : 0);
		if (main.qwqwq) ctxos.globalAlpha *= Math.max(1 + (timeChart - note.realTime) / 1.5, 0); //过线前1.5s出现
		noteRender.note[HL ? 'TapHL' : 'Tap'].full(ctxos);
	}
}
/** @param {NoteExtends} note */
function drawDrag(note) {
	const HL = note.isMulti && app.multiHint;
	const nsr = app.noteScaleRatio;
	if (!note.visible || note.scored && !note.badTime) return;
	ctxos.setTransform(nsr * note.cosr, nsr * note.sinr, -nsr * note.sinr, nsr * note.cosr, note.offsetX, note.offsetY);
	if (note.badTime) {} else {
		ctxos.globalAlpha = note.alpha || (note.showPoint && showPoint.checked ? 0.45 : 0);
		if (main.qwqwq) ctxos.globalAlpha *= Math.max(1 + (timeChart - note.realTime) / 1.5, 0);
		noteRender.note[HL ? 'DragHL' : 'Drag'].full(ctxos);
	}
}
/** @param {NoteExtends} note */
function drawHold(note, realTime) {
	const HL = note.isMulti && app.multiHint;
	const nsr = app.noteScaleRatio;
	if (!note.visible || note.realTime + note.realHoldTime < realTime) return; //qwq
	ctxos.globalAlpha = note.alpha || (note.showPoint && showPoint.checked ? 0.45 : 0);
	if (main.qwqwq) ctxos.globalAlpha *= Math.max(1 + (timeChart - note.realTime) / 1.5, 0);
	ctxos.setTransform(nsr * note.cosr, nsr * note.sinr, -nsr * note.sinr, nsr * note.cosr, note.offsetX, note.offsetY);
	const baseLength = app.scaleY / nsr * note.speed * app.speed;
	const holdLength = baseLength * note.realHoldTime;
	if (note.realTime > realTime) {
		noteRender.note[HL ? 'HoldHeadHL' : 'HoldHead'].head(ctxos);
		noteRender.note[HL ? 'HoldHL' : 'Hold'].body(ctxos, -holdLength, holdLength);
	} else {
		noteRender.note[HL ? 'HoldHL' : 'Hold'].body(ctxos, -holdLength, holdLength - baseLength * (realTime - note.realTime));
	}
	noteRender.note['HoldEnd'].tail(ctxos, -holdLength);
}
/** @param {NoteExtends} note */
function drawFlick(note) {
	const HL = note.isMulti && app.multiHint;
	const nsr = app.noteScaleRatio;
	if (!note.visible || note.scored && !note.badTime) return;
	ctxos.setTransform(nsr * note.cosr, nsr * note.sinr, -nsr * note.sinr, nsr * note.cosr, note.offsetX, note.offsetY);
	if (note.badTime) {} else {
		ctxos.globalAlpha = note.alpha || (note.showPoint && showPoint.checked ? 0.45 : 0);
		if (main.qwqwq) ctxos.globalAlpha *= Math.max(1 + (timeChart - note.realTime) / 1.5, 0);
		noteRender.note[HL ? 'FlickHL' : 'Flick'].full(ctxos);
	}
}
//调节画面尺寸和全屏相关(返回source播放aegleseeker会出现迷之error)
/** @type {(arg0:{width:number,height:number},arg1:{width:number,height:number},arg2:number)=>[number,number,number,number]} */
function adjustSize(source, dest, scale) {
	const { width: sw, height: sh } = source;
	const { width: dw, height: dh } = dest;
	if (dw * sh > dh * sw) return [dw * (1 - scale) / 2, (dh - dw * sh / sw * scale) / 2, dw * scale, dw * sh / sw * scale];
	return [(dw - dh * sw / sh * scale) / 2, dh * (1 - scale) / 2, dh * sw / sh * scale, dh * scale];
}
/**@type {Map<ImageBitmap,LineImage>} */
const lineImages = new Map();
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
	const canvas = createCanvas(img.width, img.height);
	const { width: w, height: h } = canvas;
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
	const canvas = createCanvas(img.width, img.height);
	const ctx = canvas.getContext('2d', { willReadFrequently: true }); //warning
	ctx.drawImage(img, 0, 0);
	for (let dy = 0; dy < img.height; dy += limit) {
		for (let dx = 0; dx < img.width; dx += limit) {
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
	const canvas = createCanvas(img.width, img.height);
	const ctx = canvas.getContext('2d', { willReadFrequently: true }); //warning
	ctx.drawImage(img, 0, 0);
	for (let dy = 0; dy < img.height; dy += limit) {
		for (let dx = 0; dx < img.width; dx += limit) {
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
	limitX = Math.floor(limitX) || Math.min(img.width, img.height);
	limitY = Math.floor(limitY) || limitX;
	const arr = [];
	for (let dy = 0; dy < img.height; dy += limitY) {
		for (let dx = 0; dx < img.width; dx += limitX) {
			arr.push(createImageBitmap(img, dx, dy, limitX, limitY));
		}
	}
	return Promise.all(arr);
}
//十六进制color转rgba数组
function hex2rgba(color) {
	const ctx = createCanvas(1, 1).getContext('2d');
	ctx.fillStyle = color;
	ctx.fillRect(0, 0, 1, 1);
	return ctx.getImageData(0, 0, 1, 1).data;
}
//rgba数组(0-1)转十六进制
function rgba2hex(...rgba) {
	return '#' + rgba.map(i => ('00' + Math.round(Number(i) * 255 || 0).toString(16)).slice(-2)).join('');
}
//byte转人类可读
function bytefm(byte = 0) {
	if (byte < 1024) return `${byte}B`;
	byte /= 1024;
	if (byte < 1024) return `${byte.toFixed(2)}KB`;
	byte /= 1024;
	if (byte < 1024) return `${byte.toFixed(2)}MB`;
	byte /= 1024;
	if (byte < 1024) return `${byte.toFixed(2)}GB`;
	byte /= 1024;
	if (byte < 1024) return `${byte.toFixed(2)}TB`;
	byte /= 1024;
	if (byte < 1024) return `${byte.toFixed(2)}PB`;
	byte /= 1024;
	if (byte < 1024) return `${byte.toFixed(2)}EB`;
	byte /= 1024;
	if (byte < 1024) return `${byte.toFixed(2)}ZB`;
	byte /= 1024;
	if (byte < 1024) return `${byte.toFixed(2)}YB`;
	byte /= 1024;
	return `${byte}BB`;
}
//html交互(WIP)
class StatusManager {
	constructor(key) {
		this.key = key;
	}
	init(resetCallback) {
		this.data = JSON.parse(localStorage.getItem(this.key) || '{}');
		if (typeof resetCallback === 'function') resetCallback(this.data) && this.reset();
		return this;
	}
	save() {
		localStorage.setItem(this.key, JSON.stringify(this.data));
	}
	reset() {
		this.data = {};
		this.save();
	}
	get(key) {
		return this.data[key];
	}
	set(key, value) {
		this.data[key] = value;
		this.save();
	}
	reg(key, node, dispatch = true) {
		if (node instanceof HTMLInputElement || node instanceof HTMLSelectElement) {
			const property = node.type === 'checkbox' ? 'checked' : 'value';
			const value = this.get(key);
			if (value !== undefined) node[property] = value;
			node.addEventListener('change', () => this.set(key, node[property]));
			if (dispatch) node.dispatchEvent(new Event('change'));
		} else if (node instanceof HTMLTextAreaElement) {
			const value = this.get(key);
			if (value !== undefined) node.value = value;
			node.addEventListener('change', () => this.set(key, node.value));
			if (dispatch) node.dispatchEvent(new Event('change'));
		} else throw new Error('Node must be <input>, <select> or <textarea>');
	}
}
class Checkbox {
	constructor(text, checked = false) {
		this.container = document.createElement('div');
		this.checkbox = document.createElement('input');
		this.checkbox.type = 'checkbox';
		this.checkbox.id = Utils.randomUUID();
		this.checkbox.checked = checked;
		this.label = document.createElement('label');
		this.label.htmlFor = this.checkbox.id;
		this.label.textContent = text;
		this.container.appendChild(this.checkbox);
		this.container.appendChild(this.label);
	}
	get checked() {
		return this.checkbox.checked;
	}
	set checked(value) {
		this.checkbox.checked = value;
		this.checkbox.dispatchEvent(new Event('change'));
	}
	appendTo(container) {
		container.appendChild(this.container);
		return this;
	}
	appendBefore(node) {
		node.parentNode.insertBefore(this.container, node);
		return this;
	}
	toggle() {
		this.checked = !this.checkbox.checked;
	}
	/** @param {(arg0:HTMLInputElement,arg1:HTMLDivElement)=>void} callback */
	hook(callback = _ => {}) {
		callback(this.checkbox, this.container);
		return this;
	}
}
$id('select-note-scale').addEventListener('change', evt => app.setNoteScale(evt.target.value));
$id('select-aspect-ratio').addEventListener('change', evt => stage.resize(evt.target.value));
$id('select-background-dim').addEventListener('change', evt => app.brightness = Number(evt.target.value));
$id('highLight').addEventListener('change', evt => app.multiHint = evt.target.checked);
const status = new StatusManager('sim-phi-status').init(data => data.resetCfg);
status.reg('feedback', $id('feedback'));
status.reg('imageBlur', $id('imageBlur'));
status.reg('highLight', $id('highLight'));
status.reg('lineColor', $id('lineColor'));
status.reg('autoplay', $id('autoplay'));
status.reg('showTransition', $id('showTransition'));
const resetCfg = new Checkbox('恢复默认设置(刷新生效)').appendTo($id('view-cfg')).hook(status.reg.bind(status, 'resetCfg'));
const showCE2 = new Checkbox('Early/Late特效').appendBefore(resetCfg.container).hook(status.reg.bind(status, 'showCE2'));
const showPoint = new Checkbox('显示定位点').appendBefore(resetCfg.container).hook(status.reg.bind(status, 'showPoint'));
const showAcc = new Checkbox('显示Acc').appendBefore(resetCfg.container).hook(status.reg.bind(status, 'showAcc'));
const showStat = new Checkbox('显示统计').appendBefore(resetCfg.container).hook(status.reg.bind(status, 'showStat'));
const lowRes = new Checkbox('低分辨率').appendBefore(resetCfg.container).hook(status.reg.bind(status, 'lowRes'));
const lockOri = new Checkbox('横屏锁定', true).appendBefore(resetCfg.container).hook(status.reg.bind(status, 'lockOri'));
const maxFrame = new Checkbox('限制帧率').appendBefore(resetCfg.container).hook(status.reg.bind(status, 'maxFrame'));
const autoDelay = new Checkbox('音画实时同步(若声音卡顿则建议关闭)', true).appendBefore(resetCfg.container).hook(status.reg.bind(status, 'autoDelay'));
const enableVP = new Checkbox('隐藏距离较远的音符').appendBefore(resetCfg.container).hook(status.reg.bind(status, 'enableVP'));
enableVP.checkbox.addEventListener('change', ( /** @type {Event&{target:HTMLInputElement}} */ evt) => app.enableVP = evt.target.checked);
enableVP.checkbox.dispatchEvent(new Event('change'));
const enableFR = new Checkbox('使用单精度浮点运算').appendBefore(resetCfg.container).hook(status.reg.bind(status, 'enableFR'));
enableFR.checkbox.addEventListener('change', ( /** @type {Event&{target:HTMLInputElement}} */ evt) => app.enableFR = evt.target.checked);
enableFR.checkbox.dispatchEvent(new Event('change'));
const selectbg = $id('select-bg');
const btnPlay = $id('btn-play');
const btnPause = $id('btn-pause');
const selectbgm = $id('select-bgm');
const selectchart = $id('select-chart');
const selectflip = $id('select-flip');
selectflip.addEventListener('change', ( /** @type {Event&{target:HTMLInputElement}} */ evt) => app.mirrorView(parseInt(evt.target.value)));
status.reg('selectFlip', selectflip);
const selectspeed = $id('select-speed');
selectspeed.addEventListener('change', ( /** @type {Event&{target:HTMLInputElement}} */ evt) => {
	const dict = { Slowest: -9, Slower: -4, '': 0, Faster: 3, Fastest: 5 };
	app.speed = 2 ** (dict[evt.target.value] / 12);
});
status.reg('selectSpeed', selectspeed);
const inputName = $id('input-name');
const inputArtist = $id('input-artist');
const inputCharter = $id('input-charter');
const inputIllustrator = $id('input-illustrator');
const selectDifficulty = $id('select-difficulty');
const selectLevel = $id('select-level');
const updateLevelText = type => {
	const table = { SP: [0, 0], EZ: [1, 7], HD: [3, 12], IN: [6, 15], AT: [13, 16] };
	let diffStr = selectDifficulty.value || 'SP';
	let levelNum = Number(selectLevel.value) | 0;
	if (type === 0) {
		const diff = table[diffStr];
		if (levelNum < diff[0]) levelNum = diff[0];
		if (levelNum > diff[1]) levelNum = diff[1];
		selectLevel.value = levelNum.toString();
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
	return [diffString, levelString].join('\u2002Lv.');
};
levelText = updateLevelText();
selectDifficulty.addEventListener('change', () => levelText = updateLevelText(0));
selectLevel.addEventListener('change', () => levelText = updateLevelText(1));
$id('select-volume').addEventListener('change', ( /** @type {Event&{target:HTMLSelectElement}} */ evt) => {
	const volume = Number(evt.target.value);
	app.musicVolume = Math.min(1, 1 / volume);
	app.soundVolume = Math.min(1, volume);
	Promise.resolve().then(qwqPause).then(qwqPause);
});
status.reg('selectVolume', $id('select-volume'));
const inputOffset = $id('input-offset');
const lineColor = $id('lineColor');
$id('autoplay').addEventListener('change', ( /** @type {Event&{target:HTMLInputElement}} */ evt) => {
	app.playMode = evt.target.checked ? 1 : 0;
});
$id('autoplay').dispatchEvent(new Event('change'));
const showTransition = $id('showTransition');
lowRes.checkbox.addEventListener('change', ( /** @type {Event&{target:HTMLInputElement}} */ evt) => {
	app.setLowResFactor(evt.target.checked ? 0.5 : 1);
});
lowRes.checkbox.dispatchEvent(new Event('change'));
selectbg.onchange = () => { //qwq
	app.bgImage = bgs.get(selectbg.value);
	app.bgImageBlur = bgsBlur.get(selectbg.value);
	stage.resize();
}
selectchart.addEventListener('change', adjustInfo);
(function() {
	const input = document.createElement('input');
	Object.assign(input, { type: 'number', min: 25, max: 1000, value: 60 });
	input.style.cssText += ';width:50px;margin-left:10px';
	input.addEventListener('change', function() {
		if (Number(this.value) < 25) this.value = '25';
		if (Number(this.value) > 1000) this.value = '1000';
		frameAnimater.setFrameRate(this.value);
	});
	status.reg('maxFrameNumber', input, false);
	maxFrame.container.appendChild(input);
	maxFrame.checkbox.addEventListener('change', function() {
		input.classList.toggle('disabled', !this.checked);
		if (this.checked) input.dispatchEvent(new Event('change'));
		else frameAnimater.setFrameRate(0);
	});
	maxFrame.checkbox.dispatchEvent(new Event('change'));
})();
//play
emitter.addEventListener('change', /** @this {Emitter} */ function() {
	canvas.classList.toggle('fade', this.eq('stop'));
	$id('mask').classList.toggle('fade', this.ne('stop'));
	btnPlay.value = this.eq('stop') ? '播放' : '停止';
	btnPause.value = this.eq('pause') ? '继续' : '暂停';
	btnPause.classList.toggle('disabled', this.eq('stop'));
	for (const i of $$('.disabled-when-playing')) i.classList.toggle('disabled', this.ne('stop'));
	// console.log(this);
});
btnPlay.addEventListener('click', async function() {
	if (this.classList.contains('disabled')) return;
	this.classList.add('disabled');
	await qwqStop();
	this.classList.remove('disabled');
});
btnPause.addEventListener('click', async function() {
	if (this.classList.contains('disabled')) return;
	this.classList.add('disabled');
	await qwqPause();
	this.classList.remove('disabled');
});
inputOffset.addEventListener('input', function() {
	const value = Number(this.value);
	if (value < -400) this.value = -400;
	if (value > 600) this.value = 600;
});
status2.reg(emitter, 'change', _ => main.qwqwq ? 'Reversed' : ''); //qwq
status2.reg(selectflip, 'change', target => ['', 'FlipX', 'FlipY', 'FlipX&Y'][target.value]);
status2.reg(selectspeed, 'change', target => target.value);
status2.reg(emitter, 'change', ( /** @type {Emitter} */ target) => target.eq('pause') ? 'Paused' : '');
async function qwqStop() {
	if (emitter.eq('stop')) {
		if (!selectchart.value) return msgHandler.sendError('错误：未选择任何谱面');
		if (!selectbgm.value) return msgHandler.sendError('错误：未选择任何音乐');
		for (const i of main.before.values()) await i();
		audio.play(res['mute'], { loop: true, isOut: false }); //播放空音频(避免音画不同步)
		app.prerenderChart(main.modify(charts.get(selectchart.value))); //fuckqwq
		const md5 = chartsMD5.get(selectchart.value);
		stat.level = Number(levelText.match(/\d+$/));
		stat.reset(app.chart.numOfNotes, md5, selectspeed.value);
		await loadLineData();
		app.bgImage = bgs.get(selectbg.value) || res['NoImageWhite'];
		app.bgImageBlur = bgsBlur.get(selectbg.value) || res['NoImageWhite'];
		const bgm = bgms.get(selectbgm.value);
		app.bgMusic = bgm.audio;
		app.bgVideo = bgm.video;
		duration = app.bgMusic.duration / app.speed;
		isInEnd = false;
		isOutStart = false;
		isOutEnd = false;
		timeBgm = 0;
		if (!showTransition.checked) qwqIn.addTime(3e3);
		frameAnimater.start();
		qwqIn.play();
		interact.activate();
		emitter.emit('play');
	} else {
		emitter.emit('stop');
		interact.deactive();
		audio.stop();
		frameAnimater.stop();
		//清除原有数据
		fucktemp1 = false;
		fucktemp2 = null;
		hitFeedbackList.clear();
		hitImageList.clear();
		hitWordList.clear();
		qwqIn.reset();
		qwqOut.reset();
		qwqEnd.reset();
		curTime = 0;
		curTime_ms = 0;
		duration = 0;
	}
}
async function loadLineData() {
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
}
async function qwqPause() {
	if (emitter.eq('stop') || fucktemp1) return;
	if (emitter.eq('play')) {
		if (app.bgVideo) app.bgVideo.pause();
		qwqIn.pause();
		if (showTransition.checked && isOutStart) qwqOut.pause();
		curTime = timeBgm;
		audio.stop();
		emitter.emit('pause');
	} else {
		if (app.bgVideo) await playVideo(app.bgVideo, timeBgm * app.speed);
		qwqIn.play();
		if (showTransition.checked && isOutStart) qwqOut.play();
		if (isInEnd && !isOutStart) playBgm(app.bgMusic, timeBgm * app.speed);
		// console.log(app.bgVideo);
		emitter.emit('play');
	}
}
//plugins
/** @type {(arg0:string,arg1:Function)=>void} */
const loadPlugin = (searchValue, callback) => {
	const _this = inputName;
	_this.addEventListener('input', function() {
		if (_this.value === searchValue) setTimeout(() => {
			if (_this.value === searchValue) {
				callback();
				_this.value = '';
				_this.dispatchEvent(new Event('input'));
			}
		}, 1e3);
	});
};
const appendCfg = (name, callback) => new Checkbox(name).appendBefore(resetCfg.container).hook(callback);
main.fireModal = function(navHTML, contentHTML) {
	const cover = document.createElement('div');
	cover.classList.add('cover-dark', 'fade');
	const container = document.createElement('div');
	container.classList.add('cover-view', 'fade');
	const nav = document.createElement('div');
	nav.classList.add('view-nav');
	nav.innerHTML = navHTML;
	const content = document.createElement('div');
	content.classList.add('view-content');
	content.innerHTML = contentHTML;
	container.append(nav, content);
	requestAnimationFrame(() => {
		$('.main').append(cover, container);
		requestAnimationFrame(() => {
			cover.classList.remove('fade');
			container.classList.remove('fade');
		});
	});
	cover.addEventListener('click', () => {
		cover.classList.add('fade');
		cover.addEventListener('transitionend', () => cover.remove());
		container.classList.add('fade');
		container.addEventListener('transitionend', () => container.remove());
	});
}
main.toast = msg => main.fireModal('<p>提示</p>', `<p style="white-space:pre;text-align:left;display:inline-block;">${msg}</p>`);
main.define = (a) => { return a };
/**
 * @typedef {{type:'command',meta:[string,function]}} PluginCommand
 * @typedef {{type:'script',meta:[function]}} PluginScript
 * @typedef {{type:'config',meta:[string,function]}} PluginConfig
 * @typedef {PluginCommand|PluginScript|PluginConfig} Plugin
 * @typedef {{contents:Plugin[]}} PluginModule
 */
main.use = async src => {
	/** @type {PluginModule}} */
	const module = await import('' + src).then(m => m['default']);
	for (const i of module.contents) {
		if (i.type === 'command') loadPlugin(i.meta[0], i.meta[1]);
		else if (i.type === 'script') i.meta[0]($('.title'));
		else if (i.type === 'config') appendCfg(i.meta[0], i.meta[1]);
		else throw new TypeError(`Unknown Plugin Type: ${i['type']}`);
	}
	console.log(module);
	return module;
};
main.use('./extends/phizone.js');
main.use('./extends/tips.js');
main.use('./extends/filter.js');
main.use('./extends/skin.js');
main.use('./extends/export.js');
main.use('./extends/gauge.js');
//debug
export const hook = self['hook'] = main;
main.stat = stat;
main.app = app;
main.res = res;
main.audio = audio;
main.msgHandler = msgHandler;
main.frameAnimater = frameAnimater;
main.qwqEnd = qwqEnd;
main.bgms = bgms;
main.selectbgm = selectbgm;
main.selectchart = selectchart;
main.chartsMD5 = chartsMD5;
main.noteRender = noteRender;
main.ZipReader = ZipReader;
main.status = status;
main.tmps = tmps;
main.qwq = qwq;
main.qwqwq = false;
main.pause = () => emitter.eq('play') && qwqPause();
Object.defineProperty(main, 'playing', {
	get: () => emitter.eq('play'),
	// set: v => v ? qwqPause() : qwqPause()
});
Object.defineProperty(main, 'time', {
	get: () => timeBgm,
	set: async v => {
		if (emitter.eq('stop') || fucktemp1) return;
		const isPlaying = emitter.eq('play');
		if (isPlaying) await qwqPause();
		curTime = timeBgm = v;
		// app.notes.forEach(a => { a.status = 0;
		// 	a.scored = 0;
		// 	a.holdStatus = 1; });
		// stat.reset();
		if (isPlaying) await qwqPause();
	}
});