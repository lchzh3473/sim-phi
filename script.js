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
//bpm事件
const bpmEvents = []; //存放bpm事件
class bpmEvent {
	constructor(time, bpm) {
		this.time = time;
		this.bpm = bpm;
	}
}

function bpm2beat(time) {
	let beats = 0;
	let timm = 0;
	let bpmm = 0;
	for (const i of bpmEvents) {
		if (time < i.time) break;
		beats += (i.time - timm) * bpmm / 60;
		timm = i.time;
		bpmm = i.bpm;
	}
	return beats + (time - timm) * bpmm / 60;
}
//点击特效(以后会改)
const clicks = []; //存放点击事件，用于检测
const clickEvents = []; //存放点击特效
/*canvas.onclick = function(e) {
	clickEvents.push(new clickEvent(e.pageX * window.devicePixelRatio, e.pageY * window.devicePixelRatio));
}*/
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
	console.log("mousedown", idx); //test
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
	console.log("mouseup", idx); //test
	clearInterval(clicks[idx].t);
	clicks[idx] = {};
	isMouseDown[idx] = false;
});
canvas.addEventListener("mouseout", evt => {
	evt.preventDefault();
	for (const idx in isMouseDown) {
		if (isMouseDown[idx]) {
			console.log("mouseout", idx); //test
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
		console.log("touchstart", idx); //test
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
		console.log("touchend", idx); //test
		clearInterval(clicks[idx].t);
		clicks[idx] = {};
	}
});
canvas.addEventListener("touchcancel", evt => {
	for (const i of evt.changedTouches) {
		const idx = i.identifier;
		console.log("touchcancel", idx); //test
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
const showPoint = true; //显示控制点
//判定线事件
/*
class lineEvent {
	constructor(id, t1, x, y, r1, o1, a1, t2, x, y, r2, o2, a2, tween) {
		this.id = id; //对应下标
		this.t = [t1, t2];
		this.s = new crd(x, y, r1, o1, a1);
		this.e = new crd(x, y, r2, o2, a2);
		this.tween = tween; //缓动类型
	}
}*/
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
//note事件
/*class noteEvent {
	constructor(id, t1, x, y, r1, o1, a1, t2, x, y, r2, o2, a2, tween) {
		this.id = id; //对应下标
		this.t = [t1, t2];
		this.s = new crd(x, y, r1, o1, a1);
		this.e = new crd(x, y, r2, o2, a2);
		this.tween = tween; //缓动类型
	}
}*/
const ctx = canvas.getContext("2d");
const ctxbg = canvasbg.getContext("2d");
let time = Date.now();

function draw() {
	//重置画面
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	//绘制背景
	ctxbg.drawImage(img.bg, sx, sy, sw, sh, dx2, dy2, dw2, dh2);
	ctxbg.drawImage(img.bg, sx, sy, sw, sh, dx1, dy1, dw1, dh1);
	//背景变暗
	ctx.fillStyle = "#000";
	ctx.globalAlpha = 0.5;
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
	let beat = bpm2beat(time); //(Date.now() - time) / 6e4 * bpm;
	ctx.fillText(`beat:${beat.toFixed(2)}`, px * 0.6, px * 4.2);
	//遍历events
	for (const i of lineEvents) {
		if (beat >= i.t[0] && beat <= i.t[1]) {
			const d2 = tween[i.tween || 'linear']((beat - i.t[0]) / (i.t[1] - i.t[0]));
			let curLine = lines[i.id];
			curLine = curLine.change(i.s, i.e, d2);
		}
	}
	for (const i of noteEvents) {
		if (beat >= i.t[0] && beat <= i.t[1]) {
			const d2 = tween[i.tween || 'linear']((beat - i.t[0]) / (i.t[1] - i.t[0]));
			let curNote = notes[i.id];
			curNote = curNote.change(i.s, i.e, d2);
		}
	}
	//绘制判定线
	for (const i of lines) {
		ctx.translate(wlen * (1 + i.x), hlen * (1 - i.y));
		ctx.rotate(-i.r * Math.PI / 180);
		ctx.beginPath();
		ctx.translate(0, -mlen * i.o);
		ctx.strokeStyle = `rgba(254,254,169,${i.a})`;
		ctx.lineWidth = 3;
		ctx.moveTo(-maxlen, 0);
		ctx.lineTo(maxlen, 0);
		ctx.stroke();
		ctx.closePath();
		ctx.resetTransform();
	}
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
	//绘制note
	/*for (const i of notes) {
		if (i.beat >= beat) {
			ctx.shadowBlur = i.isMulti ? 25 : 0;
			let crdxdui = [lines[i.from], i];
			switch (i.type) {
				case 0:
					//绘制蓝键
					drawTapNote(..xdui);
					break;
				case 1:
					//绘制黄键
					drawDragNote(..xdui);
					break;
				case 2:
					//绘制粉键
					drawFlickNote(..xdui);
					break;
				case 3:
					break;
				default:
			}
			ctx.resetTransform();
		}
		//i.y += canvas.height / 228; //test
	}*/
	for (const i of clickEvents) {
		//打击特效
		const tick = i.time / 30;
		ctx.translate(i.x, i.y);
		ctx.scale(scale * 3, scale * 3); //缩放
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
let json = {};
//test start
let aaa = 0;

function test() {
	for (const i of json.judgeLineList[0].notesAbove) {
		//console.log(i.time);
		setTimeout(() => {
			const bufferSource = actx.createBufferSource();
			bufferSource.buffer = aud[type2idx(i.type)];
			//bufferSource.loop = true; //循环播放
			bufferSource.connect(actx.destination);
			bufferSource.start();
			clickEvents.push(new clickEvent(canvas.width / 16 * (8 + i.positionX), canvas.height * 0.75));
			console.log(i.type, ++aaa, (Array(7).join(0) + (1000000 / 2500 * aaa).toFixed(0)).slice(-7));
		}, i.time * 6e4 / 200 / 32);
	}

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
}
//test end
function init() {
	//谱面(临时，以后改成json)
	//bpmEvents.push(new bpmEvent(0, 170), new bpmEvent(127.14, 138));
	bpmEvents.push(new bpmEvent(0, 200));
	lines.push(new line(0, -0.5, 0, 0, 1));
	loadChart();
	//加载谱面
	function loadChart() {
		let xhr = new XMLHttpRequest();
		xhr.open("get", "test.json");
		xhr.send();
		xhr.onload = () => {
			json = JSON.parse(xhr.responseText);
			loadImage();
			console.log(json);
			console.log(json.judgeLineList[0].notesAbove); //test
		}
	}
	//加载图片
	function loadImage() {
		const imgsrc = {
			click: "1.png",
			bg: "bg.png"
		};
		let imgNum = 0;
		for ({} in imgsrc) imgNum++;
		for (const i in imgsrc) {
			img[i] = new Image();
			img[i].src = imgsrc[i];
			img[i].onload = () => {
				//loading.innerText = `加载图片资源...(还剩${imgNum}个文件)`;
				if (--imgNum <= 0) {
					loadImage2();
				}
			}
		}
	}
	//加载点击动画
	function loadImage2() {
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

	function loadAudio() {
		const audsrc = ["./HitSong_0.ogg", "./HitSong_1.ogg", "./HitSong_2.ogg"];
		let audNum = 0;
		for ({} in audsrc) audNum++;
		for (const i in audsrc) {
			let xhr = new XMLHttpRequest(); //通过XHR下载音频文件
			xhr.open("get", audsrc[i], true);
			xhr.responseType = 'arraybuffer';
			xhr.onload = () => { //下载完成
				actx.decodeAudioData(xhr.response, data => aud[i] = data);
				if (--audNum <= 0) {
					loadAudio2();
				}
			};
			xhr.send();
		}
	}
	//初始化bgm
	function loadAudio2() {
		let xhr = new XMLHttpRequest(); //通过XHR下载音频文件
		xhr.open("get", 'test.ogg', true);
		xhr.responseType = 'arraybuffer';
		xhr.onload = () => { //下载完成
			actx.decodeAudioData(xhr.response, data => {
				duration = data.duration;
				playBgm(data);
				draw();
				test(); //test
			});
		};
		xhr.send();

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
}
init();

function drawTapNote(crd1, crd2) {
	ctx.translate(wlen + crd1.wx * wlen + crd1.hx * hlen + crd1.mx * mlen, hlen - crd1.wy * wlen - crd1.hy * hlen - crd1.my * mlen);
	//ctx.translate(wlen * (100 + i.vx) + mlen * i.mx, hlen * (100 - i.vy) - mlen * i.my);
	ctx.rotate(-crd1.r * Math.PI / 180);
	ctx.translate(0, -mlen * crd1.o);
	ctx.translate(crd2.wx * wlen + crd2.hx * hlen + crd2.mx * mlen, crd2.wy * wlen + crd2.hy * hlen + crd2.my * mlen);
	ctx.rotate(-crd2.r * Math.PI / 180);
	/*ctx.translate(i.x, i.y);
	ctx.rotate(i.r);*/
	ctx.scale(scale, scale);
	ctx.beginPath();
	ctx.fillStyle = "#fff";
	ctx.moveTo(420, 50);
	ctx.lineTo(444, 0);
	ctx.lineTo(420, -50);
	ctx.lineTo(-420, -50);
	ctx.lineTo(-444, 0);
	ctx.lineTo(-420, 50);
	ctx.moveTo(470, 50);
	ctx.lineTo(494, 0);
	ctx.lineTo(470, -50);
	ctx.lineTo(444, -50);
	ctx.lineTo(470, 0);
	ctx.lineTo(444, 50);
	ctx.moveTo(-470, 50);
	ctx.lineTo(-494, 0);
	ctx.lineTo(-470, -50);
	ctx.lineTo(-444, -50);
	ctx.lineTo(-470, 0);
	ctx.lineTo(-444, 50);
	ctx.fill();
	ctx.closePath();
	ctx.beginPath();
	ctx.fillStyle = "#1cf";
	ctx.moveTo(395, 25);
	ctx.lineTo(407, 0);
	ctx.lineTo(395, -25);
	ctx.lineTo(-395, -25);
	ctx.lineTo(-407, 0);
	ctx.lineTo(-395, 25);
	ctx.fill();
	ctx.closePath();
}

function drawDragNote(i) {
	ctx.translate(i.x, i.y);
	ctx.rotate(i.r);
	ctx.scale(scale, scale);
	ctx.beginPath();
	ctx.fillStyle = "#fff";
	ctx.moveTo(424, 30);
	ctx.lineTo(444, 0);
	ctx.lineTo(424, -30);
	ctx.lineTo(-424, -30);
	ctx.lineTo(-444, 0);
	ctx.lineTo(-424, 30);
	ctx.moveTo(474, 30);
	ctx.lineTo(494, 0);
	ctx.lineTo(474, -30);
	ctx.lineTo(448, -30);
	ctx.lineTo(468, 0);
	ctx.lineTo(448, 30);
	ctx.moveTo(-474, 30);
	ctx.lineTo(-494, 0);
	ctx.lineTo(-474, -30);
	ctx.lineTo(-448, -30);
	ctx.lineTo(-468, 0);
	ctx.lineTo(-448, 30);
	ctx.fill();
	ctx.closePath();
	ctx.beginPath();
	ctx.fillStyle = "#ee6";
	ctx.moveTo(394, 20);
	ctx.lineTo(404, 0);
	ctx.lineTo(394, -20);
	ctx.lineTo(-394, -20);
	ctx.lineTo(-404, 0);
	ctx.lineTo(-394, 20);
	ctx.fill();
	ctx.closePath();
}

function drawFlickNote(i) {
	ctx.translate(i.x, i.y);
	ctx.rotate(i.r);
	ctx.scale(scale, scale);
	ctx.beginPath();
	ctx.fillStyle = "#fff";
	ctx.moveTo(420, 50);
	ctx.lineTo(444, 0);
	ctx.lineTo(420, -50);
	ctx.lineTo(74, -50);
	ctx.lineTo(74, 20);
	ctx.lineTo(32, -4);
	ctx.lineTo(32, 50);
	ctx.moveTo(-420, -50);
	ctx.lineTo(-444, 0);
	ctx.lineTo(-420, 50);
	ctx.lineTo(-74, 50);
	ctx.lineTo(-74, -20);
	ctx.lineTo(-32, 4);
	ctx.lineTo(-32, -50);
	ctx.moveTo(21, 100);
	ctx.lineTo(21, -24);
	ctx.lineTo(62, 0);
	ctx.lineTo(62, -50);
	ctx.lineTo(-21, -100);
	ctx.lineTo(-21, 24);
	ctx.lineTo(-62, 0);
	ctx.lineTo(-62, 50);
	ctx.moveTo(470, 50);
	ctx.lineTo(494, 0);
	ctx.lineTo(470, -50);
	ctx.lineTo(444, -50);
	ctx.lineTo(470, 0);
	ctx.lineTo(444, 50);
	ctx.moveTo(-470, 50);
	ctx.lineTo(-494, 0);
	ctx.lineTo(-470, -50);
	ctx.lineTo(-444, -50);
	ctx.lineTo(-470, 0);
	ctx.lineTo(-444, 50);
	ctx.fill();
	ctx.closePath();
	ctx.beginPath();
	ctx.fillStyle = "#f46";
	ctx.moveTo(403, 22);
	ctx.lineTo(414, 0);
	ctx.lineTo(403, -22);
	ctx.lineTo(101, -22);
	ctx.lineTo(101, 22);
	ctx.moveTo(-403, -22);
	ctx.lineTo(-414, 0);
	ctx.lineTo(-403, 22);
	ctx.lineTo(-101, 22);
	ctx.lineTo(-101, -22);
	ctx.moveTo(1, -36);
	ctx.lineTo(1, -60);
	ctx.lineTo(20, -48);
	ctx.arcTo(1, -60, 1, -36, 24);
	ctx.moveTo(-1, 36);
	ctx.lineTo(-1, 60);
	ctx.lineTo(-20, 48);
	ctx.arcTo(-1, 60, -1, 36, 24);
	ctx.fill();
	ctx.closePath();
}
const s = 1.70158;
const tween = {
	easeInQuad: pos => Math.pow(pos, 2),
	easeOutQuad: pos => 1 - Math.pow((pos - 1), 2),
	easeInOutQuad: pos => (pos *= 2) < 1 ? Math.pow(pos, 2) / 2 : -((pos -= 2) * pos - 2) / 2,
	easeInCubic: pos => Math.pow(pos, 3),
	easeOutCubic: pos => 1 + Math.pow((pos - 1), 3),
	easeInOutCubic: pos => ((pos *= 2) < 1) ? Math.pow(pos, 3) / 2 : (Math.pow((pos - 2), 3) + 2) / 2,
	easeInQuart: pos => Math.pow(pos, 4),
	easeOutQuart: pos => 1 - Math.pow((pos - 1), 4),
	easeInOutQuart: pos => ((pos *= 2) < 1) ? Math.pow(pos, 4) / 2 : -((pos -= 2) * Math.pow(pos, 3) - 2) / 2,
	easeInQuint: pos => Math.pow(pos, 5),
	easeOutQuint: pos => 1 + Math.pow((pos - 1), 5),
	easeInOutQuint: pos => ((pos *= 2) < 1) ? Math.pow(pos, 5) / 2 : (Math.pow((pos - 2), 5) + 2) / 2,
	easeInSine: pos => 1 - Math.cos(pos * (Math.PI / 2)),
	easeOutSine: pos => Math.sin(pos * (Math.PI / 2)),
	easeInOutSine: pos => (1 - Math.cos(Math.PI * pos)) / 2,
	easeInExpo: pos => pos == 0 ? 0 : Math.pow(2, 10 * (pos - 1)),
	easeOutExpo: pos => pos == 1 ? 1 : 1 - Math.pow(2, -10 * pos),
	easeInOutExpo: pos => {
		if (pos == 0) return 0;
		if (pos == 1) return 1;
		return (pos *= 2) < 1 ? Math.pow(2, 10 * (pos - 1)) / 2 : 1 - Math.pow(2, -10 * (pos - 1)) / 2;
	},
	easeInCirc: pos => -(Math.sqrt(1 - (pos * pos)) - 1),
	easeOutCirc: pos => Math.sqrt(1 - Math.pow((pos - 1), 2)),
	easeInOutCirc: pos => ((pos *= 2) < 1) ? -(Math.sqrt(1 - pos * pos) - 1) / 2 : (Math.sqrt(1 - (pos -= 2) * pos) + 1) / 2,
	easeOutBounce: pos => {
		if (pos < 1 / 2.75) return 7.5625 * pos ** 2;
		if (pos < 2 / 2.75) return 7.5625 * (pos - 1.5 / 2.75) ** 2 + .75;
		if (pos < 2.5 / 2.75) return 7.5625 * (pos - 2.25 / 2.75) ** 2 + .9375;
		return 7.5625 * (pos - 2.625 / 2.75) ** 2 + .984375;
	},
	easeInBack: pos => pos * pos * ((s + 1) * pos - s),
	easeOutBack: pos => (pos = pos - 1) * pos * ((s + 1) * pos + s) + 1,
	easeInOutBack: pos => ((pos *= 2) < 1) ? (pos * pos * (((s *= (1.525)) + 1) * pos - s)) / 2 : ((pos -= 2) * pos * (((s *= (1.525)) + 1) * pos + s) + 2) / 2,
	elastic: pos => -1 * Math.pow(4, -8 * pos) * Math.sin((pos * 6 - 1) * (2 * Math.PI) / 2) + 1,
	swingFromTo: pos => ((pos *= 2) < 1) ? (pos * pos * (((s *= (1.525)) + 1) * pos - s)) / 2 : ((pos -= 2) * pos * (((s *= (1.525)) + 1) * pos + s) + 2) / 2,
	swingFrom: pos => pos * pos * ((s + 1) * pos - s),
	swingTo: pos => (pos -= 1) * pos * ((s + 1) * pos + s) + 1,
	bounce: pos => {
		if (pos < 1 / 2.75) return 7.5625 * pos ** 2;
		if (pos < 2 / 2.75) return 7.5625 * (pos - 1.5 / 2.75) ** 2 + .75;
		if (pos < 2.5 / 2.75) return 7.5625 * (pos - 2.25 / 2.75) ** 2 + .9375;
		return 7.5625 * (pos - 2.625 / 2.75) ** 2 + .984375;
	},
	bouncePast: pos => {
		if (pos < 1 / 2.75) return 7.5625 * pos ** 2;
		if (pos < 2 / 2.75) return 2 - (7.5625 * (pos - 1.5 / 2.75) ** 2 + .75);
		if (pos < 2.5 / 2.75) return 2 - (7.5625 * (pos - 2.25 / 2.75) ** 2 + .9375);
		return 2 - (7.5625 * (pos - 2.625 / 2.75) ** 2 + .984375);
	},
	easeFromTo: pos => (pos *= 2) < 1 ? Math.pow(pos, 4) / 2 : 1 - (pos -= 2) * Math.pow(pos, 3) / 2,
	easeFrom: pos => Math.pow(pos, 4),
	easeTo: pos => Math.pow(pos, 0.25),
	linear: pos => pos,
	sinusoidal: pos => 0.5 - Math.cos(pos * Math.PI) / 2,
	reverse: pos => 1 - pos,
	mirror: (pos, transition) => {
		transition = transition || tween.sinusoidal;
		return pos < 0.5 ? transition(pos * 2) : transition(1 - (pos - 0.5) * 2);
	},
	flicker: pos => {
		pos += (Math.random() - 0.5) / 5;
		return tween.sinusoidal(pos < 0 ? 0 : pos > 1 ? 1 : pos);
	},
	wobble: pos => 0.5 - Math.cos(pos * Math.PI * (9 * pos)) / 2,
	pulse: (pos, pulses) => 0.5 - Math.cos((pos * ((pulses || 5) - .5) * 2) * Math.PI) / 2,
	blink: (pos, blinks) => Math.round(pos * (blinks || 5)) % 2,
	spring: pos => 1 - (Math.cos(pos * 4.5 * Math.PI) * Math.exp(-pos * 6)),
	none: () => 0,
	full: () => 1
}