export default hook.define({
	name: 'Tips',
	description: 'Just some tips',
	contents: [{
		type: 'script',
		meta: [fireTip]
	}]
});
const brain = {
	firstTip: null,
	tips: [],
	addTip(tip, { first = false } = {}) {
		if (first) this.firstTip = tip;
		this.tips.push(tip);
	},
	getTip() {
		if (this.firstTip) {
			const tip = this.firstTip;
			this.firstTip = null;
			return tip;
		}
		return this.tips[Math.floor(Math.random() * this.tips.length)];
	}
};
//2022.5.8
brain.addTip('开启tips:tips:tips:tips...', { first: true });
//统计类
// brain.addTip('当您看到这里，已经使用了[时间]呢！');
// brain.addTip('您已经刷了[次数]条tips了呢，如果累了的话可以休息一下哦！');
//声明类
brain.addTip('不提供逆向教程，也不提供谱面下载');
brain.addTip('反馈bug时记得带上设备以及浏览器名称和版本号！');
//暗示类
brain.addTip('用键盘打歌是怎样的体验？');
brain.addTip('<ruby>奥拓普雷<rp>(</rp><rt>Autoplay</rt><rp>)</rp></ruby>先生，永远的音游之光');
brain.addTip('上传并选择视频文件播放可以将背景替换为视频！');
brain.addTip('在【曲名】处输入“/pz”可以打开Phizone的对话框！');
brain.addTip('在【曲名】处输入“/random”以加载随机歌曲！');
brain.addTip('在【曲名】处输入“/skin”可以打开皮肤选择器！');
// brain.addTip('4.1 Hyperer Mode Released');
// brain.addTip('4.1 Reverse Mode Released');
//闲聊类
brain.addTip('今天又是元气满满的一天~');
brain.addTip('lchz\x68 is the best!');
brain.addTip('<a href="https://afdian.net/a/XzaiCloud"target="_blank">我很可爱，请给我钱</a>');
//彩蛋类
brain.addTip('<p style="background-clip:text;-webkit-background-clip:text;color:transparent;background-image:linear-gradient(90deg,red,orange,lime,blue,magenta);width:fit-content;margin-left:auto;margin-right:auto;">这是一条彩虹色的Tip！</p>');
brain.addTip('#锟斤拷锟叫凤拷锟斤拷锟脚碉拷也只锟斤拷Tips]');
brain.addTip('flag{qwq}');
brain.addTip('<img src="http://agora.ex.nii.ac.jp/digital-typhoon/globe/color/1979/2048x2048/GMS179101209.globe.1.jpg"style="width:50vmin;clip-path:circle(49.5%)"/><br>1979-10-12 09:00 UTC');
//居然有人看源码，我就写点有意思的东西吧
brain.addTip('<code style="white-space:pre;text-align:left;display:inline-block;font-size:1.5em">try{\n  tip(brain.makeATip());\n}\ncatch(NoIdeaException e){\n  e.printStackTrace();\n}</code>');

function fireTip(elem) {
	/**
	 * @param {HTMLElement} elem
	 * @param {()=>void} activeFn
	 * @param {()=>void} doneFn
	 */
	function longPress(elem, activeFn, doneFn, failFn) {
		let timer = null;
		elem.addEventListener('mousedown', onrequest);
		elem.addEventListener('mouseup', oncancel);
		elem.addEventListener('mouseleave', oncancel);
		elem.addEventListener('touchstart', onrequest, { passive: true });
		elem.addEventListener('touchend', oncancel);
		elem.addEventListener('touchcancel', oncancel);

		function onrequest() {
			timer = requestAnimationFrame(onrequest);
			if (activeFn()) {
				cancelAnimationFrame(timer);
				doneFn();
				elem.removeEventListener('mousedown', onrequest);
				elem.removeEventListener('mouseup', oncancel);
				elem.removeEventListener('mouseleave', oncancel);
				elem.removeEventListener('touchstart', onrequest);
				elem.removeEventListener('touchend', oncancel);
				elem.removeEventListener('touchcancel', oncancel);
			}
		}

		function oncancel() {
			cancelAnimationFrame(timer);
			failFn();
		}
	}
	(function helloworld() {
		let pressTime = null;
		longPress(elem, () => {
			if (pressTime === null) pressTime = performance.now();
			if (performance.now() - pressTime > 3473) return 1;
			return 0;
		}, async () => {
			helloworld(!hook.fireModal(`<p>Tip</p>`, `<p>${brain.getTip()}</p>`));
		}, () => pressTime = null);
	})();
}