FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy app code
COPY . .

# Build Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
