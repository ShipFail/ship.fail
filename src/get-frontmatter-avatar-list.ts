import { asString, readFrontmatter } from "./frontmatter.ts";

const getFrontmatterAvatarList = (filePath: string): string[] => {
  const avatar = asString(readFrontmatter(filePath)["avatar"]);
  return avatar ? [avatar] : [];
};

export { getFrontmatterAvatarList };
