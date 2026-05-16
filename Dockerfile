# ── Stage 1: build the React client ──────────────────────────────────────────
FROM node:20-slim AS client-build

WORKDIR /build/client

COPY client/package.json client/package-lock.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

# ── Stage 2: production server ────────────────────────────────────────────────
FROM node:20-slim

WORKDIR /app

# The server's own package.json lives inside server/, not the repo root.
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev

# Copy server source
COPY server/ ./

# Copy the built React app into server/public (where index.js serves static files).
# __dirname in index.js resolves to /app, so static path is /app/public.
COPY --from=client-build /build/client/dist ./public

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "index.js"]
