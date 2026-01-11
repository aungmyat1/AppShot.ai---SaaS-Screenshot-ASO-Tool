##
## Next.js (apps/web) — multi-stage, production-ready.
## Build context is repo root.
##

FROM node:20-alpine AS deps
WORKDIR /repo

# Needed for some native deps in Node land (kept minimal)
RUN apk add --no-cache libc6-compat

# Workspace-aware dependency install (maximize cache hits)
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/types/package.json ./packages/types/package.json
COPY packages/ui/package.json ./packages/ui/package.json
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /repo
RUN apk add --no-cache libc6-compat
COPY --from=deps /repo/node_modules ./node_modules
COPY . .

WORKDIR /repo/apps/web
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- Production runtime (standalone) ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Next.js standalone output (requires next.config output:"standalone")
COPY --from=builder /repo/apps/web/.next/standalone ./
COPY --from=builder /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /repo/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "apps/web/server.js"]

# ---- Dev image (hot reload) ----
FROM node:20-alpine AS dev
WORKDIR /repo
RUN apk add --no-cache libc6-compat
COPY --from=deps /repo/node_modules ./node_modules
COPY . .
WORKDIR /repo/apps/web
ENV NODE_ENV=development
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]

