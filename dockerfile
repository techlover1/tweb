FROM node:16-slim as builder

RUN mkdir -p /src/
WORKDIR /src/

COPY . /src/

RUN npm install --legacy-peer-deps

RUN npm run build

FROM nginx:alpine AS prod
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder ./src/public /usr/share/nginx/html
