FROM php:8.4-fpm-alpine

# Extensions PHP nécessaires
RUN apk add --no-cache \
        git \
        unzip \
        curl \
    && docker-php-ext-install opcache

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/api

# Copier les dépendances en premier (cache Docker)
COPY composer.json composer.lock ./
RUN composer install --no-scripts --no-autoloader --prefer-dist

# Copier le reste du projet
COPY . .

# Finaliser l'autoloader
RUN composer dump-autoload --optimize

RUN mkdir -p var/cache var/log && chown -R www-data:www-data var/

# Permissions
RUN chown -R www-data:www-data var/
