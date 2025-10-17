import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import './Header.css';

/**
 * Header Component
 * Modern header with location dropdown and language selector
 */
const Header = ({ onLocationSelect, currentLocation }) => {
    const { toggleTheme, isDark } = useTheme();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    // Quick location presets
    const quickLocations = [
        { name: 'Dĩ An', lat: 10.98, lon: 106.75 },
        { name: 'Hồ Chí Minh', lat: 10.82, lon: 106.63 },
        { name: 'Hà Nội', lat: 21.03, lon: 105.85 },
        { name: 'Đà Nẵng', lat: 16.07, lon: 108.22 },
        { name: 'Nha Trang', lat: 12.24, lon: 109.19 },
        { name: 'Đà Lạt', lat: 11.94, lon: 108.44 }
    ];

    // Filter locations based on search term
    const filteredLocations = quickLocations.filter(location =>
        location.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle location selection
    const handleLocationSelect = (location) => {
        onLocationSelect(location);
        setIsDropdownOpen(false);
        setSearchTerm('');
    };

    // Handle current location detection
    const handleCurrentLocation = async () => {
        try {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const location = {
                            name: 'Vị trí hiện tại',
                            lat: position.coords.latitude,
                            lon: position.coords.longitude
                        };
                        onLocationSelect(location);
                        setIsDropdownOpen(false);
                    },
                    (error) => {
                        console.error('Error getting location:', error);
                        alert('Không thể lấy vị trí hiện tại');
                    }
                );
            } else {
                alert('Trình duyệt không hỗ trợ định vị');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="header">
            <div className="header-container">
                {/* Title */}
                <div className="header-title">
                    <h1>Weather Analysis Dashboard</h1>
                </div>

                {/* Right side controls */}
                <div className="header-controls">
                    {/* Location Dropdown */}
                    <div className="location-dropdown" ref={dropdownRef}>
                        <button
                            className="location-dropdown-button"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <span className="location-text">
                                {currentLocation ? currentLocation.name : 'Tìm kiếm địa điểm / So sánh'}
                            </span>
                            <span className="dropdown-arrow">▼</span>
                        </button>

                        {isDropdownOpen && (
                            <div className="dropdown-menu">
                                {/* Search input */}
                                <div className="dropdown-search">
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm thành phố..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="search-input"
                                    />
                                </div>

                                {/* Current location button */}
                                <button
                                    className="dropdown-item current-location"
                                    onClick={handleCurrentLocation}
                                >
                                    📍 Vị trí hiện tại
                                </button>

                                {/* Quick locations */}
                                <div className="dropdown-divider"></div>
                                {filteredLocations.map((location, index) => (
                                    <button
                                        key={index}
                                        className="dropdown-item"
                                        onClick={() => handleLocationSelect(location)}
                                    >
                                        📍 {location.name}
                                    </button>
                                ))}

                                {/* Custom location button */}
                                <div className="dropdown-divider"></div>
                                <button
                                    className="dropdown-item custom-location-button"
                                    onClick={() => {
                                        setIsDropdownOpen(false);
                                        navigate('/search');
                                    }}
                                >
                                    🗺️ Chọn vị trí tùy chỉnh
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Theme Toggle */}
                    <button 
                        className="theme-toggle"
                        onClick={toggleTheme}
                        title={`Chuyển sang ${isDark ? 'sáng' : 'tối'}`}
                    >
                        {isDark ? '☀️' : '🌙'}
                    </button>

                    {/* Language Selector */}
                    <button className="language-selector">
                        VI
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
