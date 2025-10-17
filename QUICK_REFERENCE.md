# Weather Dashboard - Quick Reference

## 🚀 Quick Start Commands

### Start Backend (Laravel)
```bash
cd backend
php artisan serve
```
→ Backend runs at: http://localhost:8000

### Start Frontend (React)
```bash
cd frontend
npm start
```
→ Frontend opens at: http://localhost:3000

---

## 📡 API Endpoints

### Get Weather Data
```
GET /api/weather/{lat}/{lon}
Example: GET /api/weather/10.98/106.75
```

### Compare Locations
```
POST /api/weather/comparison
Body: {
  "location1": {"lat": 10.98, "lon": 106.75, "name": "Di An"},
  "location2": {"lat": 21.03, "lon": 105.85, "name": "Ha Noi"}
}
```

---

## 📍 Pre-configured Locations

| City | Latitude | Longitude |
|------|----------|-----------|
| Dĩ An | 10.98 | 106.75 |
| Hồ Chí Minh | 10.82 | 106.63 |
| Hà Nội | 21.03 | 105.85 |
| Đà Nẵng | 16.07 | 108.22 |
| Nha Trang | 12.24 | 109.19 |
| Đà Lạt | 11.94 | 108.44 |

---

## 🔧 Common Commands

### Laravel
```bash
# Clear cache
php artisan cache:clear
php artisan config:clear

# View routes
php artisan route:list

# Run on different port
php artisan serve --port=8001
```

### React
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Run on different port
PORT=3001 npm start
```

---

## 📁 Project Structure

```
weatherPrj/
├── backend/
│   ├── app/Http/Controllers/WeatherController.php
│   ├── routes/api.php
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   └── services/
    └── package.json
```

---

## 🐛 Quick Fixes

### CORS Error
```bash
cd backend
php artisan config:clear
# Restart server
```

### Port in Use
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

### Missing Dependencies
```bash
# Backend
cd backend
composer install

# Frontend
cd frontend
npm install
```

---

## 🎨 Key Features

✅ Real-time weather data  
✅ 24-hour forecast chart  
✅ 7-day forecast cards  
✅ Anomaly detection (±5°C threshold)  
✅ Smart recommendations  
✅ Location comparison  
✅ Fully responsive design  

---

## 📊 Data Source

**Open-Meteo API**
- Free, no API key required
- Real-time weather data
- Historical data (30 days)
- Forecasts (7 days)
- Documentation: https://open-meteo.com/

---

## 🌐 URLs

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **API Base**: http://localhost:8000/api

---

## 📞 Support

Check these files for detailed help:
- `README.md` - Main documentation
- `SETUP_GUIDE.md` - Detailed setup instructions
- `backend/README.md` - Backend specifics
- `frontend/README.md` - Frontend specifics

---

**Happy coding! 🌤️**
