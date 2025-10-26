import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import authService from '../services/authService';
import SearchModal from './SearchModal';
import LoginModal from './LoginModal';
import './Header.css';

/**
 * Header Component
 * Modern header with location dropdown and language selector
 */
const Header = ({ onLocationSelect, currentLocation }) => {
    const { toggleTheme, isDark } = useTheme();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const dropdownRef = useRef(null);

    // Load current user info and listen for changes
    useEffect(() => {
        const loadUser = () => {
            const user = authService.getUser();
            setCurrentUser(user);
        };
        
        loadUser();
        
        // Listen for storage changes (when user logs in/out in another tab)
        const handleStorageChange = () => {
            loadUser();
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

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

    // Handle logout
    const handleLogout = async () => {
        if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            await authService.logout();
            window.location.href = '/dashboard';
        }
    };

    // Handle login success
    const handleLoginSuccess = (user) => {
        setCurrentUser(user);
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
                    {currentUser ? (
                        // Authenticated user controls
                        <>
                            {/* User Info */}
                            <div className="user-info-container">
                                <span className="user-name">
                                    👤 {currentUser.name}
                                </span>
                                <span className="user-role">
                                    ({currentUser.role})
                                </span>
                            </div>

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
                                                setIsSearchModalOpen(true);
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

                            {/* Logout Button */}
                            <button 
                                className="logout-button"
                                onClick={handleLogout}
                                title="Đăng xuất"
                            >
                                🚪
                            </button>

                            {/* Language Selector */}
                            <button className="language-selector">
                                VI
                            </button>
                        </>
                    ) : (
                        // Guest user controls
                        <>
                            {/* Login Button */}
                            <button 
                                className="login-button"
                                onClick={() => setIsLoginModalOpen(true)}
                                title="Đăng nhập"
                            >
                                🔐 Đăng nhập
                            </button>

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
                        </>
                    )}
                </div>
            </div>

            {/* Search Modal */}
            <SearchModal 
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                onLocationSelect={onLocationSelect}
            />

            {/* Login Modal */}
            <LoginModal 
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onLoginSuccess={handleLoginSuccess}
            />
        </header>
    );
};

export default Header;
