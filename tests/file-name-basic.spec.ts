import { assert } from "jsr:@std/assert@0.224.0";
import { expandGlob } from "jsr:@std/fs@0.224.0";

import { JEKYLL_FOLDERS, stripRepoRoot } from "../src/folders.ts";

Deno.test("filenames must be lowercase with safe characters", async () => {
  const REGEX = /^[a-z0-9/_.-]+$/;

  const assetsFileList: string[] = [];
  for await (const entry of expandGlob(`${JEKYLL_FOLDERS.assets}/**/*`)) {
    if (entry.isFile) assetsFileList.push(entry.path);
  }

  const postsFileList: string[] = [];
  for await (const entry of expandGlob(`${JEKYLL_FOLDERS.posts}/**/*`)) {
    if (entry.isFile) postsFileList.push(entry.path);
  }

  const authorsFileList: string[] = [];
  for await (const entry of expandGlob(`${JEKYLL_FOLDERS.authors}/**/*`)) {
    if (entry.isFile) authorsFileList.push(entry.path);
  }

  const filenameList = [...assetsFileList, ...authorsFileList, ...postsFileList].map(stripRepoRoot);

  for (const filename of filenameList) {
    assert(REGEX.test(filename), `${filename} should contain only lowercase letters, numbers, and -_./`);
  }
});
