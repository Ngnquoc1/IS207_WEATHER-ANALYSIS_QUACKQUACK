import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import RainMap from '../components/RainMap'; // eslint-disable-line no-unused-vars
import './SearchPage.css';

const SearchPage = () => {
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const [customLat, setCustomLat] = useState('');
    const [customLon, setCustomLon] = useState('');
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Handle coordinate input
    const handleCustomLocation = () => {
        const lat = parseFloat(customLat);
        const lon = parseFloat(customLon);

        if (isNaN(lat) || isNaN(lon)) {
            setError('Vui lòng nhập tọa độ hợp lệ');
            return;
        }

        if (lat < -90 || lat > 90) {
            setError('Vĩ độ phải nằm trong khoảng -90 đến 90');
            return;
        }

        if (lon < -180 || lon > 180) {
            setError('Kinh độ phải nằm trong khoảng -180 đến 180');
            return;
        }

        setError('');
        setLoading(true);

        // Simulate API call to get location name
        setTimeout(() => {
            const locationName = `Tọa độ ${lat.toFixed(4)}, ${lon.toFixed(4)}`;
            const locationData = {
                name: locationName,
                latitude: lat,
                longitude: lon
            };
            
            setSelectedLocation(locationData);
            setLoading(false);
        }, 1000);
    };


    // Handle location selection and navigate to dashboard
    const handleSelectLocation = () => {
        if (selectedLocation) {
            // Navigate to dashboard with location data
            navigate('/dashboard', { 
                state: { 
                    selectedLocation: {
                        name: selectedLocation.name,
                        lat: selectedLocation.latitude,
                        lon: selectedLocation.longitude
                    }
                } 
            });
        }
    };

    // Handle quick location selection
    const handleQuickLocation = (location) => {
        navigate('/dashboard', { 
            state: { 
                selectedLocation: {
                    name: location.name,
                    lat: location.lat,
                    lon: location.lon
                }
            } 
        });
    };

    return (
        <div className={`search-page ${isDark ? 'theme-dark' : 'theme-light'}`}>
            <div className="search-container">
                {/* Header */}
                <div className="page-header">
                    <button className="back-button" onClick={() => navigate('/dashboard')}>
                        ← Quay lại Dashboard
                    </button>
                    <h1>Tìm Kiếm Vị Trí</h1>
                </div>

                <div className="content-grid">
                    {/* Left Column - Form */}
                    <div className="form-section">
                        <div className="form-card">
                            <h2>Nhập Tọa Độ</h2>
                            <div className="coordinate-inputs">
                                <div className="input-group">
                                    <label>Vĩ độ (Latitude)</label>
                                    <input
                                        type="number"
                                        placeholder="Ví dụ: 21.0285"
                                        value={customLat}
                                        onChange={(e) => setCustomLat(e.target.value)}
                                        step="0.0001"
                                        min="-90"
                                        max="90"
                                    />
                                    <small>Khoảng: -90 đến 90</small>
                                </div>
                                
                                <div className="input-group">
                                    <label>Kinh độ (Longitude)</label>
                                    <input
                                        type="number"
                                        placeholder="Ví dụ: 105.8542"
                                        value={customLon}
                                        onChange={(e) => setCustomLon(e.target.value)}
                                        step="0.0001"
                                        min="-180"
                                        max="180"
                                    />
                                    <small>Khoảng: -180 đến 180</small>
                                </div>
                            </div>

                            {error && <div className="error-message">{error}</div>}

                            <button 
                                className="search-button"
                                onClick={handleCustomLocation}
                                disabled={loading}
                            >
                                {loading ? 'Đang tìm...' : 'Tìm Vị Trí'}
                            </button>

                            {selectedLocation && (
                                <div className="selected-location">
                                    <h3>Vị Trí Đã Chọn:</h3>
                                    <div className="location-info">
                                        <p><strong>Tên:</strong> {selectedLocation.name}</p>
                                        <p><strong>Vĩ độ:</strong> {selectedLocation.latitude}</p>
                                        <p><strong>Kinh độ:</strong> {selectedLocation.longitude}</p>
                                    </div>
                                    <button 
                                        className="select-button"
                                        onClick={handleSelectLocation}
                                    >
                                        Xem Thời Tiết Tại Đây
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Quick Locations */}
                        <div className="quick-locations-card">
                            <h3>Vị Trí Phổ Biến</h3>
                            <div className="quick-locations-grid">
                                {[
                                    { name: 'Hà Nội', lat: 21.0285, lon: 105.8542 },
                                    { name: 'TP.HCM', lat: 10.8231, lon: 106.6297 },
                                    { name: 'Đà Nẵng', lat: 16.0544, lon: 108.2022 },
                                    { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
                                    { name: 'New York', lat: 40.7128, lon: -74.0060 },
                                    { name: 'London', lat: 51.5074, lon: -0.1278 },
                                    { name: 'Paris', lat: 48.8566, lon: 2.3522 },
                                    { name: 'Sydney', lat: -33.8688, lon: 151.2093 }
                                ].map((location) => (
                                    <button
                                        key={location.name}
                                        className="quick-location-btn"
                                        onClick={() => handleQuickLocation(location)}
                                    >
                                        {location.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Map */}
                    <div className="map-section">
                        <RainMap 
                            isDark={isDark} 
                            onLocationSelect={(location) => {
                                setCustomLat(location.lat.toString());
                                setCustomLon(location.lon.toString());
                                setError('');
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchPage;
