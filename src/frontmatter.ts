import { extract } from "jsr:@std/front-matter@0.224.0/any";

type FrontAttrs = Record<string, unknown>;

const readFrontmatter = (filePath: string): FrontAttrs => {
  const content = Deno.readTextFileSync(filePath);
  const { attrs } = extract<FrontAttrs>(content);
  return attrs ?? {};
};

const asString = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;

const asStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === "string");
  }
  if (typeof value === "string") {
    return [value];
  }
  return [];
};

export { asString, asStringArray, readFrontmatter };
