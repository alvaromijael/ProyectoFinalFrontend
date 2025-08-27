# syntax=docker/dockerfile:1
# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Copy only the manifests we actually use (yarn)
COPY package.json yarn.lock ./

# Install dependencies con yarn
RUN yarn install --frozen-lockfile

# Copy the rest of the app and build
COPY . .
RUN yarn build

# ---- Production stage ----
FROM nginx:alpine

# Copy custom nginx config (SPA history fallback)
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Optional healthcheck
HEALTHCHECK CMD wget -qO- http://localhost/ || exit 1

EXPOSE 80
ENV NODE_ENV=production

# Nginx runs by default as the container's entrypoint
