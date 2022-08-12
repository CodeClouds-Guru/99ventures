FROM node:17 as builder
WORKDIR /usr/src/frontend
COPY package*.json ./
RUN npm install --legacy-peer-deps
RUN mkdir node_modules/.cache && chmod -R 777 node_modules/.cache
COPY . .
RUN npm run build

FROM nginx:latest
EXPOSE 3000
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html