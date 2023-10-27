export class Checkbox {
  public container: HTMLDivElement;
  public checkbox: HTMLInputElement;
  public label: HTMLLabelElement;
  public constructor(text: string, checked = false) {
    this.container = document.createElement('div');
    this.checkbox = document.createElement('input');
    this.checkbox.type = 'checkbox';
    this.checkbox.id = Utils.randomUUID();
    this.checkbox.checked = checked;
    this.label = document.createElement('label');
    this.label.htmlFor = this.checkbox.id;
    this.label.textContent = text;
    this.container.appendChild(this.checkbox);
    this.container.appendChild(this.label);
  }
  public get checked(): boolean {
    return this.checkbox.checked;
  }
  public set checked(value: boolean) {
    this.checkbox.checked = value;
    this.checkbox.dispatchEvent(new Event('change'));
  }
  public appendTo(container: HTMLElement): this {
    container.appendChild(this.container);
    return this;
  }
  public appendBefore(node: HTMLElement): this {
    if (node.parentNode == null) throw new Error('Node must have a parent node');
    node.parentNode.insertBefore(this.container, node);
    return this;
  }
  public toggle(): void {
    this.checked = !this.checkbox.checked;
  }
  public hook(callback: (arg0: HTMLInputElement, arg1: HTMLDivElement) => void): this {
    callback(this.checkbox, this.container);
    return this;
  }
}
