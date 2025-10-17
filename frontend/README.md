# React Frontend - Weather Dashboard

This is the React frontend for the Weather Analysis Dashboard. It provides a modern, responsive interface for viewing weather data.

## Quick Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm start
   ```

The app will open at `http://localhost:3000`

## Project Structure

```
src/
├── components/           # Reusable React components
│   ├── CurrentWeather.js
│   ├── HourlyForecastChart.js
│   ├── DailyForecast.js
│   ├── AnomalyDisplay.js
│   ├── Recommendation.js
│   └── LocationComparator.js
├── pages/               # Page components
│   └── DashboardPage.js
├── services/            # API service layer
│   └── weatherService.js
├── App.js              # Root component
└── index.js            # Entry point
```

## Components Overview

### 1. CurrentWeather
Displays real-time weather conditions:
- Temperature and "feels like" temperature
- Humidity and wind speed
- Weather description with emoji icons

### 2. HourlyForecastChart
Interactive Chart.js line chart showing:
- Temperature trends for next 24 hours
- Hover tooltips with detailed info
- Rain probability warnings

### 3. DailyForecast
7-day forecast cards displaying:
- Max/min temperatures
- Weather conditions
- UV index with color coding
- Precipitation amounts

### 4. AnomalyDisplay
Alert component that shows:
- Temperature anomaly warnings
- Comparison with 30-day average
- Visual indicators (hot/cold)

### 5. Recommendation
Smart suggestions based on:
- UV index levels
- Temperature extremes
- Weather conditions
- Wind speed and humidity

### 6. LocationComparator
Compare two locations with:
- Input forms for coordinates
- Comparison table
- Bar chart visualization

## API Service

The `weatherService.js` module provides:
- `fetchWeatherData(lat, lon)` - Get weather for a location
- `fetchComparisonData(location1, location2)` - Compare locations

## Configuration

### API Endpoint
Update the backend URL in `src/services/weatherService.js`:
```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

### Default Location
Change default location in `src/pages/DashboardPage.js`:
```javascript
const [location, setLocation] = useState({
    name: 'Your City',
    lat: YOUR_LATITUDE,
    lon: YOUR_LONGITUDE
});
```

## Available Scripts

### `npm start`
Runs the app in development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production to the `build` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

## Dependencies

- **react**: ^18.2.0
- **axios**: ^1.6.2 - HTTP client
- **chart.js**: ^4.4.0 - Charting library
- **react-chartjs-2**: ^5.2.0 - React wrapper for Chart.js
- **d3**: ^7.8.5 - Data visualization library

## Features

### Responsive Design
- Desktop: Full-width layout with side-by-side components
- Tablet: Adjusted grid layouts
- Mobile: Stacked single-column layout

### Quick Location Buttons
Pre-configured locations for easy access:
- Dĩ An, Hồ Chí Minh, Hà Nội
- Đà Nẵng, Nha Trang, Đà Lạt

### Loading States
- Spinner animations while fetching data
- Skeleton screens for components

### Error Handling
- User-friendly error messages
- Retry functionality
- Graceful degradation

## Styling

All components use CSS modules for scoped styling:
- Gradient backgrounds
- Smooth animations
- Hover effects
- Responsive breakpoints

### Color Scheme
- Primary: #667eea (Purple)
- Secondary: #764ba2 (Dark Purple)
- Success: #4caf50 (Green)
- Warning: #ffeb3b (Yellow)
- Danger: #f44336 (Red)

## Browser Support

Supports modern browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Lazy loading of components
- Memoization of expensive calculations
- Optimized re-renders with React hooks
- Efficient Chart.js configurations

## Development Tips

1. **Testing API calls**: Use browser DevTools Network tab
2. **Debugging**: React DevTools extension is helpful
3. **Styling**: CSS is in separate files for each component
4. **State management**: Uses React hooks (useState, useEffect)

## Troubleshooting

### API Connection Issues
- Check if backend is running on port 8000
- Verify CORS is configured in Laravel
- Check browser console for errors

### Charts Not Displaying
- Ensure Chart.js is properly installed
- Check data format matches Chart.js requirements
- Verify canvas element is rendered

### Styling Issues
- Clear browser cache
- Check CSS import paths
- Verify className usage

## Production Build

1. Update API_BASE_URL to production backend
2. Run `npm run build`
3. Deploy `build` folder to hosting service
4. Configure web server for SPA routing

## Future Enhancements

Potential features to add:
- Weather maps with D3.js
- Historical data charts
- User preferences storage
- Weather alerts/notifications
- Multi-language support
- Dark mode
