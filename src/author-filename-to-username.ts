const authorFilenameToUsername = (filePath: string) => {
  const match = /\/([^/]+?)\.md$/.exec(filePath);
  if (!match) throw new Error(`No author username in ${filePath}`);
  return match[1]!;
};

export { authorFilenameToUsername };
