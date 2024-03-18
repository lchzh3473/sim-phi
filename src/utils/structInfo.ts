export function structInfoData(entries: Record<string, string | null>[], path: string): ChartInfoData[] {
  const result = [];
  for (const entry of entries) {
    if (entry.Chart == null) continue;
    const data: ChartInfoData = { chart: entry.Chart };
    if (entry.Name != null) data.name = entry.Name;
    if (entry.Musician != null) data.artist = entry.Musician; // Alternative
    if (entry.Composer != null) data.artist = entry.Composer; // Alternative
    if (entry.Artist != null) data.artist = entry.Artist;
    if (entry.Level != null) data.level = entry.Level;
    if (entry.Illustrator != null) data.illustrator = entry.Illustrator;
    if (entry.Designer != null) data.charter = entry.Designer; // Alternative
    if (entry.Charter != null) data.charter = entry.Charter;
    if (entry.Music != null) data.music = entry.Music;
    if (entry.Image != null) data.image = entry.Image;
    if (entry.AspectRatio != null) {
      const v = parseFloat(entry.AspectRatio);
      if (isFinite(v)) data.aspectRatio = v;
    }
    if (entry.ScaleRatio != null) { // Legacy
      const v = 8080 / parseFloat(entry.ScaleRatio);
      if (isFinite(v)) data.noteScale = v;
    }
    if (entry.NoteScale != null) {
      const v = parseFloat(entry.NoteScale);
      if (isFinite(v)) data.noteScale = v;
    }
    if (entry.GlobalAlpha != null) { // Legacy
      const v = parseFloat(entry.GlobalAlpha);
      if (isFinite(v)) data.backgroundDim = v;
    }
    if (entry.BackgroundDim != null) {
      const v = parseFloat(entry.BackgroundDim);
      if (isFinite(v)) data.backgroundDim = v;
    }
    if (entry.Offset != null) {
      const v = parseFloat(entry.Offset);
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
export function structLineData(entries: Record<string, string | null>[], path: string): ChartLineData[] {
  const result = [];
  for (const entry of entries) {
    if (entry.Chart == null) continue;
    const data: ChartLineData = { chart: entry.Chart };
    if (entry.LineId != null) data.lineId = Number(entry.LineId);
    if (entry.Image != null) data.image = entry.Image;
    if (entry.Vert != null) { // Legacy
      const v = parseFloat(entry.Vert);
      if (isFinite(v)) data.scaleOld = v;
    }
    if (entry.Horz != null) { // Legacy
      const v = parseFloat(entry.Horz);
      if (isFinite(v)) data.aspect = v;
    }
    if (entry.IsDark != null) { // Legacy
      const v = parseFloat(entry.IsDark);
      if (isFinite(v)) data.useBackgroundDim = Boolean(v);
    }
    if (entry.Scale != null) {
      const v = parseFloat(entry.Scale);
      if (isFinite(v)) data.scale = v;
    }
    if (entry.Aspect != null) {
      const v = parseFloat(entry.Aspect);
      if (isFinite(v)) data.aspect = v;
    }
    if (entry.UseBackgroundDim != null) {
      const v = parseFloat(entry.UseBackgroundDim);
      if (isFinite(v)) data.useBackgroundDim = Boolean(v);
    }
    if (entry.UseLineColor != null) {
      const v = parseFloat(entry.UseLineColor);
      if (isFinite(v)) data.useLineColor = Boolean(v);
    }
    if (entry.UseLineScale != null) {
      const v = parseFloat(entry.UseLineScale);
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
