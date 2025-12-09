import { extname } from "jsr:@std/path@0.224.0";

interface ImageInfo {
  width?: number;
  height?: number;
  size: number;
  type: string;
}

const toUint16BE = (data: Uint8Array, offset: number) =>
  (data[offset] << 8) + data[offset + 1];

const toUint32LE = (data: Uint8Array, offset: number) =>
  data[offset] + (data[offset + 1] << 8) + (data[offset + 2] << 16) + (data[offset + 3] << 24);

const parsePng = (data: Uint8Array) => {
  if (data.length < 24) return undefined;
  const isPng =
    data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4e && data[3] === 0x47;
  if (!isPng) return undefined;
  const width = (data[16] << 24) | (data[17] << 16) | (data[18] << 8) | data[19];
  const height = (data[20] << 24) | (data[21] << 16) | (data[22] << 8) | data[23];
  return { width, height };
};

const parseGif = (data: Uint8Array) => {
  if (data.length < 10) return undefined;
  const isGif =
    data[0] === 0x47 && data[1] === 0x49 && data[2] === 0x46 && data[3] === 0x38;
  if (!isGif) return undefined;
  const width = data[6] + (data[7] << 8);
  const height = data[8] + (data[9] << 8);
  return { width, height };
};

const parseJpeg = (data: Uint8Array) => {
  if (data.length < 4 || data[0] !== 0xff || data[1] !== 0xd8) return undefined;
  let offset = 2;
  while (offset + 9 < data.length) {
    if (data[offset] !== 0xff) break;
    const marker = data[offset + 1];
    const length = toUint16BE(data, offset + 2);
    if (length < 2) break;

    const isSOF =
      marker === 0xc0 || marker === 0xc1 || marker === 0xc2 || marker === 0xc3 ||
      marker === 0xc5 || marker === 0xc6 || marker === 0xc7 || marker === 0xc9 ||
      marker === 0xca || marker === 0xcb || marker === 0xcd || marker === 0xce ||
      marker === 0xcf;

    if (isSOF && offset + 7 < data.length) {
      const height = toUint16BE(data, offset + 5);
      const width = toUint16BE(data, offset + 7);
      return { width, height };
    }

    offset += 2 + length;
  }
  return undefined;
};

const parseWebp = (data: Uint8Array) => {
  if (data.length < 30) return undefined;
  const isRiff =
    data[0] === 0x52 && data[1] === 0x49 && data[2] === 0x46 && data[3] === 0x46;
  const isWebp =
    data[8] === 0x57 && data[9] === 0x45 && data[10] === 0x42 && data[11] === 0x50;
  if (!isRiff || !isWebp) return undefined;

  const chunkType = String.fromCharCode(data[12], data[13], data[14], data[15]);
  const chunkDataStart = 20;

  if (chunkType === "VP8X") {
    const width =
      1 +
      (data[chunkDataStart + 4] |
        (data[chunkDataStart + 5] << 8) |
        (data[chunkDataStart + 6] << 16));
    const height =
      1 +
      (data[chunkDataStart + 7] |
        (data[chunkDataStart + 8] << 8) |
        (data[chunkDataStart + 9] << 16));
    return { width, height };
  }

  if (chunkType === "VP8L") {
    const start = chunkDataStart;
    if (data[start] !== 0x2f) return undefined;
    const b0 = data[start + 1];
    const b1 = data[start + 2];
    const b2 = data[start + 3];
    const b3 = data[start + 4];
    const width = 1 + (((b1 & 0x3f) << 8) | b0);
    const height = 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
    return { width, height };
  }

  if (chunkType === "VP8 ") {
    const start = chunkDataStart;
    if (data[start + 3] === 0x9d && data[start + 4] === 0x01 && data[start + 5] === 0x2a) {
      const width = data[start + 6] | (data[start + 7] << 8);
      const height = data[start + 8] | (data[start + 9] << 8);
      return { width, height };
    }
  }

  return undefined;
};

const parseSvg = (data: Uint8Array) => {
  const text = new TextDecoder().decode(data);
  const viewBoxMatch = text.match(/viewBox="([^"]+)"/i);
  const widthMatch = text.match(/width="([^"]+)"/i);
  const heightMatch = text.match(/height="([^"]+)"/i);

  let width: number | undefined;
  let height: number | undefined;

  if (widthMatch) {
    const parsed = parseFloat(widthMatch[1]!.replace(/px$/, ""));
    width = Number.isFinite(parsed) ? parsed : undefined;
  }
  if (heightMatch) {
    const parsed = parseFloat(heightMatch[1]!.replace(/px$/, ""));
    height = Number.isFinite(parsed) ? parsed : undefined;
  }

  if ((!width || !height) && viewBoxMatch) {
    const parts = viewBoxMatch[1]!.split(/\s+/).map(Number);
    if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
      width = width ?? parts[2];
      height = height ?? parts[3];
    }
  }

  if (width && height) {
    return { width, height };
  }

  return undefined;
};

const parseDimensions = (data: Uint8Array, ext: string) => {
  switch (ext) {
    case "png":
      return parsePng(data);
    case "gif":
      return parseGif(data);
    case "jpg":
    case "jpeg":
      return parseJpeg(data);
    case "webp":
      return parseWebp(data);
    case "svg":
      return parseSvg(data);
    default:
      return undefined;
  }
};

const getImageInfo = (filePath: string): ImageInfo => {
  const data = Deno.readFileSync(filePath);
  const size = data.length;
  const ext = extname(filePath).replace(/^\./, "").toLowerCase();
  const dims = parseDimensions(data, ext);
  return { width: dims?.width, height: dims?.height, size, type: ext };
};

export type { ImageInfo };
export { getImageInfo };
