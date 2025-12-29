# Build stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install a lightweight static server
RUN npm install -g sirv-cli

# Copy built assets from build stage
COPY --from=build /app/dist ./dist

# The app serves on port 80 to match the K8s service configuration
EXPOSE 80

# Start sirv to serve the 'dist' folder
# --single flag handles SPA routing (redirects 404s to index.html)
CMD ["sirv", "dist", "--port", "80", "--single", "--host"]

