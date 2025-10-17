import React, { useState, useEffect } from 'react';
import { fetchWeatherData } from '../services/weatherService';
import CurrentWeather from '../components/CurrentWeather';
import HourlyForecastChart from '../components/HourlyForecastChart';
import DailyForecast from '../components/DailyForecast';
import AnomalyDisplay from '../components/AnomalyDisplay';
import Recommendation from '../components/Recommendation';
import LocationComparator from '../components/LocationComparator';
import './DashboardPage.css';

/**
 * DashboardPage Component
 * Main dashboard that displays all weather information and components
 */
const DashboardPage = () => {
    // State for selected location (default: Dĩ An)
    const [location, setLocation] = useState({
        name: 'Dĩ An',
        lat: 10.98,
        lon: 106.75
    });

    // State for weather data
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for location input
    const [locationInput, setLocationInput] = useState({
        name: 'Dĩ An',
        lat: '10.98',
        lon: '106.75'
    });

    // Fetch weather data when component mounts or location changes
    useEffect(() => {
        const loadWeatherData = async () => {
            setLoading(true);
            setError(null);

            try {
                const data = await fetchWeatherData(location.lat, location.lon);
                setWeatherData(data);
            } catch (err) {
                setError('Không thể tải dữ liệu thời tiết. Vui lòng thử lại sau.');
                console.error('Error loading weather data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadWeatherData();
    }, [location]);

    // Handle location change
    const handleLocationChange = (e) => {
        e.preventDefault();
        setLocation({
            name: locationInput.name,
            lat: parseFloat(locationInput.lat),
            lon: parseFloat(locationInput.lon)
        });
    };

    // Pre-defined locations for quick access
    const quickLocations = [
        { name: 'Dĩ An', lat: 10.98, lon: 106.75 },
        { name: 'Hồ Chí Minh', lat: 10.82, lon: 106.63 },
        { name: 'Hà Nội', lat: 21.03, lon: 105.85 },
        { name: 'Đà Nẵng', lat: 16.07, lon: 108.22 },
        { name: 'Nha Trang', lat: 12.24, lon: 109.19 },
        { name: 'Đà Lạt', lat: 11.94, lon: 108.44 }
    ];

    const handleQuickLocation = (loc) => {
        setLocationInput({
            name: loc.name,
            lat: loc.lat.toString(),
            lon: loc.lon.toString()
        });
        setLocation(loc);
    };

    return (
        <div className="dashboard-page">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-content">
                    <h1>🌤️ Weather Analysis Dashboard</h1>
                    <p className="header-subtitle">Phân tích và dự báo thời tiết chi tiết</p>
                </div>
            </header>

            {/* Location Search */}
            <div className="location-search-section">
                <form onSubmit={handleLocationChange} className="location-form">
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Tên địa điểm"
                            value={locationInput.name}
                            onChange={(e) => setLocationInput({ ...locationInput, name: e.target.value })}
                            className="location-input"
                        />
                        <input
                            type="number"
                            step="any"
                            placeholder="Vĩ độ"
                            value={locationInput.lat}
                            onChange={(e) => setLocationInput({ ...locationInput, lat: e.target.value })}
                            className="location-input small"
                        />
                        <input
                            type="number"
                            step="any"
                            placeholder="Kinh độ"
                            value={locationInput.lon}
                            onChange={(e) => setLocationInput({ ...locationInput, lon: e.target.value })}
                            className="location-input small"
                        />
                        <button type="submit" className="search-button">
                            🔍 Tìm kiếm
                        </button>
                    </div>
                </form>

                {/* Quick Location Buttons */}
                <div className="quick-locations">
                    <span className="quick-label">Địa điểm nhanh:</span>
                    {quickLocations.map((loc, index) => (
                        <button
                            key={index}
                            onClick={() => handleQuickLocation(loc)}
                            className={`quick-button ${location.name === loc.name ? 'active' : ''}`}
                        >
                            📍 {loc.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <main className="dashboard-content">
                {loading && (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Đang tải dữ liệu thời tiết cho {location.name}...</p>
                    </div>
                )}

                {error && (
                    <div className="error-container">
                        <div className="error-icon">⚠️</div>
                        <p>{error}</p>
                        <button onClick={() => window.location.reload()} className="retry-button">
                            Thử lại
                        </button>
                    </div>
                )}

                {!loading && !error && weatherData && (
                    <>
                        {/* Current Location Display */}
                        <div className="current-location-banner">
                            <h2>📍 {location.name}</h2>
                            <p>
                                Vĩ độ: {weatherData.location.latitude}° | 
                                Kinh độ: {weatherData.location.longitude}° | 
                                Múi giờ: {weatherData.location.timezone}
                            </p>
                        </div>

                        {/* Anomaly Alert (if exists) */}
                        <AnomalyDisplay anomalyData={weatherData.anomaly} />

                        {/* Current Weather & Recommendations Row */}
                        <div className="grid-row two-columns">
                            <CurrentWeather data={weatherData.current_weather} />
                            <Recommendation recommendation={weatherData.recommendation} />
                        </div>

                        {/* Hourly Forecast Chart */}
                        <div className="grid-row">
                            <HourlyForecastChart data={weatherData.hourly_forecast} />
                        </div>

                        {/* Daily Forecast */}
                        <div className="grid-row">
                            <DailyForecast data={weatherData.daily_forecast} />
                        </div>

                        {/* Location Comparator */}
                        <div className="grid-row">
                            <LocationComparator />
                        </div>
                    </>
                )}
            </main>

            {/* Footer */}
            <footer className="dashboard-footer">
                <p>
                    Dữ liệu thời tiết được cung cấp bởi{' '}
                    <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">
                        Open-Meteo API
                    </a>
                </p>
                <p className="footer-note">
                    Weather Analysis Dashboard © 2024 | Cập nhật thời gian thực
                </p>
            </footer>
        </div>
    );
};

export default DashboardPage;
