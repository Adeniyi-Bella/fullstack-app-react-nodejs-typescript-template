# Stage 1: Base (Dependencies + Node)
FROM node:20-slim AS base 
WORKDIR /app

# Install OpenSSL (required)
RUN apt-get update -y && apt-get install -y openssl ca-certificates

# Stage 2: Dependencies (With Build Tools)
FROM base AS deps
WORKDIR /app

# INSTALL BUILD TOOLS HERE
# specific libraries are needed to compile native addons
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    build-essential

COPY package.json package-lock.json ./

# Install dependencies (will now compile native addons correctly)
RUN npm ci

# Stage 3: Builder
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the project
RUN npm run build

# Stage 4: Production Runner
FROM base AS runner
WORKDIR /app

# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 8080

CMD ["node", "dist/server.js"]