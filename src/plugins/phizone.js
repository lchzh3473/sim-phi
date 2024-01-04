export default hook.define({
  name: 'PhiZone',
  description: 'PhiZone API',
  contents: [
    {
      type: 'command',
      meta: ['/pz', dialogSong]
    },
    {
      type: 'command',
      meta: ['/pzs', dialogSong]
    },
    {
      type: 'command',
      meta: ['/pzc', dialogChart]
    },
    {
      type: 'command',
      meta: ['/random', random]
    }
  ]
});
const { sendText, uploader } = hook;
const host = 'https://api.phizone.cn';
const getSongUrlByUUID = (id = '') => `${host}/songs/${id}/`;
const getSongsUrlByIndex = (index = 0) => `${host}/songs/?perpage=1&page=${index}`;
const getChartsUrlByIndex = (index = 0) => `${host}/charts/?perpage=1&page=${index}`;
const getChartsUrlByUUID = (id = '') => `${host}/songs/${id}/charts/`;
const getAssetsUrlByUUID = (id = '') => `${host}/charts/${id}/assets/?perpage=-1`;
const getRandomChartUrl = () => `${host}/charts/random/?rangeFormat=0&rangeFormat=1`;
const ver = 'PhiZone API v0.9.0';
// eslint-disable-next-line no-alert
const vprompt = str => prompt(`${ver}\n${str}`);
const valert = str => hook.toast(`${ver}\n${str}`);
const msgNetErr = err => {
  valert(`无法连接至服务器\n错误代码：${err.message}`);
  sendText('无法连接至服务器');
};
const msgNoChart = id => {
  valert(`歌曲ID ${id} 对应的谱面不存在`);
  sendText(`歌曲ID ${id} 对应的谱面不存在`);
};
async function dialogSong(num) {
  const id = num || vprompt('请输入歌曲ID');
  if (id === '' || id == null) { valert('未输入歌曲ID，已取消操作'); return }
  const data = await querySong(id).catch(msgNetErr);
  console.log(data);
  if (!data) return;
  if (!data.charts.length) { msgNoChart(id); return }
  await readData(data);
}
async function dialogChart(num) {
  const id = num || vprompt('请输入谱面ID');
  if (id === '' || id == null) { valert('未输入谱面ID，已取消操作'); return }
  const data = await queryChart(id).catch(msgNetErr);
  console.log(data);
  if (!data) return;
  if (!data.charts.length) { msgNoChart(id); return }
  await readData(data);
}
async function random() {
  const data = await queryRandom().catch(msgNetErr);
  console.log(data);
  if (!data) return;
  if (!data.charts.length) { msgNoChart('<random>'); return }
  await readData(data);
}
async function querySong(id) {
  sendText('等待服务器响应...');
  const resS = await fetch(getSongsUrlByIndex(id | 0));
  if (!resS.ok) throw new Error(`${resS.status} ${resS.statusText}`);
  const song = ((await resS.json()).data || [])[0];
  if (!song) return { charts: [] };
  const resC = await fetch(getChartsUrlByUUID(song.id));
  if (!resC.ok) throw new Error(`${resC.status} ${resC.statusText}`);
  const charts = (await resC.json()).data || [];
  return getData(charts.filter(a => a.file), song);
}
async function queryChart(id) {
  sendText('等待服务器响应...');
  const resC = await fetch(getChartsUrlByIndex(id | 0));
  if (!resC.ok) throw new Error(`${resC.status} ${resC.statusText}`);
  const chart = ((await resC.json()).data || [])[0];
  if (!chart || !chart.file) return { charts: [] };
  const resS = await fetch(getSongUrlByUUID(chart.songId));
  if (!resS.ok) throw new Error(`${resS.status} ${resS.statusText}`);
  const song = (await resS.json()).data;
  return getData([chart], song);
}
async function queryRandom() {
  sendText('等待服务器响应...');
  const resC = await fetch(getRandomChartUrl());
  if (!resC.ok) throw new Error(`${resC.status} ${resC.statusText}`);
  const chart = (await resC.json()).data;
  const resS = await fetch(getSongUrlByUUID(chart.songId));
  if (!resS.ok) throw new Error(`${resS.status} ${resS.statusText}`);
  const song = (await resS.json()).data;
  return getData([chart], song);
}
async function getData(base, song) {
  console.log('getData::base', ...base);
  console.log('getData::song', song);
  for (const chart of base) {
    const resA = await fetch(getAssetsUrlByUUID(chart.id));
    if (!resA.ok) throw new Error(`${resA.status} ${resA.statusText}`);
    const assets = (await resA.json()).data || [];
    if (assets.length) console.log('getData::assets', ...assets);
    chart.assets = assets.map(a => ({ name: a.name, url: a.file }));
  }
  return {
    charts: base.map(a => ({
      id: a.id,
      chart: a.file,
      level: `${a.level}\u2002Lv.${a.difficulty | 0}`,
      charter: a.authorName.replace(/\[PZUser:\d+:([^\]]+?)(:PZRT)?\]/g, '$1'),
      assets: a.assets // qwq
    })),
    composer: song.authorName,
    illustration: song.illustration,
    illustrator: song.illustrator,
    name: song.title,
    song: song.file
  };
}
async function readData(data) {
  const { charts } = data;
  const urls = [data.song, data.illustration];
  for (const chart of charts) {
    if (chart.chart) urls.push(chart.chart);
    for (const asset of chart.assets) urls.push(asset.url);
  }
  const downloader = new Downloader();
  const dstr = str => decodeURIComponent(str.match(/[^/]+$/)[0]);
  sendText('获取资源列表...');
  await downloader.add(urls, ({ url, status, statusText }) => {
    valert(`资源 '${dstr(url)}' 加载失败\n错误代码：${status} ${statusText}`);
  });
  await downloader.start(uploader.fireProgress.bind(uploader));
  const xhr4 = async(url, name) => {
    const data1 = await downloader.getData(url) || new ArrayBuffer(0);
    uploader.fireLoad({ name }, data1); // 以后添加catch
  };
  await xhr4(data.song, dstr(data.song));
  await xhr4(data.illustration, dstr(data.illustration));
  for (let i = 0; i < charts.length; i++) {
    const chart = charts[i];
    for (const asset of chart.assets) await xhr4(asset.url, asset.name);
    await xhr4(chart.chart, dstr(chart.chart));
    const encoder = new TextEncoder();
    const offset = getChartOffset(chart.id);
    const infoText = `
      #
      Name: ${data.name}
      Song: ${dstr(data.song)}
      Picture: ${dstr(data.illustration)}
      Chart: ${dstr(chart.chart)}
      Level: ${chart.level}
      Composer: ${data.composer}
      Charter: ${chart.charter}
      Illustrator: ${data.illustrator}
      Offset: ${offset}
    `;
    const info = encoder.encode(infoText);
    uploader.fireLoad({ name: 'info.txt' }, info.buffer);
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
// async function xhr2(url, onprogress = _ => {}) {
//   const data = [];
//   let loaded = 0;
//   const res = await fetch(url, { method: 'GET' });
//   if (!res.ok) throw { url, status: res.status, statusText: res.statusText };
//   const total = Number(res.headers.get('content-length'));
//   const reader = res.body.getReader();
//   while (true) {
//     const { done, value } = await reader.read();
//     if (done) break;
//     data.push(value);
//     loaded += value.length;
//     onprogress({ loaded, total });
//   }
//   return { target: { response: new Blob(data).arrayBuffer() }, loaded, total };
// }
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
function getChartOffset(id) {
  if (id === '2eb9e940-4350-4509-a244-068abd937f44') return -50; // 53
  // handled up to 174
  return 0;
}
