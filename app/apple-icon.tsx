import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 256, height: 256 };
export const contentType = "image/webp";

export default async function AppleIcon() {
  const file = await readFile(join(process.cwd(), "public", "logo.webp"));
  return new Uint8Array(file);
}
