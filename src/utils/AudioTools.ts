let _actx: AudioContext = null!;
let _gain: GainNode = null!;
let _msdest: MediaStreamAudioDestinationNode | null = null;
let _inited = false;
const initFnList: (() => void)[] = [];
const bfsList: (AudioBufferSourceNode | IntervalBufferSource)[] = [];
interface AudioParamOptions {
  loop: boolean;
  offset: number;
  playbackrate: number;
  interval: number;
}
class IntervalBufferSource {
  public res: AudioBuffer;
  public loop: boolean;
  public offset: number;
  public playbackrate: number;
  public interval: number;
  public dest: AudioNode;
  public startTime: number;
  private _bfs: AudioBufferSourceNode | null;
  public constructor(res: AudioBuffer, dest: AudioNode, options: AudioParamOptions) {
    const { loop, offset, playbackrate, interval } = options;
    this.res = res;
    this.dest = dest;
    this.loop = loop;
    this.offset = offset;
    this.playbackrate = playbackrate;
    this.interval = interval;
    this.startTime = NaN;
    this._bfs = null;
  }
  public get bfs() {
    return this._bfs || _actx.createBufferSource();
  }
  public start() {
    this.startTime = performance.now() / 1000; // 使用actx.currentTime会有迷之延迟
    this._loop();
  }
  public stop() {
    if (!this._bfs) return;
    this._bfs.onended = null;
    this._bfs.stop();
  }
  private _loop() {
    this._bfs = _actx.createBufferSource();
    const bfs = this._bfs;
    bfs.buffer = this.res;
    bfs.loop = this.loop; // 循环播放
    bfs.connect(this.dest);
    bfs.playbackRate.value = this.playbackrate;
    const currentOffset = (this.offset + (performance.now() / 1000 - this.startTime) * this.playbackrate) % this.res.duration;
    bfs.start(_actx.currentTime, currentOffset, this.interval);
    bfs.onended = _ => {
      bfs.onended = null;
      if (currentOffset + this.interval > this.res.duration && !this.loop) return;
      this._loop();
    };
  }
}
function play(res: AudioBuffer, dest: AudioNode, options: AudioParamOptions): () => AudioBufferSourceNode {
  const { loop, offset, playbackrate, interval } = options;
  if (isFinite(interval) && interval > 0) {
    const bufferSource = new IntervalBufferSource(res, dest, options);
    bufferSource.start();
    bfsList[bfsList.length] = bufferSource;
    return () => bufferSource.bfs;
  }
  const bufferSource = _actx.createBufferSource();
  bufferSource.buffer = res;
  bufferSource.loop = loop; // 循环播放
  bufferSource.connect(dest);
  bufferSource.playbackRate.value = playbackrate;
  bufferSource.start(0, offset);
  bfsList[bfsList.length] = bufferSource;
  return () => bufferSource;
}
const audio = {
  get actx(): AudioContext | null { return _actx },
  get gainNode(): GainNode | null { return _gain },
  get msdest(): MediaStreamAudioDestinationNode | null { return _msdest },
  set msdest(msdest: MediaStreamAudioDestinationNode | null) {
    if (msdest) _gain.connect(msdest);
    else if (_msdest) _gain.disconnect(_msdest);
    _msdest = msdest;
  },
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/strict-boolean-expressions
  init(context = self.AudioContext || self.webkitAudioContext): AudioContext {
    // eslint-disable-next-line new-cap
    _actx = new context();
    _gain = _actx.createGain();
    _gain.connect(_actx.destination);
    _inited = true;
    for (const initFn of initFnList) initFn();
    return _actx;
  },
  test(callback: () => unknown): void {
    if (_inited) callback();
    initFnList[initFnList.length] = callback;
  },
  async decode(arraybuffer: ArrayBuffer): Promise<AudioBuffer> {
    return _actx.decodeAudioData(arraybuffer);
  },
  mute(length: number): AudioBuffer {
    return _actx.createBuffer(2, 44100 * length, 44100);
  },
  sine(length: number, frequency = 440, gain = 1): AudioBuffer {
    const buffer = _actx.createBuffer(1, 44100 * length, 44100);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.sin(i * frequency * 2 * Math.PI / 44100) * gain;
    }
    return buffer;
  },
  sawtooth(length: number, frequency = 440, gain = 1): AudioBuffer {
    const buffer = _actx.createBuffer(1, 44100 * length, 44100);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (i * frequency / 44100 % 1 - 0.5) * 2 * gain;
    }
    return buffer;
  },
  square(length: number, frequency = 440, gain = 1): AudioBuffer {
    const buffer = _actx.createBuffer(1, 44100 * length, 44100);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (i * frequency / 44100 % 1 < 0.5 ? 1 : -1) * gain;
    }
    return buffer;
  },
  triangle(length: number, frequency = 440, gain = 1): AudioBuffer {
    const buffer = _actx.createBuffer(1, 44100 * length, 44100);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.abs((i * frequency / 44100 % 1 - 0.5) * 4) - 1) * gain;
    }
    return buffer;
  },
  noise(length: number, gain = 1): AudioBuffer {
    const buffer = _actx.createBuffer(1, 44100 * length, 44100);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * gain;
    }
    return buffer;
  },
  play(res: AudioBuffer, options: Partial<AudioParamOptions> = {}): () => AudioBufferSourceNode {
    const { loop = false, offset = 0, playbackrate = 1, interval = 0 } = options;
    return play(res, _gain, { loop, offset, playbackrate, interval });
  },
  stop(): void {
    for (const i of bfsList) i.stop();
    bfsList.length = 0;
  }
};
class AudioController {
  public gainNode: GainNode;
  public constructor() {
    this.gainNode = null!;
    audio.test(this.init.bind(this));
  }
  private init() {
    const gain = _actx.createGain();
    gain.connect(_gain);
    this.gainNode = gain;
  }
  public play(res: AudioBuffer, options: Partial<AudioParamOptions> = {}): () => AudioBufferSourceNode {
    const { loop = false, offset = 0, playbackrate = 1, interval = 0 } = options;
    return play(res, this.gainNode, { loop, offset, playbackrate, interval });
  }
}
export { audio, AudioController };
