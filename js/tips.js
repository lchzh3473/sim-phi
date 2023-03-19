export const brain = {
	tips: [],
	addTip(tip) {
		this.tips.push(tip);
	},
	getTip() {
		return this.tips[Math.floor(Math.random() * this.tips.length)];
	}
};
//2022.5.8
brain.addTip('开启tips:tips:tips:tips...');
//统计类
// brain.addTip('当您看到这里，已经使用了[时间]呢！');
// brain.addTip('您已经刷了[次数]条tips了呢，如果累了的话可以休息一下哦！');
//声明类
brain.addTip('不提供逆向教程，也不提供谱面下载');
brain.addTip('反馈bug时记得带上设备以及浏览器名称和版本号！');
//暗示类
brain.addTip('用键盘打歌是怎样的体验？');
// brain.addTip('奥拓先生可以AP所有谱面，是最顶端的存在！');
brain.addTip('在【曲名】处输入“/pz”可以打开Phizone的对话框哦！');
// brain.addTip('4.1 Hyperer Mode Released');
// brain.addTip('4.1 Reverse Mode Released');
//闲聊类
brain.addTip('今天又是元气满满的一天~');
brain.addTip('lchzh is the best!');
brain.addTip('<a href="https://afdian.net/a/lchzh3473"target="_blank">我很可爱，请给我钱</a>');
//彩蛋类
brain.addTip('<p style="background-clip:text;-webkit-background-clip:text;color:transparent;background-image:linear-gradient(90deg,red,orange,lime,blue,magenta);width:fit-content;margin-left:auto;margin-right:auto;">这是一条彩虹色的Tip！</p>');
brain.addTip('#锟斤拷锟叫凤拷锟斤拷锟脚碉拷也只锟斤拷Tips]');
brain.addTip('flag{qwq}');
// brain.addTip('这是一条tips\n它大概长这样.jpg');
//居然有人看源码，我就写点有意思的东西吧
brain.addTip('<code style="white-space:pre;text-align:left;display:inline-block;font-size:1.5em">try{\n  tip(brain.makeATip());\n}\ncatch(NoIdeaException e){\n  e.printStackTrace();\n}</code>');