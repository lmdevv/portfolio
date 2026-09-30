import { Renderable, RGBA, type OptimizedBuffer, type RenderableOptions, type RenderContext } from "@opentui/core";
import { extend } from "@opentui/react";

type WarpOptions = RenderableOptions<WarpRenderable> & {
  colors?: readonly string[];
  speed?: number;
  swirl?: number;
  scale?: number;
  animate?: boolean;
  fps?: number;
  /** Distinct colors; fewer levels means fewer changed cells per frame and less SSH traffic. */
  levels?: number;
};

function mix(a: RGBA, b: RGBA, t: number) {
  return RGBA.fromValues(a.r + (b.r - a.r) * t, a.g + (b.g - a.g) * t, a.b + (b.b - a.b) * t, 1);
}

function buildPalette(colors: readonly string[], levels: number) {
  const stops = colors.map((color) => RGBA.fromHex(color));
  if (stops.length === 1) stops.push(stops[0]!);
  return Array.from({ length: levels }, (_, level) => {
    const position = (level / (levels - 1)) * (stops.length - 1);
    const index = Math.min(Math.floor(position), stops.length - 2);
    return mix(stops[index]!, stops[index + 1]!, position - index);
  });
}

/**
 * A terminal take on the website's paper-design Warp shader: a domain-warped swirl drawn
 * with upper half blocks so every cell carries two vertically stacked "pixels".
 */
export class WarpRenderable extends Renderable {
  private palette: RGBA[];
  private levels: number;
  private speed: number;
  private swirl: number;
  private scale: number;
  private fps: number;
  private timer: ReturnType<typeof setInterval> | undefined;
  private startedAt = performance.now();
  private frozenAt = 0;

  constructor(ctx: RenderContext, options: WarpOptions) {
    super(ctx, options);
    this.levels = options.levels ?? 12;
    this.palette = buildPalette(options.colors ?? ["#09090b", "#27272a", "#52525b"], this.levels);
    this.speed = options.speed ?? 0.4;
    this.swirl = options.swirl ?? 0.8;
    this.scale = options.scale ?? 1;
    this.fps = options.fps ?? 6;
    this.animate = options.animate ?? true;
  }

  set colors(value: readonly string[]) {
    this.palette = buildPalette(value, this.levels);
    this.requestRender();
  }

  set animate(value: boolean) {
    clearInterval(this.timer);
    this.timer = undefined;
    if (value) {
      this.startedAt = performance.now() - this.frozenAt * 1000;
      this.timer = setInterval(() => this.requestRender(), 1000 / this.fps);
    } else {
      this.frozenAt = this.elapsed();
      this.requestRender();
    }
  }

  private elapsed() {
    return this.timer ? (performance.now() - this.startedAt) / 1000 : this.frozenAt;
  }

  private sample(x: number, y: number, t: number) {
    const frequency = 2.5 / this.scale;
    let u = x * frequency;
    let v = y * frequency;
    for (let i = 1; i <= 6; i++) {
      u += (this.swirl / i) * 1.6 * Math.sin(v * 1.2 + t + i * 1.7);
      v += (this.swirl / i) * 1.6 * Math.cos(u * 0.9 - t * 0.8 + i * 2.3);
    }
    const value = 0.5 + 0.5 * Math.sin((u + v) * 0.7 + t * 0.5);
    return this.palette[Math.min(this.levels - 1, Math.floor(value * this.levels))]!;
  }

  protected override renderSelf(buffer: OptimizedBuffer): void {
    const { width, height } = this;
    if (width <= 0 || height <= 0) return;

    const t = this.elapsed() * this.speed;
    const aspect = width / (height * 2);
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const nx = (col / width) * aspect;
        const top = this.sample(nx, (row * 2) / (height * 2), t);
        const bottom = this.sample(nx, (row * 2 + 1) / (height * 2), t);
        buffer.setCell(this.x + col, this.y + row, "▀", top, bottom);
      }
    }
  }

  protected override destroySelf(): void {
    clearInterval(this.timer);
    super.destroySelf();
  }
}

declare module "@opentui/react" {
  interface OpenTUIComponents {
    warp: typeof WarpRenderable;
  }
}

extend({ warp: WarpRenderable });
