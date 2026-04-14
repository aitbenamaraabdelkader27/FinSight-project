FROM node:20-alpine

WORKDIR /app

# Copy package files first for better caching
COPY finsight-api/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code (from root context, finsight-api folder)
COPY finsight-api/*.js ./
COPY finsight-api/middleware ./middleware

# Copy Angular frontend build
COPY finsight-web/dist/finsight-web/browser ./dist/finsight-web/browser

# Expose port
EXPOSE 3000

# Run the server
CMD ["node", "server.js"]