# Dependencies

Pinned versions and the reasoning behind each. Versions were verified against
the npm registry and the React 19 ↔ R3F v9 ↔ drei v10 ↔ three peer-dependency
chain before installing. The install was clean — no `--force`, no
`--legacy-peer-deps`, zero peer conflicts, zero vulnerabilities.

## Compatibility chain (the part that's easy to get wrong)

- `@react-three/fiber@9.6.1` declares `react`/`react-dom` peer `>=19 <19.3` and
  `three >=0.156`. React is therefore **pinned exactly to `19.2.7`** (not
  `^19`) so a future `19.3` can't silently break R3F.
- `@react-three/drei@10.7.7` declares peers `react@^19`, `@react-three/fiber@^9`,
  `three >=0.159` — all satisfied.
- `three@0.184.0` is the latest stable three that R3F v9 accepts; `@types/three`
  tracks it at `0.184.1`.
- `tailwindcss@4.3.0` + `@tailwindcss/vite@4.3.0`: the Vite plugin accepts
  `vite ^8`. Tailwind v4 is CSS-first — configured via `@import "tailwindcss"`
  in `src/index.css` and the plugin in `vite.config.ts`; there is no
  `tailwind.config.js`.
- `vitest@4.1.8` accepts `vite ^8` and `@types/node >=24`, and uses `happy-dom`
  as its DOM environment.

## Runtime

| Package | Version | Why |
| --- | --- | --- |
| react | 19.2.7 | UI library. Pinned exactly to stay `<19.3` for R3F v9. |
| react-dom | 19.2.7 | React DOM renderer; matched to react. |
| three | 0.184.0 | The 3D engine; latest stable accepted by R3F v9. |
| @react-three/fiber | 9.6.1 | React renderer for three.js; the v9 line pairs with React 19. |
| @react-three/drei | 10.7.7 | R3F helpers (OrbitControls, Text, Billboard, Line); v10 targets R3F v9 / React 19. |
| zustand | 5.0.14 | App state store; keeps geometry/UI/3D reading one source of truth. |
| tailwindcss | 4.3.0 | Control-panel styling (v4, CSS-first). |

## Build / tooling

| Package | Version | Why |
| --- | --- | --- |
| vite | 8.0.16 | Dev server and bundler (pre-existing scaffold). |
| @vitejs/plugin-react | 6.0.2 | React Fast Refresh + JSX for Vite. |
| @tailwindcss/vite | 4.3.0 | Tailwind v4 Vite plugin. |
| typescript | 6.0.3 | Type system; `strict` enabled, no `any` in geometry. |
| eslint + typescript-eslint | 10.4.1 / 8.x | Linting (flat config from the scaffold). |

## Testing

| Package | Version | Why |
| --- | --- | --- |
| vitest | 4.1.8 | Unit (geometry) + component/store tests. |
| happy-dom | 20.10.2 | Fast DOM for Vitest (WebGL is covered by Playwright instead). |
| @testing-library/react | 16.3.2 | Render/query React components in tests. |
| @testing-library/dom | 10.4.1 | Peer of testing-library/react. |
| @testing-library/jest-dom | 6.9.1 | DOM matchers (`toBeInTheDocument`, …) via `/vitest` entry. |
| @playwright/test | 1.60.0 | Real-Chromium E2E + WebGL render/export verification. |

## Type packages

`@types/three@0.184.1`, `@types/react@19.2.17`, `@types/react-dom@19.2.3`,
`@types/node@24.13.1`.

## Note on E2E system libraries

Playwright's Chromium needs OS shared libraries (`libnspr4`, `libnss3`,
`libnssutil3`, `libasound2`) that are not preinstalled here. The browser binary
itself is installed via `npx playwright install chromium`.

**With root** (e.g. CI): `sudo npx playwright install-deps chromium`.

**Without root** (this machine): the four libraries are unpacked into a local
`.pw-deps/` folder (gitignored) using `apt-get download` + `dpkg -x`, no sudo
required:

```
mkdir -p .pw-deps/root && cd .pw-deps
apt-get download libnspr4 libnss3 libsqlite3-0 libasound2t64
for d in *.deb; do dpkg -x "$d" root; done
```

`playwright.config.ts` detects `.pw-deps/` and prepends it to
`LD_LIBRARY_PATH`, so `npm run test:e2e` works with no extra environment setup.
The block is a no-op when the folder is absent (e.g. CI with `--with-deps`).
