FROM node:20-alpine

WORKDIR /app

# Copy dependency declarations
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application source code
COPY . .

# Expose backend port
EXPOSE 5000

# Set environment to production and start app
ENV NODE_ENV=production
CMD ["npm", "start"]
