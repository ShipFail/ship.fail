import { assert } from "jsr:@std/assert@0.224.0";
import { existsSync } from "jsr:@std/fs@0.224.0";

import { JEKYLL_FOLDERS, repoRoot } from "../src/folders.ts";

Deno.test("jekyll content should live under docs/", () => {
  assert(existsSync(JEKYLL_FOLDERS.posts), "docs/_posts should exist");
  assert(existsSync(JEKYLL_FOLDERS.authors), "docs/_authors should exist");
  assert(existsSync(JEKYLL_FOLDERS.assets), "docs/assets should exist");
});

Deno.test("deprecated folders should not exist", () => {
  const deprecated = ["jekyll", "_posts", "_contributors"];
  for (const folder of deprecated) {
    const full = `${repoRoot}/${folder}`;
    assert(!existsSync(full), `${folder}/ should not exist`);
  }
});
