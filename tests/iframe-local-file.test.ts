import { assert } from "jsr:@std/assert@0.224.0";
import { expandGlob } from "jsr:@std/fs@0.224.0";

import { getIframeIncludeSrcList } from "../src/get-markdown-image-list.ts";
import { JEKYLL_FOLDERS } from "../src/folders.ts";

const fileExists = (path: string) => {
  try {
    const stat = Deno.statSync(path);
    return stat.isFile;
  } catch {
    return false;
  }
};

Deno.test("iframe include sources should exist under assets/", async () => {
  const postsFileList: string[] = [];
  for await (const entry of expandGlob(`${JEKYLL_FOLDERS.posts}/*.md`)) {
    if (entry.isFile) postsFileList.push(entry.path);
  }

  for (const filename of postsFileList) {
    const fileList = getIframeIncludeSrcList(filename);
    if (!fileList.length) continue;

    const localFiles = fileList.filter((src) => src.startsWith("/"));
    if (!localFiles.length) continue;

    const allExist = localFiles.every((f) => fileExists(`${JEKYLL_FOLDERS.root}${f}`));
    assert(allExist, `${localFiles.map((s) => `"${s}"`).join(", ")} should exist`);
  }
});
