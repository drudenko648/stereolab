# syntax=docker/dockerfile:1

# ---------- Build stage ----------
# Matches the local Node 24 toolchain (Vite 8 / TypeScript 6). Debian-based
# (glibc) rather than Alpine to mirror the platform that authored the lockfile.
# This stage is discarded, so it does not affect the final image size.
FROM node:24-slim AS build
WORKDIR /app

# Pin npm to the version that generated package-lock.json. node:24 ships a newer
# npm whose stricter resolver rejects this lockfile, demanding @emnapi/* nodes for
# Tailwind oxide's optional wasm32 fallback (unused on x64, where the native binary
# wins). Matching the lockfile's npm keeps `npm ci` reproducible without editing it.
RUN npm install -g npm@11.6.2

# Install dependencies first so this layer stays cached unless the lockfile changes.
# devDependencies are required because the build runs `tsc -b && vite build`.
COPY package.json package-lock.json ./
RUN npm ci

# Copy the sources and emit the static bundle into /app/dist.
COPY . .
RUN npm run build

# ---------- Runtime stage ----------
# Serve the compiled SPA with nginx — no Node runtime in the final image.
FROM nginx:1.27-alpine AS runtime

# SPA-aware config: client-side fallback plus long-lived asset caching.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Ship only the built assets.
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# Mark the container unhealthy if nginx stops serving the app shell.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://localhost/ || exit 1

# nginx:alpine already runs `nginx -g 'daemon off;'` as its default CMD.
