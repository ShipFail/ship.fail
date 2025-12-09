import { asString, readFrontmatter } from "./frontmatter.ts";

const getFrontmatterTeaserList = (filePath: string): string[] => {
  const image = asString(readFrontmatter(filePath)["image"]);
  return image ? [image] : [];
};

export { getFrontmatterTeaserList };
