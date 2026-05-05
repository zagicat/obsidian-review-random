export function getAllTags(cache: any): string[] | null {
  if (!cache) return null;
  const result: string[] = [];
  if (cache.tags) {
    for (const t of cache.tags) result.push(t.tag);
  }
  const fmTags = cache.frontmatter?.tags;
  if (fmTags) {
    const arr = Array.isArray(fmTags) ? fmTags : [fmTags];
    for (const t of arr) {
      if (typeof t === "string") result.push(t.startsWith("#") ? t : "#" + t);
    }
  }
  return result;
}

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
