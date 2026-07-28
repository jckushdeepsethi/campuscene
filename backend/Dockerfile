# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci
RUN npm run prisma:generate

COPY tsconfig.json ./
COPY src ./src/

RUN npm run build

# Stage 2: Production runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/dist ./dist

EXPOSE 4000

CMD ["node", "dist/server.js"]
