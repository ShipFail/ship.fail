import { assert, assertEquals } from "jsr:@std/assert@0.224.0";

import { getChangedFileList } from "./get-changed-file-list.ts";

Deno.test("getChangedFileList returns unique entries", async () => {
  const files = await getChangedFileList();
  assert(files.length > 0, "should return at least one file");
  assertEquals(files.length, new Set(files).size, "should return unique paths");
});

Deno.test("getChangedFileList respects limit", async () => {
  const limit = 5;
  const files = await getChangedFileList({ limit });
  assert(files.length <= limit, "should apply limit when provided");
});
