ARG REPO_LOCATION=registry.symper.vn
ARG BASE_VERSION=1.3
FROM ${REPO_LOCATION}/nginx:${BASE_VERSION}
# Copy source code
WORKDIR /src
ADD ./dist /var/www/apps.symper.vn
EXPOSE 80
