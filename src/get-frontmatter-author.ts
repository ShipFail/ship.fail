import { asString, readFrontmatter } from "./frontmatter.ts";

const getFrontmatterAuthor = (filePath: string): string | undefined =>
  asString(readFrontmatter(filePath)["author"]);

export { getFrontmatterAuthor };
