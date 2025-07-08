FROM node:18-alpine
WORKDIR /app
COPY services/accounts/package*.json ./
RUN npm install
COPY services/accounts .
EXPOSE 4003
CMD ["npm", "run", "dev"]
