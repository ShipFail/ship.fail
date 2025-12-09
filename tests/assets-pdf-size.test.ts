import { assert } from "jsr:@std/assert@0.224.0";

import { listAssetFiles } from "../src/get-all-image-list.ts";
import { stripRepoRoot } from "../src/folders.ts";

const BIG_SIZE_TO_BE_FIXED_FILE_LIST: string[] = [];
const inList = (whitelist: string[]) => (fileName: string) =>
  whitelist.some((partial) => fileName.includes(partial));

Deno.test("PDF size should be fit for the web (no more than 3MB)", async () => {
  const MAX_SIZE = 3 * 1024 * 1024;

  const fileList = await listAssetFiles(["pdf"]);
  if (fileList.length === 0) return;

  const isNotWhitelist = (file: string) => !inList(BIG_SIZE_TO_BE_FIXED_FILE_LIST)(file);
  const checkFileList = fileList.filter(isNotWhitelist);

  for (const file of checkFileList) {
    const size = Deno.statSync(file).size;
    assert(
      size <= MAX_SIZE,
      `"${stripRepoRoot(file)}" (size: ${size}) exceed the maximum limitation: size<=${MAX_SIZE}`,
    );
  }
});
