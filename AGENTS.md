<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Repository layout (multi-app)

```
src/apps/<app>/<module>/   # the module: page.tsx, components/, schema.ts?, router.ts
src/app/<urlPrefix>/...     # GENERATED 3-line route wrappers — never hand-edit
src/apps/<app>/app.config.ts# module manifest (ids, titles, icons, nav, urlPrefix)
src/apps/server-registry.ts # GENERATED tRPC wiring
src/components/ui/          # app-agnostic design system
src/lib/                    # generic infra only (db, auth, mail, csv)
```

Apps: `itsm` → `/itsm/*`, `mes` → `/mes/*`. For single-app deployments set
`urlPrefix: ""` in that app's config and re-run `npm run gen:routes`.
`urlPrefix` is URL/nav metadata only — Next's deployment-wide `basePath`
stays in `next.config.ts`.

### To add a route / module

1. Create `src/apps/<app>/<module>/` with `page.tsx` exporting `Page`, plus
   `router.ts` exporting `router` if the module has tRPC procedures.
2. Add one entry to `src/apps/<app>/app.config.ts` (`id`, `title`, `icon`,
   optional `group`/`section`/`segment`/`routerKey`).
3. Run `npm run gen:routes`. Nav, route wrappers and tRPC registration are derived.
4. Only if the module has non-obvious quirks (data source, external API), add a
   short `README.md` in its folder. Otherwise let the code be the documentation.

### Rules

- Do not edit generated files (`src/app/**/page.tsx` wrappers, `src/apps/server-registry.ts`).
- Keep the app id consistent in folder, `app.config.ts`, URL and tRPC key.
- `typedRoutes` is on: use `Route` types for hrefs; a wrong path fails typecheck.
- Shared UI/routes stay at the root; anything used by one app gets its prefix.
- Verify with `npx tsc --noEmit` before committing.

