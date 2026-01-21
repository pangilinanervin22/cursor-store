# Build stage
FROM node:20-alpine AS builder

ARG NODE_ENV=production
# Do not set NODE_ENV to production in the builder so devDependencies (like prisma CLI) are installed for build-time tasks

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies including devDependencies needed for build-time tools
RUN npm ci --include=dev --verbose

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy application code
COPY . .

# Build Next.js application with verbose output
RUN npm run build

# Verify build output
RUN ls -la .next/ && if [ ! -d ".next/standalone" ]; then echo "ERROR: .next/standalone not created"; exit 1; fi

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init and curl for healthchecks
RUN apk add --no-cache dumb-init curl

# Copy built application from builder
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/package.json .

# Expose port (Azure Container App default)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "server.js"]
