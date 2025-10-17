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
        if (code === 0 || code === 1) return '#FFD700'; // Sunny - Yellow
        if (code >= 51 && code <= 82) return '#87CEEB'; // Rain - Light Blue
        if (code >= 95 && code <= 99) return '#FF6347'; // Storm - Red
        return '#FFFFFF'; // Default - White
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
                                <div key={index} className="daily-forecast-item">
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
                                        <span className="temp-high">{day.temperature_max}°C</span>
                                        <span className="temp-separator">/</span>
                                        <span className="temp-low">{day.temperature_min}°C</span>
                                    </div>
                                    <div className="rain-info">
                                        Mưa: {day.precipitation_probability}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HourlyForecastChart;
