export default hook.define({
  name: 'Tips',
  description: 'Just some tips',
  contents: [
    {
      type: 'script',
      meta: [$ => fireTip($('.title'))]
    }
  ]
});
const brain = {
  firstTip: null,
  tips: [],
  addTip(content, { first = false } = {}) {
    if (first) this.firstTip = content;
    const weight = this.tips.reduce((acc, cur) => Math.max(acc, cur.weight), 0);
    this.tips.push({ content, weight: weight || 1 });
  },
  getTip() {
    if (this.firstTip) {
      const tip = this.firstTip;
      this.firstTip = null;
      return tip;
    }
    if (this.tips.every(tip => tip.weight < 1)) this.tips.forEach(tip => tip.weight *= 2);
    const total = this.tips.reduce((acc, cur) => acc + cur.weight, 0);
    const rand = Math.random() * total;
    let acc = 0;
    for (const tip of this.tips) {
      acc += tip.weight;
      if (rand < acc) {
        tip.weight *= 0.5;
        return tip.content;
      }
    }
    throw new Error('NoIdeaException');
  }
};
// 2022.5.8
brain.addTip('开启tips:tips:tips:tips...', { first: true });
// 统计类
// brain.addTip('当您看到这里，已经使用了[时间]呢！');
// brain.addTip('您已经刷了[次数]条tips了呢，如果累了的话可以休息一下哦！');
// 声明类
brain.addTip('不提供逆向教程，也不提供谱面下载');
brain.addTip('反馈bug时记得带上设备以及浏览器名称和版本号！');
// 暗示类
brain.addTip('用键盘打歌是怎样的体验？');
brain.addTip('<ruby>奥拓普雷<rp>(</rp><rt>Autoplay</rt><rp>)</rp></ruby>先生，永远的音游之光');
brain.addTip('上传并选择视频文件播放可以将背景替换为视频！<br><sub>(需要浏览器支持)</sub>');
brain.addTip('在【曲名】处输入“/pz”可以打开Phizone的对话框！');
brain.addTip('在【曲名】处输入“/random”以加载随机歌曲！');
brain.addTip('长按“播放”按钮可以打开皮肤选择器！');
// brain.addTip('4.1 Hyperer Mode Released');
// brain.addTip('4.1 Reverse Mode Released');
// 闲聊类
brain.addTip('今天又是元气满满的一天~');
brain.addTip('lchz\x68 is the best!');
brain.addTip('<a href="https://afdian.net/a/lchz\x683\x3473"target="_blank">我很可爱，请给我钱</a>');
// 彩蛋类
brain.addTip('<b style="background-clip:text;-webkit-background-clip:text;color:transparent;background-image:linear-gradient(90deg,red,orange,lime,blue,magenta);width:fit-content;margin-left:auto;margin-right:auto;">这是一条彩虹色的Tip！</b>');
brain.addTip('#锟斤拷锟叫凤拷锟斤拷锟脚碉拷也只锟斤拷Tips]');
brain.addTip('flag{\x71w\x71}');
brain.addTip('<img src="//wsrv.nl/?url=www.digital-typhoon.org/globe/color/1979/2048x2048/GMS179101209.globe.1.jpg"style="width:50vmin;clip-path:circle(49.5%)"/><br>1979-10-12 09:00 UTC');
// 居然有人看源码，我就写点有意思的东西吧
brain.addTip('<code style="white-space:pre;text-align:left;display:inline-block;font-size:1.5em">try{\n  tip(brain.makeATip());\n}\ncatch(NoIdeaException e){\n  e.printStackTrace();\n}</code>');
function fireTip(elem) {
  /**
   * @param {HTMLElement} elem1
   * @param {()=>any} activeFn
   * @param {()=>any} doneFn
   */
  function longPress(elem1, activeFn, doneFn, failFn) {
    let timer = null;
    elem1.addEventListener('mousedown', onrequest);
    elem1.addEventListener('mouseup', oncancel);
    elem1.addEventListener('mouseleave', oncancel);
    elem1.addEventListener('touchstart', onrequest, { passive: true });
    elem1.addEventListener('touchend', oncancel);
    elem1.addEventListener('touchcancel', oncancel);
    function onrequest() {
      timer = requestAnimationFrame(onrequest);
      if (activeFn()) {
        cancelAnimationFrame(timer);
        doneFn();
        elem1.removeEventListener('mousedown', onrequest);
        elem1.removeEventListener('mouseup', oncancel);
        elem1.removeEventListener('mouseleave', oncancel);
        elem1.removeEventListener('touchstart', onrequest);
        elem1.removeEventListener('touchend', oncancel);
        elem1.removeEventListener('touchcancel', oncancel);
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
      if (pressTime == null) pressTime = performance.now();
      if (performance.now() - pressTime > 3473) return 1;
      return 0;
    }, () => {
      hook.fireModal('<p>Tip</p>', `<p>${brain.getTip()}</p>`);
      helloworld();
    }, () => pressTime = null);
  }());
}
