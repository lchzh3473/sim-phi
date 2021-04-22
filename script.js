"use strict";
document.oncontextmenu = e => e.returnValue = false;
const canvas = document.getElementById("stage");
const canvasbg = document.getElementById("bg");
//调节尺寸
let maxlen, wlen, hlen, mlen, scale, sx, sy, sw, sh, dx1, dy1, dw1, dh1, dx2, dy2, dw2, dh2; //背景图相关
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function resizeCanvas() {
	canvas.width = Math.min(window.innerWidth, window.innerHeight * 16 / 9) * window.devicePixelRatio;
	canvas.height = window.innerHeight * window.devicePixelRatio;
	maxlen = Math.sqrt(canvas.width ** 2 + canvas.height ** 2);
	wlen = canvas.width / 2;
	hlen = canvas.height / 2;
	mlen = Math.min(wlen, hlen);
	scale = canvas.width / 7e3; //note缩放
	canvasbg.width = window.innerWidth * window.devicePixelRatio;
	canvasbg.height = window.innerHeight * window.devicePixelRatio;
	if (canvasbg.width * 9 > canvasbg.height * 16) {
		dx1 = (canvasbg.width - canvasbg.height * 16 / 9) / 2;
		dy1 = 0;
		dw1 = canvasbg.height * 16 / 9;
		dh1 = canvasbg.height;
		dx2 = 0;
		dy2 = (canvasbg.height - canvasbg.width * 9 / 16) / 2;
		dw2 = canvasbg.width;
		dh2 = canvasbg.width * 9 / 16;
	} else {
		dx1 = (canvasbg.width - canvasbg.height * 16 / 9) / 2;
		dy1 = 0;
		dw1 = canvasbg.height * 16 / 9;
		dh1 = canvasbg.height;
	}
}
//谱面默认信息
let duration = 0;
let tick = 0;
let start = Date.now();
let fps = 0;
let songName = "SpasModic(Haocore Mix)";
let level = "SP  Lv.?";
//点击特效(以后会改)
const clicks = []; //存放点击事件，用于检测
const clickEvents = []; //存放点击特效
class clickEvent {
	constructor(x, y) {
		this.x = isNaN(x) ? 0 : x; //初始横坐标
		this.y = isNaN(y) ? 0 : y; //初始纵坐标
		this.time = 0;
		this.rand = [];
		for (let i = 0; i < 4; i++) this.rand.push([Math.random() * 50 + 250, Math.random() * 2 * Math.PI]);
	}
}
//适配PC鼠标
let isMouseDown = [];
canvas.addEventListener("mousedown", evt => {
	evt.preventDefault();
	const idx = evt.button;
	///console.log("mousedown", idx); //test
	clicks[idx] = {
		x: (evt.pageX - canvas.offsetLeft) * window.devicePixelRatio + canvas.width / 2,
		y: evt.pageY * window.devicePixelRatio,
	};
	clickEvents.push(new clickEvent(clicks[idx].x, clicks[idx].y));
	clicks[idx].t = setInterval(() => clickEvents.push(new clickEvent(clicks[idx].x, clicks[idx].y)), 200);
	isMouseDown[idx] = true;
});
canvas.addEventListener("mousemove", evt => {
	evt.preventDefault();
	for (const idx in isMouseDown) {
		if (isMouseDown[idx]) {
			//console.log("mousemove", idx); //test
			clicks[idx].x = (evt.pageX - canvas.offsetLeft) * window.devicePixelRatio + canvas.width / 2;
			clicks[idx].y = evt.pageY * window.devicePixelRatio;
		}
	}
});
canvas.addEventListener("mouseup", evt => {
	evt.preventDefault();
	const idx = evt.button;
	///console.log("mouseup", idx); //test
	clearInterval(clicks[idx].t);
	clicks[idx] = {};
	isMouseDown[idx] = false;
});
canvas.addEventListener("mouseout", evt => {
	evt.preventDefault();
	for (const idx in isMouseDown) {
		if (isMouseDown[idx]) {
			///console.log("mouseout", idx); //test
			clearInterval(clicks[idx].t);
			clicks[idx] = {};
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
		const idx = i.identifier;
		///console.log("touchstart", idx); //test
		clicks[idx] = {
			x: (i.pageX - canvas.offsetLeft) * window.devicePixelRatio + canvas.width / 2,
			y: i.pageY * window.devicePixelRatio
		}; //移动端存在多押bug(可能已经解决了？)
		clickEvents.push(new clickEvent(clicks[idx].x, clicks[idx].y));
		clicks[idx].t = setInterval(() => clickEvents.push(new clickEvent(clicks[idx].x, clicks[idx].y)), 200);
	}
}, passive);
canvas.addEventListener("touchmove", evt => {
	evt.preventDefault();
	for (const i of evt.changedTouches) {
		const idx = i.identifier;
		//console.log("touchmove",idx); //test
		clicks[idx].x = (i.pageX - canvas.offsetLeft) * window.devicePixelRatio + canvas.width / 2;
		clicks[idx].y = i.pageY * window.devicePixelRatio;
	}
}, passive);
canvas.addEventListener("touchend", evt => {
	evt.preventDefault();
	for (const i of evt.changedTouches) {
		const idx = i.identifier;
		///console.log("touchend", idx); //test
		clearInterval(clicks[idx].t);
		clicks[idx] = {};
	}
});
canvas.addEventListener("touchcancel", evt => {
	for (const i of evt.changedTouches) {
		const idx = i.identifier;
		///console.log("touchcancel", idx); //test
		clearInterval(clicks[idx].t);
		clicks[idx] = {};
	}
});
//判定线定义
const lines = []; //存放判定线
const lineEvents = []; //存放判定线事件
class line {
	constructor(x, y, rotation, alpha, bpm) {
		this.x = x;
		this.y = y;
		this.r = rotation;
		//this.o = offset;
		this.a = alpha;
		this.bpm = bpm;
	}
}
const showPoint = !true; //显示控制点
//判定线事件
class lineEvent {
	constructor(startTime, endTime, start, end, start2, end2) {
		this.startTime = startTime;
		this.endTime = endTime;
		this.start = start;
		this.end = end;
		this.start2 = start2;
		this.end2 = end2;
	}
}
//播放打击音效
function playNote(line, notes, time) {
	const sx = canvas.width / 2 * (1 + line.x);
	const sy = canvas.height / 2 * (1 - line.y);
	const r = line.r / 180 * Math.PI;
	for (const i of notes) {
		if (i.time > time) break;
		if (!i.played) {
			const bufferSource = actx.createBufferSource();
			bufferSource.buffer = aud[type2idx(i.type)];
			bufferSource.connect(actx.destination);
			bufferSource.start();
			const d = canvas.width * i.positionX / 18;
			clickEvents.push(new clickEvent(sx + d * Math.cos(r), sy - d * Math.sin(r)));
			setTimeout(() => score = (Array(7).join(0) + (1e6 / chart.numOfNotes * (++combo)).toFixed(0)).slice(-7), i.holdTime / line.bpm * 1875); //test
			i.played = true;
		}
	}
}
//绘制蓝键
function drawTapNote(line, notes, time, num) {
	for (const i of notes) {
		if (i.type != 1) continue;
		if (i.time < time) continue;
		//if (i.floorPosition - line.positionY < 0) continue;
		ctx.translate(canvas.width / 2 * (1 + line.x), canvas.height / 2 * (1 - line.y));
		ctx.rotate(((num - 1) / 2 - line.r / 180) * Math.PI);
		ctx.translate(canvas.width * i.positionX / 18 * num, -canvas.height / 2 * (i.floorPosition - line.positionY)); //暂时忽略i.speed
		ctx.scale(scale, scale); //缩放
		if (!i.multi) ctx.drawImage(img.tap1, -494.5, -50);
		else ctx.drawImage(img.tap2, -544.5, -100);
		ctx.resetTransform();
	}
}
//绘制黄键
function drawDragNote(line, notes, time, num) {
	for (const i of notes) {
		if (i.type != 2) continue;
		if (i.time < time) continue;
		//if (i.floorPosition - line.positionY < 0) continue;
		ctx.translate(canvas.width / 2 * (1 + line.x), canvas.height / 2 * (1 - line.y));
		ctx.rotate(((num - 1) / 2 - line.r / 180) * Math.PI);
		ctx.translate(canvas.width * i.positionX / 18 * num, -canvas.height / 2 * (i.floorPosition - line.positionY)); //暂时忽略i.speed
		ctx.scale(scale, scale); //缩放
		if (!i.multi) ctx.drawImage(img.drag1, -494.5, -30);
		else ctx.drawImage(img.drag2, -544.5, -80);
		ctx.resetTransform();
	}
}

function drawHoldNote(line, notes, time, num) {
	const sx = canvas.width / 2 * (1 + line.x);
	const sy = canvas.height / 2 * (1 - line.y);
	const r = line.r / 180 * Math.PI;
	for (const i of notes) {
		if (i.type != 3) continue;
		if (i.time + i.holdTime < time) continue;
		//if (i.floorPosition - line.positionY < 0) continue;
		ctx.translate(sx, sy);
		ctx.rotate((num - 1) * Math.PI / 2 - r);
		ctx.translate(canvas.width * i.positionX / 18 * num, -canvas.height / 2 * (i.floorPosition - line.positionY)); //暂时忽略i.speed
		ctx.scale(scale, scale); //缩放
		const rL = canvas.height / 2 / line.bpm * 1.875 / scale * i.speed;
		const holdL = rL * i.holdTime;
		const reL = rL * (i.holdTime + i.time - time); //test
		if (i.time > time) {
			ctx.drawImage(img.hold1, -494.5, 0);
			ctx.drawImage(img.hold2, -494.5, -holdL, 989, holdL);
			ctx.drawImage(img.hold3, -494.5, -holdL - 50);
		} else {
			ctx.drawImage(img.hold3, -494.5, -holdL - 50);
			ctx.drawImage(img.hold2, -494.5, -holdL, 989, reL);
			//绘制持续打击动画
			i.playing = i.playing ? i.playing + 1 : 1;
			if (i.playing % 12 == 0) {
				const d = canvas.width * i.positionX / 18;
				clickEvents.push(new clickEvent(sx + d * Math.cos(r), sy - d * Math.sin(r)));
			}
		}
		ctx.resetTransform();
	}
}
//绘制粉键
function drawFlickNote(line, notes, time, num) {
	for (const i of notes) {
		if (i.type != 4) continue;
		if (i.time < time) continue;
		//if (i.floorPosition - line.positionY < 0) continue;
		ctx.translate(canvas.width / 2 * (1 + line.x), canvas.height / 2 * (1 - line.y));
		ctx.rotate(((num - 1) / 2 - line.r / 180) * Math.PI);
		ctx.translate(canvas.width * i.positionX / 18 * num, -canvas.height / 2 * (i.floorPosition - line.positionY)); //暂时忽略i.speed
		ctx.scale(scale, scale); //缩放
		if (!i.multi) ctx.drawImage(img.flick1, -494.5, -100);
		else ctx.drawImage(img.flick2, -544.5, -150);
		ctx.resetTransform();
	}
}

function moveLine(line, judgeLineMoveEvents, time) {
	for (const i of judgeLineMoveEvents) {
		if (time < i.startTime) break;
		if (time > i.endTime) continue;
		const t2 = (time - i.startTime) / (i.endTime - i.startTime);
		const t1 = 1 - t2;
		switch (chart.formatVersion) {
			case 1:
				line.x = (parseInt(i.start / 1000) * t1 + parseInt(i.end / 1000) * t2) / 440 - 1;
				line.y = ((i.start % 1000) * t1 + (i.end % 1000) * t2) / 260 - 1;
				break;
			case 3:
				line.x = (i.start * t1 + i.end * t2) * 2 - 1;
				line.y = (i.start2 * t1 + i.end2 * t2) * 2 - 1;
				break;
			default:
				throw "Unsupported formatVersion";
		}
	}
}

function rotateLine(line, judgeLineRotateEvents, time) {
	for (const i of judgeLineRotateEvents) {
		if (time < i.startTime) break;
		if (time > i.endTime) continue;
		const t2 = (time - i.startTime) / (i.endTime - i.startTime);
		const t1 = 1 - t2;
		line.r = i.start * t1 + i.end * t2;
	}
}

function disappearLine(line, judgeLineDisappearEvents, time) {
	for (const i of judgeLineDisappearEvents) {
		if (time < i.startTime) break;
		if (time > i.endTime) continue;
		const t2 = (time - i.startTime) / (i.endTime - i.startTime);
		const t1 = 1 - t2;
		line.a = i.start * t1 + i.end * t2;
	}
}

function speedLine(line, speedEvents, time) {
	switch (chart.formatVersion) {
		case 1:
			let y = 0;
			for (const i of speedEvents) {
				if (time < i.startTime) break;
				if (time > i.endTime) y += (i.endTime - i.startTime) * i.value;
				else line.positionY = (y + (time - i.startTime) * i.value) / line.bpm * 1.875;
			}
			break;
		case 3:
			for (const i of speedEvents) {
				if (time < i.startTime) break;
				if (time > i.endTime) continue;
				line.positionY = (time - i.startTime) * i.value / line.bpm * 1.875 + i.floorPosition;
			}
			break;
		default:
			throw "Unsupported formatVersion"
	}
}
//
const ctx = canvas.getContext("2d");
const ctxbg = canvasbg.getContext("2d");
let combo = 0; //test
let score = "0000000"; //test

function draw() {
	const timeRaw = (Date.now() - curTimestamp) / 1e3 + curTime;
	const time = Math.max(timeRaw - chart.offset, 0);
	//重置画面
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	//绘制背景
	ctxbg.drawImage(img.bg, sx, sy, sw, sh, dx2, dy2, dw2, dh2);
	ctxbg.drawImage(img.bg, sx, sy, sw, sh, dx1, dy1, dw1, dh1);
	//背景变暗
	ctx.fillStyle = "#000";
	ctx.globalAlpha = 0.6; //背景不透明度
	ctx.fillRect(0, 0, dw1, dh1);
	ctx.globalAlpha = 1;
	//绘制判定线
	for (const i of lines) {
		ctx.globalAlpha = i.a;
		ctx.translate(wlen * (1 + i.x), hlen * (1 - i.y));
		ctx.rotate(-i.r * Math.PI / 180);
		ctx.beginPath();
		ctx.translate(0, -mlen * i.o);
		ctx.strokeStyle = "#fefea9";
		ctx.lineWidth = 3;
		ctx.moveTo(-maxlen, 0);
		ctx.lineTo(maxlen, 0);
		ctx.stroke();
		ctx.closePath();
		ctx.globalAlpha = 1;
		ctx.resetTransform();
	}
	//遍历events
	chart.judgeLineList.forEach((val, idx) => {
		const beat32 = time * val.bpm / 1.875;
		const i = lines[idx];
		if (i) { //避免加载失败报错
			playNote(i, val.notesAbove, beat32);
			playNote(i, val.notesBelow, beat32);
			disappearLine(i, val.judgeLineDisappearEvents, beat32);
			moveLine(i, val.judgeLineMoveEvents, beat32);
			rotateLine(i, val.judgeLineRotateEvents, beat32);
			speedLine(i, val.speedEvents, beat32);
		}
	});
	//绘制note
	chart.judgeLineList.forEach((val, idx) => {
		const beat32 = time * val.bpm / 1.875;
		const i = lines[idx];
		if (i) { //避免加载失败报错
			drawHoldNote(i, val.notesAbove, beat32, 1);
			drawHoldNote(i, val.notesBelow, beat32, -1);
		}
	});
	chart.judgeLineList.forEach((val, idx) => {
		const beat32 = time * val.bpm / 1.875;
		const i = lines[idx];
		if (i) { //避免加载失败报错
			drawDragNote(i, val.notesAbove, beat32, 1);
			drawDragNote(i, val.notesBelow, beat32, -1);
		}
	});
	chart.judgeLineList.forEach((val, idx) => {
		const beat32 = time * val.bpm / 1.875;
		const i = lines[idx];
		if (i) { //避免加载失败报错
			drawTapNote(i, val.notesAbove, beat32, 1);
			drawTapNote(i, val.notesBelow, beat32, -1);
		}
	});
	chart.judgeLineList.forEach((val, idx) => {
		const beat32 = time * val.bpm / 1.875;
		const i = lines[idx];
		if (i) { //避免加载失败报错
			drawFlickNote(i, val.notesAbove, beat32, 1);
			drawFlickNote(i, val.notesBelow, beat32, -1);
		}
	});
	//绘制控制点
	if (showPoint) {
		for (const i of lines) {
			ctx.translate(wlen * (1 + i.x), hlen * (1 - i.y));
			ctx.rotate(-i.r * Math.PI / 180);
			ctx.fillStyle = "red";
			ctx.fillRect(-5, -5, 10, 10);
			ctx.translate(0, -mlen * i.o);
			ctx.fillStyle = "lime";
			ctx.fillRect(-5, -5, 10, 10);
			ctx.resetTransform();
		}
	}
	//绘制打击特效
	for (const i of clickEvents) {
		const tick = i.time / 30;
		ctx.translate(i.x, i.y);
		ctx.scale(scale * 6, scale * 6); //缩放
		ctx.drawImage(imgClick.perfect[(i.time++).toFixed(0)], -128, -128); //停留约0.5秒
		//四个方块
		for (const j of i.rand) {
			ctx.fillStyle = `rgba(254,254,169,${(1-tick)})`;
			const r3 = tick ** 0.1 * 40;
			const ds = tick ** 0.2 * j[0];
			ctx.fillRect(ds * Math.cos(j[1]) - r3 / 2, ds * Math.sin(j[1]) - r3 / 2, r3, r3);
		}
		ctx.resetTransform();
	}
	for (let i = 0; i < clickEvents.length; i++) {
		if (clickEvents[i].time >= 30) {
			clickEvents.splice(i, 1);
			i--;
		}
	}
	//绘制进度条
	ctx.scale(canvas.width / 1920, canvas.width / 1920);
	ctx.drawImage(img.bar1, Math.min(timeRaw / duration - 1, 0) * 1920, 0);
	ctx.resetTransform();
	//显示文字（时刻）
	const fontSize = Math.max(canvas.width, canvas.height, 854 * window.devicePixelRatio) * 0.03;
	ctx.fillStyle = "#fff";
	if (++tick % 10 == 0) {
		fps = Math.round(1e4 / (Date.now() - start));
		start = Date.now();
	}
	ctx.textBaseline = "top";
	ctx.font = `${fontSize*0.4}px Exo,monospace`;
	ctx.textAlign = "left";
	ctx.fillText(`${time2Str(timeRaw)}/${time2Str(duration)}`, 0, fontSize * 0.3);
	ctx.textAlign = "right";
	ctx.fillText(`${fps}`, canvas.width, fontSize * 0.3);
	ctx.textBaseline = "alphabetic";
	ctx.font = `${fontSize}px Exo,monospace`;
	ctx.textAlign = "right";
	ctx.fillText(`${score}`, canvas.width - fontSize * 0.9, fontSize * 1.5);
	ctx.font = `${fontSize*0.75}px Exo,monospace`;
	ctx.fillText(level, canvas.width - fontSize * 0.9, canvas.height - fontSize * 0.9);
	ctx.drawImage(img.bar2, fontSize * 0.9, canvas.height - fontSize * 1.8, fontSize * 7 / 36, fontSize);
	ctx.textAlign = "left";
	ctx.fillText(songName, fontSize * 1.5, canvas.height - fontSize * 0.9);
	if (combo > 2) {
		ctx.textAlign = "center";
		ctx.font = `${fontSize*1.5}px Exo,monospace`;
		ctx.fillText(`${combo}`, canvas.width / 2, fontSize * 1.5);
		ctx.textBaseline = "top";
		ctx.font = `${fontSize*0.75}px Exo,monospace`;
		ctx.fillText(`combo`, canvas.width / 2, fontSize * 1.6);
	}
	requestAnimationFrame(draw);
}
const time2Str = time => `${`00${parseInt(time/60)}`.slice(-2)}:${`00${parseInt(time%60)}`.slice(-2)}`;
const actx = new AudioContext();
const img = {};
const imgClick = {
	perfect: [],
	good: []
};
let curTime = 0;
let curTimestamp = 0;
const aud = [];
//test start
let chart = {};
let multi = {};

function type2idx(type) {
	switch (type) {
		case 1:
		case 3:
			return 0;
		case 2:
			return 1;
		case 4:
			return 2;
		default:
			return 0;
	}
}
//test end
function init() {
	loadChart();
	//加载谱面
	function loadChart() {
		const xhr = new XMLHttpRequest();
		xhr.open("get", "src/test.json");
		xhr.send();
		xhr.onload = () => {
			chart = JSON.parse(xhr.responseText);
			//note预加载(双押提示)
			for (const i of chart.judgeLineList) {
				for (const j of i.notesAbove) {
					if (!multi[j.time]) multi[j.time] = 1;
					else multi[j.time] = 2;
				}
				for (const j of i.notesBelow) {
					if (!multi[j.time]) multi[j.time] = 1;
					else multi[j.time] = 2;
				}
			}
			for (const i of chart.judgeLineList) {
				for (const j of i.notesAbove) {
					if (multi[j.time] == 2) j.multi = true;
				}
				for (const j of i.notesBelow) {
					if (multi[j.time] == 2) j.multi = true;
				}
			}
			console.log(chart);
			loadImage();
		}
	}
	//加载图片
	function loadImage() {
		const imgsrc = {
			bg: "src/bg.png",
			bar1: "src/bar1.png",
			bar2: "src/bar2.png",
			click: "src/click.png",
			tap1: "src/tap1.png",
			tap2: "src/tap2.png",
			drag1: "src/drag1.png",
			drag2: "src/drag2.png",
			hold1: "src/hold1.png",
			hold2: "src/hold2.png",
			hold3: "src/hold3.png",
			flick1: "src/flick1.png",
			flick2: "src/flick2.png",
		};
		let imgNum = 0;
		for ({} in imgsrc) imgNum++;
		for (const i in imgsrc) {
			img[i] = new Image();
			img[i].src = imgsrc[i];
			img[i].onload = () => {
				//loading.innerText = `加载图片资源...(还剩${imgNum}个文件)`;
				if (--imgNum <= 0) loadImage2();
			}
		}
	}
	//调整图片
	function loadImage2() {
		//调整背景图尺寸
		if (img.bg.width * 9 > img.bg.height * 16) {
			sx = (img.bg.width - img.bg.height * 16 / 9) / 2;
			sy = 0;
			sw = img.bg.height * 16 / 9;
			sh = img.bg.height;
		} else {
			sx = 0;
			sy = (img.bg.height - img.bg.width * 9 / 16) / 2;
			sw = img.bg.width;
			sh = img.bg.width * 9 / 16;
		}
		//加载打击动画
		const canvas2 = document.createElement("canvas");
		canvas2.width = 256;
		canvas2.height = 7680;
		const ctx2 = canvas2.getContext("2d");
		ctx2.drawImage(img.click, 0, 0);
		for (let i = 0; i < 30; i++) {
			const canvas3 = document.createElement("canvas");
			canvas3.width = 256;
			canvas3.height = 256;
			const imgP = ctx2.getImageData(0, i * 256, 256, 256);
			for (let i = 0; i < imgP.data.length / 4; i++) {
				imgP.data[i * 4] *= 1;
				imgP.data[i * 4 + 1] *= 1;
				imgP.data[i * 4 + 2] *= 0.67;
			}
			const imgG = ctx2.getImageData(0, i * 256, 256, 256);
			for (let i = 0; i < imgG.data.length / 4; i++) {
				imgG.data[i * 4] *= 0.63;
				imgG.data[i * 4 + 1] *= 0.93;
				imgG.data[i * 4 + 2] *= 1;
			}
			const img3 = new Image();
			canvas3.getContext("2d").putImageData(imgP, 0, 0);
			img3.src = canvas3.toDataURL('image/png', 1);
			imgClick.perfect[i] = img3;
			const img4 = new Image();
			canvas3.getContext("2d").putImageData(imgG, 0, 0);
			img4.src = canvas3.toDataURL('image/png', 1);
			imgClick.good[i] = img4;
		}
		loadAudio();
	}
	//加载打击音效
	function loadAudio() {
		const audsrc = ["src/HitSong_0.ogg", "src/HitSong_1.ogg", "src/HitSong_2.ogg"];
		let audNum = 0;
		for ({} in audsrc) audNum++;
		for (const i in audsrc) {
			const xhr = new XMLHttpRequest(); //通过XHR下载音频文件
			xhr.open("get", audsrc[i], true);
			xhr.responseType = 'arraybuffer';
			xhr.onload = () => { //下载完成
				actx.decodeAudioData(xhr.response, data => aud[i] = data);
				if (--audNum <= 0) loadBgm();
			};
			xhr.send();
		}
	}
	//加载bgm
	function loadBgm() {
		const xhr = new XMLHttpRequest(); //通过XHR下载音频文件
		xhr.open("get", 'src/test.ogg', true);
		xhr.responseType = 'arraybuffer';
		xhr.onload = () => { //下载完成
			actx.decodeAudioData(xhr.response, data => {
				for (const i of chart.judgeLineList) lines.push(new line(0, 0, 0, 0, i.bpm));
				duration = data.duration;
				playBgm(data);
				draw();
				for (const i of chart.judgeLineList) console.log(i); //test
			});
		};
		xhr.send();
	}
	//播放bgm
	function playBgm(data, offset) {
		let times = 0;
		if (!offset) offset = 0;
		curTimestamp = Date.now();
		const bufferSource = actx.createBufferSource();
		bufferSource.buffer = data;
		//bufferSource.loop = true; //循环播放
		bufferSource.connect(actx.destination);
		bufferSource.start(0, offset);
		document.addEventListener("visibilitychange", () => {
			if (times == 0) {
				bufferSource.stop();
				curTime = offset + (Date.now() - curTimestamp) / 1e3;
				curTimestamp = Date.now();
			}
			if (times == 1) playBgm(data, curTime);
			times++;
		});
	}
}
init();