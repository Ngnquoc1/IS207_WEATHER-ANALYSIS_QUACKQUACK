# Weather Dashboard - System Architecture

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE                              │
│                     (Browser - React App)                            │
│                    http://localhost:3000                             │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ HTTP Requests (Axios)
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                      FRONTEND LAYER                                  │
│                         (React 18)                                   │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    DashboardPage.js                           │  │
│  │  (Main Container - State Management)                          │  │
│  └────┬─────────────────────────────────────────────────────────┘  │
│       │                                                              │
│       ├──► CurrentWeather.js       (Temperature, humidity, etc.)    │
│       ├──► HourlyForecastChart.js  (24h chart with Chart.js)        │
│       ├──► DailyForecast.js        (7-day forecast cards)           │
│       ├──► AnomalyDisplay.js       (Temperature alerts)             │
│       ├──► Recommendation.js       (Smart suggestions)              │
│       └──► LocationComparator.js   (Compare locations)              │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              weatherService.js                                │  │
│  │  - fetchWeatherData(lat, lon)                                 │  │
│  │  - fetchComparisonData(loc1, loc2)                            │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ HTTP API Calls
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                      BACKEND LAYER                                   │
│                      (Laravel 10)                                    │
│                   http://localhost:8000                              │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                     routes/api.php                            │  │
│  │  - GET  /api/weather/{lat}/{lon}                             │  │
│  │  - POST /api/weather/comparison                               │  │
│  └────────────────────────┬─────────────────────────────────────┘  │
│                            │                                         │
│  ┌────────────────────────▼─────────────────────────────────────┐  │
│  │              WeatherController.php                            │  │
│  │                                                                │  │
│  │  Main Methods:                                                 │  │
│  │  ├─ getWeatherData()         → Fetch & process weather        │  │
│  │  ├─ compareLocations()       → Compare two locations          │  │
│  │  ├─ processCurrentWeather()  → Format current data            │  │
│  │  ├─ processHourlyForecast()  → Format hourly data            │  │
│  │  ├─ processDailyForecast()   → Format daily data             │  │
│  │  ├─ detectAnomaly()          → Analyze temperature           │  │
│  │  └─ generateRecommendation() → Create suggestions            │  │
│  └────────────────────────┬─────────────────────────────────────┘  │
│                            │                                         │
│                            │ Guzzle HTTP Client                      │
│                            │                                         │
└────────────────────────────┼─────────────────────────────────────────┘
                             │
                             │ External API Call
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                    EXTERNAL API                                      │
│                  Open-Meteo Weather API                              │
│              https://api.open-meteo.com                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Returns:                                                            │
│  ├─ Current weather conditions                                      │
│  ├─ Hourly forecasts (24 hours)                                     │
│  ├─ Daily forecasts (7 days)                                        │
│  └─ Historical data (30 days)                                       │
│                                                                      │
│  ✓ Free to use                                                      │
│  ✓ No API key required                                              │
│  ✓ Real-time data                                                   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## 📊 Data Flow Diagram

```
┌─────────┐
│  USER   │
└────┬────┘
     │ 1. Enters location or clicks preset
     │
┌────▼─────────────────┐
│  DashboardPage.js    │
│  (React Component)   │
└────┬─────────────────┘
     │ 2. Calls weatherService.fetchWeatherData(lat, lon)
     │
┌────▼──────────────────┐
│ weatherService.js     │
│ (API Service Layer)   │
└────┬──────────────────┘
     │ 3. HTTP GET request (Axios)
     │
┌────▼───────────────────────────────────────┐
│ Laravel Backend                            │
│ GET /api/weather/{lat}/{lon}               │
└────┬───────────────────────────────────────┘
     │ 4. WeatherController.getWeatherData()
     │
┌────▼──────────────────────────────────────────────┐
│ Build API URL with parameters:                    │
│ - latitude, longitude                              │
│ - current weather parameters                       │
│ - hourly forecast                                  │
│ - daily forecast                                   │
│ - past 30 days (for anomaly detection)            │
└────┬──────────────────────────────────────────────┘
     │ 5. Guzzle HTTP GET request
     │
┌────▼────────────────────────────────┐
│ Open-Meteo API                      │
│ Returns time-series JSON data       │
└────┬────────────────────────────────┘
     │ 6. Response received
     │
┌────▼─────────────────────────────────────────┐
│ WeatherController processes data:            │
│ ├─ processCurrentWeather()                   │
│ ├─ processHourlyForecast()                   │
│ ├─ processDailyForecast()                    │
│ ├─ detectAnomaly() (30-day analysis)         │
│ └─ generateRecommendation()                  │
└────┬─────────────────────────────────────────┘
     │ 7. Returns structured JSON
     │
┌────▼───────────────────────┐
│ React receives data        │
│ Updates state with:        │
│ - current_weather          │
│ - hourly_forecast          │
│ - daily_forecast           │
│ - anomaly                  │
│ - recommendation           │
└────┬───────────────────────┘
     │ 8. React re-renders components
     │
┌────▼────────────────────────────────────────┐
│ Components display data:                    │
│ ├─ CurrentWeather (temp, humidity, etc.)    │
│ ├─ HourlyForecastChart (Chart.js line)      │
│ ├─ DailyForecast (7-day cards)              │
│ ├─ AnomalyDisplay (if anomaly detected)     │
│ └─ Recommendation (smart suggestions)       │
└────┬────────────────────────────────────────┘
     │ 9. User sees updated weather data
     │
┌────▼────┐
│  USER   │
└─────────┘
```

## 🔄 Location Comparison Flow

```
User fills comparison form
         │
         ▼
LocationComparator.js calls fetchComparisonData()
         │
         ▼
POST /api/weather/comparison
Body: { location1: {...}, location2: {...} }
         │
         ▼
WeatherController.compareLocations()
         │
         ├──► Fetch weather for location1
         │    └─► Open-Meteo API call
         │
         └──► Fetch weather for location2
              └─► Open-Meteo API call
         │
         ▼
Calculate differences (temp, humidity, wind)
         │
         ▼
Return comparison JSON
         │
         ▼
LocationComparator displays:
├─ Comparison table
└─ Bar chart (Chart.js)
```

## 🧮 Anomaly Detection Algorithm

```
┌─────────────────────────────────────────┐
│ 1. Get historical data (30 days)       │
│    daily.temperature_2m_max[0..29]     │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│ 2. Calculate average maximum temp      │
│    avgMaxTemp = sum(temps) / 30        │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│ 3. Get current temperature              │
│    currentTemp = current.temperature_2m │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│ 4. Calculate difference                 │
│    diff = currentTemp - avgMaxTemp     │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│ 5. Check if anomaly                     │
│    if (abs(diff) > 5°C) {              │
│       return anomaly = true             │
│       type = diff > 0 ? 'hot' : 'cold' │
│    } else {                             │
│       return anomaly = false            │
│    }                                    │
└─────────────────────────────────────────┘
```

## 🎯 Smart Recommendation Engine

```
Input: current weather + daily forecast
         │
         ├──► UV Index Analysis
         │    ├─ UV < 3  → Low protection needed
         │    ├─ UV 3-6  → Moderate protection
         │    ├─ UV 6-8  → High protection
         │    └─ UV > 8  → Very high protection
         │
         ├──► Temperature Analysis
         │    ├─ Temp > 35°C → Hydration warning
         │    └─ Temp < 15°C → Warm clothing advice
         │
         ├──► Weather Code Analysis
         │    ├─ Rain codes (61,63,65) → Bring umbrella
         │    ├─ Storm codes (95,96,99) → Stay indoors
         │    └─ Fog codes (45,48)      → Driving caution
         │
         ├──► Wind Speed Analysis
         │    ├─ Wind > 40 km/h → Very windy warning
         │    └─ Wind > 25 km/h → Moderate wind caution
         │
         └──► Humidity Analysis
              └─ Humidity > 80% → High humidity alert
         │
         ▼
Output: Multiple recommendations in Vietnamese
```

## 🗂️ Component Architecture

```
App.js (Root)
  │
  └─── DashboardPage.js (Main Container)
         │
         ├─── Location Search Form
         │    └─── Quick Location Buttons
         │
         ├─── AnomalyDisplay.js
         │    └─── Conditional render (if anomaly)
         │
         ├─── Grid Row 1 (2 columns)
         │    ├─── CurrentWeather.js
         │    └─── Recommendation.js
         │
         ├─── Grid Row 2
         │    └─── HourlyForecastChart.js
         │         └─── Chart.js Line Chart
         │
         ├─── Grid Row 3
         │    └─── DailyForecast.js
         │         └─── 7 Forecast Cards
         │
         └─── Grid Row 4
              └─── LocationComparator.js
                   ├─── Input Forms (2 locations)
                   ├─── Comparison Table
                   └─── Chart.js Bar Chart
```

## 🛠️ Technology Stack Layers

```
┌─────────────────────────────────────────┐
│         PRESENTATION LAYER              │
│  - React Components                     │
│  - CSS Styling                          │
│  - Chart.js / D3.js                     │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│         APPLICATION LAYER               │
│  - React State Management (Hooks)       │
│  - Component Logic                      │
│  - Event Handlers                       │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│         SERVICE LAYER                   │
│  - weatherService.js                    │
│  - Axios HTTP Client                    │
│  - API Request/Response Handling        │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│         API GATEWAY                     │
│  - Laravel Routes                       │
│  - Middleware (CORS)                    │
│  - Request Validation                   │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│         BUSINESS LOGIC LAYER            │
│  - WeatherController                    │
│  - Data Processing                      │
│  - Anomaly Detection                    │
│  - Recommendation Generation            │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│         DATA ACCESS LAYER               │
│  - Guzzle HTTP Client                   │
│  - External API Integration             │
│  - Error Handling                       │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│         EXTERNAL DATA SOURCE            │
│  - Open-Meteo Weather API               │
│  - Free, No API Key                     │
└─────────────────────────────────────────┘
```

## 📱 Responsive Design Breakpoints

```
Desktop (> 1024px)
├─ Full grid layouts
├─ Side-by-side components
└─ Large charts

Tablet (768px - 1024px)
├─ Adjusted grid columns
├─ Stacked layouts
└─ Medium charts

Mobile (< 768px)
├─ Single column layout
├─ Stacked components
└─ Compact charts
```

## 🔐 Security Considerations

```
Frontend
├─ Input validation
├─ XSS prevention (React auto-escaping)
└─ HTTPS in production

Backend
├─ Request validation
├─ CORS configuration
├─ Rate limiting (recommended)
├─ Input sanitization
└─ Error message sanitization
```

---

**This architecture supports a scalable, maintainable, and performant weather dashboard application!**
