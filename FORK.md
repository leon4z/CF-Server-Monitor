# Personal fork

Fork: https://github.com/leon4z/CF-Server-Monitor

Upstream: https://github.com/huilang-me/CF-Server-Monitor

Maintained branch: `personal`. `main` is an upstream baseline, currently
`1be24f0eabdcc2d06c215c45258382b02e438b49` (2026-11-13).

## Changes

1. Self-host the original JetBrains Mono v24 font subsets with their original
   weights and Unicode ranges. Vite produces content-hashed local assets;
   `/files/jetbrains-mono-OFL.txt` includes the copyright and SIL OFL. Existing
   `font-display: swap` and the default font stack are retained.
2. `/api/config` reads cached update metadata without contacting GitHub.
   Authenticated update checks use `/api/version` after the application mounts.
   Update notices remain reactive; GitHub failure cannot prevent startup.
   The admin view uses the same optional endpoint instead of its direct-GitHub
   fallback; login, initialization, site switching and refresh do not await it.
   Concurrent checks for one site share a request, and late responses from an
   older site cannot overwrite the active site version.
   This endpoint retains authentication, Turnstile and CORS enforcement and
   does not grant administrative access to the read-only App password.
3. Preload the homepage code and likely locale alongside startup configuration.
   Preloading does not mount a page, request server data, persist preferences,
   or bypass authentication. The returned site settings and saved preferences
   still determine the actual language and theme before mounting.

The existing WebSocket unit test disables Vite's application config so it
cannot install a developer certificate as a side effect of running tests.

## Verification

```sh
npm ci
npm run test:all
npm run build:frontend
```

The new regression test holds both GitHub requests pending while requesting
`/api/config`, then verifies that the background request still updates the
cache and cannot be used anonymously or with a read-only App password.
The locale test checks that speculative loading changes no saved preference
or language-change event and does not override the final site language.

Browser smoke checks use a loopback-only static server, synthetic API data,
and blocked external HTTP requests. They cover authenticated, public and
private-denied access; hold the optional version response until after all four
cards appear; verify the later update notice; and verify that homepage/locale
chunks begin loading before a delayed configuration response completes.
No real monitoring credentials or host inventory are used in these checks.

## Deployment and maintenance

This branch is a tested candidate, **not a deployment**. No production
configuration, credentials, binding IDs, domain, host inventory or database
export is stored here. This fork's Actions are currently disabled in repository
settings, so pushing this branch does not deploy Workers or Pages or sync main.
No workflow or upstream PR has been triggered by preparing this branch.

Before a future deployment, review the upstream delta as well as these patches,
use the existing deployment's bindings and secrets, and keep its data intact.
A local build is not evidence of production latency improvement. Deployment
requires a separate explicit instruction.

To take upstream changes, fetch `upstream`, merge the reviewed upstream commit
into `personal`, resolve conflicts without dropping these patches, then repeat
the tests and build. Do not automatically reset `personal` to upstream or enable
upstream sync/deployment workflows as part of updating source.
