import Pec from '../extends/pec/index';
import { chart123, defineReader, fileReader, joinPathInfo } from './reader';
import md5 from 'md5';
fileReader.use(defineReader({
  pattern: /\.(json|pec)$/i,
  type: 'json',
  read(i: ByteData) {
    const rpeData = Pec.parseRPE(i.text!, i.name/* , path */); // TODO: path
    const jsonData = chart123(rpeData.data);
    const { messages: msg, info, line, format } = rpeData;
    return { type: 'chart', name: i.name, md5: md5(i.text!), data: jsonData, msg, info, line, format };
  }
}));
fileReader.use(defineReader({
  pattern: /\.pec$/i,
  type: 'text',
  read(i: ByteData) {
    const pecData = Pec.parse(i.text!, i.name);
    const jsonData = chart123(pecData.data);
    const { messages: msg, format } = pecData;
    return { type: 'chart', name: i.name, md5: md5(i.text!), data: jsonData, msg, format };
  }
}));
fileReader.use(defineReader({
  pattern: /^(Settings|info)\.txt$/i,
  type: 'text',
  mustMatch: true,
  read(i: ByteData, path: string) {
    const data = i.text!;
    const chartInfo = joinPathInfo(Pec.readInfo(data), path);
    return { type: 'info' as const, data: chartInfo };
  }
}));
if (Object.hasOwn(self, 'webp')) {
  fileReader.use(defineReader({
    pattern: /\.webp$/i,
    type: 'binary',
    async read(i: ByteData) {
      const webp2canvas = Object.getOwnPropertyDescriptor(self, 'webp')?.value.default as (buffer: ArrayBuffer) => Promise<HTMLCanvasElement>;
      const img = await webp2canvas(i.buffer);
      const bitmap = await createImageBitmap(img);
      return { type: 'image', name: i.name, data: bitmap };
    }
  }));
}
// fileReader.use(defineReader({
//   pattern: /^\.ogg$/i,
//   type: 'binary',
//   async read(i: ByteData) {
//     const { OggVorbisDecoder } = await import('@wasm-audio-decoders/ogg-vorbis');
//     const decoder = new OggVorbisDecoder();
//     await decoder.ready;
//     const { channelData, samplesDecoded, sampleRate } = await decoder.decodeFile(new Uint8Array(i.buffer));
//     decoder.free();
//     const actx = new (window.AudioContext || window.webkitAudioContext)();
//     const ab = actx.createBuffer(channelData.length, samplesDecoded, sampleRate);
//     channelData.forEach((channel, idx) => ab.getChannelData(idx).set(channel));
//     return { type: 'audio', name: i.name, data: { audio: ab, video: null } };
//   }
// }));
