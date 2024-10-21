FROM nginx
WORKDIR /usr/src/app

COPY ./nginx/default.conf.template /etc/nginx/templates/
COPY ./dist /var/www

ENV PUBLIC_API_ENDPOINT="#"
ENV PUBLIC_STITCHER_ENDPOINT="#"

EXPOSE 52000/tcp