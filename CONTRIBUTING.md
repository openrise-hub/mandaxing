# Contributing

Thanks for taking the time to contribute to Mandaxing.

## Prerequisites

- Node.js 24.x (pinned via `.nvmrc` and `.node-version`)
- pnpm 12.x (pinned via the `packageManager` field; activate it with Corepack)

## Getting started

```bash
corepack enable
corepack prepare pnpm@12.11.2 --activate
pnpm install
pnpm exec simple-git-hooks
```

Dependency lifecycle scripts are disabled (`ignore-scripts=true` in `.npmrc`) to reduce supply-chain risk, so hooks are not installed automatically. Run `pnpm exec simple-git-hooks` once after cloning. If `pnpm` is not on your PATH, run any of the commands through Corepack instead (for example `corepack pnpm install`); the Git hooks already do this.

## Scripts

| Command            | Description                                          |
| ------------------ | ---------------------------------------------------- |
| `pnpm dev`         | Start the dev server                                 |
| `pnpm build`       | Production build (static output in `build/`)         |
| `pnpm preview`     | Preview the production build                         |
| `pnpm check`       | SvelteKit sync + `svelte-check`                      |
| `pnpm lint`        | Biome lint and format check                          |
| `pnpm format`      | Biome format (writes changes)                        |
| `pnpm test`        | Vitest, single run                                   |
| `pnpm test:unit`   | Vitest, watch mode                                   |

## Branches and commits

- Branch names use `feat/`, `fix/`, or `docs/` prefixes (for example `feat/tone-lab`).
- Commits follow [Conventional Commits](https://www.conventionalcommits.org/), enforced by commitlint: `feat(audio): add YIN threshold parameter`.
- Keep commits small and single-purpose.

## Pull requests

- CI must be green: install, lint, type check, build.
- Fill in the pull request template and link an issue when one exists.
- PRs merge with a merge commit; individual commits are preserved, not squashed.

## Code of Conduct

Participation in this project is governed by [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). Security issues should be reported as described in [SECURITY.md](SECURITY.md).
