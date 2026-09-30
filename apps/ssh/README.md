# @portfolio/ssh

The portfolio as a terminal app: same pages, projects, experience, and posts as the website,
built with [OpenTUI](https://opentui.com) + React on Bun, and compiled to a single binary meant
to be served over SSH.

## Scripts

| Script       | What it does                                                                       |
| ------------ | ---------------------------------------------------------------------------------- |
| `content`    | Snapshot published posts from `@portfolio/content` into `src/generated/content.ts` |
| `dev`        | `content`, then run `src/main.tsx` from source with Bun                            |
| `dev:drafts` | Same, including `packages/content/drafts`                                          |
| `build`      | `content`, then compile `dist/portfolio-<os>-<arch>` for this machine              |
| `build:all`  | `content`, then compile linux, macOS, and Windows (`.exe`), x64 + arm64            |
| `typecheck`  | `content`, then `tsc`                                                              |

Arguments after `--` reach the app, e.g. `pnpm --filter @portfolio/ssh dev -- /blog --images ascii`.
`bun scripts/build.ts --target linux-x64 --outdir out` compiles one target from whatever
`src/generated/content.ts` currently holds.

## Usage

```
portfolio [path] [--images auto|blocks|ascii|alt] [--[no-]motion]
```

`path` accepts the same URLs as the website (`/blog`, `/blog/<slug>`, `/blog/category/<name>`)
or a bare post slug. When the binary runs as an sshd `ForceCommand`, it reads
`SSH_ORIGINAL_COMMAND`, so `ssh -t host /blog` opens the blog.

| Key                          | Action                                             |
| ---------------------------- | -------------------------------------------------- |
| `1`-`6`, `tab` / `shift+tab` | switch pages                                       |
| `j` `k` / arrows             | scroll or move the selection                       |
| `h` `l` / arrows             | buttons on the home page, categories on the blog   |
| `enter`                      | open the selected item or copy its link            |
| `y` / `Y`                    | copy the repo / live link (OSC 52, works over SSH) |
| `i`                          | cycle image mode                                   |
| `m`                          | toggle motion                                      |
| `esc` / `backspace`          | back                                               |
| `?`                          | help                                               |
| `q` / `ctrl+c`               | quit                                               |

## Images

Pick a mode with `--images`, `PORTFOLIO_IMAGES`, or `i` at runtime:

- `auto`: Kitty graphics or Sixel when the terminal supports them, Unicode quadrant blocks otherwise
  (always blocks under tmux). `OPENTUI_IMAGE_PROTOCOL=kitty|sixel|blocks` forces one.
- `blocks`: Unicode quadrant blocks everywhere.
- `ascii`: character-ramp ASCII art, tinted with the image's colors.
- `alt`: a card with the image's alt text.

## Content

`scripts/generate-content.ts` writes posts to `src/generated/content.ts` (gitignored) with an
`import ... with { type: "file" }` per image, so `bun build --compile` embeds posts and images in
the binary. Drafts are embedded only with `--drafts`. Posts whose frontmatter fails the shared
schema are skipped with a warning.

## Motion and bandwidth

The warp backgrounds redraw a few times a second, which costs roughly 40-90 KB/s over SSH. Motion
therefore starts off when `SSH_CONNECTION`, `SSH_CLIENT`, or `SSH_TTY` is set; `m`, `--motion`, or
`PORTFOLIO_MOTION=1` turn it on.
