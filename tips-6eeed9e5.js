const e=hook.define({name:"Tips",description:"Just some tips",contents:[{type:"script",meta:[e=>function(e){function i(e,t,i,n){let a=null;function r(){a=requestAnimationFrame(r),t()&&(cancelAnimationFrame(a),i(),e.removeEventListener("mousedown",r),e.removeEventListener("mouseup",p),e.removeEventListener("mouseleave",p),e.removeEventListener("touchstart",r),e.removeEventListener("touchend",p),e.removeEventListener("touchcancel",p))}function p(){cancelAnimationFrame(a),n()}e.addEventListener("mousedown",r),e.addEventListener("mouseup",p),e.addEventListener("mouseleave",p),e.addEventListener("touchstart",r,{passive:!0}),e.addEventListener("touchend",p),e.addEventListener("touchcancel",p)}!function n(){let a=null;i(e,(()=>(null===a&&(a=performance.now()),performance.now()-a>3473?1:0)),(()=>{hook.fireModal("<p>Tip</p>",`<p>${t.getTip()}</p>`),n()}),(()=>a=null))}()}(e(".title"))]}]}),t={firstTip:null,tips:[],addTip(e,{first:t=!1}={}){t&&(this.firstTip=e),this.tips.push(e)},getTip(){if(this.firstTip){const e=this.firstTip;return this.firstTip=null,e}return this.tips[Math.floor(Math.random()*this.tips.length)]}};t.addTip("开启tips:tips:tips:tips...",{first:!0}),t.addTip("不提供逆向教程，也不提供谱面下载"),t.addTip("反馈bug时记得带上设备以及浏览器名称和版本号！"),t.addTip("用键盘打歌是怎样的体验？"),t.addTip("<ruby>奥拓普雷<rp>(</rp><rt>Autoplay</rt><rp>)</rp></ruby>先生，永远的音游之光"),t.addTip("上传并选择视频文件播放可以将背景替换为视频！<br><sub>(需要浏览器支持)</sub>"),t.addTip("在【曲名】处输入“/pz”可以打开Phizone的对话框！"),t.addTip("在【曲名】处输入“/random”以加载随机歌曲！"),t.addTip("在【曲名】处输入“/skin”可以打开皮肤选择器！"),t.addTip("今天又是元气满满的一天~"),t.addTip("lchzh is the best!"),t.addTip('<a href="https://afdian.net/a/lchzh3473"target="_blank">我很可爱，请给我钱</a>'),t.addTip('<p style="background-clip:text;-webkit-background-clip:text;color:transparent;background-image:linear-gradient(90deg,red,orange,lime,blue,magenta);width:fit-content;margin-left:auto;margin-right:auto;">这是一条彩虹色的Tip！</p>'),t.addTip("#锟斤拷锟叫凤拷锟斤拷锟脚碉拷也只锟斤拷Tips]"),t.addTip("flag{qwq}"),t.addTip('<img src="//wsrv.nl/?url=www.digital-typhoon.org/globe/color/1979/2048x2048/GMS179101209.globe.1.jpg"style="width:50vmin;clip-path:circle(49.5%)"/><br>1979-10-12 09:00 UTC'),t.addTip('<code style="white-space:pre;text-align:left;display:inline-block;font-size:1.5em">try{\n  tip(brain.makeATip());\n}\ncatch(NoIdeaException e){\n  e.printStackTrace();\n}</code>');export{e as default};
//# sourceMappingURL=tips-6eeed9e5.js.map
