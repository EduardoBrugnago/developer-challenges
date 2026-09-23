FROM node:24-alpine AS builder
WORKDIR /app
ENV NX_DAEMON=false

COPY package*.json ./
COPY apps/api/prisma ./apps/api/prisma
RUN npm ci

COPY . .
RUN npx nx build web

FROM nginx:1.27-alpine
COPY --from=builder /app/dist/apps/web /usr/share/nginx/html
COPY infra/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
