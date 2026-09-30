# Luis Mario Agreda Portfolio

Personal portfolio and resume, as a website and as a terminal app you can SSH into.

## Layout

This is a pnpm workspace. Enter the Nix devshell (`nix develop`, or `direnv allow`) for node, pnpm, and bun.

| Path | What |
| --- | --- |
| `apps/web` | Astro + React + TailwindCSS website deployed to Cloudflare |
| `apps/ssh` | OpenTUI + React terminal client, compiled to a single binary ([README](apps/ssh/README.md)) |
| `packages/content` | Shared content: profile, experience, projects, contact, articles, drafts, images |

Edit content once in `packages/content`; every client renders from it. Published posts go in
`packages/content/articles`, work in progress in `packages/content/drafts`.

Shared dependency versions (React, TypeScript, ...) live in the `catalog` in `pnpm-workspace.yaml`.

```sh
pnpm install
pnpm dev          # web dev server
pnpm build        # web production build -> apps/web/dist
pnpm preview      # serve the web build
pnpm dev:ssh      # terminal client from source (dev:ssh:drafts includes drafts)
pnpm build:ssh    # terminal binary -> apps/ssh/dist/portfolio-<os>-<arch>
pnpm typecheck
```
