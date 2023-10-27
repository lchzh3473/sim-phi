import Pec from '../extends/pec/index';
import { reader } from './reader';
import { structChart } from './Chart';
import { structInfoData, structLineData } from './structInfo';
import md5 from 'md5';
reader.use({
  pattern: /\.(json|pec)$/i,
  type: 'json',
  read(i: ByteData, path: string) {
    const rpeData = Pec.parseRPE(i.text!, i.name/* , path */); // TODO: path
    const data = structChart(rpeData.data);
    const info = structInfoData([rpeData.info], path);
    const line = structLineData(rpeData.line, path);
    const { messages: msg, format } = rpeData;
    return { type: 'chart', name: i.name, md5: md5(i.text!), data, msg, info, line, format };
  }
});
reader.use({
  pattern: /\.pec$/i,
  type: 'text',
  read(i: ByteData) {
    const pecData = Pec.parse(i.text!, i.name);
    const data = structChart(pecData.data);
    const { messages: msg, format } = pecData;
    return { type: 'chart', name: i.name, md5: md5(i.text!), data, msg, format };
  }
});
reader.use({
  pattern: /^(Settings|info)\.txt$/i,
  type: 'text',
  mustMatch: true,
  read(i: ByteData, path: string) {
    const data = i.text!;
    const chartInfo = structInfoData(Pec.readInfo(data), path);
    return { type: 'info' as const, data: chartInfo };
  }
});
if (Object.hasOwn(self, 'webp')) {
  reader.use({
    pattern: /\.webp$/i,
    type: 'binary',
    async read(i: ByteData) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const webp2canvas = Object.getOwnPropertyDescriptor(self, 'webp')?.value.default as (buffer: ArrayBuffer) => Promise<HTMLCanvasElement>;
      const img = await webp2canvas(i.buffer);
      const bitmap = await createImageBitmap(img);
      return { type: 'image', name: i.name, data: bitmap };
    }
  });
}
// fileReader.use({
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
// });
