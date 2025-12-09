const contributorFilenameToUsername = (filePath: string) => {
  const match = /\/([^/]+?)\.md$/.exec(filePath);
  if (!match) throw new Error(`No contributor username in ${filePath}`);
  return match[1]!;
};

export { contributorFilenameToUsername };
