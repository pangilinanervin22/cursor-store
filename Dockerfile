# Build stage
FROM node:20-alpine AS builder

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies with verbose output
RUN npm ci --verbose

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

# Set default environment variables (can be overridden at runtime)
ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL=""
ENV AUTH_USERNAME="admin"
ENV AUTH_PASSWORD="admin"
ENV AUTH_SECRET="change-me-in-production"
ENV UPLOADTHING_TOKEN=""
ENV NEXT_PUBLIC_APP_URL="http://localhost:3000"

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
