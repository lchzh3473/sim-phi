"use strict";
//document.oncontextmenu = e => e.returnValue = false;
const upload = document.getElementById("upload");
const uploads = document.getElementById("uploads");
const out = document.getElementById("output");
const stage = document.getElementById("stage");
const select = document.getElementById("select");
const selectbg = document.getElementById("select-bg");
selectbg.onchange = () => {
	backgroundImage = bgs[selectbg.value];
	resizeImagebg();
}
const selectbgm = document.getElementById("select-bgm");
const selectchart = document.getElementById("select-chart");
const bgs = [];
const bgms = [];
const charts = [];
const canvas = document.getElementById("canvas");
const canvasbg = document.getElementById("canvas-bg");
//调节画面尺寸
let wlen, hlen, noteScale, lineScale, sx, sy, sw, sh, dx1, dy1, dw1, dh1, dx2, dy2, dw2, dh2; //背景图相关
const aspectRatio = 16 / 9;
canvas.style.cssText = `max-width:calc(100vh*${aspectRatio});`
const scaleRatio = 7e3;
//全屏相关
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

stage.onclick = () => {
	if (document.fullscreenElement) document.exitFullscreen().then(resizeCanvas);
	else stage.requestFullscreen().then(resizeCanvas);
	//document.exitFullscreen().then(resizeCanvas).catch(stage.requestFullscreen().then(resizeCanvas));
}

function resizeCanvas() {
	const width = window.innerWidth * window.devicePixelRatio;
	const height = window.innerHeight * window.devicePixelRatio;
	if (document.fullscreenElement) {
		canvasbg.classList.remove("hide");
		canvas.width = Math.min(width, height * aspectRatio);
		canvas.height = height;
		canvasbg.width = width;
		canvasbg.height = height;
	} else {
		canvasbg.classList.add("hide");
		canvas.width = width;
		canvas.height = canvas.width / aspectRatio;
	}
	wlen = canvas.width / 2;
	hlen = canvas.height / 2;
	noteScale = canvas.width / scaleRatio; //note、特效缩放
	lineScale = Math.max(canvas.width, canvas.height, 854 * window.devicePixelRatio) * 0.03; //判定线、文字缩放
	dx1 = wlen - hlen * aspectRatio;
	dy1 = 0;
	dw1 = canvas.height * aspectRatio;
	dh1 = canvas.height;
	dx2 = 0;
	dy2 = (height - width / aspectRatio) / 2;
	dw2 = width;
	dh2 = width / aspectRatio;
}
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
/*
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
});*/
//init();
const ctx = canvas.getContext("2d"); //游戏界面
const ctxbg = canvasbg.getContext("2d"); //游戏背景
const imgClick = {
	perfect: [],
	good: []
};
window.addEventListener("load", init);
//
const actx = new AudioContext();
const res = {}; //存放资源
//初始化
function init() {
	uploads.classList.add("disabled");
	select.classList.add("disabled");
	stage.classList.add("disabled");
	loadResourse();
	//加载资源
	async function loadResourse() {
		await Promise.all((obj => {
			const arr = [];
			for (const i in obj) arr.push([i, obj[i]]);
			return arr;
		})({
			JudgeLine: "src/JudgeLine.png",
			ProgressBar: "src/ProgressBar.png",
			SongsNameBar: "src/SongsNameBar.png",
			clickRaw: "src/clickRaw.png",
			Tap: "src/Tap.png",
			TapHL: "src/TapHL.png",
			Drag: "src/Drag.png",
			DragHL: "src/DragHL.png",
			HoldHead: "src/HoldHead.png",
			Hold: "src/Hold.png",
			HoldEnd: "src/HoldEnd.png",
			Flick: "src/Flick.png",
			FlickHL: "src/FlickHL.png",
			0: "src/HitSong_0.ogg",
			1: "src/HitSong_1.ogg",
			2: "src/HitSong_2.ogg"
		}).map(([name, src], i, arr) => new Promise(resolve => {
			const xhr = new XMLHttpRequest();
			xhr.open("get", src, true);
			if (/\.(png|jpeg|jpg)$/i.test(src)) {
				xhr.responseType = 'blob';
				xhr.send();
				xhr.onload = async () => {
					res[name] = await createImageBitmap(xhr.response);
					out.className = "accept";
					out.innerText = `加载资源...(还剩${arr.length-i}个文件)`;
					resolve();
				};
			} else if (/\.(mp3|wav|ogg)$/i.test(src)) {
				xhr.responseType = 'arraybuffer';
				xhr.send();
				xhr.onload = async () => {
					res[name] = await actx.decodeAudioData(xhr.response);
					out.className = "accept";
					out.innerText = `加载资源...(还剩${arr.length-i}个文件)`;
					resolve();
				};
			}
		})));
		loadImageClick();
	}
	//加载打击动画
	async function loadImageClick() {
		const clickPerfect = imgShader(res.clickRaw, "#fefea9");
		const clickGood = imgShader(res.clickRaw, "#a1ecff");
		res.JudgeLineAP = await createImageBitmap(imgShader(res.JudgeLine, "#fefea9"));
		res.JudgeLineFC = await createImageBitmap(imgShader(res.JudgeLine, "#a1ecff"));
		for (let i = 0; i < 30; i++) {
			res[`clickPerfect${i}`] = await createImageBitmap(clickPerfect, 0, i * 256, 256, 256);
			res[`clickGood${i}`] = await createImageBitmap(clickGood, 0, i * 256, 256, 256);
		}
		out.innerText = "等待上传文件...";
		upload.parentElement.classList.remove("disabled");
		//给图片上色
		function imgShader(img, color) {
			const canvas = document.createElement("canvas");
			canvas.width = img.width;
			canvas.height = img.height;
			const ctx = canvas.getContext("2d");
			ctx.drawImage(img, 0, 0);
			const imgData = ctx.getImageData(0, 0, img.width, img.height);
			if (color == null) return imgData;
			const rgba = (hex => {
				const canvas = document.createElement("canvas");
				const ctx = canvas.getContext("2d");
				ctx.fillStyle = hex;
				ctx.fillRect(0, 0, 1, 1);
				return ctx.getImageData(0, 0, 1, 1).data;
			})(color);
			for (let i = 0; i < imgData.data.length / 4; i++) {
				imgData.data[i * 4] *= rgba[0] / 255;
				imgData.data[i * 4 + 1] *= rgba[1] / 255;
				imgData.data[i * 4 + 2] *= rgba[2] / 255;
				imgData.data[i * 4 + 3] *= rgba[3] / 255;
			}
			return imgData;
		}
	}
}
//必要组件
let isPlaying = 0;
let stopPlaying;
//存放谱面默认信息
//let songName // = "CROSS†SOUL"; //"SpasModic(Haocore Mix)";
let level // = "IN  Lv.15"; //"SP  Lv.?";
let combo = 0; //实时连击次数
let score = "0000000"; //实时分数
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
let start = Date.now();
let fps = 0;
let tick = 0;
let curTime = 0;
let curTimestamp = 0;
let duration = 0;
let chart, backgroundMusic, backgroundImage; //存放谱面
let timeOfMulti = {}; //存放多押时间
//加载文件
function loadFile(file) {
	const reader = new FileReader();
	reader.readAsArrayBuffer(file);
	reader.onprogress = progress => { //显示加载文件进度
		const size = file.size;
		out.className = "accept";
		out.innerText = `加载文件：${Math.floor(progress.loaded / size * 100)}%`;
	};
	reader.onload = async function() {
		wipeData();
		//加载zip(https://gildas-lormeau.github.io/zip.js)
		const reader = new zip.ZipReader(new zip.Uint8ArrayReader(new Uint8Array(this.result)));
		reader.getEntries().then(async zipData => {
			console.log(zipData);
			let loadedNum = 0;
			const zipRaw = await Promise.all(zipData.map(i => new Promise(resolve => {
				if (/\.(png|jpeg|jpg)$/i.test(i.filename)) {
					return i.getData(new zip.BlobWriter()).then(async data => {
						const imageData = await createImageBitmap(data);
						const option = document.createElement("option");
						option.innerHTML = i.filename;
						option.value = bgs.push(imageData) - 1;
						selectbg.appendChild(option);
						loading(++loadedNum);
						resolve(imageData);
					});
				} else if (/\.(mp3|wav|ogg)$/i.test(i.filename)) {
					return i.getData(new zip.Uint8ArrayWriter()).then(async data => {
						const audioData = await actx.decodeAudioData(data.buffer);
						const option = document.createElement("option");
						option.innerHTML = i.filename;
						option.value = bgms.push(audioData) - 1;
						selectbgm.appendChild(option);
						loading(++loadedNum);
						resolve(audioData);
					});
				} else if (/\.(json)$/i.test(i.filename)) {
					return i.getData(new zip.TextWriter()).then(async data => {
						const jsonData = await JSON.parse(data);
						const option = document.createElement("option");
						option.innerHTML = i.filename;
						option.value = charts.push(jsonData) - 1;
						selectchart.appendChild(option);
						loading(++loadedNum);
						resolve(jsonData);
					});
				}
				console.log(done);
			})));

			function loading(num) {
				out.className = "accept";
				out.innerText = `读取文件：${Math.floor(num/zipData.length * 100)}%`;
				if (num == zipData.length) {
					if (charts.length == 0) {
						out.className = "error";
						out.innerText = "未找到json！"; //test
					} else select.classList.remove("disabled");
				}
			}
			console.log(zipRaw);
		});
		reader.close();
	}
}
//清除原有数据(仍有bug不建议使用)
function wipeData() {
	start = Date.now();
	fps = 0;
	tick = 0;
	curTime = 0;
	curTimestamp = 0;
	duration = 0;
	timeOfMulti = {};
	if (stopPlaying) stopPlaying(); //test
	combo = 0;
	score = "0000000";
}
//play
function playChart() {
	wipeData();
	chart = JSON.parse(JSON.stringify(charts[selectchart.value]));
	backgroundImage = bgs[selectbg.value];
	backgroundMusic = bgms[selectbgm.value];
	stage.classList.remove("hide");
	//note预处理(双押提示)
	for (const i of chart.judgeLineList) {
		for (const j of i.notesAbove) timeOfMulti[j.time] = timeOfMulti[j.time] ? 2 : 1;
		for (const j of i.notesBelow) timeOfMulti[j.time] = timeOfMulti[j.time] ? 2 : 1;
	}
	for (const i of chart.judgeLineList) {
		for (const j of i.notesAbove) j.isMulti = (timeOfMulti[j.time] == 2);
		for (const j of i.notesBelow) j.isMulti = (timeOfMulti[j.time] == 2);
	}
	for (const i of chart.judgeLineList) {
		i.notesTapAbove = [];
		i.notesDragAbove = [];
		i.notesHoldAbove = [];
		i.notesFlickAbove = [];
		for (const j of i.notesAbove) {
			switch (j.type) {
				case 1:
					i.notesTapAbove.push(j);
					break;
				case 2:
					i.notesDragAbove.push(j);
					break;
				case 3:
					i.notesHoldAbove.push(j);
					break;
				case 4:
					i.notesFlickAbove.push(j);
					break;
				default:
					throw "Excepted Unknown NoteAbove"
			}
		}
		i.notesTapBelow = [];
		i.notesDragBelow = [];
		i.notesHoldBelow = [];
		i.notesFlickBelow = [];
		for (const j of i.notesBelow) {
			switch (j.type) {
				case 1:
					i.notesTapBelow.push(j);
					break;
				case 2:
					i.notesDragBelow.push(j);
					break;
				case 3:
					i.notesHoldBelow.push(j);
					break;
				case 4:
					i.notesFlickBelow.push(j);
					break;
				default:
					throw "Excepted Unknown NoteBelow"
			}
		}
	}
	console.log(chart);
	resizeImagebg();
	loadBgm();
}
//调整背景图尺寸
function resizeImagebg() {
	if (backgroundImage.width > backgroundImage.height * aspectRatio) {
		sx = (backgroundImage.width - backgroundImage.height * aspectRatio) / 2;
		sy = 0;
		sw = backgroundImage.height * aspectRatio;
		sh = backgroundImage.height;
	} else {
		sx = 0;
		sy = (backgroundImage.height - backgroundImage.width / aspectRatio) / 2;
		sw = backgroundImage.width;
		sh = backgroundImage.width / aspectRatio;
	}
}

//加载bgm
function loadBgm() {
	for (const i of chart.judgeLineList) lines.push(new line(0, 0, 0, 0, i.bpm));
	duration = backgroundMusic.duration;
	playBgm(backgroundMusic);
	stage.classList.remove("disabled");
	draw(++isPlaying);
	//for (const i of chart.judgeLineList) console.log(i); //test);, 
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
	stopPlaying = () => bufferSource.stop();
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
//作图
function draw(idPlaying) {
	const timeRaw = (Date.now() - curTimestamp) / 1e3 + curTime;
	const time = Math.max(timeRaw - chart.offset, 0);
	//重置画面
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	//绘制背景
	ctxbg.drawImage(backgroundImage, sx, sy, sw, sh, dx2, dy2, dw2, dh2);
	ctx.drawImage(backgroundImage, sx, sy, sw, sh, dx1, dy1, dw1, dh1);
	//背景变暗
	ctx.fillStyle = "#000";
	ctx.globalAlpha = 0.6; //背景不透明度
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.globalAlpha = 1;
	//绘制判定线
	for (const i of lines) {
		ctx.globalAlpha = i.a;
		ctx.translate(wlen * (1 + i.x), hlen * (1 - i.y));
		ctx.rotate(-i.r * Math.PI / 180);
		ctx.drawImage(res.JudgeLineAP, -lineScale * 38.4, -lineScale * 0.06, lineScale * 76.8, lineScale * 0.12);
		ctx.globalAlpha = 1;
		ctx.resetTransform();
	}
	//遍历events
	chart.judgeLineList.forEach((val, idx) => {
		const i = lines[idx];
		const beat32 = time * val.bpm / 1.875;
		playNote(i, val.notesAbove, beat32);
		playNote(i, val.notesBelow, beat32);
		disappearLine(i, val.judgeLineDisappearEvents, beat32);
		moveLine(i, val.judgeLineMoveEvents, beat32);
		rotateLine(i, val.judgeLineRotateEvents, beat32);
		speedLine(i, val.speedEvents, beat32);
	});
	//绘制note
	chart.judgeLineList.forEach((val, idx) => {
		const i = lines[idx];
		const beat32 = time * val.bpm / 1.875;
		drawHoldNote(i, val.notesHoldAbove, beat32, 1);
		drawHoldNote(i, val.notesHoldBelow, beat32, -1);
	});
	chart.judgeLineList.forEach((val, idx) => {
		const i = lines[idx];
		const beat32 = time * val.bpm / 1.875;
		drawDragNote(i, val.notesDragAbove, beat32, 1);
		drawDragNote(i, val.notesDragBelow, beat32, -1);
	});
	chart.judgeLineList.forEach((val, idx) => {
		const i = lines[idx];
		const beat32 = time * val.bpm / 1.875;
		drawTapNote(i, val.notesTapAbove, beat32, 1);
		drawTapNote(i, val.notesTapBelow, beat32, -1);
	});
	chart.judgeLineList.forEach((val, idx) => {
		const i = lines[idx];
		const beat32 = time * val.bpm / 1.875;
		drawFlickNote(i, val.notesFlickAbove, beat32, 1);
		drawFlickNote(i, val.notesFlickBelow, beat32, -1);
	});
	//绘制控制点
	if (document.getElementById("showPoint").checked) {
		lines.forEach((i, val) => {
			ctx.translate(wlen * (1 + i.x), hlen * (1 - i.y));
			ctx.rotate(-i.r * Math.PI / 180);
			ctx.fillStyle = "lime";
			ctx.fillRect(-5, -5, 10, 10);
			ctx.fillStyle = "yellow";
			ctx.textAlign = "center";
			ctx.textBaseline = "bottom";
			ctx.fillText(val, 0, 0);
			ctx.resetTransform();
		});
	}
	//绘制打击特效
	for (const i of clickEvents) {
		const tick = i.time / 30;
		ctx.translate(i.x, i.y);
		ctx.scale(noteScale * 6, noteScale * 6); //缩放
		ctx.drawImage(res[`clickPerfect${[(i.time++).toFixed(0)]}`], -128, -128); //停留约0.5秒
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
		if (clickEvents[i].time >= 30) clickEvents.splice(i--, 1);
	}
	//绘制进度条
	ctx.scale(canvas.width / 1920, canvas.width / 1920);
	ctx.drawImage(res.ProgressBar, Math.min(timeRaw / duration - 1, 0) * 1920, 0);
	ctx.resetTransform();
	//显示文字（时刻）
	ctx.fillStyle = "#fff";
	if (++tick % 10 == 0) {
		fps = Math.round(1e4 / (Date.now() - start));
		start = Date.now();
	}
	ctx.textBaseline = "top";
	ctx.font = `${lineScale*0.4}px Exo`;
	ctx.textAlign = "left";
	ctx.fillText(`${time2Str(Math.min(timeRaw,duration))}/${time2Str(duration)}`, 0, lineScale * 0.3);
	ctx.textAlign = "right";
	ctx.fillText(`${fps}`, canvas.width, lineScale * 0.3);
	//
	const padding = lineScale * 0.9;
	ctx.textBaseline = "alphabetic";
	ctx.font = `${lineScale}px Exo`;
	ctx.textAlign = "right";
	ctx.fillText(`${score}`, canvas.width - padding, lineScale * 1.5);
	ctx.font = `${lineScale*0.75}px Exo`;
	ctx.fillText(document.getElementById("songLevel").value || "SP  Lv.?", canvas.width - padding, canvas.height - padding);
	ctx.drawImage(res.SongsNameBar, padding, canvas.height - padding - lineScale * 0.6, lineScale * 0.14, lineScale * 0.72);
	ctx.textAlign = "left";
	ctx.fillText(document.getElementById("songName").value || "songName", padding + lineScale * 0.45, canvas.height - padding);
	if (combo > 2) {
		ctx.textAlign = "center";
		ctx.font = `${lineScale*1.5}px Exo`;
		ctx.fillText(`${combo}`, wlen, lineScale * 1.5);
		ctx.textBaseline = "top";
		ctx.font = `${lineScale*0.75}px Exo`;
		ctx.fillText(`combo`, wlen, lineScale * 1.6);
	}
	if (idPlaying == isPlaying) requestAnimationFrame(() => draw(idPlaying));
}
//判定线定义
const lines = []; //存放判定线
const lineEvents = []; //存放判定线事件
class line {
	constructor(x, y, rotation, alpha, bpm) {
		this.x = x;
		this.y = y;
		this.r = rotation;
		this.a = alpha;
		this.bpm = bpm;
	}
}
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
	const sx = wlen * (1 + line.x);
	const sy = hlen * (1 - line.y);
	const r = line.r / 180 * Math.PI;
	for (const i of notes) {
		if (i.time > time) break;
		if (!i.played) {
			if (document.getElementById("hitSong").checked) {
				const bufferSource = actx.createBufferSource();
				bufferSource.buffer = res[type2idx(i.type)];
				bufferSource.connect(actx.destination);
				bufferSource.start();
			}
			const d = wlen * i.positionX / 9;
			clickEvents.push(new clickEvent(sx + d * Math.cos(r), sy - d * Math.sin(r)));
			setTimeout(() => score = (Array(7).join(0) + (1e6 / chart.numOfNotes * (++combo)).toFixed(0)).slice(-7), i.holdTime / line.bpm * 1875); //test
			i.played = true;
		}
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
//绘制蓝键
function drawTapNote(line, notes, time, num) {
	for (const i of notes) {
		if (i.time < time) continue;
		if (i.floorPosition - line.positionY < -1e-3 && !i.played) continue;
		ctx.translate(wlen * (1 + line.x), hlen * (1 - line.y));
		ctx.rotate(((num - 1) / 2 - line.r / 180) * Math.PI);
		ctx.translate(wlen * i.positionX / 9 * num, -hlen * (i.floorPosition - line.positionY) * i.speed);
		ctx.scale(noteScale, noteScale); //缩放
		if (i.isMulti && document.getElementById("highLight").checked) ctx.drawImage(res.TapHL, -544.5, -100);
		else ctx.drawImage(res.Tap, -494.5, -50);
		ctx.resetTransform();
	}
}
//绘制黄键
function drawDragNote(line, notes, time, num) {
	for (const i of notes) {
		if (i.time < time) continue;
		if (i.floorPosition - line.positionY < -1e-3 && !i.played) continue;
		ctx.translate(wlen * (1 + line.x), hlen * (1 - line.y));
		ctx.rotate(((num - 1) / 2 - line.r / 180) * Math.PI);
		ctx.translate(wlen * i.positionX / 9 * num, -hlen * (i.floorPosition - line.positionY) * i.speed);
		ctx.scale(noteScale, noteScale); //缩放
		if (i.isMulti && document.getElementById("highLight").checked) ctx.drawImage(res.DragHL, -544.5, -80);
		else ctx.drawImage(res.Drag, -494.5, -30);
		ctx.resetTransform();
	}
}
//绘制长条
function drawHoldNote(line, notes, time, num) {
	const sx = wlen * (1 + line.x);
	const sy = hlen * (1 - line.y);
	const r = line.r / 180 * Math.PI;
	for (const i of notes) {
		if (i.time + i.holdTime < time) continue;
		if (i.floorPosition - line.positionY < -1e-3 && !i.played) continue;
		ctx.translate(sx, sy);
		ctx.rotate((num - 1) * Math.PI / 2 - r);
		ctx.translate(wlen * i.positionX / 9 * num, -hlen * (i.floorPosition - line.positionY));
		ctx.scale(noteScale, noteScale); //缩放
		const baseLength = hlen / line.bpm * 1.875 / noteScale * i.speed;
		const holdLength = baseLength * i.holdTime;
		if (i.time > time) {
			ctx.drawImage(res.HoldHead, -494.5, 0);
			ctx.drawImage(res.Hold, -494.5, -holdLength, 989, holdLength);
			ctx.drawImage(res.HoldEnd, -494.5, -holdLength - 50);
		} else {
			ctx.drawImage(res.HoldEnd, -494.5, -holdLength - 50);
			ctx.drawImage(res.Hold, -494.5, -holdLength, 989, baseLength * (i.holdTime + i.time - time));
			//绘制持续打击动画
			i.playing = i.playing ? i.playing + 1 : 1;
			if (i.playing % 12 == 0) {
				const d = wlen * i.positionX / 9;
				clickEvents.push(new clickEvent(sx + d * Math.cos(r), sy - d * Math.sin(r)));
			}
		}
		ctx.resetTransform();
	}
}
//绘制粉键
function drawFlickNote(line, notes, time, num) {
	for (const i of notes) {
		if (i.time < time) continue;
		if (i.floorPosition - line.positionY < -1e-3 && !i.played) continue;
		ctx.translate(wlen * (1 + line.x), hlen * (1 - line.y));
		ctx.rotate(((num - 1) / 2 - line.r / 180) * Math.PI);
		ctx.translate(wlen * i.positionX / 9 * num, -hlen * (i.floorPosition - line.positionY) * i.speed);
		ctx.scale(noteScale, noteScale); //缩放
		if (i.isMulti && document.getElementById("highLight").checked) ctx.drawImage(res.FlickHL, -544.5, -150);
		else ctx.drawImage(res.Flick, -494.5, -100);
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
				if (time > i.endTime) y += (i.endTime - Math.max(i.startTime, 0)) * i.value;
				else line.positionY = (y + (time - Math.max(i.startTime, 0)) * i.value) / line.bpm * 1.875;
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