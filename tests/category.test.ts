import { assert } from "jsr:@std/assert@0.224.0";
import { expandGlob } from "jsr:@std/fs@0.224.0";

import { getFrontmatterCategoryList } from "../src/get-frontmatter-category-list.ts";
import { JEKYLL_FOLDERS, stripRepoRoot } from "../src/folders.ts";

Deno.test("front matter categories must be preset", async () => {
  const PRESET_CATEGORIES_LIST = [
    "announcement",
    "article",
    "event",
    "feature",
    "fun",
    "gsod",
    "guide",
    "ospp",
    "hacking",
    "interview",
    "ideas",
    "migration",
    "milestone",
    "npm",
    "project",
    "proposal",
    "shop",
    "story",
    "talk",
    "tutorial",
    "tools",
    "paper",
    "engineering",
  ];
  const isPreset = (category: string) => PRESET_CATEGORIES_LIST.includes(category);

  const postsFileList: string[] = [];
  for await (const entry of expandGlob(`${JEKYLL_FOLDERS.posts}/*.md`)) {
    if (entry.isFile) postsFileList.push(entry.path);
  }

  for (const file of postsFileList) {
    const categoryList = getFrontmatterCategoryList(file);
    assert(categoryList.length > 0, `${stripRepoRoot(file)} should have at least one category`);
    const allPreset = categoryList.every(isPreset);
    assert(
      allPreset,
      `${stripRepoRoot(file)} categories (${categoryList.join(",")}) must be in preset (${PRESET_CATEGORIES_LIST.join(",")})`,
    );
  }
});
