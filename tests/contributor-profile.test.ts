import { assert } from "jsr:@std/assert@0.224.0";
import { expandGlob } from "jsr:@std/fs@0.224.0";
import { basename } from "jsr:@std/path@0.224.0";

import { contributorFilenameToUsername } from "../src/contributor-filename-to-username.ts";
import { getChangedFileList } from "../src/get-changed-file-list.ts";
import { getFrontmatterAuthor } from "../src/get-frontmatter-author.ts";
import { getFrontmatterAvatarList } from "../src/get-frontmatter-avatar-list.ts";
import { isUrlExist } from "../src/is-url-exist.ts";
import { JEKYLL_FOLDERS, stripRepoRoot } from "../src/folders.ts";

const fileExists = async (path: string) => {
  try {
    const stat = await Deno.stat(path);
    return stat.isFile;
  } catch {
    return false;
  }
};

Deno.test("front matter author must exist and map to _authors", async () => {
  const postsFileList: string[] = [];
  for await (const entry of expandGlob(`${JEKYLL_FOLDERS.posts}/*.md`)) {
    if (entry.isFile) postsFileList.push(entry.path);
  }

  for (const file of postsFileList) {
    const author = getFrontmatterAuthor(file);
    assert(author, `${stripRepoRoot(file)} author should be set`);

    const authorFile = `${JEKYLL_FOLDERS.authors}/${author}.md`;
    const exists = await fileExists(authorFile);
    assert(exists, `${stripRepoRoot(file)} author profile should exist at ${stripRepoRoot(authorFile)}`);
  }
});

Deno.test("author profile filename must match [a-z0-9_.-]+.md", async () => {
  const REGEX = /^[a-z0-9_.-]+\.md$/;
  const contributorsFileList: string[] = [];
  for await (const entry of expandGlob(`${JEKYLL_FOLDERS.authors}/*.md`)) {
    if (entry.isFile) contributorsFileList.push(entry.path);
  }

  for (const filename of contributorsFileList.map(stripRepoRoot)) {
    const name = basename(filename);
    assert(REGEX.test(name), `${name} should match ${REGEX}`);
  }
});

Deno.test("author avatar should be stored under assets/contributors/{user}", async () => {
  const contributorsFileList: string[] = [];
  for await (const entry of expandGlob(`${JEKYLL_FOLDERS.authors}/*.md`)) {
    if (entry.isFile) contributorsFileList.push(entry.path);
  }

  for (const file of contributorsFileList) {
    const avatarList = getFrontmatterAvatarList(file);
    assert(avatarList.length === 1, `${stripRepoRoot(file)} should have one avatar`);

    const avatar = avatarList[0]!;
    assert(avatar.startsWith("/"), `${avatar} should start with '/'`);

    const userName = contributorFilenameToUsername(file);
    const pattern = new RegExp(`/authors/${userName}/`);
    assert(pattern.test(avatar), `avatar ${avatar} must be saved to assets/authors/${userName}`);

    assert(!/^http/i.test(avatar), `${stripRepoRoot(file)} should use local avatar files`);

    const avatarFile = `${JEKYLL_FOLDERS.root}${avatar}`;
    const exists = await fileExists(avatarFile);
    assert(exists, `${stripRepoRoot(avatarFile)} should exist`);
  }
});

Deno.test("author profile name should be a valid GitHub username (recent changes)", async () => {
  const changedFileList = await getChangedFileList({ since: "1 week ago" });
  const changedAuthors = changedFileList.filter((file) => file.startsWith("docs/_authors/"));

  const urlList = changedAuthors.map(contributorFilenameToUsername).map((name) => `https://github.com/${name}`);

  for (const url of urlList) {
    const exists = await isUrlExist(url);
    assert(exists, `${url} should exist on GitHub`);
  }
});
