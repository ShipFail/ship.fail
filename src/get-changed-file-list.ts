interface ChangeOptions {
  since?: string;
  limit?: number;
}

async function getChangedFileList(options?: ChangeOptions): Promise<string[]> {
  const args = ["log", "--name-only", "--pretty=format:"];

  if (options?.since) {
    args.push(`--since=${options.since}`);
  }

  const cmd = new Deno.Command("git", { args, stdout: "piped" });
  const { stdout } = await cmd.output();
  const output = new TextDecoder().decode(stdout);

  let files = output.split(/\r?\n/).filter((line) => line.length > 0);
  files = Array.from(new Set(files));

  if (options?.limit) {
    files = files.slice(0, options.limit);
  }

  return files;
}

export type { ChangeOptions };
export { getChangedFileList };
