import { assert } from "jsr:@std/assert@0.224.0";
import { expandGlob } from "jsr:@std/fs@0.224.0";

import { JEKYLL_FOLDERS, stripRepoRoot } from "../src/folders.ts";

Deno.test("post filenames start with YYYY-MM-DD-", async () => {
  const REGEX = /\/\d{4}-\d{2}-\d{2}-.+/;
  const postsFileList: string[] = [];
  for await (const entry of expandGlob(`${JEKYLL_FOLDERS.posts}/*.md`)) {
    if (entry.isFile) postsFileList.push(entry.path);
  }

  for (const filename of postsFileList) {
    assert(REGEX.test(filename), `${filename} must start with YYYY-MM-DD-`);
  }
});

Deno.test("post filenames contain at least three slugs", async () => {
  const PREFIX_REGEX = /^.+\/\d{4}-\d{2}-\d{2}-/;
  const postsFileList: string[] = [];
  for await (const entry of expandGlob(`${JEKYLL_FOLDERS.posts}/*.md`)) {
    if (entry.isFile) postsFileList.push(entry.path);
  }

  for (const filename of postsFileList) {
    const name = filename.replace(PREFIX_REGEX, "").replace(/\.md$/, "");
    const slugList = name.split("-");
    assert(slugList.length >= 3, `${stripRepoRoot(filename)} must have at least 3 slugs`);
  }
});

Deno.test("post filenames end with .md", async () => {
  const postsFileList: string[] = [];
  for await (const entry of expandGlob(`${JEKYLL_FOLDERS.posts}/*`)) {
    if (entry.isFile) postsFileList.push(entry.path);
  }

  for (const filename of postsFileList) {
    assert(filename.endsWith(".md"), `${stripRepoRoot(filename)} must end with .md`);
  }
});
