# Elysia + Vercel — workspace bundling repro

This repository is a minimal-but-realistic reproduction of an issue we hit when
deploying an [Elysia](https://elysiajs.com/) API to Vercel with the **default
Elysia framework preset** in a pnpm monorepo.

## Symptom

When the project is deployed using the Vercel-detected Elysia preset (i.e. no
custom build script), the function is built but **third-party dependencies that
are imported transitively through workspace packages are not bundled into the
function output**. At cold-start, the function crashes with `ERR_MODULE_NOT_FOUND`
on packages such as:

- `@adobe/fetch` (imported from `@repro/data` → `database/drizzleClient.ts`)
- `@planetscale/database` (idem)
- `drizzle-orm/planetscale-serverless` (idem)
- `bcrypt` and `jsonwebtoken` (imported from `@repro/service`)

These packages are declared as `dependencies` of the workspace packages
(`@repro/data`, `@repro/service`) that the API imports. They are correctly
installed by `pnpm install` at build time, but the Vercel Build Output that the
Elysia preset produces does not include them in the function's
`node_modules`.

The API's own direct dependencies (`elysia`, `@elysiajs/cors`, `@elysiajs/node`,
`zod`) are bundled correctly. Only the transitive dependencies coming from
workspace packages are missing.

## Stack

Same as our private project:

- pnpm workspaces + turborepo
- [`elysia`](https://elysiajs.com/) running on **Bun** (no `@elysiajs/node`
  adapter — we want the default Bun + Elysia path that Vercel's framework
  preset detects)
- [`drizzle-orm`](https://orm.drizzle.team/) + `drizzle-orm/planetscale-serverless`
- [`@planetscale/database`](https://github.com/planetscale/database-js)
- [`@adobe/fetch`](https://github.com/adobe/fetch) (HTTP/2 fetch client used as
  the PlanetScale `fetch` override)
- `bcrypt`, `jsonwebtoken` for the auth service

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

### Expected behaviour

The Vercel Elysia preset should bundle (or at least include in the function's
`node_modules`) every package transitively required by the entry, regardless of
whether it is declared on the entry package itself or on a workspace package.

### Actual behaviour

Only direct dependencies of `packages/api/package.json` are present in the
function's `node_modules`. Dependencies declared in `packages/data/package.json`
or `packages/service/package.json` are missing.

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
