export function stringify(bfs: BufferSource): string {
  const labels = ['utf-8', 'gbk', 'big5', 'shift_jis'];
  for (const label of labels) {
    const decoder = new TextDecoder(label, { fatal: true }); // '\ufffd'
    try {
      return decoder.decode(bfs);
    } catch (e) {
      if (label === labels[labels.length - 1]) throw e;
    }
  }
  throw new Error('Unknown encoding');
}
