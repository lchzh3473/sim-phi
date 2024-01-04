/* eslint-disable @typescript-eslint/naming-convention */
interface Navigator {
  /** Available only in iOS */
  readonly standalone?: boolean;
}
interface Oggmented {
  OggmentedAudioContext: typeof AudioContext;
}
interface Window {
  AudioContext: typeof AudioContext;
  // /** Available only in iOS */
  // webkitAudioContext: typeof AudioContext;
}
interface Document {
  webkitExitFullscreen: () => Promise<void>;
  mozCancelFullScreen: () => Promise<void>;
  onwebkitfullscreenchange: (this: Document, ev: Event) => void;
  onmozfullscreenchange: (this: Document, ev: Event) => void;
  onwebkitfullscreenerror: (this: Document, ev: Event) => void;
  onmozfullscreenerror: (this: Document, ev: Event) => void;
  webkitFullscreenElement: Element;
  mozFullScreenElement: Element;
  webkitFullscreenEnabled: boolean;
  mozFullScreenEnabled: boolean;
}
interface HTMLElement {
  webkitRequestFullscreen: () => Promise<void>;
  mozRequestFullScreen: () => Promise<void>;
}
// Custom
interface Window {
  /** @deprecated for debug */
  [key: string]: unknown;
  _i: [string, (number | string)[], number, number];
  hook: object;
  oggmented: Oggmented;
}
interface Event {
  readonly target: EventTarget;
}
interface EventTarget {
  dispatchEvent: <K extends keyof CustomEventMap>(event: CustomEventMap[K]) => boolean;
  addEventListener: <K extends keyof CustomEventMap>(type: K, listener: (this: EventTarget, ev: CustomEventMap[K]) => unknown, options?: AddEventListenerOptions | boolean) => void;
  removeEventListener: <K extends keyof CustomEventMap>(type: K, listener: (this: EventTarget, ev: CustomEventMap[K]) => unknown, options?: AddEventListenerOptions | boolean) => void;
}
interface HTMLCanvasElement extends HTMLElement {
  getContext: (contextId: 'experimental-webgl', contextAttributes?: WebGLContextAttributes) => WebGLRenderingContext | null;
}
interface CustomEventMap {
  progress: ProgressEvent;
  load: ProgressEvent<FileReader> & { file: File; buffer: ArrayBuffer };
  read: CustomEvent<ByteData>;
}
interface ResourceMap {
  [key: string]: AudioBuffer | ImageBitmap | null;
  HitSong0: AudioBuffer;
  HitSong1: AudioBuffer;
  HitSong2: AudioBuffer;
  // LevelOver0_v1: AudioBuffer;
  // LevelOver1_v1: AudioBuffer;
  // LevelOver2_v1: AudioBuffer;
  // LevelOver3_v1: AudioBuffer;
  HitFXRaw: ImageBitmap;
  NoImageBlack: ImageBitmap;
  NoImageWhite: ImageBitmap;
  JudgeLine: ImageBitmap;
  JudgeLineMP: ImageBitmap;
  JudgeLineFC: ImageBitmap;
  Ranks: ImageBitmap[];
  Rank: ImageBitmap;
  mute: AudioBuffer;
  ProgressBar: ImageBitmap;
  LevelOver1: ImageBitmap;
  LevelOver3: ImageBitmap;
  LevelOver4: ImageBitmap;
  LevelOver5: ImageBitmap;
}
interface MediaData {
  audio: AudioBuffer | null;
  video: HTMLVideoElement | null;
}
interface BetterMessage {
  host: string;
  code: number;
  name: string;
  message: string;
  target: string;
}
interface ReaderData2 {
  /** 包含相对路径和文件名 */
  pathname: string;
  type: string;
}
interface ChartLineReaderData extends ReaderData2 {
  type: 'line';
  data: ChartLineData[];
}
interface ChartInfoReaderData extends ReaderData2 {
  type: 'info';
  data: ChartInfoData[];
}
interface ImageReaderData extends ReaderData2 {
  type: 'image';
  data: ImageBitmap;
}
interface MediaReaderData extends ReaderData2 {
  type: 'media';
  data: MediaData;
}
interface ChartReaderData extends ReaderData2 {
  type: 'chart';
  data: Chart;
  format: string;
  md5: string;
  msg?: (BetterMessage | string)[];
  info?: ChartInfoData[];
  line?: ChartLineData[];
}
interface UnknownReaderData extends ReaderData2 {
  type: 'unknown';
  data: unknown;
}
type ReaderData = ChartInfoReaderData | ChartLineReaderData | ChartReaderData | ImageReaderData | MediaReaderData | UnknownReaderData;
interface ByteData {
  /** 包含相对路径和文件名 */
  pathname: string;
  buffer: ArrayBuffer;
  text?: string;
  isText?: boolean;
  data?: unknown;
  isJSON?: boolean;
}
interface ByteReader {
  pattern: RegExp;
  type: string;
  mustMatch: boolean;
  weight: number;
  read: (data: ByteData, options: Record<string, unknown>) => Promise<ReaderData | null> | ReaderData | null;
}
interface ReaderOptions {
  handler: (data: ByteData) => Promise<unknown>;
}
interface ChartLineData {
  chart: string;
  lineId?: number;
  image?: string;
  scaleOld?: number;
  scale?: number;
  aspect?: number;
  useBackgroundDim?: boolean;
  useLineColor?: boolean;
  useLineScale?: boolean;
}
interface ChartInfoData {
  chart: string;
  name?: string;
  artist?: string;
  composer?: string;
  level?: string;
  illustrator?: string;
  charter?: string;
  music?: string;
  image?: string;
  aspectRatio?: number;
  noteScale?: number;
  backgroundDim?: number;
  offset?: number;
}
interface StatData {
  newBestColor: string;
  newBestStr: string;
  scoreBest: string;
  scoreDelta: string;
  textAboveColor: string;
  textAboveStr: string;
  textBelowColor: string;
  textBelowStr: string;
}
interface ModuleConfig {
  name: string;
  description: string;
  contents: ModuleContent[];
}
interface ModuleBase {
  default: {
    contents: ModuleContent[];
  };
}
interface CommandModuleContent {
  type: 'command';
  meta: [string, () => void];
}
interface ScriptModuleContent {
  type: 'script';
  meta: [(arg0: (query: string) => Element | null) => void];
}
interface ConfigModuleContent {
  type: 'config';
  meta: [string, () => void];
}
interface UnknownModuleContent {
  type: 'unknown';
  meta: unknown;
}
interface FontOptions {
  alt: string;
}
type ModuleContent = CommandModuleContent | ConfigModuleContent | ScriptModuleContent | UnknownModuleContent;
// 只有CommonJS才认全局import
declare const JSZip: typeof import('jszip');
declare let hook: typeof import('./index').hook;
declare const Utils: {
  escapeHTML: (str: string) => string;
  addFont: (name: string, alt?: FontOptions) => Promise<unknown>;
  randomUUID: () => string;
} = {};
