import { assertEquals } from "jsr:@std/assert@0.224.0";

import { getFrontmatterCategoryList } from "./get-frontmatter-category-list.ts";

Deno.test("getFrontmatterCategoryList returns array for string or array input", async () => {
  const temp = await Deno.makeTempFile({ suffix: ".md" });
  const content = `---
categories: announcement
---
`; // single category
  await Deno.writeTextFile(temp, content);

  assertEquals(getFrontmatterCategoryList(temp), ["announcement"]);

  const tempArray = await Deno.makeTempFile({ suffix: ".md" });
  const contentArray = `---
categories:
  - foo
  - bar
---
`;
  await Deno.writeTextFile(tempArray, contentArray);
  assertEquals(getFrontmatterCategoryList(tempArray), ["foo", "bar"]);
});
