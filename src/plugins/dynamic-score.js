export default hook.define({
  name: 'Dynamic Score',
  description: 'Apply dynamic score',
  contents: [
    {
      type: 'config',
      meta: ['启用动态分数', callback]
    }
  ]
});
const { status, stat, app } = hook;
/**
 * @param {HTMLInputElement} checkbox
 * @param {HTMLDivElement} container
 */
function callback(checkbox, _container) {
  checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
      hook.now.set('dynamic-score', hack);
    } else {
      hook.now.delete('dynamic-score');
    }
  });
  status.reg('enable-dynamic-score', checkbox);
}
let lastScore = 0;
let nowScore = 0;
let dynamicTime = 0;
function hack() {
  const { numOfNotes } = app.chart;
  stat.numOfNotes = numOfNotes;
  if (stat.scoreNum !== nowScore) {
    lastScore = nowScore;
    nowScore = stat.scoreNum;
    dynamicTime = performance.now();
  }
  const progress = Math.min(1, (performance.now() - dynamicTime) / 500);
  stat.numOfNotes /= lastScore / nowScore * (1 - progress) + progress;
}
