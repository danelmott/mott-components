# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`@danelmott/mott-design-components` — a React component library (published to GitHub Packages, not npm) providing the "Mott" design system: components styled with Tailwind utility classes composed via `class-variance-authority` (cva) and merged with `tailwind-merge`, plus a shared `src/globals.css` design-token stylesheet (colors, spacing, radii, typography, in both light and `[data-theme="dark"]`/`prefers-color-scheme: dark` variants). It's meant to be installed into Next.js apps.

The project is at an early scaffolding stage: several component folders under `src/` are empty placeholders awaiting implementation, and several existing component files contain only stub function signatures with no real implementation yet.

## Commands

```bash
npm run build   # tsup (bundles root index.js -> dist/index.js, ESM) + copies src/globals.css -> dist/globals.css
```

There is no configured lint, test, or typecheck script yet — do not assume one exists; check `package.json` before referencing one.

## Architecture

- **Entry point**: root `index.js` (not inside `src/`) re-exports each implemented component by name, e.g. `export { default as Button } from './src/button/button.jsx';`. This is tsup's configured entry (`tsup.config.js`) and is what gets bundled to `dist/index.js`, which `package.json`'s `main`/`exports` point to. **When adding a new component, add its re-export here** — nothing is exposed to consumers until it's listed in this file.
- Each component lives in its own folder under `src/<component>/` with the implementation in `<component>.jsx` and an (currently unused/empty) `<component>.js` barrel file. Not every folder under `src/` has files yet — some are empty placeholders for components not started.
- Components that use variants (`Button`, `Toast`, `Input`, `Textarea`, `Select`) import `cva` from `class-variance-authority` and `twMerge` from `tailwind-merge` at the top, and start with a `'use client'` directive — follow this pattern for new components.
- `tsup.config.js`: builds `index.js` to ESM only (`format: ['esm']`), no `.d.ts` generation (`dts: false`), and sets `esbuildOptions(options) { options.jsx = 'automatic' }` since component files use JSX without importing `React` (relies on the automatic `react/jsx-runtime`). `react`/`react-dom`/`react/jsx-runtime` are marked `external` so the library doesn't bundle its own React copy — the consuming app's React (declared as `peerDependencies` in `package.json`) is used instead. tsup requires the `typescript` package to be installed even though this project has no `.ts` files (it's a hard, unconditional `require('typescript')` inside tsup itself) — don't remove that devDependency.
- `src/globals.css` is the single source of design tokens (CSS custom properties on `:root`), built to `dist/globals.css` and importable by consumers via the `./globals.css` subpath export (`@danelmott/mott-design-components/globals.css`). Dark mode is handled two ways: an explicit `[data-theme="dark"]` selector and a `prefers-color-scheme: dark` media query guarded by `:root:not([data-theme="light"])` — keep both in sync when adding new tokens.
- `scripts/uploadCss.js` runs as the package's `postinstall` script. It only acts when it detects it's running from inside a consumer's `node_modules/@danelmott/mott-design-components` (guard based on its own path) — in that case it overwrites the consuming Next.js App Router project's `app/globals.css` with this package's built `dist/globals.css`. When run during local development of this repo itself (not installed as a dependency), it's a no-op by design, so `npm install` here never touches a local `app/` folder.
- Published under the `@danelmott` scope to GitHub Packages (see `.npmrc` / `publishConfig.registry`), not the public npm registry.
