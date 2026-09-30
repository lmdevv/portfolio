import { imageInfo } from "@opentui/core";
import photoPath from "@portfolio/content/assets/photo.jpg" with { type: "file" };

export { photoPath };

export type LoadedImage = { bytes: Uint8Array; width: number; height: number };

const cache = new Map<string, Promise<LoadedImage>>();

/**
 * Embedded files live on Bun's virtual filesystem, which OpenTUI's path loader can't read,
 * so images are always handed over as bytes.
 */
export function loadImage(path: string): Promise<LoadedImage> {
  let pending = cache.get(path);
  if (!pending) {
    pending = Bun.file(path)
      .bytes()
      .then((bytes) => {
        const { width, height } = imageInfo(bytes);
        return { bytes, width, height };
      });
    cache.set(path, pending);
  }
  return pending;
}
