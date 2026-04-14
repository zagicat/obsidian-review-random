import {
  App,
  MetadataCache,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  TFile,
} from "obsidian";

// --- Types ---

interface ReviewRandomSettings {
  tag: string;
  excludedFolders: string[];
}

const DEFAULT_SETTINGS: ReviewRandomSettings = {
  tag: "review-needed",
  excludedFolders: ["Clippings"],
};

// --- Pure functions (exported for testing) ---

export function normalizeTag(input: string): string {
  return input.trim().replace(/^#/, "");
}

export function parseExcludedFolders(input: string): string[] {
  return input
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function filterEligibleFiles(
  files: TFile[],
  tag: string,
  excludedFolders: string[],
  metadataCache: MetadataCache
): TFile[] {
  return files.filter((file) => {
    // Exclude files in excluded top-level folders
    const topFolder = file.path.split("/")[0];
    if (file.path.includes("/") && excludedFolders.includes(topFolder)) {
      return false;
    }

    const cache = metadataCache.getFileCache(file);
    if (!cache) return false;

    // Check inline tags (Obsidian stores these WITH # prefix)
    const inlineTags = cache.tags?.map((t) => t.tag.replace(/^#/, "")) ?? [];
    if (inlineTags.includes(tag)) return true;

    // Check frontmatter tags (stored WITHOUT # prefix; can be string or string[])
    const fmTags = cache.frontmatter?.tags;
    if (!fmTags) return false;
    const fmTagArray: string[] = Array.isArray(fmTags) ? fmTags : [fmTags];
    return fmTagArray.map((t) => t.trim()).includes(tag);
  });
}

// --- Plugin ---

export default class ReviewRandomPlugin extends Plugin {
  settings!: ReviewRandomSettings;

  async onload() {
    await this.loadSettings();

    this.addCommand({
      id: "open-random-article",
      name: "Open random article marked for review",
      callback: () => this.reviewRandom(),
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
      new Notice(`No articles found with tag #${tag}`);
      return;
    }

    const file = eligible[Math.floor(Math.random() * eligible.length)];
    this.app.workspace.getLeaf().openFile(file);
  }
}

// --- Settings Tab ---

class ReviewRandomSettingTab extends PluginSettingTab {
  plugin: ReviewRandomPlugin;

  constructor(app: App, plugin: ReviewRandomPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Review tag")
      .setDesc("Files with this tag are eligible for random review")
      .addText((text) =>
        text
          .setPlaceholder("review-needed")
          .setValue(this.plugin.settings.tag)
          .onChange(async (value) => {
            this.plugin.settings.tag =
              normalizeTag(value) || DEFAULT_SETTINGS.tag;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Excluded folders")
      .setDesc(
        "Comma-separated list of top-level folders to exclude (e.g. Clippings, Archive)"
      )
      .addText((text) =>
        text
          .setPlaceholder("Clippings")
          .setValue(this.plugin.settings.excludedFolders.join(", "))
          .onChange(async (value) => {
            this.plugin.settings.excludedFolders = parseExcludedFolders(value);
            await this.plugin.saveSettings();
          })
      );
  }
}
