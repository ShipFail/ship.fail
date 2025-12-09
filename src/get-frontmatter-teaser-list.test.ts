import { assertEquals } from "jsr:@std/assert@0.224.0";

import { getFrontmatterTeaserList } from "./get-frontmatter-teaser-list.ts";

Deno.test("getFrontmatterTeaserList returns image when present", async () => {
  const temp = await Deno.makeTempFile({ suffix: ".md" });
  const content = `---
image: /assets/2025/04-sample/post.webp
---
`; // teaser in frontmatter
  await Deno.writeTextFile(temp, content);

  const teasers = getFrontmatterTeaserList(temp);
  assertEquals(teasers, ["/assets/2025/04-sample/post.webp"]);
});
