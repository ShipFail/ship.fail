const NETWORK_TIMEOUT_MS = 30_000;

const withTimeout = (ms: number) => AbortSignal.timeout(ms);

async function prNumberToTitle(org: string, repo: string, pr: number): Promise<string> {
  const apiUrl = `https://api.github.com/repos/${org}/${repo}/pulls/${pr}`;
  const htmlUrl = `https://github.com/${org}/${repo}/pull/${pr}`;

  const headers = { "User-Agent": "ship.fail-tests" };

  const tryApi = async () => {
    const res = await fetch(apiUrl, { signal: withTimeout(NETWORK_TIMEOUT_MS), headers });
    if (!res.ok) return undefined;
    const data = await res.json();
    const title = typeof data?.title === "string" ? data.title : undefined;
    return title;
  };

  const tryHtml = async () => {
    const res = await fetch(htmlUrl, { signal: withTimeout(NETWORK_TIMEOUT_MS), headers });
    if (!res.ok) return undefined;
    const html = await res.text();
    const match = html.match(/<title>(.+?) by .*?· Pull Request #\d+.*?<\/title>/is);
    return match?.[1];
  };

  const title = (await tryApi()) ?? (await tryHtml());
  if (!title) throw new Error("Unable to resolve PR title");
  return title;
}

export { prNumberToTitle };
