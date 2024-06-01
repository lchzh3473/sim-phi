import { getConstructorName, isUndefined, loadJS, orientation } from '@/js/common.js';
import { audio } from '@/external';
export async function checkSupport({
  messageCallback = (_msg: string) => {},
  warnCallback = (_msg: string) => {},
  errorCallback = (_msg: string, _html: string, _fatal?: boolean) => {},
  mobileCallback = () => {},
  orientNotSupportCallback = () => {}
} = {}): Promise<number> {
  const sysError = (error: unknown, message?: string) => {
    const type = getConstructorName(error) as string;
    // if (message==='Script error.') return;
    let message2 = String(error);
    let detail = String(error);
    if (error instanceof Error) {
      const stack = error.stack ?? 'Stack not available';
      if (error.name === type) message2 = error.message;
      else message2 = `${error.name}: ${error.message}`;
      const idx = stack.indexOf(message2) + 1;
      if (idx) detail = `${message2}\n${stack.slice(idx + message2.length)}`;
      else detail = `${message2}\n    ${stack.split('\n').join('\n    ')}`; // Safari
    }
    if (message != null) message2 = message;
    const errMessage = `[${type}] ${message2.split('\n')[0]}`;
    const errDetail = `[${type}] ${detail}`;
    errorCallback(errMessage, Utils.escapeHTML(errDetail));
  };
  self.addEventListener('error', e => sysError(e.error, e.message));
  self.addEventListener('unhandledrejection', e => sysError(e.reason));
  const loadLib = async(name: string, urls: string[] | string, check: () => boolean) => {
    if (!check()) return true;
    const errmsg1 = `错误：${name}组件加载失败（点击查看详情）`;
    const errmsg2 = `${name}组件加载失败，请检查您的网络连接然后重试：`;
    const errmsg3 = `${name}组件加载失败，请检查浏览器兼容性`;
    messageCallback(`加载${name}组件...`);
    await loadJS(urls).catch((e: unknown) => {
      const msg = e instanceof Error ? e.message : String(e);
      errorCallback(errmsg1, msg.replace(/.+/, errmsg2), true);
    });
    if (!check()) return true;
    errorCallback(errmsg1, errmsg3, true);
    return false;
  };
  await Utils.addFont('Titillium Web', { alt: 'Custom' });
  // 兼容性检测
  messageCallback('检查浏览器兼容性...');
  const isMobile = navigator.standalone !== undefined || navigator.platform.includes('Linux') && navigator.maxTouchPoints === 5;
  if (isMobile) mobileCallback();
  checkMiuiVersion(warnCallback);
  if (!await loadLib('ImageBitmap兼容', '/lib/createImageBitmap.js', () => isUndefined('createImageBitmap'))) return -1;
  messageCallback('加载音频组件...');
  const oggCompatible = new Audio().canPlayType('audio/ogg') !== '';
  if (!await loadLib('ogg格式兼容', '/lib/oggmented-bundle.js', () => !oggCompatible && isUndefined('oggmented'))) return -4;
  audio.init(oggCompatible ? self.AudioContext : self.oggmented.OggmentedAudioContext); // 兼容Safari
  const webpCompatible = document.createElement('canvas').toDataURL('image/webp').includes('data:image/webp');
  if (!await loadLib('webp格式兼容', '/lib/webp-bundle.js', () => !webpCompatible && isUndefined('webp'))) return -5;
  await checkOrient(orientNotSupportCallback);
  return 0;
}
function checkMiuiVersion(warnCallback: (_msg: string) => void) {
  if (navigator.userAgent.includes('MiuiBrowser')) {
    // 实测 v17.1.8 问题仍然存在，v17.4.80113 问题已修复
    const miuiVersion = /MiuiBrowser\/(\d+\.\d+)/.exec(navigator.userAgent);
    const text = '检测到小米浏览器且版本低于17.4，可能存在切后台声音消失的问题';
    if (miuiVersion == null || parseFloat(miuiVersion[1]) < 17.4) warnCallback(text);
  }
}
async function checkOrient(orientNotSupportCallback: () => void) {
  const orientSupported = await orientation.checkSupport();
  if (!orientSupported) orientNotSupportCallback();
}
