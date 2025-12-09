import { expandGlob } from "jsr:@std/fs@0.224.0";

import { getFrontmatterAvatarList } from "./get-frontmatter-avatar-list.ts";
import { getFrontmatterTeaserList } from "./get-frontmatter-teaser-list.ts";
import { getMarkdownImageList } from "./get-markdown-image-list.ts";
import { ChangeOptions, getChangedFileList } from "./get-changed-file-list.ts";
import { JEKYLL_FOLDERS, stripRepoRoot } from "./folders.ts";

const globFiles = async (pattern: string): Promise<string[]> => {
  const files: string[] = [];
  for await (const entry of expandGlob(pattern)) {
    if (entry.isFile) files.push(entry.path);
  }
  return files;
};

const applyChangeFilter = (files: string[], changed?: string[]): string[] => {
  if (!changed) return files;
  const changedSet = new Set(changed);
  return files.filter((file) => changedSet.has(stripRepoRoot(file)));
};

const getAllImageList = async (options?: ChangeOptions): Promise<string[]> => {
  const changedFiles = options?.since ? await getChangedFileList(options) : undefined;

  const postFiles = applyChangeFilter(
    await globFiles(`${JEKYLL_FOLDERS.posts}/*.md`),
    changedFiles,
  );

  const authorFiles = applyChangeFilter(
    await globFiles(`${JEKYLL_FOLDERS.authors}/*.md`),
    changedFiles,
  );

  return [
    ...postFiles.map(getFrontmatterTeaserList).flat(),
    ...postFiles.map(getMarkdownImageList).flat(),
    ...authorFiles.map(getFrontmatterAvatarList).flat(),
  ];
};

const listAssetFiles = async (extensions: string[]): Promise<string[]> => {
  const globExt = extensions.join(",");
  return globFiles(`${JEKYLL_FOLDERS.assets}/**/*.{${globExt}}`);
};

export { getAllImageList, listAssetFiles };
