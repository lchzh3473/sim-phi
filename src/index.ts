import './style.css';
import { lastupdate, pubdate, version } from '../scripts/meta.json';
import { full, orientation } from '@/js/common.js';
import { FrameAnimater } from '@/components/FrameAnimater';
import { FrameTimer } from '@/components/FrameTimer';
import { Timer } from '@/components/Timer';
import { FileEmitter, ZipReader, reader } from '@/utils/reader';
import { Renderer } from '@/core';
import { HitManager, JudgeEvent } from '@/components/HitManager';
import { Stat } from '@/components/Stat';
import { InteractProxy, audio } from '@/external';
import createCtx from '@/utils/createCtx';
import { ImgAny, imgBlur, imgPainter, imgShader, imgSplit } from '@/utils/ImageTools';
import { Checkbox, HitEvents, HitFeedback, HitImage, HitWord, ScaledNote, StatusManager } from '@/components';
import { Stage } from '@/components/Stage';
import { checkSupport } from '@/utils/checkSupport';
import { adjustSize } from '@/utils/adjustSize';
import { fixme } from '@/utils/fixme';
import { MessageHandler } from '@/components/MessageHandler';
import { AudioController } from '@/utils/AudioTools';
import { LevelInfoHandler } from '@/components/InfoHandler';
const meta = ['Phixos', version.split('.'), pubdate, lastupdate] as typeof self._i;
self._i = meta;
const $id = (query: string): HTMLElement => document.getElementById(query) || (() => { throw new Error(`Cannot find element: ${query}`) })();
const $ = (query: string) => document.body.querySelector(query);
const $$ = (query: string) => document.body.querySelectorAll(query);
const viewNav = $id('view-nav') as HTMLDivElement;
const viewCfg = $id('view-cfg') as HTMLDivElement;
const viewMsg = $id('view-msg') as HTMLDivElement;
const viewNav2 = $id('view-nav2') as HTMLDivElement;
const viewRmg = $id('view-rmg') as HTMLDivElement;
const viewExt = $id('view-ext') as HTMLDivElement;
const coverDark = $id('cover-dark') as HTMLDivElement;
const coverRmg = $id('cover-rmg') as HTMLDivElement;
const coverView = $id('cover-view') as HTMLDivElement;
const buttonRmg = $id('btn-rmg') as HTMLInputElement;
const buttonDocs = $id('btn-docs') as HTMLInputElement;
const buttonMore = $id('btn-more') as HTMLInputElement;
const anchorCfg = $id('nav-cfg') as HTMLAnchorElement;
const anchorMsg = $id('nav-msg') as HTMLAnchorElement;
const anchorRmg = $id('nav-rmg') as HTMLAnchorElement;
const strongOut = $id('msg-out');
const blockUploader = $id('uploader') as HTMLDivElement;
const stageEl = $id('stage') as HTMLDivElement;
const selectNoteScale = $id('select-note-scale') as HTMLSelectElement;
const selectAspectRatio = $id('select-aspect-ratio') as HTMLSelectElement;
const selectBackgroundDim = $id('select-background-dim') as HTMLSelectElement;
const checkHighLight = $id('highLight') as HTMLInputElement;
const inputOffset = $id('input-offset') as HTMLInputElement;
const lineColor = $id('lineColor') as HTMLInputElement;
const checkAutoPlay = $id('autoplay') as HTMLInputElement;
const showTransition = $id('showTransition') as HTMLInputElement;
const checkFeedback = $id('feedback') as HTMLInputElement;
const checkImageBlur = $id('imageBlur') as HTMLInputElement;
const selectbg = $id('select-bg') as HTMLSelectElement;
const btnPlay = $id('btn-play') as HTMLInputElement;
const btnPause = $id('btn-pause') as HTMLInputElement;
const selectbgm = $id('select-bgm') as HTMLSelectElement;
const selectchart = $id('select-chart') as HTMLSelectElement;
const selectflip = $id('select-flip') as HTMLSelectElement;
const selectspeed = $id('select-speed') as HTMLSelectElement;
const inputName = $id('input-name') as HTMLInputElement;
const inputArtist = $id('input-artist') as HTMLInputElement;
const inputCharter = $id('input-charter') as HTMLInputElement;
const inputIllustrator = $id('input-illustrator') as HTMLInputElement;
const selectDifficulty = $id('select-difficulty') as HTMLSelectElement;
const selectLevel = $id('select-level') as HTMLSelectElement;
const levelInfoHandler = new LevelInfoHandler(selectDifficulty, selectLevel);
const selectVolume = $id('select-volume') as HTMLSelectElement;
const blockUploaderSelect = $id('uploader-select') as HTMLDivElement;
const blockUpload = $id('uploader-upload') as HTMLInputElement;
const blockUploadFile = $id('uploader-file') as HTMLLabelElement;
const blockUploadDir = $id('uploader-dir') as HTMLLabelElement;
const blockSelect = $id('select') as HTMLDivElement;
const blockMask = $id('mask') as HTMLDivElement;
const tween = {
  easeInSine: (t: number) => 1 - Math.cos(t * Math.PI / 2),
  easeOutSine: (t: number) => Math.sin(t * Math.PI / 2),
  easeOutCubic: (t: number) => 1 + (t - 1) ** 3
};
const time2Str = (time = 0) => `${Math.floor(time / 60)}:${`00${Math.floor(time % 60)}`.slice(-2)}`;
interface MainOptions {
  modify: (chart: Chart) => Chart;
  pressTime: number;
  before: Map<string, () => Promise<void> | void>;
  now: Map<string, (time: number) => void>;
  after: Map<string, () => void>;
  afterAll: Map<string, () => void>;
  end: Map<string, () => Promise<void> | void>;
  customDraw: ((ctx: CanvasRenderingContext2D) => void) | null;
  filter: ((ctx: CanvasRenderingContext2D, time: number, now: number) => CanvasImageSource) | null;
  filterOptions: Record<string, unknown>;
  handleFile: (tag: string, total: number, promise: Promise<unknown>, oncomplete?: () => void) => Promise<unknown>;
  uploader: typeof uploader;
  awawa: boolean;
  fireModal: (navHTML: HTMLElement | string, contentHTML: HTMLElement | string) => HTMLDivElement;
  toast: (msg: string) => HTMLDivElement;
  error: (msg?: string) => HTMLDivElement;
  define: (arg0: ModuleConfig) => ModuleConfig;
  use: (module: Promise<ModuleBase>) => Promise<unknown>;
  stat: typeof stat;
  app: typeof app;
  res: typeof res;
  audio: typeof audio;
  sendText: (msg?: string, type?: string) => void;
  sendWarning: (msg?: BetterMessage | string, isHTML?: boolean) => void;
  sendError: (msg?: string, html?: string, fatal?: boolean) => void;
  frameAnimater: typeof frameAnimater;
  timeEnd: typeof timeEnd;
  bgms: typeof bgms;
  inputName: typeof inputName;
  selectbgm: typeof selectbgm;
  selectchart: typeof selectchart;
  chartsMD5: typeof chartsMD5;
  noteRender: typeof noteRender;
  reader: typeof reader;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ZipReader: typeof ZipReader;
  status: typeof status;
  tmps: typeof tmps;
}
const main = {} as MainOptions;
main.modify = a => a;
main.pressTime = 0;
main.before = new Map();
main.now = new Map();
main.after = new Map();
main.afterAll = new Map();
main.end = new Map();
main.filter = null;
main.filterOptions = {};
document.oncontextmenu = e => e.preventDefault();
for (const thisElem of viewNav.children) {
  thisElem.addEventListener('click', function(this: HTMLElement) {
    for (const elem of viewNav.children) elem.classList.toggle('active', elem === this);
    // if (!viewDoc.src) { viewDoc.src = 'docs/use.html' } // 避免阻塞页面
    // viewDoc.classList.toggle('hide', this.id !== 'nav-use');
    viewCfg.classList.toggle('hide', this.id !== 'nav-cfg');
    viewMsg.classList.toggle('hide', this.id !== 'nav-msg');
  });
}
for (const thisElem of viewNav2.children) {
  thisElem.addEventListener('click', function(this: HTMLElement) {
    for (const elem of viewNav2.children) elem.classList.toggle('active', elem === this);
    viewRmg.classList.toggle('hide', this.id !== 'nav-rmg');
    viewExt.classList.toggle('hide', this.id !== 'nav-ext');
  });
}
coverDark.addEventListener('click', () => {
  coverDark.classList.add('fade');
  coverRmg.classList.add('fade');
  coverView.classList.add('fade');
});
buttonRmg.addEventListener('click', () => {
  coverDark.classList.remove('fade');
  coverRmg.classList.remove('fade');
  anchorRmg.click();
});
buttonDocs.addEventListener('click', () => {
  main.fireModal('<p>提示</p>', '<p><a href="https://docs.lchz\x68.net/project/sim-phi-core" target="_blank">点击此处</a>查看使用说明</p>');
});
buttonMore.addEventListener('click', () => {
  coverDark.classList.remove('fade');
  coverView.classList.remove('fade');
  anchorCfg.click();
});
strongOut.addEventListener('click', () => {
  coverDark.classList.remove('fade');
  coverView.classList.remove('fade');
  anchorMsg.click();
});
const msgHandler = new class extends MessageHandler {
  public nodeView = viewMsg;
  public nodeText = strongOut;
}();
const sendText = msgHandler.updateText.bind(msgHandler);
const sendWarning = msgHandler.sendWarning.bind(msgHandler);
const sendError = msgHandler.sendError.bind(msgHandler);
const stat = new Stat();
const stage = new Stage(stageEl);
const app = new Renderer(stageEl); // test
const { canvas, ctx, canvasfg, ctxfg } = app;
self.addEventListener('resize', () => stage.resize());
class Emitter extends EventTarget {
  private status: string;
  public constructor(statusInit = '') {
    super();
    this.status = statusInit;
  }
  public emit(status = '') {
    if (this.status === status) return;
    this.status = status;
    this.dispatchEvent(new Event('change'));
  }
  public eq(status = '') {
    return this.status === status;
  }
  public ne(status = '') {
    return this.status !== status;
  }
}
const emitter = new Emitter('stop');
const status2 = {
  text: '',
  list: [] as { toString: (target: EventTarget) => void }[],
  reg(target: EventTarget, type: string, handler: (target: EventTarget) => string) {
    this.list[this.list.length] = { toString: () => handler(target) };
    target.addEventListener(type, this.update.bind(this));
  },
  update() {
    const arr = this.list.map(String).filter(Boolean);
    this.text = arr.length === 0 ? '' : `(${arr.join('+')})`;
  }
};
class ImageStore {
  public base: ImageBitmap;
  public width: number;
  public height: number;
  private _blur: ImageBitmap | null;
  public constructor(image: ImageBitmap) {
    this.base = image;
    this.width = image.width;
    this.height = image.height;
    this._blur = null;
  }
  public get blur() {
    this.setBlur();
    return this._blur || this.base;
  }
  public async setBlur() {
    this.setBlur = async() => {};
    this._blur = await imgBlur(this.base);
  }
}
const bgs = new Map() as Map<string, ImageStore>;
const bgms = new Map() as Map<string, MediaData>;
const charts = new Map() as Map<string, Chart>;
const chartsMD5 = new Map() as Map<string, string>;
const chartsFormat = new Map() as Map<string, string>;
const chartLineDataList: ChartLineData[] = []; // line.csv
const chartInfoDataList: ChartInfoData[] = []; // info.csv
selectNoteScale.addEventListener('change', evt => app.setNoteScale(Number((evt.target as HTMLSelectElement).value)));
selectAspectRatio.addEventListener('change', evt => stage.resize(Number((evt.target as HTMLSelectElement).value)));
selectBackgroundDim.addEventListener('change', evt => app.brightness = Number((evt.target as HTMLSelectElement).value));
checkHighLight.addEventListener('change', evt => app.multiHint = (evt.target as HTMLInputElement).checked);
const status = new StatusManager('sim-phi-status').init(data => data.resetCfg);
status.reg('feedback', checkFeedback);
status.reg('imageBlur', checkImageBlur);
status.reg('highLight', checkHighLight);
status.reg('lineColor', lineColor);
status.reg('autoplay', checkAutoPlay);
status.reg('showTransition', showTransition);
const resetCfg = new Checkbox('恢复默认设置(刷新生效)').appendTo(viewCfg).hook(status.reg.bind(status, 'resetCfg'));
const showCE2 = new Checkbox('Early/Late特效').appendBefore(resetCfg.container).hook(status.reg.bind(status, 'showCE2'));
const showPoint = new Checkbox('显示定位点').appendBefore(resetCfg.container).hook(status.reg.bind(status, 'showPoint'));
const showAcc = new Checkbox('显示Acc').appendBefore(resetCfg.container).hook(status.reg.bind(status, 'showAcc'));
const showStat = new Checkbox('显示统计').appendBefore(resetCfg.container).hook(status.reg.bind(status, 'showStat'));
const lowRes = new Checkbox('低分辨率').appendBefore(resetCfg.container).hook(status.reg.bind(status, 'lowRes'));
const lockOri = new Checkbox('横屏锁定', true).appendBefore(resetCfg.container).hook(status.reg.bind(status, 'lockOri'));
const maxFrame = new Checkbox('限制帧率').appendBefore(resetCfg.container).hook(status.reg.bind(status, 'maxFrame'));
const autoDelay = new Checkbox('音画实时同步(若声音卡顿则建议关闭)', true).appendBefore(resetCfg.container).hook(status.reg.bind(status, 'autoDelay'));
const enableVP = new Checkbox('隐藏距离较远的音符').appendBefore(resetCfg.container).hook(status.reg.bind(status, 'enableVP'));
enableVP.checkbox.addEventListener('change', evt => app.enableVP = (evt.target as HTMLInputElement).checked);
enableVP.checkbox.dispatchEvent(new Event('change'));
const enableFR = new Checkbox('使用单精度浮点运算').appendBefore(resetCfg.container).hook(status.reg.bind(status, 'enableFR'));
enableFR.checkbox.addEventListener('change', evt => app.enableFR = (evt.target as HTMLInputElement).checked);
enableFR.checkbox.dispatchEvent(new Event('change'));
selectflip.addEventListener('change', evt => app.mirrorView(Number((evt.target as HTMLInputElement).value)));
status.reg('selectFlip', selectflip);
selectspeed.addEventListener('change', evt => {
  const dict = { slowest: -9, slower: -4, faster: 3, fastest: 5 } as Record<string, number | undefined>;
  app.speed = 2 ** ((dict[(evt.target as HTMLInputElement).value.toLowerCase()] ?? 0) / 12);
});
status.reg('selectSpeed', selectspeed);
// 自动填写歌曲信息
function adjustInfo() {
  for (const data of chartInfoDataList) {
    if (selectchart.value.trim() === data.chart) {
      if (data.name != null) inputName.value = data.name;
      if (data.artist != null) inputArtist.value = data.artist;
      if (data.level != null) levelInfoHandler.updateLevelText(data.level);
      if (data.illustrator != null) inputIllustrator.value = data.illustrator;
      if (data.charter != null) inputCharter.value = data.charter;
      if (data.music != null && bgms.has(data.music)) selectbgm.value = data.music;
      if (data.image != null && bgs.has(data.image)) {
        selectbg.value = data.image;
        selectbg.dispatchEvent(new Event('change'));
      }
      if (data.aspectRatio != null) {
        selectAspectRatio.value = data.aspectRatio.toString();
        stage.resize(data.aspectRatio);
      }
      if (data.noteScale != null) {
        selectNoteScale.value = data.noteScale.toString();
        app.setNoteScale(data.noteScale);
      }
      if (data.backgroundDim != null) {
        selectBackgroundDim.value = data.backgroundDim.toString();
        app.brightness = data.backgroundDim;
      }
      if (data.offset != null) inputOffset.value = data.offset.toString();
    }
  }
}
// Uploader
const uploader = new FileEmitter();
(function() {
  const dones: Record<string, number> = {};
  const totals: Record<string, number> = {};
  let uploaderDone = 0;
  let uploaderTotal = 0;
  const handleFile = async(tag: string, total: number, promise: unknown, oncomplete?: () => void) => {
    totals[tag] = total;
    uploaderTotal = Object.values(totals).reduce((a, b) => a + b, 0);
    await (promise instanceof Promise ? promise : Promise.resolve(promise));
    dones[tag] = (dones[tag] || 0) + 1;
    uploaderDone = Object.values(dones).reduce((a, b) => a + b, 0);
    sendText(`读取文件：${uploaderDone}/${uploaderTotal}`);
    if (dones[tag] === totals[tag] && oncomplete != null) oncomplete();
    loadComplete();
  };
  main.handleFile = handleFile;
  let fileTotal = 0;
  const options = { async createAudioBuffer(_: ArrayBuffer) { return audio.decode(_) } };
  const zip = new ZipReader({ handler: async data => reader.read(data, options) });
  zip.addEventListener('loadstart', () => sendText('加载zip组件...'));
  zip.addEventListener('read', evt => { handleFile('zip', zip.total, pick((evt as CustomEvent<ReaderData>).detail)) });
  blockUpload.addEventListener('click', uploader.uploadFile.bind(uploader));
  blockUploadFile.addEventListener('click', uploader.uploadFile.bind(uploader));
  blockUploadDir.addEventListener('click', uploader.uploadDir.bind(uploader));
  uploader.addEventListener('change', loadComplete);
  uploader.addEventListener('progress', evt => { // 显示加载文件进度
    if (!(evt as ProgressEvent).total) return;
    const percent = Math.floor((evt as ProgressEvent).loaded / (evt as ProgressEvent).total * 100);
    sendText(`加载文件：${percent}% (${bytefm((evt as ProgressEvent).loaded)}/${bytefm((evt as ProgressEvent).total)})`);
  });
  uploader.addEventListener('load', evt => {
    // console.log(evt);
    const { file: { name, webkitRelativePath: path }, buffer } = evt as ProgressEvent & { file: File; buffer: ArrayBuffer };
    const isZip = buffer.byteLength > 4 && new DataView(buffer).getUint32(0, false) === 0x504b0304;
    const data: ByteData = { pathname: path || name, buffer };
    const handler = async() => {
      fileTotal++;
      const result = await reader.read(data, options);
      await handleFile('file', fileTotal, pick(result));
    };
    // 检测buffer是否为zip
    if (isZip) zip.read(data);
    else handler();
  });
  function pick(data: ReaderData) {
    console.log(data);
    switch (data.type) {
      case 'line':
        chartLineDataList.push(...data.data);
        break;
      case 'info':
        chartInfoDataList.push(...data.data);
        break;
      case 'media': {
        const basename = getUniqueName(data.pathname, bgms);
        bgms.set(basename, data.data);
        selectbgm.appendChild(createOption(basename, data.pathname));
        selectbgm.dispatchEvent(new Event('change'));
        break;
      }
      case 'image': {
        const basename = getUniqueName(data.pathname, bgs);
        bgs.set(basename, new ImageStore(data.data));
        selectbg.appendChild(createOption(basename, data.pathname));
        selectbg.dispatchEvent(new Event('change'));
        break;
      }
      case 'chart': {
        if (data.msg) {
          data.msg.forEach(v => {
            if (typeof v === 'string') sendWarning(v);
            else sendWarning({ ...v, target: data.pathname });
          });
        }
        if (data.info) chartInfoDataList.push(...data.info);
        if (data.line) chartLineDataList.push(...data.line);
        const basename = getUniqueName(data.pathname, charts);
        charts.set(basename, data.data);
        chartsMD5.set(basename, data.md5);
        chartsFormat.set(basename, data.format);
        selectchart.appendChild(createOption(basename, data.pathname));
        selectchart.dispatchEvent(new Event('change'));
        break;
      }
      default:
        console.warn(`Unsupported file: ${data.pathname}`);
        console.log(data.data);
        sendWarning(`不支持的文件：${data.pathname}\n${data.data as string || 'Error: Unknown File Type'}`);
    }
  }
  function createOption(value: string, innerhtml: string) {
    const option = document.createElement('option');
    const isHidden = /(^|\/)\./.test(innerhtml);
    option.innerHTML = isHidden ? '' : innerhtml;
    option.value = value;
    if (isHidden) option.classList.add('hide');
    return option;
  }
  function loadComplete() {
    if (uploaderDone === uploaderTotal) {
      blockUploader.classList.remove('disabled');
      adjustInfo();
    } else blockUploader.classList.add('disabled');
  }
  function getUniqueName(name: string, set: Map<string, unknown>): string {
    let basename = name;
    while (set.has(basename)) basename += '\n';
    return basename;
  }
}());
main.uploader = uploader;
const isBeta = String(meta[1][3]).startsWith('b');
const resLink = atob('aHR0cHM6Ly9sY2h6aC5uZXQvZGF0YS9wYWNrLmpzb24=');
// const resLink = 'local/ptres.json';
import('@/plugins/demo/index.js').then(a => a.default(isBeta));
// Hit start
const hitManager = new HitManager();
const exitFull = () => {
  if (full.onchange) document.removeEventListener(full.onchange, exitFull);
  hitManager.clear('keyboard'); // Esc退出全屏只有onchange事件能检测到
  stage.setFull(full.check());
  stage.resize();
};
// TODO: better way to handle this
const timeIn = new Timer();
const timeOut = new Timer();
const timeEnd = new Timer();
const specialClick = {
  time: [0, 0, 0, 0],
  func: [
    async() => Promise.resolve().then(mainPause),
    async() => Promise.resolve().then(mainPlay).then(mainPlay),
    async() => Promise.resolve().then(() => showStat.toggle()),
    async() => {
      const isFull = stage.getFull();
      try {
        await full.toggle();
        if (!stage.setFull(full.check())) return;
        if (full.onchange) document.addEventListener(full.onchange, exitFull);
        if (!lockOri.checked) return;
        await orientation.lockLandscape();
      } catch (e) {
        console.warn(e); // TODO: 未知错误处理
        stage.setFull(!isFull);
      } finally {
        stage.resize();
      }
    }
  ],
  click(id: number) {
    const now = performance.now();
    if (now - this.time[id] < 300) {
      this.func[id]().catch((e: unknown) => {
        console.warn(e);
        const msg = e instanceof Error ? e.message : String(e);
        main.toast(`按太多下了！(${msg})`); // TODO: 忽略操作
      });
    }
    this.time[id] = now;
  },
  activate(offsetX: number, offsetY: number) {
    const { lineScale } = app;
    if (offsetX < lineScale * 1.5 && offsetY < lineScale * 1.5) this.click(0);
    if (offsetX > canvasfg.width - lineScale * 1.5 && offsetY < lineScale * 1.5) this.click(1);
    if (offsetX < lineScale * 1.5 && offsetY > canvasfg.height - lineScale * 1.5) this.click(2);
    if (offsetX > canvasfg.width - lineScale * 1.5 && offsetY > canvasfg.height - lineScale * 1.5) this.click(3);
    if (timeEnd.second > 0) main.pressTime = main.pressTime > 0 ? -timeEnd.second : timeEnd.second;
  }
};
function getJudgeOffset(judgeEvent: JudgeEvent, note: Renderer.Note) {
  const { offsetX, offsetY } = judgeEvent;
  const { offsetX: x, offsetY: y, cosr, sinr } = note;
  return Math.abs((offsetX - x) * cosr + (offsetY - y) * sinr) || 0;
}
function getJudgeDistance(judgeEvent: JudgeEvent, note: Renderer.Note) {
  const { offsetX, offsetY } = judgeEvent;
  const { offsetX: x, offsetY: y, cosr, sinr } = note;
  return Math.abs((offsetX - x) * cosr + (offsetY - y) * sinr) + Math.abs((offsetX - x) * sinr - (offsetY - y) * cosr) || 0;
}
const res = {} as ResourceMap; // 存放资源
let nowTimeMS = 0; // 当前绝对时间(ms)
let curTime = 0; // 最近一次暂停的音乐时间(s)
let curTimeMS = 0; // 最近一次播放的绝对时间(ms)
let timeBgm = 0; // 当前音乐时间(s)
let timeChart = 0; // 当前谱面时间(s)
let duration0 = 0; // 音乐时长(s)
let isInEnd = false; // 开头过渡动画
let isOutStart = false; // 结尾过渡动画
let isOutEnd = false; // 临时变量
// 必要组件
const musicController = new AudioController();
const soundController = new AudioController();
const frameTimer = new FrameTimer();
const frameAnimater = new FrameAnimater();
frameAnimater.setCallback(mainLoop);
const handlerHide = () => { if (document.visibilityState === 'hidden' && emitter.eq('play')) mainPause(); };
document.addEventListener('visibilitychange', handlerHide);
document.addEventListener('pagehide', handlerHide); // 兼容Safari
let isOutOver = false;
let tempStat = null as StatData | null;
const tmps = {
  bgImage: null as unknown as ImageBitmap,
  bgVideo: null as HTMLVideoElement | null,
  bgMusicHack: (_: AudioBufferSourceNode): void => {},
  progress: 0,
  name: '',
  artist: '',
  illustrator: '',
  charter: '',
  level: '',
  combo: '',
  combo2: '',
  showStat: false,
  customForeDraw: null as ((ctx: CanvasRenderingContext2D) => void) | null,
  customBackDraw: null as ((ctx: CanvasRenderingContext2D) => void) | null
};
function playBgm(data: AudioBuffer | null, offset?: number) {
  curTimeMS = performance.now();
  if (data == null) return;
  tmps.bgMusicHack = musicController.play(data, {
    offset: (offset ?? 0) || 0,
    playbackrate: app.speed,
    interval: autoDelay.checked ? 1 : 0
  }) as (_: AudioBufferSourceNode) => void;
}
async function playVideo(data: HTMLVideoElement, offset?: number) {
  data.currentTime = (offset ?? 0) || 0;
  data.playbackRate = app.speed;
  data.muted = true;
  await data.play();
}
const hitImageList = new HitEvents({
  // 存放点击特效
  updateCallback: (i: HitImage) => nowTimeMS >= i.time + i.duration,
  iterateCallback(i: HitImage) {
    const tick = (nowTimeMS - i.time) / i.duration;
    const { effects } = i;
    ctxfg.globalAlpha = 1;
    ctxfg.setTransform(app.noteScaleRatio * 6, 0, 0, app.noteScaleRatio * 6, i.offsetX, i.offsetY); // 缩放
    // ctxfg.rotate(i.rotation);
    (effects[Math.floor(tick * effects.length)] ?? effects[effects.length - 1]).full(ctxfg); // 停留约0.5秒
    ctxfg.fillStyle = i.color;
    ctxfg.globalAlpha = 1 - tick; // 不透明度
    const r3 = 30 * (((0.2078 * tick - 1.6524) * tick + 1.6399) * tick + 0.4988); // 方块大小
    for (const j of i.direction) {
      const ds = j[0] * (9 * tick / (8 * tick + 1)); // 打击点距离
      ctxfg.fillRect(ds * Math.cos(j[1]) - r3 / 2, ds * Math.sin(j[1]) - r3 / 2, r3, r3);
    }
  }
});
const hitWordList = new HitEvents({
  // 存放点击特效
  updateCallback: (i: HitWord) => nowTimeMS >= i.time + i.duration,
  iterateCallback(i: HitWord) {
    const tick = (nowTimeMS - i.time) / i.duration;
    ctxfg.setTransform(1, 0, 0, 1, i.offsetX, i.offsetY); // 缩放
    ctxfg.font = `bold ${app.noteScaleRatio * (256 + 128 * (((0.2078 * tick - 1.6524) * tick + 1.6399) * tick + 0.4988))}px Custom,Noto Sans SC`;
    ctxfg.textAlign = 'center';
    ctxfg.fillStyle = i.color;
    ctxfg.globalAlpha = 1 - tick; // 不透明度
    ctxfg.fillText(i.text, 0, -app.noteScaleRatio * 128);
  }
});
const judgeManager = {
  list: [] as JudgeEvent[],
  addEvent(notes: Renderer.Note[], seconds: number) {
    const { list } = this;
    list.length = 0;
    if (app.playMode === 1) {
      const dispTime = Math.min(frameTimer.disp, 0.04);
      for (const note of notes) {
        if (note.scored) continue;
        const deltaTime = note.seconds - seconds;
        if (note.type === 1) {
          if (deltaTime < dispTime) list[list.length] = new JudgeEvent(note.offsetX, note.offsetY, 1);
        } else if (note.type === 2) {
          if (deltaTime < dispTime) list[list.length] = new JudgeEvent(note.offsetX, note.offsetY, 2);
        } else if (note.type === 3) {
          if (note.holdTapTime) list[list.length] = new JudgeEvent(note.offsetX, note.offsetY, 2);
          else if (deltaTime < dispTime) list[list.length] = new JudgeEvent(note.offsetX, note.offsetY, 1);
        } else if (note.type === 4) if (deltaTime < dispTime) list[list.length] = new JudgeEvent(note.offsetX, note.offsetY, 3);
      }
    } else if (emitter.eq('play')) {
      for (const evt of hitManager.list) {
        if (!evt.isTapped) list[list.length] = new JudgeEvent(evt.offsetX, evt.offsetY, 1);
        if (evt.isActive) list[list.length] = new JudgeEvent(evt.offsetX, evt.offsetY, 2);
        if (evt.type === 'keyboard') list[list.length] = new JudgeEvent(evt.offsetX, evt.offsetY, 3); // 以后加上Flick判断
        if (evt.flicking && !evt.flicked) list[list.length] = new JudgeEvent(evt.offsetX, evt.offsetY, 3, evt);
      // i.flicked = true; 不能在这里判断，因为可能会判定不到
      }
    }
  },
  execute(notes: Renderer.Note[], seconds: number, width: number) {
    const { list } = this;
    for (const note of notes) {
      if (note.scored) continue; // 跳过已判分的Note
      const deltaTime = note.seconds - seconds;
      if (deltaTime > 0.2) break; // 跳过判定范围外的Note
      if (note.type !== 1 && deltaTime > 0.16) continue;
      if (deltaTime < -0.16 && note.frameCount > 4 && !note.holdStatus) {
        // 超时且不为Hold拖判，判为Miss
        // console.log('Miss', i.name);
        note.status = 2;
        stat.addCombo(2, note.type);
        note.scored = true;
      } else if (note.type === 2) {
        // Drag音符
        if (deltaTime > 0) {
          for (const judgeEvent of list) {
            if (judgeEvent.type !== 1) continue; // 跳过非Tap判定
            if (getJudgeOffset(judgeEvent, note) > width) continue;
            judgeEvent.preventBad = true;
          }
        }
        if (note.status !== 4) {
          for (const judgeEvent of list) {
            if (judgeEvent.type !== 2) continue; // 跳过非Drag判定
            if (getJudgeOffset(judgeEvent, note) > width) continue;
            // console.log('Perfect', i.name);
            note.status = 4;
            break;
          }
        } else if (deltaTime < 0) {
          soundController.play(res.HitSong1);
          hitImageList.add(HitImage.perfect(note.projectX, note.projectY, note));
          stat.addCombo(4, 2);
          note.scored = true;
        }
      } else if (note.type === 4) {
        // Flick音符
        if (deltaTime > 0 || note.status !== 4) {
          for (const judgeEvent of list) {
            if (judgeEvent.type !== 1) continue;
            // 跳过非Tap判定
            if (getJudgeOffset(judgeEvent, note) > width) continue;
            judgeEvent.preventBad = true;
          }
        }
        if (note.status !== 4) {
          for (const judgeEvent of list) {
            if (judgeEvent.type !== 3) continue;
            // 跳过非Move判定
            if (getJudgeOffset(judgeEvent, note) > width) continue;
            let distance = getJudgeDistance(judgeEvent, note);
            let noteJudge = note;
            let nearcomp = false;
            for (const nearNote of note.nearNotes) {
              if (nearNote.status) continue;
              if (nearNote.seconds - seconds > 0.16) break;
              if (getJudgeOffset(judgeEvent, nearNote) > width) continue;
              const nearDistance = getJudgeDistance(judgeEvent, nearNote);
              if (nearDistance < distance) {
                distance = nearDistance;
                noteJudge = nearNote;
                nearcomp = true;
              }
            }
            // console.log('Perfect', i.name);
            if (judgeEvent.event == null) {
              noteJudge.status = 4;
              if (!nearcomp) break;
            } else if (!judgeEvent.event.flicked) {
              noteJudge.status = 4;
              judgeEvent.event.flicked = true;
              if (!nearcomp) break;
            }
          }
        } else if (deltaTime < 0) {
          soundController.play(res.HitSong2);
          hitImageList.add(HitImage.perfect(note.projectX, note.projectY, note));
          stat.addCombo(4, 4);
          note.scored = true;
        }
      } else {
        // Hold音符
        if (note.type === 3 && note.holdTapTime) {
          // 是否触发头判
          if ((performance.now() - note.holdTapTime) * note.holdTime >= 1.6e4 * note.holdSeconds) {
            // 间隔时间与bpm成反比
            if (note.holdStatus % 4 === 0) hitImageList.add(HitImage.perfect(note.projectX, note.projectY, note));
            else if (note.holdStatus % 4 === 1) hitImageList.add(HitImage.perfect(note.projectX, note.projectY, note));
            else if (note.holdStatus % 4 === 3) hitImageList.add(HitImage.good(note.projectX, note.projectY, note));
            note.holdTapTime = performance.now();
          }
          if (deltaTime + note.holdSeconds < 0.2) {
            if (!note.status) stat.addCombo(note.status = note.holdStatus, 3);
            if (deltaTime + note.holdSeconds < 0) note.scored = true;
            continue;
          }
          note.holdBroken = true; // 若1帧内未按住并使其转为false，则判定为Miss
        }
        for (const judgeEvent of list) {
          if (note.holdTapTime) {
            // 头判
            if (judgeEvent.type !== 2) continue;
            if (getJudgeOffset(judgeEvent, note) <= width) {
              note.holdBroken = false;
              break;
            }
            continue;
          }
          if (judgeEvent.type !== 1) continue;
          // 跳过非Tap判定
          if (judgeEvent.judged) continue;
          // 跳过已触发的判定
          if (getJudgeOffset(judgeEvent, note) > width) continue;
          let deltaTime2 = deltaTime;
          let distance = getJudgeDistance(judgeEvent, note);
          let noteJudge = note;
          let nearcomp = false;
          for (const nearNote of note.nearNotes) {
            if (nearNote.status) continue;
            if (nearNote.holdTapTime) continue;
            const nearDeltaTime = nearNote.seconds - seconds;
            if (nearDeltaTime > 0.2) break;
            if (nearNote.type === 3 && nearDeltaTime > 0.16) continue;
            if (getJudgeOffset(judgeEvent, nearNote) > width) continue;
            const nearDistance = getJudgeDistance(judgeEvent, nearNote);
            if (nearDistance < distance) {
              deltaTime2 = nearDeltaTime;
              distance = nearDistance;
              noteJudge = nearNote;
              nearcomp = true;
            }
          }
          if (deltaTime2 > 0.16) {
            if (judgeEvent.preventBad) continue;
            noteJudge.status = 6; // console.log('Bad', i.name);
            noteJudge.badTime = performance.now();
          } else {
            const note1 = noteJudge;
            stat.addDisp(Math.max(deltaTime2, (-1 - note1.frameCount) * 0.04 || 0));
            soundController.play(res.HitSong0);
            if (deltaTime2 > 0.08) {
              note1.holdStatus = 7; // console.log('Good(Early)', i.name);
              hitImageList.add(HitImage.good(note1.projectX, note1.projectY, note1));
              hitWordList.add(HitWord.early(note1.projectX, note1.projectY));
            } else if (deltaTime2 > 0.04) {
              note1.holdStatus = 5; // console.log('Perfect(Early)', i.name);
              hitImageList.add(HitImage.perfect(note1.projectX, note1.projectY, note1));
              hitWordList.add(HitWord.early(note1.projectX, note1.projectY));
            } else if (deltaTime2 > -0.04 || note1.frameCount < 1) {
              note1.holdStatus = 4; // console.log('Perfect(Max)', i.name);
              hitImageList.add(HitImage.perfect(note1.projectX, note1.projectY, note1));
            } else if (deltaTime2 > -0.08 || note1.frameCount < 2) {
              note1.holdStatus = 1; // console.log('Perfect(Late)', i.name);
              hitImageList.add(HitImage.perfect(note1.projectX, note1.projectY, note1));
              hitWordList.add(HitWord.late(note1.projectX, note1.projectY));
            } else {
              note1.holdStatus = 3; // console.log('Good(Late)', i.name);
              hitImageList.add(HitImage.good(note1.projectX, note1.projectY, note1));
              hitWordList.add(HitWord.late(note1.projectX, note1.projectY));
            }
            if (note1.type === 1) note1.status = note1.holdStatus;
          }
          if (noteJudge.status) {
            stat.addCombo(noteJudge.status, 1);
            noteJudge.scored = true;
          } else {
            noteJudge.holdTapTime = performance.now();
            noteJudge.holdBroken = false;
          }
          judgeEvent.judged = true;
          noteJudge.statOffset = deltaTime2; // TODO: (Replay)也许是统计偏移量？
          if (!nearcomp) break;
        }
        if (emitter.eq('play') && note.holdTapTime && note.holdBroken) {
          note.status = 2; // console.log('Miss', i.name);
          stat.addCombo(2, 3);
          note.scored = true;
        }
      }
    }
  }
};
const hitFeedbackList = new HitEvents({
  // 存放点击特效
  updateCallback: (i: HitFeedback) => i.time++ > 0,
  iterateCallback(i: HitFeedback) {
    ctxfg.globalAlpha = 0.85;
    ctxfg.setTransform(1, 0, 0, 1, i.offsetX, i.offsetY); // 缩放
    ctxfg.fillStyle = i.color;
    ctxfg.beginPath();
    ctxfg.arc(0, 0, app.lineScale * 0.5, 0, 2 * Math.PI);
    ctxfg.fill();
  }
});
const interact = new InteractProxy(canvas);
// 兼容PC鼠标
interact.setMouseEvent({
  mousedownCallback(evt: MouseEvent) {
    const idx = evt.button;
    const { x, y } = getPos(evt);
    if (idx === 1) hitManager.activate('mouse', 4, x, y);
    else if (idx === 2) hitManager.activate('mouse', 2, x, y);
    else hitManager.activate('mouse', 1 << idx, x, y);
    specialClick.activate(x, y);
  },
  mousemoveCallback(evt: MouseEvent) {
    const idx = evt.buttons;
    const { x, y } = getPos(evt);
    for (let i = 1; i < 32; i <<= 1) {
      // 同时按住多个键时，只有最后一个键的move事件会触发
      if (idx & i) hitManager.moving('mouse', i, x, y);
      else hitManager.deactivate('mouse', i);
    }
  },
  mouseupCallback(evt: MouseEvent) {
    const idx = evt.button;
    if (idx === 1) hitManager.deactivate('mouse', 4);
    else if (idx === 2) hitManager.deactivate('mouse', 2);
    else hitManager.deactivate('mouse', 1 << idx);
  }
});
// 兼容键盘(喵喵喵?)
interact.setKeyboardEvent({
  keydownCallback(evt: KeyboardEvent) {
    if (emitter.eq('stop')) return;
    if (evt.key === 'Shift') btnPause.click();
    else if (hitManager.list.find(i => i.type === 'keyboard' && i.id === evt.code) == null) {
      hitManager.activate('keyboard', evt.code, NaN, NaN); // 按住一个键时，会触发多次keydown事件
    }
  },
  keyupCallback(evt: KeyboardEvent) {
    if (emitter.eq('stop')) return;
    if (evt.key !== 'Shift') hitManager.deactivate('keyboard', evt.code);
  }
});
self.addEventListener('blur', () => {
  hitManager.clear('keyboard');
});
// 兼容移动设备
interact.setTouchEvent({
  touchstartCallback(evt: TouchEvent) {
    for (const touch of evt.changedTouches) {
      const { x, y } = getPos(touch);
      hitManager.activate('touch', touch.identifier, x, y);
      specialClick.activate(x, y);
    }
  },
  touchmoveCallback(evt: TouchEvent) {
    for (const touch of evt.changedTouches) {
      const { x, y } = getPos(touch);
      hitManager.moving('touch', touch.identifier, x, y);
    }
  },
  touchendCallback(evt: TouchEvent) {
    for (const touch of evt.changedTouches) hitManager.deactivate('touch', touch.identifier);
  },
  touchcancelCallback(evt: TouchEvent) {
    // if (emitter.eq('play')) mainPause(); TODO: 意外暂停提醒
    for (const touch of evt.changedTouches) hitManager.deactivate('touch', touch.identifier);
  }
});
function getPos(obj: MouseEvent | Touch) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (obj.clientX - rect.left) / canvas.offsetWidth * canvas.width - (canvas.width - canvasfg.width) / 2,
    y: (obj.clientY - rect.top) / canvas.offsetHeight * canvas.height
  };
}
// Hit end
const noteRender = {
  note: {} as Record<string, ScaledNote>,
  hitFX: {} as Record<string, ScaledHitFX>,
  async update(name: string, img: ImageBitmap, scale: number, compacted = false): Promise<void> {
    this.note[name] = new ScaledNote(img, scale, compacted);
    if (name === 'Tap') this.note.TapBad = new ScaledNote(await imgPainter(img, '#6c4343'), scale);
  },
  async updateFX(img0: ImageBitmap, scale: number, limitX?: number, limitY?: number, hideParts = false, duration?: number): Promise<void> {
    const hitRaw = await imgSplit(img0, limitX, limitY);
    const hitPerfect = hitRaw.map(async img => new ScaledNote(await imgShader(img, 'rgba(255,236,160,0.8823529)'), scale)); // #fce491,#ffeca0e1
    const hitGood = hitRaw.map(async img => new ScaledNote(await imgShader(img, 'rgba(180,225,255,0.9215686)'), scale)); // #9ed5f3,#b4e1ffeb
    img0.close();
    this.hitFX.Perfect = {
      effects: await Promise.all(hitPerfect),
      numOfParts: hideParts ? 0 : 4,
      duration: Number(duration) | 0 || 500
    };
    this.hitFX.Good = {
      effects: await Promise.all(hitGood),
      numOfParts: hideParts ? 0 : 3,
      duration: Number(duration) | 0 || 500
    };
    hitRaw.forEach(img => img.close());
  }
};
// 初始化(踩坑：监听DOMContentLoaded似乎会阻塞页面导致长时间白屏)
window.addEventListener('load', (): void => {
  const handler = async(): Promise<void> => {
    canvas.classList.add('fade');
    // let loadedNum = 0;
    // let errorNum = 0;
    sendText('初始化...');
    if (await checkSupport({
      messageCallback: sendText,
      warnCallback: sendWarning,
      errorCallback: sendError,
      mobileCallback: () => blockUploaderSelect.style.display = 'none',
      orientNotSupportCallback: () => {
        lockOri.checked = false;
        lockOri.container.classList.add('disabled');
        lockOri.label.textContent += '(当前设备或浏览器不支持)';
      }
    })) return;
    await import('@/utils/reader-');
    const raw = await loadResource(resLink).catch(() => null) || {
      image: {} as Record<string, string>,
      audio: {} as Record<string, string>,
      alternative: {} as Record<string, string>,
      format: ''
    };
    // if (!raw) return; // 占位符
    // shit start
    await readResource(raw);
    // .then(result => {
    //   loadedNum += result.loadedNum;
    //   errorNum += result.errorNum;
    // })
    // shit end
    // if (errorNum) {
    //   sendError(`错误：${errorNum}个资源加载失败（点击查看详情）`);
    //   return;
    // }
    const entries = ['Tap', 'TapHL', 'Drag', 'DragHL', 'HoldHead', 'HoldHeadHL', 'Hold', 'HoldHL', 'HoldEnd', 'Flick', 'FlickHL'];
    await fixme(raw, res);
    await Promise.all(entries.map(async i => noteRender.update(i, res[i] as ImageBitmap, 8080 / Number(raw.image[i].split('|')[1]))));
    // for (const entry of entries) await noteRender.update(entry, res[entry], 8080 / raw.image[entry].split('|')[1]);
    await noteRender.updateFX(res.HitFXRaw, 8080 / Number(raw.image.HitFXRaw.split('|')[1]));
    res.NoImageBlack = await createImageBitmap(new ImageData(new Uint8ClampedArray(4).fill(0), 1, 1));
    res.NoImageWhite = await createImageBitmap(new ImageData(new Uint8ClampedArray(4).fill(255), 1, 1));
    res.JudgeLineMP = await imgShader(res.JudgeLine, '#feffa9');
    res.JudgeLineFC = await imgShader(res.JudgeLine, '#a2eeff');
    res.Ranks = await imgSplit(res.Rank);
    res.Rank.close();
    res.mute = audio.mute(1);
    if ((() => {
      const b = createCtx(1, 1);
      b.drawImage(res.JudgeLine, 0, 0);
      return b.getImageData(0, 0, 1, 1).data[0];
    })() === 0) {
      sendError('检测到图片加载异常，请关闭所有应用程序然后重试');
      return;
    }
    sendText('等待上传文件...');
    blockUploader.classList.remove('disabled');
    blockSelect.classList.remove('disabled');
    emitter.dispatchEvent(new CustomEvent('change'));
  };
  handler();
}, { once: true });
async function loadResource(url: string) {
  const res1 = await fetch(url);
  const text = await res1.text();
  try {
    return JSON.parse(text) as {
      image: Record<string, string>;
      audio: Record<string, string>;
      alternative: Record<string, string>;
    };
  } catch (err) {
    sendError('错误：解析资源时出现问题（点击查看详情）', Utils.escapeHTML(`解析资源时出现问题：\n${(err as Error).message}\n原始数据：\n${text}`), true);
    return null;
  }
}
async function readResource(raw: {
  format?: string;
  image: Record<string, string>;
  audio: Record<string, string>;
  alternative: Record<string, string>;
}) {
  let loadedNum = 0;
  let errorNum = 0;
  const res0: Record<string, string> = {};
  Object.assign(res0, raw.image);
  Object.assign(res0, raw.audio);
  // 加载资源
  const res1 = [] as Promise<void>[];
  if (raw.format === 'raw') {
    res1.push(...Object.entries(raw.image).map(async([name, src]) => {
      const [url, ext] = src.split('|');
      console.log(url, ext);
      await fetch(url, { referrerPolicy: 'no-referrer' }).then(async a => a.blob()).then(async blob => {
        const img = await createImageBitmap(blob);
        res[name] = img;
        sendText(`加载资源：${Math.floor(loadedNum++ / res1.length * 100)}%`);
      }).catch(() => {
        errorNum++;
        sendWarning(`资源加载失败，请检查您的网络连接然后重试：\n${new URL(url, location.toString()).toString()}`);
      });
    }));
    res1.push(...Object.entries(raw.audio).map(async([name, src]) => {
      await fetch(src, { referrerPolicy: 'no-referrer' }).then(async a => a.arrayBuffer()).then(async buffer => {
        res[name] = await audio.decode(buffer);
        sendText(`加载资源：${Math.floor(loadedNum++ / res1.length * 100)}%`);
      }).catch(() => {
        errorNum++;
        sendWarning(`资源加载失败，请检查您的网络连接然后重试：\n${new URL(src, location.toString()).toString()}`);
      });
    }));
  } else {
    res1.push(...Object.entries(res0).map(async([name, src]) => {
      const [url, ext] = src.split('|') as [string, string | null];
      await fetch(url, { referrerPolicy: 'no-referrer' }).then(async a => a.blob()).then(async blob => {
        const img = await createImageBitmap(blob);
        if (ext != null && ext.startsWith('m')) {
          const data = ImgAny.decode(img, Number(ext.slice(1)));
          img.close();
          res[name] = await audio.decode(data).catch(async(_e: unknown) => {
            const blob1 = await fetch(raw.alternative[name], {
              referrerPolicy: 'no-referrer'
            }).then(async i => i.blob());
            return createImageBitmap(blob1).then(ImgAny.decodeAlt).then(async ab => audio.decode(ab)).catch((e: unknown) => {
              const err = e instanceof Error ? e : new Error('Unknown error');
              sendWarning(`音频加载存在问题，将导致以下音频无法正常播放：\n${name}(${err.message})\n如果多次刷新问题仍然存在，建议更换设备或浏览器。`);
              return audio.mute(1);
            });
          });
        } else res[name] = img;
        sendText(`加载资源：${Math.floor(loadedNum++ / res1.length * 100)}%`);
      }).catch((err: unknown) => {
        console.error(err);
        sendError(`错误：${errorNum++}个资源加载失败（点击查看详情）`, `资源加载失败，请检查您的网络连接然后重试：\n${new URL(url, location.toString()).toString()}`, true);
      });
    }));
  }
  await Promise.all(res1);
  return { loadedNum, errorNum };
}
const background = {
  isBlur: false,
  image: null as ImageStore | null,
  getImage() {
    if (!this.image) return res.NoImageWhite;
    return this.image.base;
  },
  getImageBlur() {
    if (!this.image) return res.NoImageWhite;
    return this.isBlur ? this.image.blur : this.image.base;
  }
};
checkImageBlur.addEventListener('change', () => {
  background.isBlur = checkImageBlur.checked;
});
checkImageBlur.dispatchEvent(new Event('change'));
// 作图
function mainLoop() {
  frameTimer.addTick(); // 计算fps
  const { lineScale } = app;
  nowTimeMS = performance.now();
  app.resizeCanvas();
  // 计算时间
  if (timeOut.second < 0.67) {
    loopNoCanvas();
    for (const callback of main.now.values()) callback(timeBgm * app.speed);
    loopCanvas();
  } else if (!isOutOver) {
    isOutOver = true;
    audio.stop();
    btnPause.classList.add('disabled'); // TODO: 优化
    ctxfg.globalCompositeOperation = 'source-over';
    ctxfg.resetTransform();
    ctxfg.globalAlpha = 1;
    const bgImageBlur = background.getImageBlur();
    ctxfg.drawImage(bgImageBlur, ...adjustSize(bgImageBlur, canvasfg, 1));
    ctxfg.fillStyle = '#000'; // 背景变暗
    ctxfg.globalAlpha = app.brightness; // 背景不透明度
    ctxfg.fillRect(0, 0, canvasfg.width, canvasfg.height);
    self.setTimeout(() => {
      if (!isOutOver) return; // 避免快速重开后直接结算
      const difficulty = levelInfoHandler.getDifficultyIndex();
      musicController.play(res[`LevelOver${difficulty < 0 ? 2 : difficulty}_v1`] as AudioBuffer, { loop: true });
      timeEnd.reset();
      timeEnd.play();
      stat.level = levelInfoHandler.getLevelNumber();
      tempStat = stat.getData(app.playMode === 1, selectspeed.value);
    }, 1e3);
  } // 只让它执行一次
  if (tempStat != null) atDraw3(tempStat);
  ctx.globalAlpha = 1;
  const bgImageBlur = background.getImageBlur();
  ctx.drawImage(bgImageBlur, ...adjustSize(bgImageBlur, canvas, 1.1));
  ctx.fillStyle = '#000';
  ctx.globalAlpha = 0.4;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = 1;
  ctx.drawImage(canvasfg, (canvas.width - canvasfg.width) / 2, 0);
  for (const callback of main.afterAll.values()) callback();
  // Copyright
  ctx.globalCompositeOperation = 'difference';
  ctx.font = `${lineScale * 0.4}px Custom,Noto Sans SC`;
  ctx.fillStyle = '#fff';
  ctx.globalAlpha = 0.8;
  ctx.textAlign = 'right';
  ctx.fillText(`${meta[0]} v${meta[1].join('.')} - Code by lchz\x683\x3473`, (canvas.width + canvasfg.width) / 2 - lineScale * 0.1, canvas.height - lineScale * 0.1);
  ctx.globalCompositeOperation = 'source-over';
}
function loopNoCanvas() {
  if (app.chart == null) throw new Error('Not initialized: Chart');
  if (!isInEnd && timeIn.second >= 3 && emitter.eq('play')) { // fixed: 修复关闭过渡动画时重开1帧内点击暂停产生显示暂停实际音乐播放的问题
    isInEnd = true;
    playBgm(app.bgMusic);
    if (app.bgVideo != null) playVideo(app.bgVideo);
  }
  if (emitter.eq('play') && isInEnd && !isOutStart) timeBgm = curTime + (nowTimeMS - curTimeMS) / 1e3;
  if (timeBgm < 0) timeBgm = 0; // fixed: 修复重开后时间轴不归零的问题
  if (timeBgm >= duration0) isOutStart = true;
  if (showTransition.checked && isOutStart && !isOutEnd) {
    isOutEnd = true;
    timeOut.play();
  }
  timeChart = Math.max(timeBgm - (app.chart.offset + Number(inputOffset.value) / 1e3 || 0) / app.speed, 0);
  // 遍历判定线events和Note
  app.updateByTime(timeChart);
  // 更新打击特效和触摸点动画
  hitFeedbackList.update();
  hitImageList.update();
  hitWordList.update();
  for (const evt of hitManager.list) {
    if (evt.type === 'keyboard') continue;
    if (!evt.isTapped) hitFeedbackList.add(HitFeedback.tap(evt.offsetX, evt.offsetY));
    else if (evt.isMoving) hitFeedbackList.add(HitFeedback.move(evt.offsetX, evt.offsetY));
    else if (evt.isActive) hitFeedbackList.add(HitFeedback.hold(evt.offsetX, evt.offsetY)); // TODO: 动态特效
  }
  // 触发判定和播放打击音效
  if (isInEnd) {
    const judgeWidth = canvasfg.width * 0.118125;
    judgeManager.addEvent(app.notes, timeChart);
    judgeManager.execute(app.drags, timeChart, judgeWidth);
    judgeManager.execute(app.flicks, timeChart, judgeWidth);
    judgeManager.execute(app.tapholds, timeChart, judgeWidth);
  }
  // 更新判定
  hitManager.update();
  // if (awawa && stat.good + stat.bad) {
  //   stat.level = Number(levelText.match(/\d+$/));
  //   stat.reset();
  //   Promise.resolve().then(mainPlay).then(mainPlay);
  // }
  tmps.bgImage = background.getImageBlur();
  tmps.bgVideo = app.bgVideo;
  tmps.progress = (main.awawa ? duration0 - timeBgm : timeBgm) / duration0;
  tmps.name = inputName.value || inputName.placeholder;
  tmps.artist = inputArtist.value;
  tmps.illustrator = `Illustration designed by ${inputIllustrator.value || inputIllustrator.placeholder}`;
  tmps.charter = `Level designed by ${inputCharter.value || inputCharter.placeholder}`;
  tmps.level = levelInfoHandler.text;
  if (stat.combo > 2) {
    tmps.combo = `${stat.combo}`;
    tmps.combo2 = app.playMode === 1 ? 'Autoplay' : 'combo';
  } else {
    tmps.combo = '';
    tmps.combo2 = '';
  }
  tmps.showStat = true;
  tmps.customForeDraw = null;
  tmps.customBackDraw = null;
}
function loopCanvas() {
  const { lineScale, wlen, hlen } = app;
  const { bgImage, bgVideo } = tmps;
  ctxfg.clearRect(0, 0, canvasfg.width, canvasfg.height); // 重置画面
  // 绘制背景
  ctxfg.globalAlpha = 1;
  ctxfg.drawImage(bgImage, ...adjustSize(bgImage, canvasfg, 1));
  if (isInEnd && bgVideo != null && !main.awawa) {
    const { videoWidth: width, videoHeight: height } = bgVideo;
    ctxfg.drawImage(bgVideo, ...adjustSize({ width, height }, canvasfg, 1));
  }
  // if (awawa) ctxfg.filter = `hue-rotate(${stat.combo*360/7}deg)`;
  if (timeIn.second >= 2.5 && !stat.lineStatus) drawLine(0, lineScale); // 绘制判定线(背景后0)
  // if (awawa) ctxfg.filter = 'none';
  ctxfg.resetTransform();
  ctxfg.fillStyle = '#000'; // 背景变暗
  ctxfg.globalAlpha = app.brightness; // 背景不透明度
  ctxfg.fillRect(0, 0, canvasfg.width, canvasfg.height);
  if (timeIn.second >= 2.5 && tmps.customBackDraw != null) tmps.customBackDraw(ctxfg); // 自定义背景
  // if (awawa) ctxfg.filter = `hue-rotate(${stat.combo*360/7}deg)`;
  if (timeIn.second >= 2.5) drawLine(stat.lineStatus ? 2 : 1, lineScale); // 绘制判定线(背景前1)
  // if (awawa) ctxfg.filter = 'none';
  ctxfg.resetTransform();
  if (timeIn.second >= 3 && timeOut.second === 0) {
    // 绘制note
    drawNotes();
    if (showPoint.checked) {
      // 绘制定位点
      ctxfg.font = `${lineScale}px Custom,Noto Sans SC`;
      ctxfg.textAlign = 'center';
      for (const line of app.linesReversed) {
        ctxfg.setTransform(line.cosr, line.sinr, -line.sinr, line.cosr, line.offsetX, line.offsetY);
        ctxfg.globalAlpha = 1;
        ctxfg.fillStyle = 'violet';
        ctxfg.fillRect(-lineScale * 0.2, -lineScale * 0.2, lineScale * 0.4, lineScale * 0.4);
        ctxfg.fillStyle = 'yellow';
        ctxfg.globalAlpha = (line.alpha + 0.5) / 1.5;
        ctxfg.fillText(line.lineId.toString(), 0, -lineScale * 0.3);
      }
      for (const note of app.notesReversed) {
        if (!note.visible) continue;
        ctxfg.setTransform(note.cosr, note.sinr, -note.sinr, note.cosr, note.offsetX, note.offsetY);
        ctxfg.globalAlpha = 1;
        ctxfg.fillStyle = 'lime';
        ctxfg.fillRect(-lineScale * 0.2, -lineScale * 0.2, lineScale * 0.4, lineScale * 0.4);
        ctxfg.fillStyle = 'cyan';
        ctxfg.globalAlpha = note.seconds > timeChart ? 1 : 0.5;
        ctxfg.fillText(note.name, 0, -lineScale * 0.3);
      }
    }
  }
  // if (awawa) ctxfg.filter = `hue-rotate(${stat.combo*360/7}deg)`;
  hitImageList.animate(); // 绘制打击特效1
  // if (awawa) ctxfg.filter = 'none';
  if (showCE2.checked) hitWordList.animate(); // 绘制打击特效2
  ctxfg.globalAlpha = 1;
  // 绘制进度条
  ctxfg.setTransform(canvasfg.width / 1920, 0, 0, canvasfg.width / 1920, 0, lineScale * (timeIn.second < 0.67 ? tween.easeOutSine(timeIn.second * 1.5) - 1 : -tween.easeOutSine(timeOut.second * 1.5)) * 1.75);
  ctxfg.drawImage(res.ProgressBar, tmps.progress * 1920 - 1920, 0);
  // 绘制文字
  ctxfg.resetTransform();
  for (const callback of main.after.values()) callback();
  ctxfg.fillStyle = '#fff';
  // 开头过渡动画
  if (timeIn.second < 3) {
    if (timeIn.second < 0.67) ctxfg.globalAlpha = tween.easeOutSine(timeIn.second * 1.5);
    else if (timeIn.second >= 2.5) ctxfg.globalAlpha = tween.easeOutSine(6 - timeIn.second * 2);
    ctxfg.textAlign = 'center';
    // 曲名、曲师、曲绘和谱师
    fillTextNode(tmps.name, wlen, hlen * 0.75, lineScale * 1.1, canvasfg.width - lineScale * 1.5);
    fillTextNode(tmps.artist, wlen, hlen * 0.75 + lineScale * 1.25, lineScale * 0.55, canvasfg.width - lineScale * 1.5);
    fillTextNode(tmps.illustrator, wlen, hlen * 1.25 + lineScale * 0.55, lineScale * 0.55, canvasfg.width - lineScale * 1.5);
    fillTextNode(tmps.charter, wlen, hlen * 1.25 + lineScale * 1.4, lineScale * 0.55, canvasfg.width - lineScale * 1.5);
    // 判定线(装饰用)
    ctxfg.globalAlpha = 1;
    ctxfg.setTransform(1, 0, 0, 1, wlen, hlen);
    const imgW = lineScale * 48 * (timeIn.second < 0.67 ? tween.easeInSine(timeIn.second * 1.5) : 1);
    const imgH = lineScale * 0.15; // 0.1333...
    if (timeIn.second >= 2.5) ctxfg.globalAlpha = tween.easeOutSine(6 - timeIn.second * 2);
    ctxfg.drawImage(lineColor.checked ? res.JudgeLineMP : res.JudgeLine, -imgW / 2, -imgH / 2, imgW, imgH);
  }
  // 绘制分数和combo
  ctxfg.globalAlpha = 1;
  ctxfg.setTransform(1, 0, 0, 1, 0, lineScale * (timeIn.second < 0.67 ? tween.easeOutSine(timeIn.second * 1.5) - 1 : -tween.easeOutSine(timeOut.second * 1.5)) * 1.75);
  if (tmps.showStat) {
    ctxfg.font = `${lineScale * 0.95}px Custom,Noto Sans SC`;
    ctxfg.textAlign = 'right';
    ctxfg.fillText(stat.scoreStr, canvasfg.width - lineScale * 0.65, lineScale * 1.375);
    if (showAcc.checked) {
      ctxfg.font = `${lineScale * 0.66}px Custom,Noto Sans SC`;
      ctxfg.fillText(stat.accStr, canvasfg.width - lineScale * 0.65, lineScale * 2.05);
    }
  }
  ctxfg.textAlign = 'center';
  ctxfg.font = `${lineScale * 1.32}px Custom,Noto Sans SC`;
  ctxfg.fillText(tmps.combo, wlen, lineScale * 1.375);
  ctxfg.globalAlpha = timeIn.second < 0.67 ? tween.easeOutSine(timeIn.second * 1.5) : 1 - tween.easeOutSine(timeOut.second * 1.5);
  ctxfg.font = `${lineScale * 0.66}px Custom,Noto Sans SC`;
  ctxfg.fillText(tmps.combo2, wlen, lineScale * 2.05);
  // 绘制曲名和等级
  ctxfg.globalAlpha = 1;
  ctxfg.setTransform(1, 0, 0, 1, 0, lineScale * (timeIn.second < 0.67 ? 1 - tween.easeOutSine(timeIn.second * 1.5) : tween.easeOutSine(timeOut.second * 1.5)) * 1.75);
  ctxfg.textAlign = 'right';
  fillTextNode(tmps.level, canvasfg.width - lineScale * 0.75, canvasfg.height - lineScale * 0.66, lineScale * 0.63, wlen - lineScale);
  ctxfg.textAlign = 'left';
  fillTextNode(tmps.name, lineScale * 0.65, canvasfg.height - lineScale * 0.66, lineScale * 0.63, wlen - lineScale);
  ctxfg.resetTransform();
  // 绘制时间和帧率以及note打击数
  ctxfg.fillStyle = '#fff';
  if (timeIn.second < 0.67) ctxfg.globalAlpha = tween.easeOutSine(timeIn.second * 1.5);
  else ctxfg.globalAlpha = 1 - tween.easeOutSine(timeOut.second * 1.5);
  ctxfg.font = `${lineScale * 0.4}px Custom,Noto Sans SC`;
  ctxfg.textAlign = 'left';
  ctxfg.fillText(`${time2Str(main.awawa ? duration0 - timeBgm : timeBgm)}/${time2Str(duration0)}${status2.text}`, lineScale * 0.05, lineScale * 0.6);
  ctxfg.fillText(stat.format, canvasfg.width - lineScale * 4.35, lineScale * 0.6);
  ctxfg.textAlign = 'right';
  ctxfg.fillText(frameTimer.fpsStr, canvasfg.width - lineScale * 0.05, lineScale * 0.6);
  if (tmps.showStat && showStat.checked) {
    ctxfg.textAlign = 'right';
    [stat.noteRank[6], stat.noteRank[7], stat.noteRank[5], stat.noteRank[4], stat.noteRank[1], stat.noteRank[3], stat.noteRank[2]].forEach((val, idx) => {
      const comboColor = ['#fe7b93', '#0ac3ff', 'lime', '#f0ed69', 'lime', '#0ac3ff', '#999'];
      ctxfg.fillStyle = comboColor[idx];
      ctxfg.fillText(val.toString(), canvasfg.width - lineScale * 0.05, canvasfg.height / 2 + lineScale * (idx - 2.8) * 0.5);
    });
    ctxfg.fillStyle = '#fff';
    ctxfg.textAlign = 'left';
    ctxfg.fillText(`DSP:  ${stat.curDispStr}`, lineScale * 0.05, canvasfg.height / 2 - lineScale * 0.15);
    ctxfg.fillText(`AVG:  ${stat.avgDispStr}`, lineScale * 0.05, canvasfg.height / 2 + lineScale * 0.35);
    ctxfg.textAlign = 'center';
    stat.combos.forEach((val, idx) => {
      const comboColor = ['#fff', '#0ac3ff', '#f0ed69', '#a0e9fd', '#fe4365'];
      ctxfg.fillStyle = comboColor[idx];
      ctxfg.fillText(val.toString(), lineScale * (idx + 0.55) * 1.1, canvasfg.height - lineScale * 0.1);
    });
  }
  if (timeIn.second >= 2.5 && timeIn.second < 3) ctxfg.globalAlpha = 1 - tween.easeOutSine(6 - timeIn.second * 2);
  else ctxfg.globalAlpha = 1 - tween.easeOutSine(timeOut.second * 1.5);
  if (timeIn.second >= 2.5 && tmps.customForeDraw != null) tmps.customForeDraw(ctxfg); // 自定义前景
  if (timeIn.second >= 2.5 && main.filter != null) main.filter(ctxfg, timeBgm, nowTimeMS / 1e3); // 滤镜处理
  if (checkFeedback.checked) hitFeedbackList.animate(); // 绘制打击特效0
  ctxfg.resetTransform();
}
// 判定线函数，undefined/0:默认,1:非,2:恒成立
function drawLine(bool: number, lineScale: number) {
  const tw = 1 - tween.easeOutSine(timeOut.second * 1.5);
  for (const line of app.linesReversed) {
    if (bool ^ Number(line.imageD) && timeOut.second < 0.67) {
      ctxfg.globalAlpha = line.alpha;
      ctxfg.setTransform(line.cosr * tw, line.sinr, -line.sinr * tw, line.cosr, app.wlen + (line.offsetX - app.wlen) * tw, line.offsetY); // Hiahiah
      const imgS = (line.imageU ? lineScale * 18.75 : canvasfg.height) * line.imageS / 1080;
      const imgW = imgS * line.imageW * line.imageA;
      const imgH = imgS * line.imageH;
      ctxfg.drawImage(line.imageL[line.imageC && lineColor.checked ? stat.lineStatus : 0], -imgW / 2, -imgH / 2, imgW, imgH);
    }
  }
  ctxfg.globalAlpha = 1;
}
function fillTextNode(text: string, x: number, y: number, size: number, maxWidth: number) {
  ctxfg.font = `${size}px Custom,Noto Sans SC`;
  const dx = ctxfg.measureText(text).width;
  if (dx > maxWidth) ctxfg.font = `${size / dx * maxWidth}px Custom,Noto Sans SC`;
  ctxfg.fillText(text, x, y);
  return dx;
}
function atDraw3(statData: StatData) {
  ctxfg.resetTransform();
  ctxfg.clearRect(0, 0, canvasfg.width, canvasfg.height);
  ctxfg.globalAlpha = 1;
  const bgImageBlur = background.getImageBlur();
  ctxfg.drawImage(bgImageBlur, ...adjustSize(bgImageBlur, canvasfg, 1));
  ctxfg.fillStyle = '#000'; // 背景变暗
  ctxfg.globalAlpha = app.brightness; // 背景不透明度
  ctxfg.fillRect(0, 0, canvasfg.width, canvasfg.height);
  ctxfg.globalCompositeOperation = 'destination-out';
  ctxfg.globalAlpha = 1;
  const k = 3.7320508075688776; // tan75°
  ctxfg.setTransform(canvasfg.width - canvasfg.height / k, 0, -canvasfg.height / k, canvasfg.height, canvasfg.height / k, 0);
  ctxfg.fillRect(0, 0, 1, tween.easeOutCubic(clip((timeEnd.second - 0.13) * 0.94)));
  ctxfg.resetTransform();
  ctxfg.globalCompositeOperation = 'destination-over';
  const skew = (canvasfg.width - canvasfg.height / k) / (16 - 9 / k);
  ctxfg.setTransform(skew / 120, 0, 0, skew / 120, app.wlen - skew * 8, app.hlen - skew * 4.5); // ?
  ctxfg.drawImage(res.LevelOver4, 183, 42, 1184, 228);
  ctxfg.globalAlpha = clip((timeEnd.second - 0.27) / 0.83);
  ctxfg.drawImage(res.LevelOver1, 102, 378);
  ctxfg.globalCompositeOperation = 'source-over';
  ctxfg.globalAlpha = 1;
  ctxfg.drawImage(res.LevelOver5, 700 * tween.easeOutCubic(clip(timeEnd.second * 1.25)) - 369, 91, 20, 80);
  // 曲名和等级
  ctxfg.fillStyle = '#fff';
  ctxfg.textAlign = 'left';
  fillTextNode(inputName.value || inputName.placeholder, 700 * tween.easeOutCubic(clip(timeEnd.second * 1.25)) - 320, 160, 80, 1500);
  const textWidth = fillTextNode(levelInfoHandler.text, 700 * tween.easeOutCubic(clip(timeEnd.second * 1.25)) - 317, 212, 30, 750);
  ctxfg.font = '30px Custom,Noto Sans SC';
  // Rank图标
  ctxfg.globalAlpha = clip((timeEnd.second - 1.87) * 3.75);
  const outerSize = 293 + clip((timeEnd.second - 1.87) * 3.75) * 100;
  const innerSize = 410 - clip((timeEnd.second - 1.87) * 2.14) * 164;
  ctxfg.drawImage(res.LevelOver3, 661 - outerSize / 2, 545 - outerSize / 2, outerSize, outerSize);
  ctxfg.drawImage(res.Ranks[stat.rankStatus], 661 - innerSize / 2, 545 - innerSize / 2, innerSize, innerSize);
  // 各种数据
  ctxfg.globalAlpha = clip((timeEnd.second - 0.87) * 2.5);
  ctxfg.fillStyle = statData.newBestColor;
  ctxfg.fillText(statData.newBestStr, 898, 433);
  ctxfg.fillStyle = '#fff';
  ctxfg.textAlign = 'center';
  ctxfg.fillText(statData.scoreBest, 1180, 433);
  ctxfg.globalAlpha = clip((timeEnd.second - 1.87) * 2.5);
  ctxfg.textAlign = 'right';
  ctxfg.fillText(statData.scoreDelta, 1414, 433);
  ctxfg.globalAlpha = clip((timeEnd.second - 0.95) * 1.5);
  ctxfg.textAlign = 'left';
  ctxfg.fillText(stat.accStr, 352, 550);
  ctxfg.fillText(stat.maxcombo.toString(), 1528, 550);
  ctxfg.fillStyle = statData.textAboveColor;
  ctxfg.fillText(app.speed === 1 ? '' : statData.textAboveStr.replace('{SPEED}', app.speed.toFixed(2)), 383 + Math.min(textWidth, 750), 212);
  ctxfg.fillStyle = statData.textBelowColor;
  ctxfg.fillText(statData.textBelowStr, 1355, 595);
  ctxfg.fillStyle = '#fff';
  ctxfg.textAlign = 'center';
  ctxfg.font = '86px Custom,Noto Sans SC';
  ctxfg.globalAlpha = clip((timeEnd.second - 1.12) * 2.0);
  ctxfg.fillText(stat.scoreStr, 1075, 569);
  ctxfg.font = '26px Custom,Noto Sans SC';
  ctxfg.globalAlpha = clip((timeEnd.second - 0.87) * 2.5);
  ctxfg.fillText(stat.perfect.toString(), 891, 650);
  ctxfg.globalAlpha = clip((timeEnd.second - 1.07) * 2.5);
  ctxfg.fillText(stat.good.toString(), 1043, 650);
  ctxfg.globalAlpha = clip((timeEnd.second - 1.27) * 2.5);
  ctxfg.fillText(stat.noteRank[6].toString(), 1196, 650);
  ctxfg.globalAlpha = clip((timeEnd.second - 1.47) * 2.5);
  ctxfg.fillText(stat.noteRank[2].toString(), 1349, 650);
  ctxfg.font = '22px Custom,Noto Sans SC';
  const transition = clip((main.pressTime > 0 ? timeEnd.second - main.pressTime : 0.2 - timeEnd.second - main.pressTime) * 5.0);
  ctxfg.globalAlpha = 0.8 * clip((timeEnd.second - 0.87) * 2.5) * transition;
  ctxfg.fillStyle = '#696';
  ctxfg.fill(new Path2D('M841,718s-10,0-10,10v80s0,10,10,10h100s10,0,10-10v-80s0-10-10-10h-40l-10-20-10,20h-40z'));
  ctxfg.globalAlpha = 0.8 * clip((timeEnd.second - 1.07) * 2.5) * transition;
  ctxfg.fillStyle = '#669';
  ctxfg.fill(new Path2D('M993,718s-10,0-10,10v80s0,10,10,10h100s10,0,10-10v-80s0-10-10-10h-40l-10-20-10,20h-40z'));
  ctxfg.fillStyle = '#fff';
  ctxfg.globalAlpha = clip((timeEnd.second - 0.97) * 2.5) * transition;
  ctxfg.fillText(`Early: ${stat.noteRank[5]}`, 891, 759);
  ctxfg.fillText(`Late: ${stat.noteRank[1]}`, 891, 792);
  ctxfg.globalAlpha = clip((timeEnd.second - 1.17) * 2.5) * transition;
  ctxfg.fillText(`Early: ${stat.noteRank[7]}`, 1043, 759);
  ctxfg.fillText(`Late: ${stat.noteRank[3]}`, 1043, 792);
  ctxfg.resetTransform();
  ctxfg.globalCompositeOperation = 'destination-over';
  ctxfg.globalAlpha = 1;
  ctxfg.fillStyle = '#000';
  const bgImage = background.getImage();
  ctxfg.drawImage(bgImage, ...adjustSize(bgImage, canvasfg, 1));
  ctxfg.fillRect(0, 0, canvasfg.width, canvasfg.height);
  ctxfg.globalCompositeOperation = 'source-over';
}
function clip(num: number) {
  if (num < 0) return 0;
  if (num > 1) return 1;
  return num;
}
interface ScaledHitFX {
  effects: ScaledNote[];
  numOfParts: number;
  duration: number;
}
// 绘制Note
function drawNotes() {
  for (const note of app.holds) drawHold(note, timeChart);
  for (const note of app.dragsReversed) drawDrag(note);
  for (const note of app.tapsReversed) drawTap(note);
  for (const note of app.flicksReversed) drawFlick(note);
}
function drawTap(note: Renderer.Note) {
  const HL = note.isMulti && app.multiHint;
  const nsr = app.noteScaleRatio;
  if (!note.visible || note.scored && note.badTime == null) return;
  ctxfg.setTransform(nsr * note.cosr, nsr * note.sinr, -nsr * note.sinr, nsr * note.cosr, note.offsetX, note.offsetY);
  if (note.badTime == null) {
    ctxfg.globalAlpha = note.alpha || (note.showPoint && showPoint.checked ? 0.45 : 0);
    if (main.awawa) ctxfg.globalAlpha *= Math.max(1 + (timeChart - note.seconds) / 1.5, 0);
    // 过线前1.5s出现
    noteRender.note[HL ? 'TapHL' : 'Tap'].full(ctxfg);
  } else {
    ctxfg.globalAlpha = 1 - clip((performance.now() - note.badTime) / 500);
    noteRender.note.TapBad.full(ctxfg);
  }
}
function drawDrag(note: Renderer.Note) {
  const HL = note.isMulti && app.multiHint;
  const nsr = app.noteScaleRatio;
  if (!note.visible || note.scored && note.badTime == null) return;
  ctxfg.setTransform(nsr * note.cosr, nsr * note.sinr, -nsr * note.sinr, nsr * note.cosr, note.offsetX, note.offsetY);
  if (note.badTime == null) {
    ctxfg.globalAlpha = note.alpha || (note.showPoint && showPoint.checked ? 0.45 : 0);
    if (main.awawa) ctxfg.globalAlpha *= Math.max(1 + (timeChart - note.seconds) / 1.5, 0);
    noteRender.note[HL ? 'DragHL' : 'Drag'].full(ctxfg);
  } else {
    // Nothing to do
  }
}
function drawHold(note: Renderer.Note, seconds: number) {
  const HL = note.isMulti && app.multiHint;
  const nsr = app.noteScaleRatio;
  if (!note.visible || note.seconds + note.holdSeconds < seconds) return; // 不绘制时空超界的Hold
  ctxfg.globalAlpha = note.alpha || (note.showPoint && showPoint.checked ? 0.45 : 0);
  if (main.awawa) ctxfg.globalAlpha *= Math.max(1 + (timeChart - note.seconds) / 1.5, 0);
  ctxfg.setTransform(nsr * note.cosr, nsr * note.sinr, -nsr * note.sinr, nsr * note.cosr, note.offsetX, note.offsetY);
  const baseLength = app.scaleY / nsr * note.speed * app.speed;
  const holdLength = baseLength * note.holdSeconds;
  if (note.seconds > seconds) {
    noteRender.note[HL ? 'HoldHeadHL' : 'HoldHead'].head(ctxfg);
    noteRender.note[HL ? 'HoldHL' : 'Hold'].body(ctxfg, -holdLength, holdLength);
  } else noteRender.note[HL ? 'HoldHL' : 'Hold'].body(ctxfg, -holdLength, holdLength - baseLength * (seconds - note.seconds));
  noteRender.note.HoldEnd.tail(ctxfg, -holdLength);
}
function drawFlick(note: Renderer.Note) {
  const HL = note.isMulti && app.multiHint;
  const nsr = app.noteScaleRatio;
  if (!note.visible || note.scored && note.badTime == null) return;
  ctxfg.setTransform(nsr * note.cosr, nsr * note.sinr, -nsr * note.sinr, nsr * note.cosr, note.offsetX, note.offsetY);
  if (note.badTime == null) {
    ctxfg.globalAlpha = note.alpha || (note.showPoint && showPoint.checked ? 0.45 : 0);
    if (main.awawa) ctxfg.globalAlpha *= Math.max(1 + (timeChart - note.seconds) / 1.5, 0);
    noteRender.note[HL ? 'FlickHL' : 'Flick'].full(ctxfg);
  } else {
    // Nothing to do
  }
}
const lineImages = new Map() as Map<ImageBitmap, LineImage>;
class LineImage {
  public image: ImageBitmap;
  public imageFC: ImageBitmap | null;
  public imageAP: null; // ImageBitmap | null;
  public imageMP: ImageBitmap | null;
  public constructor(image: ImageBitmap) {
    this.image = image;
    this.imageFC = null;
    this.imageAP = null;
    this.imageMP = null;
  }
  public async getFC() {
    if (this.imageFC == null) this.imageFC = await imgShader(this.image, '#a2eeff');
    return this.imageFC;
  }
  public async getAP() {
    /* if (this.imageAP == null) */ this.imageAP = await Promise.resolve(null); // imgShader(this.image, '#a3ffac');
    return this.imageAP;
  }
  public async getMP() {
    if (this.imageMP == null) this.imageMP = await imgShader(this.image, '#feffa9');
    return this.imageMP;
  }
}
const updateLineImage = (image: ImageBitmap) => {
  const lineImage = lineImages.get(image) || new LineImage(image);
  if (!lineImages.has(image)) lineImages.set(image, lineImage);
  return lineImage;
};
// rgba数组(0-1)转十六进制
// function rgba2hex(...rgba:number[]) {
//   return '#' + rgba.map(i => ('00' + Math.round(Number(i) * 255 || 0).toString(16)).slice(-2)).join('');
// }
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
selectVolume.addEventListener('change', evt => {
  const volume = Number((evt.target as HTMLInputElement).value);
  app.musicVolume = Math.min(1, 1 / volume);
  app.soundVolume = Math.min(1, volume);
  audio.test(() => {
    musicController.gainNode.gain.value = app.musicVolume;
    soundController.gainNode.gain.value = app.soundVolume;
  });
});
status.reg('selectVolume', selectVolume);
checkAutoPlay.addEventListener('change', evt => {
  app.playMode = (evt.target as HTMLInputElement).checked ? 1 : 0;
});
checkAutoPlay.dispatchEvent(new Event('change'));
lowRes.checkbox.addEventListener('change', evt => {
  app.setLowResFactor((evt.target as HTMLInputElement).checked ? 0.5 : 1);
});
lowRes.checkbox.dispatchEvent(new Event('change'));
selectbg.onchange = () => {
  const bg = bgs.get(selectbg.value);
  background.image = bg || null;
  if (bg) bg.setBlur();
};
selectchart.addEventListener('change', adjustInfo);
(function() {
  const input = document.createElement('input');
  Object.assign(input, { type: 'number', min: 25, max: 1000, value: 60 });
  input.style.cssText += ';width:50px;margin-left:10px';
  input.addEventListener('change', function(this: HTMLInputElement) {
    const value = Number(this.value);
    if (value < 25) this.value = '25';
    if (value > 1000) this.value = '1000';
    frameAnimater.setFrameRate(Number(this.value));
  });
  status.reg('maxFrameNumber', input, false);
  maxFrame.container.appendChild(input);
  maxFrame.checkbox.addEventListener('change', function(this: HTMLInputElement) {
    input.classList.toggle('disabled', !this.checked);
    if (this.checked) input.dispatchEvent(new Event('change'));
    else frameAnimater.setFrameRate(0);
  });
  maxFrame.checkbox.dispatchEvent(new Event('change'));
}());
// Play
emitter.addEventListener('change', function(this: Emitter) {
  canvas.classList.toggle('fade', this.eq('stop'));
  blockMask.classList.toggle('fade', this.ne('stop'));
  btnPlay.value = this.eq('stop') ? '播放' : '停止';
  btnPause.value = this.eq('pause') ? '继续' : '暂停';
  btnPause.classList.toggle('disabled', this.eq('stop'));
  for (const elem of $$('.disabled-when-playing')) elem.classList.toggle('disabled', this.ne('stop'));
  // console.log(this);
});
btnPlay.addEventListener('click', function(this: HTMLInputElement) {
  const handler = async() => {
    if (this.classList.contains('disabled')) return;
    this.classList.add('disabled');
    await mainPlay();
    this.classList.remove('disabled');
  };
  handler();
});
btnPause.addEventListener('click', function(this: HTMLInputElement) {
  const handler = async() => {
    if (this.classList.contains('disabled')) return;
    this.classList.add('disabled');
    await mainPause();
    this.classList.remove('disabled');
  };
  handler();
});
inputOffset.addEventListener('input', function(this: HTMLInputElement) {
  const value = Number(this.value);
  if (value < -400) this.value = '-400';
  if (value > 600) this.value = '600';
});
status2.reg(emitter, 'change', () => main.awawa ? 'Reversed' : ''); // TODO: 重构
status2.reg(selectflip, 'change', target => ['', 'FlipX', 'FlipY', 'FlipX&Y'][Number((target as HTMLSelectElement).value)]);
status2.reg(selectspeed, 'change', target => (target as HTMLSelectElement).value);
status2.reg(emitter, 'change', target => (target as Emitter).eq('pause') ? 'Paused' : '');
async function mainPlay(): Promise<void> {
  if (emitter.eq('stop')) {
    if (!selectchart.value) {
      main.error('未选择任何谱面');
      return;
    }
    for (const callback of main.before.values()) await callback();
    const bgm: MediaData = bgms.get(selectbgm.value) || { audio: null, video: null };
    app.bgMusic = bgm.audio;
    app.bgVideo = bgm.video;
    app.prerenderChart(main.modify(charts.get(selectchart.value)!));
    const md5 = chartsMD5.get(selectchart.value)!;
    const format = chartsFormat.get(selectchart.value)!;
    stat.level = levelInfoHandler.getLevelNumber();
    if (app.chart != null) stat.reset(app.chart.numOfNotes, md5, format, selectspeed.value);
    await loadLineData({ onwarn: sendWarning });
    duration0 = app.duration / app.speed;
    isInEnd = false;
    isOutStart = false;
    isOutEnd = false;
    timeBgm = 0;
    if (!showTransition.checked) timeIn.addTime(3e3);
    audio.play(res.mute, { loop: true }); // 播放空音频(避免音画不同步)
    frameAnimater.start();
    timeIn.play();
    interact.activate();
    emitter.emit('play');
  } else {
    emitter.emit('stop');
    interact.deactive();
    audio.stop();
    frameAnimater.stop();
    // 清除原有数据
    isOutOver = false;
    tempStat = null;
    hitFeedbackList.clear();
    hitImageList.clear();
    hitWordList.clear();
    timeIn.reset();
    timeOut.reset();
    timeEnd.reset();
    curTime = 0;
    curTimeMS = 0;
    duration0 = 0;
    for (const callback of main.end.values()) await callback();
  }
}
async function loadLineData({
  onwarn = (_: string) => {}
} = {}) {
  for (const line of app.lines) {
    line.imageW = 6220.8; // 1920
    line.imageH = 7.68; // 3
    line.imageL = [res.JudgeLine, res.JudgeLineMP, null, res.JudgeLineFC];
    line.imageS = 1; // 2.56
    line.imageA = 1; // 1.5625
    line.imageD = false;
    line.imageC = true;
    line.imageU = true;
  }
  for (const data of chartLineDataList) {
    if (selectchart.value === data.chart) {
      if (data.lineId == null) {
        onwarn('未指定判定线id');
        continue;
      }
      const line = app.lines[Number(data.lineId)] as Renderer.JudgeLine | null;
      if (line == null) {
        onwarn(`指定id的判定线不存在：${data.lineId}`);
        continue;
      }
      let image = data.image == null ? null : bgs.get(data.image)?.base;
      if (!image) {
        if (data.image != null) onwarn(`图片不存在：${data.image}`);
        image = res.NoImageBlack;
      }
      line.imageW = image.width;
      line.imageH = image.height;
      const lineImage = updateLineImage(image);
      line.imageL = await Promise.all([image, lineImage.getMP(), lineImage.getAP(), lineImage.getFC()]);
      if (data.scaleOld != null) { // Legacy
        line.imageS = Math.abs(data.scaleOld) * 1080 / image.height;
        line.imageU = data.scaleOld > 0;
      }
      if (data.scale != null) line.imageS = data.scale;
      if (data.aspect != null) line.imageA = data.aspect;
      if (data.useBackgroundDim != null) line.imageD = data.useBackgroundDim;
      if (data.useLineColor != null) line.imageC = data.useLineColor;
      if (data.useLineScale != null) line.imageU = data.useLineScale;
    }
  }
}
async function mainPause() {
  if (emitter.eq('stop') || isOutOver) return;
  if (emitter.eq('play')) {
    if (app.bgVideo != null) app.bgVideo.pause();
    timeIn.pause();
    if (showTransition.checked && isOutStart) timeOut.pause();
    curTime = timeBgm;
    audio.stop();
    audio.play(res.mute, { loop: true }); // TODO: 重构
    emitter.emit('pause');
  } else {
    if (app.bgVideo != null) await playVideo(app.bgVideo, timeBgm * app.speed);
    timeIn.play();
    if (showTransition.checked && isOutStart) timeOut.play();
    if (isInEnd && !isOutStart) playBgm(app.bgMusic, timeBgm * app.speed);
    // console.log(app.bgVideo);
    emitter.emit('play');
  }
}
// Plugins
const debounce = (callback: () => void, delay: number) => {
  let timer = 0;
  return () => {
    clearTimeout(timer);
    timer = self.setTimeout(callback, delay);
  };
};
const loadPlugin = (searchValue: string, callback: () => void) => {
  inputName.addEventListener('input', debounce(() => {
    if (inputName.value === searchValue) {
      callback();
      inputName.value = '';
      inputName.dispatchEvent(new Event('input'));
    }
  }, 1e3));
};
const appendCfg = (name: string, callback: () => void) => new Checkbox(name).appendBefore(resetCfg.container).hook(callback);
main.fireModal = function(navHTML = '', contentHTML = '') {
  const cover = document.createElement('div');
  cover.classList.add('cover-dark', 'fade');
  const container = document.createElement('div');
  container.classList.add('cover-view', 'fade');
  const nav = document.createElement('div');
  nav.classList.add('view-nav');
  if (typeof navHTML === 'string') nav.innerHTML = navHTML;
  else nav.appendChild(navHTML);
  const content = document.createElement('div');
  content.classList.add('view-content');
  if (typeof contentHTML === 'string') content.innerHTML = contentHTML;
  else content.appendChild(contentHTML);
  content.addEventListener('custom-done', () => cover.click());
  container.append(nav, content);
  requestAnimationFrame(() => {
    ($('.main') as HTMLDivElement).append(cover, container);
    requestAnimationFrame(() => {
      cover.classList.remove('fade');
      container.classList.remove('fade');
    });
  });
  cover.addEventListener('click', () => {
    cover.classList.add('fade');
    cover.addEventListener('transitionend', () => {
      cover.remove();
    });
    container.classList.add('fade');
    container.addEventListener('transitionend', () => {
      container.remove();
    });
  });
  return content;
};
main.toast = (msg = '') => main.fireModal('<p>提示</p>', `<p style="white-space:pre;text-align:left;display:inline-block;">${msg}</p>`);
main.error = (msg = '') => main.fireModal('<p>错误</p>', `<p style="white-space:pre;text-align:left;display:inline-block;">${msg}</p>`);
main.define = a => a;
main.use = async m => {
  const module = await m.then(n => n.default);
  for (const data of module.contents) {
    if (data.type === 'command') loadPlugin(data.meta[0], data.meta[1]);
    else if (data.type === 'script') data.meta[0]($);
    else if (data.type === 'config') appendCfg(data.meta[0], data.meta[1]);
    else throw new TypeError(`Unknown Plugin Type: ${data.type}`);
  }
  console.log(module);
  return module;
};
main.use(import('@/plugins/phizone.js') as unknown as Promise<ModuleBase>);
main.use(import('@/plugins/tips.js') as unknown as Promise<ModuleBase>);
main.use(import('@/plugins/filter.js') as unknown as Promise<ModuleBase>);
main.use(import('@/plugins/skin.js') as unknown as Promise<ModuleBase>);
main.use(import('@/plugins/export.js') as unknown as Promise<ModuleBase>);
main.use(import('@/plugins/gauge.js') as unknown as Promise<ModuleBase>);
main.use(import('@/plugins/dynamic-score.js') as unknown as Promise<ModuleBase>);
main.use(import('@/plugins/video-recorder.js') as unknown as Promise<ModuleBase>);
main.use(import('@/plugins/online.js') as unknown as Promise<ModuleBase>);
// debug
self.hook = main;
export const hook = main;
main.stat = stat;
main.app = app;
main.res = res;
main.audio = audio;
main.sendText = sendText;
main.sendWarning = sendWarning;
main.sendError = sendError;
main.frameAnimater = frameAnimater;
main.timeEnd = timeEnd;
main.bgms = bgms;
main.inputName = inputName;
main.selectbgm = selectbgm;
main.selectchart = selectchart;
main.chartsMD5 = chartsMD5;
main.noteRender = noteRender;
main.reader = reader;
main.ZipReader = ZipReader;
main.status = status;
main.tmps = tmps;
main.awawa = false;
// play
interface MainOptions {
  pause: typeof pause;
  // play: typeof mainPlay;
  // stop: typeof mainPlay;
  playing: boolean;
  time: number;
}
const pause = async() => emitter.eq('play') && mainPause();
main.pause = pause;
Object.defineProperty(main, 'playing', {
  get: () => emitter.eq('play')
  // set: v => v ? mainPause() : mainPause()
});
Object.defineProperty(main, 'time', {
  get: () => timeBgm,
  set(v: number) {
    const handler = async() => {
      if (emitter.eq('stop') || isOutOver) return;
      const isPlaying = emitter.eq('play');
      if (isPlaying) await mainPause();
      timeBgm = v / app.speed;
      curTime = timeBgm;
      app.seekLineEventIndex();
      // app.notes.forEach(a => { a.status = 0;
      //   a.scored = 0;
      //   a.holdStatus = 1; });
      // stat.reset();
      if (isPlaying) await mainPause().catch((e: unknown) => console.error(e)); // FIXME: video+gauge结算时会报错
    };
    handler();
  }
});
// cover
interface MainOptions {
  cover: typeof cover;
}
const cover = {
  color: 'black',
  value: 0,
  setValueCurve(...values: number[]) { // [time, value, ...]
    if (!(values.length &= ~1)) return;
    const lastTime = performance.now();
    const lastValue = this.value;
    requestAnimationFrame(function callback(t) {
      const id = requestAnimationFrame(callback);
      let time = (t - lastTime) * 1e-3;
      if (time < 0) time = 0; // 实测有时会出现负数，可能计算出NaN导致闪屏
      for (let i = 0; i < values.length; i += 2) {
        if (time < values[i]) {
          const start = i === 0 ? lastValue : values[i - 1];
          const end = values[i + 1];
          cover.value = start + (end - start) * time / values[i];
          return;
        } time -= values[i];
      }
      if (time >= 0) {
        cover.value = values[values.length - 1];
        cancelAnimationFrame(id);
      }
    });
  }
};
main.cover = cover;
main.afterAll.set('main::cover', () => {
  if (cover.value > 0) {
    ctx.fillStyle = cover.color;
    ctx.globalAlpha = cover.value;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
});
/* exported hook */
if (new URLSearchParams(location.search).has('iframe')) {
  document.body.classList.add('iframe');
  stage.setFull(true);
  stage.resize();
  specialClick.func[3] = async() => Promise.resolve(window.parent.postMessage('full', '*'));
}
self.onmessage = evt => {
  console.log('onmessage', evt);
  if (evt.data instanceof File) {
    const reader1 = new FileReader();
    reader1.readAsArrayBuffer(evt.data);
    reader1.onload = () => {
      uploader.fireLoad(evt.data as File, reader1.result as ArrayBuffer);
    };
  } else if (evt.data === 'play') {
    mainPlay();
  }
};
