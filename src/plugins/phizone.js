export default hook.define({
  name: 'PhiZone',
  description: 'PhiZone API',
  contents: [
    {
      type: 'command',
      meta: ['/pz', dialog]
    },
    {
      type: 'command',
      meta: ['/pzc', dialogc]
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
const getRandomChartUrl = () => `${host}/charts/random/?rangeFormat=0&rangeFormat=1`;
const ver = 'PhiZone API v0.8.3';
// eslint-disable-next-line no-alert
const vprompt = str => prompt(`${ver}\n${str}`);
const valert = str => hook.toast(`${ver}\n${str}`);
async function dialog(num) {
  const id = num || vprompt('请输入歌曲ID');
  if (id === '' || id === null) { valert('未输入歌曲ID，已取消操作'); return }
  const data = await query(id).catch(err => {
    valert(`无法连接至服务器\n错误代码：${err.message}`);
    sendText('无法连接至服务器');
  });
  console.log(data);
  if (!data) return;
  if (!data.charts.length) { valert(`歌曲ID ${id} 对应的谱面不存在`); return }
  await readData(data);
}
async function dialogc(num) {
  const id = num || vprompt('请输入谱面ID');
  if (id === '' || id === null) { valert('未输入谱面ID，已取消操作'); return }
  const data = await queryChart(id).catch(err => {
    valert(`无法连接至服务器\n错误代码：${err.message}`);
    sendText('无法连接至服务器');
  });
  console.log(data);
  if (!data) return;
  if (!data.charts.length) { valert(`谱面ID ${id} 对应的谱面不存在`); return }
  await readData(data);
}
async function random() {
  const data = await queryRandom().catch(err => valert(`无法连接至服务器\n错误代码：${err.message}`));
  console.log(data);
  if (!data) return;
  if (!data.charts.length) { valert(`歌曲ID ${'<random>'} 对应的谱面不存在`); return }
  await readData(data);
}
async function query(id) {
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
function getData(base, song) {
  console.log('getData::base', ...base);
  console.log('getData::song', song);
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
  const /** @type {array} */ { charts } = data;
  const urls = [data.song, data.illustration];
  for (const chart of charts) {
    if (chart.chart) urls.push(chart.chart);
    if (chart.assets) urls.push(chart.assets);
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
    if (chart.assets) await xhr4(chart.assets, dstr(chart.assets));
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
  if (id === '0ada5f8d-7f1d-426e-b53d-747d4489e255') return 100; // 29
  if (id === '5201e181-b5d1-4931-9785-e78cbed0758e') return 50; // 34
  if (id === '8747c9b5-9029-499d-b1d5-59bd46e2522f') return 150; // 35
  if (id === 'ccf6522f-d746-4b76-9b3b-09d6534fd99e') return 50; // 38
  if (id === '5d17fa22-51da-48e3-b56d-29ed782d830b') return 175; // 39
  if (id === '67b8c0fd-4879-41e3-af04-6dc8f41ddcd1') return -500; // 48
  if (id === 'e15c5743-fbb1-4d36-9821-43208a75bf07') return 100; // 51
  if (id === '2eb9e940-4350-4509-a244-068abd937f44') return 50; // 53
  if (id === '026c8905-6f24-421c-a594-e5f9bf1d053a') return 150; // 54
  if (id === '71acb2d4-225e-4b0a-989c-660f4c075542') return 175; // 57
  if (id === '165119b8-7074-4106-bb23-27a8fb99c0c6') return 150; // 58
  if (id === '846587d2-0ff2-40ca-b42b-3568cef08e48') return 250; // 59
  if (id === '74585cab-6b6f-4633-9c3d-4dfa9900cafd') return -100; // 61
  if (id === '4be75ae5-af61-4e2b-a23c-7171d063c391') return 300; // 66
  if (id === '108254a0-a756-4200-8391-1f47bb7707aa') return -50; // 68
  if (id === '8c4d638a-a1aa-4e29-a0d2-2f3a2cb7e69c') return 300; // 69
  if (id === 'e29e6b87-796f-4518-ac33-d9db79bbc103') return 200; // 70
  if (id === '7457a0a7-5d50-4e5e-b5a5-6049100a168e') return 200; // 72
  if (id === 'c4dc62c4-7bed-4f39-b6ed-451ecdcb9b6b') return 250; // 73
  if (id === '53e2ca24-2212-4795-be30-1a80cebbc339') return 250; // 76
  if (id === 'af635f4b-df9c-42ad-9f8d-e20c0e2aebad') return 400; // 77
  if (id === 'e4307062-420a-49a2-8515-b22375e7f6c4') return -50; // 79
  if (id === 'f0b1e2eb-f7f8-42ec-bcb3-6a717147ad4e') return 225; // 80
  if (id === '918a8854-04be-47e3-bfae-62699d193fee') return 200; // 82
  if (id === 'ed0d5555-7573-4b9d-a491-b22aeab66da7') return 200; // 83
  if (id === 'd7ad0802-22e1-4efc-8bba-4cfe074d2a95') return 200; // 85
  if (id === 'f2398611-f145-45f5-b4f9-78be5f97fa86') return 175; // 86
  if (id === '7be304a2-74cc-48a7-80bb-98de40cd814d') return -25; // 88
  if (id === '232ec440-647e-4319-96c2-17e97f4ea55d') return 150; // 90
  if (id === '11eae627-ff9e-48fe-8c9f-2d49d6e34221') return -100; // 91
  if (id === '79a029ad-1579-44d2-8ed2-f2c7cc8c6589') return -200; // 92
  if (id === '18686678-cd3b-493e-accb-c6ca0bc304c5') return -50; // 93
  if (id === 'acab357e-ac69-4e8c-88b4-f8a080560c52') return -400; // 95
  if (id === 'cfab519d-794d-4791-8881-969b00c60b46') return 150; // 96
  if (id === '20bec844-02b8-49e3-8c60-8bf8b8a36a96') return 200; // 97
  if (id === '5230368a-0764-4d17-8673-23c3b5a995d8') return 150; // 99
  if (id === '0ebddbc4-ff08-4484-8f21-bd0295526bdc') return 50; // 101
  if (id === '430a4ff2-e9e2-4add-9ee4-fbc172367e5d') return 200; // 104
  if (id === '260d12cf-847a-4773-aaf0-b754753f5596') return 75; // 108
  if (id === 'e5e9021d-9254-408d-8629-795849f51732') return 75; // 109
  if (id === '9d01431f-7c81-4fb5-a9a4-5f5ef4e07cd3') return 175; // 110
  if (id === '1476dcb7-37c8-4f97-b039-7e07a8583078') return 50; // 113
  if (id === '2b8217af-3c7b-44b2-a9c9-fe869ea17c07') return 50; // 114
  if (id === 'e7ab7d3b-1be4-4300-b9d6-63814faa381c') return 150; // 116
  if (id === 'a7b12a21-cb2c-4e79-9260-2cc3323752df') return -400; // 117
  if (id === '39a834ed-7310-46ac-99e4-577cde527a84') return -150; // 118
  if (id === 'da8533af-9767-47b0-87c0-c12684e02980') return -1450; // 127
  if (id === '97e22151-1cb8-4c48-8af4-c3419ed6b9ce') return 175; // 129
  if (id === '8d3c6775-9091-45bd-b6ff-d556cf36e85f') return -350; // 130
  if (id === '336b6099-61c1-403b-b226-483afc4a7bec') return 25; // 137
  if (id === 'b788d213-58e1-448f-8412-cebe8c8df12a') return 50; // 138
  if (id === '04181380-bdcf-40f3-8ec7-68a23ad84ba3') return 50; // 139
  if (id === '594e3208-8459-48ae-88e8-b11823e5c2ad') return 250; // 140
  if (id === '84f0ce5f-b894-4db6-b042-b31232c62d0c') return -150; // 141
  if (id === '920506fb-2c52-4d17-b7e7-d8f1fe6afde5') return 225; // 144
  if (id === 'd12f18e4-ca64-4781-97ee-a7d922c831cf') return 50; // 146
  if (id === '70c543f8-97c5-4a2d-82ff-17efc484d52f') return 400; // 148
  if (id === 'fb716191-ffb4-462b-b92d-85c86f94833e') return -200; // 150
  if (id === 'b15f2eb5-d9c1-40f7-9bc8-4ccbc69229c6') return 200; // 151
  if (id === 'a837eea9-b4a3-4c77-b7e5-757f4e940307') return 150; // 155
  if (id === '710750c5-3728-46b8-bfb2-f895f1f909c0') return 350; // 156
  if (id === '0108b4f0-d3ee-47a0-b6a1-bddcfad8f54d') return 400; // 157
  if (id === 'fbd4ca74-40c3-4c9f-9415-729f47d537fb') return -25; // 160
  if (id === '0a42b7b5-8a25-4438-b221-c9c0e585f27c') return -25; // 161
  if (id === 'e59e5ef8-d444-4dc6-aebe-44bfd4891a94') return -50; // 162
  if (id === 'c2006c12-e1c2-47ba-8292-c6c00b37dfbf') return 50; // 165
  if (id === '2b0338d9-e71a-40fe-8d79-dc8f6dec48da') return 50; // 166
  // handled up to 174
  return 0;
}
