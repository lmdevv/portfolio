import {
  NativeImage,
  Renderable,
  RGBA,
  type OptimizedBuffer,
  type RenderableOptions,
  type RenderContext,
} from "@opentui/core";
import { extend } from "@opentui/react";

type AsciiImageOptions = RenderableOptions<AsciiImageRenderable> & {
  source: Uint8Array;
  color?: boolean;
};

const RAMP = " .'`^\",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
const TRANSPARENT = RGBA.fromValues(0, 0, 0, 0);

type Grid = {
  cols: number;
  rows: number;
  left: number;
  top: number;
  chars: string[];
  colors: RGBA[];
};

/**
 * Renders an image as character-ramp ASCII art. Works on every terminal, including ones that
 * mangle block glyphs, and keeps a bit of the original color when `color` is on.
 */
export class AsciiImageRenderable extends Renderable {
  private image: NativeImage | undefined;
  private grid: Grid | undefined;
  private builtFor = "";
  private tinted: boolean;

  constructor(ctx: RenderContext, options: AsciiImageOptions) {
    super(ctx, options);
    this.tinted = options.color ?? true;
    this.source = options.source;
  }

  set source(bytes: Uint8Array) {
    this.image?.dispose();
    this.image = NativeImage.decode(bytes);
    this.grid = undefined;
    this.requestRender();
  }

  set color(value: boolean) {
    this.tinted = value;
    this.grid = undefined;
    this.requestRender();
  }

  private build(width: number, height: number): Grid | undefined {
    const image = this.image;
    if (!image || width <= 0 || height <= 0) return;

    // Terminal cells are roughly twice as tall as they are wide.
    const aspect = image.width / image.height;
    let cols = width;
    let rows = Math.round(width / aspect / 2);
    if (rows > height) {
      rows = height;
      cols = Math.min(width, Math.round(height * 2 * aspect));
    }
    cols = Math.max(1, cols);
    rows = Math.max(1, rows);

    const resized = image.resize({ width: cols, height: rows, kernel: "area" });
    const { data, stride } = resized.raw("rgba8");
    const chars: string[] = [];
    const colors: RGBA[] = [];

    const luminanceAt = (offset: number) =>
      ((0.2126 * data[offset]! + 0.7152 * data[offset + 1]! + 0.0722 * data[offset + 2]!) / 255) *
      (data[offset + 3]! / 255);

    // Stretch contrast so low-dynamic-range photos still use the whole ramp.
    let low = 1;
    let high = 0;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const value = luminanceAt(y * stride + x * 4);
        low = Math.min(low, value);
        high = Math.max(high, value);
      }
    }
    const range = Math.max(high - low, 0.001);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const offset = y * stride + x * 4;
        const r = data[offset]! / 255;
        const g = data[offset + 1]! / 255;
        const b = data[offset + 2]! / 255;
        const luminance = Math.pow((luminanceAt(offset) - low) / range, 0.9);
        chars.push(RAMP[Math.min(RAMP.length - 1, Math.round(luminance * (RAMP.length - 1)))]!);
        colors.push(
          this.tinted
            ? RGBA.fromValues(0.35 + r * 0.65, 0.35 + g * 0.65, 0.35 + b * 0.65, 1)
            : RGBA.fromValues(
                0.45 + luminance * 0.55,
                0.45 + luminance * 0.55,
                0.47 + luminance * 0.53,
                1,
              ),
        );
      }
    }
    resized.dispose();

    return {
      cols,
      rows,
      left: Math.floor((width - cols) / 2),
      top: Math.floor((height - rows) / 2),
      chars,
      colors,
    };
  }

  protected override renderSelf(buffer: OptimizedBuffer): void {
    const { width, height } = this;
    if (!this.grid || this.builtFor !== `${width}x${height}`) {
      this.grid = this.build(width, height);
      this.builtFor = `${width}x${height}`;
    }
    const grid = this.grid;
    if (!grid) return;

    for (let y = 0; y < grid.rows; y++) {
      for (let x = 0; x < grid.cols; x++) {
        const index = y * grid.cols + x;
        buffer.setCell(
          this.x + grid.left + x,
          this.y + grid.top + y,
          grid.chars[index]!,
          grid.colors[index]!,
          TRANSPARENT,
        );
      }
    }
  }

  protected override destroySelf(): void {
    this.image?.dispose();
    this.image = undefined;
    super.destroySelf();
  }
}

declare module "@opentui/react" {
  interface OpenTUIComponents {
    "ascii-image": typeof AsciiImageRenderable;
  }
}

extend({ "ascii-image": AsciiImageRenderable });
