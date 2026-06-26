FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 4000
# Run pending migrations (idempotent); start app even if migration reports an issue,
# so the container stays up and the migration outcome is visible in logs.
CMD ["sh", "-c", "npm run migration:run:prod || echo '[start] MIGRATION step returned non-zero (continuing)'; exec node dist/main"]
