import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { parseArgs } from "node:util";
import { App } from "./app.tsx";
import { parseRoute } from "./router.ts";
import { AppProvider, imageModes, type ImageMode } from "./state.tsx";
import { theme } from "./theme.ts";

const usage = `Luis Mario Agreda's portfolio, in your terminal.

Usage: portfolio [path] [options]

  path                  page to open: /, /projects, /experience, /blog, /about,
                        /contact, /blog/<slug>, /blog/category/<name>, or a post slug

Options:
  --images <mode>       auto | blocks | ascii | alt   (default: auto, env PORTFOLIO_IMAGES)
  --no-motion           start with animations paused  (env PORTFOLIO_MOTION=0)
  -h, --help            show this help

When run as an sshd ForceCommand, SSH_ORIGINAL_COMMAND is used as the path,
so \`ssh -t host /blog\` opens the blog.`;

const { values, positionals } = parseArgs({
  args: Bun.argv.slice(2),
  allowPositionals: true,
  options: {
    images: { type: "string" },
    "no-motion": { type: "boolean" },
    help: { type: "boolean", short: "h" },
  },
});

if (values.help) {
  console.log(usage);
  process.exit(0);
}

const imageMode = (values.images ?? process.env.PORTFOLIO_IMAGES ?? "auto") as ImageMode;
if (!imageModes.includes(imageMode)) {
  console.error(`Unknown --images mode "${imageMode}". Expected one of: ${imageModes.join(", ")}`);
  process.exit(1);
}

const motion = !values["no-motion"] && process.env.PORTFOLIO_MOTION !== "0";
const initialRoute = parseRoute(positionals[0] ?? process.env.SSH_ORIGINAL_COMMAND);

const renderer = await createCliRenderer({
  exitOnCtrlC: false,
  targetFps: 30,
  useMouse: true,
  backgroundColor: theme.bg,
  onDestroy: () => process.exit(0),
});

createRoot(renderer).render(
  <AppProvider initialRoute={initialRoute} options={{ imageMode, motion }}>
    <App />
  </AppProvider>,
);
