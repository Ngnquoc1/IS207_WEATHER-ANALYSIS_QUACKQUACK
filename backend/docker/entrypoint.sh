#!/bin/bash

# Backend Entrypoint Script for Weather Dashboard
# This script runs on container startup to initialize the application

set -e

echo "🚀 Starting Weather Dashboard Backend..."

# Create database directory if it doesn't exist
mkdir -p /var/www/html/database

# Create SQLite database file if it doesn't exist
if [ ! -f /var/www/html/database/database.sqlite ]; then
    echo "📦 Creating SQLite database..."
    touch /var/www/html/database/database.sqlite
    chmod 664 /var/www/html/database/database.sqlite
fi

# Ensure storage directories exist with proper permissions
echo "📁 Setting up storage directories..."
mkdir -p /var/www/html/storage/app/public
mkdir -p /var/www/html/storage/framework/cache
mkdir -p /var/www/html/storage/framework/sessions
mkdir -p /var/www/html/storage/framework/views
mkdir -p /var/www/html/storage/logs
mkdir -p /var/www/html/bootstrap/cache

# Set proper permissions
echo "🔒 Setting permissions..."
chown -R www-data:www-data /var/www/html/storage
chown -R www-data:www-data /var/www/html/bootstrap/cache
chown -R www-data:www-data /var/www/html/database
chmod -R 775 /var/www/html/storage
chmod -R 775 /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/database

# Generate application key if .env doesn't exist or APP_KEY is empty
if [ ! -f /var/www/html/.env ]; then
    echo "⚙️  Creating .env file..."
    
    # Try to copy from .env.example if it exists, otherwise create a minimal one
    if [ -f /var/www/html/.env.example ]; then
        cp /var/www/html/.env.example /var/www/html/.env
    else
        echo "📝 .env.example not found, creating minimal .env file..."
        cat > /var/www/html/.env << 'EOF'
APP_NAME=Laravel
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_TIMEZONE=UTC
APP_URL=http://localhost

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US

APP_MAINTENANCE_DRIVER=file
APP_MAINTENANCE_STORE=database

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=sqlite
DB_DATABASE=/var/www/html/database/database.sqlite

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database

CACHE_STORE=database
CACHE_PREFIX=

MEMCACHED_HOST=127.0.0.1

REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=log
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

VITE_APP_NAME="${APP_NAME}"
EOF
    fi
    
    php artisan key:generate --force
fi

# Check if APP_KEY is empty
if grep -q "APP_KEY=$" /var/www/html/.env || ! grep -q "APP_KEY=" /var/www/html/.env; then
    echo "🔑 Generating application key..."
    php artisan key:generate --force
fi

# Run migrations
echo "🗃️  Running database migrations..."
php artisan migrate --force

# Seed default users if needed (only if users table is empty)
USER_COUNT=$(php artisan tinker --execute="echo \App\Models\User::count();" 2>/dev/null || echo "0")
if [ "$USER_COUNT" = "0" ]; then
    echo "👤 Seeding default users..."
    php artisan db:seed --class=DefaultUsersSeeder --force || echo "⚠️  Seeder not available or failed"
fi

# Clear and cache configuration
echo "🔧 Optimizing application..."
php artisan config:cache
php artisan route:cache

echo "✅ Backend initialization complete!"
echo ""
echo "📊 Database: /var/www/html/database/database.sqlite"
echo "📁 Storage: /var/www/html/storage"
echo ""

# Start supervisor (which runs nginx and php-fpm)
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf

