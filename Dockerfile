FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_TELEGRAM_BOT_USERNAME
ARG NEXT_PUBLIC_ADMIN_TELEGRAM
ARG NEXT_PUBLIC_ADMIN_PHONE
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=$NEXT_PUBLIC_TELEGRAM_BOT_USERNAME
ENV NEXT_PUBLIC_ADMIN_TELEGRAM=$NEXT_PUBLIC_ADMIN_TELEGRAM
ENV NEXT_PUBLIC_ADMIN_PHONE=$NEXT_PUBLIC_ADMIN_PHONE
RUN npm run build

FROM node:20-alpine
RUN adduser -D appuser
WORKDIR /app
COPY --from=builder --chown=appuser:appuser /app/.next/standalone ./
COPY --from=builder --chown=appuser:appuser /app/.next/static ./.next/static
COPY --from=builder --chown=appuser:appuser /app/public ./public
USER appuser
EXPOSE 3000
CMD ["node", "server.js"]