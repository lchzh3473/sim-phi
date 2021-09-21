"use strict";
const _i = ['Phigros模拟器', [1, 4, 8], 1611795955, 1632230639];
document.oncontextmenu = e => e.returnValue = false; //qwq
for (const i of document.getElementById("view-nav").children) {
	i.addEventListener("click", function() {
		for (const j of this.parentElement.children) j.classList.remove("active");
		const doc = document.getElementById("view-doc");
		const msg = document.getElementById("view-msg");
		this.classList.add("active");
		if (i.id == "msg") {
			doc.src = "";
			doc.classList.add("hide");
			msg.classList.remove("hide");
		} else {
			if (doc.getAttribute("src") != `docs/${i.id}.html`) doc.src = `docs/${i.id}.html`;
			msg.classList.add("hide");
			doc.classList.remove("hide");
		}
	});
}
document.getElementById("cover-dark").addEventListener("click", () => {
	document.getElementById("cover-dark").classList.add("fade");
	document.getElementById("cover-view").classList.add("fade");
});
document.getElementById("qwq").addEventListener("click", () => {
	document.getElementById("cover-dark").classList.remove("fade");
	document.getElementById("cover-view").classList.remove("fade");
	document.getElementById("res").click();
});
document.getElementById("msg-out").addEventListener("click", () => {
	document.getElementById("cover-dark").classList.remove("fade");
	document.getElementById("cover-view").classList.remove("fade");
	document.getElementById("msg").click();
});
const message = {
	out: document.getElementById("msg-out"),
	view: document.getElementById("view-msg"),
	lastMessage: "",
	isError: false,
	get num() {
		return this.view.querySelectorAll(".msgbox").length;
	},
	sendMessage(msg) {
		const num = this.num;
		this.out.className = num ? "warning" : "accept";
		this.out.innerText = msg + (num ? `（发现${num}个问题，点击查看）` : "");
		this.lastMessage = msg;
		this.isError = false;
	},
	sendWarning(msg) {
		const msgbox = document.createElement("div");
		msgbox.innerText = msg;
		msgbox.classList.add("msgbox");
		const btn = document.createElement("a");
		btn.innerText = "忽略";
		btn.style.float = "right";
		btn.onclick = () => {
			msgbox.remove();
			if (this.isError) this.sendError(this.lastMessage);
			else this.sendMessage(this.lastMessage);
		}
		msgbox.appendChild(btn);
		this.view.appendChild(msgbox);
		if (this.isError) this.sendError(this.lastMessage);
		else this.sendMessage(this.lastMessage);
	},
	sendError(msg) {
		const num = this.num;
		this.out.className = "error";
		this.out.innerText = msg + (num ? `（发现${num}个问题，点击查看）` : "");
		this.lastMessage = msg;
		this.isError = true;
	}
}
//
const upload = document.getElementById("upload");
const uploads = document.getElementById("uploads");
const mask = document.getElementById("mask");
const select = document.getElementById("select");
const selectbg = document.getElementById("select-bg");
const btnPlay = document.getElementById("btn-play");
const btnPause = document.getElementById("btn-pause");
const selectbgm = document.getElementById("select-bgm");
const selectchart = document.getElementById("select-chart");
const selectscaleratio = document.getElementById("select-scale-ratio"); //数值越大note越小
const selectaspectratio = document.getElementById("select-aspect-ratio");
const selectglobalalpha = document.getElementById("select-global-alpha");
const inputName = document.getElementById("input-name");
const inputLevel = document.getElementById("input-level");
const inputDesigner = document.getElementById("input-designer");
const inputIllustrator = document.getElementById("input-illustrator");
const inputOffset = document.getElementById("input-offset");
const showPoint = document.getElementById("showPoint");
const lineColor = document.getElementById("lineColor");
const autoplay = document.getElementById("autoplay");
const showTransition = document.getElementById("showTransition");
const videoRecorder = document.getElementById("videoRecorder"); //videotest
const bgs = {};
const bgsBlur = {};
const bgms = {};
const charts = {};
const chartLineData = []; //line.csv
const chartInfoData = []; //info.csv
const AspectRatio = 16 / 9; //宽高比上限
const Deg = Math.PI / 180; //角度转弧度
let wlen, hlen, wlen2, hlen2, noteScale, lineScale; //背景图相关
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d"); //游戏界面(alpha:false会出现兼容问题)
const canvasos = document.createElement("canvas"); //用于绘制游戏主界面
const ctxos = canvasos.getContext("2d");
const Renderer = { //存放谱面
	chart: null,
	bgImage: null,
	bgImageBlur: null,
	bgMusic: null,
	lines: [],
	notes: [],
	taps: [],
	drags: [],
	flicks: [],
	holds: [],
	reverseholds: [],
	tapholds: []
};
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
//兼容性检测
try {
	eval("window?.Array");
} catch (e) {
	message.sendWarning("检测到当前浏览器不支持可选链操作符，可能无法正常渲染图片");
}
if (typeof WebAssembly != "object") message.sendWarning("检测到当前浏览器不支持WebAssembly，可能无法正常渲染图片");
if (typeof createImageBitmap != "function") message.sendWarning("检测到当前浏览器不支持ImageBitmap，将无法使用模拟器");
if (!(window.AudioContext || window.webkitAudioContext)) message.sendWarning("检测到当前浏览器不支持AudioContext，将无法使用模拟器");
if (!full.enabled) message.sendWarning("检测到当前浏览器不支持全屏，播放时双击右下角将无反应");
//qwq
selectbg.onchange = () => {
	Renderer.bgImage = bgs[selectbg.value];
	Renderer.bgImageBlur = bgsBlur[selectbg.value];
	resizeCanvas();
}
//自动填写歌曲信息
selectchart.addEventListener("change", adjustInfo);

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
window.addEventListener("resize", resizeCanvas);
document.addEventListener("fullscreenchange", resizeCanvas);
selectscaleratio.addEventListener("change", resizeCanvas);
selectaspectratio.addEventListener("change", resizeCanvas);
//适应画面尺寸
function resizeCanvas() {
	const width = document.documentElement.clientWidth;
	const height = document.documentElement.clientHeight;
	const defaultWidth = Math.min(854, width * 0.8);
	const defaultHeight = defaultWidth / selectaspectratio.value;
	const realWidth = Math.floor(full.check(canvas) ? width : defaultWidth);
	const realHeight = Math.floor(full.check(canvas) ? height : defaultHeight);
	canvas.style.cssText += `;width:${realWidth}px;height:${realHeight}px`;
	canvas.width = realWidth * devicePixelRatio;
	canvas.height = realHeight * devicePixelRatio;
	canvasos.width = Math.min(realWidth, realHeight * AspectRatio) * devicePixelRatio;
	canvasos.height = realHeight * devicePixelRatio;
	wlen = canvasos.width / 2;
	hlen = canvasos.height / 2;
	wlen2 = canvasos.width / 18;
	hlen2 = canvasos.height * 0.6; //控制note流速
	noteScale = canvasos.width / selectscaleratio.value; //note、特效缩放
	lineScale = canvasos.width > canvasos.height * 0.75 ? canvasos.height / 18.75 : canvasos.width / 14.0625; //判定线、文字缩放
}
//qwq[water,demo,democlick]
const qwq = [true, false, 3];
document.getElementById("demo").classList.add("hide");
videoRecorder.nextElementSibling.classList.add("hide");
document.querySelector(".title").addEventListener("click", function() {
	if (qwq[1]) qwq[0] = !qwq[0];
	else if (!--qwq[2]) {
		document.getElementById("demo").classList.remove("hide");
		if (video.msdest) videoRecorder.nextElementSibling.classList.remove("hide");
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
		message.sendMessage(`加载文件：${Math.floor(progress.loaded / 5079057 * 100)}%`);
	};
	xhr.onload = () => {
		document.getElementById("filename").value = "demo.zip";
		loadFile(xhr.response);
	};
});
const mouse = {}; //存放鼠标事件(用于检测，下同)
const touch = {}; //存放触摸事件
const keyboard = {}; //存放键盘事件
const taps = []; //额外处理tap(试图修复吃音bug)
const specialClick = {
	time: [0, 0, 0, 0],
	func: [() => {
		btnPause.click();
	}, () => {
		btnPlay.click();
		btnPlay.click();
	}, () => {}, () => {
		full.toggle(canvas);
	}],
	click: function(id) {
		const now = Date.now();
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
		taps.push(new Click(offsetX, offsetY));
		if (offsetX < lineScale * 1.5 && offsetY < lineScale * 1.5) specialClick.click(0);
		if (offsetX > canvasos.width - lineScale * 1.5 && offsetY < lineScale * 1.5) specialClick.click(1);
		if (offsetX < lineScale * 1.5 && offsetY > canvasos.height - lineScale * 1.5) specialClick.click(2);
		if (offsetX > canvasos.width - lineScale * 1.5 && offsetY > canvasos.height - lineScale * 1.5) specialClick.click(3);
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
		if (!autoplay.checked) {
			for (const j in mouse) {
				const i = mouse[j];
				if (i instanceof Click) {
					if (i.time) this.push(new Judgement(i.offsetX, i.offsetY, 2));
					else if (i.isMoving) this.push(new Judgement(i.offsetX, i.offsetY, 3));
					//else this.push(new Judgement(i.offsetX, i.offsetY, 1));
				}
			}
			for (const j in touch) {
				const i = touch[j];
				if (i instanceof Click) {
					if (i.time) this.push(new Judgement(i.offsetX, i.offsetY, 2));
					else if (i.isMoving) this.push(new Judgement(i.offsetX, i.offsetY, 3));
					//else this.push(new Judgement(i.offsetX, i.offsetY, 1));
				}
			}
			for (const j in keyboard) {
				const i = keyboard[j];
				if (i instanceof Click) {
					if (i.time) this.push(new Judgement(i.offsetX, i.offsetY, 2));
					else /*if (i.isMoving)*/ this.push(new Judgement(i.offsetX, i.offsetY, 3));
					//else this.push(new Judgement(i.offsetX, i.offsetY, 1));
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
							if (!this[j].catched) {
								i.status = 3;
								i.badtime = Date.now();
							}
						} else if (i.realTime - realTime > 0.08) {
							//console.log("Good(Early)", i.name);
							i.status = 2;
							if (document.getElementById("hitSong").checked) playSound(res["HitSong0"], false, true, 0);
							clickEvents1.push(ClickEvent1.getClickGood(i.projectX, i.projectY));
						} else if (i.realTime - realTime > -0.08) {
							//console.log("Perfect", i.name);
							i.status = 1;
							if (document.getElementById("hitSong").checked) playSound(res["HitSong0"], false, true, 0);
							clickEvents1.push(ClickEvent1.getClickPerfect(i.projectX, i.projectY));
						} else {
							//console.log("Good(Late)", i.name);
							i.status = 2;
							if (document.getElementById("hitSong").checked) playSound(res["HitSong0"], false, true, 0);
							clickEvents1.push(ClickEvent1.getClickGood(i.projectX, i.projectY));
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
				if (i.status == 1 && i.realTime - realTime < 0) {
					if (document.getElementById("hitSong").checked) playSound(res["HitSong1"], false, true, 0);
					clickEvents1.push(ClickEvent1.getClickPerfect(i.projectX, i.projectY));
					stat.addCombo(1, 2);
					i.scored = true;
				} else if (!i.status) {
					for (let j = 0; j < this.length; j++) {
						if (this[j].isInArea(i.offsetX, i.offsetY, i.cosr, i.sinr, width) && i.realTime - realTime < 0.16 && i.realTime - realTime > -0.16) {
							//console.log("Perfect", i.name);
							this[j].catched = true;
							i.status = 1;
							break;
						}
					}
				}
			} else if (i.type == 3) {
				if (i.status3) {
					if ((Date.now() - i.status3) * i.holdTime >= 1.6e4 * i.realHoldTime) { //间隔时间与bpm成反比，待实测
						if (i.status2 == 1) clickEvents1.push(ClickEvent1.getClickPerfect(i.projectX, i.projectY));
						else if (i.status2 == 2) clickEvents1.push(ClickEvent1.getClickGood(i.projectX, i.projectY));
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
							if (document.getElementById("hitSong").checked) playSound(res["HitSong0"], false, true, 0);
							if (i.realTime - realTime > 0.08) {
								//console.log("Good(Early)", i.name);
								i.status2 = 2;
								clickEvents1.push(ClickEvent1.getClickGood(i.projectX, i.projectY));
								i.status3 = Date.now();
							} else if (i.realTime - realTime > -0.08) {
								//console.log("Perfect", i.name);
								i.status2 = 1;
								clickEvents1.push(ClickEvent1.getClickPerfect(i.projectX, i.projectY));
								i.status3 = Date.now();
							} else {
								//console.log("Good(Late)", i.name);
								i.status2 = 2;
								clickEvents1.push(ClickEvent1.getClickGood(i.projectX, i.projectY));
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
					if (document.getElementById("hitSong").checked) playSound(res["HitSong2"], false, true, 0);
					clickEvents1.push(ClickEvent1.getClickPerfect(i.projectX, i.projectY));
					stat.addCombo(1, 4);
					i.scored = true;
				} else if (!i.status) {
					for (let j = 0; j < this.length; j++) {
						if (this[j].isInArea(i.offsetX, i.offsetY, i.cosr, i.sinr, width) && i.realTime - realTime < 0.16 && i.realTime - realTime > -0.16) {
							//console.log("Perfect", i.name);
							this[j].catched = true;
							if (this[j].type == 3) {
								i.status = 1;
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
	defilter(func) {
		var i = this.length;
		while (i--) {
			if (func(this[i])) this.splice(i, 1);
		}
		return this;
	}
}
const clickEvents0 = new ClickEvents(); //存放点击特效
const clickEvents1 = new ClickEvents(); //存放点击特效
class ClickEvent0 {
	constructor(offsetX, offsetY, n1, n2) {
		this.offsetX = Number(offsetX) || 0;
		this.offsetY = Number(offsetY) || 0;
		this.color = String(n1);
		this.text = String(n2);
		this.time = 0;
	}
	static getClickTap(offsetX, offsetY) {
		//console.log("Tap", offsetX, offsetY);
		return new ClickEvent0(offsetX, offsetY, "cyan", "");
	}
	static getClickHold(offsetX, offsetY) {
		//console.log("Hold", offsetX, offsetY);
		return new ClickEvent0(offsetX, offsetY, "lime", "");
	}
	static getClickMove(offsetX, offsetY) {
		//console.log("Move", offsetX, offsetY);
		return new ClickEvent0(offsetX, offsetY, "violet", "");
	}
}
class ClickEvent1 {
	constructor(offsetX, offsetY, n1, n2, n3) {
		this.offsetX = Number(offsetX) || 0;
		this.offsetY = Number(offsetY) || 0;
		this.time = Date.now();
		this.duration = 500;
		this.images = res["Clicks"][n1]; //以后做缺少检测
		this.color = String(n3);
		this.rand = Array(Number(n2) || 0).fill().map(() => [Math.random() * 80 + 185, Math.random() * 2 * Math.PI]);
	}
	static getClickPerfect(offsetX, offsetY) {
		return new ClickEvent1(offsetX, offsetY, "rgba(255,236,160,0.8823529)", 4, "#ffeca0");
	}
	static getClickGood(offsetX, offsetY) {
		return new ClickEvent1(offsetX, offsetY, "rgba(180,225,255,0.9215686)", 3, "#b4e1ff");
	}
}
//适配PC鼠标
const isMouseDown = {};
canvas.addEventListener("mousedown", function(evt) {
	evt.preventDefault();
	const idx = evt.button;
	const dx = (full.check(this) ? evt.pageX : evt.pageX - getOffsetLeft(this)) / this.offsetWidth * this.width - (this.width - canvasos.width) / 2;
	const dy = (full.check(this) ? evt.pageY : evt.pageY - getOffsetTop(this)) / this.offsetHeight * this.height;
	mouse[idx] = Click.activate(dx, dy);
	isMouseDown[idx] = true;
});
canvas.addEventListener("mousemove", function(evt) {
	evt.preventDefault();
	for (const idx in isMouseDown) {
		if (isMouseDown[idx]) {
			const dx = (full.check(this) ? evt.pageX : evt.pageX - getOffsetLeft(this)) / this.offsetWidth * this.width - (this.width - canvasos.width) / 2;
			const dy = (full.check(this) ? evt.pageY : evt.pageY - getOffsetTop(this)) / this.offsetHeight * this.height;
			mouse[idx].move(dx, dy);
		}
	}
});
canvas.addEventListener("mouseup", function(evt) {
	evt.preventDefault();
	const idx = evt.button;
	delete mouse[idx];
	delete isMouseDown[idx];
});
canvas.addEventListener("mouseout", function(evt) {
	evt.preventDefault();
	for (const idx in isMouseDown) {
		if (isMouseDown[idx]) {
			delete mouse[idx];
			delete isMouseDown[idx];
		}
	}
});
//适配键盘(喵喵喵?)
window.addEventListener("keydown", function(evt) {
	if (document.activeElement.classList.value == "input") return;
	if (btnPlay.value != "停止") return;
	evt.preventDefault();
	if (evt.key == "Shift") btnPause.click();
	else if (keyboard[evt.code] instanceof Click);
	else keyboard[evt.code] = Click.activate(NaN, NaN);
}, false);
window.addEventListener("keyup", function(evt) {
	if (document.activeElement.classList.value == "input") return;
	if (btnPlay.value != "停止") return;
	evt.preventDefault();
	if (evt.key == "Shift");
	else if (keyboard[evt.code] instanceof Click) delete keyboard[evt.code];
}, false);
window.addEventListener("blur", () => {
	for (const i in keyboard) delete keyboard[i]; //失去焦点清除键盘事件
});
//适配移动设备
const passive = {
	passive: false
}; //不加这玩意会出现warning
canvas.addEventListener("touchstart", function(evt) {
	evt.preventDefault();
	for (const i of evt.changedTouches) {
		const idx = i.identifier; //移动端存在多押bug(可能已经解决了？)
		const dx = (full.check(this) ? i.pageX : i.pageX - getOffsetLeft(this)) / this.offsetWidth * this.width - (this.width - canvasos.width) / 2;
		const dy = (full.check(this) ? i.pageY : i.pageY - getOffsetTop(this)) / this.offsetHeight * this.height;
		touch[idx] = Click.activate(dx, dy);
	}
}, passive);
canvas.addEventListener("touchmove", function(evt) {
	evt.preventDefault();
	for (const i of evt.changedTouches) {
		const idx = i.identifier;
		const dx = (full.check(this) ? i.pageX : i.pageX - getOffsetLeft(this)) / this.offsetWidth * this.width - (this.width - canvasos.width) / 2;
		const dy = (full.check(this) ? i.pageY : i.pageY - getOffsetTop(this)) / this.offsetHeight * this.height;
		touch[idx].move(dx, dy);
	}
}, passive);
canvas.addEventListener("touchend", function(evt) {
	evt.preventDefault();
	for (const i of evt.changedTouches) {
		const idx = i.identifier;
		delete touch[idx];
	}
});
canvas.addEventListener("touchcancel", function(evt) {
	evt.preventDefault();
	for (const i of evt.changedTouches) {
		const idx = i.identifier;
		delete touch[idx];
	}
});
//优化触摸定位，以后整合进class
function getOffsetLeft(element) {
	if (!(element instanceof HTMLElement)) return NaN;
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
	let elem = element;
	let a = 0;
	while (elem instanceof HTMLElement) {
		a += elem.offsetTop;
		elem = elem.offsetParent;
	}
	return a;
}
//声音组件
const AudioContext = window.AudioContext || window.webkitAudioContext;
const actx = (new Audio()).canPlayType("audio/ogg") == "" ? new oggmented.OggmentedAudioContext() : new AudioContext(); //兼容Safari
const stopPlaying = [];
const video = { //videotest
	msdest: actx.createMediaStreamDestination && canvas.captureStream ? actx.createMediaStreamDestination() : null,
	record: function() {
		if (!this.msdest) return;
		const support = [
			"video/mp4;codecs=avc1", "video/mp4;codecs=mp4a",
			"video/webm;codecs=vp9,pcm", "video/webm;codecs=vp8,pcm",
			"video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus",
		].find(n => MediaRecorder.isTypeSupported(n));
		const cStream = canvas.captureStream();
		const aStream = this.msdest.stream;
		const mixStream = new MediaStream([cStream.getVideoTracks()[0], aStream.getAudioTracks()[0]]);
		try {
			const recorder = new MediaRecorder(mixStream, {
				videoBitsPerSecond: 2e7,
				mimeType: support || ""
			}); //mixStream
			const chunks = [];
			recorder.ondataavailable = evt => evt.data && evt.data.size && chunks.push(evt.data);
			recorder.onstop = () => {
				if (chunks.length) {
					const blob = new Blob(chunks);
					const a = document.createElement("a");
					a.href = URL.createObjectURL(blob);
					a.download = `${parseInt(Date.now()/1e3)}.${support.match(/\/(.+)?;/)[1]}`;
					a.click();
					chunks.length = 0;
				} else alert("Recording Failed");
			};
			recorder.start();
			stopPlaying.push(() => recorder.stop());
		} catch (e) {
			alert("Recording Failed:" + e.message);
		}
	}
}
const playSound = (res, loop, isOut, offset) => {
	const bufferSource = actx.createBufferSource();
	bufferSource.buffer = res;
	bufferSource.loop = loop; //循环播放
	if (isOut) bufferSource.connect(actx.destination);
	if (videoRecorder.checked) bufferSource.connect(video.msdest); //videotest
	bufferSource.start(0, offset);
	return () => bufferSource.stop();
}
const res = {}; //存放资源
resizeCanvas();
uploads.classList.add("disabled");
select.classList.add("disabled");
//初始化
window.onload = function() {
	//加载资源
	(async function() {
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
			LevelOver1: "src/LevelOver1.png",
			LevelOver3: "src/LevelOver3.png",
			LevelOver4: "src/LevelOver4.png",
			LevelOver5: "src/LevelOver5.png",
			Rank: "src/Rank.png",
			NoImage: "src/0.png",
			mute: "src/mute.ogg",
			HitSong0: "src/HitSong0.ogg",
			HitSong1: "src/HitSong1.ogg",
			HitSong2: "src/HitSong2.ogg"
		}).map(([name, src], _i, arr) => {
			const xhr = new XMLHttpRequest();
			xhr.open("get", src, true);
			xhr.responseType = 'arraybuffer';
			xhr.send();
			return new Promise(resolve => {
				xhr.onload = async () => {
					if (/\.(mp3|wav|ogg)$/i.test(src)) res[name] = await actx.decodeAudioData(xhr.response);
					else if (/\.(png|jpeg|jpg)$/i.test(src)) res[name] = await createImageBitmap(new Blob([xhr.response]));
					message.sendMessage(`加载资源：${Math.floor(++loadedNum / arr.length * 100)}%`);
					resolve();
				};
			});
		}));
		res["JudgeLineAP"] = await createImageBitmap(imgShader(res["JudgeLine"], "#feffa9"));
		res["JudgeLineFC"] = await createImageBitmap(imgShader(res["JudgeLine"], "#a2eeff"));
		res["TapBad"] = await createImageBitmap(imgShader(res["Tap2"], "#6c4343"));
		res["Clicks"] = {};
		//res["Clicks"].default = await qwqImage(res["clickRaw"], "white");
		res["Ranks"] = await qwqImage(res["Rank"], "white");
		res["Clicks"]["rgba(255,236,160,0.8823529)"] = await qwqImage(res["clickRaw"], "rgba(255,236,160,0.8823529)"); //#fce491
		res["Clicks"]["rgba(180,225,255,0.9215686)"] = await qwqImage(res["clickRaw"], "rgba(180,225,255,0.9215686)"); //#9ed5f3
		message.sendMessage("等待上传文件...");
		upload.parentElement.classList.remove("disabled");
	})();
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
const stat = {
	get all() {
		return this.perfect + this.good + this.bad + this.miss;
	},
	get scoreNum() {
		const a = 1e6 * (this.perfect * 0.9 + this.good * 0.585 + this.maxcombo * 0.1) / this.numOfNotes;
		return isFinite(a) ? a : 0;
	},
	get scoreStr() {
		const a = this.scoreNum.toFixed(0);
		return ("0").repeat(a.length < 7 ? 7 - a.length : 0) + a;
	},
	get accNum() {
		const a = (this.perfect + this.good * 0.65) / this.all;
		return isFinite(a) ? a : 0;
	},
	get accStr() {
		return (100 * this.accNum).toFixed(2) + "%";
	},
	get lineStatus() {
		if (this.bad + this.miss) return 0;
		if (this.good) return 2;
		return 1;
	},
	get rankStatus() {
		const a = Math.round(this.scoreNum);
		if (a >= 1e6) return 0;
		if (a >= 9.6e5) return 1;
		if (a >= 9.2e5) return 2;
		if (a >= 8.8e5) return 3;
		if (a >= 8.2e5) return 4;
		if (a >= 7e5) return 5;
		return 6;
	},
	get localData() {
		const l1 = Math.round(this.accNum * 1e4 + 566).toString(22).slice(-3);
		const l2 = Math.round(this.scoreNum + 40672).toString(32).slice(-4);
		const l3 = (Number(inputLevel.value.match(/\d+$/))).toString(36).slice(-1);
		return l1 + l2 + l3;
	},
	getData(isAuto) {
		const s1 = this.data[this.id].slice(0, 3);
		const s2 = this.data[this.id].slice(3, 7);
		const l1 = Math.round(this.accNum * 1e4 + 566).toString(22).slice(-3);
		const l2 = Math.round(this.scoreNum + 40672).toString(32).slice(-4);
		const l3 = (Number(inputLevel.value.match(/\d+$/))).toString(36).slice(-1);
		const a = (parseInt(s2, 32) - 40672).toFixed(0);
		const scoreBest = ("0").repeat(a.length < 7 ? 7 - a.length : 0) + a;
		if (!isAuto) this.data[this.id] = (s1 > l1 ? s1 : l1) + (s2 > l2 ? s2 : l2) + l3;
		const arr = [];
		for (const i in this.data) arr.push(i + this.data[i]);
		localStorage.setItem("phi", arr.sort(() => Math.random() - 0.5).join(""));
		if (isAuto) return [false, scoreBest, "", true];
		return [s2 < l2, scoreBest, (s2 > l2 ? "- " : "+ ") + Math.abs(scoreBest - this.scoreStr), false];
	},
	reset(numOfNotes, id) {
		this.numOfNotes = Number(numOfNotes) || 0;
		this.perfect = 0;
		this.good = 0;
		this.bad = 0;
		this.miss = 0;
		this.combo = 0;
		this.maxcombo = 0;
		this.combos = [0, 0, 0, 0, 0]; //不同种类note实时连击次数
		this.data = {};
		if (localStorage.getItem("phi") == null) localStorage.setItem("phi", ""); //初始化存储
		const str = localStorage.getItem("phi");
		for (let i = 0; i < parseInt(str.length / 40); i++) {
			const data = str.slice(i * 40, i * 40 + 40);
			this.data[data.slice(0, 32)] = data.slice(-8);
		}
		if (id) {
			if (!this.data[id]) this.data[id] = this.localData;
			this.id = id;
		}
	},
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
//const stat = new Stat();
const comboColor = ["#fff", "#0ac3ff", "#f0ed69", "#a0e9fd", "#fe4365"];
//读取文件
upload.onchange = function() {
	const file = this.files[0];
	document.getElementById("filename").value = file ? file.name : "";
	if (!file) {
		message.sendError("未选择任何文件");
		return;
	}
	uploads.classList.add("disabled");
	loadFile(file);
}
const time2Str = time => `${`00${parseInt(time/60)}`.slice(-2)}:${`00${parseInt(time%60)}`.slice(-2)}`;
const frameTimer = { //计算fps
	tick: 0,
	time: Date.now(),
	fps: "",
	addTick: function(fr = 10) {
		if (++this.tick >= fr) {
			this.tick = 0;
			this.fps = (1e3 * fr / (-this.time + (this.time = Date.now()))).toFixed(0);
			btnPause.click();
			btnPause.click(); //音频与谱面按时同步
		}
		return this.fps;
	}
}
class Timer {
	constructor() {
		this.reset();
	}
	play() {
		if (!this.isPaused) throw new Error("Time has been playing");
		this.t1 = Date.now();
		this.isPaused = false;
	}
	pause() {
		if (this.isPaused) throw new Error("Time has been paused");
		this.t0 = this.time;
		this.isPaused = true;
	}
	reset() {
		this.t0 = 0;
		this.t1 = 0;
		this.isPaused = true;
	}
	addTime(num) {
		this.t0 += num;
	}
	get time() {
		if (this.isPaused) return this.t0;
		return this.t0 + Date.now() - this.t1;
	}
	get second() {
		return this.time / 1e3;
	}
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
const loadFile = function(file) {
	qwq[1] = true;
	document.getElementById("demo").classList.add("hide");
	const reader = new FileReader();
	reader.readAsArrayBuffer(file);
	reader.onprogress = progress => { //显示加载文件进度
		const size = file.size;
		message.sendMessage(`加载文件：${Math.floor(progress.loaded / size * 100)}%`);
	};
	reader.onload = async function() {
		//加载zip//gildas-lormeau.github.io/zip.js)
		const reader = new zip.ZipReader(new zip.Uint8ArrayReader(new Uint8Array(this.result)));
		reader.getEntries().then(async zipDataRaw => {
			const zipData = [];
			for (const i of zipDataRaw) {
				if (i.filename.replace(/.*\//, "")) zipData.push(i); //过滤文件夹
			}
			console.log(zipData);
			let loadedNum = 0;
			const zipRaw = await Promise.all(zipData.map(i => new Promise(resolve => {
				if (i.filename == "line.csv") {
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
				} else i.getData(new zip.Uint8ArrayWriter()).then(async data => {
					const audioData = await actx.decodeAudioData(data.buffer);
					bgms[i.filename] = audioData;
					selectbgm.appendChild(createOption(i.filename, i.filename));
					loading(++loadedNum);
					resolve(audioData);
				}).catch(() => {
					return i.getData(new zip.BlobWriter()).then(async data => {
						const imageData = await createImageBitmap(data);
						bgs[i.filename] = imageData;
						bgsBlur[i.filename] = await createImageBitmap(imgBlur(imageData));
						selectbg.appendChild(createOption(i.filename, i.filename));
						loading(++loadedNum);
						resolve(imageData);
					});
				}).catch(() => {
					return i.getData(new zip.TextWriter()).then(async data => {
						console.log(JSON.parse(data)); //test
						const jsonData = await chart123(JSON.parse(data));
						charts[i.filename] = jsonData;
						charts[i.filename]["md5"] = md5(data);
						selectchart.appendChild(createOption(i.filename, i.filename));
						loading(++loadedNum);
						resolve(jsonData);
					});
				}).catch(() => {
					return i.getData(new zip.TextWriter()).then(async data => {
						const jsonData = await chart123(chartp23(data, i.filename));
						charts[i.filename] = jsonData;
						charts[i.filename]["md5"] = md5(data);
						selectchart.appendChild(createOption(i.filename, i.filename));
						loading(++loadedNum);
						resolve(jsonData);
					});
				}).catch(() => {
					loading(++loadedNum);
					message.sendWarning(`不支持的文件：${i.filename}`);
					resolve(undefined);
				});
			})));

			function createOption(innerhtml, value) {
				const option = document.createElement("option");
				const isHidden = /(^|\/)\./.test(innerhtml);
				option.innerHTML = isHidden ? "" : innerhtml;
				option.value = value;
				if (isHidden) option.classList.add("hide");
				return option;
			}

			function loading(num) {
				message.sendMessage(`读取文件：${Math.floor(num/zipData.length * 100)}%`);
				if (num == zipData.length) {
					if (selectchart.children.length == 0) {
						message.sendError("读取出错：未发现谱面文件"); //test
					} else if (selectbgm.children.length == 0) {
						message.sendError("读取出错：未发现音乐文件"); //test
					} else {
						select.classList.remove("disabled");
						btnPause.classList.add("disabled");
						adjustInfo();
					}
				}
			}
			console.log(zipRaw);
		}, () => {
			message.sendError("读取出错：不是zip文件"); //test
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
		i.images = [res["JudgeLine"], res["JudgeLineAP"], res["JudgeLineFC"]];
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
	Renderer.reverseholds.sort(sortNote).reverse();
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
		if (note.type == 3) Renderer.reverseholds.push(note);
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
document.addEventListener("pagehide", () => document.visibilityState == "hidden" && btnPause.value == "暂停" && btnPause.click()); //兼容Safari
const qwqIn = new Timer();
const qwqOut = new Timer();
const qwqEnd = new Timer();
//play
btnPlay.addEventListener("click", async function() {
	btnPause.value = "暂停";
	if (this.value == "播放") {
		stopPlaying.push(playSound(res["mute"], true, false, 0)); //播放空音频(防止音画不同步)
		for (const i of ["lines", "notes", "taps", "drags", "flicks", "holds", "reverseholds", "tapholds"]) Renderer[i] = [];
		Renderer.chart = prerenderChart(charts[selectchart.value]); //fuckqwq
		stat.reset(Renderer.chart.numOfNotes, Renderer.chart.md5);
		for (const i of chartLineData) {
			if (selectchart.value == i.Chart) {
				Renderer.chart.judgeLineList[i.LineId].images[0] = bgs[i.Image];
				Renderer.chart.judgeLineList[i.LineId].images[1] = await createImageBitmap(imgShader(bgs[i.Image], "#feffa9"));
				Renderer.chart.judgeLineList[i.LineId].images[2] = await createImageBitmap(imgShader(bgs[i.Image], "#a2eeff"));
				Renderer.chart.judgeLineList[i.LineId].imageH = Number(i.Vert);
				Renderer.chart.judgeLineList[i.LineId].imageW = Number(i.Horz);
				Renderer.chart.judgeLineList[i.LineId].imageB = Number(i.IsDark);
			}
		}
		Renderer.bgImage = bgs[selectbg.value] || res["NoImage"];
		Renderer.bgImageBlur = bgsBlur[selectbg.value] || res["NoImage"];
		Renderer.bgMusic = bgms[selectbgm.value];
		this.value = "停止";
		resizeCanvas();
		duration = Renderer.bgMusic.duration;
		isInEnd = false;
		isOutStart = false;
		isOutEnd = false;
		isPaused = false;
		timeBgm = 0;
		if (!showTransition.checked) qwqIn.addTime(3000);
		canvas.classList.remove("fade");
		mask.classList.add("fade");
		btnPause.classList.remove("disabled");
		for (const i of document.querySelectorAll(".disabled-when-playing")) i.classList.add("disabled");
		if (videoRecorder.checked) btnPause.classList.add("disabled"); //videotest录制时不允许暂停(存在bug)
		loop();
		qwqIn.play();
		if (videoRecorder.checked) video.record(); //videotest
	} else {
		if (videoRecorder.checked) btnPlay.classList.add("disabled"); //只许录制一次(存在bug)
		while (stopPlaying.length) stopPlaying.shift()();
		cancelAnimationFrame(stopDrawing);
		resizeCanvas();
		canvas.classList.add("fade");
		mask.classList.remove("fade");
		for (const i of document.querySelectorAll(".disabled-when-playing")) i.classList.remove("disabled");
		btnPause.classList.add("disabled");
		//清除原有数据
		fucktemp = false;
		fucktemp2 = false;
		clickEvents0.length = 0;
		clickEvents1.length = 0;
		qwqIn.reset();
		qwqOut.reset();
		qwqEnd.reset();
		curTime = 0;
		curTimestamp = 0;
		duration = 0;
		this.value = "播放";
	}
});
btnPause.addEventListener("click", function() {
	if (this.classList.contains("disabled") || btnPlay.value == "播放") return;
	if (this.value == "暂停") {
		qwqIn.pause();
		if (showTransition.checked && isOutStart) qwqOut.pause();
		isPaused = true;
		this.value = "继续";
		curTime = timeBgm;
		while (stopPlaying.length) stopPlaying.shift()();
	} else {
		qwqIn.play();
		if (showTransition.checked && isOutStart) qwqOut.play();
		isPaused = false;
		if (isInEnd && !isOutStart) playBgm(Renderer.bgMusic, timeBgm);
		this.value = "暂停";
	}
});
inputOffset.addEventListener("input", function() {
	if (this.value < -400) this.value = -400;
	if (this.value > 600) this.value = 600;
});
//播放bgm
function playBgm(data, offset) {
	isPaused = false;
	if (!offset) offset = 0;
	curTimestamp = Date.now();
	stopPlaying.push(playSound(data, false, true, offset));
}
let fucktemp = false;
let fucktemp2 = false;
//作图
function loop() {
	const now = Date.now();
	//计算时间
	if (qwqOut.second < 0.67) {
		calcqwq(now);
		qwqdraw1(now);
	} else if (!fucktemp) qwqdraw2();
	if (fucktemp2) qwqdraw3(fucktemp2);
	ctx.globalAlpha = 1;
	if (document.getElementById("imageBlur").checked) ctx.drawImage(Renderer.bgImageBlur, ...adjustSize(Renderer.bgImageBlur, canvas, 1.1));
	else ctx.drawImage(Renderer.bgImage, ...adjustSize(Renderer.bgImage, canvas, 1.1));
	ctx.fillStyle = "#000";
	ctx.globalAlpha = 0.4;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.globalAlpha = 1;
	ctx.drawImage(canvasos, (canvas.width - canvasos.width) / 2, 0);
	//Copyright
	ctx.font = `${lineScale*0.4}px Mina`;
	ctx.fillStyle = "#ccc";
	ctx.globalAlpha = 0.8;
	ctx.textAlign = "right";
	ctx.textBaseline = "middle";
	ctx.fillText(`Phigros Simulator v${_i[1].join('.')} - Code by lch\zh3473`, (canvas.width + canvasos.width) / 2 - lineScale * 0.1, canvas.height - lineScale * 0.2);
	stopDrawing = requestAnimationFrame(loop); //回调更新动画
}

function calcqwq(now) {
	if (!isInEnd && qwqIn.second >= 3) {
		isInEnd = true;
		playBgm(Renderer.bgMusic);
	}
	if (!isPaused && isInEnd && !isOutStart) timeBgm = (now - curTimestamp) / 1e3 + curTime;
	if (timeBgm >= duration) isOutStart = true;
	if (showTransition.checked && isOutStart && !isOutEnd) {
		isOutEnd = true;
		qwqOut.play();
	}
	timeChart = Math.max(timeBgm - Renderer.chart.offset - (Number(inputOffset.value) / 1e3 || 0), 0);
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
			line.offsetX = canvasos.width * (i.start * t1 + i.end * t2);
			line.offsetY = canvasos.height * (1 - i.start2 * t1 - i.end2 * t2);
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
			i.cosr = line.cosr;
			i.sinr = line.sinr;
			setAlpha(i, wlen2 * i.positionX, hlen2 * getY(i));
		}
		for (const i of line.notesBelow) {
			i.cosr = -line.cosr;
			i.sinr = -line.sinr;
			setAlpha(i, -wlen2 * i.positionX, hlen2 * getY(i));
		}

		function getY(i) {
			if (!i.badtime) return realgetY(i);
			if (Date.now() - i.badtime > 500) delete i.badtime;
			if (!i.badY) i.badY = realgetY(i);
			return i.badY;
		}

		function realgetY(i) {
			if (i.type != 3) return (i.floorPosition - line.positionY) * i.speed;
			if (i.realTime < timeChart) return (i.realTime - timeChart) * i.speed;
			return i.floorPosition - line.positionY;
		}

		function setAlpha(i, dx, dy) {
			i.projectX = line.offsetX + dx * i.cosr;
			i.offsetX = i.projectX + dy * i.sinr;
			i.projectY = line.offsetY + dx * i.sinr;
			i.offsetY = i.projectY - dy * i.cosr;
			i.visible = Math.abs(i.offsetX - wlen) + Math.abs(i.offsetY - hlen) < wlen * 1.23625 + hlen + hlen2 * i.realHoldTime * i.speed;
			if (i.badtime) i.alpha = 1 - range((Date.now() - i.badtime) / 500);
			else if (i.realTime > timeChart) {
				if (dy > -1e-3) i.alpha = (i.type == 3 && i.speed == 0) ? (showPoint.checked ? 0.45 : 0) : 1;
				else i.alpha = showPoint.checked ? 0.45 : 0;
			} else {
				if (i.type == 3) i.alpha = i.speed == 0 ? (showPoint.checked ? 0.45 : 0) : (i.status == 4 ? 0.45 : 1);
				else i.alpha = Math.max(1 - (timeChart - i.realTime) / 0.16, 0); //过线后0.16s消失
			}
		}
	}
	if (isInEnd) {
		judgements.addJudgement(Renderer.notes, timeChart);
		judgements.judgeNote(Renderer.drags, timeChart, canvasos.width * 0.117775);
		judgements.judgeNote(Renderer.flicks, timeChart, canvasos.width * 0.117775);
		judgements.judgeNote(Renderer.tapholds, timeChart, canvasos.width * 0.117775); //播放打击音效和判定
		taps.length = 0; //qwq
	}
	frameTimer.addTick(); //计算fps
	clickEvents0.defilter(i => i.time++ > 0); //清除打击特效
	clickEvents1.defilter(i => now >= i.time + i.duration); //清除打击特效
	for (const i in mouse) mouse[i] instanceof Click && mouse[i].animate();
	for (const i in touch) touch[i] instanceof Click && touch[i].animate();
}

function qwqdraw1(now) {
	ctxos.clearRect(0, 0, canvasos.width, canvasos.height); //重置画面
	ctxos.globalCompositeOperation = "destination-over"; //由后往前绘制
	for (const i of clickEvents1) { //绘制打击特效1
		const tick = (now - i.time) / i.duration;
		ctxos.globalAlpha = 1;
		ctxos.setTransform(noteScale * 6, 0, 0, noteScale * 6, i.offsetX, i.offsetY); //缩放
		ctxos.drawImage(i.images[parseInt(tick * 30)] || i.images[i.images.length - 1], -128, -128); //停留约0.5秒
		ctxos.fillStyle = i.color;
		ctxos.globalAlpha = 1 - tick; //不透明度
		const r3 = 30 * (((0.2078 * tick - 1.6524) * tick + 1.6399) * tick + 0.4988); //方块大小
		for (const j of i.rand) {
			const ds = j[0] * (9 * tick / (8 * tick + 1)); //打击点距离
			ctxos.fillRect(ds * Math.cos(j[1]) - r3 / 2, ds * Math.sin(j[1]) - r3 / 2, r3, r3);
		}
	}
	if (document.getElementById("feedback").checked) {
		for (const i of clickEvents0) { //绘制打击特效0
			ctxos.globalAlpha = 0.85;
			ctxos.setTransform(1, 0, 0, 1, i.offsetX, i.offsetY); //缩放
			ctxos.fillStyle = i.color;
			ctxos.beginPath();
			ctxos.arc(0, 0, lineScale * 0.5, 0, 2 * Math.PI);
			ctxos.fill();
			i.time++;
		}
	}
	if (qwqIn.second >= 3 && qwqOut.second == 0) {
		if (showPoint.checked) { //绘制定位点
			ctxos.font = `${lineScale}px Mina`;
			ctxos.textAlign = "center";
			ctxos.textBaseline = "bottom";
			for (const i of Renderer.notes) {
				if (!i.visible) continue;
				ctxos.setTransform(i.cosr, i.sinr, -i.sinr, i.cosr, i.offsetX, i.offsetY);
				ctxos.fillStyle = "cyan";
				ctxos.globalAlpha = i.realTime > timeChart ? 1 : 0.5;
				ctxos.fillText(i.name, 0, -lineScale * 0.1);
				ctxos.globalAlpha = 1;
				ctxos.fillStyle = "lime";
				ctxos.fillRect(-lineScale * 0.2, -lineScale * 0.2, lineScale * 0.4, lineScale * 0.4);
			}
			for (const i of Renderer.lines) {
				ctxos.setTransform(i.cosr, i.sinr, -i.sinr, i.cosr, i.offsetX, i.offsetY);
				ctxos.fillStyle = "yellow";
				ctxos.globalAlpha = (i.alpha + 0.5) / 1.5;
				ctxos.fillText(i.lineId, 0, -lineScale * 0.1);
				ctxos.globalAlpha = 1;
				ctxos.fillStyle = "violet";
				ctxos.fillRect(-lineScale * 0.2, -lineScale * 0.2, lineScale * 0.4, lineScale * 0.4);
			}
		}
		//绘制note
		for (const i of Renderer.flicks) drawNote(i, timeChart, 4);
		for (const i of Renderer.taps) drawNote(i, timeChart, 1);
		for (const i of Renderer.drags) drawNote(i, timeChart, 2);
		for (const i of Renderer.reverseholds) drawNote(i, timeChart, 3);
	}
	//绘制背景
	if (qwqIn.second >= 2.5) drawLine(stat.lineStatus ? 2 : 1); //绘制判定线(背景前1)
	ctxos.resetTransform();
	ctxos.fillStyle = "#000"; //背景变暗
	ctxos.globalAlpha = selectglobalalpha.value; //背景不透明度
	ctxos.fillRect(0, 0, canvasos.width, canvasos.height);
	if (qwqIn.second >= 2.5 && !stat.lineStatus) drawLine(0); //绘制判定线(背景后0)
	ctxos.globalAlpha = 1;
	ctxos.resetTransform();
	if (document.getElementById("imageBlur").checked) {
		ctxos.drawImage(Renderer.bgImageBlur, ...adjustSize(Renderer.bgImageBlur, canvasos, 1));
	} else {
		ctxos.drawImage(Renderer.bgImage, ...adjustSize(Renderer.bgImage, canvasos, 1));
	}
	ctxos.fillRect(0, 0, canvasos.width, canvasos.height);
	ctxos.globalCompositeOperation = "source-over";
	//绘制进度条
	ctxos.setTransform(canvasos.width / 1920, 0, 0, canvasos.width / 1920, 0, lineScale * (qwqIn.second < 0.67 ? (tween[2](qwqIn.second * 1.5) - 1) : -tween[2](qwqOut.second * 1.5)) * 1.75);
	ctxos.drawImage(res["ProgressBar"], timeBgm / duration * 1920 - 1920, 0);
	//绘制文字
	ctxos.resetTransform();
	ctxos.fillStyle = "#fff";
	//开头过渡动画
	if (qwqIn.second < 3) {
		if (qwqIn.second < 0.67) ctxos.globalAlpha = tween[2](qwqIn.second * 1.5);
		else if (qwqIn.second >= 2.5) ctxos.globalAlpha = tween[2](6 - qwqIn.second * 2);
		ctxos.textAlign = "center";
		//歌名
		ctxos.textBaseline = "alphabetic";
		ctxos.font = `${lineScale*1.1}px Mina`;
		ctxos.fillText(inputName.value || inputName.placeholder, wlen, hlen * 0.75);
		//曲绘和谱师
		ctxos.textBaseline = "top";
		ctxos.font = `${lineScale*0.55}px Mina`;
		ctxos.fillText(`Illustration designed by ${inputIllustrator.value || inputIllustrator.placeholder}`, wlen, hlen * 1.25 + lineScale * 0.15);
		ctxos.fillText(`Level designed by ${inputDesigner.value || inputDesigner.placeholder}`, wlen, hlen * 1.25 + lineScale * 1.0);
		//判定线(装饰用)
		ctxos.globalAlpha = 1;
		ctxos.setTransform(1, 0, 0, 1, wlen, hlen);
		const imgW = lineScale * 48 * (qwqIn.second < 0.67 ? tween[3](qwqIn.second * 1.5) : 1);
		const imgH = lineScale * 0.15;
		if (qwqIn.second >= 2.5) ctxos.globalAlpha = tween[2](6 - qwqIn.second * 2);
		ctxos.drawImage(lineColor.checked ? res["JudgeLineAP"] : res["JudgeLine"], -imgW / 2, -imgH / 2, imgW, imgH);
	}
	//绘制分数和combo以及暂停按钮
	ctxos.globalAlpha = 1;
	ctxos.setTransform(1, 0, 0, 1, 0, lineScale * (qwqIn.second < 0.67 ? (tween[2](qwqIn.second * 1.5) - 1) : -tween[2](qwqOut.second * 1.5)) * 1.75);
	ctxos.textBaseline = "alphabetic";
	ctxos.font = `${lineScale*0.95}px Mina`;
	ctxos.textAlign = "right";
	ctxos.fillText(stat.scoreStr, canvasos.width - lineScale * 0.65, lineScale * 1.375);
	if (!qwq[0]) ctxos.drawImage(res["Pause"], lineScale * 0.6, lineScale * 0.7, lineScale * 0.63, lineScale * 0.7);
	if (stat.combo > 2) {
		ctxos.textAlign = "center";
		ctxos.font = `${lineScale*1.32}px Mina`;
		ctxos.fillText(stat.combo, wlen, lineScale * 1.375);
		ctxos.globalAlpha = qwqIn.second < 0.67 ? tween[2](qwqIn.second * 1.5) : (1 - tween[2](qwqOut.second * 1.5));
		ctxos.font = `${lineScale*0.66}px Mina`;
		ctxos.fillText(autoplay.checked ? "Autoplay" : "combo", wlen, lineScale * 2.05);
	}
	//绘制歌名和等级
	ctxos.globalAlpha = 1;
	ctxos.setTransform(1, 0, 0, 1, 0, lineScale * (qwqIn.second < 0.67 ? (1 - tween[2](qwqIn.second * 1.5)) : tween[2](qwqOut.second * 1.5)) * 1.75);
	ctxos.textBaseline = "alphabetic";
	ctxos.textAlign = "right";
	ctxos.font = `${lineScale*0.63}px Mina`;
	ctxos.fillText(inputLevel.value || inputLevel.placeholder, canvasos.width - lineScale * 0.75, canvasos.height - lineScale * 0.66);
	ctxos.drawImage(res["SongsNameBar"], lineScale * 0.53, canvasos.height - lineScale * 1.22, lineScale * 0.119, lineScale * 0.612);
	ctxos.textAlign = "left";
	ctxos.fillText(inputName.value || inputName.placeholder, lineScale * 0.85, canvasos.height - lineScale * 0.66);
	ctxos.resetTransform();
	if (qwq[0]) {
		//绘制时间和帧率以及note打击数
		if (qwqIn.second < 0.67) ctxos.globalAlpha = tween[2](qwqIn.second * 1.5);
		else ctxos.globalAlpha = 1 - tween[2](qwqOut.second * 1.5);
		ctxos.textBaseline = "middle";
		ctxos.font = `${lineScale*0.4}px Mina`;
		ctxos.textAlign = "left";
		ctxos.fillText(`${time2Str(timeBgm)}/${time2Str(duration)}`, lineScale * 0.05, lineScale * 0.5);
		ctxos.textAlign = "right";
		ctxos.fillText(frameTimer.fps, canvasos.width - lineScale * 0.05, lineScale * 0.5);
		ctxos.textBaseline = "alphabetic";
		if (showPoint.checked) stat.combos.forEach((val, idx) => {
			ctxos.fillStyle = comboColor[idx];
			ctxos.fillText(val, lineScale * (idx + 1) * 1.1, canvasos.height - lineScale * 0.1);
		});
	}
	//
	//判定线函数，undefined/0:默认,1:非,2:恒成立
	function drawLine(bool) {
		ctxos.globalAlpha = 1;
		const tw = 1 - tween[2](qwqOut.second * 1.5);
		for (const i of Renderer.lines) {
			if (bool ^ i.imageB && qwqOut.second < 0.67) {
				ctxos.globalAlpha = i.alpha;
				ctxos.setTransform(i.cosr * tw, i.sinr, -i.sinr * tw, i.cosr, wlen + (i.offsetX - wlen) * tw, i.offsetY); //hiahiah
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
	while (stopPlaying.length) stopPlaying.shift()();
	cancelAnimationFrame(stopDrawing);
	btnPause.classList.add("disabled");
	ctxos.globalCompositeOperation = "source-over";
	ctxos.resetTransform();
	ctxos.globalAlpha = 1;
	if (document.getElementById("imageBlur").checked) {
		ctxos.drawImage(Renderer.bgImageBlur, ...adjustSize(Renderer.bgImageBlur, canvasos, 1));
		ctx.drawImage(Renderer.bgImageBlur, ...adjustSize(Renderer.bgImageBlur, canvas, 1));
	} else {
		ctxos.drawImage(Renderer.bgImage, ...adjustSize(Renderer.bgImage, canvasos, 1));
		ctx.drawImage(Renderer.bgImage, ...adjustSize(Renderer.bgImage, canvas, 1));
	}
	ctxos.fillStyle = "#000"; //背景变暗
	ctxos.globalAlpha = selectglobalalpha.value; //背景不透明度
	ctxos.fillRect(0, 0, canvasos.width, canvasos.height);
	const qwq = ["ez", "hd", "in", "at"].indexOf(inputLevel.value.slice(0, 2).toLocaleLowerCase());
	const xhr = new XMLHttpRequest();
	xhr.open("get", `src/LevelOver${qwq<0?2:qwq}.ogg`, true);
	xhr.responseType = 'arraybuffer';
	xhr.send();
	xhr.onload = async () => {
		const bgm = await actx.decodeAudioData(xhr.response);
		const timeout = setTimeout(() => {
			stopPlaying.push(playSound(bgm, true, true, 0));
			qwqEnd.reset();
			qwqEnd.play();
			fucktemp2 = stat.getData(autoplay.checked);
		}, 1000);
		stopPlaying.push(() => clearTimeout(timeout));
	}
}

function qwqdraw3(statData) {
	ctxos.resetTransform();
	ctxos.globalCompositeOperation = "source-over";
	ctxos.clearRect(0, 0, canvasos.width, canvasos.height);
	ctxos.globalAlpha = 1;
	if (document.getElementById("imageBlur").checked) ctxos.drawImage(Renderer.bgImageBlur, ...adjustSize(Renderer.bgImageBlur, canvasos, 1));
	else ctxos.drawImage(Renderer.bgImage, ...adjustSize(Renderer.bgImage, canvasos, 1));
	ctxos.fillStyle = "#000"; //背景变暗
	ctxos.globalAlpha = selectglobalalpha.value; //背景不透明度
	ctxos.fillRect(0, 0, canvasos.width, canvasos.height);
	ctxos.globalCompositeOperation = "destination-out";
	ctxos.globalAlpha = 1;
	const k = 3.7320508075688776; //tan75°
	ctxos.setTransform(canvasos.width - canvasos.height / k, 0, -canvasos.height / k, canvasos.height, canvasos.height / k, 0);
	ctxos.fillRect(0, 0, 1, tween[8](range((qwqEnd.second - 0.13) * 0.94)));
	ctxos.resetTransform();
	ctxos.globalCompositeOperation = "destination-over";
	const qwq0 = (canvasos.width - canvasos.height / k) / (16 - 9 / k);
	ctxos.setTransform(qwq0 / 120, 0, 0, qwq0 / 120, wlen - qwq0 * 8, hlen - qwq0 * 4.5); //?
	ctxos.drawImage(res["LevelOver4"], 183, 42, 1184, 228);
	ctxos.globalAlpha = range((qwqEnd.second - 0.27) / 0.83);
	ctxos.drawImage(res["LevelOver1"], 102, 378);
	ctxos.globalCompositeOperation = "source-over";
	ctxos.globalAlpha = 1;
	ctxos.drawImage(res["LevelOver5"], 700 * tween[8](range(qwqEnd.second * 1.25)) - 369, 91, 20, 80);
	//歌名和等级
	ctxos.fillStyle = "#fff";
	ctxos.textBaseline = "middle";
	ctxos.textAlign = "left";
	ctxos.font = "80px Mina";
	ctxos.fillText(inputName.value || inputName.placeholder, 700 * tween[8](range(qwqEnd.second * 1.25)) - 320, 145);
	ctxos.font = "30px Mina";
	ctxos.fillText(inputLevel.value || inputLevel.placeholder, 700 * tween[8](range(qwqEnd.second * 1.25)) - 317, 208);
	//Rank图标
	ctxos.globalAlpha = range((qwqEnd.second - 1.87) * 3.75);
	const qwq2 = 293 + range((qwqEnd.second - 1.87) * 3.75) * 100;
	const qwq3 = 410 - range((qwqEnd.second - 1.87) * 2.14) * 164;
	ctxos.drawImage(res["LevelOver3"], 661 - qwq2 / 2, 545 - qwq2 / 2, qwq2, qwq2);
	ctxos.drawImage(res["Ranks"][stat.rankStatus], 661 - qwq3 / 2, 545 - qwq3 / 2, qwq3, qwq3);
	//各种数据
	ctxos.globalAlpha = range((qwqEnd.second - 0.87) * 2.50);
	ctxos.fillStyle = statData[0] ? "#18ffbf" : "#fff";
	ctxos.fillText(statData[0] ? "NEW BEST" : "BEST", 898, 428);
	ctxos.fillStyle = "#fff";
	ctxos.textAlign = "center";
	ctxos.fillText(statData[1], 1180, 428);
	ctxos.globalAlpha = range((qwqEnd.second - 1.87) * 2.50);
	ctxos.textAlign = "right";
	ctxos.fillText(statData[2], 1414, 428);
	ctxos.globalAlpha = range((qwqEnd.second - 0.95) * 1.50);
	ctxos.textAlign = "left";
	ctxos.fillText(stat.accStr, 352, 545);
	ctxos.fillText(stat.maxcombo, 1528, 545);
	if (statData[3]) {
		ctxos.fillStyle = "#fe4365";
		ctxos.fillText("AUTO PLAY", 1355, 590);
	} else if (stat.lineStatus) {
		ctxos.fillStyle = stat.lineStatus == 1 ? "#ffc500" : "#00bef1";
		ctxos.fillText(stat.lineStatus == 1 ? "ALL  PERFECT" : "FULL  COMBO", 1355, 590);
	}
	ctxos.fillStyle = "#fff";
	ctxos.textAlign = "center";
	ctxos.font = "86px Mina";
	ctxos.globalAlpha = range((qwqEnd.second - 1.12) * 2.00);
	ctxos.fillText(stat.scoreStr, 1075, 554);
	ctxos.font = "26px Mina";
	ctxos.globalAlpha = range((qwqEnd.second - 0.87) * 2.50);
	ctxos.fillText(stat.perfect, 891, 645);
	ctxos.globalAlpha = range((qwqEnd.second - 1.07) * 2.50);
	ctxos.fillText(stat.good, 1043, 645);
	ctxos.globalAlpha = range((qwqEnd.second - 1.27) * 2.50);
	ctxos.fillText(stat.bad, 1196, 645);
	ctxos.globalAlpha = range((qwqEnd.second - 1.47) * 2.50);
	ctxos.fillText(stat.miss, 1349, 645);
	ctxos.resetTransform();
	ctxos.globalCompositeOperation = "destination-over";
	ctxos.globalAlpha = 1;
	ctxos.fillStyle = "#000";
	ctxos.drawImage(Renderer.bgImage, ...adjustSize(Renderer.bgImage, canvasos, 1));
	ctxos.fillRect(0, 0, canvasos.width, canvasos.height);
}

function range(num) {
	if (num < 0) return 0;
	if (num > 1) return 1;
	return num;
}

//绘制Note
function drawNote(note, realTime, type) {
	if (!note.visible) return;
	if (note.type != 3 && note.scored && !note.badtime) return;
	if (note.type == 3 && note.realTime + note.realHoldTime < realTime) return; //qwq
	ctxos.globalAlpha = note.alpha;
	ctxos.setTransform(noteScale * note.cosr, noteScale * note.sinr, -noteScale * note.sinr, noteScale * note.cosr, note.offsetX, note.offsetY);
	if (type == 3) {
		const baseLength = hlen2 / noteScale * note.speed;
		const holdLength = baseLength * note.realHoldTime;
		if (note.realTime > realTime) {
			ctxos.drawImage(res["HoldHead"], -res["HoldHead"].width * 0.5, 0);
			ctxos.drawImage(res["Hold"], -res["Hold"].width * 0.5, -holdLength, res["Hold"].width, holdLength);
			ctxos.drawImage(res["HoldEnd"], -res["HoldEnd"].width * 0.5, -holdLength - res["HoldEnd"].height);
		} else {
			ctxos.drawImage(res["Hold"], -res["Hold"].width * 0.5, -holdLength, res["Hold"].width, holdLength - baseLength * (realTime - note.realTime));
			ctxos.drawImage(res["HoldEnd"], -res["HoldEnd"].width * 0.5, -holdLength - res["HoldEnd"].height);
		}
	} else if (note.badtime) {
		if (type == 1) ctxos.drawImage(res["TapBad"], -res["TapBad"].width * 0.5, -res["TapBad"].height * 0.5);
	} else if (note.isMulti && document.getElementById("highLight").checked) {
		if (type == 1) ctxos.drawImage(res["TapHL"], -res["TapHL"].width * 0.5, -res["TapHL"].height * 0.5);
		else if (type == 2) ctxos.drawImage(res["DragHL"], -res["DragHL"].width * 0.5, -res["DragHL"].height * 0.5);
		else if (type == 4) ctxos.drawImage(res["FlickHL"], -res["FlickHL"].width * 0.5, -res["FlickHL"].height * 0.5);
	} else {
		if (type == 1) ctxos.drawImage(res["Tap"], -res["Tap"].width * 0.5, -res["Tap"].height * 0.5);
		else if (type == 2) ctxos.drawImage(res["Drag"], -res["Drag"].width * 0.5, -res["Drag"].height * 0.5);
		else if (type == 4) ctxos.drawImage(res["Flick"], -res["Flick"].width * 0.5, -res["Flick"].height * 0.5);
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

function chartp23(pec, filename) {
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
			//this.floorPosition = time % 1e9 / 104 * 1.2;
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
	if (!isNaN(rawChart[0])) qwqChart.offset = (rawChart.shift() / 1e3 - 0.175); //0.15//官方转谱似乎是0.14
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
		if (i[4]) message.sendWarning(`检测到FakeNote\n位于:"n1 ${i.slice(0,5).join(" ")}"\n来自${filename}`);
		if (i[6] != 1) message.sendWarning(`检测到异常Note\n位于:"n1 ${i.slice(0,5).join(" ")} # ${i[5]} & ${i[6]}"\n来自${filename}`);
	} //102.4
	for (const i of raw.n2) {
		if (!linesPec[i[0]]) linesPec[i[0]] = new JudgeLine(baseBpm);
		linesPec[i[0]].pushNote(new Note(3, calcTime(i[1]) + (i[5] ? 1e9 : 0), i[3] * 9 / 1024, calcTime(i[2]) - calcTime(i[1]), i[6]), i[4], i[5]);
		if (i[5]) message.sendWarning(`检测到FakeNote\n位于:"n2 ${i.slice(0,6).join(" ")}"\n来自${filename}`);
		if (i[7] != 1) message.sendWarning(`检测到异常Note\n位于:"n1 ${i.slice(0,5).join(" ")} # ${i[6]} & ${i[7]}"\n来自${filename}`);
	}
	for (const i of raw.n3) {
		if (!linesPec[i[0]]) linesPec[i[0]] = new JudgeLine(baseBpm);
		linesPec[i[0]].pushNote(new Note(4, calcTime(i[1]) + (i[4] ? 1e9 : 0), i[2] * 9 / 1024, 0, i[5]), i[3], i[4]);
		if (i[4]) message.sendWarning(`检测到FakeNote\n位于:"n3 ${i.slice(0,5).join(" ")}"\n来自${filename}`);
		if (i[6] != 1) message.sendWarning(`检测到异常Note\n位于:"n1 ${i.slice(0,5).join(" ")} # ${i[5]} & ${i[6]}"\n来自${filename}`);
	}
	for (const i of raw.n4) {
		if (!linesPec[i[0]]) linesPec[i[0]] = new JudgeLine(baseBpm);
		linesPec[i[0]].pushNote(new Note(2, calcTime(i[1]) + (i[4] ? 1e9 : 0), i[2] * 9 / 1024, 0, i[5]), i[3], i[4]);
		if (i[4]) message.sendWarning(`检测到FakeNote\n位于:"n4 ${i.slice(0,5).join(" ")}"\n来自${filename}`);
		if (i[6] != 1) message.sendWarning(`检测到异常Note\n位于:"n1 ${i.slice(0,5).join(" ")} # ${i[5]} & ${i[6]}"\n来自${filename}`);
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
		if (i[2] < 0) message.sendWarning(`检测到负数Alpha:${i[2]}\n位于:"ca ${i.join(" ")}"\n来自${filename}`);
	}
	for (const i of raw.cf) {
		if (!linesPec[i[0]]) linesPec[i[0]] = new JudgeLine(baseBpm);
		linesPec[i[0]].pushEvent(-1, calcTime(i[1]), calcTime(i[2]), i[3] > 0 ? i[3] / 255 : 0);
		if (i[3] < 0) message.sendWarning(`检测到负数Alpha:${i[3]}\n位于:"cf ${i.join(" ")}"\n来自${filename}`);
	}
	//移动
	for (const i of raw.cp) {
		if (!linesPec[i[0]]) linesPec[i[0]] = new JudgeLine(baseBpm);
		linesPec[i[0]].pushEvent(-2, calcTime(i[1]), calcTime(i[1]), i[2] / 2048, i[3] / 1400, 1);
	}
	for (const i of raw.cm) {
		if (!linesPec[i[0]]) linesPec[i[0]] = new JudgeLine(baseBpm);
		linesPec[i[0]].pushEvent(-2, calcTime(i[1]), calcTime(i[2]), i[3] / 2048, i[4] / 1400, i[5]);
		if (i[5] && !tween[i[5]] && i[5] != 1) message.sendWarning(`未知的缓动类型:${i[5]}(将被视为1)\n位于:"cm ${i.join(" ")}"\n来自${filename}`);
	}
	//旋转
	for (const i of raw.cd) {
		if (!linesPec[i[0]]) linesPec[i[0]] = new JudgeLine(baseBpm);
		linesPec[i[0]].pushEvent(-3, calcTime(i[1]), calcTime(i[1]), -i[2], 1); //??
	}
	for (const i of raw.cr) {
		if (!linesPec[i[0]]) linesPec[i[0]] = new JudgeLine(baseBpm);
		linesPec[i[0]].pushEvent(-3, calcTime(i[1]), calcTime(i[2]), -i[3], i[4]);
		if (i[4] && !tween[i[4]] && i[4] != 1) message.sendWarning(`未知的缓动类型:${i[4]}(将被视为1)\n位于:"cr ${i.join(" ")}"\n来自${filename}`);
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
				} else if (j.motionType) i.pushEvent(1, j.startTime, j.endTime, ldpValue, j.value);
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
				} else if (j.motionType) i.pushEvent(2, j.startTime, j.endTime, lmpValue, j.value, lmpValue2, j.value2);
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
				} else if (j.motionType) i.pushEvent(3, j.startTime, j.endTime, lrpValue, j.value);
				lrpTime = j.endTime;
				lrpValue = j.value;
			}
			i.pushEvent(3, lrpTime, 1e9, lrpValue, lrpValue);
			qwqChart.pushLine(i);
		}
	}
	return JSON.parse(JSON.stringify(qwqChart));
}
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
//调节画面尺寸和全屏相关
function adjustSize(source, dest, scale) {
	const [sw, sh, dw, dh] = [source.width, source.height, dest.width, dest.height];
	if (dw * sh > dh * sw) return [dw * (1 - scale) / 2, (dh - dw * sh / sw * scale) / 2, dw * scale, dw * sh / sw * scale];
	return [(dw - dh * sw / sh * scale) / 2, dh * (1 - scale) / 2, dh * sw / sh * scale, dh * scale];
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

function imgBlur(img) {
	const canvas = document.createElement("canvas");
	canvas.width = img.width;
	canvas.height = img.height;
	const ctx = canvas.getContext("2d");
	ctx.drawImage(img, 0, 0);
	return StackBlur.imageDataRGB(ctx.getImageData(0, 0, img.width, img.height), 0, 0, img.width, img.height, Math.ceil(Math.min(img.width, img.height) * 0.0125));
}
//十六进制color转rgba数组
function hex2rgba(color) {
	const ctx = document.createElement("canvas").getContext("2d");
	ctx.fillStyle = color;
	ctx.fillRect(0, 0, 1, 1);
	return ctx.getImageData(0, 0, 1, 1).data;
}
//rgba数组(0-1)转十六进制
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