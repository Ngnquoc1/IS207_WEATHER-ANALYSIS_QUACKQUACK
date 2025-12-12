import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Modal } from './common';
import './HourlyForecastChart.css';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

/**
 * ForecastTabs Component
 * Displays 24h forecast chart and 7-day forecast list with tabs
 */
const HourlyForecastChart = ({ data, dailyData }) => {
    const [activeTab, setActiveTab] = useState('24h');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDay, setSelectedDay] = useState(null);

    if (!data || data.length === 0) {
        return (
            <div className="forecast-tabs loading">
                <p>Đang tải dữ liệu dự báo...</p>
            </div>
        );
    }

    // Format time for display (show only hour)
    const formatTime = (timeString) => {
        const date = new Date(timeString);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    // Format date for 7-day forecast
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
        const dayName = days[date.getDay()];
        const dayMonth = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        return `${dayName}, ${dayMonth}`;
    };

    // Get weather description in Vietnamese
    const getWeatherDescription = (code) => {
        const weatherMap = {
            0: 'Nắng', 1: 'Chủ yếu nắng', 2: 'Có mây một phần', 3: 'Nhiều mây',
            45: 'Sương mù', 48: 'Sương mù đóng băng',
            51: 'Mưa phùn nhẹ', 53: 'Mưa phùn vừa', 55: 'Mưa phùn dày đặc',
            61: 'Mưa nhỏ', 63: 'Mưa vừa', 65: 'Mưa to',
            71: 'Tuyết rơi nhẹ', 73: 'Tuyết rơi vừa', 75: 'Tuyết rơi nặng', 77: 'Tuyết dạng hạt',
            80: 'Mưa rào nhẹ', 81: 'Mưa rào vừa', 82: 'Mưa rào dữ dội',
            85: 'Tuyết rơi nhẹ', 86: 'Tuyết rơi nặng',
            95: 'Giông bão', 96: 'Giông có mưa đá nhẹ', 99: 'Giông có mưa đá nặng'
        };
        return weatherMap[code] || 'Không xác định';
    };

    // Get weather color based on condition
    const getWeatherColor = (code) => {
        if (code === 0 || code === 1) return 'var(--weather-sunny)'; // Sunny
        if (code >= 51 && code <= 82) return 'var(--weather-rain)'; // Rain
        if (code >= 95 && code <= 99) return 'var(--weather-storm)'; // Storm
        if (code > 1 && code < 51) return 'var(--weather-cloud)'; // Cloudy/Fog
        return 'var(--weather-default)'; // Default
    };

    // Handle day click to open modal
    const handleDayClick = (day) => {
        setSelectedDay(day);
        setIsModalOpen(true);
    };

    // Close modal
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedDay(null);
    };

    // Get detailed weather information for modal
    const getDetailedWeatherInfo = (day) => {
        if (!day) return null;
        
        return {
            date: formatDate(day.date),
            weather: getWeatherDescription(day.weather_code),
            weatherColor: getWeatherColor(day.weather_code),
            
            // Nhiệt độ chi tiết theo Open-Meteo API
            temperature: {
                max: day.temperature_2m_max || day.max_temperature,
                min: day.temperature_2m_min || day.min_temperature,
                mean: day.temperature_2m_mean || Math.round(((day.temperature_2m_max || day.max_temperature) + (day.temperature_2m_min || day.min_temperature)) / 2)
            },
            
            // Mưa chi tiết theo Open-Meteo API
            precipitation: {
                sum: day.precipitation_sum || 0,
                probability: day.precipitation_probability_max || 0,
                rain: day.rain_sum || 0,
                showers: day.showers_sum || 0,
                snowfall: day.snowfall_sum || 0
            },
            
            // Gió chi tiết theo Open-Meteo API
            wind: {
                speed: day.windspeed_10m_max || day.wind_speed_max || 0,
                direction: day.winddirection_10m_dominant || day.wind_direction_dominant || 0
            },
            
            // Áp suất theo Open-Meteo API
            pressure: {
                max: day.pressure_msl_max || 0,
                min: day.pressure_msl_min || 0,
                mean: day.pressure_msl_mean || 0
            },
            
            // Độ ẩm chi tiết theo Open-Meteo API
            humidity: {
                max: day.relative_humidity_2m_max || day.relative_humidity_max || 0,
                min: day.relative_humidity_2m_min || 0,
                mean: day.relative_humidity_2m_mean || 0
            },
            
            // UV chi tiết theo Open-Meteo API
            uv: {
                max: day.uv_index_max || day.uv_index || 0,
                clearSky: day.uv_index_clear_sky_max || 0
            }
        };
    };

    // 24h Chart Data
    const chart24hData = {
        labels: data.map(item => formatTime(item.time)),
        datasets: [
            {
                label: 'Nhiệt độ (°C)',
                data: data.map(item => item.temperature),
                borderColor: 'rgb(102, 126, 234)',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointHoverRadius: 6,
                pointBackgroundColor: 'rgb(102, 126, 234)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                yAxisID: 'y'
            },
            {
                label: 'Khả năng mưa (%)',
                data: data.map(item => item.precipitation_probability),
                backgroundColor: 'rgba(135, 206, 235, 0.6)',
                borderColor: 'rgba(135, 206, 235, 1)',
                borderWidth: 1,
                yAxisID: 'y1'
            }
        ]
    };

    // 24h Chart Options
    const chart24hOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    font: {
                        size: 14,
                        weight: '600'
                    },
                    padding: 15,
                    usePointStyle: true
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: {
                    size: 14,
                    weight: 'bold'
                },
                bodyFont: {
                    size: 13
                },
                callbacks: {
                    label: function(context) {
                        if (context.datasetIndex === 0) {
                            return `Nhiệt độ: ${context.parsed.y}°C`;
                        } else {
                            return `Khả năng mưa: ${context.parsed.y}%`;
                        }
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    maxRotation: 45,
                    minRotation: 45,
                    font: {
                        size: 11
                    }
                }
            },
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                beginAtZero: false,
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    callback: function(value) {
                        return value + '°C';
                    },
                    font: {
                        size: 12
                    },
                    color: 'rgba(255, 255, 255, 0.8)'
                }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                beginAtZero: true,
                max: 100,
                grid: {
                    drawOnChartArea: false,
                },
                ticks: {
                    callback: function(value) {
                        return value + '%';
                    },
                    font: {
                        size: 12
                    },
                    color: 'rgba(255, 255, 255, 0.8)'
                }
            }
        },
        interaction: {
            intersect: false,
            mode: 'index'
        }
    };

    return (
        <div className="forecast-tabs">
            {/* Tabs */}
            <div className="forecast-tabs-header">
                <button 
                    className={`tab-button ${activeTab === '24h' ? 'active' : ''}`}
                    onClick={() => setActiveTab('24h')}
                >
                    Dự báo 24h
                </button>
                <button 
                    className={`tab-button ${activeTab === '7day' ? 'active' : ''}`}
                    onClick={() => setActiveTab('7day')}
                >
                    Dự báo 7 ngày
                </button>
            </div>

            {/* Tab Content */}
            <div className="forecast-tabs-content">
                {activeTab === '24h' && (
                    <div className="tab-panel">
                        <p className="chart-description">
                            Biểu đồ nhiệt độ và xác suất mưa trong 24 giờ tới.
                        </p>
                        <div className="chart-container">
                            <Line data={chart24hData} options={chart24hOptions} />
                        </div>
                        {/* Show precipitation warnings if any */}
                        <div className="rain-warning-container">
                        {data.some(item => item.precipitation_probability > 50) && (
                            <div className="rain-warning">
                                ⚠️ Có khả năng mưa trong vài giờ tới
                            </div>
                        )}
                        </div>
                    </div>
                )}

                {activeTab === '7day' && (
                    <div className="tab-panel">
                        <div className="daily-forecast-list">
                            {dailyData && dailyData.map((day, index) => (
                                <div 
                                    key={index} 
                                    className="daily-forecast-item clickable"
                                    onClick={() => handleDayClick(day)}
                                >
                                    <div className="day-info">
                                        <h3>{formatDate(day.date)}</h3>
                                        <span 
                                            className="weather-condition"
                                            style={{ color: getWeatherColor(day.weather_code) }}
                                        >
                                            {getWeatherDescription(day.weather_code)}
                                        </span>
                                    </div>
                                    <div className="temperature-info">
                                        <span className="temp-high">{day.temperature_2m_max || day.max_temperature}°C</span>
                                        <span className="temp-separator">/</span>
                                        <span className="temp-low">{day.temperature_2m_min || day.min_temperature}°C</span>
                                    </div>
                                    <div className="rain-info">
                                        Mưa: {day.precipitation_probability_max || day.precipitation_probability || 0}%
                                    </div>
                                    <div className="click-hint">
                                        Nhấn để xem chi tiết
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Day Details Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={selectedDay ? formatDate(selectedDay.date) : ''}
                size="large"
            >
                {selectedDay && (() => {
                    const details = getDetailedWeatherInfo(selectedDay);
                    return (
                        <div className="day-details-modal">
                            {/* Weather Overview */}
                            <div className="weather-overview">
                                <div className="weather-icon">
                                    <span 
                                        className="weather-condition-large"
                                        style={{ color: details.weatherColor }}
                                    >
                                        {details.weather}
                                    </span>
                                </div>
                                <div className="temperature-overview">
                                    <div className="temp-main">{details.temperature.mean}°C</div>
                                    <div className="temp-range">
                                        {details.temperature.max}°C / {details.temperature.min}°C
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Information Grid */}
                            <div className="details-grid">
                                <div className="detail-item">
                                    <div className="detail-label">🌡️ Nhiệt độ</div>
                                    <div className="detail-value">
                                        <div>Cao nhất: {details.temperature.max}°C</div>
                                        <div>Thấp nhất: {details.temperature.min}°C</div>
                                        <div>Trung bình: {details.temperature.mean}°C</div>
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <div className="detail-label">🌧️ Mưa</div>
                                    <div className="detail-value">
                                        <div>Khả năng: {details.precipitation.probability}%</div>
                                        <div>Tổng lượng: {details.precipitation.sum}mm</div>
                                        <div>Mưa rào: {details.precipitation.rain}mm</div>
                                        <div>Mưa phùn: {details.precipitation.showers}mm</div>
                                        <div>Tuyết: {details.precipitation.snowfall}mm</div>
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <div className="detail-label">💨 Gió</div>
                                    <div className="detail-value">
                                        <div>Tốc độ tối đa: {details.wind.speed} km/h</div>
                                        <div>Hướng chủ đạo: {details.wind.direction}°</div>
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <div className="detail-label">💧 Độ ẩm</div>
                                    <div className="detail-value">
                                        {details.humidity.max > 0 ? (
                                            <>
                                                <div>Tối đa: {details.humidity.max}%</div>
                                                <div>Tối thiểu: {details.humidity.min}%</div>
                                                <div>Trung bình: {details.humidity.mean}%</div>
                                            </>
                                        ) : (
                                            <div style={{color: '#999', fontStyle: 'italic'}}>Dữ liệu độ ẩm chưa có</div>
                                        )}
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <div className="detail-label">🌬️ Áp suất</div>
                                    <div className="detail-value">
                                        {details.pressure.max > 0 ? (
                                            <>
                                                <div>Tối đa: {details.pressure.max} hPa</div>
                                                <div>Tối thiểu: {details.pressure.min} hPa</div>
                                                <div>Trung bình: {details.pressure.mean} hPa</div>
                                            </>
                                        ) : (
                                            <div style={{color: '#999', fontStyle: 'italic'}}>Dữ liệu áp suất chưa có</div>
                                        )}
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <div className="detail-label">☀️ Chỉ số UV</div>
                                    <div className="detail-value">
                                        <div>Tối đa: {details.uv.max}</div>
                                        <div>Trời quang: {details.uv.clearSky}</div>
                                        <div className={`uv-level uv-${details.uv.max <= 2 ? 'low' : details.uv.max <= 5 ? 'moderate' : details.uv.max <= 7 ? 'high' : details.uv.max <= 10 ? 'very-high' : 'extreme'}`}>
                                            {details.uv.max <= 2 ? 'Thấp' : details.uv.max <= 5 ? 'Trung bình' : details.uv.max <= 7 ? 'Cao' : details.uv.max <= 10 ? 'Rất cao' : 'Cực cao'}
                                        </div>
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <div className="detail-label">📊 Tổng quan</div>
                                    <div className="detail-value">
                                        <div>Điều kiện: {details.weather}</div>
                                        <div>Ngày: {details.date}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Recommendations */}
                            <div className="recommendations">
                                <h4>💡 Khuyến nghị</h4>
                                <ul>
                                    {details.temperature.max > 30 && (
                                        <li>Nhiệt độ cao, nên mặc quần áo mát mẻ và uống nhiều nước</li>
                                    )}
                                    {details.precipitation.probability > 50 && (
                                        <li>Khả năng mưa cao, nên mang theo ô hoặc áo mưa</li>
                                    )}
                                    {details.precipitation.sum > 10 && (
                                        <li>Lượng mưa lớn, tránh đi đường ngập nước</li>
                                    )}
                                    {details.uv.max > 6 && (
                                        <li>Chỉ số UV cao, nên sử dụng kem chống nắng</li>
                                    )}
                                    {details.wind.speed > 20 && (
                                        <li>Gió mạnh, cẩn thận khi đi đường</li>
                                    )}
                                    {details.temperature.min < 15 && (
                                        <li>Nhiệt độ thấp vào sáng sớm, nên mặc áo ấm</li>
                                    )}
                                    {details.humidity.max > 80 && (
                                        <li>Độ ẩm cao, có thể gây khó chịu</li>
                                    )}
                                    {details.pressure.mean < 1000 && (
                                        <li>Áp suất thấp, có thể ảnh hưởng đến sức khỏe</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    );
                })()}
            </Modal>
        </div>
    );
};

export default HourlyForecastChart;
