# Etapa base
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl

# Dependencias (sin postinstall)
FROM base AS deps
COPY package*.json ./
RUN npm ci --ignore-scripts

# Build
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./            
COPY prisma ./prisma
COPY tsconfig*.json ./
COPY src ./src
RUN npx prisma generate
RUN npm run build

# Runtime
FROM node:20-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY prisma ./prisma
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
