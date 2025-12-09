import { asStringArray, readFrontmatter } from "./frontmatter.ts";

const getFrontmatterCategoryList = (filePath: string): string[] =>
  asStringArray(readFrontmatter(filePath)["categories"]);

export { getFrontmatterCategoryList };
