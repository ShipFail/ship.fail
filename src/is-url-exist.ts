const NETWORK_TIMEOUT_MS = 30_000;

const withTimeout = (ms: number) => AbortSignal.timeout(ms);

async function isUrlExist(url: string): Promise<boolean> {
  try {
    const head = await fetch(url, { method: "HEAD", signal: withTimeout(NETWORK_TIMEOUT_MS) });
    if (head.ok) return true;

    const get = await fetch(url, { method: "GET", signal: withTimeout(NETWORK_TIMEOUT_MS) });
    return get.ok;
  } catch {
    return false;
  }
}
export { isUrlExist };
