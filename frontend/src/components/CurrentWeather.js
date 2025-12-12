import React, { useState } from 'react';
import './CurrentWeather.css';

/**
 * CurrentWeather Component
 * Displays current weather conditions including temperature, humidity, wind speed, etc.
 */
const CurrentWeather = ({ data }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    if (!data) {
        return (
            <div className="current-weather loading">
                <p>Đang tải...</p>
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

    return (
        <div className={`current-weather ${isExpanded ? 'expanded' : 'collapsed'}`}>
            <button 
                className="toggle-weather-btn"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? "Thu nhỏ" : "Mở rộng"}
            >
                {isExpanded ? '−' : '+'}
            </button>

            <div className="weather-main">
                <div className="weather-icon">
                    {getWeatherIcon(data.weather_code)}
                </div>
                
                <div className="temperature-display">
                    <div className="main-temp">{data.temperature}°C</div>
                    {isExpanded && <div className="weather-desc">{data.weather_description}</div>}
                </div>
            </div>

            {isExpanded && (
                <>
                    <div className="weather-details">
                        <div className="detail-item">
                            <span className="detail-icon">🌡️</span>
                            <div className="detail-content">
                                <span className="detail-label">Cảm giác</span>
                                <span className="detail-value">{data.apparent_temperature}°</span>
                            </div>
                        </div>

                        <div className="detail-item">
                            <span className="detail-icon">💧</span>
                            <div className="detail-content">
                                <span className="detail-label">Độ ẩm</span>
                                <span className="detail-value">{data.humidity}%</span>
                            </div>
                        </div>

                        <div className="detail-item">
                            <span className="detail-icon">💨</span>
                            <div className="detail-content">
                                <span className="detail-label">Gió</span>
                                <span className="detail-value">{data.wind_speed} km/h</span>
                            </div>
                        </div>

                        <div className="detail-item">
                            <span className="detail-icon">🌧️</span>
                            <div className="detail-content">
                                <span className="detail-label">Mưa</span>
                                <span className="detail-value">{data.precipitation} mm</span>
                            </div>
                        </div>
                    </div>

                    <div className="weather-time">
                        Cập nhật: {new Date(data.time).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                    </div>
                </>
            )}
        </div>
    );
};

export default CurrentWeather;
