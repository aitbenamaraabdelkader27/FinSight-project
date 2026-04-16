FROM node:20-alpine AS web-builder

WORKDIR /web

COPY finsight-web/package*.json ./
RUN npm ci

COPY finsight-web/angular.json ./
COPY finsight-web/tsconfig*.json ./
COPY finsight-web/src ./src

RUN npm run build

FROM node:20-alpine

WORKDIR /app

# Copy package files first for better caching
COPY finsight-api/package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy application code (from root context, finsight-api folder)
COPY finsight-api/*.js ./
COPY finsight-api/middleware ./middleware

# Copy Angular frontend build
COPY --from=web-builder /web/dist/finsight-web/browser ./dist/finsight-web/browser

# Expose port
EXPOSE 3000

# Run the server
CMD ["node", "server.js"]
