import React from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
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
    Title,
    Tooltip,
    Legend,
    Filler
);

/**
 * HourlyForecastChart Component
 * Displays a line chart showing temperature trends for the next 24 hours
 */
const HourlyForecastChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="hourly-forecast-chart loading">
                <p>Đang tải dữ liệu dự báo theo giờ...</p>
            </div>
        );
    }

    // Format time for display (show only hour)
    const formatTime = (timeString) => {
        const date = new Date(timeString);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    // Prepare chart data
    const chartData = {
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
                pointBorderWidth: 2
            }
        ]
    };

    // Chart options
    const options = {
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
            title: {
                display: false
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
                        const hourData = data[context.dataIndex];
                        return [
                            `Nhiệt độ: ${context.parsed.y}°C`,
                            `Thời tiết: ${hourData.weather_description}`,
                            `Xác suất mưa: ${hourData.precipitation_probability}%`
                        ];
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
                beginAtZero: false,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                },
                ticks: {
                    callback: function(value) {
                        return value + '°C';
                    },
                    font: {
                        size: 12
                    }
                }
            }
        },
        interaction: {
            intersect: false,
            mode: 'index'
        }
    };

    return (
        <div className="hourly-forecast-chart">
            <h2>Dự Báo Theo Giờ (24h Tới)</h2>
            <div className="chart-container">
                <Line data={chartData} options={options} />
            </div>
            
            {/* Show precipitation warnings if any */}
            {data.some(item => item.precipitation_probability > 50) && (
                <div className="rain-warning">
                    ⚠️ Có khả năng mưa trong vài giờ tới
                </div>
            )}
        </div>
    );
};

export default HourlyForecastChart;
