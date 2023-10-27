export function structInfoData(record: Record<string, string | null>[], path: string): ChartInfoData[] {
  const result = [];
  for (const i of record) {
    if (i.Chart == null) continue;
    const data: ChartInfoData = { chart: i.Chart };
    if (i.Name != null) data.name = i.Name;
    if (i.Musician != null) data.artist = i.Musician; // Alternative
    if (i.Composer != null) data.artist = i.Composer; // Alternative
    if (i.Artist != null) data.artist = i.Artist;
    if (i.Level != null) data.level = i.Level;
    if (i.Illustrator != null) data.illustrator = i.Illustrator;
    if (i.Designer != null) data.charter = i.Designer; // Alternative
    if (i.Charter != null) data.charter = i.Charter;
    if (i.Music != null) data.music = i.Music;
    if (i.Image != null) data.image = i.Image;
    if (i.AspectRatio != null) {
      const v = parseFloat(i.AspectRatio);
      if (isFinite(v)) data.aspectRatio = v;
    }
    if (i.ScaleRatio != null) { // Legacy
      const v = 8080 / parseFloat(i.ScaleRatio);
      if (isFinite(v)) data.noteScale = v;
    }
    if (i.NoteScale != null) {
      const v = parseFloat(i.NoteScale);
      if (isFinite(v)) data.noteScale = v;
    }
    if (i.GlobalAlpha != null) { // Legacy
      const v = parseFloat(i.GlobalAlpha);
      if (isFinite(v)) data.backgroundDim = v;
    }
    if (i.BackgroundDim != null) {
      const v = parseFloat(i.BackgroundDim);
      if (isFinite(v)) data.backgroundDim = v;
    }
    if (i.Offset != null) {
      const v = parseFloat(i.Offset);
      if (isFinite(v)) data.offset = v;
    }
    result.push(data);
    if (path) {
      data.chart = `${path}/${data.chart}`;
      if (data.music != null) data.music = `${path}/${data.music}`;
      if (data.image != null) data.image = `${path}/${data.image}`;
    }
  }
  return result;
}
export function structLineData(record: Record<string, string | null>[], path: string): ChartLineData[] {
  const result = [];
  for (const i of record) {
    if (i.Chart == null) continue;
    const data: ChartLineData = { chart: i.Chart };
    if (i.LineId != null) data.lineId = Number(i.LineId);
    if (i.Image != null) data.image = i.Image;
    if (i.Vert != null) { // Legacy
      const v = parseFloat(i.Vert);
      if (isFinite(v)) data.scaleOld = v;
    }
    if (i.Horz != null) { // Legacy
      const v = parseFloat(i.Horz);
      if (isFinite(v)) data.aspect = v;
    }
    if (i.IsDark != null) { // Legacy
      const v = parseFloat(i.IsDark);
      if (isFinite(v)) data.useBackgroundDim = Boolean(v);
    }
    if (i.Scale != null) {
      const v = parseFloat(i.Scale);
      if (isFinite(v)) data.scale = v;
    }
    if (i.Aspect != null) {
      const v = parseFloat(i.Aspect);
      if (isFinite(v)) data.aspect = v;
    }
    if (i.UseBackgroundDim != null) {
      const v = parseFloat(i.UseBackgroundDim);
      if (isFinite(v)) data.useBackgroundDim = Boolean(v);
    }
    if (i.UseLineColor != null) {
      const v = parseFloat(i.UseLineColor);
      if (isFinite(v)) data.useLineColor = Boolean(v);
    }
    if (i.UseLineScale != null) {
      const v = parseFloat(i.UseLineScale);
      if (isFinite(v)) data.useLineScale = Boolean(v);
    }
    result.push(data);
    if (path) {
      data.chart = `${path}/${data.chart}`;
      if (data.image != null) data.image = `${path}/${data.image}`;
    }
  }
  return result;
}
