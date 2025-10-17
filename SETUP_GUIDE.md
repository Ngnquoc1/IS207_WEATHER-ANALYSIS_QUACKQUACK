# Weather Dashboard - Complete Setup Guide

This guide will walk you through setting up the Weather Analysis Dashboard from scratch.

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Detailed Setup](#detailed-setup)
4. [Common Issues](#common-issues)
5. [Testing](#testing)

---

## Prerequisites

### Required Software

#### For Backend (Laravel):
- **PHP 8.1 or higher**
  - Check version: `php -v`
  - Download: https://www.php.net/downloads

- **Composer** (PHP package manager)
  - Check version: `composer -V`
  - Download: https://getcomposer.org/download/

#### For Frontend (React):
- **Node.js 16.x or higher**
  - Check version: `node -v`
  - Download: https://nodejs.org/

- **npm** (comes with Node.js)
  - Check version: `npm -v`

### Optional Tools
- **Git** - For version control
- **Postman** - For API testing
- **VS Code** - Recommended code editor

---

## Quick Start

If you just want to get started quickly, run the setup script:

```bash
# Make the script executable (on Linux/Mac)
chmod +x setup.sh

# Run the setup script
./setup.sh
```

Then follow the instructions to start both servers.

---

## Detailed Setup

### Step 1: Setup Laravel Backend

#### 1.1 Navigate to Backend Directory
```bash
cd backend
```

#### 1.2 Install Dependencies
```bash
composer install
```

This installs all PHP packages including Laravel and Guzzle.

#### 1.3 Create Environment File
```bash
# On Windows (Command Prompt)
copy .env.example .env

# On Windows (PowerShell)
Copy-Item .env.example .env

# On Linux/Mac
cp .env.example .env
```

#### 1.4 Generate Application Key
```bash
php artisan key:generate
```

This creates a unique encryption key for your Laravel application.

#### 1.5 Install Guzzle HTTP Client
```bash
composer require guzzlehttp/guzzle
```

#### 1.6 Configure CORS (Important!)

Edit `config/cors.php` and ensure it looks like this:

```php
<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    
    'allowed_methods' => ['*'],
    
    'allowed_origins' => [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
    ],
    
    'allowed_origins_patterns' => [],
    
    'allowed_headers' => ['*'],
    
    'exposed_headers' => [],
    
    'max_age' => 0,
    
    'supports_credentials' => false,
];
```

#### 1.7 Start Laravel Server
```bash
php artisan serve
```

Your backend is now running at `http://localhost:8000`

Keep this terminal open!

---

### Step 2: Setup React Frontend

#### 2.1 Open New Terminal
Keep the Laravel server running and open a new terminal window.

#### 2.2 Navigate to Frontend Directory
```bash
cd frontend
```

#### 2.3 Install Dependencies
```bash
npm install
```

This installs React, Chart.js, D3.js, Axios, and other dependencies. This may take a few minutes.

#### 2.4 Verify API Configuration

Open `src/services/weatherService.js` and verify:

```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

#### 2.5 Start React Development Server
```bash
npm start
```

Your frontend will automatically open at `http://localhost:3000`

---

## Testing the Application

### 1. Test Backend API Directly

Using browser or Postman:

```
GET http://localhost:8000/api/weather/10.98/106.75
```

You should see a JSON response with weather data.

### 2. Test Frontend

1. The dashboard should load automatically
2. You should see current weather for Dĩ An
3. Try clicking different location buttons
4. Try the location comparator

### 3. Test Location Search

1. Enter custom coordinates:
   - Name: "Test Location"
   - Latitude: 21.03
   - Longitude: 105.85
2. Click "🔍 Tìm kiếm"
3. Weather should update

---

## Common Issues

### Issue 1: "composer: command not found"

**Solution**: Install Composer
- Download from: https://getcomposer.org/download/
- Follow installation instructions for your OS
- Restart terminal after installation

### Issue 2: "php: command not found"

**Solution**: Install PHP
- Windows: Use XAMPP or download from php.net
- Mac: `brew install php`
- Linux: `sudo apt-get install php8.1`

### Issue 3: CORS Error in Browser Console

**Error**: "Access to XMLHttpRequest blocked by CORS policy"

**Solution**:
1. Check `backend/config/cors.php`
2. Ensure 'http://localhost:3000' is in `allowed_origins`
3. Clear Laravel cache:
   ```bash
   php artisan config:clear
   php artisan cache:clear
   ```
4. Restart Laravel server

### Issue 4: "npm: command not found"

**Solution**: Install Node.js
- Download from: https://nodejs.org/
- Install the LTS version
- Restart terminal

### Issue 5: Port Already in Use

**Error**: "Port 8000 is already in use" or "Port 3000 is already in use"

**Solution**:

For Laravel (port 8000):
```bash
# Kill the process using port 8000
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9

# Or use a different port
php artisan serve --port=8001
```

For React (port 3000):
```bash
# Use a different port
PORT=3001 npm start
```

### Issue 6: "Class 'GuzzleHttp\Client' not found"

**Solution**:
```bash
cd backend
composer require guzzlehttp/guzzle
composer dump-autoload
```

### Issue 7: Frontend Shows "Network Error"

**Checklist**:
1. ✓ Is Laravel server running? (check terminal)
2. ✓ Is it running on port 8000?
3. ✓ Can you access http://localhost:8000 in browser?
4. ✓ Is CORS configured correctly?
5. ✓ Check browser console for specific error

### Issue 8: Charts Not Displaying

**Solution**:
```bash
cd frontend
npm install chart.js react-chartjs-2 --save
npm start
```

---

## Verifying Installation

### Backend Checklist:
- [ ] PHP version 8.1+ installed
- [ ] Composer installed
- [ ] Guzzle installed
- [ ] .env file exists
- [ ] Application key generated
- [ ] Server runs on port 8000
- [ ] API returns JSON when accessed

### Frontend Checklist:
- [ ] Node.js 16+ installed
- [ ] npm dependencies installed
- [ ] No errors in console
- [ ] Server runs on port 3000
- [ ] Dashboard loads correctly
- [ ] Weather data displays

---

## Development Workflow

### Daily Development:

1. **Start Backend:**
   ```bash
   cd backend
   php artisan serve
   ```

2. **Start Frontend (new terminal):**
   ```bash
   cd frontend
   npm start
   ```

3. **Make changes and test**

4. **Stop servers:**
   - Press `Ctrl + C` in both terminals

---

## Useful Commands

### Laravel Commands:
```bash
# Clear all caches
php artisan optimize:clear

# View routes
php artisan route:list

# Run in verbose mode
php artisan serve --verbose

# Check Laravel version
php artisan --version
```

### React Commands:
```bash
# Install a new package
npm install package-name

# Update all packages
npm update

# Build for production
npm run build

# Run tests
npm test
```

---

## Getting Help

If you encounter issues:

1. Check the error message carefully
2. Search the error on Google/Stack Overflow
3. Check Laravel documentation: https://laravel.com/docs
4. Check React documentation: https://react.dev/
5. Check Open-Meteo API docs: https://open-meteo.com/

---

## Next Steps

Once everything is working:

1. Explore the code structure
2. Try modifying the UI styling
3. Add new features
4. Experiment with different locations
5. Customize the anomaly detection threshold
6. Add more recommendation rules

---

## Production Deployment

When ready to deploy:

### Backend:
1. Set up a production server (Linux recommended)
2. Install PHP, Composer, and web server
3. Set `APP_ENV=production` in `.env`
4. Run `composer install --optimize-autoloader --no-dev`
5. Set proper file permissions
6. Configure web server (Apache/Nginx)

### Frontend:
1. Update API_BASE_URL to production backend
2. Run `npm run build`
3. Deploy `build` folder to hosting service
4. Configure SPA routing on server

---

**Good luck with your Weather Dashboard! 🌤️**
