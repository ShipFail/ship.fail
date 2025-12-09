import { assertEquals } from "jsr:@std/assert@0.224.0";

import { getFrontmatterAuthor } from "./get-frontmatter-author.ts";

Deno.test("getFrontmatterAuthor reads author field", async () => {
  const temp = await Deno.makeTempFile({ suffix: ".md" });
  const content = `---
author: huan
---
`;
  await Deno.writeTextFile(temp, content);
  assertEquals(getFrontmatterAuthor(temp), "huan");
});
