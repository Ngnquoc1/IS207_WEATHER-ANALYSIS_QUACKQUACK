import React from 'react';
import './DailyForecast.css';

/**
 * DailyForecast Component
 * Displays a 7-day weather forecast in card format
 */
const DailyForecast = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="daily-forecast loading">
                <p>Đang tải dự báo 7 ngày...</p>
            </div>
        );
    }

    // Get weather icon based on weather code
    const getWeatherIcon = (code) => {
        const iconMap = {
            0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
            45: '🌫️', 48: '🌫️',
            51: '🌦️', 53: '🌦️', 55: '🌦️',
            61: '🌧️', 63: '🌧️', 65: '🌧️',
            71: '🌨️', 73: '🌨️', 75: '🌨️', 77: '🌨️',
            80: '🌦️', 81: '🌦️', 82: '⛈️',
            85: '🌨️', 86: '🌨️',
            95: '⛈️', 96: '⛈️', 99: '⛈️'
        };
        return iconMap[code] || '🌡️';
    };

    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Check if it's today or tomorrow
        if (date.toDateString() === today.toDateString()) {
            return 'Hôm nay';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Ngày mai';
        }

        return date.toLocaleDateString('vi-VN', { 
            weekday: 'short', 
            day: 'numeric', 
            month: 'numeric' 
        });
    };

    // Get UV index color
    const getUVColor = (uvIndex) => {
        if (uvIndex < 3) return '#4caf50'; // Low - Green
        if (uvIndex < 6) return '#ffeb3b'; // Moderate - Yellow
        if (uvIndex < 8) return '#ff9800'; // High - Orange
        if (uvIndex < 11) return '#f44336'; // Very High - Red
        return '#9c27b0'; // Extreme - Purple
    };

    return (
        <div className="daily-forecast">
            <h2>Dự Báo 7 Ngày</h2>
            
            <div className="forecast-cards">
                {data.map((day, index) => (
                    <div key={index} className="forecast-card">
                        <div className="card-date">{formatDate(day.date)}</div>
                        
                        <div className="card-icon">
                            {getWeatherIcon(day.weather_code)}
                        </div>
                        
                        <div className="card-description">
                            {day.weather_description}
                        </div>
                        
                        <div className="card-temps">
                            <span className="temp-max">{day.max_temperature}°</span>
                            <span className="temp-divider">/</span>
                            <span className="temp-min">{day.min_temperature}°</span>
                        </div>
                        
                        <div className="card-details">
                            <div className="detail-row">
                                <span 
                                    className="uv-badge" 
                                    style={{ backgroundColor: getUVColor(day.uv_index) }}
                                >
                                    UV: {day.uv_index}
                                </span>
                            </div>
                            
                            {day.precipitation_sum > 0 && (
                                <div className="detail-row">
                                    <span className="precipitation">
                                        🌧️ {day.precipitation_sum} mm
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DailyForecast;
