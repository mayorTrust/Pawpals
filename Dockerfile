# Stage 2: Setup PHP application with Apache
FROM php:8.2-apache

WORKDIR /var/www/html

# Install the helper script for PHP extensions
ADD https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/
RUN chmod +x /usr/local/bin/install-php-extensions

# Install commonly required PHP extensions using the helper script
RUN install-php-extensions gd mbstring xml zip pdo_mysql

# Install Composer
COPY --from=composer/composer:latest-bin /composer /usr/bin/composer

# Copy Composer files and install dependencies
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader

# Copy the pre-built frontend assets from the host context
COPY dist ./dist

# Copy the rest of the application code
COPY . .

# Remove the src folder if it contains only frontend source files and is not needed in the final image
RUN rm -rf src

# Configure Apache to use .htaccess for URL rewriting (e.g., for routing)
RUN a2enmod rewrite

# Ensure correct permissions for web server
RUN chown -R www-data:www-data /var/www/html
RUN find /var/www/html -type d -exec chmod 755 {} +
RUN find /var/www/html -type f -exec chmod 644 {} +

# Expose port 80
EXPOSE 80

# The default command for php:8.2-apache is to start Apache
# CMD ["apache2-foreground"]
