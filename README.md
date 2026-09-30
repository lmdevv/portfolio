# Luis Mario Agreda Portfolio

Personal portfolio and resume site built with Astro, React, and TailwindCSS.

## Layout

This is a pnpm workspace. Enter the Nix devshell (`nix develop`, or `direnv allow`) for node, pnpm, and bun.

| Path | What |
| --- | --- |
| `apps/web` | Astro website deployed to Cloudflare |
| `packages/content` | Shared content: profile, experience, projects, contact, articles, drafts, images |

Edit content once in `packages/content`; every client renders from it. Published posts go in
`packages/content/articles`, work in progress in `packages/content/drafts`.

Shared dependency versions (React, TypeScript, ...) live in the `catalog` in `pnpm-workspace.yaml`.

```sh
pnpm install
pnpm dev      # web dev server
pnpm build    # web production build -> apps/web/dist
```
