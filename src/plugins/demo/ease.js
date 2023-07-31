/* eslint-disable no-param-reassign */
export const tween = [
  t => t, // 0 - Linear
  t => 1 - Math.cos(t * Math.PI / 2), // 1 - EaseInSine
  t => Math.sin(t * Math.PI / 2), // 2 - EaseOutSine
  t => (1 - Math.cos(t * Math.PI)) / 2, // 3 - EaseInOutSine
  t => t ** 2, // 4 - EaseInQuad
  t => 1 - (t - 1) ** 2, // 5 - EaseOutQuad
  t => ((t *= 2) < 1 ? t ** 2 : -((t - 2) ** 2 - 2)) / 2, // 6 - EaseInOutQuad
  t => t ** 3, // 7 - EaseInCubic
  t => 1 + (t - 1) ** 3, // 8 - EaseOutCubic
  t => ((t *= 2) < 1 ? t ** 3 : (t - 2) ** 3 + 2) / 2, // 9 - EaseInOutCubic
  t => t ** 4, // 10 - EaseInQuart
  t => 1 - (t - 1) ** 4, // 11 - EaseOutQuart
  t => ((t *= 2) < 1 ? t ** 4 : -((t - 2) ** 4 - 2)) / 2, // 12 - EaseInOutQuart
  () => 0, // 13 - Zero
  () => 1, // 14 - One
  (time, keyframes) => { // 15 - AnimationCurve
    let i = 0;
    while (i < keyframes.length && time > keyframes[i].time) i++;
    if (i === 0) return keyframes[0].value;
    if (i === keyframes.length) return keyframes[keyframes.length - 1].value;
    const p0x = keyframes[i - 1].time;
    const p0y = keyframes[i - 1].value;
    const p3x = keyframes[i].time;
    const p3y = keyframes[i].value;
    const p1y = p0y + keyframes[i - 1].outWeight * (p3y - p0y) * keyframes[i - 1].outSlope;
    const p2y = p3y - keyframes[i].inWeight * (p3y - p0y) * keyframes[i].inSlope;
    const t = (time - p0x) / (p3x - p0x);
    const t2 = t * t;
    const t3 = t2 * t;
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    const y = mt3 * p0y + 3 * mt2 * t * p1y + 3 * mt * t2 * p2y + t3 * p3y;
    return y;
  } // 15, should be Animation Curve
];
export function getValue(keys, time, defaultValue = 0) {
  if (!keys || !keys.length) return defaultValue;
  let i = 0;
  while (i < keys.length && time > keys[i].time) i++;
  if (i === 0) return keys[0].value;
  if (i === keys.length) return keys[keys.length - 1].value;
  const { time: t0, value: v0 } = keys[i - 1];
  const { time: t1, value: v1 } = keys[i];
  const t = (time - t0) / (t1 - t0);
  const f = tween[keys[i - 1].easeType];
  return v0 + (v1 - v0) * f(t, keys[i - 1].animationCurve);
}
