const stripCodeBlocks = (text: string): string =>
  text.replace(/```[\s\S]*?```/g, "").replace(/~~~[\s\S]*?~~~/g, "");

const markdownImages = (text: string): string[] => {
  const regex = /!\[[^\]]*?\]\(([^)]+)\)/g;
  const matches: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    matches.push(match[1]!.trim());
  }
  return matches;
};

const htmlImages = (text: string): string[] => {
  const regex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  const matches: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    matches.push(match[1]!.trim());
  }
  return matches;
};

const iframeIncludes = (text: string): string[] => {
  const regex = /{%\s+include\s+iframe\.html\s+src="([^"]+)"\s+%}/g;
  const matches: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    matches.push(match[1]!.trim());
  }
  return matches;
};

const getMarkdownImageList = (filePath: string): string[] => {
  const raw = Deno.readTextFileSync(filePath);
  const text = stripCodeBlocks(raw);
  return [...markdownImages(text), ...htmlImages(text)].filter((s) => s.length > 0);
};

const getIframeIncludeSrcList = (filePath: string): string[] => {
  const raw = Deno.readTextFileSync(filePath);
  return iframeIncludes(stripCodeBlocks(raw)).filter((s) => s.length > 0);
};

export { getIframeIncludeSrcList, getMarkdownImageList };
