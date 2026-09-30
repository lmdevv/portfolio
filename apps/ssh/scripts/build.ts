/**
 * Compiles the TUI into a single self-contained executable with every page, post, and image
 * embedded. Run `bun scripts/generate-content.ts` first (the package `build` script does).
 *
 *   bun scripts/build.ts                         # current platform
 *   bun scripts/build.ts --target linux-x64      # e.g. for a Fly.io machine
 *   bun scripts/build.ts --target all
 */
import { parseArgs } from "node:util";

const targets = [
  "linux-x64",
  "linux-arm64",
  "darwin-x64",
  "darwin-arm64",
  "windows-x64",
  "windows-arm64",
] as const;
type Target = (typeof targets)[number];

const nativePackages = [
  "@opentui/core-linux-x64",
  "@opentui/core-linux-arm64",
  "@opentui/core-linux-x64-musl",
  "@opentui/core-linux-arm64-musl",
  "@opentui/core-darwin-x64",
  "@opentui/core-darwin-arm64",
  "@opentui/core-win32-x64",
  "@opentui/core-win32-arm64",
];

const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: { target: { type: "string" }, outdir: { type: "string", default: "dist" } },
});

const os = process.platform === "win32" ? "windows" : process.platform;
const current = `${os}-${process.arch}` as Target;
const requested = values.target === "all" ? [...targets] : [(values.target ?? current) as Target];

for (const target of requested) {
  if (!targets.includes(target)) {
    console.error(`Unknown target "${target}". Expected one of: ${targets.join(", ")}, all`);
    process.exit(1);
  }

  const isWindows = target.startsWith("windows-");
  const native = `@opentui/core-${target.replace(/^windows-/, "win32-")}`;
  const outfile = `${values.outdir}/portfolio-${target}${isWindows ? ".exe" : ""}`;
  const result = await Bun.build({
    entrypoints: ["src/main.tsx"],
    minify: true,
    // OpenTUI imports every platform's native library dynamically; only the target's is bundled.
    external: nativePackages.filter((name) => name !== native),
    define: { "process.env.NODE_ENV": JSON.stringify("production") },
    compile: { target: `bun-${target}`, outfile },
  });

  if (!result.success) {
    for (const log of result.logs) console.error(log);
    console.error(`\nFailed to build ${target}. If the native package is missing, run \`pnpm install\` so`);
    console.error("pnpm fetches it (see supportedArchitectures in pnpm-workspace.yaml).");
    process.exit(1);
  }

  const size = (Bun.file(outfile).size / 1024 / 1024).toFixed(1);
  console.log(`built ${outfile} (${size} MB)`);
}
