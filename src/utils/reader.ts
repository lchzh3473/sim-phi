import { csv2array } from './csv2array';
import { stringify } from './stringify';
import md5 from 'md5';
// @ts-expect-error: vite-plugin-worker-loader
import Zip from '../zip.worker?worker';
export class FileEmitter extends EventTarget {
  private readonly input: HTMLInputElement;
  public constructor() {
    super();
    this.input = Object.assign(document.createElement('input'), {
      type: 'file',
      accept: '',
      multiple: true,
      onchange: () => {
        this.fireChange(this.input.files);
        for (const i of this.input.files || []) {
          // 加载文件
          const reader = new FileReader();
          reader.readAsArrayBuffer(i);
          reader.onprogress = evt => this.fireProgress(evt.loaded, evt.total);
          reader.onload = evt => evt.target && evt.target.result instanceof ArrayBuffer && this.fireLoad(i, evt.target.result);
        }
      }
    });
  }
  public uploadFile(): void {
    this.input.webkitdirectory = false;
    this.input.click();
  }
  public uploadDir(): void {
    this.input.webkitdirectory = true;
    this.input.click();
  }
  public fireChange(files: FileList | null): boolean {
    return this.dispatchEvent(Object.assign(new Event('change'), { files }));
  }
  public fireProgress(loaded: number, total: number): boolean {
    return this.dispatchEvent(new ProgressEvent('progress', { lengthComputable: true, loaded, total }));
  }
  public fireLoad(file: Pick<File, 'name'>, buffer: ArrayBuffer): boolean {
    return this.dispatchEvent(Object.assign(new ProgressEvent('load'), { file, buffer }));
  }
}
export class ZipReader extends EventTarget {
  public total: number;
  private worker: Worker | null;
  private readonly handler: (data: ByteData) => Promise<unknown>;
  public constructor({ handler = async data => Promise.resolve(data) }: ReaderOptions) {
    super();
    this.worker = null;
    this.total = 0;
    this.handler = handler;
  }
  public read(result0: ByteData): void {
    if (!this.worker) {
      this.dispatchEvent(new CustomEvent('loadstart'));
      const worker = new Zip() as Worker; // 以后考虑indexedDB存储url
      worker.addEventListener('message', msg => {
        const handler = async() => {
          const { data } = msg as { data: { data: ByteData; total: number } };
          this.total = data.total;
          const result = await this.handler(data.data);
          this.dispatchEvent(new CustomEvent('read', { detail: result }));
        };
        handler().catch((err: Error) => this.dispatchEvent(new CustomEvent('error', { detail: err })));
      });
      this.worker = worker;
    }
    this.worker.postMessage(result0, [result0.buffer]);
  }
  public terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}
interface ReaderInit {
  pattern: RegExp;
  /** binary(not text)/text(not json)/json */
  type?: 'binary' | 'json' | 'text';
  mustMatch?: boolean;
  weight?: number;
  read: (data: ByteData, path: string, options?: Record<string, unknown>) => Promise<ReaderData | null> | ReaderData | null;
}
export function defineReader(readerInit: ReaderInit): ByteReader {
  const { pattern, type = 'binary', mustMatch = false, weight = 0, read } = readerInit;
  const reader = { pattern, type, mustMatch, weight, read };
  if (type === 'text') {
    reader.read = async(i: ByteData, path: string) => {
      if (i.isText == null) {
        try {
          i.text = stringify(i.buffer);
          i.isText = true;
        } catch (error) {
          i.isText = false;
        }
      }
      return i.isText ? read(i, path) : null;
    };
  }
  if (type === 'json') {
    reader.read = async(i: ByteData, path: string) => {
      if (i.isText == null) {
        try {
          i.text = stringify(i.buffer);
          i.isText = true;
        } catch (error) {
          i.isText = false;
        }
      }
      if (i.isJSON == null) {
        try {
          i.data = JSON.parse(i.text!);
          i.isJSON = true;
        } catch (error) {
          i.isJSON = false;
        }
      }
      return i.isJSON ? read(i, path) : null;
    };
  }
  return reader;
}
const readers: ByteReader[] = [
  defineReader({
    pattern: /\.(mp3|ogg|wav|mp4|webm|ogv|mpg|mpeg|avi|mov|flv|wmv|mkv)$/i,
    async read(i: ByteData, _path, { createAudioBuffer }: Record<string, unknown> = {}) {
      return readMediaData(i, async(arraybuffer: ArrayBuffer) => {
        if (typeof createAudioBuffer === 'function') return createAudioBuffer(arraybuffer) as AudioBuffer;
        return defaultDecode(arraybuffer);
      });
    }
  }), defineReader({
    pattern: /\.json$/i,
    type: 'json',
    read(i: ByteData) {
      const jsonData = chart123(i.text!, (_, value) => typeof value === 'number' ? Math.fround(value) : value);
      return { type: 'chart', name: i.name, md5: md5(i.text!), data: jsonData };
    }
  }), defineReader({
    pattern: /\.(png|jpg|jpeg|gif|bmp|webp|svg)$/i,
    async read(i: ByteData) {
      const data = new Blob([i.buffer]);
      const imageData = await createImageBitmap(data);
      return { type: 'image' as const, name: i.name, data: imageData };
    }
  }), defineReader({
    pattern: /^line\.csv$/i,
    type: 'text',
    mustMatch: true,
    read(i: ByteData, path: string) {
      const data = i.text!;
      const chartLine = joinPathInfo(csv2array(data, true) as ChartLineData[], path);
      return { type: 'line' as const, data: chartLine };
    }
  }), defineReader({
    pattern: /^info\.csv$/i,
    type: 'text',
    mustMatch: true,
    read(i: ByteData, path: string) {
      const data = i.text!;
      const chartInfo = joinPathInfo(csv2array(data, true) as ChartInfoData[], path);
      return { type: 'info' as const, data: chartInfo };
    }
  })
];
async function defaultDecode(arraybuffer: ArrayBuffer) {
  const actx: AudioContext = new self.AudioContext();
  await actx.close();
  // return actx.decodeAudioData(arraybuffer);
  return new Promise((resolve: (value: AudioBuffer) => void, reject) => {
    const a = actx.decodeAudioData(arraybuffer, resolve, reject);
    if (a instanceof Promise) { a.then(resolve, reject) }
  }).catch(err => {
    if (err == null) { throw new DOMException('Unable to decode audio data', 'EncodingError') }
    throw err;
  });
}
async function readFile(i: ByteData, options = {}): Promise<ReaderData> {
  const { name, path } = splitPath(i.name);
  const readers0 = readers.filter(a => a.pattern.test(name) || !a.mustMatch);
  readers0.sort((a, b) => {
    if (a.pattern.test(name) && !b.pattern.test(name)) return -1;
    if (!a.pattern.test(name) && b.pattern.test(name)) return 1;
    if (a.weight > b.weight) return -1;
    if (a.weight < b.weight) return 1;
    return 0;
  });
  const errors = [] as Error[];
  const errorHandler = (reader: ByteReader, err: Error) => {
    if (reader.pattern.test(name)) errors.push(err);
  };
  for (const reader of readers0) {
    try {
      const data = await reader.read(i, path, options);
      if (data) return data;
    } catch (err) {
      errorHandler(reader, err as Error);
    }
  }
  return { type: 'unknown', name, data: readers[0].pattern.test(name) ? errors : '' };
}
export const fileReader = {
  readFile,
  use: (reader: ByteReader): void => {
    readers.push(reader);
  }
};
function splitPath(i: string) {
  const j = i.lastIndexOf('/');
  const name = i.slice(j + 1);
  const path = ~j ? i.slice(0, j) : '';
  return { name, path };
}
export function joinPathInfo(info: ChartInfoData[], path: string): ChartInfoData[] {
  if (!path) return info;
  for (const i of info) {
    if (i.Chart != null) i.Chart = `${path}/${i.Chart}`;
    if (i.Music != null) i.Music = `${path}/${i.Music}`;
    if (i.Image != null) i.Image = `${path}/${i.Image}`;
  }
  return info;
}
async function readMediaData(i: ByteData, createAudioBuffer: (arraybuffer: ArrayBuffer) => Promise<AudioBuffer>) {
  const videoElement = document.createElement('video');
  await new Promise(resolve => {
    videoElement.src = URL.createObjectURL(new Blob([i.buffer]));
    videoElement.preload = 'metadata';
    videoElement.onloadedmetadata = resolve;
    videoElement.onerror = resolve;
  });
  const { videoWidth: width, videoHeight: height } = videoElement;
  const data = {
    audio: await createAudioBuffer(i.buffer.slice(0)),
    video: width && height ? videoElement : null
  };
  return { type: 'media' as const, name: i.name, data };
}
// test
export function chart123(text: string, reviver?: (this: unknown, key: string, value: unknown) => unknown): Chart {
  const chart = (typeof reviver === 'function' ? JSON.parse(text, reviver) : JSON.parse(text)) as Chart;
  if (chart.formatVersion === undefined) throw new Error('Invalid chart file');
  switch (Number(chart.formatVersion) | 0) {
    case 1: {
      chart.formatVersion = 3;
      for (const i of chart.judgeLineList) {
        for (const j of i.judgeLineMoveEvents) {
          j.start2 = j.start % 1e3 / 520;
          j.end2 = j.end % 1e3 / 520;
          j.start = Math.floor(j.start / 1e3) / 880;
          j.end = Math.floor(j.end / 1e3) / 880;
        }
      } // fallthrough
    }
    case 3: {
      for (const i of chart.judgeLineList) {
        let y = 0;
        let y2 = 0; // float32
        for (const j of i.speedEvents) {
          if (j.startTime < 0) j.startTime = 0;
          j.floorPosition = y;
          j.floorPosition2 = y2;
          y += (j.endTime - j.startTime) / i.bpm * 1.875 * j.value;
          y2 += Math.fround(Math.fround((j.endTime - j.startTime) / i.bpm * 1.875) * j.value);
          y = Math.fround(y);
          y2 = Math.fround(y2);
        }
      } // fallthrough
    }
    case 3473:
      for (const i of chart.judgeLineList) {
        if (i.numOfNotes == null) {
          i.numOfNotes = 0;
          for (const j of i.notesAbove) {
            if (j.type === 1) i.numOfNotes++;
            if (j.type === 2) i.numOfNotes++;
            if (j.type === 3) i.numOfNotes++;
            if (j.type === 4) i.numOfNotes++;
          }
          for (const j of i.notesBelow) {
            if (j.type === 1) i.numOfNotes++;
            if (j.type === 2) i.numOfNotes++;
            if (j.type === 3) i.numOfNotes++;
            if (j.type === 4) i.numOfNotes++;
          }
        }
      }
      if (chart.numOfNotes == null) {
        chart.numOfNotes = 0;
        for (const i of chart.judgeLineList) chart.numOfNotes += i.numOfNotes;
      }
      break;
    default:
      throw new Error(`Unsupported formatVersion: ${chart.formatVersion}`);
  }
  return chart;
}
