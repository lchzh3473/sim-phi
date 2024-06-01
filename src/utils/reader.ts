import { parseCSV } from './parseCSV';
import { stringify } from './stringify';
import { structChart } from './Chart';
import { structInfoData, structLineData } from './structInfo';
import md5 from 'md5';
// @ts-expect-error: vite-plugin-worker-loader
import Zip from '@/zip.worker?worker';
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
        for (const file of this.input.files || []) {
          // 加载文件
          const reader = new FileReader();
          reader.readAsArrayBuffer(file);
          reader.onprogress = evt => this.fireProgress(evt.loaded, evt.total);
          reader.onload = evt => evt.target && evt.target.result instanceof ArrayBuffer && this.fireLoad(file, evt.target.result);
        }
        this.input.value = ''; // allow same file
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
  public read(zipData: ByteData): void {
    if (!this.worker) {
      this.dispatchEvent(new CustomEvent('loadstart'));
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const worker = new Zip() as Worker; // 以后考虑indexedDB存储url
      worker.addEventListener('message', msg => {
        const handler = async() => {
          const { data } = msg as { data: { data: ByteData; total: number } };
          this.total = data.total;
          const result = await this.handler(data.data);
          this.dispatchEvent(new CustomEvent('read', { detail: result }));
        };
        handler().catch((e: unknown) => this.dispatchEvent(new CustomEvent('error', { detail: e })));
      });
      this.worker = worker;
    }
    this.worker.postMessage(zipData, [zipData.buffer]);
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
  read: (data: ByteData, options?: Record<string, unknown>) => Promise<ReaderData | null> | ReaderData | null;
}
function defineReader(readerInit: ReaderInit): ByteReader {
  const { pattern, type = 'binary', mustMatch = false, weight = 0, read } = readerInit;
  const reader = { pattern, type, mustMatch, weight, read };
  if (type === 'text') {
    reader.read = async(i: ByteData) => {
      if (i.isText == null) {
        try {
          i.text = stringify(i.buffer);
          i.isText = true;
        } catch (error) {
          i.isText = false;
        }
      }
      return i.isText ? read(i) : null;
    };
  }
  if (type === 'json') {
    reader.read = async(i: ByteData) => {
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
      return i.isJSON ? read(i) : null;
    };
  }
  return reader;
}
const readerInits: ReaderInit[] = [
  {
    pattern: /\.(mp3|ogg|wav|mp4|webm|ogv|mpg|mpeg|avi|mov|flv|wmv|mkv)$/i,
    async read(i: ByteData, { createAudioBuffer }: Record<string, unknown> = {}): Promise<MediaReaderData> {
      return readMediaData(i, async(arraybuffer: ArrayBuffer) => {
        if (typeof createAudioBuffer === 'function') return createAudioBuffer(arraybuffer) as AudioBuffer;
        return defaultDecode(arraybuffer);
      });
    }
  }, {
    pattern: /\.json$/i,
    type: 'json',
    read(i: ByteData): ChartReaderData {
      const text = i.text!;
      const json = JSON.parse(text, (_, value) => typeof value === 'number' ? Math.fround(value) : value as unknown) as ChartPGS;
      const { data: jsonData, messages } = structChart(json, i.pathname);
      const format = `PGS(${jsonData.formatVersion})`;
      return { pathname: i.pathname, type: 'chart', md5: md5(text), data: jsonData, msg: messages, format };
    }
  }, {
    pattern: /\.(png|jpg|jpeg|gif|bmp|webp|svg)$/i,
    async read(i: ByteData): Promise<ImageReaderData> {
      const data = new Blob([i.buffer]);
      const imageData = await createImageBitmap(data);
      return { pathname: i.pathname, type: 'image', data: imageData };
    }
  }, {
    pattern: /^line\.csv$/i,
    type: 'text',
    mustMatch: true,
    read(i: ByteData): ChartLineReaderData {
      const { path } = splitPath(i.pathname);
      const data = i.text!;
      const chartLine = structLineData(parseCSV(data, true), path);
      return { pathname: i.pathname, type: 'line', data: chartLine };
    }
  }, {
    pattern: /^info\.csv$/i,
    type: 'text',
    mustMatch: true,
    read(i: ByteData): ChartInfoReaderData {
      const { path } = splitPath(i.pathname);
      const data = i.text!;
      const chartInfo = structInfoData(parseCSV(data, true), path);
      return { pathname: i.pathname, type: 'info', data: chartInfo };
    }
  }
];
async function defaultDecode(arraybuffer: ArrayBuffer) {
  const actx: AudioContext = new self.AudioContext();
  await actx.close();
  // return actx.decodeAudioData(arraybuffer);
  return new Promise((resolve: (value: AudioBuffer) => void, reject) => {
    const a = actx.decodeAudioData(arraybuffer, resolve, reject);
    if (a instanceof Promise) a.then(resolve, reject);
  }).catch((e: unknown) => {
    if (e instanceof Error) throw e;
    throw new DOMException('Unable to decode audio data', 'EncodingError');
  });
}
function createReader(define: ((readerInit: ReaderInit) => ByteReader)) {
  const readers = readerInits.map(define);
  return {
    async read(i: ByteData, options = {}): Promise<ReaderData> {
      const { name } = splitPath(i.pathname);
      const filtered = readers.filter(a => a.pattern.test(name) || !a.mustMatch);
      filtered.sort((a, b) => {
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
      for (const reader of filtered) {
        try {
          const data = await reader.read(i, options);
          if (data) return data;
        } catch (err) {
          errorHandler(reader, err as Error);
        }
      }
      return { pathname: i.pathname, type: 'unknown', data: errors.join('\n') }; // TODO: 完善错误信息
    },
    use(readerInit: ReaderInit | ReaderInit[]) {
      if (Array.isArray(readerInit)) {
        for (const reader of readerInit) this.use(reader);
      } else {
        readers.push(define(readerInit));
      }
    }
  } as const;
}
export const reader = createReader(defineReader);
export function splitPath(i: string): { name: string; path: string } {
  const j = i.lastIndexOf('/');
  const name = i.slice(j + 1);
  const path = ~j ? i.slice(0, j) : '';
  return { name, path };
}
async function readMediaData(i: ByteData, createAudioBuffer: (arraybuffer: ArrayBuffer) => Promise<AudioBuffer>) {
  const videoElement = document.createElement('video');
  await new Promise(resolve => {
    videoElement.src = URL.createObjectURL(new Blob([i.buffer]));
    videoElement.preload = 'metadata';
    videoElement.onloadedmetadata = resolve;
    videoElement.onerror = resolve;
  });
  return {
    pathname: i.pathname,
    type: 'media',
    data: {
      audio: await createAudioBuffer(i.buffer.slice(0)),
      video: videoElement.videoWidth && videoElement.videoHeight ? videoElement : null
    }
  } as MediaReaderData;
}
