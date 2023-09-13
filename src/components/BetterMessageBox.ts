export class BetterMessageBox {
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
