FROM node:18-alpine

# 1. Set working directory
WORKDIR /app

# 2. Copy package.json + lock and install deps
COPY frontend/package*.json ./
RUN npm install

# 3. Copy all frontend code
COPY frontend ./

# 4. Override CRA default env loading by renaming env file
RUN cp .env.docker .env.development

# 5. Expose port (optional but good practice)
EXPOSE 3000

# 6. Start the dev server
CMD ["npm", "start"]
