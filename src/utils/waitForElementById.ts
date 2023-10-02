/** 观察指定元素是否出现在 DOM 树中，并在出现后调用回调函数 */
export function waitForElementById(id: string, callback: (arg0: HTMLElement) => void): void {
  const observer = new MutationObserver(() => {
    const element = document.getElementById(id);
    if (element) {
      console.log(element);
      callback(element);
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
