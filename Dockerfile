FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NODE_MEM=1536
ARG NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY
RUN npx prisma generate
RUN NODE_OPTIONS="--max-old-space-size=${NODE_MEM}" npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.output ./output
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
RUN npm install -g prisma@7.8.0
EXPOSE 3000
CMD ["sh", "-c", "prisma migrate deploy && node ./output/server/index.mjs"]
