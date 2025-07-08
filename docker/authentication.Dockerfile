FROM node:18-alpine
WORKDIR /app
COPY services/authentication/package*.json ./
RUN npm install
COPY services/authentication .
EXPOSE 4001
CMD ["npm", "run", "dev"]
