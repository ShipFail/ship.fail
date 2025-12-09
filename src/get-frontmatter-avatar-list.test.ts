import { assertEquals } from "jsr:@std/assert@0.224.0";

import { getFrontmatterAvatarList } from "./get-frontmatter-avatar-list.ts";

Deno.test("getFrontmatterAvatarList extracts avatar from frontmatter", async () => {
  const temp = await Deno.makeTempFile({ suffix: ".md" });
  const content = `---
avatar: /assets/authors/example/avatar.webp
---
`; // minimal frontmatter
  await Deno.writeTextFile(temp, content);

  const avatars = getFrontmatterAvatarList(temp);
  assertEquals(avatars, ["/assets/authors/example/avatar.webp"]);
});
