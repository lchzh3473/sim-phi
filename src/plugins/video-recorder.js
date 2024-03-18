export default hook.define({
  name: 'Video Recorder',
  description: 'Record video',
  contents: [
    {
      type: 'config',
      meta: ['启用视频录制', callback]
    }
  ]
});
const valert = str => hook.toast(str);
let ready = false;
let manual = false;
let recording = false;
const video = {
  /** @type {HTMLDivElement} */
  container: null,
  createUI() {
    if (this.container) return;
    this.container = document.createElement('div');
    this.container.textContent = '\ue04b';
    Object.assign(this.container.style, {
      background: 'rgb(139, 195, 74)',
      color: 'rgb(240, 241, 254)',
      borderRadius: '2vmin',
      padding: '1vmin',
      zIndex: '150',
      position: 'absolute',
      fontFamily: '"Material Icons"',
      fontSize: '4vmin',
      opacity: '0.8',
      lineHeight: 'initial',
      left: '100px',
      top: '100px'
    });
    this.container.addEventListener('mousedown', evt => {
      evt.preventDefault();
      let moved = false;
      setTimeout(() => {
        if (!moved && !recording) longpress();
        moved = true;
      }, 500);
      const onmove = getMoveFn(this.container, evt, () => moved = true);
      window.addEventListener('mousemove', onmove);
      window.addEventListener('mouseup', () => {
        window.removeEventListener('mousemove', onmove);
        if (!moved) click();
        moved = true;
      }, { once: true });
    });
    this.container.addEventListener('touchstart', evt => {
      evt.preventDefault();
      let moved = false;
      setTimeout(() => {
        if (!moved && !recording) longpress();
        moved = true;
      }, 500);
      const onmove = getMoveFn(this.container, evt, () => moved = true);
      window.addEventListener('touchmove', onmove, { passive: false });
      window.addEventListener('touchend', () => {
        window.removeEventListener('touchmove', onmove);
        if (!moved) click();
        moved = true;
      }, { once: true });
    });
    hook.app.stage.appendChild(this.container);
  },
  destroyUI() {
    if (!this.container) return;
    this.container.remove();
    this.container = null;
  },
  msdest: null,
  chunks: [],
  objectURL: null,
  fileName: null,
  fileSize: null,
  checkSupport() {
    const f1 = (self.AudioContext || self.webkitAudioContext).prototype.createMediaStreamDestination;
    const f2 = HTMLCanvasElement.prototype.captureStream;
    const f3 = self.MediaRecorder;
    return f1 && f2 && f3;
  },
  record() {
    const { audio: { actx }, app: { canvas } } = hook;
    if (!this.msdest) this.msdest = actx.createMediaStreamDestination();
    hook.audio.msdest = this.msdest;
    const support = [
      'video/mp4;codecs=avc1',
      'video/mp4;codecs=mp4a',
      'video/webm;codecs=vp9,pcm',
      'video/webm;codecs=vp8,pcm',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus'
    ].find(n => MediaRecorder.isTypeSupported(n));
    const cStream = canvas.captureStream();
    const aStream = this.msdest.stream;
    const mixStream = new MediaStream([cStream.getVideoTracks()[0], aStream.getAudioTracks()[0]]);
    try {
      const recorder = new MediaRecorder(mixStream, {
        videoBitsPerSecond: 2e7,
        mimeType: support || ''
      }); // mixStream
      recorder.ondataavailable = evt => evt.data && evt.data.size && this.chunks.push(evt.data);
      recorder.onstop = () => {
        // mixStream.getTracks().forEach(n => n.stop());
        cStream.getTracks().forEach(n => n.stop());
        if (this.chunks.length) {
          if (this.objectURL) {
            URL.revokeObjectURL(this.objectURL);
            this.objectURL = null;
          }
          const blob = new Blob(this.chunks, { type: recorder.mimeType });
          this.objectURL = URL.createObjectURL(blob);
          this.fileName = `${Math.floor(Date.now() / 1e3)}.${support.match(/\/(.+)?;/)[1]}`;
          this.fileSize = blob.size;
          this.chunks.length = 0;
          longpress();
        } else valert('Recording Failed: No Data Available');
      };
      recorder.start();
      recording = true;
      this.stop = () => {
        recorder.stop();
        recording = false;
      };
    } catch (e) {
      valert(`Recording Failed: ${e.message}`);
    }
  },
  stop() {}
};
function click() {
  if (ready) {
    if (recording) {
      video.container.style.background = 'rgb(139, 195, 74)';
      video.stop();
    } else {
      video.container.style.background = 'rgb(195, 75, 79)';
      video.record();
    }
  } else {
    manual = !manual;
    if (manual) video.container.textContent = '\ue04c';
    else video.container.textContent = '\ue04b';
  }
}
function longpress() {
  const toast = hook.fireModal('<p>录制预览</p>', '');
  const src = video.objectURL;
  if (!src) {
    toast.innerHTML = '<p>当前无可用数据</p>';
    return;
  }
  // preview window
  const elem1 = document.createElement('video');
  elem1.style.width = '100%';
  elem1.src = src;
  elem1.controls = true;
  toast.appendChild(elem1);
  // download anchor
  const elem2 = document.createElement('a');
  elem2.style.display = 'inline-block';
  elem2.style.margin = '1em 0';
  elem2.href = src;
  elem2.download = video.fileName;
  elem2.textContent = `保存到本地(${bytefm(video.fileSize)})`;
  toast.appendChild(elem2);
}
/**
 * @param {HTMLInputElement} checkbox
 * @param {HTMLDivElement} container
 */
function callback(checkbox, container) {
  if (!video.checkSupport()) {
    checkbox.checked = false;
    container.classList.add('disabled');
    container.querySelector('label').textContent += '(当前设备或浏览器不支持)';
    return;
  }
  checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
      video.createUI();
      hook.before.set('video', () => {
        ready = true;
        if (!manual) click();
      });
      hook.end.set('video', () => {
        if (recording) click();
        ready = false;
      });
    } else {
      video.destroyUI();
      hook.before.delete('video');
      hook.end.delete('video');
    }
  });
  hook.status.reg('enableVideoRecorder', checkbox);
}
/** @param {HTMLDivElement} div */
function getMoveFn(div, evt, onmove) {
  /** @type {MouseEvent|Touch} */
  const evt1 = evt.changedTouches ? evt.changedTouches[0] : evt;
  const cx = evt1.pageX;
  const cy = evt1.pageY;
  const sx = div.offsetLeft;
  const sy = div.offsetTop;
  const dw = div.offsetWidth / 2;
  const dh = div.offsetHeight / 2;
  const parent = div.parentElement;
  return function(evt2) {
    /** @type {MouseEvent|Touch} */
    const evt3 = evt2.changedTouches ? evt2.changedTouches[0] : evt2;
    if (evt3.movementX === 0 && evt3.movementY === 0) return; // 踩坑：新版浏览器按下鼠标即使不移动也会定期触发mousemove事件
    const dx = sx + evt3.pageX - cx + dw;
    const dy = sy + evt3.pageY - cy + dh;
    const pw = dw / parent.offsetWidth * 100;
    const ph = dh / parent.offsetHeight * 100;
    const px = dx / parent.offsetWidth * 100;
    const py = dy / parent.offsetHeight * 100;
    div.style.left = px > 50 ? 'auto' : `${Math.max(0, px - pw)}%`;
    div.style.right = px > 50 ? `${100 - Math.min(100, px + pw)}%` : 'auto';
    div.style.top = py > 50 ? 'auto' : `${Math.max(0, py - ph)}%`;
    div.style.bottom = py > 50 ? `${100 - Math.min(100, py + ph)}%` : 'auto';
    onmove();
  };
}
// byte转人类可读
function bytefm(byte = 0) {
  let result = byte;
  if (result < 1024) return `${result}B`;
  if ((result /= 1024) < 1024) return `${result.toFixed(2)}KB`;
  if ((result /= 1024) < 1024) return `${result.toFixed(2)}MB`;
  if ((result /= 1024) < 1024) return `${result.toFixed(2)}GB`;
  if ((result /= 1024) < 1024) return `${result.toFixed(2)}TB`;
  if ((result /= 1024) < 1024) return `${result.toFixed(2)}PB`;
  if ((result /= 1024) < 1024) return `${result.toFixed(2)}EB`;
  if ((result /= 1024) < 1024) return `${result.toFixed(2)}ZB`;
  if ((result /= 1024) < 1024) return `${result.toFixed(2)}YB`;
  result /= 1024; return `${result}BB`;
}
