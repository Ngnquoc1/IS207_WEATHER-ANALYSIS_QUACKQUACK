# Weather Analysis Dashboard

A comprehensive weather analysis dashboard built with Laravel (backend) and ReactJS (frontend). The application fetches real-time weather data from the Open-Meteo API and provides current weather information, forecasts, anomaly detection, and smart recommendations.

## 🌟 Features

### Core Features

- **Modern Header with Location Dropdown**: Dark theme header with dropdown location selector and theme toggle
- **Dark/Light Mode**: Toggle between dark and light themes with persistent settings
- **Current Weather Display**: Real-time weather conditions with temperature, humidity, wind speed, and more
- **Interactive Forecast Tabs**: Switch between 24-hour chart and 7-day forecast list
- **24-Hour Forecast Chart**: Dual-axis chart showing temperature trends and rain probability
- **7-Day Forecast List**: Card-based daily weather predictions with color-coded conditions
- **Anomaly Detection**: Automatically detects unusual temperature patterns by comparing with 30-day historical averages
- **Smart Recommendations**: AI-powered suggestions based on weather conditions (UV protection, clothing advice, etc.)
- **Location Comparison**: Side-by-side weather comparison between two locations with interactive charts
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Stories Feature**: Share and view weather-related stories with authentication

### Deployment & Data

- 🐳 **Docker Ready**: Pre-built images on Docker Hub for instant deployment
- 💾 **Data Persistence**: All user data automatically saved in Docker volumes
- 🔄 **Auto-Migration**: Database schema automatically set up on first run
- 👥 **Multi-User Support**: Each deployment has isolated data storage
- 📦 **Zero Configuration**: Works out of the box with `docker-compose up`

## 🛠️ Technology Stack

### Backend

- **Laravel 10**: PHP framework for API endpoints
- **Guzzle HTTP**: For making API requests to Open-Meteo
- **Open-Meteo API**: Free weather data source (no API key required)

### Frontend

- **ReactJS**: Modern JavaScript library for building UI
- **React Context**: For theme management (dark/light mode)
- **Chart.js**: For creating beautiful, interactive charts with dual-axis support
- **D3.js**: For advanced data visualizations
- **Axios**: For HTTP requests to Laravel backend
- **CSS3**: Modern styling with backdrop-filter, gradients, and animations

## 📋 Prerequisites

### Backend Requirements

- PHP >= 8.1
- Composer
- Laravel 10
- MySQL/PostgreSQL (optional, for future extensions)

### Frontend Requirements

- Node.js >= 16.x
- npm or yarn

## 🚀 Quick Start with Docker (Recommended)

### Deploy from Docker Hub (Easiest Method)

**No build required! Just run:**

```bash
git clone <your-repo>
cd IS207_WEATHER-ANALYSIS_QUACKQUACK
docker-compose up -d
```

**That's it!** The application will:

- ✅ Automatically pull images from Docker Hub
- ✅ Set up persistent data storage
- ✅ Run database migrations
- ✅ Create default user accounts
- ✅ Start all services

**Access:**

- Main App: http://localhost
- Backend API: http://localhost:8000
- Frontend: http://localhost:3000

**Default Login:**

- Admin: `admin@example.com` / `password`
- Editor: `editor@example.com` / `password`

**📖 Full Docker Documentation:**

- [DOCKER_HUB_DEPLOYMENT.md](DOCKER_HUB_DEPLOYMENT.md) - Quick deployment guide
- [DATA_PERSISTENCE_GUIDE.md](DATA_PERSISTENCE_GUIDE.md) - How data persistence works
- [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) - Advanced Docker configuration

---

## 📚 Documentation

This project uses **OpenSpec** for technical specifications and documentation.

### 📖 API Specifications

All API requirements and behaviors are documented in OpenSpec format:

- **`openspec/specs/auth/`** - Authentication & authorization (login, logout, roles)
- **`openspec/specs/weather/`** - Weather data fetching, anomaly detection, recommendations
- **`openspec/specs/stories/`** - News stories management (CRUD, search, filtering)

### 🔍 Quick Access

```bash
# View all specifications
openspec list --specs

# View specific spec details
openspec show auth --type spec
openspec show weather --type spec
openspec show stories --type spec

# View active development changes
openspec list
```

### 📝 Project Context

- **Project conventions**: `openspec/project.md` - Tech stack, coding standards, architecture patterns
- **Deployment guides**:
  - [DOCKER_HUB_DEPLOYMENT.md](DOCKER_HUB_DEPLOYMENT.md) - Quick deployment
  - [DATA_PERSISTENCE_GUIDE.md](DATA_PERSISTENCE_GUIDE.md) - Data management
  - [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) - Advanced Docker setup
- **Setup instructions**: [SETUP_GUIDE.md](SETUP_GUIDE.md) - Manual installation guide

### 🤖 AI Development

This project uses spec-driven development with OpenSpec. When proposing changes:

```bash
# Create a change proposal
openspec init  # if not already initialized

# View proposal example
# Create: openspec/changes/my-feature/proposal.md
# Then run: openspec validate my-feature --strict
```

---

## 🔧 Available Scripts

This project includes utility scripts for deployment and maintenance:

### For Users (Deployment)

#### **`docker-compose up -d`** - Standard Deployment

The simplest way to deploy:

```bash
docker-compose up -d
```

Automatically pulls images from Docker Hub and starts all services.

#### **`./deploy-from-hub.sh`** - Enhanced Deployment

Deploy with comprehensive health checks and status reports:

```bash
./deploy-from-hub.sh
```

Features:

- ✅ Pulls latest images from Docker Hub
- ✅ Stops old containers gracefully
- ✅ Starts new containers
- ✅ Performs health checks
- ✅ Shows service URLs and logs
- ✅ Verifies deployment success

### For Developers (Build & Release)

#### **`./build-and-push.sh`** - Build and Publish Images

Build Docker images and push to Docker Hub:

```bash
./build-and-push.sh
```

Features:

- ✅ Builds backend and frontend images
- ✅ Pushes to Docker Hub registry
- ✅ Tags with version and latest
- ✅ Verifies Docker Hub login

**Note:** This script is for maintainers only. Regular users should use pre-built images from Docker Hub.

---

## 🛠️ Manual Installation & Setup

### Part 1: Backend Setup (Laravel)

1. **Navigate to the backend directory:**

   ```bash
   cd backend
   ```

2. **Install Composer dependencies:**

   ```bash
   composer install
   ```

3. **Create environment file:**

   ```bash
   cp .env.example .env
   ```

4. **Generate application key:**

   ```bash
   php artisan key:generate
   ```

5. **Install Guzzle HTTP client:**

   ```bash
   composer require guzzlehttp/guzzle
   ```

6. **Configure CORS (for API access from React):**

   Edit `config/cors.php`:

   ```php
   'paths' => ['api/*'],
   'allowed_methods' => ['*'],
   'allowed_origins' => ['http://localhost:3000'],
   'allowed_origins_patterns' => [],
   'allowed_headers' => ['*'],
   'exposed_headers' => [],
   'max_age' => 0,
   'supports_credentials' => false,
   ```

7. **Start Laravel development server:**

   ```bash
   php artisan serve
   ```

   The backend will be available at `http://localhost:8000`

### Part 2: Frontend Setup (React)

1. **Navigate to the frontend directory:**

   ```bash
   cd frontend
   ```

2. **Install npm dependencies:**

   ```bash
   npm install
   ```

3. **Configure API endpoint:**

   Open `src/services/weatherService.js` and update the API base URL if needed:

   ```javascript
   const API_BASE_URL =
     "http://localhost:8000/api"
   ```

4. **Start React development server:**

   ```bash
   npm start
   ```

   The frontend will open automatically at `http://localhost:3000`

## 📁 Project Structure

```
weatherPrj/
├── backend/                          # Laravel Backend
│   ├── app/
│   │   └── Http/
│   │       └── Controllers/
│   │           └── WeatherController.php  # Main weather API logic
│   ├── routes/
│   │   └── api.php                   # API routes definition
│   └── composer.json
│
└── frontend/                         # React Frontend
    ├── public/
    ├── src/
    │   ├── components/               # React Components
    │   │   ├── CurrentWeather.js     # Current weather display
    │   │   ├── CurrentWeather.css
    │   │   ├── HourlyForecastChart.js # Hourly chart
    │   │   ├── HourlyForecastChart.css
    │   │   ├── DailyForecast.js      # 7-day forecast
    │   │   ├── DailyForecast.css
    │   │   ├── AnomalyDisplay.js     # Anomaly alerts
    │   │   ├── AnomalyDisplay.css
    │   │   ├── Recommendation.js     # Smart recommendations
    │   │   ├── Recommendation.css
    │   │   ├── LocationComparator.js # Location comparison
    │   │   └── LocationComparator.css
    │   ├── pages/
    │   │   ├── DashboardPage.js      # Main dashboard page
    │   │   └── DashboardPage.css
    │   ├── services/
    │   │   └── weatherService.js     # API service layer
    │   ├── App.js                    # Root component
    │   ├── App.css
    │   ├── index.js                  # Entry point
    │   └── index.css
    └── package.json
```

## 🔌 API Endpoints

### Backend API Endpoints

#### 1. Get Weather Data

```
GET /api/weather/{lat}/{lon}
```

**Description**: Fetches comprehensive weather data including current conditions, forecasts, anomaly detection, and recommendations.

**Parameters**:

- `lat` (float): Latitude coordinate
- `lon` (float): Longitude coordinate

**Example**:

```bash
GET http://localhost:8000/api/weather/10.98/106.75
```

**Response**:

```json
{
    "location": {
        "latitude": 10.98,
        "longitude": 106.75,
        "timezone": "Asia/Bangkok",
        "elevation": 5.0
    },
    "current_weather": {
        "temperature": 28.5,
        "apparent_temperature": 32.1,
        "humidity": 75,
        "wind_speed": 12.5,
        "weather_description": "Trời quang đãng"
    },
    "hourly_forecast": [...],
    "daily_forecast": [...],
    "anomaly": {
        "is_anomaly": false,
        "message": "..."
    },
    "recommendation": "..."
}
```

#### 2. Compare Locations

```
POST /api/weather/comparison
```

**Description**: Compares weather conditions between two locations.

**Request Body**:

```json
{
  "location1": {
    "lat": 10.98,
    "lon": 106.75,
    "name": "Dĩ An"
  },
  "location2": {
    "lat": 21.03,
    "lon": 105.85,
    "name": "Hà Nội"
  }
}
```

**Response**:

```json
{
    "location1": {...},
    "location2": {...},
    "differences": {
        "temperature_diff": 5.3,
        "humidity_diff": -10,
        "wind_speed_diff": 2.1
    }
}
```

## 🎯 Key Features Explained

### Anomaly Detection Algorithm

The system detects temperature anomalies by:

1. Collecting historical data from the past 30 days
2. Calculating the average maximum temperature
3. Comparing the current temperature with the average
4. Flagging as anomaly if the difference exceeds 5°C

### Smart Recommendations

The recommendation engine analyzes multiple weather parameters:

- **UV Index**: Suggests sun protection measures
- **Temperature**: Advises on clothing and hydration
- **Weather Conditions**: Warns about rain, storms, fog, etc.
- **Wind Speed**: Cautions about strong winds
- **Humidity**: Alerts about uncomfortable conditions

## 🎨 UI Components

1. **Header**: Modern dark theme header with location dropdown and theme toggle
2. **CurrentWeather**: Displays real-time weather with large temperature display and details
3. **ForecastTabs**: Interactive tabs switching between 24h chart and 7-day forecast list
4. **24h Chart**: Dual-axis chart showing temperature trends and rain probability
5. **7-Day Forecast**: Card-based daily forecast with color-coded weather conditions (integrated in ForecastTabs)
6. **AnomalyDisplay**: Animated alert box for temperature anomalies
7. **Recommendation**: Smart suggestions based on current conditions
8. **LocationComparator**: Side-by-side comparison with table and chart

## 🌙 Theme System

### Dark Mode (Default)

- **Header**: Dark gradient background (`#1a1a2e` → `#16213e`)
- **Dashboard**: Dark gradient background with backdrop blur effects
- **Cards**: Semi-transparent with glass morphism effect
- **Text**: White and light colors for contrast

### Light Mode

- **Header**: Purple gradient background (`#667eea` → `#764ba2`)
- **Dashboard**: Light gradient background (`#f5f7fa` → `#c3cfe2`)
- **Cards**: White background with subtle shadows
- **Text**: Dark colors for readability

### Theme Features

- **Persistent**: Theme preference saved in localStorage
- **Smooth Transitions**: All theme changes have 0.3s animations
- **Toggle Button**: Easy switching with 🌙/☀️ icons
- **Auto-apply**: Theme applied automatically on page load

## 🌐 Location Selection

### Header Dropdown Features

- **Search Functionality**: Type to search for cities
- **Current Location**: Auto-detect user's current position
- **Quick Presets**: Popular Vietnamese locations in dropdown
- **Custom Coordinates**: Manual lat/lon input with validation

### Quick Location Presets

The dropdown includes quick access to popular Vietnamese locations:

- Dĩ An (10.98, 106.75)
- Hồ Chí Minh (10.82, 106.63)
- Hà Nội (21.03, 105.85)
- Đà Nẵng (16.07, 108.22)
- Nha Trang (12.24, 109.19)
- Đà Lạt (11.94, 108.44)

### Location Features

- **Auto-detection**: Uses browser geolocation API
- **Validation**: Checks coordinate ranges (-90 to 90 for lat, -180 to 180 for lon)
- **Error Handling**: Graceful fallback to default location
- **Persistent Selection**: Remembers last selected location

## 🔧 Configuration

### Changing the API Base URL

Edit `frontend/src/services/weatherService.js`:

```javascript
const API_BASE_URL = "http://your-backend-url/api"
```

### Modifying Anomaly Detection Threshold

Edit `backend/app/Http/Controllers/WeatherController.php`:

```php
// Change the threshold value (default is 5°C)
if (abs($difference) > 5) {
    // Anomaly detected
}
```

## 🐛 Troubleshooting

### CORS Issues

If you encounter CORS errors:

1. Make sure Laravel's CORS middleware is properly configured
2. Check that `allowed_origins` includes your React app's URL
3. Clear browser cache and restart both servers

### API Connection Failed

1. Verify Laravel server is running on `http://localhost:8000`
2. Check the API_BASE_URL in weatherService.js
3. Ensure no firewall is blocking the connection

### Chart Not Displaying

1. Make sure Chart.js is properly installed: `npm install chart.js react-chartjs-2`
2. Check browser console for errors
3. Verify data format matches Chart.js requirements

## 📱 Responsive Design

The dashboard is fully responsive and optimized for:

- Desktop (1920x1080 and above)
- Laptop (1366x768)
- Tablet (768x1024)
- Mobile (375x667 and above)

## 🚀 Production Deployment

### Backend (Laravel)

1. Set up a production server (Apache/Nginx)
2. Configure environment variables
3. Run `composer install --optimize-autoloader --no-dev`
4. Set `APP_ENV=production` in `.env`
5. Run `php artisan config:cache`
6. Run `php artisan route:cache`

### Frontend (React)

1. Build the production bundle: `npm run build`
2. Deploy the `build` folder to your hosting service
3. Update API_BASE_URL to your production backend URL

## 📄 License

This project is open-source and available for educational purposes.

## 👨‍💻 Author

Created as part of the Web-UIT course project.

## 🙏 Acknowledgments

- Weather data provided by [Open-Meteo API](https://open-meteo.com/)
- Icons and design inspiration from modern UI/UX practices
- Built with ❤️ using Laravel and React

## 📞 Support

For issues or questions, please create an issue in the repository or contact the development team.

---

**Happy Coding! 🌤️**
