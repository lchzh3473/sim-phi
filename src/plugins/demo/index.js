import { ImgAny } from '@/utils/ImageTools';
import { waitForElementById } from '@/utils/waitForElementById';
const $ = query => document.body.querySelector(query);
const flag0 = 'flag{\x71w\x71}';
export default function(isBeta = false) {
  (function() {
    const t = new Date();
    if (t.getDate() !== 1 || t.getMonth() !== 3) return;
    import('./reverse.js');
  }());
  hook.before.set(flag0, () => {
    const md5 = hook.chartsMD5.get(hook.selectchart.value);
    console.log(hook.tmps.name);
    if (md5 === 'ab9d2cc3eb569236ead459ad4caba109') hook.now.set(flag0, loadModYukiOri());
    else hook.now.delete(flag0);
  });
  const id = setInterval(() => {
    if (!$('.title>small')) return;
    clearInterval(id);
    let tid = 3;
    $('.title>small').addEventListener('click', () => {
      if (--tid) return;
      const uidDemo = Utils.randomUUID();
      const uidLegacy = Utils.randomUUID();
      const uidPreview = Utils.randomUUID();
      const div = hook.toast([
        `<a id="${uidDemo}" href="#">demo.zip</a>`,
        `<a id="${uidLegacy}" href="#">Legacy</a>`,
        `<a id="${uidPreview}" href="#">${isBeta ? 'Normal' : 'Beta'}</a>`
      ].join('<br><br>'));
      waitForElementById(uidDemo, elem => {
        elem.addEventListener('click', () => {
          const handler = img => hook.uploader.fireLoad({ name: 'demo.zip' }, ImgAny.decodeAlt(img));
          const xhr = new XMLHttpRequest();
          xhr.open('GET', '//i0.hdslb.com/bfs/music/1682346166.jpg', true);
          xhr.responseType = 'blob';
          xhr.onprogress = evt => hook.uploader.fireProgress(evt.loaded, evt.total);
          xhr.onloadend = () => createImageBitmap(xhr.response).then(handler);
          setNoReferrer(() => xhr.send());
          div.dispatchEvent(new Event('custom-done'));
        });
      });
      waitForElementById(uidLegacy, elem => {
        elem.addEventListener('click', () => {
          location.replace('/sim-phi-legacy');
          div.dispatchEvent(new Event('custom-done'));
        });
      });
      waitForElementById(uidPreview, elem => {
        elem.addEventListener('click', () => {
          location.replace(isBeta ? '/sim-phi' : '/sim-phi-vite');
          div.dispatchEvent(new Event('custom-done'));
        });
      });
    });
  }, 500);
}
function loadModYukiOri() {
  console.log('好耶');
  const analyser = hook.audio.actx.createAnalyser();
  analyser.fftSize = 4096;
  // analyser.minDecibels = -180;
  const getFreq = () => {
    // progress变为频谱图
    const bufferLength = analyser.frequencyBinCount;
    const freq = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(freq);
    const avg = freq.reduce((a, b) => a + b) / bufferLength;
    return Math.min(1, avg / 255 * 2.15); // FIXME: more accurate formula
  };
  let flagMusic = null;
  let flagPerfect = NaN;
  let flagGood = NaN;
  let flagBad = NaN;
  let flagEm = '';
  let flagN = false;
  const setFlag = (flag, em, n) => {
    flagEm = em;
    flagN = n;
    return flag;
  };
  return time => {
    const time1 = time * 1.95;
    const bgMusic = hook.tmps.bgMusicHack();
    if (bgMusic && bgMusic !== flagMusic) {
      bgMusic.connect(analyser); // ?
      flagMusic = bgMusic;
    }
    if (time1 < 168) {
      hook.stat.numOfNotes = 305;
      hook.tmps.level = 'lN\u2002Lv.I2';
      hook.tmps.progress = time1 / 218;
    } else if (time1 < 169) {
      const progress = 1 - (169 - time1) ** 3; // easeCubicOut
      hook.stat.numOfNotes = 305 + 2195 * progress | 0;
      hook.tmps.progress = getFreq();
    } else {
      hook.stat.numOfNotes = 2500;
      hook.tmps.progress = getFreq();
    }
    if (time1 > 325 && time1 < 358) {
      // 监听判定变化
      const statusP = hook.stat.perfect;
      const statusG = hook.stat.good;
      const statusB = hook.stat.bad;
      if (isNaN(flagPerfect)) flagPerfect = statusP;
      if (isNaN(flagGood)) flagGood = statusG;
      if (isNaN(flagBad)) flagBad = statusB;
      if (statusP !== flagPerfect) flagPerfect = setFlag(statusP, '\uff2f(\u2267\u25bd\u2266)\uff2f', true);
      else if (statusG !== flagGood) flagGood = setFlag(statusG, '(\uff3e\u03c9\uff3e)', true);
      else if (statusB !== flagBad) flagBad = setFlag(statusB, '(\u2299\ufe4f\u2299;)', true);
      // 监听时间变化
      if (time1 < 327) setFlag(null, '(\u2299o\u2299)', false);
      else if (time1 > 334 && time1 < 335) setFlag(null, '(\u2299o\u2299)', false);
      else if (time1 > 342 && time1 < 343) setFlag(null, '(\u2299o\u2299)', false);
      else if (time1 > 350 && time1 < 351) setFlag(null, '(\u2299o\u2299)', false);
      else if (!flagN) flagEm = '(\u2299ω\u2299)';
      hook.tmps.combo = flagEm;
    }
  };
}
function setNoReferrer(handler = () => {}) {
  const meta = Object.assign(document.createElement('meta'), { content: 'no-referrer', name: 'referrer' });
  document.head.appendChild(meta); handler(); meta.remove();
}
