class BetterMessageBox {
  public host: string;
  public code: number;
  public name: string;
  public target: string;
  public list: BetterMessage[];
  public updateHTML: (...args: any[]) => void;
  public constructor(msg: BetterMessage) {
    this.host = msg.host;
    this.code = msg.code;
    this.name = msg.name;
    this.target = msg.target;
    this.list = [msg];
    this.updateHTML = () => {};
  }
  public appendMessage(msg: BetterMessage): boolean {
    if (this.host !== msg.host) return false;
    if (this.code !== msg.code) return false;
    if (this.name !== msg.name) return false;
    if (this.target !== msg.target) return false;
    this.list.push(msg);
    this.updateHTML();
    return true;
  }
}
export abstract class MessageHandler {
  private lastMessage = '';
  private readonly betterMessageBoxes: BetterMessageBox[];
  public abstract nodeText: HTMLElement;
  public abstract nodeView: HTMLElement;
  public constructor() {
    this.betterMessageBoxes = [];
  }
  private addBox(type = 'warn'): HTMLDivElement {
    const msgbox = document.createElement('div');
    msgbox.setAttribute('type', type);
    msgbox.classList.add('msgbox');
    return this.nodeView.appendChild(msgbox);
  }
  private removeNodeBox(nodeBox: HTMLDivElement): void {
    nodeBox.remove();
    this.updateText(this.lastMessage);
  }
  private removeBetterMessageBox(msgbox: BetterMessageBox): void {
    const index = this.betterMessageBoxes.indexOf(msgbox);
    if (index !== -1) this.betterMessageBoxes.splice(index, 1);
  }
  private msgbox(msg = '', type = '', fatal = false): void {
    const msgbox = this.addBox(type);
    msgbox.innerHTML = msg;
    const btn = document.createElement('a');
    btn.innerText = '忽略';
    btn.style.float = 'right';
    btn.onclick = () => this.removeNodeBox(msgbox);
    btn.classList.toggle('disabled', fatal);
    msgbox.appendChild(btn);
  }
  private bmsgbox(msg: BetterMessage): BetterMessageBox {
    const msgbox = new BetterMessageBox(msg);
    const page = { page: 1, size: 5, get pages() { return Math.ceil(msgbox.list.length / this.size) } };
    // 日志文本
    const text = document.createTextNode('');
    // 按钮[全部忽略]
    const btnIgnoreAll = document.createElement('a');
    btnIgnoreAll.innerText = '全部忽略';
    btnIgnoreAll.classList.add('bm-rbtn');
    // 当前页数(可编辑)
    const nodePageNum = document.createElement('span');
    nodePageNum.textContent = String(page.page);
    nodePageNum.contentEditable = 'true';
    nodePageNum.style.cssText = ';color:red;outline:none;text-decoration:underline';
    // 总页数
    const nodePages = document.createElement('span');
    nodePages.textContent = String(page.pages);
    // 按钮[上一页]
    const btnPrevousPage = document.createElement('a');
    btnPrevousPage.innerText = '上一页';
    // 按钮[下一页]
    const btnNextPage = document.createElement('a');
    btnNextPage.innerText = '下一页';
    // 控制栏
    const nodeControl = document.createElement('div');
    nodeControl.classList.add('bm-item');
    nodeControl.append(nodePageNum, ' / ', nodePages, ' 页 ', btnPrevousPage, ' ', btnNextPage);
    // 消息框
    const nodeBMsg = this.addBox(['notice', 'warn', 'error'][msgbox.code]);
    nodeBMsg.append(text, btnIgnoreAll, nodeControl);
    // 脚本
    btnIgnoreAll.setAttribute('bm-ctrl', '');
    nodeControl.setAttribute('bm-ctrl', '');
    const updatePage = (num: number) => {
      if (!isNaN(num)) page.page = Math.max(1, Math.min(num, page.pages));
      nodePageNum.textContent = String(page.page);
      msgbox.updateHTML();
    };
    nodePageNum.onblur = () => updatePage(parseInt(nodePageNum.textContent!));
    btnPrevousPage.onclick = () => updatePage(page.page - 1);
    btnNextPage.onclick = () => updatePage(page.page + 1);
    btnIgnoreAll.onclick = () => {
      this.removeBetterMessageBox(msgbox);
      this.removeNodeBox(nodeBMsg);
    };
    // 防抖
    let timer = 0;
    msgbox.updateHTML = () => {
      clearTimeout(timer);
      timer = self.setTimeout(() => {
        const { pages } = page;
        if (page.page > pages) page.page = pages;
        const start = (page.page - 1) * page.size;
        text.textContent = `${msgbox.code ? `${msgbox.host}: 检测到 ${msgbox.list.length} 个 ${msgbox.name}\n` : ''}来自 ${msgbox.target}`;
        nodePageNum.textContent = String(page.page);
        nodePages.textContent = String(pages);
        for (const elem of nodeBMsg.querySelectorAll('[bm-ctrl]')) elem.classList.toggle('hide', pages <= 1);
        for (const elem of nodeBMsg.querySelectorAll('[bm-cell]')) elem.remove();
        for (const bmsg of msgbox.list.slice(start, start + page.size)) {
          const btnIgnore = document.createElement('a');
          btnIgnore.innerText = '忽略';
          btnIgnore.classList.add('bm-rbtn');
          btnIgnore.onclick = () => {
            msgbox.list.splice(msgbox.list.indexOf(bmsg), 1);
            msgbox.updateHTML();
            if (msgbox.list.length === 0) {
              this.removeBetterMessageBox(msgbox);
              this.removeNodeBox(nodeBMsg);
            } else this.updateText(this.lastMessage);
          };
          const div = document.createElement('div');
          div.setAttribute('bm-cell', '');
          div.classList.add('bm-item');
          div.append(`${bmsg.name}: ${bmsg.message}`, btnIgnore);
          nodeBMsg.appendChild(div);
        }
      });
    };
    this.betterMessageBoxes.push(msgbox);
    return msgbox;
  }
  private getBetterMessageBox(msg: BetterMessage): BetterMessageBox {
    for (const i of this.betterMessageBoxes) {
      if (i.appendMessage(msg)) return i;
    }
    return this.bmsgbox(msg);
  }
  public updateText(msg = '', type = ''): void {
    const num = this.nodeView.querySelectorAll('.msgbox[type=warn]').length + this.betterMessageBoxes.reduce((a, b) => a + b.list.length - 1, 0);
    if (type === 'error') {
      this.nodeText.className = 'error';
      this.nodeText.innerText = msg;
    } else {
      this.nodeText.className = num ? 'warning' : 'accept';
      this.nodeText.innerText = msg + (num ? `（发现${num}个问题，点击查看）` : '');
      this.lastMessage = msg;
    }
  }
  public sendWarning(msg: BetterMessage | string = '', isHTML = false): void {
    if (typeof msg === 'string') this.msgbox(isHTML ? msg : Utils.escapeHTML(msg), 'warn');
    else this.getBetterMessageBox(msg).updateHTML();
    this.updateText(this.lastMessage);
  }
  public sendError(msg = '', html = '', fatal = false): void {
    if (html) {
      const exp = /([A-Za-z][A-Za-z+-.]{2,}:\/\/|www\.)[^\s\x00-\x20\x7f-\x9f"]{2,}[^\s\x00-\x20\x7f-\x9f"!'),.:;?\]}]/g;
      const ahtml = html.replace(exp, (match = '') => {
        const url = match.startsWith('www.') ? `//${match}` : match;
        const rpath = match.replace(`${location.origin}/`, '');
        if (match.includes(location.origin)) return `<a href="#"style="color:#023b8f;text-decoration:underline;">${rpath}</a>`;
        return `<a href="${url}"target="_blank"style="color:#023b8f;text-decoration:underline;">${rpath}</a>`;
      });
      this.msgbox(ahtml, 'error', fatal);
    }
    this.updateText(msg, 'error');
  }
}
