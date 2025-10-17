import React from 'react';
import './CurrentWeather.css';

/**
 * CurrentWeather Component
 * Displays current weather conditions including temperature, humidity, wind speed, etc.
 */
const CurrentWeather = ({ data }) => {
    if (!data) {
        return (
            <div className="current-weather loading">
                <p>Đang tải dữ liệu thời tiết...</p>
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
        <div className="current-weather">
            <h2>Thời Tiết Hiện Tại</h2>
            
            <div className="weather-main">
                <div className="weather-icon">
                    {getWeatherIcon(data.weather_code)}
                </div>
                
                <div className="temperature-display">
                    <div className="main-temp">{data.temperature}°C</div>
                    <div className="weather-desc">{data.weather_description}</div>
                </div>
            </div>

            <div className="weather-details">
                <div className="detail-item">
                    <span className="detail-icon">🌡️</span>
                    <div className="detail-content">
                        <span className="detail-label">Cảm giác như</span>
                        <span className="detail-value">{data.apparent_temperature}°C</span>
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
                        <span className="detail-label">Tốc độ gió</span>
                        <span className="detail-value">{data.wind_speed} km/h</span>
                    </div>
                </div>

                <div className="detail-item">
                    <span className="detail-icon">🌧️</span>
                    <div className="detail-content">
                        <span className="detail-label">Lượng mưa</span>
                        <span className="detail-value">{data.precipitation} mm</span>
                    </div>
                </div>
            </div>

            <div className="weather-time">
                Cập nhật lúc: {new Date(data.time).toLocaleString('vi-VN')}
            </div>
        </div>
    );
};

export default CurrentWeather;
