# Stage 1: Build frontend assets
FROM node:20-alpine AS frontend-builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY src/input.css ./src/
RUN npm run build:css

# Stage 2: Setup PHP application with Apache
FROM php:8.2-apache

WORKDIR /var/www/html

# Install system dependencies for PHP extensions (if any are needed beyond standard)
# Example: If your PHP app uses GD library for image manipulation, uncomment:
# RUN apk add --no-cache libpng libjpeg-turbo libwebp freetype \
#     libpng-dev libjpeg-turbo-dev libwebp-dev freetype-dev
# RUN docker-php-ext-install -j$(nproc) gd

# Install Composer
COPY --from=composer/composer:latest-bin /composer /usr/bin/composer

# Copy Composer files and install dependencies
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader

# Copy built frontend assets from the frontend-builder stage
COPY --from=frontend-builder /app/dist ./dist

# Copy the rest of the application code
COPY . .

# Remove the node_modules and src folder that are not needed in the final image
RUN rm -rf node_modules src

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
