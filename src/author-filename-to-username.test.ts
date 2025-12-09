import { assertEquals } from "jsr:@std/assert@0.224.0";

import { authorFilenameToUsername } from "./author-filename-to-username.ts";

Deno.test("authorFilenameToUsername extracts basename", () => {
  const filename = "docs/_authors/nibble0101.md";
  const username = authorFilenameToUsername(filename);
  assertEquals(username, "nibble0101");
});
