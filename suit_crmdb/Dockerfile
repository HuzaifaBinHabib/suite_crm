FROM php:8.2-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpng-dev libjpeg-dev libfreetype6-dev libzip-dev \
    libicu-dev libcurl4-openssl-dev libxml2-dev \
    libldap2-dev libtidy-dev libonig-dev \
    unzip git \
    && rm -rf /var/lib/apt/lists/*

# Configure and install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-configure ldap --with-libdir=lib/x86_64-linux-gnu/ \
    && docker-php-ext-install -j$(nproc) gd zip mysqli pdo pdo_mysql intl curl xml mbstring ldap tidy opcache

# Enable Apache rewrite module
RUN a2enmod rewrite

# Set work directory
WORKDIR /var/www/html

# Download SuiteCRM 8.7.1
ADD https://github.com/salesagility/SuiteCRM-Core/releases/download/v8.7.1/SuiteCRM-8.7.1.zip /tmp/suitecrm.zip

# Unzip and set permissions
RUN unzip /tmp/suitecrm.zip -d . \
    && rm /tmp/suitecrm.zip \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html
