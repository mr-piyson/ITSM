# Fix: Azure login redirecting to `localhost:3000` instead of the domain

## Symptom

In production, signing in with Microsoft Azure redirected the user to
`http://localhost:3000/app` instead of
`https://iss.bfginternational.com/app`.

## Root cause analysis

The reported symptoms pointed at a number of suspects that turned out to be
**healthy** in production:

| Suspect | Status | Why |
| --- | --- | --- |
| `APP_URL` in the server `.env` | ✅ Correct | It was already `APP_URL="https://iss.bfginternational.com"` |
| Azure `redirect_uri` | ✅ Correct | The `/api/auth/microsoft` route built the OAuth redirect correctly from `APP_URL` |
| `middleware.ts` | ✅ Correct | Its redirects are relative to the request host, not absolute |
| Apache reverse proxy | ✅ Correct | `ProxyPreserveHost On` plus `X-Forwarded-Proto`/`X-Forwarded-Host` headers are all forwarded properly (verified with an isolated echo test) |

The real problem was **Next.js itself**:

- The app runs as `next start -p 3000` behind an Apache `ProxyPass` to
  `127.0.0.1:3000`.
- When a request reaches a Next.js **Route Handler**, `request.url` is built
  from the internal proxy URL and becomes
  `https://localhost:3000/...` — even though the forwarded `Host` /
  `X-Forwarded-Host` / `X-Forwarded-Proto` headers are correct.
- The Azure callback did `NextResponse.redirect(new URL("/app", request.url))`,
  so the browser was told to go to `https://localhost:3000/app` (or
  `http://localhost:3000/app`).

> Note: the app was also sending the *correct* `redirect_uri` to Azure, based on
> `APP_URL`. Thus Azure correctly returned the browser to the public callback
> URL — only the follow-up redirect from the callback to `/app` was broken,
> because it relied on `request.url` instead of `APP_URL`.

## The fix

Build every absolute redirect inside the auth routes from the public base URL
`env.APP_URL` instead of the unreliable `request.url`.

### Files changed

- `src/app/api/auth/microsoft/callback/route.ts`
- `src/app/api/auth/microsoft/route.ts`

### Example

```ts
// Before — broken behind a proxy
return NextResponse.redirect(new URL("/app", request.url));
// request.url == "https://localhost:3000/api/auth/microsoft/callback"
// → Location: https://localhost:3000/app

// After — uses the verified public URL
return NextResponse.redirect(new URL("/app", env.APP_URL));
// env.APP_URL == "https://iss.bfginternational.com"
// → Location: https://iss.bfginternational.com/app
```

All error-redirects in these two route files were updated the same way
(CSRF mismatch, missing code, user-not-found, auth failed, etc.).

## Concept: why this works

OAuth/passwordless redirects must produce **absolute external URLs** the
browser can follow. There are two possible sources for the base URL:

1. **`request.url` / forwarded headers** — depends on how the reverse proxy
   preserves hosts, and (as proven here) Next.js does *not* reliably honour
   them when constructing Route Handler URLs. Fragile.
2. **`env.APP_URL`** — an explicit, validated environment variable that the
   deployment is already required to set correctly for the Azure
   `redirect_uri` to work at all. Deterministic and proxy-independent.

Since the Azure `redirect_uri` was already derived from `env.APP_URL`, using the
same value for every redirect after the callback guarantees the whole flow stays
on the public domain.

## Verification

- `bun run build` passed locally.
- Committed as `45c2cc3` and pushed to `main`.
- Redeployed via `bun run deploy:remote` (server pulls `origin/main`, rebuilds,
  restarts the `itsm.service`).
- Live check on the server — the callback redirect now returns the correct
  origin:

```
curl -sk -D - "https://iss.bfginternational.com/api/auth/microsoft/callback?state=bad&code=bad"
HTTP/1.1 307 Temporary Redirect
location: https://iss.bfginternational.com/auth?error=csrf_validation_failed
```

## Follow-up recommendation

Any **new** code that emits an absolute redirect/URL for an external consumer
(Route Handlers, OAuth callbacks, emails, links in API responses) should build
it from `env.APP_URL`, not `request.url`. When self-hosting Next.js behind a
reverse proxy, treat `request.url` as internal-only.