import { assertEquals } from "jsr:@std/assert@0.224.0";

import { getIframeIncludeSrcList, getMarkdownImageList } from "./get-markdown-image-list.ts";

Deno.test("getMarkdownImageList collects markdown and html image sources", async () => {
  const temp = await Deno.makeTempFile({ suffix: ".md" });
  const content = `![one](/assets/img1.webp)
<img src="/assets/img2.png" />
\`\`\`
![skip](/ignore.webp)
\`\`\`
{% include iframe.html src="https://example.com" %}
{% include iframe.html src="https://youtube.com/watch?v=abc" %}
`;
  await Deno.writeTextFile(temp, content);

  const images = getMarkdownImageList(temp).sort();
  assertEquals(images, ["/assets/img1.webp", "/assets/img2.png"].sort());

  const includes = getIframeIncludeSrcList(temp);
  assertEquals(includes, ["https://example.com", "https://youtube.com/watch?v=abc"]);
});
