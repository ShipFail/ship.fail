import {
  assert,
  assertLessOrEqual,
} from "jsr:@std/assert@0.224.0";

import { getImageInfo } from "../src/image-metadata.ts";
import { listAssetFiles } from "../src/get-all-image-list.ts";
import { stripRepoRoot } from "../src/folders.ts";
import {
  BIG_SIZE_TO_BE_FIXED_FILE_LIST,
  NOT_WEBP_TO_BE_FIXED_FILE_LIST,
  inList,
} from "./workaround.ts";

const imageExtensions = ["gif", "jpeg", "jpg", "png", "tiff", "webp", "svg"];

Deno.test("image size should be fit for the web (<=1MB, <=1920px)", async () => {
  const MAX_WIDTH = 1920;
  const MAX_SIZE = 1024 * 1024;

  const fileList = await listAssetFiles(imageExtensions);
  assert(fileList.length > 0, "should get image file list");

  const isNotWhitelist = (file: string) => !inList(BIG_SIZE_TO_BE_FIXED_FILE_LIST)(file);
  const checkFileList = fileList.filter(isNotWhitelist);

  for (const file of checkFileList) {
    const info = getImageInfo(file);
    assert(info.width !== undefined && info.height !== undefined, `${file} should expose dimensions`);
    const fits = info.width <= MAX_WIDTH && info.size <= MAX_SIZE;
    assert(
      fits,
      `"${stripRepoRoot(file)}" (width: ${info.width}, size: ${info.size}) exceed limit width<=${MAX_WIDTH} size<=${MAX_SIZE}`,
    );
  }
});

Deno.test("enforce all images are .webp or .svg", async () => {
  const fileList = await listAssetFiles(imageExtensions);

  const isNotWebpOrSvg = (file: string) => !file.endsWith(".webp") && !file.endsWith(".svg");
  const isNotWhitelist = (file: string) => !inList(NOT_WEBP_TO_BE_FIXED_FILE_LIST)(file);

  const checkFileList = fileList.filter(isNotWebpOrSvg).filter(isNotWhitelist);
  assertLessOrEqual(checkFileList.length, 0, `${checkFileList.join(", ")} should be webp or svg`);
});
