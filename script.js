"use strict";
const _i = ['Phigros模拟器', [1, 0, 1], 1618728604, 1611795955];
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
	scale = canvas.width / 6e3; //note缩放
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
let bpm, duration, frame = 0;
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
	constructor(x, y, rotation, offset, alpha) {
		this.x = x;
		this.y = y;
		this.r = rotation;
		this.o = offset;
		this.a = alpha;
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

function showNote(line, notes, time, num, speedEvents, bpm) {
	const sx = canvas.width / 2 * (1 + line.x);
	const sy = canvas.height / 2 * (1 - line.y);
	const r = line.r / 180 * Math.PI;
	for (const i of notes) {
		if (i.played && i.type != 3) continue;
		ctx.translate(sx, sy);
		ctx.rotate(-r);
		ctx.translate(canvas.width * i.positionX / 18, -canvas.height / 2 * (i.floorPosition - line.positionY) * num); //暂时忽略i.speed
		ctx.scale(scale, scale); //缩放
		//ctx.shadowBlur = i.isMulti ? 25 : 0;
		switch (i.type) {
			case 1:
				//绘制蓝键
				ctx.drawImage(img.tap1, -494.5, -50);
				break;
			case 2:
				//绘制黄键
				ctx.drawImage(img.drag1, -494.5, -30);
				break;
			case 3:
				//绘制长条
				if (num == -1) ctx.rotate(Math.PI);
				const rL = canvas.height / 2 / bpm * 1.875 / scale * i.speed;
				const holdL = rL * i.holdTime;
				if (i.time > time) {
					ctx.drawImage(img.hold1, -494.5, 0);
					ctx.drawImage(img.hold2, -494.5, -holdL, 989, holdL);
					ctx.drawImage(img.hold3, -494.5, -holdL - 50);
				} else if (i.time + i.holdTime > time) {
					ctx.drawImage(img.hold3, -494.5, -holdL - 50);
					ctx.drawImage(img.hold2, -494.5, -holdL, 989, holdL - rL * (time - i.time));
				}
				break;
			case 4:
				//绘制粉键
				ctx.drawImage(img.flick1, -494.5, -100);
				break;
			default:
		}
		ctx.resetTransform();
	}
	//播放打击音效
	for (const i of notes) {
		if (i.time > time) break;
		if (!i.played) {
			const bufferSource = actx.createBufferSource();
			bufferSource.buffer = aud[type2idx(i.type)];
			bufferSource.connect(actx.destination);
			bufferSource.start();
			const d = canvas.width * i.positionX / 18;
			clickEvents.push(new clickEvent(sx + d * Math.cos(r), sy - d * Math.sin(r)));
			score = (Array(7).join(0) + (1e6 / chart.numOfNotes * (++combo)).toFixed(0)).slice(-7);
			i.played = true;
		}
	}
}

function moveLine(line, judgeLineMoveEvents, time) {
	for (const i of judgeLineMoveEvents) {
		if (time < i.startTime) break;
		if (time > i.endTime) continue;
		let dura = (time - i.startTime) / (i.endTime - i.startTime);
		let ina = 1 - dura;
		line.x = (i.start * ina + i.end * dura) * 2 - 1;
		line.y = (i.start2 * ina + i.end2 * dura) * 2 - 1;
	}
}

function rotateLine(line, judgeLineRotateEvents, time) {
	for (const i of judgeLineRotateEvents) {
		if (time < i.startTime) break;
		if (time > i.endTime) continue;
		let dura = (time - i.startTime) / (i.endTime - i.startTime);
		let ina = 1 - dura;
		line.r = i.start * ina + i.end * dura;
	}
}

function disappearLine(line, judgeLineDisappearEvents, time) {
	for (const i of judgeLineDisappearEvents) {
		if (time < i.startTime) break;
		if (time > i.endTime) continue;
		let dura = (time - i.startTime) / (i.endTime - i.startTime);
		let ina = 1 - dura;
		line.a = i.start * ina + i.end * dura;
	}
}

function speedLine(line, speedEvents, time, bpm) {
	let y = 0;
	for (const i of speedEvents) {
		if (time < i.startTime) break;
		if (time > i.endTime) y += (i.endTime - i.startTime) * i.value; // + i.floorPosition;
		else line.positionY = (y + (time - i.startTime) * i.value) / bpm * 1.875; //+ i.floorPosition;
		//if (time > i.endTime) continue;
		//line.positionY = y + time * i.value + i.floorPosition;
	}
}

function calcY(time, speedEvents, bpm) {
	let y = 0;
	for (const i of speedEvents) {
		if (time < i.startTime) break;
		if (time > i.endTime) y += (i.endTime - i.startTime) * i.value; // + i.floorPosition;
		return (y + (time - i.startTime) * i.value) / bpm * 1.875; //+ i.floorPosition;
	}
}
//note定义
const notes = []; //存放note
const noteEvents = []; //存放note事件
class note {
	constructor(from, type, beat, inverse) {
		//this.id = id; //对应下标
		this.from = from; //所属line下标
		this.type = type; //note类型
		this.beat = beat; //打击时间
		this.inverse = inverse; //是否倒打
		this.x = 0;
		this.y = 0;
		this.r = 0;
		this.isMulti = false; //是否多押
	}
}
//
const ctx = canvas.getContext("2d");
const ctxbg = canvasbg.getContext("2d");
let time = Date.now();
let combo = 0; //test
let score = "0000000"; //test

function draw() {
	//重置画面
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	//绘制背景
	ctxbg.drawImage(img.bg, sx, sy, sw, sh, dx2, dy2, dw2, dh2);
	ctxbg.drawImage(img.bg, sx, sy, sw, sh, dx1, dy1, dw1, dh1);
	//背景变暗
	ctx.fillStyle = "#000";
	ctx.globalAlpha = 0.6;
	ctx.fillRect(0, 0, dw1, dh1);
	ctx.globalAlpha = 1;
	//多押阴影
	ctx.shadowColor = "#ff7";
	//显示文字（时刻）
	const px = 25 * window.devicePixelRatio;
	ctx.font = `${px}px monospace`;
	ctx.fillStyle = "rgba(255,255,255,0.6)";
	ctx.textAlign = "start";
	ctx.fillText(`frame:${frame++}`, px * 0.6, px * 1.6);
	let time = (Date.now() - curTimestamp) / 1e3 + curTime;
	ctx.fillText(`time:${time.toFixed(2)}(${(time/duration*100).toFixed(2)}%)`, px * 0.6, px * 2.9);
	ctx.textAlign = "end";
	ctx.fillText(`score:${score}`, canvas.width - px * 0.6, px * 1.6);
	ctx.fillText(`combo:${combo}`, canvas.width - px * 0.6, px * 2.9);
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
		const i = lines[idx];
		if (i) { //避免加载失败报错
			const numOfNotes = val.numOfNotes;
			const numOfNotesAbove = val.numOfNotesAbove;
			const numOfNotesBelow = val.numOfNotesBelow;
			const beat32 = time * val.bpm / 1.875;
			const speedEvents = val.speedEvents;
			showNote(i, val.notesAbove, beat32, 1, speedEvents, val.bpm);
			showNote(i, val.notesBelow, beat32, -1, speedEvents, val.bpm);
			disappearLine(i, val.judgeLineDisappearEvents, beat32);
			moveLine(i, val.judgeLineMoveEvents, beat32);
			rotateLine(i, val.judgeLineRotateEvents, beat32);
			speedLine(i, val.speedEvents, beat32, val.bpm);
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
		ctx.drawImage(imgClick[(i.time++).toFixed(0)], -128, -128); //停留约0.5秒
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
	requestAnimationFrame(draw);
}

const actx = new AudioContext();
const img = {};
const imgClick = [];
let curTime = 0;
let curTimestamp = 0;
const aud = [];
//test start
let chart = {};

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
	//谱面(临时，以后改成json)
	//bpmEvents.push(new bpmEvent(0, 170), new bpmEvent(127.14, 138));
	//bpmEvents.push(new bpmEvent(0, 200));
	//lines.push(new line(0, -0.5, 0, 0, 1));
	loadChart();
	//加载谱面
	function loadChart() {
		let xhr = new XMLHttpRequest();
		xhr.open("get", "src/test.json");
		xhr.send();
		xhr.onload = () => {
			chart = JSON.parse(xhr.responseText);
			loadImage();
			console.log(chart);
		}
	}
	//加载图片
	function loadImage() {
		const imgsrc = {
			bg: "src/bg.png",
			click: "src/0.png",
			tap1: "src/tap1.png",
			drag1: "src/drag1.png",
			hold1: "src/hold1.png",
			hold2: "src/hold2.png",
			hold3: "src/hold3.png",
			flick1: "src/flick1.png",
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
		canvas2.width = 512;
		canvas2.height = 7680;
		const ctx = canvas2.getContext("2d");
		ctx.drawImage(img.click, 0, 0);
		for (let i = 0; i < 2; i++) {
			for (let j = 0; j < 30; j++) {
				const canvas3 = document.createElement("canvas");
				canvas3.width = 256;
				canvas3.height = 256;
				canvas3.getContext("2d").putImageData(ctx.getImageData(i * 256, j * 256, 256, 256), 0, 0);
				const img3 = new Image();
				img3.src = canvas3.toDataURL('image/png', 1);
				imgClick[i * 30 + j] = img3;
			}
		}
		loadAudio();
	}
	//加载打击音效
	function loadAudio() {
		const audsrc = ["src/HitSong_0.ogg", "src/HitSong_1.ogg", "src/HitSong_2.ogg"];
		let audNum = 0;
		for ({} in audsrc) audNum++;
		for (const i in audsrc) {
			let xhr = new XMLHttpRequest(); //通过XHR下载音频文件
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
		let xhr = new XMLHttpRequest(); //通过XHR下载音频文件
		xhr.open("get", 'src/test.ogg', true);
		xhr.responseType = 'arraybuffer';
		xhr.onload = () => { //下载完成
			actx.decodeAudioData(xhr.response, data => {
				for (const i of chart.judgeLineList) lines.push(new line(0, 0, 0, 0, 0));
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