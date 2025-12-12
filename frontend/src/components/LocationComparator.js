import React, { useState, useEffect, useRef } from 'react';
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
import { fetchComparisonData, fetchLocationByName } from '../services/weatherService';
import { useTheme } from '../contexts/ThemeContext';
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

const LocationSearchInput = ({ label, location, onLocationChange, placeholder }) => {
    const [query, setQuery] = useState(location.name);
    const [results, setResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const wrapperRef = useRef(null);

    // Update query when location name changes externally
    useEffect(() => {
        setQuery(location.name);
    }, [location.name]);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (!query || query.length < 2 || query === location.name) {
                setResults([]);
                return;
            }

            setIsSearching(true);
            try {
                const data = await fetchLocationByName(query);
                setResults(data || []);
                setShowDropdown(true);
            } catch (error) {
                console.error('Search error:', error);
                setResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query, location.name]);

    const handleSelect = (item) => {
        onLocationChange({
            name: item.name,
            lat: item.latitude,
            lon: item.longitude
        });
        setQuery(item.name);
        setShowDropdown(false);
    };

    const handleInputChange = (e) => {
        setQuery(e.target.value);
        // Reset lat/lon if user changes name manually to prevent mismatch
        // But we keep the name so they can type
        if (e.target.value !== location.name) {
             // We don't update parent immediately to avoid clearing lat/lon while typing
             // But effectively the "current" lat/lon is now potentially invalid for the new name
        }
    };

    return (
        <div className="location-group" ref={wrapperRef}>
            <h3>{label}</h3>
            <div className="search-input-wrapper">
                <input
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => {
                        if (results.length > 0) setShowDropdown(true);
                    }}
                    className="location-search-input"
                />
                {isSearching && <div className="search-spinner"></div>}
                
                {showDropdown && results.length > 0 && (
                    <ul className="search-dropdown">
                        {results.map((item) => (
                            <li key={item.id} onClick={() => handleSelect(item)}>
                                <div className="location-name">{item.name}</div>
                                <div className="location-detail">
                                    {item.admin1 ? `${item.admin1}, ` : ''}{item.country}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

/**
 * LocationComparator Component
 * Allows users to compare weather between two locations
 */
const LocationComparator = () => {
    const { isDark } = useTheme();
    
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

    const validateCoordinates = (loc) => {
        const lat = parseFloat(loc.lat);
        const lon = parseFloat(loc.lon);
        const isLatValid = !isNaN(lat) && lat >= -90 && lat <= 90;
        const isLonValid = !isNaN(lon) && lon >= -180 && lon <= 180;
        return isLatValid && isLonValid;
    };

    // Handle form submission
    const handleCompare = async (e) => {
        e.preventDefault();
        setError(null);

        if (!validateCoordinates(location1) || !validateCoordinates(location2)) {
            setError('Vui lòng chọn địa điểm hợp lệ từ danh sách gợi ý.');
            return;
        }

        setLoading(true);

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
            setError('Không thể so sánh thời tiết. Vui lòng thử lại.');
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
                    padding: 15,
                    color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'
                }
            },
            tooltip: {
                backgroundColor: isDark ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                titleColor: isDark ? 'white' : 'black',
                bodyColor: isDark ? 'white' : 'black',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                borderWidth: 1,
                padding: 12
            }
        },
        scales: {
            x: {
                ticks: {
                    color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
                    font: {
                        size: 12
                    }
                },
                grid: {
                    color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
                    font: {
                        size: 12
                    }
                },
                grid: {
                    color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                }
            }
        }
    };

    return (
        <div className="location-comparator">
            <h2>So Sánh Thời Tiết</h2>

            <form onSubmit={handleCompare} className="comparison-form">
                <div className="location-inputs">
                    <LocationSearchInput 
                        label="Địa điểm 1"
                        location={location1}
                        onLocationChange={setLocation1}
                        placeholder="Nhập tên thành phố (VD: Hà Nội)"
                    />
                    
                    <LocationSearchInput 
                        label="Địa điểm 2"
                        location={location2}
                        onLocationChange={setLocation2}
                        placeholder="Nhập tên thành phố (VD: Đà Nẵng)"
                    />
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
            {/* Search Modal Removed */}
        </div>
    );
};

export default LocationComparator;
