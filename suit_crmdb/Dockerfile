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
    && docker-php-ext-install -j$(nproc) gd zip mysqli pdo pdo_mysql intl curl xml mbstring ldap tidy opcache soap

# Enable Apache rewrite module
RUN a2enmod rewrite

# Use Apache config that allows access to DocumentRoot
COPY suitecrm.conf /etc/apache2/sites-available/000-default.conf

# PHP settings for SuiteCRM (upload size, memory limit)
COPY php-suitecrm.ini /usr/local/etc/php/conf.d/99-suitecrm.ini

# Set work directory
WORKDIR /var/www/html

# Download SuiteCRM 8.7.1
ADD https://github.com/salesagility/SuiteCRM-Core/releases/download/v8.7.1/SuiteCRM-8.7.1.zip /tmp/suitecrm.zip

# Unzip, move contents to DocumentRoot, and set permissions
RUN unzip /tmp/suitecrm.zip -d . \
    && rm /tmp/suitecrm.zip \
    && subdir=$(find . -maxdepth 1 -mindepth 1 -type d | head -1) \
    && if [ -n "$subdir" ]; then \
        for f in "$subdir"/* "$subdir"/.[!.]*; do [ -e "$f" ] && mv "$f" .; done; \
        rmdir "$subdir" 2>/dev/null || true; \
    fi \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html \
    && mkdir -p /var/www/html/extensions \
    && chown www-data:www-data /var/www/html/extensions

CMD ["apache2-foreground"]
