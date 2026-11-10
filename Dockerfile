FROM caddy:2-alpine
WORKDIR /srv
COPY . /srv
COPY Caddyfile /etc/caddy/Caddyfile
EXPOSE 8080
CMD ["caddy","run","--config","/etc/caddy/Caddyfile","--adapter","caddyfile"]
