import { PEC } from '@sim-phi/extends';
import { reader, splitPath } from './reader';
import { structChart } from './Chart';
import { structInfoData, structLineData } from './structInfo';
import md5 from 'md5';
reader.use({
  pattern: /\.(json|pec)$/i,
  type: 'json',
  read(i: ByteData): ChartReaderData {
    const { name, path } = splitPath(i.pathname);
    const rpeData = PEC.parseRPE(i.text!, i.pathname, name);
    const { data, messages } = structChart(rpeData.data, i.pathname);
    const info = structInfoData([rpeData.info], path);
    const line = structLineData(rpeData.line, path);
    const { messages: msg, format } = rpeData;
    messages.push(...msg);
    return { pathname: i.pathname, type: 'chart', md5: md5(i.text!), data, msg: messages, info, line, format };
  }
});
reader.use({
  pattern: /\.pec$/i,
  type: 'text',
  read(i: ByteData): ChartReaderData {
    const pecData = PEC.parse(i.text!, i.pathname);
    const { data, messages } = structChart(pecData.data, i.pathname);
    const { messages: msg, format } = pecData;
    (messages as (BetterMessage | string)[]).push(...msg);
    return { pathname: i.pathname, type: 'chart', md5: md5(i.text!), data, msg: messages, format };
  }
});
reader.use({
  pattern: /^(Settings|info)\.txt$/i,
  type: 'text',
  mustMatch: true,
  read(i: ByteData): ChartInfoReaderData {
    const { path } = splitPath(i.pathname);
    const data = i.text!;
    const chartInfo = structInfoData(PEC.readInfo(data), path);
    return { pathname: i.pathname, type: 'info', data: chartInfo };
  }
});
if (Object.hasOwn(self, 'webp')) {
  reader.use({
    pattern: /\.webp$/i,
    type: 'binary',
    async read(i: ByteData): Promise<ImageReaderData> {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const webp2canvas = Object.getOwnPropertyDescriptor(self, 'webp')?.value.default as (buffer: ArrayBuffer) => Promise<HTMLCanvasElement>;
      const img = await webp2canvas(i.buffer);
      const bitmap = await createImageBitmap(img);
      return { pathname: i.pathname, type: 'image', data: bitmap };
    }
  });
}
// reader.use({
//   pattern: /^\.ogg$/i,
//   type: 'binary',
//   async read(i: ByteData): Promise<MediaReaderData> {
//     const { OggVorbisDecoder } = await import('@wasm-audio-decoders/ogg-vorbis');
//     const decoder = new OggVorbisDecoder();
//     await decoder.ready;
//     const { channelData, samplesDecoded, sampleRate } = await decoder.decodeFile(new Uint8Array(i.buffer));
//     decoder.free();
//     const actx = new (window.AudioContext || window.webkitAudioContext)();
//     const ab = actx.createBuffer(channelData.length, samplesDecoded, sampleRate);
//     channelData.forEach((channel, idx) => ab.getChannelData(idx).set(channel));
//     return { pathname: i.pathname, type: 'media', data: { audio: ab, video: null } };
//   }
// });
