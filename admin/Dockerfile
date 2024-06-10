FROM node:17 as build
LABEL version="1.0"
LABEL description="Base image for react app"
LABEL maintainer = ["sourabh.das@codeclouds.in"]

WORKDIR /app

COPY ["package.json", "./"]

RUN npm install --legacy-peer-deps

COPY . ./


RUN npm run build


# production environment
FROM nginx:1.19.10-alpine
COPY --from=build /app/build /usr/share/nginx/html

COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]
