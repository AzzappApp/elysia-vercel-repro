# Elysia + Vercel — workspace bundling repro

This repository is a minimal-but-realistic reproduction of an issue we hit when
deploying an [Elysia](https://elysiajs.com/) API to Vercel with the **default
Elysia framework preset** in a pnpm monorepo.

## Symptom

When the project is deployed using the Vercel-detected Elysia preset (i.e. no
custom build script), the function is built but **third-party dependencies that
are imported transitively through workspace packages are not bundled into the
function output**. At cold-start, the function crashes with `Cannot find module`
on packages such as:

- `@planetscale/database` (imported from `@repro/data` → `database/drizzleClient.ts`)
- `@adobe/fetch` (idem)
- `drizzle-orm/planetscale-serverless` (idem)
- `lodash/pickBy` (imported from `@repro/data` → `queries/userQueries.ts`)
- `libphonenumber-js` (imported from `@repro/data` → `helpers/phone.ts`)
- `@axiomhq/js` (imported from `@repro/service` → `loggerService.ts`)
- `bcrypt`, `jose`, `jsonwebtoken` (imported from `@repro/service`)

These packages are declared as `dependencies` of the workspace packages
(`@repro/data`, `@repro/service`) that the API imports. They are correctly
installed by `pnpm install` at build time, but the Vercel Build Output that the
Elysia preset produces does not include them in the function's
`node_modules`.

The API's own direct dependencies (`elysia`, `@elysiajs/cors`,
`@elysiajs/openapi`, `@sentry/node-core`, `@vercel/og`, `react`, `react-dom`,
`sharp`, `zod`) are bundled correctly. **Only the transitive dependencies
coming from workspace packages are missing.**

## Stack

Same as our private project:

- pnpm workspaces + turborepo
- [`elysia`](https://elysiajs.com/) running on **Bun** (no `@elysiajs/node`
  adapter — we want the default Bun + Elysia path that Vercel's framework
  preset detects)
- [`@elysiajs/openapi`](https://elysiajs.com/plugins/openapi) for the `/docs`
  endpoint
- [`drizzle-orm`](https://orm.drizzle.team/) + `drizzle-orm/planetscale-serverless`
- [`@planetscale/database`](https://github.com/planetscale/database-js)
- [`@adobe/fetch`](https://github.com/adobe/fetch) (HTTP/2 fetch client used as
  the PlanetScale `fetch` override)
- [`@sentry/node-core/light`](https://docs.sentry.io/) for error reporting
- [`@vercel/og`](https://vercel.com/docs/og-image-generation) + `react`/`react-dom`
  for dynamic OG images
- [`sharp`](https://sharp.pixelplumbing.com/) for image generation
- [`@axiomhq/js`](https://axiom.co) for structured logging
- `bcrypt`, `jose`, `jsonwebtoken`, `lodash`, `libphonenumber-js` — same set of
  utility deps the production API ships

The API package depends on three workspace packages:

```
packages/
  api/        ← Elysia + routes (this is what Vercel deploys)
  service/    ← business logic (auth, user)
  data/       ← drizzle + planetscale client + queries
  shared/     ← errors, types
```

The dependency chain is:

```
@repro/api  →  @repro/service  →  @repro/data  →  @planetscale/database, @adobe/fetch, drizzle-orm
                              \→  @repro/data
            →  @repro/data
            →  @repro/shared
```

## Important: TypeScript path aliases

`packages/api/tsconfig.json` declares `paths` that point workspace imports
**directly at the source files**, bypassing the workspace package's
`package.json` exports:

```json
"paths": {
  "@repro/data/*":    ["../data/src/*"],
  "@repro/service/*": ["../service/src/*"],
  "@repro/shared/*":  ["../shared/src/*"]
}
```

This mirrors what we have in our private project. We believe this is what
triggers the bug: Bun honors `tsconfig.json` `paths` at runtime, so an import
like `@repro/data/queries/userQueries` is resolved to
`packages/data/src/queries/userQueries.ts`. Vercel's Elysia preset then
transpiles that file in-place to `packages/data/src/queries/userQueries.cjs`
without bringing the matching `packages/data/node_modules/` along.

Without these `paths`, the same imports would resolve via each workspace's
`package.json` `exports` map, and the bug does **not** occur. The repro is
designed to demonstrate the difference.

## Project layout

```
elysia-vercel-repro/
├── package.json               root workspace
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
└── packages/
    ├── api/                   ← Vercel root directory
    │   ├── package.json
    │   ├── vercel.json        ← framework: "elysia", no custom build
    │   ├── .env.example
    │   └── src/
    │       ├── index.ts        ← `export default app` (Elysia entry)
    │       ├── devServer.ts
    │       ├── middleware/
    │       └── routes/
    ├── service/
    ├── data/
    └── shared/
```

## Local reproduction

```bash
pnpm install
cd packages/api
cp .env.example .env
pnpm dev    # runs `bun --hot src/devServer.ts`
# → Elysia API listening on http://localhost:3000 (Bun)

curl http://localhost:3000/availabilityCheck
# {"message":"ok"}
```

> Requires [Bun](https://bun.sh/) installed locally (`>= 1.3`).

The local dev server works because Bun resolves modules from the workspace's
pnpm-installed `node_modules`. The bug only appears on Vercel.

## Vercel deployment (to reproduce the bug)

When importing this repo into Vercel:

1. **Root Directory**: `packages/api`
2. **Framework Preset**: Elysia (auto-detected)
3. **Install Command**: leave empty (Vercel will run `pnpm install` from the
   monorepo root automatically) — or override to `pnpm install --frozen-lockfile`
   from the repo root
4. **Build Command**: leave empty (Elysia preset handles it)
5. **Output Directory**: leave empty

On the first deploy, the function builds successfully but invoking any route
fails:

```
GET /availabilityCheck
→ 500 INTERNAL_SERVER_ERROR
   FUNCTION_INVOCATION_FAILED

(function logs)
Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@adobe/fetch' imported
from /var/task/.../node_modules/@repro/data/src/database/drizzleClient.js
```

…or similar errors on `@planetscale/database`, `drizzle-orm/planetscale-serverless`,
`bcrypt`, `jsonwebtoken` depending on which route is hit first.

### What the error tells us

The actual error message we observed is:

```
Cannot find module '@planetscale/database'
  from '/var/task/packages/data/src/database/drizzleClient.cjs'
```

Two things to notice:

1. **The deployed file is `drizzleClient.cjs`** — but the source is `.ts` and
   `packages/data/package.json` declares `"type": "module"`. The Vercel/Elysia
   bundler is transpiling each workspace TS file individually to **CommonJS**
   instead of honoring the workspace's `"type": "module"`.
2. **The file lives under `packages/data/src/...`** — the bundler preserves
   the workspace directory layout in the deployed function but does **not**
   include the matching `packages/data/node_modules/` next to it.

CommonJS resolution from `/var/task/packages/data/src/database/drizzleClient.cjs`
walks up looking for `@planetscale/database`:

```
/var/task/packages/data/src/database/node_modules/  ❌
/var/task/packages/data/src/node_modules/           ❌
/var/task/packages/data/node_modules/               ❌  ← missing!
/var/task/packages/node_modules/                    ❌
/var/task/node_modules/                             ❌  (it's a dep of @repro/data, not @repro/api)
```

`@planetscale/database` is declared in `packages/data/package.json` (workspace
dependency), so it's never present at the API root's `node_modules`. And
because the workspace's own `node_modules/` directory is missing from the
deployed bundle, the lookup fails everywhere.

### Expected behaviour

The Vercel Elysia preset should do one of the following:

- **Bundle** the workspace `.ts` files into the API entry so that imports are
  resolved at build time (then no `node_modules` traversal is needed for
  workspace transitive deps), **or**
- Preserve the workspace's `node_modules/` next to its source files in the
  deployment, **or**
- Hoist every transitive workspace dependency to the root `node_modules/`.

It should also honor `"type": "module"` from each workspace `package.json`
when transpiling its files — the deployed `drizzleClient.cjs` should be
`drizzleClient.mjs`.

### Actual behaviour

- Workspace `.ts` files are transpiled in-place to `.cjs` (ignoring the
  `"type": "module"` of the workspace package).
- Only direct dependencies of `packages/api/package.json` are present in
  `/var/task/node_modules/`.
- The `packages/data/node_modules/` and `packages/service/node_modules/`
  directories are absent from the deployment.
- As a result, every dependency declared by a non-API workspace package
  (`@planetscale/database`, `@adobe/fetch`, `lodash`, `libphonenumber-js`,
  `@axiomhq/js`, `bcrypt`, `jose`, `jsonwebtoken`) fails to resolve at
  cold-start.

## Workaround we currently use in production

We bypass the Vercel Elysia preset entirely and ship our own `.vercel/output/`
directory using the Vercel Build Output API v3:

1. `tsdown` bundles `src/index.ts` into a single ESM bundle, externalizing every
   non-workspace dependency.
2. A custom `build-vercel-output.mjs` script walks the bundle's imports,
   resolves each external package from the pnpm store, and copies it (along
   with its dependencies) into `.vercel/output/functions/index.func/node_modules/`.
3. The custom build emits a `.vercel/output/config.json` and a
   `.vc-config.json` that tells Vercel how to launch the function.

This works but defeats the purpose of the framework preset, and we would prefer
to use the official Elysia integration once the bundling issue is fixed.

## Repro env

- Bun 1.3+ (matches Vercel's Bun runtime when the Elysia preset is detected)
- pnpm 9.15.0
- elysia 1.4.x
- drizzle-orm 0.40.x
- @adobe/fetch 4.3.x
- @planetscale/database 1.20.x
