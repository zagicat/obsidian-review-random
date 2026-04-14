export class Plugin {}
export class PluginSettingTab {
  containerEl = { empty: () => {} };
  constructor(public app: unknown, public plugin: unknown) {}
}
export class Setting {
  constructor(public containerEl: unknown) {}
  setName() { return this; }
  setDesc() { return this; }
  addText(cb: (t: unknown) => void) {
    cb({ setPlaceholder: () => ({ setValue: () => ({ onChange: () => {} }) }) });
    return this;
  }
}
export class Notice {
  constructor(public message: string) {}
}
