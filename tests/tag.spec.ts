import { assert } from "jsr:@std/assert@0.224.0";
import { expandGlob } from "jsr:@std/fs@0.224.0";

import { getFrontmatterCategoryList } from "../src/get-frontmatter-category-list.ts";
import { getFrontmatterTagList } from "../src/get-frontmatter-tag-list.ts";
import { JEKYLL_FOLDERS, stripRepoRoot } from "../src/folders.ts";

const getFileToTagsMap = async () => {
  const postsFileList: string[] = [];
  for await (const entry of expandGlob(`${JEKYLL_FOLDERS.posts}/*.md`)) {
    if (entry.isFile) postsFileList.push(entry.path);
  }

  const fileTagMap: Record<string, string[]> = {};
  for (const file of postsFileList) {
    fileTagMap[file] = getFrontmatterTagList(file);
  }
  return fileTagMap;
};

Deno.test("front matter tags must contain at least one tag", async () => {
  const tagMap = await getFileToTagsMap();
  for (const [file, tagList] of Object.entries(tagMap)) {
    assert(tagList.length > 0, `${stripRepoRoot(file)} should have at least one tag`);
  }
});

Deno.test("front matter tags must not be blacklisted", async () => {
  const TAG_BLACK_LIST: [RegExp, string][] = [
    [/^wechaty$/, "Everything is related to wechaty, so no need to add it."],
    [/\s/, "Space is not allowed in tag"],
    [/[A-Z]/, "Upper case is not allowed in tag"],
  ];

  const isBlacked = (tag: string) => {
    for (const [regex, msg] of TAG_BLACK_LIST) {
      if (regex.test(tag)) return msg;
    }
    return false;
  };

  const tagMap = await getFileToTagsMap();
  for (const [file, tagList] of Object.entries(tagMap)) {
    for (const tag of tagList) {
      const msg = isBlacked(tag);
      assert(!msg, `${stripRepoRoot(file)} tag(${tag}): ${msg}`);
    }
  }
});

Deno.test("tags naming convention", async () => {
  const recommendedTags: Record<string, string[]> = {
    donut: ["wechaty-puppet-donut"],
    dotnet: ["csharp-wechaty", "dotnet-wechaty"],
    go: ["go-wechaty"],
    java: ["java-wechaty"],
    padlocal: ["wechaty-puppet-padlocal"],
    "puppet-provider": ["puppet-providers", "wechaty-puppet-provider"],
    "puppet-service": ["puppet-services", "wechaty-puppet-service"],
    python: ["python-wechaty"],
  };

  const typoToGoodTagMap: Record<string, string | undefined> = {};
  for (const [goodTag, typoTagList] of Object.entries(recommendedTags)) {
    typoTagList.forEach((typoTag) => {
      typoToGoodTagMap[typoTag] = goodTag;
    });
  }

  const hasTypoTag = (tag: string) => typoToGoodTagMap[tag];

  const fileTagsMap = await getFileToTagsMap();
  for (const [file, tagList] of Object.entries(fileTagsMap)) {
    for (const tag of tagList) {
      const recommendedTag = hasTypoTag(tag);
      assert(!recommendedTag, `${stripRepoRoot(file)} tag ${tag} should be ${recommendedTag}`);
    }
  }
});

Deno.test("tags for project category", async () => {
  const TAGS: Record<string, string> = {
    automotive: "Cars",
    devops: "DevOps & CI/CD",
    ecommerce: "E-Commerce",
    ecosystem: "Ecosystem for Wechaty community",
    education: "learning, talk to the professor, application management, and manage course schedules",
    entertainment: "Movie updates, booking tickets, etc.",
    finance:
      "banking and Insurance: Account updates, OTPs, account transactions, Suspicious account, Insurance premium updates, and payment, recommend right insurance products, compare insurance premiums, password setting, and new loans, credit card updates, etc.",
    game: "Interactive games",
    healthcare: "",
    hospitality: "",
    insurance: "",
    media: "Send digital newspapers, etc.",
    other: "",
    productivity: "",
    "real-estate": "Real Estates",
    social: "",
    travel: "Browse hotels and tickets, booking, send boarding pass, etc",
    utility: "",
  };

  const postsFileList: string[] = [];
  for await (const entry of expandGlob(`${JEKYLL_FOLDERS.posts}/*.md`)) {
    if (entry.isFile) postsFileList.push(entry.path);
  }
  const tagMap = await getFileToTagsMap();

  for (const file of postsFileList) {
    const categoryList = getFrontmatterCategoryList(file);
    const tagList = tagMap[file] ?? [];

    if (tagList.length <= 0) continue;
    if (!categoryList.includes("project")) continue;

    const tagOk = tagList.some((tag) => tag in TAGS);
    assert(
      tagOk,
      `${stripRepoRoot(file)} has category project so tags should contain one of ${Object.keys(TAGS).join(",")}`,
    );
  }
});
