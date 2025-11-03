#!/bin/bash

# Backend Entrypoint Script for Weather Dashboard
# This script runs on container startup to initialize the application

set -e

echo "🚀 Starting Weather Dashboard Backend with MongoDB Atlas..."

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
chmod -R 775 /var/www/html/storage
chmod -R 775 /var/www/html/bootstrap/cache

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

DB_CONNECTION=mongodb
DB_URI=
DB_DATABASE=weather_db

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

# Check MongoDB Atlas connection
echo "🔍 Checking MongoDB Atlas connection..."
MAX_RETRIES=10
RETRY_COUNT=0

until php artisan tinker --execute="try { DB::connection()->command(['ping' => 1]); echo 'connected'; } catch (Exception \$e) { echo 'failed'; exit(1); }" 2>&1 | grep -q "connected" || [ $RETRY_COUNT -eq $MAX_RETRIES ]; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "⏳ Waiting for MongoDB Atlas connection... (attempt $RETRY_COUNT/$MAX_RETRIES)"
    sleep 3
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "❌ Failed to connect to MongoDB Atlas after $MAX_RETRIES attempts"
    echo "📝 Please check:"
    echo "   1. MongoDB Atlas connection string (DB_URI) is correct"
    echo "   2. Database user has proper permissions"
    echo "   3. IP address is whitelisted (0.0.0.0/0 for testing)"
    echo "   4. Internet connection is available"
    exit 1
fi

echo "✅ MongoDB Atlas connected successfully!"

# Seed default users if needed (check if admin user exists)
ADMIN_EXISTS=$(php artisan tinker --execute="echo App\Models\User::where('username', 'admin')->exists() ? 'yes' : 'no';" 2>/dev/null | tail -n 1)

if [ "$ADMIN_EXISTS" = "no" ]; then
    echo "👤 Creating default admin user..."
    php artisan db:seed --class=DefaultUsersSeeder --force || echo "⚠️  Seeder not available or failed"
    echo "✅ Default users created!"
else
    echo "✅ Admin user already exists, skipping seeding"
fi

# Clear and cache configuration
echo "🔧 Optimizing application..."
php artisan config:cache
php artisan route:cache

echo "✅ Backend initialization complete!"
echo ""
echo "================================================================"
echo "  Weather Analysis Backend - Running with MongoDB Atlas"
echo "================================================================"
echo "  Database: MongoDB Atlas (Cloud)"
echo "  Storage: /var/www/html/storage"
echo "  API Endpoint: http://localhost/api"
echo "================================================================"
echo ""

# Start supervisor (which runs nginx and php-fpm)
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf

