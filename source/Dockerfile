# ------------------------------
# Stage 1: Application Building
# ------------------------------

# Import NodeJS image
FROM --platform=linux/amd64 node:current-alpine as build

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# ------------------------------
# Stage 2: Application Running
# ------------------------------

# If you are building your code for production
# RUN npm ci --only=production

# Expose Port --> Debug
# EXPOSE 8080

# Run application
CMD [ "node", "app.js" ]