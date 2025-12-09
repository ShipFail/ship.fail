import { assertEquals } from "jsr:@std/assert@0.224.0";

import { prNumberToTitle } from "./pr-number-to-title.ts";

Deno.test({
  name: "prNumberToTitle resolves title from GitHub",
  ignore: true, // requires network and a stable PR title
  fn: async () => {
    const ORG = "bupt";
    const REPO = "ai-ml.club";
    const PR = 141;
    const EXPECTED_TITLE = "fix S2E13";

    const title = await prNumberToTitle(ORG, REPO, PR);
    assertEquals(title, EXPECTED_TITLE);
  },
});
