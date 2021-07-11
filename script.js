"use strict";
const _i = ['Phigros模拟器', [1, 3], 1611795955, 1625997579];
//document.oncontextmenu = e => e.returnValue = false;
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
	backgroundImage = bgs[selectbg.value];
	resizeCanvas();
}
const selectbgm = document.getElementById("select-bgm");
const selectchart = document.getElementById("select-chart");
const selectscaleratio = document.getElementById("select-scale-ratio"); //数值越大note越小
const selectaspectratio = document.getElementById("select-aspect-ratio");
const selectglobalalpha = document.getElementById("select-global-alpha");
selectchart.addEventListener("change", qwqInfo);
//自动填写歌曲信息
function qwqInfo() {
	for (const i of chartInfoData) {
		if (selectchart.value == i[0]) {
			if (bgms[i[1]]) selectbgm.value = i[1];
			if (bgs[i[2]]) selectbg.value = i[2];
			if (!!Number(i[3])) selectaspectratio.value = i[3];
			if (!!Number(i[4])) selectscaleratio.value = i[4];
			if (!!Number(i[5])) selectglobalalpha.value = i[5];
			inputName.value = i[6];
			inputLevel.value = i[7];
			inputIllustrator.value = i[8];
			inputDesigner.value = i[9];
		}
	}
}
//
const inputName = document.getElementById("input-name");
const inputLevel = document.getElementById("input-level");
const inputDesigner = document.getElementById("input-designer");
const inputIllustrator = document.getElementById("input-illustrator");
const showTransition = document.getElementById("showTransition");
const bgs = {};
const bgms = {};
const charts = {};
const chartLineData = [];
const chartInfoData = [];
const canvas = document.getElementById("canvas");
const canvasbg = document.getElementById("canvas-bg");
//调节画面尺寸和全屏相关
const qwqSize = (sw, sh, dw, dh) => (dw * sh > dh * sw) ? [0, (dh - dw * sh / sw) / 2, dw, dw * sh / sw] : [(dw - dh * sw / sh) / 2, 0, dh * sw / sh, dh];
const aspectRatio = 16 / 9;
let wlen, hlen, noteScale, lineScale; //背景图相关
let chart, backgroundMusic, backgroundImage; //存放谱面
canvas.style.cssText = `max-width:calc(100vh*${aspectRatio});`;
resizeCanvas();
window.addEventListener("resize", resizeCanvas);
selectscaleratio.addEventListener("change", resizeCanvas);
selectaspectratio.addEventListener("change", resizeCanvas);
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
		canvas.height = canvas.width / selectaspectratio.value;
	}
	wlen = canvas.width / 2;
	hlen = canvas.height / 2;
	noteScale = canvas.width / Number(selectscaleratio.value); //note、特效缩放
	lineScale = canvas.width > canvas.height * 0.75 ? canvas.height / 18.75 : canvas.width / 14.0625; //判定线、文字缩放
}
//qwq[water,demo,democlick,fakenotepec]
const qwq = [true, false, 3, false];
document.querySelector(".title").onclick = () => {
	if (qwq[1]) qwq[0] = !qwq[0];
	else if (!--qwq[2]) document.getElementById("demo").classList.remove("hide");
}
document.getElementById("demo").onclick = function() {
	document.getElementById("demo").classList.add("hide");
	uploads.classList.add("disabled");
	const xhr = new XMLHttpRequest();
	xhr.open("get", "./src/demo.png", true); //避免gitee的404
	xhr.responseType = 'blob';
	xhr.send();
	xhr.onprogress = progress => { //显示加载文件进度
		out.className = "accept";
		out.innerText = `加载文件：${Math.floor(progress.loaded / 6331586 * 100)}%`;
	};
	xhr.onload = () => {
		document.getElementById("filename").value = "demo.zip";
		loadFile(xhr.response);
	};
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
		for (let i = 0; i < 4; i++) this.rand.push([Math.random() * 75 + 225, Math.random() * 2 * Math.PI]);
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
		let qwqNum = 0;
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
			0: "src/HitSong0.ogg",
			1: "src/HitSong1.ogg",
			2: "src/HitSong2.ogg"
		}).map(([name, src], _i, arr) => new Promise(resolve => {
			const xhr = new XMLHttpRequest();
			xhr.open("get", src, true);
			if (/\.(png|jpeg|jpg)$/i.test(src)) {
				xhr.responseType = 'blob';
				xhr.send();
				xhr.onload = async () => {
					res[name] = await createImageBitmap(xhr.response);
					out.className = "accept";
					out.innerText = `加载资源：${Math.floor(++qwqNum / arr.length * 100)}%`;
					resolve();
				};
			} else if (/\.(mp3|wav|ogg)$/i.test(src)) {
				xhr.responseType = 'arraybuffer';
				xhr.send();
				xhr.onload = async () => {
					res[name] = await actx.decodeAudioData(xhr.response);
					out.className = "accept";
					out.innerText = `加载资源：${Math.floor(++qwqNum / arr.length * 100)}%`;
					resolve();
				};
			}
		})));
		//加载打击动画
		const clickPerfect = imgShader(res.clickRaw, "#fce491");
		const clickGood = imgShader(res.clickRaw, "#9ed5f3");
		res.JudgeLineAP = await createImageBitmap(imgShader(res.JudgeLine, "#feffa9"));
		res.JudgeLineFC = await createImageBitmap(imgShader(res.JudgeLine, "#a2eeff"));
		for (let i = 0; i < 30; i++) {
			res[`clickPerfect${i}`] = await createImageBitmap(clickPerfect, 0, i * 256, 256, 256);
			res[`clickGood${i}`] = await createImageBitmap(clickGood, 0, i * 256, 256, 256);
		}
		out.innerText = "等待上传文件...";
		upload.parentElement.classList.remove("disabled");
	}
}
//必要组件
let stopPlaying, stopDrawing;
//存放谱面默认信息
//let songName // = "CROSS†SOUL"; //"SpasModic(Haocore Mix)";
//let level // = "IN  Lv.15"; //"SP  Lv.?";
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
let fpsStart = Date.now();
let fps = 0;
let fpsTick = 0;
let tickIn = 0;
let tickOut = 0;
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
				//const fName = i.filename.replace(/.*\//, "");
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
							const jsonData = await prerenderChart(chart123(JSON.parse(data)));
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
						//test
						const jsonData = await prerenderChart(chart123(chartp23(data)));
						//chartPec(data);
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
						const chartLine = csv2array(data);
						chartLineData.push(...chartLine);
						loading(++loadedNum);
						resolve(chartLine);
					});
				} else if (i.filename == "info.csv") {
					return i.getData(new zip.TextWriter()).then(async data => {
						const chartInfo = csv2array(data);
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
						out.innerText = "未找到json！"; //test
					} else {
						select.classList.remove("disabled");
						btnPause.classList.add("disabled");
						qwqInfo();
					}
				}
			}
			console.log(zipRaw);
		});
		reader.close();
	}
}
//note预处理
function prerenderChart(chart) {
	let chartNew = JSON.parse(JSON.stringify(chart));
	//(双押提示)
	const timeOfMulti = {};
	for (const i of chartNew.judgeLineList) {
		for (const j of i.notesAbove) timeOfMulti[j.time] = timeOfMulti[j.time] ? 2 : 1;
		for (const j of i.notesBelow) timeOfMulti[j.time] = timeOfMulti[j.time] ? 2 : 1;
	}
	for (const i of chartNew.judgeLineList) {
		for (const j of i.notesAbove) j.isMulti = (timeOfMulti[j.time] == 2);
		for (const j of i.notesBelow) j.isMulti = (timeOfMulti[j.time] == 2);
	}
	for (const i of chartNew.judgeLineList) {
		i.notesTapAbove = [];
		i.notesDragAbove = [];
		i.notesHoldAbove = [];
		i.notesFlickAbove = [];
		for (const j of i.notesAbove.sort((a, b) => a.time - b.time)) {
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
					throw "Excepted Unknown NoteAbove";
			}
		}
		i.notesTapBelow = [];
		i.notesDragBelow = [];
		i.notesHoldBelow = [];
		i.notesFlickBelow = [];
		for (const j of i.notesBelow.sort((a, b) => a.time - b.time)) {
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
					throw "Excepted Unknown NoteBelow";
			}
		}
	}
	return chartNew;
}

document.addEventListener("visibilitychange", () => {
	if (document.visibilityState == "hidden" && btnPause.value == "暂停") btnPause.click();
});
//play
btnPlay.onclick = async function() {
	btnPause.value = "暂停";
	if (this.value == "播放") {
		chart = JSON.parse(JSON.stringify(charts[selectchart.value])); //fuck
		for (const i of chartLineData) {
			if (selectchart.value == i[0]) {
				chart.judgeLineList[i[1]].image = await createImageBitmap(imgShader(bgs[i[2]], "#feffa9"));
				chart.judgeLineList[i[1]].imageH = Number(i[3]);
				chart.judgeLineList[i[1]].imageW = Number(i[4]);
				chart.judgeLineList[i[1]].imageB = Number(i[5]);
			}
		}
		backgroundImage = bgs[selectbg.value];
		backgroundMusic = bgms[selectbgm.value];
		stage.classList.remove("disabled");
		this.value = "停止";
		resizeCanvas(); //(backgroundImage, selectaspectratio.value);
		lines.length = 0;
		for (const i of chart.judgeLineList) lines.push(new line(0, 0, 0, 0, i.bpm, i.image || res.JudgeLineAP, i.imageH, i.imageW, i.imageB));
		loadBgm();
		fps = 0;
		fpsTick = 0;
		fpsStart = Date.now();
		draw();
	} else {
		cancelAnimationFrame(stopDrawing);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctxbg.clearRect(0, 0, canvasbg.width, canvasbg.height);
		stage.classList.add("disabled");
		showTransition.nextElementSibling.classList.remove("disabled");
		btnPause.classList.add("disabled");
		this.value = "播放";
		//清除原有数据
		clickEvents.length = 0;
		if (stopPlaying) stopPlaying(); //test
		tickIn = 0;
		tickOut = 0;
		curTime = 0;
		curTimestamp = 0;
		duration = 0;
		combo = 0;
		score = "0000000";
	}
}
btnPause.onclick = function() {
	if (this.classList.contains("disabled") || btnPlay.value == "播放") return;
	if (this.value == "暂停") {
		isPaused = true;
		this.value = "继续";
		curTime = timeBgm;
		if (stopPlaying) stopPlaying(); //test
	} else {
		isPaused = false;
		if (isInEnd && !isOutStart) playBgm(backgroundMusic, timeBgm);
		this.value = "暂停";
	}
}
//加载bgm
function loadBgm() {
	duration = backgroundMusic.duration;
	isInEnd = false;
	isOutStart = false;
	isPaused = false;
	timeBgm = 0;
	if (!showTransition.checked) tickIn = 180;
	//playBgm(backgroundMusic);
	stage.classList.remove("disabled");
	btnPause.classList.remove("disabled");
	showTransition.nextElementSibling.classList.add("disabled");
	//for (const i of chart.judgeLineList) console.log(i); //test);, 
}
//播放bgm
function playBgm(data, offset) {
	isPaused = false;
	if (!offset) offset = 0;
	curTimestamp = Date.now();
	const bufferSource = actx.createBufferSource();
	bufferSource.buffer = data;
	//bufferSource.loop = true; //循环播放
	bufferSource.connect(actx.destination);
	bufferSource.start(0, offset);
	stopPlaying = () => bufferSource.stop();
}
//作图
function draw() {
	if (!isPaused) {
		if (tickIn <= 180 && tickIn++ == 180) {
			isInEnd = true;
			playBgm(backgroundMusic);
		}
		if (isInEnd && !isOutStart) timeBgm = (Date.now() - curTimestamp) / 1e3 + curTime;
		if (timeBgm >= duration) isOutStart = true;
		if (showTransition.checked && isOutStart && tickOut <= 40 && tickOut++ == 40);
	}
	timeChart = Math.max(timeBgm - chart.offset, 0);
	//重置画面
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	//遍历events
	chart.judgeLineList.forEach((val, idx) => {
		const i = lines[idx];
		const beat32 = timeChart * val.bpm / 1.875;
		playNote(i, val.notesAbove, beat32);
		playNote(i, val.notesBelow, beat32);
		disappearLine(i, val.judgeLineDisappearEvents, beat32);
		moveLine(i, val.judgeLineMoveEvents, beat32);
		rotateLine(i, val.judgeLineRotateEvents, beat32);
		speedLine(i, val.speedEvents, beat32);
	});
	//绘制note
	if (tickIn >= 180 && tickOut == 0) {
		chart.judgeLineList.forEach((val, idx) => {
			const beat32 = timeChart * val.bpm / 1.875;
			drawHoldNote(idx, val.notesHoldAbove, beat32, 1);
			drawHoldNote(idx, val.notesHoldBelow, beat32, -1);
		});
		chart.judgeLineList.forEach((val, idx) => {
			const beat32 = timeChart * val.bpm / 1.875;
			drawDragNote(idx, val.notesDragAbove, beat32, 1);
			drawDragNote(idx, val.notesDragBelow, beat32, -1);
		});
		chart.judgeLineList.forEach((val, idx) => {
			const beat32 = timeChart * val.bpm / 1.875;
			drawTapNote(idx, val.notesTapAbove, beat32, 1);
			drawTapNote(idx, val.notesTapBelow, beat32, -1);
		});
		chart.judgeLineList.forEach((val, idx) => {
			const beat32 = timeChart * val.bpm / 1.875;
			drawFlickNote(idx, val.notesFlickAbove, beat32, 1);
			drawFlickNote(idx, val.notesFlickBelow, beat32, -1);
		});
	}
	//绘制定位点
	if (document.getElementById("showPoint").checked) {
		lines.forEach((i, val) => {
			ctx.translate(wlen * (1 + i.x), hlen * (1 - i.y));
			ctx.rotate(-i.r * Math.PI / 180);
			drawPoint(val, (i.a + 0.5) / 1.5, "yellow", "violet");
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
			ctx.globalAlpha = 1 - tick; //不透明度
			ctx.fillStyle = "#fce491";
			const r3 = tween[20](tick) * 15 + 15; //方块大小
			const ds = tween[18](tick) * j[0]; //打击点距离
			ctx.fillRect(ds * Math.cos(j[1]) - r3 / 2, ds * Math.sin(j[1]) - r3 / 2, r3, r3);
			ctx.globalAlpha = 1;
		}
		ctx.resetTransform();
	}
	for (let i = 0; i < clickEvents.length; i++) {
		if (clickEvents[i].time >= 30) clickEvents.splice(i--, 1);
	}
	//绘制背景
	ctx.globalCompositeOperation = "destination-over";
	if (tickIn >= 150) drawLine(2); //绘制判定线(背景前1)
	ctx.fillStyle = "#000"; //背景变暗
	ctx.globalAlpha = selectglobalalpha.value; //背景不透明度
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.globalAlpha = 1;
	//if (tickIn >= 150)drawLine(0);//绘制判定线(背景后0)
	ctx.drawImage(backgroundImage, ...qwqSize(backgroundImage.width, backgroundImage.height, canvas.width, canvas.height));
	ctxbg.drawImage(backgroundImage, ...qwqSize(backgroundImage.width, backgroundImage.height, canvasbg.width, canvasbg.height));
	ctx.globalCompositeOperation = "source-over";
	//绘制进度条
	if (tickIn < 40) ctx.translate(0, lineScale * ((tween[2](tickIn / 40) * 1.75 - 1.75)));
	else ctx.translate(0, lineScale * (-tween[2](tickOut / 40) * 1.75));
	ctx.scale(canvas.width / 1920, canvas.width / 1920);
	ctx.drawImage(res.ProgressBar, timeBgm / duration * 1920 - 1920, 0);
	ctx.resetTransform();
	//绘制文字
	const name = inputName.value || inputName.placeholder;
	const level = inputLevel.value || inputLevel.placeholder;
	const designer = inputDesigner.value || inputDesigner.placeholder;
	const illustrator = inputIllustrator.value || inputIllustrator.placeholder;
	ctx.fillStyle = "#fff";
	const padding = lineScale * 0.65;
	//开头过渡动画//以后加入tickOut
	if (tickIn < 180) {
		ctx.textBaseline = "alphabetic";
		ctx.textAlign = "center";
		if (tickIn < 40) ctx.globalAlpha = tween[2](tickIn / 40);
		else if (tickIn >= 150) ctx.globalAlpha = tween[2]((180 - tickIn) / 30);
		//歌名
		ctx.font = `${lineScale*1.1}px Exo`;
		ctx.fillText(name, wlen, hlen * 0.75);
		ctx.textBaseline = "top";
		//曲绘和谱师
		ctx.font = `${lineScale*0.55}px Exo`;
		ctx.fillText(`Illustration designed by ${illustrator}`, wlen, hlen * 1.25 + lineScale * 0.15);
		ctx.fillText(`Level designed by ${designer}`, wlen, hlen * 1.25 + lineScale * 1.0);
		ctx.globalAlpha = 1;
		//判定线(装饰用)
		ctx.translate(wlen, hlen);
		const imgW = lineScale * 48 * (tickIn < 40 ? tween[3](tickIn / 40) : 1);
		const imgH = lineScale * 0.15;
		if (tickIn >= 150) ctx.globalAlpha = tween[2]((180 - tickIn) / 30);
		ctx.drawImage(res.JudgeLineAP, -imgW / 2, -imgH / 2, imgW, imgH);
		ctx.globalAlpha = 1;
		ctx.resetTransform();
	}
	//绘制分数和combo
	if (tickIn < 40) ctx.translate(0, lineScale * ((tween[2](tickIn / 40) * 1.75 - 1.75)));
	else ctx.translate(0, lineScale * (-tween[2](tickOut / 40) * 1.75));
	ctx.textBaseline = "alphabetic";
	ctx.font = `${lineScale*0.95}px Exo`;
	ctx.textAlign = "right";
	ctx.fillText(`${score}`, canvas.width - lineScale * 0.65, lineScale * 1.35);
	if (combo > 2) {
		ctx.textAlign = "center";
		ctx.font = `${lineScale*1.3}px Exo`;
		ctx.fillText(combo, wlen, lineScale * 1.35);
		if (tickIn < 40) ctx.globalAlpha = tween[2](tickIn / 40);
		else ctx.globalAlpha = 1 - tween[2](tickOut / 40);
		ctx.textBaseline = "top";
		ctx.font = `${lineScale*0.65}px Exo`;
		ctx.fillText(`combo`, wlen, lineScale * 1.50);
		ctx.globalAlpha = 1;
	}
	ctx.resetTransform();
	//绘制歌名和等级
	if (tickIn < 40) ctx.translate(0, lineScale * ((1.75 - tween[2](tickIn / 40) * 1.75)));
	else ctx.translate(0, lineScale * (tween[2](tickOut / 40) * 1.75));
	ctx.textBaseline = "alphabetic";
	ctx.textAlign = "right";
	ctx.font = `${lineScale*0.65}px Exo`;
	ctx.fillText(level, canvas.width - lineScale * 0.75, canvas.height - lineScale * 0.65);
	ctx.drawImage(res.SongsNameBar, lineScale * 0.53, canvas.height - lineScale * 1.22, lineScale * 0.119, lineScale * 0.612);
	ctx.textAlign = "left";
	ctx.font = `${lineScale*0.62}px Exo`;
	ctx.fillText(name, padding + lineScale * 0.2, canvas.height - lineScale * 0.65);
	ctx.resetTransform();
	//计算fps
	if (!(++fpsTick % 10)) {
		fps = Math.round(1e4 / (Date.now() - fpsStart));
		fpsStart = Date.now();
	}
	if (qwq[0]) {
		if (tickIn < 40) ctx.globalAlpha = tween[2](tickIn / 40);
		else ctx.globalAlpha = 1 - tween[2](tickOut / 40);
		ctx.textBaseline = "top";
		ctx.font = `${lineScale*0.4}px Exo`;
		ctx.textAlign = "left";
		ctx.fillText(`${time2Str(timeBgm)}/${time2Str(duration)}`, 0, lineScale * 0.3);
		ctx.textAlign = "right";
		ctx.fillText(`${fps}`, canvas.width, lineScale * 0.3);
	}
	//Copyright
	ctx.font = `${lineScale*0.4}px Exo`;
	ctx.globalAlpha = 0.4;
	ctx.textAlign = "right";
	ctx.textBaseline = "bottom";
	ctx.fillText("Code by lch\zh3473", canvas.width - lineScale * 0.1, canvas.height - lineScale * 0.1);
	ctx.globalAlpha = 1;
	//回调更新动画
	stopDrawing = requestAnimationFrame(draw);
	//判定线函数，undefined/0:默认,1:非,2:恒成立
	function drawLine(bool) {
		for (const i of lines) {
			if (bool ^ i.imageB && tickOut < 40) {
				ctx.globalAlpha = i.a;
				ctx.translate(wlen, hlen);
				ctx.scale(1 - tween[2](tickOut / 40), 1); //hiahiah
				ctx.translate(wlen * i.x, -hlen * i.y);
				ctx.rotate(-i.r * Math.PI / 180);
				const imgH = i.imageH > 0 ? lineScale * 18.75 * i.imageH : canvas.height * -i.imageH; // hlen*0.008
				const imgW = imgH * i.image.width / i.image.height * i.imageW; //* 38.4*25 * i.imageH* i.imageW; //wlen*3
				ctx.drawImage(i.image, -imgW / 2, -imgH / 2, imgW, imgH);
				ctx.globalAlpha = 1;
				ctx.resetTransform();
			}
		}
	}
}
//判定线定义
const lines = []; //存放判定线
const lineEvents = []; //存放判定线事件
class line {
	constructor(x, y, rotation, alpha, bpm, image, imageH, imageW, imageB) {
		this.x = x;
		this.y = y;
		this.r = rotation;
		this.a = alpha;
		this.bpm = bpm;
		this.image = image; //fuck
		this.imageH = imageH || 0.008;
		this.imageW = imageW || 1.042;
		this.imageB = !!imageB;
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
//播放打击音效和判定得分
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
			i.played = true;
		} else if (!i.scored && i.time + i.holdTime - line.bpm / 1.875 * 0.2 < time) {
			score = (Array(7).join(0) + (1e6 / chart.numOfNotes * (++combo)).toFixed(0)).slice(-7);
			i.scored = true;
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
function drawTapNote(idx, notes, time, num) {
	let line = lines[idx];
	for (const i of notes) {
		if (i.time % 1e9 < time) continue;
		if (i.floorPosition - line.positionY < -1e-3 && !i.played && !qwq[3]) continue;
		ctx.translate(wlen * (1 + line.x), hlen * (1 - line.y));
		ctx.rotate(((num - 1) / 2 - line.r / 180) * Math.PI);
		ctx.translate(wlen * i.positionX / 9 * num, -hlen * (i.floorPosition - line.positionY) * i.speed * 1.2);
		ctx.scale(noteScale, noteScale); //缩放
		if (i.isMulti && document.getElementById("highLight").checked) ctx.drawImage(res.TapHL, -544.5, -100);
		else ctx.drawImage(res.Tap, -494.5, -50);
		ctx.resetTransform();
	}
	if (document.getElementById("showPoint").checked) {
		notes.forEach((i, val) => {
			ctx.translate(wlen * (1 + line.x), hlen * (1 - line.y));
			ctx.rotate(((num - 1) / 2 - line.r / 180) * Math.PI);
			ctx.translate(wlen * i.positionX / 9 * num, -hlen * (i.floorPosition - line.positionY) * i.speed * 1.2);
			drawPoint(`${idx}-${val}`, i.time > time ? 1 : 0.5, "cyan", "lime");
		});
	}
}
//绘制黄键
function drawDragNote(idx, notes, time, num) {
	let line = lines[idx];
	for (const i of notes) {
		if (i.time % 1e9 < time) continue;
		if (i.floorPosition - line.positionY < -1e-3 && !i.played && !qwq[3]) continue;
		ctx.translate(wlen * (1 + line.x), hlen * (1 - line.y));
		ctx.rotate(((num - 1) / 2 - line.r / 180) * Math.PI);
		ctx.translate(wlen * i.positionX / 9 * num, -hlen * (i.floorPosition - line.positionY) * i.speed * 1.2);
		ctx.scale(noteScale, noteScale); //缩放
		if (i.isMulti && document.getElementById("highLight").checked) ctx.drawImage(res.DragHL, -544.5, -80);
		else ctx.drawImage(res.Drag, -494.5, -30);
		ctx.resetTransform();
	}
	if (document.getElementById("showPoint").checked) {
		notes.forEach((i, val) => {
			ctx.translate(wlen * (1 + line.x), hlen * (1 - line.y));
			ctx.rotate(((num - 1) / 2 - line.r / 180) * Math.PI);
			ctx.translate(wlen * i.positionX / 9 * num, -hlen * (i.floorPosition - line.positionY) * i.speed * 1.2);
			drawPoint(`${idx}-${val}`, i.time > time ? 1 : 0.5, "cyan", "lime");
		});
	}
}
//绘制长条
function drawHoldNote(idx, notes, time, num) {
	let line = lines[idx];
	const sx = wlen * (1 + line.x);
	const sy = hlen * (1 - line.y);
	const r = line.r / 180 * Math.PI;
	for (const i of notes) {
		if (i.time % 1e9 + i.holdTime < time) continue;
		ctx.translate(sx, sy);
		ctx.rotate((num - 1) * Math.PI / 2 - r);
		if (i.playing) ctx.translate(wlen * i.positionX / 9 * num, hlen * (time - i.time) * i.speed / line.bpm * 1.875 * 1.2);
		else ctx.translate(wlen * i.positionX / 9 * num, -hlen * (i.floorPosition - line.positionY) * 1.2);
		ctx.scale(noteScale, noteScale); //缩放
		const baseLength = hlen / line.bpm * 1.875 / noteScale * i.speed * 1.2;
		const holdLength = baseLength * i.holdTime;
		if (i.time > time) {
			ctx.drawImage(res.HoldHead, -494.5, 0);
			ctx.drawImage(res.Hold, -494.5, -holdLength, 989, holdLength);
			ctx.drawImage(res.HoldEnd, -494.5, -holdLength - 50);
		} else {
			ctx.drawImage(res.Hold, -494.5, -holdLength, 989, holdLength - baseLength * (time - i.time));
			ctx.drawImage(res.HoldEnd, -494.5, -holdLength - 50);
			//绘制持续打击动画
			i.playing = i.playing ? i.playing + 1 : 1;
			if (i.playing % 9 == 0) {
				const d = wlen * i.positionX / 9;
				clickEvents.push(new clickEvent(sx + d * Math.cos(r), sy - d * Math.sin(r)));
			}
		}
		ctx.resetTransform();
	}
	if (document.getElementById("showPoint").checked) {
		notes.forEach((i, val) => {
			ctx.translate(wlen * (1 + line.x), hlen * (1 - line.y));
			ctx.rotate(((num - 1) / 2 - line.r / 180) * Math.PI);
			ctx.translate(wlen * i.positionX / 9 * num, -hlen * (i.floorPosition - line.positionY) * 1.2);
			drawPoint(`${idx}-${val}`, i.time > time ? 1 : 0.5, "cyan", "lime");
		});
	}
}
//绘制粉键
function drawFlickNote(idx, notes, time, num) {
	let line = lines[idx];
	for (const i of notes) {
		if (i.time % 1e9 < time) continue;
		if (i.floorPosition - line.positionY < -1e-3 && !i.played && !qwq[3]) continue;
		ctx.translate(wlen * (1 + line.x), hlen * (1 - line.y));
		ctx.rotate(((num - 1) / 2 - line.r / 180) * Math.PI);
		ctx.translate(wlen * i.positionX / 9 * num, -hlen * (i.floorPosition - line.positionY) * i.speed * 1.2);
		ctx.scale(noteScale, noteScale); //缩放
		if (i.isMulti && document.getElementById("highLight").checked) ctx.drawImage(res.FlickHL, -544.5, -150);
		else ctx.drawImage(res.Flick, -494.5, -100);
		ctx.resetTransform();
	}
	if (document.getElementById("showPoint").checked) {
		notes.forEach((i, val) => {
			ctx.translate(wlen * (1 + line.x), hlen * (1 - line.y));
			ctx.rotate(((num - 1) / 2 - line.r / 180) * Math.PI);
			ctx.translate(wlen * i.positionX / 9 * num, -hlen * (i.floorPosition - line.positionY) * i.speed * 1.2);
			drawPoint(`${idx}-${val}`, i.time > time ? 1 : 0.5, "cyan", "lime");
		});
	}
}
//绘制定位点
function drawPoint(str, alpha, colorS, colorP) {
	ctx.fillStyle = colorS;
	ctx.font = `${lineScale}px Exo`;
	ctx.textAlign = "center";
	ctx.textBaseline = "bottom";
	ctx.globalAlpha = alpha;
	ctx.fillText(str, 0, -lineScale * 0.1);
	ctx.globalAlpha = 1;
	ctx.fillStyle = colorP;
	ctx.fillRect(-lineScale * 0.2, -lineScale * 0.2, lineScale * 0.4, lineScale * 0.4);
	ctx.resetTransform();
}

function moveLine(line, judgeLineMoveEvents, time) {
	for (const i of judgeLineMoveEvents) {
		if (time < i.startTime) break;
		if (time > i.endTime) continue;
		const t2 = (time - i.startTime) / (i.endTime - i.startTime);
		const t1 = 1 - t2;
		line.x = (i.start * t1 + i.end * t2) * 2 - 1;
		line.y = (i.start2 * t1 + i.end2 * t2) * 2 - 1;
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
	for (const i of speedEvents) {
		if (time < i.startTime) break;
		if (time > i.endTime) continue;
		line.positionY = (time - i.startTime) * i.value / line.bpm * 1.875 + i.floorPosition;
	}
}
//test
function chart123(chart) {
	let oldchart = JSON.parse(JSON.stringify(chart)); //深拷贝
	switch (oldchart.formatVersion) { //beautify缩进bug加{}
		case 1: {
			oldchart.formatVersion = 3;
			for (const i of oldchart.judgeLineList) {
				let y = 0;
				for (const j of i.speedEvents) {
					if (j.startTime < 0) j.startTime = 0;
					j.floorPosition = y;
					y += (j.endTime - j.startTime) * j.value / i.bpm * 1.875;
				}
			}
			for (const i of oldchart.judgeLineList) {
				for (const j of i.judgeLineMoveEvents) {
					j.start2 = j.start % 1e3 / 520;
					j.end2 = j.end % 1e3 / 520;
					j.start = parseInt(j.start / 1e3) / 880;
					j.end = parseInt(j.end / 1e3) / 880;
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
	let rawChart = []; //test

	class Chart {
		constructor() {
			this.formatVersion = 3;
			this.offset = 0;
			this.numOfNotes = 0;
			this.judgeLineList = [];
		}
		setOffset(offset) {
			this.offset = offset;
			return offset;
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
			this.speedEvents = [];
			this.notesAbove = [];
			this.notesBelow = [];
			this.judgeLineDisappearEvents = [];
			this.judgeLineMoveEvents = [];
			this.judgeLineRotateEvents = [];
			this.judgeLineDisappearEventsPec = [];
			this.judgeLineMoveEventsPec = [];
			this.judgeLineRotateEventsPec = [];
		}
		addNote(note, pos, isFake) {
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
		addEvents(type, startTime, endTime, n1, n2, n3, n4) {
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
			this.speed = isNaN(speed) ? 1 : speed;
			this.floorPosition = time % 1e9 / 104 * 1.2;
		}
	}
	//test start
	rawChart = pec.split(/[ \n\r]+/).map(i => isNaN(i) ? String(i) : Number(i)); //必要性有待研究
	let qwqChart = new Chart();
	let raw = {};
	for (const i of ["bp", "n1", "n2", "n3", "n4", "cv", "cp", "cd", "ca", "cm", "cr", "cf"]) raw[i] = [];
	let rawarr = [];
	let fuckarr = [1, 1]; //n指令的#和&
	let rawstr = "";
	let baseBpm = 120;
	if (!isNaN(rawChart[0])) qwqChart.setOffset(rawChart.shift() / 1e3 - 0.15); //官方转谱似乎是0.14
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
	if (raw[rawstr]) raw[rawstr].push(JSON.parse(JSON.stringify(rawarr))); //补充最后一个(bug)

	//变速测试start
	baseBpm = raw.bp[0][1]; //即将移除
	let fuckBpm = 0;
	const bpmEvents = [];
	raw.bp.sort((a, b) => a[0] - b[0]).forEach((i, idx, arr) => {
		//if (i[0] < 0) i[0] = 0;
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
	//console.log(bpmEvents); //test

	function qwqBpm(time) {
		let qwq = 0;
		for (const i of bpmEvents) {
			if (time < i.startTime) break;
			if (time > i.endTime) continue;
			qwq = Math.round(((time - i.startTime) / i.bpm + i.value) * baseBpm * 32);
		}
		return qwq;
	}
	//变速测试end
	let qwqLines = [];
	for (const i of raw.n1) {
		if (!qwqLines[i[0]]) qwqLines[i[0]] = new JudgeLine(baseBpm);
		qwqLines[i[0]].addNote(new Note(1, qwqBpm(i[1]) + (i[4] ? 1e9 : 0), i[2] * 9 / 1024, 0, i[5]), i[3], i[4]);
	} //102.4
	for (const i of raw.n2) {
		if (!qwqLines[i[0]]) qwqLines[i[0]] = new JudgeLine(baseBpm);
		qwqLines[i[0]].addNote(new Note(3, qwqBpm(i[1]) + (i[5] ? 1e9 : 0), i[3] * 9 / 1024, qwqBpm(i[2]) - qwqBpm(i[1]), i[6]), i[4], i[5]);
	}

	for (const i of raw.n3) {
		if (!qwqLines[i[0]]) qwqLines[i[0]] = new JudgeLine(baseBpm);
		qwqLines[i[0]].addNote(new Note(4, qwqBpm(i[1]) + (i[4] ? 1e9 : 0), i[2] * 9 / 1024, 0, i[5]), i[3], i[4]);
	}
	for (const i of raw.n4) {
		if (!qwqLines[i[0]]) qwqLines[i[0]] = new JudgeLine(baseBpm);
		qwqLines[i[0]].addNote(new Note(2, qwqBpm(i[1]) + (i[4] ? 1e9 : 0), i[2] * 9 / 1024, 0, i[5]), i[3], i[4]);
	}
	//变速
	for (const i of raw.cv) {
		if (!qwqLines[i[0]]) qwqLines[i[0]] = new JudgeLine(baseBpm);
		qwqLines[i[0]].addEvents(0, qwqBpm(i[1]), null, i[2] / 7.0); //6.0??
	}
	//不透明度
	for (const i of raw.ca) {
		if (!qwqLines[i[0]]) qwqLines[i[0]] = new JudgeLine(baseBpm);
		qwqLines[i[0]].addEvents(-1, qwqBpm(i[1]), qwqBpm(i[1]), i[2] > 0 ? (i[2] + 1) / 256 : 0); //暂不支持alpha值扩展
	}
	for (const i of raw.cf) {
		if (!qwqLines[i[0]]) qwqLines[i[0]] = new JudgeLine(baseBpm);
		qwqLines[i[0]].addEvents(-1, qwqBpm(i[1]), qwqBpm(i[2]), i[3] > 0 ? (i[3] + 1) / 256 : 0);
	}
	//移动
	for (const i of raw.cp) {
		if (!qwqLines[i[0]]) qwqLines[i[0]] = new JudgeLine(baseBpm);
		qwqLines[i[0]].addEvents(-2, qwqBpm(i[1]), qwqBpm(i[1]), i[2] / 2048, i[3] / 1400, 1);
	}
	for (const i of raw.cm) {
		if (!qwqLines[i[0]]) qwqLines[i[0]] = new JudgeLine(baseBpm);
		qwqLines[i[0]].addEvents(-2, qwqBpm(i[1]), qwqBpm(i[2]), i[3] / 2048, i[4] / 1400, i[5]);
	}
	//旋转
	for (const i of raw.cd) {
		if (!qwqLines[i[0]]) qwqLines[i[0]] = new JudgeLine(baseBpm);
		qwqLines[i[0]].addEvents(-3, qwqBpm(i[1]), qwqBpm(i[1]), -i[2], 1); //??
	}
	for (const i of raw.cr) {
		if (!qwqLines[i[0]]) qwqLines[i[0]] = new JudgeLine(baseBpm);
		qwqLines[i[0]].addEvents(-3, qwqBpm(i[1]), qwqBpm(i[2]), -i[3], i[4]);
	}
	for (const i of qwqLines) {
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
				//if (s[j].startTime == s[j].endTime) s.splice(j--, 1);
				//
				if (s[j].startTime < 0) s[j].startTime = 0;
				s[j].floorPosition = y;
				y += (s[j].endTime - s[j].startTime) * s[j].value / i.bpm * 1.875;
				//
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
				i.addEvents(1, ldpTime, j.startTime, ldpValue, ldpValue);
				switch (j.motionType) {
					case 0:
						break;
					case 1:
						i.addEvents(1, j.startTime, j.endTime, ldpValue, j.value);
						break;
					default:
						if (!tween[j.motionType]) throw `Unexpected MotionType: ${j.motionType}`;
						for (let k = parseInt(j.startTime); k < parseInt(j.endTime); k++) {
							let ptt1 = (k - j.startTime) / (j.endTime - j.startTime);
							let ptt2 = (k + 1 - j.startTime) / (j.endTime - j.startTime);
							let pt1 = j.value - ldpValue;
							i.addEvents(1, k, k + 1, ldpValue + tween[j.motionType](ptt1) * pt1, ldpValue + tween[j.motionType](ptt2) * pt1);
						}
				}
				ldpTime = j.endTime;
				ldpValue = j.value;
			}
			i.addEvents(1, ldpTime, 1e9, ldpValue, ldpValue);
			//
			let lmpTime = 0;
			let lmpValue = 0;
			let lmpValue2 = 0;
			for (const j of lmp) {
				i.addEvents(2, lmpTime, j.startTime, lmpValue, lmpValue, lmpValue2, lmpValue2);
				switch (j.motionType) {
					case 0:
						break;
					case 1:
						i.addEvents(2, j.startTime, j.endTime, lmpValue, j.value, lmpValue2, j.value2);
						break;
					default:
						if (!tween[j.motionType]) throw `Unexpected MotionType: ${j.motionType}`;
						for (let k = parseInt(j.startTime); k < parseInt(j.endTime); k++) {
							let ptt1 = (k - j.startTime) / (j.endTime - j.startTime);
							let ptt2 = (k + 1 - j.startTime) / (j.endTime - j.startTime);
							let pt1 = j.value - lmpValue;
							let pt2 = j.value2 - lmpValue2;
							i.addEvents(2, k, k + 1, lmpValue + tween[j.motionType](ptt1) * pt1, lmpValue + tween[j.motionType](ptt2) * pt1, lmpValue2 + tween[j.motionType](ptt1) * pt2, lmpValue2 + tween[j.motionType](ptt2) * pt2);
						}
				}
				lmpTime = j.endTime;
				lmpValue = j.value;
				lmpValue2 = j.value2;
			}
			i.addEvents(2, lmpTime, 1e9, lmpValue, lmpValue, lmpValue2, lmpValue2);
			//
			let lrpTime = 0;
			let lrpValue = 0;
			for (const j of lrp) {
				i.addEvents(3, lrpTime, j.startTime, lrpValue, lrpValue);
				switch (j.motionType) {
					case 0:
						break;
					case 1:
						i.addEvents(3, j.startTime, j.endTime, lrpValue, j.value);
						break;
					default:
						if (!tween[j.motionType]) throw `Unexpected MotionType: ${j.motionType}`;
						for (let k = parseInt(j.startTime); k < parseInt(j.endTime); k++) {
							let ptt1 = (k - j.startTime) / (j.endTime - j.startTime);
							let ptt2 = (k + 1 - j.startTime) / (j.endTime - j.startTime);
							let pt1 = j.value - lrpValue;
							i.addEvents(3, k, k + 1, lrpValue + tween[j.motionType](ptt1) * pt1, lrpValue + tween[j.motionType](ptt2) * pt1);
						}
				}
				lrpTime = j.endTime;
				lrpValue = j.value;
			}
			i.addEvents(3, lrpTime, 1e9, lrpValue, lrpValue);
			qwqChart.pushLine(i);
		}
	}
	//qwq
	console.log(qwqChart);
	console.log(baseBpm, raw);
	//test end
	return JSON.parse(JSON.stringify(qwqChart));
}
window.addEventListener("keydown", function(event) {
	if (document.activeElement.classList.value != "input" && event.key == ' ' && !btnPause.classList.contains("disabled")) {
		event.preventDefault();
		btnPause.click();
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
		newLine.speedEvents = [];
		newLine.notesAbove = [];
		newLine.notesBelow = [];
		newLine.judgeLineDisappearEvents = [];
		newLine.judgeLineMoveEvents = [];
		newLine.judgeLineRotateEvents = [];
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
			newLine.judgeLineRotateEvents.push(newEvent);
		}
		newChart.judgeLineList.push(newLine);
	}
	return newChart;
}
//给图片上色
const imgShader = function(img, color) {
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
		imgData.data[i * 4] *= rgba[0] / 256;
		imgData.data[i * 4 + 1] *= rgba[1] / 256;
		imgData.data[i * 4 + 2] *= rgba[2] / 256;
		imgData.data[i * 4 + 3] *= rgba[3] / 256;
	}
	return imgData;
}
//读取csv
const csv2array = function(data) {
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
	return col;
}