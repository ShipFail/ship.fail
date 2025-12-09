import { assert } from "jsr:@std/assert@0.224.0";
import { expandGlob } from "jsr:@std/fs@0.224.0";
import { join } from "jsr:@std/path@0.224.0";

import { getFrontmatterTeaserList } from "../src/get-frontmatter-teaser-list.ts";
import { getMarkdownImageList } from "../src/get-markdown-image-list.ts";
import { getYearMonth } from "../src/get-year-month.ts";
import { isNotWhiteListedRemoteUrl } from "../src/is-white-listed-remote-image.ts";
import { JEKYLL_FOLDERS, stripRepoRoot } from "../src/folders.ts";

const getSlugs = (filename: string): string => {
  const match = filename.match(/\/(\d{4}-\d{2}-\d{2}-.+?)\.md$/);
  if (!match) throw new Error(`${filename} parse slugs fail`);
  return match[1]!.replace(/^\d{4}-\d{2}-\d{2}-/, "");
};

Deno.test("assets stored under assets/YYYY/MM-slugs", async () => {
  const postsFileList: string[] = [];
  for await (const entry of expandGlob(`${JEKYLL_FOLDERS.posts}/*.md`)) {
    if (entry.isFile) postsFileList.push(entry.path);
  }

  for (const filename of postsFileList) {
    const { year, month } = getYearMonth(filename);
    const teaserList = getFrontmatterTeaserList(filename);
    const imageList = getMarkdownImageList(filename);
    const allList = [...teaserList, ...imageList].filter(isNotWhiteListedRemoteUrl);

    const slugs = getSlugs(filename);
    const expectedFolder = join("assets", year, `${month}-${slugs}`);

    for (const imageFile of allList) {
      const good = imageFile.includes(expectedFolder);
      assert(
        good,
        `"${imageFile}" from "${stripRepoRoot(filename)}" should be saved to "${expectedFolder}/"`,
      );
    }
  }
});
