import { assert } from "jsr:@std/assert@0.224.0";

import { getAllImageList } from "../src/get-all-image-list.ts";
import { isUrlExist } from "../src/is-url-exist.ts";
import { isWhiteListedRemoteUrl } from "../src/is-white-listed-remote-image.ts";
import { JEKYLL_FOLDERS } from "../src/folders.ts";

const unique = (list: string[]) => Array.from(new Set(list));

const not = (fn: (s: string) => boolean) => (s: string) => !fn(s);

Deno.test("remote images referenced recently should exist", async () => {
  const remoteImageList = unique(
    (await getAllImageList({ since: "1 week ago" }))
      .filter(isWhiteListedRemoteUrl),
  );

  for (const url of remoteImageList) {
    const ok = await isUrlExist(url);
    assert(ok, `${url} should respond successfully`);
  }
});

Deno.test("local images referenced should exist on disk", async () => {
  const localImageList = (await getAllImageList())
    .filter(not(isWhiteListedRemoteUrl))
    .filter((img) => !img.includes("{{"));

  for (const imagePath of localImageList) {
    assert(!/^http/i.test(imagePath), `${imagePath} should be local, not remote`);
    assert(/^\//.test(imagePath), `${imagePath} should be an absolute path starting with '/'`);

    const filename = `${JEKYLL_FOLDERS.root}${imagePath}`;
    try {
      const stat = Deno.statSync(filename);
      assert(stat.isFile, `${imagePath} should exist`);
    } catch {
      assert(false, `${imagePath} should exist`);
    }
  }
});
