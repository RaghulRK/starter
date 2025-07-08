FROM node:18-alpine
WORKDIR /app
COPY services/users/package*.json ./
RUN npm install
COPY services/users .
EXPOSE 4002
CMD ["npm", "run", "dev"]
