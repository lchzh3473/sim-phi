import { parseCSV } from '@/utils/parseCSV';
export default hook.define({
  name: 'Online Resource',
  description: 'Provides online resource',
  contents: [
    {
      type: 'command',
      meta: ['/a', dialog]
    }
  ]
});
const { sendText, uploader } = hook;
const host = atob('aHR0cHM6Ly9iay0xMzAyMTcxMzY0LmNvcy5hcC1zaGFuZ2hhaS5teXFjbG91ZC5jb20v');
const getResourseUrl = (url = '') => new URL(url, host).href;
// eslint-disable-next-line no-alert
const vprompt = str => prompt(`${str}`);
const valert = str => hook.toast(`${str}`);
const msgNetErr = err => {
  valert(`无法连接至服务器\n错误代码：${err.message}`);
  sendText('无法连接至服务器');
};
async function dialog(str) {
  const url = str || vprompt('请输入资源URL');
  if (url === '' || url == null) { valert('未输入URL，已取消操作'); return }
  const data = await query(url).catch(msgNetErr);
  console.log(data);
}
async function query(path = '') {
  const base = getResourseUrl(`${path}/`);
  sendText('等待服务器响应...');
  const resList = [];
  const encoder = new TextEncoder();
  const resInfo = await fetch(new URL('info.csv', base));
  if (resInfo.ok) {
    const textInfo = await resInfo.text();
    const csvInfo = parseCSV(textInfo, true);
    // console.log(csvInfo);
    for (const row of csvInfo) {
      if (row.Chart) resList.push(new URL(row.Chart, base));
      if (row.Music) resList.push(new URL(row.Music, base));
      if (row.Image) resList.push(new URL(row.Image, base));
    }
    const info = encoder.encode(textInfo);
    uploader.fireLoad({ name: 'info.csv' }, info.buffer);
  } else throw new Error(`${resInfo.status} ${resInfo.statusText}`);
  const resLine = await fetch(new URL('line.csv', base));
  if (resLine.ok) {
    const textLine = await resLine.text();
    const csvLine = parseCSV(textLine, true);
    // console.log(csvLine);
    for (const row of csvLine) {
      if (row.Chart) resList.push(new URL(row.Chart, base));
      if (row.Image) resList.push(new URL(row.Image, base));
    }
    const line = encoder.encode(textLine);
    uploader.fireLoad({ name: 'line.csv' }, line.buffer);
  } // else throw new Error(`${resLine.status} ${resLine.statusText}`);
  const downloader = new Downloader();
  await downloader.add(resList, ({ url, status, statusText }) => {
    valert(`资源 '${url}' 加载失败\n错误代码：${status} ${statusText}`);
  });
  await downloader.start(uploader.fireProgress.bind(uploader));
  const dstr = str => decodeURIComponent(str.match(/[^/]+$/)[0]);
  for (const res of resList) {
    const data1 = await downloader.getData(res) || new ArrayBuffer(0);
    uploader.fireLoad({ name: dstr(res.toString()) }, data1); // 以后添加catch
  }
}
/**
 * @typedef {(ev:ProgressEvent<XMLHttpRequest>)} XHR
 * @param {string} url
 * @param {XHR} onprogress
 */
function xhr2(url, onprogress = _ => {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onprogress = onprogress;
    xhr.onload = evt => (xhr.status === 200 ? resolve : reject)(evt);
    xhr.onerror = reject;
    xhr.send();
  });
}
async function getContentLength(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' }).catch(() => {
      throw Object.assign(new Error(), { url, status: 0, statusText: 'Network Error' });
    });
    const length = res.headers.get('content-length'); // 踩坑：这里的length是字符串
    if (length == null) throw new Error('No Content-Length Header');
    if (res.ok) return Number(length);
  } catch (_) {
    const res = await fetch(url, { method: 'GET' }).catch(() => {
      throw Object.assign(new Error(), { url, status: 0, statusText: 'Network Error' });
    });
    res.body.cancel();
    if (!res.ok) throw Object.assign(new Error(), { url, status: res.status, statusText: res.statusText });
    return Number(res.headers.get('content-length')) || 0;
  }
  throw Object.assign(new Error(), { url, status: 0, statusText: 'Unknown Error' });
}
function Downloader() {
  this.xhrs = Object.create(null);
}
Downloader.prototype.add = function(urls = [], onerror = _ => {}) {
  return Promise.all(urls.
    filter(url => !this.xhrs[url]).
    map(async url => {
      try {
        const total = await getContentLength(url);
        this.xhrs[url] = { event: { loaded: 0, total } };
      } catch (result) {
        onerror(result);
      }
    }));
};
Downloader.prototype.start = function(onprogress = (..._) => {}) {
  const entries = Object.entries(this.xhrs);
  return Promise.all(entries.map(([url, xhr]) => xhr2(url, evt => {
    xhr.event = evt;
    onprogress(this.loaded, this.total);
  }).then(evt => xhr.event = evt).catch(evt => xhr.event = evt)));
};
Downloader.prototype.getData = function(url) {
  if (!this.xhrs[url]) return null;
  const { event } = this.xhrs[url];
  if (event.loaded >= event.total) return event.target.response;
  return null;
};
Object.defineProperty(Downloader.prototype, 'loaded', { get() {
  const values = Object.values(this.xhrs);
  return values.reduce((loaded, xhr) => loaded + xhr.event.loaded, 0);
} });
Object.defineProperty(Downloader.prototype, 'total', { get() {
  const values = Object.values(this.xhrs);
  return values.reduce((total, xhr) => total + Math.max(xhr.event.loaded, xhr.event.total), 0);
} });
