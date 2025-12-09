import { asStringArray, readFrontmatter } from "./frontmatter.ts";

const getFrontmatterTagList = (filePath: string): string[] =>
  asStringArray(readFrontmatter(filePath)["tags"]);

export { getFrontmatterTagList };
