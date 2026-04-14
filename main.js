var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => ReviewRandomPlugin,
  filterEligibleFiles: () => filterEligibleFiles,
  normalizeTag: () => normalizeTag,
  parseExcludedFolders: () => parseExcludedFolders
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var DEFAULT_SETTINGS = {
  tag: "review-needed",
  excludedFolders: ["Clippings"]
};
function normalizeTag(input) {
  return input.trim().replace(/^#/, "");
}
function parseExcludedFolders(input) {
  return input.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
}
function filterEligibleFiles(files, tag, excludedFolders, metadataCache) {
  return files.filter((file) => {
    var _a, _b, _c;
    const topFolder = file.path.split("/")[0];
    if (file.path.includes("/") && excludedFolders.includes(topFolder)) {
      return false;
    }
    const cache = metadataCache.getFileCache(file);
    if (!cache) return false;
    const inlineTags = (_b = (_a = cache.tags) == null ? void 0 : _a.map((t) => t.tag.replace(/^#/, ""))) != null ? _b : [];
    if (inlineTags.includes(tag)) return true;
    const fmTags = (_c = cache.frontmatter) == null ? void 0 : _c.tags;
    if (!fmTags) return false;
    const fmTagArray = Array.isArray(fmTags) ? fmTags : [fmTags];
    return fmTagArray.map((t) => t.trim()).includes(tag);
  });
}
var ReviewRandomPlugin = class extends import_obsidian.Plugin {
  async onload() {
    await this.loadSettings();
    this.addCommand({
      id: "open-random-article",
      name: "Open random article",
      callback: () => this.reviewRandom()
    });
    this.addSettingTab(new ReviewRandomSettingTab(this.app, this));
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  reviewRandom() {
    const { tag, excludedFolders } = this.settings;
    const files = this.app.vault.getMarkdownFiles();
    const eligible = filterEligibleFiles(
      files,
      tag,
      excludedFolders,
      this.app.metadataCache
    );
    if (eligible.length === 0) {
      new import_obsidian.Notice(`No articles found with tag #${tag}`);
      return;
    }
    const file = eligible[Math.floor(Math.random() * eligible.length)];
    this.app.workspace.getLeaf().openFile(file);
  }
};
var ReviewRandomSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian.Setting(containerEl).setName("Review tag").setDesc("Files with this tag are eligible for random review").addText(
      (text) => text.setPlaceholder("review-needed").setValue(this.plugin.settings.tag).onChange(async (value) => {
        this.plugin.settings.tag = normalizeTag(value) || DEFAULT_SETTINGS.tag;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Excluded folders").setDesc(
      "Comma-separated list of top-level folders to exclude (e.g. Clippings, Archive)"
    ).addText(
      (text) => text.setPlaceholder("Clippings").setValue(this.plugin.settings.excludedFolders.join(", ")).onChange(async (value) => {
        this.plugin.settings.excludedFolders = parseExcludedFolders(value);
        await this.plugin.saveSettings();
      })
    );
  }
};
