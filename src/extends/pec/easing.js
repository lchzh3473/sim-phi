/* eslint-disable no-param-reassign */
const tl = [
  null, // 0
  null, // 1
  t => Math.sin(t * Math.PI / 2), // 2
  t => 1 - Math.cos(t * Math.PI / 2), // 3
  t => 1 - (t - 1) ** 2, // 4
  t => t ** 2, // 5
  t => (1 - Math.cos(t * Math.PI)) / 2, // 6
  t => ((t *= 2) < 1 ? t ** 2 : -((t - 2) ** 2 - 2)) / 2, // 7
  t => 1 + (t - 1) ** 3, // 8
  t => t ** 3, // 9
  t => 1 - (t - 1) ** 4, // 10
  t => t ** 4, // 11
  t => ((t *= 2) < 1 ? t ** 3 : (t - 2) ** 3 + 2) / 2, // 12
  t => ((t *= 2) < 1 ? t ** 4 : -((t - 2) ** 4 - 2)) / 2, // 13
  t => 1 + (t - 1) ** 5, // 14
  t => t ** 5, // 15
  t => 1 - 2 ** (-10 * t), // 16
  t => 2 ** (10 * (t - 1)), // 17
  t => Math.sqrt(1 - (t - 1) ** 2), // 18
  t => 1 - Math.sqrt(1 - t ** 2), // 19
  t => (2.70158 * t - 1) * (t - 1) ** 2 + 1, // 20
  t => (2.70158 * t - 1.70158) * t ** 2, // 21
  t => ((t *= 2) < 1 ? 1 - Math.sqrt(1 - t ** 2) : Math.sqrt(1 - (t - 2) ** 2) + 1) / 2, // 22
  t => t < 0.5 ? (14.379638 * t - 5.189819) * t ** 2 : (14.379638 * t - 9.189819) * (t - 1) ** 2 + 1, // 23
  t => 1 - 2 ** (-10 * t) * Math.cos(t * Math.PI / 0.15), // 24
  t => 2 ** (10 * (t - 1)) * Math.cos((t - 1) * Math.PI / 0.15), // 25
  t => ((t *= 11) < 4 ? t ** 2 : t < 8 ? (t - 6) ** 2 + 12 : t < 10 ? (t - 9) ** 2 + 15 : (t - 10.5) ** 2 + 15.75) / 16, // 26
  t => 1 - tl[26](1 - t), // 27
  t => (t *= 2) < 1 ? tl[26](t) / 2 : tl[27](t - 1) / 2 + 0.5, // 28
  t => t < 0.5 ? 2 ** (20 * t - 11) * Math.sin((160 * t + 1) * Math.PI / 18) : 1 - 2 ** (9 - 20 * t) * Math.sin((160 * t + 1) * Math.PI / 18) // 29
];
function isLinear(index) {
  index = Math.trunc(index);
  return index < 2 || index > 29;
}
/**
 * @param {number} index
 * @returns {((t: number) => number) | null}
 */
function easing(index) {
  index = Math.trunc(index);
  return tl[index];
}
export { isLinear, easing };
