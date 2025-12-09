import { assertEquals } from "jsr:@std/assert@0.224.0";

import { contributorFilenameToUsername } from "./contributor-filename-to-username.ts";

Deno.test("contributorFilenameToUsername extracts basename", () => {
  const filename = "docs/_authors/nibble0101.md";
  const username = contributorFilenameToUsername(filename);
  assertEquals(username, "nibble0101");
});
