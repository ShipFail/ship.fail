const getYearMonth = (filename: string) => {
  const match = filename.match(/\/(\d{4})-(\d{2})-\d{2}-/);
  if (!match) throw new Error(`${filename} parse month fail`);
  return { year: match[1], month: match[2] };
};

export { getYearMonth };
