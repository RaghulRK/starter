# Use official Node.js base image
FROM node:18

# Set working directory inside container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all project files to container
COPY . .

# Set environment variable for production
ENV NODE_ENV=production

# Expose app port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]