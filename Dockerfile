# Multi-stage
# 1) Node image for building frontend assets
# 2) nginx stage to serve frontend assets

# Name the node stage "builder"
FROM node:18 AS builder

# Set working directory
WORKDIR /app

# Copy all files from current directory to working dir in image
COPY . .

# Install node modules and build assets
RUN npm install && npm run build

# nginx state for serving content
FROM nginx:alpine

# Copy default conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Set working directory to nginx asset directory
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy static assets from builder stage
COPY --from=builder /app/dist .

# Containers run nginx with global directives and daemon off
ENTRYPOINT ["nginx","-g", "daemon off;"]

# For build: sudo docker build -t container_name .
# For run:  sudo docker run --rm -it -p 8080:80 container_name  
# For run deploy:  sudo docker run -d --name horarios  --restart unless-stopped -it -p 8180:80 container_name