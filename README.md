# Luis Mario Agreda Portfolio

Personal portfolio and resume, as a website and as a terminal app you can SSH into.

## Layout

This is a pnpm workspace. Enter the Nix devshell (`nix develop`, or `direnv allow`) for node, pnpm, and bun.

| Path               | What                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------- |
| `apps/web`         | Astro + React + TailwindCSS website deployed to Cloudflare                                  |
| `apps/ssh`         | OpenTUI + React terminal client, compiled to a single binary ([README](apps/ssh/README.md)) |
| `packages/content` | Shared content: profile, experience, projects, contact, articles, drafts, images            |

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

## Linting and formatting

Run these commands from the workspace root inside the Nix devshell:

```sh
pnpm lint          # check all apps and packages with Oxlint
pnpm lint:fix      # apply safe lint fixes
pnpm format        # format supported files with Oxfmt
pnpm format:check  # check formatting without writing files
pnpm check         # lint, formatting, and workspace type checks
```

The shared configuration lives in `.oxlintrc.json` and `.oxfmtrc.json`. Oxlint enables
correctness and React rules, with JSX accessibility rules limited to the web app because
the SSH app uses terminal elements. Oxfmt uses two spaces, double quotes, semicolons, and
a 100-column print width. Both tools exclude dependencies, build output, and generated
SSH content, and respect the workspace's `.gitignore` files.

The SSH app disables `react/refs` and `react/set-state-in-effect` to retain its existing
ref-backed keyboard handler and image/motion state resets. React hook order and dependency
checks remain enabled in both apps.

[Oxc's Astro support](https://oxc.rs/compatibility.html) is currently limited: Oxlint checks
JavaScript/TypeScript script regions in `.astro` files without template linting, and Oxfmt
skips `.astro` files because Astro formatting is not supported yet. Type checking remains
a separate step; `pnpm typecheck` checks the web app with `astro check` (including `.astro`
and React components), and the SSH app and shared content with TypeScript. To check only
the web app, run `pnpm --filter @portfolio/web typecheck`.
