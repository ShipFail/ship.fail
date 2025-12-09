import { assert } from "jsr:@std/assert@0.224.0";
import { expandGlob } from "jsr:@std/fs@0.224.0";

import { getFrontmatterTeaserList } from "../src/get-frontmatter-teaser-list.ts";
import { getYearMonth } from "../src/get-year-month.ts";
import { JEKYLL_FOLDERS, stripRepoRoot } from "../src/folders.ts";

Deno.test("front matter image must be present", async () => {
  const postsFileList: string[] = [];
  for await (const entry of expandGlob(`${JEKYLL_FOLDERS.posts}/*.md`)) {
    if (entry.isFile) postsFileList.push(entry.path);
  }

  for (const file of postsFileList) {
    const { year } = getYearMonth(file);
    if (parseInt(year, 10) < 2021) continue;

    const teaserList = getFrontmatterTeaserList(file);
    assert(teaserList.length === 1, `${stripRepoRoot(file)} should set frontmatter.image`);
  }
});
