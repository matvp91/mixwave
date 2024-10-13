FROM nginx
WORKDIR /usr/src/app

COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./dist /var/www

ENV PUBLIC_API_ENDPOINT="#"
ENV PUBLIC_STITCHER_ENDPOINT="#"

EXPOSE 52000/tcp