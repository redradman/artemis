# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm@10.6.2
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:22-alpine AS runtime
WORKDIR /app
RUN npm install -g serve@14
COPY --from=builder /app/dist ./dist
ENV PORT=3000
EXPOSE 3000
CMD ["sh", "-c", "serve -s dist -l ${PORT}"]
