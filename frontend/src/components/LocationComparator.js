import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { fetchComparisonData } from '../services/weatherService';
import './LocationComparator.css';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

/**
 * LocationComparator Component
 * Allows users to compare weather between two locations
 */
const LocationComparator = () => {
    const [location1, setLocation1] = useState({
        name: 'Dĩ An',
        lat: '10.98',
        lon: '106.75'
    });

    const [location2, setLocation2] = useState({
        name: 'Hà Nội',
        lat: '21.03',
        lon: '105.85'
    });

    const [comparisonData, setComparisonData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Handle form submission
    const handleCompare = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = await fetchComparisonData(
                {
                    lat: parseFloat(location1.lat),
                    lon: parseFloat(location1.lon),
                    name: location1.name
                },
                {
                    lat: parseFloat(location2.lat),
                    lon: parseFloat(location2.lon),
                    name: location2.name
                }
            );
            setComparisonData(data);
        } catch (err) {
            setError('Không thể so sánh thời tiết. Vui lòng kiểm tra lại tọa độ.');
            console.error('Comparison error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Prepare chart data
    const getChartData = () => {
        if (!comparisonData) return null;

        const loc1 = comparisonData.location1;
        const loc2 = comparisonData.location2;

        return {
            labels: ['Nhiệt độ (°C)', 'Cảm giác như (°C)', 'Độ ẩm (%)', 'Tốc độ gió (km/h)'],
            datasets: [
                {
                    label: loc1.name,
                    data: [
                        loc1.current_weather.temperature,
                        loc1.current_weather.apparent_temperature,
                        loc1.current_weather.humidity,
                        loc1.current_weather.wind_speed
                    ],
                    backgroundColor: 'rgba(102, 126, 234, 0.7)',
                    borderColor: 'rgb(102, 126, 234)',
                    borderWidth: 2
                },
                {
                    label: loc2.name,
                    data: [
                        loc2.current_weather.temperature,
                        loc2.current_weather.apparent_temperature,
                        loc2.current_weather.humidity,
                        loc2.current_weather.wind_speed
                    ],
                    backgroundColor: 'rgba(255, 99, 132, 0.7)',
                    borderColor: 'rgb(255, 99, 132)',
                    borderWidth: 2
                }
            ]
        };
    };

    // Chart options
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: {
                        size: 14,
                        weight: '600'
                    },
                    padding: 15
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            }
        }
    };

    return (
        <div className="location-comparator">
            <h2>🔍 So Sánh Thời Tiết</h2>

            <form onSubmit={handleCompare} className="comparison-form">
                <div className="location-inputs">
                    {/* Location 1 */}
                    <div className="location-group">
                        <h3>Địa điểm 1</h3>
                        <input
                            type="text"
                            placeholder="Tên địa điểm"
                            value={location1.name}
                            onChange={(e) => setLocation1({ ...location1, name: e.target.value })}
                            required
                        />
                        <div className="coord-inputs">
                            <input
                                type="number"
                                step="any"
                                placeholder="Vĩ độ (Latitude)"
                                value={location1.lat}
                                onChange={(e) => setLocation1({ ...location1, lat: e.target.value })}
                                required
                            />
                            <input
                                type="number"
                                step="any"
                                placeholder="Kinh độ (Longitude)"
                                value={location1.lon}
                                onChange={(e) => setLocation1({ ...location1, lon: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {/* Location 2 */}
                    <div className="location-group">
                        <h3>Địa điểm 2</h3>
                        <input
                            type="text"
                            placeholder="Tên địa điểm"
                            value={location2.name}
                            onChange={(e) => setLocation2({ ...location2, name: e.target.value })}
                            required
                        />
                        <div className="coord-inputs">
                            <input
                                type="number"
                                step="any"
                                placeholder="Vĩ độ (Latitude)"
                                value={location2.lat}
                                onChange={(e) => setLocation2({ ...location2, lat: e.target.value })}
                                required
                            />
                            <input
                                type="number"
                                step="any"
                                placeholder="Kinh độ (Longitude)"
                                value={location2.lon}
                                onChange={(e) => setLocation2({ ...location2, lon: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                </div>

                <button type="submit" className="compare-button" disabled={loading}>
                    {loading ? 'Đang so sánh...' : 'So Sánh'}
                </button>
            </form>

            {error && (
                <div className="error-message">
                    ⚠️ {error}
                </div>
            )}

            {comparisonData && (
                <div className="comparison-results">
                    {/* Comparison Table */}
                    <div className="comparison-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Thông số</th>
                                    <th>{comparisonData.location1.name}</th>
                                    <th>{comparisonData.location2.name}</th>
                                    <th>Chênh lệch</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Nhiệt độ</td>
                                    <td>{comparisonData.location1.current_weather.temperature}°C</td>
                                    <td>{comparisonData.location2.current_weather.temperature}°C</td>
                                    <td className={comparisonData.differences.temperature_diff > 0 ? 'positive' : 'negative'}>
                                        {comparisonData.differences.temperature_diff > 0 ? '+' : ''}
                                        {comparisonData.differences.temperature_diff}°C
                                    </td>
                                </tr>
                                <tr>
                                    <td>Cảm giác như</td>
                                    <td>{comparisonData.location1.current_weather.apparent_temperature}°C</td>
                                    <td>{comparisonData.location2.current_weather.apparent_temperature}°C</td>
                                    <td className={comparisonData.differences.apparent_temperature_diff > 0 ? 'positive' : 'negative'}>
                                        {comparisonData.differences.apparent_temperature_diff > 0 ? '+' : ''}
                                        {comparisonData.differences.apparent_temperature_diff}°C
                                    </td>
                                </tr>
                                <tr>
                                    <td>Độ ẩm</td>
                                    <td>{comparisonData.location1.current_weather.humidity}%</td>
                                    <td>{comparisonData.location2.current_weather.humidity}%</td>
                                    <td className={comparisonData.differences.humidity_diff > 0 ? 'positive' : 'negative'}>
                                        {comparisonData.differences.humidity_diff > 0 ? '+' : ''}
                                        {comparisonData.differences.humidity_diff}%
                                    </td>
                                </tr>
                                <tr>
                                    <td>Tốc độ gió</td>
                                    <td>{comparisonData.location1.current_weather.wind_speed} km/h</td>
                                    <td>{comparisonData.location2.current_weather.wind_speed} km/h</td>
                                    <td className={comparisonData.differences.wind_speed_diff > 0 ? 'positive' : 'negative'}>
                                        {comparisonData.differences.wind_speed_diff > 0 ? '+' : ''}
                                        {comparisonData.differences.wind_speed_diff} km/h
                                    </td>
                                </tr>
                                <tr>
                                    <td>Thời tiết</td>
                                    <td>{comparisonData.location1.current_weather.weather_description}</td>
                                    <td>{comparisonData.location2.current_weather.weather_description}</td>
                                    <td>-</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Comparison Chart */}
                    <div className="comparison-chart">
                        <h3>Biểu đồ so sánh</h3>
                        <div className="chart-container">
                            <Bar data={getChartData()} options={chartOptions} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocationComparator;
