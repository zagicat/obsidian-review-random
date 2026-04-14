import { normalizeTag, parseExcludedFolders, filterEligibleFiles } from "./main";
import { MetadataCache, TFile } from "obsidian";

// --- Helpers ---

function mockFile(path: string): TFile {
  return { path } as TFile;
}

function mockCache(opts: {
  inlineTags?: string[];  // stored WITH # prefix in Obsidian, e.g. "#review-needed"
  frontmatterTags?: string | string[];  // stored WITHOUT # prefix
} = {}): MetadataCache {
  return {
    getFileCache: (_file: TFile) => ({
      tags: (opts.inlineTags ?? []).map(tag => ({ tag, position: {} })),
      frontmatter: opts.frontmatterTags !== undefined
        ? { tags: opts.frontmatterTags }
        : undefined,
    }),
  } as unknown as MetadataCache;
}

function emptyCache(): MetadataCache {
  return {
    getFileCache: () => null,
  } as unknown as MetadataCache;
}

// --- normalizeTag ---

describe("normalizeTag", () => {
  test("strips leading hash", () => {
    expect(normalizeTag("#review-needed")).toBe("review-needed");
  });

  test("passes through tag without hash", () => {
    expect(normalizeTag("review-needed")).toBe("review-needed");
  });

  test("trims whitespace", () => {
    expect(normalizeTag("  review-needed  ")).toBe("review-needed");
  });

  test("trims whitespace and strips hash", () => {
    expect(normalizeTag("  #review-needed  ")).toBe("review-needed");
  });
});

// --- parseExcludedFolders ---

describe("parseExcludedFolders", () => {
  test("splits comma-separated folders", () => {
    expect(parseExcludedFolders("Clippings, Archive")).toEqual(["Clippings", "Archive"]);
  });

  test("trims whitespace from each entry", () => {
    expect(parseExcludedFolders("  Clippings  ,  Archive  ")).toEqual(["Clippings", "Archive"]);
  });

  test("filters empty entries from trailing commas", () => {
    expect(parseExcludedFolders("Clippings,")).toEqual(["Clippings"]);
  });

  test("returns empty array for empty string", () => {
    expect(parseExcludedFolders("")).toEqual([]);
  });

  test("handles single entry with no comma", () => {
    expect(parseExcludedFolders("Clippings")).toEqual(["Clippings"]);
  });
});

// --- filterEligibleFiles ---

describe("filterEligibleFiles", () => {
  test("returns file with matching inline tag", () => {
    const file = mockFile("Articles/foo.md");
    const cache = mockCache({ inlineTags: ["#review-needed"] });
    const result = filterEligibleFiles([file], "review-needed", [], cache);
    expect(result).toEqual([file]);
  });

  test("returns file with matching frontmatter tag (array)", () => {
    const file = mockFile("Articles/foo.md");
    const cache = mockCache({ frontmatterTags: ["review-needed", "other"] });
    const result = filterEligibleFiles([file], "review-needed", [], cache);
    expect(result).toEqual([file]);
  });

  test("returns file with matching frontmatter tag (string)", () => {
    const file = mockFile("Articles/foo.md");
    const cache = mockCache({ frontmatterTags: "review-needed" });
    const result = filterEligibleFiles([file], "review-needed", [], cache);
    expect(result).toEqual([file]);
  });

  test("excludes file in excluded top-level folder", () => {
    const file = mockFile("Clippings/foo.md");
    const cache = mockCache({ inlineTags: ["#review-needed"] });
    const result = filterEligibleFiles([file], "review-needed", ["Clippings"], cache);
    expect(result).toEqual([]);
  });

  test("excludes file with no cache entry", () => {
    const file = mockFile("Articles/foo.md");
    const result = filterEligibleFiles([file], "review-needed", [], emptyCache());
    expect(result).toEqual([]);
  });

  test("excludes file with non-matching tag", () => {
    const file = mockFile("Articles/foo.md");
    const cache = mockCache({ inlineTags: ["#other-tag"] });
    const result = filterEligibleFiles([file], "review-needed", [], cache);
    expect(result).toEqual([]);
  });

  test("returns only eligible files from a mixed list", () => {
    const eligible = mockFile("Articles/good.md");
    const excluded = mockFile("Clippings/clipped.md");
    const untagged = mockFile("Articles/untagged.md");
    const cache = mockCache({ inlineTags: ["#review-needed"] });
    const noTagCache = mockCache({});

    const mixedCache = {
      getFileCache: (file: TFile) => {
        if (file.path === "Articles/untagged.md") return noTagCache.getFileCache(file);
        return cache.getFileCache(file);
      },
    } as unknown as MetadataCache;

    const result = filterEligibleFiles(
      [eligible, excluded, untagged],
      "review-needed",
      ["Clippings"],
      mixedCache
    );
    expect(result).toEqual([eligible]);
  });

  test("handles file in root (no folder separator)", () => {
    const file = mockFile("foo.md");
    const cache = mockCache({ inlineTags: ["#review-needed"] });
    const result = filterEligibleFiles([file], "review-needed", ["Clippings"], cache);
    expect(result).toEqual([file]);
  });
});
