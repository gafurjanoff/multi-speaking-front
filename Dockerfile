# ─────────────────────────────────────────────────────────────────────────────
# Multilevel Speaking Exam - Frontend (Next.js)
# Multi-stage build for production deployment
# ─────────────────────────────────────────────────────────────────────────────

FROM node:20-alpine AS base
WORKDIR /app

# ─── Dependencies Stage ──────────────────────────────────────────────────────
FROM base AS deps
COPY package.json pnpm-lock.yaml* package-lock.json* ./
RUN \
  if [ -f pnpm-lock.yaml ]; then \
    corepack enable pnpm && pnpm install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then \
    npm ci --legacy-peer-deps; \
  else \
    npm install --legacy-peer-deps; \
  fi

# ─── Build Stage ─────────────────────────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_TELEGRAM_BOT_USERNAME
ARG NEXT_PUBLIC_ADMIN_TELEGRAM
ARG NEXT_PUBLIC_ADMIN_PHONE

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=$NEXT_PUBLIC_TELEGRAM_BOT_USERNAME \
    NEXT_PUBLIC_ADMIN_TELEGRAM=$NEXT_PUBLIC_ADMIN_TELEGRAM \
    NEXT_PUBLIC_ADMIN_PHONE=$NEXT_PUBLIC_ADMIN_PHONE \
    NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ─── Production Stage ────────────────────────────────────────────────────────
FROM base AS production

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000 \
    HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
