// /* global JSZip */
let total = 0;
// const urls = [ // JSZip
//   'https://unpkg.com/jszip/dist/jszip.min.js', //
//   'https://cdn.jsdelivr.net/npm/jszip', //
//   'https://fastly.jsdelivr.net/npm/jszip', //
//   'https://cdn.bootcdn.net/ajax/libs/jszip/3.10.1/jszip.min.js', //
//   'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
// ];
// for (const url of urls) try { importScripts(url); break } catch (e) continue;
import { loadAsync } from 'jszip'; // 踩坑：linux文件名区分大小写，JSZip将报错
interface Data { name: string; path: string; buffer: ArrayBuffer }
function readZip(data: Data) { // JSZip
  loadAsync(data.buffer, { checkCRC32: true, decodeFileName: stringify as (bytes: Buffer | string[] | Uint8Array) => string }).then(zip => {
    console.debug(zip);
    const arr = Object.values(zip.files).filter(i => !i.dir);
    total += arr.length - 1;
    for (const i of arr) i.async('arraybuffer').then(buffer => readZip({ name: i.name, path: `${data.path}/${i.name}`, buffer }));
  }, () => self.postMessage({ data, total }, [data.buffer]));
}
function stringify(bfs: BufferSource) {
  const labels = ['gbk', 'big5', 'shift_jis'];
  let error = null;
  for (const label of labels) {
    const decoder = new TextDecoder(label, { fatal: true });
    try { return decoder.decode(bfs) } catch (err) { error = err }
  }
  throw error;
}
self.addEventListener('message', (msg: Event & { data: Data }) => readZip((total++, msg.data)));
