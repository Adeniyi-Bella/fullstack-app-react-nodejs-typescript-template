# =========================================
# Stage 1: Base (common Node setup)
# =========================================
FROM node:20-alpine AS base

WORKDIR /app
# Required for some Node dependencies on Alpine
RUN apk add --no-cache libc6-compat bash git

# =========================================
# Stage 2: Install Dependencies
# =========================================
FROM base AS deps

COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile

# =========================================
# Stage 3: Build
# =========================================
FROM base AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .


# RUN npm run lint
# RUN npm run test
# npm run test:e2e:headless
RUN npm run build

# =========================================
# Stage 4: Production Runner (Nginx)
# =========================================
FROM nginx:stable-alpine AS runner

# Remove default static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy build output from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8000
EXPOSE 5173

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
