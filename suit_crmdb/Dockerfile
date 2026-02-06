FROM php:8.2-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpng-dev libjpeg-dev libfreetype6-dev libzip-dev \
    libicu-dev libcurl4-openssl-dev libxml2-dev \
    libldap2-dev libtidy-dev libonig-dev \
    unzip git iputils-ping net-tools \
    && rm -rf /var/lib/apt/lists/*

# Configure and install PHP extensions (incl. soap for SuiteCRM)
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-configure ldap --with-libdir=lib/x86_64-linux-gnu/ \
    && docker-php-ext-install -j$(nproc) gd zip mysqli pdo pdo_mysql intl curl xml mbstring ldap tidy opcache soap

# Enable Apache rewrite module
RUN a2enmod rewrite

# Apache & PHP config (DocumentRoot public/, PHP limits)
COPY suitecrm.conf /etc/apache2/sites-available/000-default.conf
COPY php-suitecrm.ini /usr/local/etc/php/conf.d/99-suitecrm.ini

# Set work directory
WORKDIR /var/www/html

# Download SuiteCRM 8.7.1
ADD https://github.com/salesagility/SuiteCRM-Core/releases/download/v8.7.1/SuiteCRM-8.7.1.zip   /tmp/suitecrm.zip

# Unzip, move contents to DocumentRoot, create extensions dir, set permissions
RUN unzip /tmp/suitecrm.zip -d . \
    && rm /tmp/suitecrm.zip \
    && subdir=$(find . -maxdepth 1 -mindepth 1 -type d | head -1) \
    && if [ -n "$subdir" ]; then \
        for f in "$subdir"/* "$subdir"/.[!.]*; do [ -e "$f" ] && mv "$f" .; done; \
        rmdir "$subdir" 2>/dev/null || true; \
    fi \
    && mkdir -p /var/www/html/extensions \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# ============================================================
# FIX PHP 8.2 DEPRECATION WARNINGS & STRICT TYPE ERRORS
# ============================================================

# Fix 1: Smarty intval deprecation - register the custom modifier
RUN mkdir -p /var/www/html/include/Smarty/plugins \
    && echo '<?php \
function smarty_modifier_intval($string) { \
    return intval($string); \
}' > /var/www/html/include/Smarty/plugins/modifier.intval.php \
    && chown www-data:www-data /var/www/html/include/Smarty/plugins/modifier.intval.php

# Fix 2: Undefined array key "name" in SearchForm2.php line 634
RUN sed -i 's/\$this->name = \$arr\[.name.\];/\$this->name = \$arr["name"] ?? "";/g' /var/www/html/public/legacy/include/SearchForm/SearchForm2.php

# Fix 3: strtolower() passing null in AssignGroups.php line 151
RUN sed -i 's/strtolower(\$groupFocus->name)/strtolower(\$groupFocus->name ?? "")/g' /var/www/html/public/legacy/modules/SecurityGroups/AssignGroups.php \
    && sed -i 's/strtolower(\$category)/strtolower(\$category ?? "")/g' /var/www/html/public/legacy/modules/SecurityGroups/AssignGroups.php

# Fix 4: Array to string conversion in ListViewData.php line 539
RUN sed -i 's/\$output = \$value;/\$output = is_array(\$value) ? implode(", ", \$value) : \$value;/g' /var/www/html/public/legacy/include/ListView/ListViewData.php

# Fix 5: OAuth2 CryptKey path - use filesystem path (no file://) so file_get_contents() works
RUN sed -i "s/'file:\/\/%s\/%s'/'%s\/%s'/g" /var/www/html/public/legacy/Api/V8/Config/services/middlewares.php

# Fix 6: Slim Collection PHP 8.2 ArrayAccess/Countable return type deprecations (perl handles [] reliably)
RUN SLIM="/var/www/html/vendor/slim/slim/Slim/Collection.php" \
    && perl -i -pe "s/^(\s+)(public function offsetExists)/\$1#\[\\ReturnTypeWillChange\]\n\$1\$2/" "$SLIM" \
    && perl -i -pe "s/^(\s+)(public function offsetGet)/\$1#\[\\ReturnTypeWillChange\]\n\$1\$2/" "$SLIM" \
    && perl -i -pe "s/^(\s+)(public function offsetSet)/\$1#\[\\ReturnTypeWillChange\]\n\$1\$2/" "$SLIM" \
    && perl -i -pe "s/^(\s+)(public function offsetUnset)/\$1#\[\\ReturnTypeWillChange\]\n\$1\$2/" "$SLIM" \
    && perl -i -pe "s/^(\s+)(public function count\(\))/\$1#\[\\ReturnTypeWillChange\]\n\$1\$2/" "$SLIM" \
    && perl -i -pe "s/^(\s+)(public function getIterator\(\))/\$1#\[\\ReturnTypeWillChange\]\n\$1\$2/" "$SLIM"

# ============================================================
# FIX ROUTE ACCESS CHECK - Patch files to use port 80 internally
# ============================================================

# Fix: Patch RouteAccessCheck to use internal port 80 instead of 8080
# SuiteCRM inside container listens on port 80, not 8080
RUN find /var/www/html -type f -name "*.php" | xargs grep -l "localhost:8080" 2>/dev/null | while read file; do \
        sed -i 's|localhost:8080|localhost:80|g' "$file"; \
    done || true

# Ensure proper permissions
RUN chown -R www-data:www-data /var/www/html

# Expose Apache port
EXPOSE 80
