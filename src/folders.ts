import { dirname, fromFileUrl, join, relative } from "jsr:@std/path@0.224.0";

const repoRoot = join(dirname(fromFileUrl(import.meta.url)), "..");
const jekyllRoot = join(repoRoot, "docs");

const JEKYLL_FOLDERS = {
  root: jekyllRoot,
  posts: join(jekyllRoot, "_posts"),
  assets: join(jekyllRoot, "assets"),
  authors: join(jekyllRoot, "_authors"),
};

const stripRepoRoot = (filePath: string) => relative(repoRoot, filePath);

export { JEKYLL_FOLDERS, repoRoot, stripRepoRoot };
