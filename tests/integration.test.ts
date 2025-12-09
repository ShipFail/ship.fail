import { assert } from "jsr:@std/assert@0.224.0";

import { prNumberToTitle } from "../src/pr-number-to-title.ts";

Deno.test({
  name: "pull request title (opt-in)",
  ignore: true,
  sanitizeOps: false,
  async fn() {
    const prEnv = Deno.env.get("PR_NUMBER");
    const repo = Deno.env.get("PR_REPO");
    const org = Deno.env.get("PR_ORG");
    if (!prEnv || !repo || !org) return;

    const prNum = parseInt(prEnv, 10);
    const prTitle = await prNumberToTitle(org, repo, prNum);
    assert(prTitle.length > 0, "PR title should be non-empty");
  },
});
