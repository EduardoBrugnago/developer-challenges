# ---------- build ----------
FROM node:24-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app
ENV NX_DAEMON=false

COPY package*.json ./
COPY apps/api/prisma ./apps/api/prisma
RUN npm ci

COPY . .
RUN npx prisma generate && npx nx build api

# ---------- runtime ----------
FROM node:24-alpine
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/dist/apps/api ./dist

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy --schema=prisma/schema.prisma && node dist/main.js"]
