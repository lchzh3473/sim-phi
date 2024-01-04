import { stringify } from '@/utils/stringify';
import { waitForElementById } from '@/utils/waitForElementById';
export default hook.define({
  name: 'Skin',
  description: 'Customize skin',
  contents: [
    {
      type: 'script',
      meta: [$ => fireTip($('#btn-play'))]
    }
  ]
});
const { audio } = hook;
function skin() {
  const id = `skin${Date.now()}`;
  /** @type {ByteData[]} */
  const files = [];
  const zip = new hook.ZipReader({ handler: data => files.push(data) });
  zip.addEventListener('loadstart', () => hook.sendText('加载zip组件...'));
  zip.addEventListener('read', () => hook.handleFile(id, zip.total, null, done));
  const uid = Utils.randomUUID();
  const div = hook.fireModal('<p>皮肤选择器</p>', `<p><a id="${uid}" href="#">点击此处上传文件</a></p>`);
  const input = Object.assign(document.createElement('input'), {
    type: 'file',
    accept: '',
    /** @this {HTMLInputElement} */
    onchange() {
      if (!this.files) return;
      const file = this.files[0];
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = evt => {
        if (!evt.target || !(evt.target.result instanceof ArrayBuffer)) return;
        zip.read({
          pathname: file.webkitRelativePath || file.name,
          buffer: evt.target.result
        });
        div.dispatchEvent(new Event('custom-done'));
      };
    }
  });
  // 直到uid进入DOM树才能触发click事件
  waitForElementById(uid, elem => {
    elem.addEventListener('click', () => input.click());
  });
  // input.click();
  async function done() {
    console.log(files);
    const config = Object.create(await loadConfig(files));
    /** @type {Object<string, string[]>} */
    const alias = {
      Tap: ['Tap.png', 'click.png'],
      TapHL: ['TapHL.png', 'click_mh.png'],
      Drag: ['Drag.png', 'drag.png'],
      DragHL: ['DragHL.png', 'drag_mh.png'],
      Hold: ['Hold.png', 'hold.png'],
      HoldHL: ['HoldHL.png', 'hold_mh.png'],
      Flick: ['Flick.png', 'flick.png'],
      FlickHL: ['FlickHL.png', 'flick_mh.png'],
      HitFX: ['HitFX.png', 'hit_fx.png'],
      HitSong0: ['HitSong0.ogg', 'Tap.ogg', 'click.ogg'],
      HitSong1: ['HitSong1.ogg', 'Drag.ogg', 'drag.ogg'],
      HitSong2: ['HitSong2.ogg', 'Flick.ogg', 'flick.ogg']
    };
    // 根据别名补全文件列表
    /** @type {Map<string, ByteData>} */
    const entries = new Map();
    for (const [a, b] of Object.entries(alias)) {
      for (const i of b) {
        const file = files.find(j => String(j.pathname).endsWith(i));
        if (file) {
          entries.set(a, file);
          break;
        }
      }
    }
    // 读取图片
    if (entries.has('Tap')) {
      const img = await createImageBitmap(new Blob([entries.get('Tap').buffer]));
      const noteScale = 1089 / img.width;
      hook.noteRender.update('Tap', img, noteScale);
      if (entries.has('TapHL')) {
        hook.noteRender.update('TapHL', await createImageBitmap(new Blob([entries.get('TapHL').buffer])), noteScale);
      } else {
        hook.noteRender.update('TapHL', img, noteScale);
      }
    }
    if (entries.has('Drag')) {
      const img = await createImageBitmap(new Blob([entries.get('Drag').buffer]));
      const noteScale = 1089 / img.width;
      hook.noteRender.update('Drag', img, noteScale);
      if (entries.has('DragHL')) {
        hook.noteRender.update('DragHL', await createImageBitmap(new Blob([entries.get('DragHL').buffer])), noteScale);
      } else {
        hook.noteRender.update('DragHL', img, noteScale);
      }
    }
    if (entries.has('Hold')) {
      const img = await createImageBitmap(new Blob([entries.get('Hold').buffer]));
      const noteScale = 1089 / img.width;
      const [bottom, top] = config.holdAtlas;
      const imgHoldEnd = bottom ? await createImageBitmap(img, 0, 0, img.width, bottom) : hook.res.NoImageBlack;
      const imgHold = await createImageBitmap(img, 0, bottom, img.width, img.height - bottom - top);
      const imgHoldHead = top ? await createImageBitmap(img, 0, img.height - top, img.width, top) : hook.res.NoImageBlack;
      const compacted = config.holdCompact;
      hook.noteRender.update('HoldEnd', imgHoldEnd, noteScale, compacted);
      hook.noteRender.update('Hold', imgHold, noteScale, compacted);
      hook.noteRender.update('HoldHead', imgHoldHead, noteScale, compacted);
      if (entries.has('HoldHL')) {
        const img2 = await createImageBitmap(new Blob([entries.get('HoldHL').buffer]));
        const [bottom2, top2] = config.holdAtlasHL || config.holdAtlasMH || config.holdAtlas;
        const imgHoldEndHL = bottom2 ? await createImageBitmap(img2, 0, 0, img2.width, bottom2) : hook.res.NoImageBlack;
        const imgHoldHL = await createImageBitmap(img2, 0, bottom2, img2.width, img2.height - bottom2 - top2);
        const imgHoldHeadHL = top2 ? await createImageBitmap(img2, 0, img2.height - top2, img2.width, top2) : hook.res.NoImageBlack;
        hook.noteRender.update('HoldEndHL', imgHoldEndHL, noteScale, compacted);
        hook.noteRender.update('HoldHL', imgHoldHL, noteScale, compacted);
        hook.noteRender.update('HoldHeadHL', imgHoldHeadHL, noteScale, compacted);
      } else {
        hook.noteRender.update('HoldEndHL', imgHoldEnd, noteScale, compacted);
        hook.noteRender.update('HoldHL', imgHold, noteScale, compacted);
        hook.noteRender.update('HoldHeadHL', imgHoldHead, noteScale, compacted);
      }
    }
    if (entries.has('Flick')) {
      const img = await createImageBitmap(new Blob([entries.get('Flick').buffer]));
      const noteScale = 1089 / img.width;
      hook.noteRender.update('Flick', img, noteScale);
      if (entries.has('FlickHL')) {
        hook.noteRender.update('FlickHL', await createImageBitmap(new Blob([entries.get('FlickHL').buffer])), noteScale);
      } else {
        hook.noteRender.update('FlickHL', img, noteScale);
      }
    }
    if (entries.has('HitFX')) {
      const img = await createImageBitmap(new Blob([entries.get('HitFX').buffer]));
      const [x, y] = config.hitFx;
      const scale = (config.hitFxScale || 1.0) / (img.width / x / 256);
      const hideParts = config.hideParticles || false;
      const duration = config.hitFxDuration * 1000 || 500;
      hook.noteRender.updateFX(img, scale, img.width / x, img.height / y, hideParts, duration);
    }
    // 读取音频
    if (entries.has('HitSong0')) hook.res.HitSong0 = await audio.decode(entries.get('HitSong0').buffer.slice(0));
    if (entries.has('HitSong1')) hook.res.HitSong1 = await audio.decode(entries.get('HitSong1').buffer.slice(0));
    if (entries.has('HitSong2')) hook.res.HitSong2 = await audio.decode(entries.get('HitSong2').buffer.slice(0));
    console.log(config, entries);
  }
}
/** @param {ByteData[]} files */
function loadConfig(files = []) {
  const config0 = files.find(i => String(i.pathname).endsWith('config.txt'));
  if (config0) return parseYAML(stringify(config0.buffer), /;?\r?\n/);
  const config1 = files.find(i => String(i.pathname).endsWith('info.yml'));
  if (config1) return parseYAML(stringify(config1.buffer));
  hook.sendError('未找到config.txt或info.yml');
  return {};
}
function parseYAML(text = '', split = /\r?\n/) {
  /** @type {(value:string)=>any} */
  const parse = value => {
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  };
  return text.split(split).reduce((i, j) => {
    const [key, value] = j.split(/:(.+)/).map(s => s.trim());
    if (key) i[key] = parse(value);
    if (i[key] === 'True') i[key] = true;
    if (i[key] === 'False') i[key] = false;
    return i;
  }, Object.create(null));
}
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
      if (performance.now() - pressTime > 1000) return 1;
      return 0;
    }, () => {
      skin();
      helloworld();
    }, () => pressTime = null);
  }());
}
