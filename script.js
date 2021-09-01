"use strict";
const _i = ['Phigros模拟器', [1, 4, 2], 1611795955, 1630495196];
document.oncontextmenu = e => e.returnValue = false;
const upload = document.getElementById("upload");
const uploads = document.getElementById("uploads");
const out = document.getElementById("output");
const stage = document.getElementById("stage");
const select = document.getElementById("select");
const selectbg = document.getElementById("select-bg");
const btnPlay = document.getElementById("btn-play");
const btnPause = document.getElementById("btn-pause");
//
selectbg.onchange = () => {
	Renderer.backgroundImage = bgs[selectbg.value];
	resizeCanvas();
}
const selectbgm = document.getElementById("select-bgm");
const selectchart = document.getElementById("select-chart");
const selectscaleratio = document.getElementById("select-scale-ratio"); //数值越大note越小
const selectaspectratio = document.getElementById("select-aspect-ratio");
const selectglobalalpha = document.getElementById("select-global-alpha");
document.getElementById("cover-dark").addEventListener("click", () => {
	document.getElementById("cover-dark").classList.add("fade");
	document.getElementById("cover-view").classList.add("fade");
});
document.getElementById("qwq").addEventListener("click", () => {
	document.getElementById("cover-dark").classList.remove("fade");
	document.getElementById("cover-view").classList.remove("fade");
});
selectchart.addEventListener("change", adjustInfo);
//自动填写歌曲信息
function adjustInfo() {
	for (const i of chartInfoData) {
		if (selectchart.value == i.Chart) {
			if (bgms[i.Music]) selectbgm.value = i.Music;
			if (bgs[i.Image]) selectbg.value = i.Image;
			if (!!Number(i.AspectRatio)) selectaspectratio.value = i.AspectRatio;
			if (!!Number(i.ScaleRatio)) selectscaleratio.value = i.ScaleRatio;
			if (!!Number(i.GlobalAlpha)) selectglobalalpha.value = i.GlobalAlpha;
			inputName.value = i.Name;
			inputLevel.value = i.Level;
			inputIllustrator.value = i.Illustrator;
			inputDesigner.value = i.Designer;
		}
	}
}
//
const inputName = document.getElementById("input-name");
const inputLevel = document.getElementById("input-level");
const inputDesigner = document.getElementById("input-designer");
const inputIllustrator = document.getElementById("input-illustrator");
const showPoint = document.getElementById("showPoint");
const lineColor = document.getElementById("lineColor");
const autoplay = document.getElementById("autoplay");
const showTransition = document.getElementById("showTransition");
const videoRecorder = document.getElementById("videoRecorder");
const bgs = {};
const bgms = {};
const charts = {};
const chartLineData = [];
const chartInfoData = [];
const canvas = document.getElementById("canvas");
const canvasbg = document.getElementById("canvas-bg");
//调节画面尺寸和全屏相关
const adjustSize = (sw, sh, dw, dh) => (dw * sh > dh * sw) ? [0, (dh - dw * sh / sw) / 2, dw, dw * sh / sw] : [(dw - dh * sw / sh) / 2, 0, dh * sw / sh, dh];
const AspectRatio = 16 / 9; //宽高比上限
const Deg = Math.PI / 180; //角度转弧度
let wlen, hlen, wlen2, noteScale, lineScale; //背景图相关
const Renderer = { //存放谱面
	chart: null,
	backgroundImage: null,
	backgroundMusic: null
};
canvas.style.cssText = `max-width:calc(100vh*${AspectRatio});`;
resizeCanvas();
window.addEventListener("resize", resizeCanvas);
selectscaleratio.addEventListener("change", resizeCanvas);
selectaspectratio.addEventListener("change", resizeCanvas);
//适应画面尺寸
function resizeCanvas() {
	const width = window.innerWidth * window.devicePixelRatio;
	const height = window.innerHeight * window.devicePixelRatio;
	if (document.fullscreenElement) {
		canvasbg.classList.remove("hide");
		canvas.width = Math.min(width, height * AspectRatio);
		canvas.height = height;
		canvasbg.width = width;
		canvasbg.height = height;
	} else {
		canvasbg.classList.add("hide");
		canvas.width = width;
		canvas.height = canvas.width / selectaspectratio.value;
	}
	wlen = canvas.width / 2;
	hlen = canvas.height / 2;
	wlen2 = canvas.width / 18;
	noteScale = canvas.width / Number(selectscaleratio.value); //note、特效缩放
	lineScale = canvas.width > canvas.height * 0.75 ? canvas.height / 18.75 : canvas.width / 14.0625; //判定线、文字缩放
}
//qwq[water,demo,democlick]
const qwq = [true, false, 3];
document.getElementById("demo").classList.add("hide");
videoRecorder.nextElementSibling.classList.add("hide");
document.querySelector(".title").addEventListener("click", function() {
	if (qwq[1]) qwq[0] = !qwq[0];
	else if (!--qwq[2]) {
		document.getElementById("demo").classList.remove("hide");
		videoRecorder.nextElementSibling.classList.remove("hide");
	}
});
document.getElementById("demo").addEventListener("click", function() {
	document.getElementById("demo").classList.add("hide");
	uploads.classList.add("disabled");
	const xhr = new XMLHttpRequest();
	xhr.open("get", "./src/demo.png", true); //避免gitee的404
	xhr.responseType = 'blob';
	xhr.send();
	xhr.onprogress = progress => { //显示加载文件进度
		out.className = "accept";
		out.innerText = `加载文件：${Math.floor(progress.loaded / 6331675 * 100)}%`;
	};
	xhr.onload = () => {
		document.getElementById("filename").value = "demo.zip";
		loadFile(xhr.response);
	};
});
//点击特效(以后会改)
class Clicks extends Array {

}
const clicks = new Clicks(); //存放点击事件，用于检测
const taps = []; //额外处理tap(试图修复吃音bug)
const specialClick = {
	time: [0, 0, 0],
	func: [() => {
		btnPause.click();
	}, () => {
		btnPlay.click();
		btnPlay.click();
	}, () => {
		if (document.fullscreenElement) document.exitFullscreen().then(resizeCanvas);
		else stage.requestFullscreen().then(resizeCanvas);
	}],
	click: function(id) {
		const now = Date.now();
		if (now - this.time[id] < 300) this.func[id]();
		this.time[id] = now;
	}
}
class Click {
	constructor(offsetX, offsetY, isActive) {
		this.offsetX = Number(offsetX) || 0;
		this.offsetY = Number(offsetY) || 0;
		this.isActive = !!isActive;
		this.isMoving = false;
		this.time = 0;
	}
	static activate(offsetX, offsetY) {
		taps.push(new Click(offsetX, offsetY, true));
		if (offsetX < lineScale * 1.5 && offsetY < lineScale * 1.5) specialClick.click(0);
		if (offsetX > canvas.width - lineScale * 1.5 && offsetY < lineScale * 1.5) specialClick.click(1);
		if (offsetX > canvas.width - lineScale * 1.5 && offsetY > canvas.height - lineScale * 1.5) specialClick.click(2);
		return new Click(offsetX, offsetY, true);
	}
	move(offsetX, offsetY) {
		this.offsetX = Number(offsetX) || 0;
		this.offsetY = Number(offsetY) || 0;
		this.isMoving = true;
		this.time = 0;
	}
	animate() {
		if (!this.time++) {
			if (this.isMoving) clickEvents.push(ClickEvent.getClickMove(this.offsetX, this.offsetY));
			else clickEvents.push(ClickEvent.getClickTap(this.offsetX, this.offsetY));
		} else clickEvents.push(ClickEvent.getClickHold(this.offsetX, this.offsetY));
	}
	disactivate() {
		this.isActive = false;
	}
}
class Judgement {
	constructor(offsetX, offsetY, type) {
		this.offsetX = Number(offsetX) || 0;
		this.offsetY = Number(offsetY) || 0;
		this.type = Number(type) || 0; //1-Tap,2-Hold,3-Move
	}
	isInArea(x, y, cosr, sinr, hw) {
		return Math.abs((this.offsetX - x) * cosr + (this.offsetY - y) * sinr) <= hw;
	}
}
class Judgements extends Array {
	addJudgement(notes, realTime) {
		this.length = 0;
		if (!autoplay.checked) {
			for (const i of clicks) {
				if (i instanceof Click && i.isActive) {
					if (!i.time) {
						if (i.isMoving) this.push(new Judgement(i.offsetX, i.offsetY, 3));
						//else this.push(new Judgement(i.offsetX, i.offsetY, 1));
					} else this.push(new Judgement(i.offsetX, i.offsetY, 2));
				}
			}
			for (const i of taps) {
				if (i instanceof Click) this.push(new Judgement(i.offsetX, i.offsetY, 1));
			}
		} else {
			for (const i of notes) {
				if (i.scored) continue;
				if (i.type == 1) {
					if (i.realTime - realTime < 0) this.push(new Judgement(i.offsetX, i.offsetY, 1));
				} else if (i.type == 2) {
					if (i.realTime - realTime < 0) this.push(new Judgement(i.offsetX, i.offsetY, 2));
				} else if (i.type == 3) {
					if (i.status3) this.push(new Judgement(i.offsetX, i.offsetY, 2));
					else if (i.realTime - realTime < 0) this.push(new Judgement(i.offsetX, i.offsetY, 1));
				} else if (i.type == 4) {
					if (i.realTime - realTime < 0) this.push(new Judgement(i.offsetX, i.offsetY, 3));
				}
			}
		}
	};
	judgeNote(notes, realTime, width) {
		for (const i of notes) {
			if (i.scored) continue;
			if (i.realTime - realTime < -0.16 && !i.status2) {
				//console.log("Miss", i.name);
				i.status = 4;
				stat.addCombo(4, i.type);
				i.scored = true;
			} else if (i.type == 1) {
				for (let j = 0; j < this.length; j++) {
					if (this[j].type == 1 && this[j].isInArea(i.offsetX, i.offsetY, i.cosr, i.sinr, width) && i.realTime - realTime < 0.2 && i.realTime - realTime > -0.16) {
						if (i.realTime - realTime > 0.16) {
							//console.log("Bad", i.name);
							i.status = 3;
							clickEvents.push(ClickEvent.getClickBad(i.offsetX, i.offsetY, i.cosr, i.sinr));
						} else if (i.realTime - realTime > 0.08) {
							//console.log("Good(Early)", i.name);
							i.status = 2;
							if (document.getElementById("hitSong").checked) playSound(res["HitSong0"], false, true, videoRecorder.checked, 0);
							clickEvents.push(ClickEvent.getClickGood(i.projectX, i.projectY));
						} else if (i.realTime - realTime > -0.08) {
							//console.log("Perfect", i.name);
							i.status = 1;
							if (document.getElementById("hitSong").checked) playSound(res["HitSong0"], false, true, videoRecorder.checked, 0);
							clickEvents.push(ClickEvent.getClickPerfect(i.projectX, i.projectY));
						} else {
							//console.log("Good(Late)", i.name);
							i.status = 2;
							if (document.getElementById("hitSong").checked) playSound(res["HitSong0"], false, true, videoRecorder.checked, 0);
							clickEvents.push(ClickEvent.getClickGood(i.projectX, i.projectY));
						}
						stat.addCombo(i.status, 1);
						i.scored = true;
						this.splice(j, 1);
						break;
					}
				}
			} else if (i.type == 2) {
				if (i.status == 1 && i.realTime - realTime < 0) {
					if (document.getElementById("hitSong").checked) playSound(res["HitSong1"], false, true, videoRecorder.checked, 0);
					clickEvents.push(ClickEvent.getClickPerfect(i.projectX, i.projectY));
					stat.addCombo(1, 2);
					i.scored = true;
				} else if (!i.status) {
					for (let j = 0; j < this.length; j++) {
						if (this[j].isInArea(i.offsetX, i.offsetY, i.cosr, i.sinr, width) && i.realTime - realTime < 0.16 && i.realTime - realTime > -0.16) {
							//console.log("Perfect", i.name);
							i.status = 1;
							break;
						}
					}
				}
			} else if (i.type == 3) {
				if (i.status3) {
					if (Date.now() - i.status3 >= 150) {
						if (i.status2 == 1) clickEvents.push(ClickEvent.getClickPerfect(i.projectX, i.projectY));
						else if (i.status2 == 2) clickEvents.push(ClickEvent.getClickGood(i.projectX, i.projectY));
						i.status3 = Date.now();
					}
					if (i.realTime + i.realHoldTime - 0.2 < realTime) {
						if (!i.status) stat.addCombo(i.status = i.status2, 3);
						if (i.realTime + i.realHoldTime < realTime) i.scored = true;
						continue;
					}
				}
				i.status4 = true;
				for (let j = 0; j < this.length; j++) {
					if (!i.status3) {
						if (this[j].type == 1 && this[j].isInArea(i.offsetX, i.offsetY, i.cosr, i.sinr, width) && i.realTime - realTime < 0.16 && i.realTime - realTime > -0.16) {
							if (document.getElementById("hitSong").checked) playSound(res["HitSong0"], false, true, videoRecorder.checked, 0);
							if (i.realTime - realTime > 0.08) {
								//console.log("Good(Early)", i.name);
								i.status2 = 2;
								clickEvents.push(ClickEvent.getClickGood(i.projectX, i.projectY));
								i.status3 = Date.now();
							} else if (i.realTime - realTime > -0.08) {
								//console.log("Perfect", i.name);
								i.status2 = 1;
								clickEvents.push(ClickEvent.getClickPerfect(i.projectX, i.projectY));
								i.status3 = Date.now();
							} else {
								//console.log("Good(Late)", i.name);
								i.status2 = 2;
								clickEvents.push(ClickEvent.getClickGood(i.projectX, i.projectY));
								i.status3 = Date.now();
							}
							this.splice(j, 1);
							i.status4 = false;
							break;
						}
					} else if (this[j].isInArea(i.offsetX, i.offsetY, i.cosr, i.sinr, width)) i.status4 = false;
				}
				if (!isPaused && i.status3 && i.status4) {
					//console.log("Miss", i.name);
					i.status = 4;
					stat.addCombo(4, 3);
					i.scored = true;
				}
			} else if (i.type == 4) {
				if (i.status == 1 && i.realTime - realTime < 0) {
					if (document.getElementById("hitSong").checked) playSound(res["HitSong2"], false, true, videoRecorder.checked, 0);
					clickEvents.push(ClickEvent.getClickPerfect(i.projectX, i.projectY));
					stat.addCombo(1, 4);
					i.scored = true;
				} else if (!i.status) {
					for (let j = 0; j < this.length; j++) {
						if (this[j].type == 3 && this[j].isInArea(i.offsetX, i.offsetY, i.cosr, i.sinr, width) && i.realTime - realTime < 0.16 && i.realTime - realTime > -0.16) {
							//console.log("Perfect", i.name);
							i.status = 1;
							break;
						}
					}
				}
			}
		}
	}
}
const judgements = new Judgements();
class ClickEvents extends Array {
	defilter(func) {
		var i = this.length;
		while (i--) {
			if (func(this[i])) this.splice(i, 1);
		}
		return this;
	}
}
const clickEvents = new ClickEvents(); //存放点击特效
class ClickEvent {
	constructor(offsetX, offsetY, type, n1, n2, n3) {
		this.offsetX = Number(offsetX) || 0;
		this.offsetY = Number(offsetY) || 0;
		this.type = Number(type) || 0;
		switch (this.type) {
			case 0:
				this.color = String(n1);
				this.text = String(n2);
				this.time = 0;
				break;
			case 1:
				this.time = Date.now();
				this.duration = 500;
				this.images = res.Clicks[n1]; //以后做缺少检测
				this.color = String(n3);
				this.rand = [];
				for (let i = 0; i < (Number(n2) || 0); i++) this.rand.push([Math.random() * 80 + 185, Math.random() * 2 * Math.PI]); //qwq
				break;
			case 2:
				this.time = Date.now();
				this.duration = 500;
				this.image = n1;
				this.cosr = n2;
				this.sinr = n3;
				break;
			default:
		}
	}
	static getClickTap(offsetX, offsetY) {
		//console.log("Tap", offsetX, offsetY);
		return new ClickEvent(offsetX, offsetY, 0, "cyan", "");
	}
	static getClickHold(offsetX, offsetY) {
		//console.log("Hold", offsetX, offsetY);
		return new ClickEvent(offsetX, offsetY, 0, "lime", "");
	}
	static getClickMove(offsetX, offsetY) {
		//console.log("Move", offsetX, offsetY);
		return new ClickEvent(offsetX, offsetY, 0, "violet", "");
	}
	static getClickPerfect(offsetX, offsetY) {
		return new ClickEvent(offsetX, offsetY, 1, "rgba(255,236,160,0.8823529)", 4, "#ffeca0");
	}
	static getClickGood(offsetX, offsetY) {
		return new ClickEvent(offsetX, offsetY, 1, "rgba(180,225,255,0.9215686)", 3, "#b4e1ff");
	}
	static getClickBad(offsetX, offsetY, cosr, sinr) {
		return new ClickEvent(offsetX, offsetY, 2, res.TapBad, cosr, sinr);
	}
}
//适配PC鼠标
const isMouseDown = [];
canvas.addEventListener("mousedown", evt => {
	evt.preventDefault();
	const idx = evt.button;
	const i = evt;
	clicks[idx] = Click.activate((i.pageX - getOffsetLeft(canvas)) / canvas.offsetWidth * canvas.width, (i.pageY - getOffsetTop(canvas)) / canvas.offsetHeight * canvas.height);
	isMouseDown[idx] = true;
});
canvas.addEventListener("mousemove", evt => {
	evt.preventDefault();
	for (const idx in isMouseDown) {
		if (isMouseDown[idx]) {
			const i = evt;
			clicks[idx].move((i.pageX - getOffsetLeft(canvas)) / canvas.offsetWidth * canvas.width, (i.pageY - getOffsetTop(canvas)) / canvas.offsetHeight * canvas.height);
		}
	}
});
canvas.addEventListener("mouseup", evt => {
	evt.preventDefault();
	const idx = evt.button;
	clicks[idx].disactivate();
	isMouseDown[idx] = false;
});
canvas.addEventListener("mouseout", evt => {
	evt.preventDefault();
	for (const idx in isMouseDown) {
		if (isMouseDown[idx]) {
			clicks[idx].disactivate();
			isMouseDown[idx] = false;
		}
	}
});
//适配移动设备
const passive = {
	passive: false
}; //不加这玩意会出现warning
canvas.addEventListener("touchstart", evt => {
	for (const i of evt.changedTouches) {
		const idx = i.identifier; //移动端存在多押bug(可能已经解决了？)
		clicks[idx] = Click.activate((i.pageX - getOffsetLeft(canvas)) / canvas.offsetWidth * canvas.width, (i.pageY - getOffsetTop(canvas)) / canvas.offsetHeight * canvas.height);
	}
}, passive);
canvas.addEventListener("touchmove", evt => {
	evt.preventDefault();
	for (const i of evt.changedTouches) {
		const idx = i.identifier;
		clicks[idx].move((i.pageX - getOffsetLeft(canvas)) / canvas.offsetWidth * canvas.width, (i.pageY - getOffsetTop(canvas)) / canvas.offsetHeight * canvas.height);
	}
}, passive);
canvas.addEventListener("touchend", evt => {
	evt.preventDefault();
	for (const i of evt.changedTouches) {
		const idx = i.identifier;
		clicks[idx].disactivate();
	}
});
canvas.addEventListener("touchcancel", evt => {
	for (const i of evt.changedTouches) {
		const idx = i.identifier;
		clicks[idx].disactivate();
	}
});
//优化触摸定位，以后整合进class
function getOffsetLeft(element) {
	if (!(element instanceof HTMLElement)) return NaN;
	let qwqElem = element;
	let a = 0;
	while (qwqElem instanceof HTMLElement) {
		a += qwqElem.offsetLeft;
		qwqElem = qwqElem.offsetParent;
	}
	return a;
}

function getOffsetTop(element) {
	if (!(element instanceof HTMLElement)) return NaN;
	let qwqElem = element;
	let a = 0;
	while (qwqElem instanceof HTMLElement) {
		a += qwqElem.offsetTop;
		qwqElem = qwqElem.offsetParent;
	}
	return a;
}
const ctx = canvas.getContext("2d"); //游戏界面
const ctxbg = canvasbg.getContext("2d"); //游戏背景
const imgClick = {
	perfect: [],
	good: []
};
window.addEventListener("load", init);
//声音组件
const actx = new AudioContext();
const dest = actx.createMediaStreamDestination(); //testvideo
const playSound = (res, loop, isOut, isRecord, offset) => {
	const bufferSource = actx.createBufferSource();
	bufferSource.buffer = res;
	bufferSource.loop = loop; //循环播放
	if (isOut) bufferSource.connect(actx.destination);
	if (isRecord) bufferSource.connect(dest); //testvideo
	bufferSource.start(0, offset);
	return () => bufferSource.stop();
}
const res = {}; //存放资源
//初始化
function init() {
	uploads.classList.add("disabled");
	select.classList.add("disabled");
	stage.classList.add("disabled");
	loadResourse();
	//加载资源
	async function loadResourse() {
		let loadedNum = 0;
		await Promise.all((obj => {
			const arr = [];
			for (const i in obj) arr.push([i, obj[i]]);
			return arr;
		})({
			JudgeLine: "src/JudgeLine.png",
			ProgressBar: "src/ProgressBar.png",
			SongsNameBar: "src/SongsNameBar.png",
			Pause: "src/Pause.png",
			clickRaw: "src/clickRaw.png",
			Tap: "src/Tap.png",
			Tap2: "src/Tap2.png",
			TapHL: "src/TapHL.png",
			Drag: "src/Drag.png",
			DragHL: "src/DragHL.png",
			HoldHead: "src/HoldHead.png",
			Hold: "src/Hold.png",
			HoldEnd: "src/HoldEnd.png",
			Flick: "src/Flick.png",
			FlickHL: "src/FlickHL.png",
			mute: "src/mute.ogg",
			HitSong0: "src/HitSong0.ogg",
			HitSong1: "src/HitSong1.ogg",
			HitSong2: "src/HitSong2.ogg",
			LevelOver1: "src/LevelOver1.png",
			LevelOver2: "src/LevelOver2.ogg",
			LevelOver3: "src/LevelOver3.png",
			LevelOver4: "src/LevelOver4.png",
			LevelOver5: "src/LevelOver5.png",
			Rank: "src/Rank.png"
		}).map(([name, src], _i, arr) => new Promise(resolve => {
			const xhr = new XMLHttpRequest();
			xhr.open("get", src, true);
			if (/\.(png|jpeg|jpg)$/i.test(src)) {
				xhr.responseType = 'blob';
				xhr.send();
				xhr.onload = async () => {
					res[name] = await createImageBitmap(xhr.response);
					out.className = "accept";
					out.innerText = `加载资源：${Math.floor(++loadedNum / arr.length * 100)}%`;
					resolve();
				};
			} else if (/\.(mp3|wav|ogg)$/i.test(src)) {
				xhr.responseType = 'arraybuffer';
				xhr.send();
				xhr.onload = async () => {
					res[name] = await actx.decodeAudioData(xhr.response);
					out.className = "accept";
					out.innerText = `加载资源：${Math.floor(++loadedNum / arr.length * 100)}%`;
					resolve();
				};
			}
		})));
		res.JudgeLineAP = await createImageBitmap(imgShader(res.JudgeLine, "#feffa9"));
		res.JudgeLineFC = await createImageBitmap(imgShader(res.JudgeLine, "#a2eeff"));
		res.TapBad = await createImageBitmap(imgShader(res.Tap2, "#6c4343"));
		res.Clicks = {};
		res.Clicks.default = await qwqImage(res.clickRaw, "white");
		res.Ranks = await qwqImage(res.Rank, "white");
		res.Clicks["rgba(255,236,160,0.8823529)"] = await qwqImage(res.clickRaw, "rgba(255,236,160,0.8823529)"); //#fce491
		res.Clicks["rgba(180,225,255,0.9215686)"] = await qwqImage(res.clickRaw, "rgba(180,225,255,0.9215686)"); //#9ed5f3
		/*for (let i = 0; i < 30; i++) {
			res[`clickPerfect${i}`] = await createImageBitmap(clickPerfect, 0, i * 256, 256, 256);
			res[`clickGood${i}`] = await createImageBitmap(clickGood, 0, i * 256, 256, 256);
			res.Clicks.default[i] = await createImageBitmap(res.clickRaw, 0, i * 256, 256, 256);
		}*/
		out.innerText = "等待上传文件...";
		upload.parentElement.classList.remove("disabled");
	}
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
const stopPlaying = [];
class Stat {
	constructor(numOfNotes) {
		this.reset(numOfNotes);
	}
	get all() {
		return this.perfect + this.good + this.bad + this.miss;
	}
	get scoreNum() {
		const a = 1e6 * (this.perfect * 0.9 + this.good * 0.585 + this.maxcombo * 0.1) / this.numOfNotes;
		return isFinite(a) ? a : 0;
	}
	get scoreStr() {
		const a = this.scoreNum.toFixed(0);
		return ("0").repeat(a.length < 7 ? 7 - a.length : 0) + a;
	}
	get accNum() {
		const a = (this.perfect + this.good * 0.65) / this.all;
		return isFinite(a) ? a : 0;
	}
	get accStr() {
		return (100 * this.accNum).toFixed(2) + "%";
	}
	get lineStatus() {
		if (this.bad + this.miss) return 0;
		if (this.good) return 2;
		return 1;
	}
	get rankStatus() {
		const a = Math.round(this.scoreNum);
		if (a >= 1e6) return 0;
		if (a >= 9.6e5) return 1;
		if (a >= 9.2e5) return 2;
		if (a >= 8.8e5) return 3;
		if (a >= 8.2e5) return 4;
		if (a >= 7e5) return 5;
		return 6;
	}
	reset(numOfNotes) {
		this.numOfNotes = Number(numOfNotes) || 0;
		this.perfect = 0;
		this.good = 0;
		this.bad = 0;
		this.miss = 0;
		this.combo = 0;
		this.maxcombo = 0;
		this.combos = [0, 0, 0, 0, 0]; //不同种类note实时连击次数
	}
	addCombo(status, type) {
		if (status == 1) {
			this.perfect++;
			this.combo++;
			if (this.combo > this.maxcombo) this.maxcombo = this.combo;
		} else if (status == 2) {
			this.good++;
			this.combo++;
			if (this.combo > this.maxcombo) this.maxcombo = this.combo;
		} else if (status == 3) {
			this.bad++;
			this.combo = 0;
		} else if (status == 4) {
			this.miss++;
			this.combo = 0;
		}
		this.combos[0]++;
		this.combos[type]++;
	}
}
const stat = new Stat();
const comboColor = ["#fff", "#0ac3ff", "#f0ed69", "#a0e9fd", "#fe4365"];
//读取文件
upload.onchange = function() {
	const file = this.files[0];
	document.getElementById("filename").value = file ? file.name : "";
	if (!file) {
		out.className = "error";
		out.innerText = "未选择任何文件";
		return;
	}
	uploads.classList.add("disabled");
	loadFile(file);
}
const time2Str = time => `${`00${parseInt(time/60)}`.slice(-2)}:${`00${parseInt(time%60)}`.slice(-2)}`;
const Timer = { //计算fps
	tick: 0,
	time: Date.now(),
	fps: "",
	addTick: function(fr = 10) {
		if (++this.tick >= fr) {
			this.tick = 0;
			this.fps = (1e3 * fr / (-this.time + (this.time = Date.now()))).toFixed(0);
		}
		return this.fps;
	}
}
let tickIn = 0;
let tickOut = 0;
let tickEnd = 0;
let curTime = 0;
let curTimestamp = 0;
let timeBgm = 0;
let timeChart = 0;
let duration = 0;
let isInEnd = false; //开头过渡动画
let isOutStart = false; //结尾过渡动画
let isPaused = true; //暂停
//加载文件
function loadFile(file) {
	qwq[1] = true;
	document.getElementById("demo").classList.add("hide");
	const reader = new FileReader();
	reader.readAsArrayBuffer(file);
	reader.onprogress = progress => { //显示加载文件进度
		const size = file.size;
		out.className = "accept";
		out.innerText = `加载文件：${Math.floor(progress.loaded / size * 100)}%`;
	};
	reader.onload = async function() {
		//加载zip(https://gildas-lormeau.github.io/zip.js)
		const reader = new zip.ZipReader(new zip.Uint8ArrayReader(new Uint8Array(this.result)));
		reader.getEntries().then(async zipDataRaw => {
			const zipData = [];
			for (const i of zipDataRaw) {
				if (i.filename.replace(/.*\//, "")) zipData.push(i);
			}
			console.log(zipData);
			let loadedNum = 0;
			const zipRaw = await Promise.all(zipData.map(i => new Promise(resolve => {
				if (/\.(png|jpeg|jpg)$/i.test(i.filename)) {
					return i.getData(new zip.BlobWriter()).then(async data => {
						const imageData = await createImageBitmap(data);
						const option = document.createElement("option");
						option.innerHTML = i.filename;
						option.value = i.filename;
						bgs[i.filename] = imageData;
						selectbg.appendChild(option);
						loading(++loadedNum);
						resolve(imageData);
					});
				} else if (/\.(mp3|wav|ogg)$/i.test(i.filename)) {
					return i.getData(new zip.Uint8ArrayWriter()).then(async data => {
						const audioData = await actx.decodeAudioData(data.buffer);
						const option = document.createElement("option");
						option.innerHTML = i.filename;
						option.value = i.filename;
						bgms[i.filename] = audioData;
						selectbgm.appendChild(option);
						loading(++loadedNum);
						resolve(audioData);
					});
				} else if (/\.(json|txt)$/i.test(i.filename)) {
					return i.getData(new zip.TextWriter()).then(async data => {
						try {
							console.log(JSON.parse(data)); //test
							const jsonData = await chart123(JSON.parse(data));
							const option = document.createElement("option");
							option.innerHTML = i.filename;
							option.value = i.filename;
							charts[i.filename] = jsonData;
							selectchart.appendChild(option);
							loading(++loadedNum);
							resolve(jsonData);
						} catch {
							loading(++loadedNum);
							resolve(undefined);
						}
					});
				} else if (/\.(pec)$/i.test(i.filename)) {
					return i.getData(new zip.TextWriter()).then(async data => {
						const jsonData = await chart123(chartp23(data));
						const option = document.createElement("option");
						option.innerHTML = i.filename;
						option.value = i.filename;
						charts[i.filename] = jsonData;
						selectchart.appendChild(option);
						loading(++loadedNum);
						resolve(jsonData);
					});
				} else if (i.filename == "line.csv") {
					return i.getData(new zip.TextWriter()).then(async data => {
						const chartLine = csv2array(data, true);
						chartLineData.push(...chartLine);
						loading(++loadedNum);
						resolve(chartLine);
					});
				} else if (i.filename == "info.csv") {
					return i.getData(new zip.TextWriter()).then(async data => {
						const chartInfo = csv2array(data, true);
						chartInfoData.push(...chartInfo);
						loading(++loadedNum);
						resolve(chartInfo);
					});
				} else {
					loading(++loadedNum);
					resolve();
				}
			})));

			function loading(num) {
				out.className = "accept";
				out.innerText = `读取文件：${Math.floor(num/zipData.length * 100)}%`;
				if (num == zipData.length) {
					if (selectchart.children.length == 0) {
						out.className = "error";
						out.innerText = "读取出错：未发现谱面文件"; //test
					} else {
						select.classList.remove("disabled");
						btnPause.classList.add("disabled");
						adjustInfo();
					}
				}
			}
			console.log(zipRaw);
		}, e => {
			console.log(e);
			out.className = "error";
			out.innerText = "读取出错：不是zip文件"; //test
		});
		reader.close();
	}
}
//note预处理
function prerenderChart(chart) {
	const chartOld = JSON.parse(JSON.stringify(chart));
	const chartNew = chartOld;
	//优化events
	for (const LineId in chartNew.judgeLineList) {
		const i = chartNew.judgeLineList[LineId];
		i.lineId = LineId;
		i.offsetX = 0;
		i.offsetY = 0;
		i.alpha = 0;
		i.rotation = 0;
		i.positionY = 0; //临时过渡用
		i.image = res.JudgeLineAP;
		i.images = [res.JudgeLine, res.JudgeLineAP, res.JudgeLineFC];
		i.imageH = 0.008;
		i.imageW = 1.042;
		i.imageB = 0;
		i.speedEvents = addRealTime(arrangeSpeedEvent(i.speedEvents), i.bpm);
		i.judgeLineDisappearEvents = addRealTime(arrangeLineEvent(i.judgeLineDisappearEvents), i.bpm);
		i.judgeLineMoveEvents = addRealTime(arrangeLineEvent(i.judgeLineMoveEvents), i.bpm);
		i.judgeLineRotateEvents = addRealTime(arrangeLineEvent(i.judgeLineRotateEvents), i.bpm);
		Renderer.lines.push(i);
		for (const NoteId in i.notesAbove) addNote(i.notesAbove[NoteId], 1.875 / i.bpm, LineId, NoteId, true);
		for (const NoteId in i.notesBelow) addNote(i.notesBelow[NoteId], 1.875 / i.bpm, LineId, NoteId, false);
	}
	const sortNote = (a, b) => a.realTime - b.realTime || a.lineId - b.lineId || a.noteId - b.noteId;
	Renderer.notes.sort(sortNote);
	Renderer.taps.sort(sortNote);
	Renderer.drags.sort(sortNote);
	Renderer.holds.sort(sortNote);
	Renderer.flicks.sort(sortNote);
	Renderer.tapholds.sort(sortNote);
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
		note.name = `${lineId}${isAbove?"+":"-"}${noteId}`;
		Renderer.notes.push(note);
		if (note.type == 1) Renderer.taps.push(note);
		else if (note.type == 2) Renderer.drags.push(note);
		else if (note.type == 3) Renderer.holds.push(note);
		else if (note.type == 4) Renderer.flicks.push(note);
		if (note.type == 1 || note.type == 3) Renderer.tapholds.push(note);
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
	for (const i of Renderer.notes) timeOfMulti[i.realTime.toFixed(6)] = timeOfMulti[i.realTime.toFixed(6)] ? 2 : 1;
	for (const i of Renderer.notes) i.isMulti = (timeOfMulti[i.realTime.toFixed(6)] == 2);
	return chartNew;
	//规范判定线事件
	function arrangeLineEvent(events) {
		const oldEvents = JSON.parse(JSON.stringify(events)); //深拷贝
		const newEvents = [{ //以1-1e6开头
			startTime: 1 - 1e6,
			endTime: 0,
			start: oldEvents[0] ? oldEvents[0].start : 0,
			end: oldEvents[0] ? oldEvents[0].end : 0,
			start2: oldEvents[0] ? oldEvents[0].start2 : 0,
			end2: oldEvents[0] ? oldEvents[0].end2 : 0
		}];
		oldEvents.push({ //以1e9结尾
			startTime: 0,
			endTime: 1e9,
			start: oldEvents[oldEvents.length - 1] ? oldEvents[oldEvents.length - 1].start : 0,
			end: oldEvents[oldEvents.length - 1] ? oldEvents[oldEvents.length - 1].end : 0,
			start2: oldEvents[oldEvents.length - 1] ? oldEvents[oldEvents.length - 1].start2 : 0,
			end2: oldEvents[oldEvents.length - 1] ? oldEvents[oldEvents.length - 1].end2 : 0
		});
		for (const i2 of oldEvents) { //保证时间连续性
			const i1 = newEvents[newEvents.length - 1];
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
	//添加realTime
	function addRealTime(events, bpm) {
		for (const i of events) {
			i.startRealTime = i.startTime / bpm * 1.875;
			i.endRealTime = i.endTime / bpm * 1.875;
			i.startDeg = -Deg * i.start;
			i.endDeg = -Deg * i.end;
		}
		return events;
	}
}

document.addEventListener("visibilitychange", () => document.visibilityState == "hidden" && btnPause.value == "暂停" && btnPause.click());
//play
btnPlay.addEventListener("click", async function() {
	btnPause.value = "暂停";
	if (this.value == "播放") {
		stopPlaying.push(playSound(res["mute"], true, false, videoRecorder.checked, 0)); //播放空音频(防止音画不同步)
		for (const i of ["lines", "notes", "taps", "drags", "flicks", "holds", "tapholds"]) Renderer[i] = [];
		Renderer.chart = prerenderChart(charts[selectchart.value]); //fuckqwq
		stat.reset(Renderer.chart.numOfNotes);
		for (const i of chartLineData) {
			if (selectchart.value == i.Chart) {
				Renderer.chart.judgeLineList[i.LineId].image = await createImageBitmap(imgShader(bgs[i.Image], "#feffa9"));
				Renderer.chart.judgeLineList[i.LineId].images[0] = bgs[i.Image];
				Renderer.chart.judgeLineList[i.LineId].images[1] = await createImageBitmap(imgShader(bgs[i.Image], "#feffa9"));
				Renderer.chart.judgeLineList[i.LineId].images[2] = await createImageBitmap(imgShader(bgs[i.Image], "#a2eeff"));
				Renderer.chart.judgeLineList[i.LineId].imageH = Number(i.Vert);
				Renderer.chart.judgeLineList[i.LineId].imageW = Number(i.Horz);
				Renderer.chart.judgeLineList[i.LineId].imageB = Number(i.IsDark);
			}
		}
		Renderer.backgroundImage = bgs[selectbg.value];
		Renderer.backgroundMusic = bgms[selectbgm.value];
		stage.classList.remove("disabled");
		this.value = "停止";
		resizeCanvas();
		duration = Renderer.backgroundMusic.duration;
		isInEnd = false;
		isOutStart = false;
		isPaused = false;
		timeBgm = 0;
		if (!showTransition.checked) tickIn = 179;
		stage.classList.remove("disabled");
		btnPause.classList.remove("disabled");
		autoplay.nextElementSibling.classList.add("disabled");
		showTransition.nextElementSibling.classList.add("disabled");
		videoRecorder.nextElementSibling.classList.add("disabled");
		if (videoRecorder.checked) btnPause.classList.add("disabled"); //testvideo录制时不允许暂停(存在bug)
		draw();
		if (videoRecorder.checked) {
			const cStream = canvas.captureStream();
			const aStream = dest.stream;
			const mixStream = new MediaStream([cStream.getVideoTracks()[0], aStream.getAudioTracks()[0]]);
			const recorder = new MediaRecorder(mixStream, {
				videoBitsPerSecond: 20000000,
				mimeType: 'video/webm;codecs=h264'
			}); //mixStream
			const chunks = [];
			recorder.ondataavailable = evt => evt.data && evt.data.size && chunks.push(evt.data);
			recorder.onstop = () => {
				if (chunks.length) {
					const blob = new Blob(chunks);
					const a = document.createElement("a");
					a.href = URL.createObjectURL(blob);
					a.download = `${parseInt(Date.now()/1e3)}.webm`;
					a.click();
					chunks.length = 0;
				} else alert("Recording Failed");
			};
			recorder.start();
			stopPlaying.push(() => recorder.stop());
		} //testvideo
	} else {
		if (videoRecorder.checked) btnPlay.classList.add("disabled"); //只许录制一次(存在bug)
		while (stopPlaying.length) stopPlaying.shift()();
		cancelAnimationFrame(stopDrawing);
		resizeCanvas();
		stage.classList.add("disabled");
		autoplay.nextElementSibling.classList.remove("disabled");
		showTransition.nextElementSibling.classList.remove("disabled");
		videoRecorder.nextElementSibling.classList.remove("disabled");
		btnPause.classList.add("disabled");
		//清除原有数据
		clickEvents.length = 0;
		tickIn = 0;
		tickOut = 0;
		tickEnd = 0;
		curTime = 0;
		curTimestamp = 0;
		duration = 0;
		this.value = "播放";
	}
});
btnPause.addEventListener("click", function() {
	if (this.classList.contains("disabled") || btnPlay.value == "播放") return;
	if (this.value == "暂停") {
		isPaused = true;
		this.value = "继续";
		curTime = timeBgm;
		while (stopPlaying.length) stopPlaying.shift()();
	} else {
		isPaused = false;
		if (isInEnd && !isOutStart) playBgm(Renderer.backgroundMusic, timeBgm);
		this.value = "暂停";
	}
});
//播放bgm
function playBgm(data, offset) {
	isPaused = false;
	if (!offset) offset = 0;
	curTimestamp = Date.now();
	stopPlaying.push(playSound(data, false, true, videoRecorder.checked, offset));
}
//作图
function draw() {
	const now = Date.now();
	//计算时间
	if (!isPaused) {
		if (tickIn < 180 && ++tickIn == 180) {
			isInEnd = true;
			playBgm(Renderer.backgroundMusic);
		}
		if (isInEnd && !isOutStart) timeBgm = (now - curTimestamp) / 1e3 + curTime;
		if (timeBgm >= duration) isOutStart = true;
		showTransition.checked && isOutStart && tickOut < 40 && ++tickOut == 40;
	}
	timeChart = Math.max(timeBgm - Renderer.chart.offset, 0);
	//遍历判定线events和Note
	for (const line of Renderer.lines) {
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
			line.offsetX = canvas.width * (i.start * t1 + i.end * t2);
			line.offsetY = canvas.height * (1 - i.start2 * t1 - i.end2 * t2);
		}
		for (const i of line.judgeLineRotateEvents) {
			if (timeChart < i.startRealTime) break;
			if (timeChart > i.endRealTime) continue;
			const t2 = (timeChart - i.startRealTime) / (i.endRealTime - i.startRealTime);
			const t1 = 1 - t2;
			line.rotation = i.startDeg * t1 + i.endDeg * t2;
			line.cosr = Math.cos(line.rotation);
			line.sinr = Math.sin(line.rotation);
		}
		for (const i of line.speedEvents) {
			if (timeChart < i.startRealTime) break;
			if (timeChart > i.endRealTime) continue;
			line.positionY = (timeChart - i.startRealTime) * i.value + i.floorPosition;
		}
		for (const i of line.notesAbove) {
			const dx = wlen2 * i.positionX;
			const dy = hlen * (i.type == 3 ? (i.realTime < timeChart ? (i.realTime - timeChart) * i.speed : i.floorPosition - line.positionY) : (i.floorPosition - line.positionY) * i.speed) * 1.2;
			i.cosr = line.cosr;
			i.sinr = line.sinr;
			i.projectX = line.offsetX + dx * i.cosr;
			i.offsetX = i.projectX + dy * i.sinr;
			i.projectY = line.offsetY + dx * i.sinr;
			i.offsetY = i.projectY - dy * i.cosr;
			qwqAlpha(i, dy);
		}
		for (const i of line.notesBelow) {
			const dx = wlen2 * i.positionX;
			const dy = hlen * (i.type == 3 ? (i.realTime < timeChart ? (i.realTime - timeChart) * i.speed : i.floorPosition - line.positionY) : (i.floorPosition - line.positionY) * i.speed) * 1.2;
			i.cosr = -line.cosr;
			i.sinr = -line.sinr;
			i.projectX = line.offsetX - dx * i.cosr;
			i.offsetX = i.projectX + dy * i.sinr;
			i.projectY = line.offsetY - dx * i.sinr;
			i.offsetY = i.projectY - dy * i.cosr;
			qwqAlpha(i, dy);
		}

		function qwqAlpha(i, dy) {
			if (i.type == 3) {
				i.alpha = (i.realTime > timeChart) ? ((i.speed == 0 || dy < -1e-3 && !(i.realTime < timeChart)) ? (showPoint.checked ? 0.45 : 0) : 1) : ((i.speed == 0) ? (showPoint.checked ? 0.45 : 0) : (i.status == 4 ? 0.45 : 1));
				i.visible = (Math.abs(i.offsetX - wlen) + Math.abs(i.offsetY - hlen) < wlen * 1.23625 + hlen * (1 + i.realHoldTime * i.speed * 1.2));
			} else {
				if (i.realTime >= timeChart && dy < -1e-3) i.alpha = showPoint.checked ? 0.45 : 0;
				else if (i.realTime < timeChart) i.alpha = Math.max(1 - (timeChart - i.realTime) / 0.16, 0);
				else i.alpha = 1;
				i.visible = (Math.abs(i.offsetX - wlen) + Math.abs(i.offsetY - hlen) < wlen * 1.23625 + hlen);
			}
		}
	}
	judgements.addJudgement(Renderer.notes, timeChart);
	judgements.judgeNote(Renderer.drags, timeChart, canvas.width * 0.117775);
	judgements.judgeNote(Renderer.flicks, timeChart, canvas.width * 0.117775);
	judgements.judgeNote(Renderer.tapholds, timeChart, canvas.width * 0.117775); //播放打击音效和判定
	taps.length = 0; //qwq
	Timer.addTick(); //计算fps
	clickEvents.defilter(i => i.type ? (now >= i.time + i.duration) : (i.time++ > 0)); //清除打击特效
	ctx.clearRect(0, 0, canvas.width, canvas.height); //重置画面
	ctx.globalCompositeOperation = "destination-over"; //由后往前绘制
	for (const i of clickEvents) { //绘制打击特效1
		if (i.type == 1) {
			const tick = (now - i.time) / i.duration;
			ctx.globalAlpha = 1;
			ctx.setTransform(noteScale * 6, 0, 0, noteScale * 6, i.offsetX, i.offsetY); //缩放
			ctx.drawImage(i.images[parseInt(tick * 30)] || i.images[i.images.length - 1], -128, -128); //停留约0.5秒
			ctx.fillStyle = i.color;
			ctx.globalAlpha = 1 - tick; //不透明度
			const r3 = 30 * (((0.2078 * tick - 1.6524) * tick + 1.6399) * tick + 0.4988); //方块大小
			for (const j of i.rand) {
				const ds = j[0] * (9 * tick / (8 * tick + 1)); //打击点距离
				ctx.fillRect(ds * Math.cos(j[1]) - r3 / 2, ds * Math.sin(j[1]) - r3 / 2, r3, r3);
			}
		}
	}
	for (const i of clicks) {
		if (i instanceof Click && i.isActive) i.animate();
	}
	for (const i of clickEvents) { //绘制打击特效0
		ctx.globalAlpha = 0.85;
		if (i.type == 0) {
			ctx.setTransform(1, 0, 0, 1, i.offsetX, i.offsetY); //缩放
			ctx.fillStyle = i.color;
			ctx.beginPath();
			ctx.arc(0, 0, lineScale * 0.5, 0, 2 * Math.PI);
			ctx.fill();
			i.time++;
		}
	}
	for (const i of clickEvents) { //绘制打击特效2
		if (i.type == 2) {
			const tick = (now - i.time) / i.duration;
			ctx.globalAlpha = 1 - tick;
			ctx.setTransform(noteScale * i.cosr, noteScale * i.sinr, -noteScale * i.sinr, noteScale * i.cosr, i.offsetX, i.offsetY); //缩放
			ctx.drawImage(i.image, -i.image.width / 2, -i.image.height / 2); //停留约0.5秒
		}
	}
	if (showPoint.checked) { //绘制定位点
		ctx.font = `${lineScale}px Exo`;
		ctx.textAlign = "center";
		ctx.textBaseline = "bottom";
		for (const i of Renderer.notes) {
			if (!i.visible) continue;
			ctx.setTransform(i.cosr, i.sinr, -i.sinr, i.cosr, i.offsetX, i.offsetY);
			ctx.fillStyle = "cyan";
			ctx.globalAlpha = i.realTime > timeChart ? 1 : 0.5;
			ctx.fillText(i.name, 0, -lineScale * 0.1);
			ctx.globalAlpha = 1;
			ctx.fillStyle = "lime";
			ctx.fillRect(-lineScale * 0.2, -lineScale * 0.2, lineScale * 0.4, lineScale * 0.4);
		}
		for (const i of Renderer.lines) {
			ctx.setTransform(i.cosr, i.sinr, -i.sinr, i.cosr, i.offsetX, i.offsetY);
			ctx.fillStyle = "yellow";
			ctx.globalAlpha = (i.alpha + 0.5) / 1.5;
			ctx.fillText(i.lineId, 0, -lineScale * 0.1);
			ctx.globalAlpha = 1;
			ctx.fillStyle = "violet";
			ctx.fillRect(-lineScale * 0.2, -lineScale * 0.2, lineScale * 0.4, lineScale * 0.4);
		}
	}
	if (tickIn >= 180 && tickOut == 0) { //绘制note
		for (const i of Renderer.flicks) drawNote(i, timeChart, 4);
		for (const i of Renderer.taps) drawNote(i, timeChart, 1);
		for (const i of Renderer.drags) drawNote(i, timeChart, 2);
		for (const i of Renderer.holds) drawNote(i, timeChart, 3);
	}
	//绘制背景
	if (tickIn >= 150) drawLine(stat.lineStatus ? 2 : 1); //绘制判定线(背景前1)
	ctx.resetTransform();
	ctx.fillStyle = "#000"; //背景变暗
	ctx.globalAlpha = selectglobalalpha.value; //背景不透明度
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	if (tickIn >= 150 && !stat.lineStatus) drawLine(0); //绘制判定线(背景后0)
	ctx.globalAlpha = 1;
	ctx.resetTransform();
	ctx.drawImage(Renderer.backgroundImage, ...adjustSize(Renderer.backgroundImage.width, Renderer.backgroundImage.height, canvas.width, canvas.height));
	ctxbg.drawImage(Renderer.backgroundImage, ...adjustSize(Renderer.backgroundImage.width, Renderer.backgroundImage.height, canvasbg.width, canvasbg.height));
	//
	ctx.globalCompositeOperation = "source-over";
	//绘制进度条
	ctx.setTransform(canvas.width / 1920, 0, 0, canvas.width / 1920, 0, lineScale * (tickIn < 40 ? (tween[2](tickIn * 0.025) - 1) : -tween[2](tickOut * 0.025)) * 1.75);
	ctx.drawImage(res.ProgressBar, timeBgm / duration * 1920 - 1920, 0);
	//绘制文字
	ctx.resetTransform();
	ctx.fillStyle = "#fff";
	//开头过渡动画//以后加入tickOut
	if (tickIn < 180) {
		if (tickIn < 40) ctx.globalAlpha = tween[2](tickIn * 0.025);
		else if (tickIn >= 150) ctx.globalAlpha = tween[2]((180 - tickIn) / 30);
		ctx.textAlign = "center";
		//歌名
		ctx.textBaseline = "alphabetic";
		ctx.font = `${lineScale*1.1}px Exo`;
		ctx.fillText(inputName.value || inputName.placeholder, wlen, hlen * 0.75);
		//曲绘和谱师
		ctx.textBaseline = "top";
		ctx.font = `${lineScale*0.55}px Exo`;
		ctx.fillText(`Illustration designed by ${inputIllustrator.value || inputIllustrator.placeholder}`, wlen, hlen * 1.25 + lineScale * 0.15);
		ctx.fillText(`Level designed by ${inputDesigner.value || inputDesigner.placeholder}`, wlen, hlen * 1.25 + lineScale * 1.0);
		//判定线(装饰用)
		ctx.globalAlpha = 1;
		ctx.setTransform(1, 0, 0, 1, wlen, hlen);
		const imgW = lineScale * 48 * (tickIn < 40 ? tween[3](tickIn * 0.025) : 1);
		const imgH = lineScale * 0.15;
		if (tickIn >= 150) ctx.globalAlpha = tween[2]((180 - tickIn) / 30);
		ctx.drawImage(res.JudgeLineAP, -imgW / 2, -imgH / 2, imgW, imgH);
	}
	//绘制分数和combo以及暂停按钮
	ctx.globalAlpha = 1;
	ctx.setTransform(1, 0, 0, 1, 0, lineScale * (tickIn < 40 ? (tween[2](tickIn * 0.025) - 1) : -tween[2](tickOut * 0.025)) * 1.75);
	ctx.textBaseline = "alphabetic";
	ctx.font = `${lineScale*0.95}px Exo`;
	ctx.textAlign = "right";
	ctx.fillText(stat.scoreStr, canvas.width - lineScale * 0.65, lineScale * 1.35);
	if (!qwq[0]) ctx.drawImage(res.Pause, lineScale * 0.6, lineScale * 0.7, lineScale * 0.63, lineScale * 0.7);
	if (stat.combo > 2) {
		ctx.textAlign = "center";
		ctx.font = `${lineScale*1.3}px Exo`;
		ctx.fillText(stat.combo, wlen, lineScale * 1.35);
		ctx.globalAlpha = tickIn < 40 ? tween[2](tickIn * 0.025) : (1 - tween[2](tickOut * 0.025));
		ctx.textBaseline = "top";
		ctx.font = `${lineScale*0.65}px Exo`;
		ctx.fillText(autoplay.checked ? "Autoplay" : "combo", wlen, lineScale * 1.50);
	}
	//绘制歌名和等级
	ctx.globalAlpha = 1;
	ctx.setTransform(1, 0, 0, 1, 0, lineScale * (tickIn < 40 ? (1 - tween[2](tickIn * 0.025)) : tween[2](tickOut * 0.025)) * 1.75);
	ctx.textBaseline = "alphabetic";
	ctx.textAlign = "right";
	ctx.font = `${lineScale*0.65}px Exo`;
	ctx.fillText(inputLevel.value || inputLevel.placeholder, canvas.width - lineScale * 0.75, canvas.height - lineScale * 0.65);
	ctx.drawImage(res.SongsNameBar, lineScale * 0.53, canvas.height - lineScale * 1.22, lineScale * 0.119, lineScale * 0.612);
	ctx.textAlign = "left";
	ctx.font = `${lineScale*0.62}px Exo`;
	ctx.fillText(inputName.value || inputName.placeholder, lineScale * 0.85, canvas.height - lineScale * 0.65);
	ctx.resetTransform();
	if (qwq[0]) {
		//绘制时间和帧率以及note打击数
		if (tickIn < 40) ctx.globalAlpha = tween[2](tickIn * 0.025);
		else ctx.globalAlpha = 1 - tween[2](tickOut * 0.025);
		ctx.textBaseline = "top";
		ctx.font = `${lineScale*0.4}px Exo`;
		ctx.textAlign = "left";
		ctx.fillText(`${time2Str(timeBgm)}/${time2Str(duration)}`, 0, lineScale * 0.3);
		ctx.textAlign = "right";
		ctx.fillText(Timer.fps, canvas.width, lineScale * 0.3);
		ctx.textBaseline = "alphabetic";
		if (showPoint.checked) stat.combos.forEach((val, idx) => {
			ctx.fillStyle = comboColor[idx];
			ctx.fillText(val, lineScale * (idx + 1) * 1.1, canvas.height - lineScale * 0.1);
		});
		//Copyright
		ctx.fillStyle = "#fff";
		ctx.globalAlpha = 0.4;
		ctx.textAlign = "right";
		ctx.textBaseline = "bottom";
		ctx.fillText("Code by lch\zh3473", canvas.width - lineScale * 0.1, canvas.height - lineScale * 0.1);
		ctx.globalAlpha = 1;
	}
	//判定线函数，undefined/0:默认,1:非,2:恒成立
	function drawLine(bool) {
		ctx.globalAlpha = 1;
		const tw = 1 - tween[2](tickOut * 0.025);
		for (const i of Renderer.lines) {
			if (bool ^ i.imageB && tickOut < 40) {
				ctx.globalAlpha = i.alpha;
				ctx.setTransform(i.cosr * tw, i.sinr, -i.sinr * tw, i.cosr, wlen + (i.offsetX - wlen) * tw, i.offsetY); //hiahiah
				const imgH = i.imageH > 0 ? lineScale * 18.75 * i.imageH : canvas.height * -i.imageH; // hlen*0.008
				const imgW = imgH * i.image.width / i.image.height * i.imageW; //* 38.4*25 * i.imageH* i.imageW; //wlen*3
				ctx.drawImage(i.images[lineColor.checked ? stat.lineStatus : 0], -imgW / 2, -imgH / 2, imgW, imgH);
			}
		}
	}
	stopDrawing = requestAnimationFrame(tickOut == 40 ? draw2 : draw); //回调更新动画
}

function draw2() {
	tickOut = 40;
	tickEnd = 0;
	isPaused = true;
	while (stopPlaying.length) stopPlaying.shift()();
	cancelAnimationFrame(stopDrawing);
	btnPause.classList.add("disabled");
	ctx.globalCompositeOperation = "source-over";
	ctx.resetTransform();
	ctx.globalAlpha = 1;
	ctx.drawImage(Renderer.backgroundImage, ...adjustSize(Renderer.backgroundImage.width, Renderer.backgroundImage.height, canvas.width, canvas.height));
	ctxbg.drawImage(Renderer.backgroundImage, ...adjustSize(Renderer.backgroundImage.width, Renderer.backgroundImage.height, canvasbg.width, canvasbg.height));
	ctx.fillStyle = "#000"; //背景变暗
	ctx.globalAlpha = selectglobalalpha.value; //背景不透明度
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	setTimeout(() => stopPlaying.push(playSound(res.LevelOver2, true, true, videoRecorder.checked, 0)), 1000);
	setTimeout(qwqwq, 1000);

	function qwqwq() {
		++tickEnd;
		ctx.resetTransform();
		ctx.globalCompositeOperation = "source-over";
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.globalAlpha = 1;
		ctx.drawImage(Renderer.backgroundImage, ...adjustSize(Renderer.backgroundImage.width, Renderer.backgroundImage.height, canvas.width, canvas.height));
		ctxbg.drawImage(Renderer.backgroundImage, ...adjustSize(Renderer.backgroundImage.width, Renderer.backgroundImage.height, canvasbg.width, canvasbg.height));
		ctx.fillStyle = "#000"; //背景变暗
		ctx.globalAlpha = selectglobalalpha.value; //背景不透明度
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.globalCompositeOperation = "destination-out";
		ctx.globalAlpha = 1;
		const k = 3.7320508075688776; //tan75°
		ctx.setTransform(canvas.width - canvas.height / k, 0, -canvas.height / k, canvas.height, canvas.height / k, 0);
		ctx.fillRect(0, 0, 1, tween[8](range((tickEnd - 8) / 64)));
		ctx.resetTransform();
		ctx.globalCompositeOperation = "destination-over";
		const qwq0 = (canvas.width - canvas.height / k) / (16 - 9 / k);
		ctx.setTransform(qwq0 / 120, 0, 0, qwq0 / 120, wlen - qwq0 * 8, hlen - qwq0 * 4.5); //?
		ctx.drawImage(res.LevelOver4, 183, 42, 1184, 228);
		ctx.globalAlpha = range((tickEnd - 16) / 72);
		ctx.drawImage(res.LevelOver1, 102, 378);
		ctx.globalCompositeOperation = "source-over";
		ctx.globalAlpha = 1;
		ctx.drawImage(res.LevelOver5, 700 * tween[8](range(tickEnd / 48)) - 369, 91, 20, 80);
		ctx.fillStyle = "#fff";
		ctx.textBaseline = "middle";
		ctx.textAlign = "left";
		ctx.font = "80px Exo";
		ctx.fillText(inputName.value || inputName.placeholder, 700 * tween[8](range(tickEnd / 48)) - 319, 135);
		ctx.font = "32px Exo";
		ctx.fillText(inputLevel.value || inputLevel.placeholder, 700 * tween[8](range(tickEnd / 48)) - 319, 203);
		ctx.font = "30px Exo";
		ctx.globalAlpha = range((tickEnd - 57) / 40);
		ctx.fillText(stat.accStr, 351, 541);
		ctx.fillText(stat.maxcombo, 1527, 541);
		if (stat.lineStatus) {
			ctx.fillStyle = stat.lineStatus == 1 ? "#ffc500" : "#00bef1";
			ctx.fillText(stat.lineStatus == 1 ? "ALL  PERFECT" : "FULL  COMBO", 1355, 586);
		}
		ctx.fillStyle = "#fff";
		ctx.textAlign = "center";
		ctx.font = "86px Exo";
		ctx.globalAlpha = range((tickEnd - 67) / 30);
		ctx.fillText(stat.scoreStr, 1075, 544);
		ctx.font = "26px Exo";
		ctx.globalAlpha = range((tickEnd - 52) / 24);
		ctx.fillText(stat.perfect, 890, 641);
		ctx.globalAlpha = range((tickEnd - 64) / 24);
		ctx.fillText(stat.good, 1043, 641);
		ctx.globalAlpha = range((tickEnd - 76) / 24);
		ctx.fillText(stat.bad, 1196, 641);
		ctx.globalAlpha = range((tickEnd - 88) / 24);
		ctx.fillText(stat.miss, 1349, 641);
		ctx.globalAlpha = range((tickEnd - 112) / 16);
		ctx.transform(1, 0, 0, 1, 661.5, 544.5);
		const qwq2 = 293 + range((tickEnd - 112) / 16) * 100;
		const qwq3 = 410 - range((tickEnd - 112) / 28) * 164;
		ctx.drawImage(res.LevelOver3, -qwq2 / 2, -qwq2 / 2, qwq2, qwq2);
		ctx.drawImage(res.Ranks[stat.rankStatus], -qwq3 / 2, -qwq3 / 2, qwq3, qwq3);
		ctx.resetTransform();
		ctx.globalCompositeOperation = "destination-over";
		ctx.globalAlpha = 1;
		ctx.drawImage(Renderer.backgroundImage, ...adjustSize(Renderer.backgroundImage.width, Renderer.backgroundImage.height, canvas.width, canvas.height));
		stopDrawing = requestAnimationFrame(qwqwq); //回调更新动画
	}
}

function range(num) {
	if (num < 0) return 0;
	if (num > 1) return 1;
	return num;
}
//绘制Note
function drawNote(note, realTime, type) {
	if (!note.visible) return;
	if (note.type != 3 && note.scored) return;
	if (note.type == 3 && note.realTime + note.realHoldTime < realTime) return; //qwq
	ctx.globalAlpha = note.alpha;
	ctx.setTransform(noteScale * note.cosr, noteScale * note.sinr, -noteScale * note.sinr, noteScale * note.cosr, note.offsetX, note.offsetY);
	if (type == 3) {
		const baseLength = hlen / noteScale * note.speed * 1.2;
		const holdLength = baseLength * note.realHoldTime;
		if (note.realTime > realTime) {
			ctx.drawImage(res.HoldHead, -res.HoldHead.width * 0.5, 0);
			ctx.drawImage(res.Hold, -res.Hold.width * 0.5, -holdLength, res.Hold.width, holdLength);
			ctx.drawImage(res.HoldEnd, -res.HoldEnd.width * 0.5, -holdLength - res.HoldEnd.height);
		} else {
			ctx.drawImage(res.Hold, -res.Hold.width * 0.5, -holdLength, res.Hold.width, holdLength - baseLength * (realTime - note.realTime));
			ctx.drawImage(res.HoldEnd, -res.HoldEnd.width * 0.5, -holdLength - res.HoldEnd.height);
		}
	} else if (note.isMulti && document.getElementById("highLight").checked) {
		if (type == 1) ctx.drawImage(res.TapHL, -res.TapHL.width * 0.5, -res.TapHL.height * 0.5);
		else if (type == 2) ctx.drawImage(res.DragHL, -res.DragHL.width * 0.5, -res.DragHL.height * 0.5);
		else if (type == 4) ctx.drawImage(res.FlickHL, -res.FlickHL.width * 0.5, -res.FlickHL.height * 0.5);
	} else {
		if (type == 1) ctx.drawImage(res.Tap, -res.Tap.width * 0.5, -res.Tap.height * 0.5);
		else if (type == 2) ctx.drawImage(res.Drag, -res.Drag.width * 0.5, -res.Drag.height * 0.5);
		else if (type == 4) ctx.drawImage(res.Flick, -res.Flick.width * 0.5, -res.Flick.height * 0.5);
	}
}
//test
function chart123(chart) {
	let oldchart = JSON.parse(JSON.stringify(chart)); //深拷贝
	switch (oldchart.formatVersion) { //加花括号以避免beautify缩进bug
		case 1: {
			oldchart.formatVersion = 3;
			for (const i of oldchart.judgeLineList) {
				let y = 0;
				for (const j of i.speedEvents) {
					if (j.startTime < 0) j.startTime = 0;
					j.floorPosition = y;
					y += (j.endTime - j.startTime) * j.value / i.bpm * 1.875;
				}
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
		case 3: {}
		case 3473:
			break;
		default:
			throw `Unsupported formatVersion: ${oldchart.formatVersion}`;
	}
	return JSON.parse(JSON.stringify(oldchart));
}

function chartp23(pec) {
	class Chart {
		constructor() {
			this.formatVersion = 3;
			this.offset = 0;
			this.numOfNotes = 0;
			this.judgeLineList = [];
		}
		pushLine(judgeLine) {
			this.judgeLineList.push(judgeLine);
			this.numOfNotes += judgeLine.numOfNotes;
			return judgeLine;
		}
	}
	class JudgeLine {
		constructor(bpm) {
			this.numOfNotes = 0;
			this.numOfNotesAbove = 0;
			this.numOfNotesBelow = 0;
			this.bpm = bpm;
			for (const i of ["speedEvents", "notesAbove", "notesBelow", "judgeLineDisappearEvents", "judgeLineMoveEvents", "judgeLineRotateEvents", "judgeLineDisappearEventsPec", "judgeLineMoveEventsPec", "judgeLineRotateEventsPec"]) this[i] = [];
		}
		pushNote(note, pos, isFake) {
			switch (pos) {
				case undefined:
				case 1:
					this.notesAbove.push(note);
					break;
				case 2:
					this.notesBelow.push(note);
					break;
				default:
					throw "wrong note position"
			}
			if (!isFake) {
				this.numOfNotes++;
				this.numOfNotesAbove++;
			}
		}
		pushEvent(type, startTime, endTime, n1, n2, n3, n4) {
			const evt = {
				startTime: startTime,
				endTime: endTime,
			}
			switch (type) {
				case 0:
					evt.value = n1;
					this.speedEvents.push(evt);
					break;
				case 1:
					evt.start = n1;
					evt.end = n2;
					evt.start2 = 0;
					evt.end2 = 0;
					this.judgeLineDisappearEvents.push(evt);
					break;
				case 2:
					evt.start = n1;
					evt.end = n2;
					evt.start2 = n3;
					evt.end2 = n4;
					this.judgeLineMoveEvents.push(evt);
					break;
				case 3:
					evt.start = n1;
					evt.end = n2;
					evt.start2 = 0;
					evt.end2 = 0;
					this.judgeLineRotateEvents.push(evt);
					break;
				case -1:
					evt.value = n1;
					evt.motionType = 1;
					this.judgeLineDisappearEventsPec.push(evt);
					break;
				case -2:
					evt.value = n1;
					evt.value2 = n2;
					evt.motionType = n3;
					this.judgeLineMoveEventsPec.push(evt);
					break;
				case -3:
					evt.value = n1;
					evt.motionType = n2;
					this.judgeLineRotateEventsPec.push(evt);
					break;
				default:
					throw `Unexpected Event Type: ${type}`;
			}
		}
	}
	class Note {
		constructor(type, time, x, holdTime, speed) {
			this.type = type;
			this.time = time;
			this.positionX = x;
			this.holdTime = type == 3 ? holdTime : 0;
			this.speed = isNaN(speed) ? 1 : speed; //默认值不为0不能改成Number(speed)||1
			this.floorPosition = time % 1e9 / 104 * 1.2;
		}
	}
	//test start
	const rawChart = pec.split(/[ \n\r]+/).map(i => isNaN(i) ? String(i) : Number(i)); //必要性有待研究
	const qwqChart = new Chart();
	const raw = {};
	for (const i of ["bp", "n1", "n2", "n3", "n4", "cv", "cp", "cd", "ca", "cm", "cr", "cf"]) raw[i] = [];
	const rawarr = [];
	let fuckarr = [1, 1]; //n指令的#和&
	let rawstr = "";
	if (!isNaN(rawChart[0])) qwqChart.offset = (rawChart.shift() / 1e3 - 0.15); //官方转谱似乎是0.14
	for (let i = 0; i < rawChart.length; i++) {
		let p = rawChart[i];
		if (!isNaN(p)) rawarr.push(p);
		else if (p == "#" && rawstr[0] == "n") fuckarr[0] = rawChart[++i];
		else if (p == "&" && rawstr[0] == "n") fuckarr[1] = rawChart[++i];
		else if (!raw[p]) throw `Unknown Command: ${p}`;
		else {
			if (raw[rawstr]) {
				if (rawstr[0] == "n") {
					rawarr.push(...fuckarr);
					fuckarr = [1, 1];
				}
				raw[rawstr].push(JSON.parse(JSON.stringify(rawarr)));
			}
			rawarr.length = 0;
			rawstr = p;
		}
	}
	if (raw[rawstr]) raw[rawstr].push(JSON.parse(JSON.stringify(rawarr))); //补充最后一个元素(bug)
	//处理bpm变速
	if (!raw.bp[0]) raw.bp.push([0, 120]);
	const baseBpm = raw.bp[0][1];
	if (raw.bp[0][0]) raw.bp.unshift([0, baseBpm]);
	const bpmEvents = []; //存放bpm变速事件
	let fuckBpm = 0;
	raw.bp.sort((a, b) => a[0] - b[0]).forEach((i, idx, arr) => {
		if (arr[idx + 1] && arr[idx + 1][0] <= 0) return; //过滤负数
		const start = i[0] < 0 ? 0 : i[0];
		const end = arr[idx + 1] ? arr[idx + 1][0] : 1e9;
		const bpm = i[1];
		bpmEvents.push({
			startTime: start,
			endTime: end,
			bpm: bpm,
			value: fuckBpm
		});
		fuckBpm += (end - start) / bpm;
	});
	//将pec时间转换为pgr时间
	function calcTime(timePec) {
		let timePhi = 0;
		for (const i of bpmEvents) {
			if (timePec < i.startTime) break;
			if (timePec > i.endTime) continue;
			timePhi = Math.round(((timePec - i.startTime) / i.bpm + i.value) * baseBpm * 32);
		}
		return timePhi;
	}
	//处理note和判定线事件
	let linesPec = [];
	for (const i of raw.n1) {
		if (!linesPec[i[0]]) linesPec[i[0]] = new JudgeLine(baseBpm);
		linesPec[i[0]].pushNote(new Note(1, calcTime(i[1]) + (i[4] ? 1e9 : 0), i[2] * 9 / 1024, 0, i[5]), i[3], i[4]);
	} //102.4
	for (const i of raw.n2) {
		if (!linesPec[i[0]]) linesPec[i[0]] = new JudgeLine(baseBpm);
		linesPec[i[0]].pushNote(new Note(3, calcTime(i[1]) + (i[5] ? 1e9 : 0), i[3] * 9 / 1024, calcTime(i[2]) - calcTime(i[1]), i[6]), i[4], i[5]);
	}

	for (const i of raw.n3) {
		if (!linesPec[i[0]]) linesPec[i[0]] = new JudgeLine(baseBpm);
		linesPec[i[0]].pushNote(new Note(4, calcTime(i[1]) + (i[4] ? 1e9 : 0), i[2] * 9 / 1024, 0, i[5]), i[3], i[4]);
	}
	for (const i of raw.n4) {
		if (!linesPec[i[0]]) linesPec[i[0]] = new JudgeLine(baseBpm);
		linesPec[i[0]].pushNote(new Note(2, calcTime(i[1]) + (i[4] ? 1e9 : 0), i[2] * 9 / 1024, 0, i[5]), i[3], i[4]);
	}
	//变速
	for (const i of raw.cv) {
		if (!linesPec[i[0]]) linesPec[i[0]] = new JudgeLine(baseBpm);
		linesPec[i[0]].pushEvent(0, calcTime(i[1]), null, i[2] / 7.0); //6.0??
	}
	//不透明度
	for (const i of raw.ca) {
		if (!linesPec[i[0]]) linesPec[i[0]] = new JudgeLine(baseBpm);
		linesPec[i[0]].pushEvent(-1, calcTime(i[1]), calcTime(i[1]), i[2] > 0 ? i[2] / 255 : 0); //暂不支持alpha值扩展
	}
	for (const i of raw.cf) {
		if (!linesPec[i[0]]) linesPec[i[0]] = new JudgeLine(baseBpm);
		linesPec[i[0]].pushEvent(-1, calcTime(i[1]), calcTime(i[2]), i[3] > 0 ? i[3] / 255 : 0);
	}
	//移动
	for (const i of raw.cp) {
		if (!linesPec[i[0]]) linesPec[i[0]] = new JudgeLine(baseBpm);
		linesPec[i[0]].pushEvent(-2, calcTime(i[1]), calcTime(i[1]), i[2] / 2048, i[3] / 1400, 1);
	}
	for (const i of raw.cm) {
		if (!linesPec[i[0]]) linesPec[i[0]] = new JudgeLine(baseBpm);
		linesPec[i[0]].pushEvent(-2, calcTime(i[1]), calcTime(i[2]), i[3] / 2048, i[4] / 1400, i[5]);
	}
	//旋转
	for (const i of raw.cd) {
		if (!linesPec[i[0]]) linesPec[i[0]] = new JudgeLine(baseBpm);
		linesPec[i[0]].pushEvent(-3, calcTime(i[1]), calcTime(i[1]), -i[2], 1); //??
	}
	for (const i of raw.cr) {
		if (!linesPec[i[0]]) linesPec[i[0]] = new JudgeLine(baseBpm);
		linesPec[i[0]].pushEvent(-3, calcTime(i[1]), calcTime(i[2]), -i[3], i[4]);
	}
	for (const i of linesPec) {
		if (i) {
			i.notesAbove.sort((a, b) => a.time - b.time); //以后移到123函数
			i.notesBelow.sort((a, b) => a.time - b.time); //以后移到123函数
			let s = i.speedEvents;
			let ldp = i.judgeLineDisappearEventsPec;
			let lmp = i.judgeLineMoveEventsPec;
			let lrp = i.judgeLineRotateEventsPec;
			const srt = (a, b) => (a.startTime - b.startTime) + (a.endTime - b.endTime); //不单独判断以避免误差
			s.sort(srt); //以后移到123函数
			ldp.sort(srt); //以后移到123函数
			lmp.sort(srt); //以后移到123函数
			lrp.sort(srt); //以后移到123函数
			//cv和floorPosition一并处理
			let y = 0;
			for (let j = 0; j < s.length; j++) {
				s[j].endTime = j < s.length - 1 ? s[j + 1].startTime : 1e9;
				if (s[j].startTime < 0) s[j].startTime = 0;
				s[j].floorPosition = y;
				y += (s[j].endTime - s[j].startTime) * s[j].value / i.bpm * 1.875;
			}
			for (const j of i.notesAbove) {
				let qwqwq = 0;
				let qwqwq2 = 0;
				let qwqwq3 = 0;
				for (const k of i.speedEvents) {
					if (j.time % 1e9 > k.endTime) continue;
					if (j.time % 1e9 < k.startTime) break;
					qwqwq = k.floorPosition;
					qwqwq2 = k.value;
					qwqwq3 = j.time % 1e9 - k.startTime;
				}
				j.floorPosition = qwqwq + qwqwq2 * qwqwq3 / i.bpm * 1.875;
				if (j.type == 3) j.speed *= qwqwq2;
			}
			for (const j of i.notesBelow) {
				let qwqwq = 0;
				let qwqwq2 = 0;
				let qwqwq3 = 0;
				for (const k of i.speedEvents) {
					if (j.time % 1e9 > k.endTime) continue;
					if (j.time % 1e9 < k.startTime) break;
					qwqwq = k.floorPosition;
					qwqwq2 = k.value;
					qwqwq3 = j.time % 1e9 - k.startTime;
				}
				j.floorPosition = qwqwq + qwqwq2 * qwqwq3 / i.bpm * 1.875;
				if (j.type == 3) j.speed *= qwqwq2;
			}
			//整合motionType
			let ldpTime = 0;
			let ldpValue = 0;
			for (const j of ldp) {
				i.pushEvent(1, ldpTime, j.startTime, ldpValue, ldpValue);
				if (tween[j.motionType]) {
					for (let k = parseInt(j.startTime); k < parseInt(j.endTime); k++) {
						let ptt1 = (k - j.startTime) / (j.endTime - j.startTime);
						let ptt2 = (k + 1 - j.startTime) / (j.endTime - j.startTime);
						let pt1 = j.value - ldpValue;
						i.pushEvent(1, k, k + 1, ldpValue + tween[j.motionType](ptt1) * pt1, ldpValue + tween[j.motionType](ptt2) * pt1);
					}
				} else if (j.motionType) {
					i.pushEvent(1, j.startTime, j.endTime, ldpValue, j.value);
					if (j.motionType != 1) console.warn("Unknown MotionType: %s(Regarded as 1)", j.motionType);
				}
				ldpTime = j.endTime;
				ldpValue = j.value;
			}
			i.pushEvent(1, ldpTime, 1e9, ldpValue, ldpValue);
			//
			let lmpTime = 0;
			let lmpValue = 0;
			let lmpValue2 = 0;
			for (const j of lmp) {
				i.pushEvent(2, lmpTime, j.startTime, lmpValue, lmpValue, lmpValue2, lmpValue2);
				if (tween[j.motionType]) {
					for (let k = parseInt(j.startTime); k < parseInt(j.endTime); k++) {
						let ptt1 = (k - j.startTime) / (j.endTime - j.startTime);
						let ptt2 = (k + 1 - j.startTime) / (j.endTime - j.startTime);
						let pt1 = j.value - lmpValue;
						let pt2 = j.value2 - lmpValue2;
						i.pushEvent(2, k, k + 1, lmpValue + tween[j.motionType](ptt1) * pt1, lmpValue + tween[j.motionType](ptt2) * pt1, lmpValue2 + tween[j.motionType](ptt1) * pt2, lmpValue2 + tween[j.motionType](ptt2) * pt2);
					}
				} else if (j.motionType) {
					i.pushEvent(2, j.startTime, j.endTime, lmpValue, j.value, lmpValue2, j.value2);
					if (j.motionType != 1) console.warn("Unknown MotionType: %s(Regarded as 1)", j.motionType);
				}
				lmpTime = j.endTime;
				lmpValue = j.value;
				lmpValue2 = j.value2;
			}
			i.pushEvent(2, lmpTime, 1e9, lmpValue, lmpValue, lmpValue2, lmpValue2);
			//
			let lrpTime = 0;
			let lrpValue = 0;
			for (const j of lrp) {
				i.pushEvent(3, lrpTime, j.startTime, lrpValue, lrpValue);
				if (tween[j.motionType]) {
					for (let k = parseInt(j.startTime); k < parseInt(j.endTime); k++) {
						let ptt1 = (k - j.startTime) / (j.endTime - j.startTime);
						let ptt2 = (k + 1 - j.startTime) / (j.endTime - j.startTime);
						let pt1 = j.value - lrpValue;
						i.pushEvent(3, k, k + 1, lrpValue + tween[j.motionType](ptt1) * pt1, lrpValue + tween[j.motionType](ptt2) * pt1);
					}
				} else if (j.motionType) {
					i.pushEvent(3, j.startTime, j.endTime, lrpValue, j.value);
					if (j.motionType != 1) console.warn("Unknown MotionType: %s(Regarded as 1)", j.motionType);
				}
				lrpTime = j.endTime;
				lrpValue = j.value;
			}
			i.pushEvent(3, lrpTime, 1e9, lrpValue, lrpValue);
			qwqChart.pushLine(i);
		}
	}
	return JSON.parse(JSON.stringify(qwqChart));
}
window.addEventListener("keydown", evt => {
	if (document.activeElement.classList.value != "input") {
		evt.preventDefault();
		if (btnPlay.value != "停止");
		else if (evt.key == " ") btnPause.click();
	}
}, false);
const tween = [null, null,
	pos => Math.sin(pos * Math.PI / 2), //2
	pos => 1 - Math.cos(pos * Math.PI / 2), //3
	pos => 1 - (pos - 1) ** 2, //4
	pos => pos ** 2, //5
	pos => (1 - Math.cos(pos * Math.PI)) / 2, //6
	pos => ((pos *= 2) < 1 ? pos ** 2 : -((pos - 2) ** 2 - 2)) / 2, //7
	pos => 1 + (pos - 1) ** 3, //8
	pos => pos ** 3, //9
	pos => 1 - (pos - 1) ** 4, //10
	pos => pos ** 4, //11
	pos => ((pos *= 2) < 1 ? pos ** 3 : ((pos - 2) ** 3 + 2)) / 2, //12
	pos => ((pos *= 2) < 1 ? pos ** 4 : -((pos - 2) ** 4 - 2)) / 2, //13
	pos => 1 + (pos - 1) ** 5, //14
	pos => pos ** 5, //15
	pos => 1 - 2 ** (-10 * pos), //16
	pos => 2 ** (10 * (pos - 1)), //17
	pos => Math.sqrt(1 - (pos - 1) ** 2), //18
	pos => 1 - Math.sqrt(1 - pos ** 2), //19
	pos => (2.70158 * pos - 1) * (pos - 1) ** 2 + 1, //20
	pos => (2.70158 * pos - 1.70158) * pos ** 2, //21
	pos => ((pos *= 2) < 1 ? (1 - Math.sqrt(1 - pos ** 2)) : (Math.sqrt(1 - (pos - 2) ** 2) + 1)) / 2, //22
	pos => pos < 0.5 ? (14.379638 * pos - 5.189819) * pos ** 2 : (14.379638 * pos - 9.189819) * (pos - 1) ** 2 + 1, //23
	pos => 1 - 2 ** (-10 * pos) * Math.cos(pos * Math.PI / .15), //24
	pos => 2 ** (10 * (pos - 1)) * Math.cos((pos - 1) * Math.PI / .15), //25
	pos => ((pos *= 11) < 4 ? pos ** 2 : pos < 8 ? (pos - 6) ** 2 + 12 : pos < 10 ? (pos - 9) ** 2 + 15 : (pos - 10.5) ** 2 + 15.75) / 16, //26
	pos => 1 - tween[26](1 - pos), //27
	pos => (pos *= 2) < 1 ? tween[26](pos) / 2 : tween[27](pos - 1) / 2 + .5, //28
	pos => pos < 0.5 ? 2 ** (20 * pos - 11) * Math.sin((160 * pos + 1) * Math.PI / 18) : 1 - 2 ** (9 - 20 * pos) * Math.sin((160 * pos + 1) * Math.PI / 18) //29
];
//导出json
function chartify(json) {
	let newChart = {};
	newChart.formatVersion = 3;
	newChart.offset = json.offset;
	newChart.numOfNotes = json.numOfNotes;
	newChart.judgeLineList = [];
	for (const i of json.judgeLineList) {
		let newLine = {};
		newLine.numOfNotes = i.numOfNotes;
		newLine.numOfNotesAbove = i.numOfNotesAbove;
		newLine.numOfNotesBelow = i.numOfNotesBelow;
		newLine.bpm = i.bpm;
		for (const i of ["speedEvents", "notesAbove", "notesBelow", "judgeLineDisappearEvents", "judgeLineMoveEvents", "judgeLineRotateEvents"]) newLine[i] = [];
		for (const j of i.speedEvents) {
			if (j.startTime == j.endTime) continue;
			let newEvent = {};
			newEvent.startTime = j.startTime;
			newEvent.endTime = j.endTime;
			newEvent.value = Number(j.value.toFixed(6));
			newEvent.floorPosition = Number(j.floorPosition.toFixed(6));
			newLine.speedEvents.push(newEvent);
		}
		for (const j of i.notesAbove) {
			let newNote = {};
			newNote.type = j.type;
			newNote.time = j.time;
			newNote.positionX = Number(j.positionX.toFixed(6));
			newNote.holdTime = j.holdTime;
			newNote.speed = Number(j.speed.toFixed(6));
			newNote.floorPosition = Number(j.floorPosition.toFixed(6));
			newLine.notesAbove.push(newNote);
		}
		for (const j of i.notesBelow) {
			let newNote = {};
			newNote.type = j.type;
			newNote.time = j.time;
			newNote.positionX = Number(j.positionX.toFixed(6));
			newNote.holdTime = j.holdTime;
			newNote.speed = Number(j.speed.toFixed(6));
			newNote.floorPosition = Number(j.floorPosition.toFixed(6));
			newLine.notesBelow.push(newNote);
		}
		for (const j of i.judgeLineDisappearEvents) {
			if (j.startTime == j.endTime) continue;
			let newEvent = {};
			newEvent.startTime = j.startTime;
			newEvent.endTime = j.endTime;
			newEvent.start = Number(j.start.toFixed(6));
			newEvent.end = Number(j.end.toFixed(6));
			newEvent.start2 = Number(j.start2.toFixed(6));
			newEvent.end2 = Number(j.end2.toFixed(6));
			newLine.judgeLineDisappearEvents.push(newEvent);
		}
		for (const j of i.judgeLineMoveEvents) {
			if (j.startTime == j.endTime) continue;
			let newEvent = {};
			newEvent.startTime = j.startTime;
			newEvent.endTime = j.endTime;
			newEvent.start = Number(j.start.toFixed(6));
			newEvent.end = Number(j.end.toFixed(6));
			newEvent.start2 = Number(j.start2.toFixed(6));
			newEvent.end2 = Number(j.end2.toFixed(6));
			newLine.judgeLineMoveEvents.push(newEvent);
		}
		for (const j of i.judgeLineRotateEvents) {
			if (j.startTime == j.endTime) continue;
			let newEvent = {};
			newEvent.startTime = j.startTime;
			newEvent.endTime = j.endTime;
			newEvent.start = Number(j.start.toFixed(6));
			newEvent.end = Number(j.end.toFixed(6));
			newEvent.start2 = Number(j.start2.toFixed(6));
			newEvent.end2 = Number(j.end2.toFixed(6));
			newLine.judgeLineRotateEvents.push(newEvent);
		}
		newChart.judgeLineList.push(newLine);
	}
	return newChart;
}
//给图片上色
function imgShader(img, color) {
	const canvas = document.createElement("canvas");
	canvas.width = img.width;
	canvas.height = img.height;
	const ctx = canvas.getContext("2d");
	ctx.drawImage(img, 0, 0);
	const imgData = ctx.getImageData(0, 0, img.width, img.height);
	const data = hex2rgba(color);
	for (let i = 0; i < imgData.data.length / 4; i++) {
		imgData.data[i * 4] *= data[0] / 255;
		imgData.data[i * 4 + 1] *= data[1] / 255;
		imgData.data[i * 4 + 2] *= data[2] / 255;
		imgData.data[i * 4 + 3] *= data[3] / 255;
	}
	return imgData;
}
//十六进制color转rgba数组
function hex2rgba(color) {
	const ctx = document.createElement("canvas").getContext("2d");
	ctx.fillStyle = color;
	ctx.fillRect(0, 0, 1, 1);
	return ctx.getImageData(0, 0, 1, 1).data;
}

function rgba2hex(...rgba) {
	return "#" + rgba.map(i => ("00" + Math.round(Number(i) * 255 || 0).toString(16)).slice(-2)).join("");
}
//读取csv
function csv2array(data, isObject) {
	const strarr = data.replace(/\r/g, "").split("\n");
	const col = [];
	for (const i of strarr) {
		let rowstr = "";
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
					rowstr = "";
				} else if (beforeQuot) {
					row.push(rowstr);
					rowstr = "";
					isQuot = false;
					beforeQuot = false;
				} else rowstr += j;
			} else if (!beforeQuot) rowstr += j;
			else throw "Error 1";
		}
		if (!isQuot) {
			row.push(rowstr);
			rowstr = "";
		} else if (beforeQuot) {
			row.push(rowstr);
			rowstr = "";
			isQuot = false;
			beforeQuot = false;
		} else throw "Error 2";
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