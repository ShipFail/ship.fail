import { assertEquals } from "jsr:@std/assert@0.224.0";

import { getFrontmatterTagList } from "./get-frontmatter-tag-list.ts";

Deno.test("getFrontmatterTagList normalizes tag values", async () => {
  const temp = await Deno.makeTempFile({ suffix: ".md" });
  const content = `---
tags:
  - foo
  - bar
---
`; // array of tags
  await Deno.writeTextFile(temp, content);
  assertEquals(getFrontmatterTagList(temp), ["foo", "bar"]);

  const tempString = await Deno.makeTempFile({ suffix: ".md" });
  const contentString = `---
tags: baz
---
`;
  await Deno.writeTextFile(tempString, contentString);
  assertEquals(getFrontmatterTagList(tempString), ["baz"]);
});
