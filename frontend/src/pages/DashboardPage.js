import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchWeatherData, getCurrentLocation } from '../services/weatherService';
import authService from '../services/authService';
import Header from '../components/Header';
import LocationSelector from '../components/LocationSelector';
import CurrentWeather from '../components/CurrentWeather';
import HourlyForecastChart from '../components/HourlyForecastChart';
import AnomalyDisplay from '../components/AnomalyDisplay';
import Recommendation from '../components/Recommendation';
import LocationComparator from '../components/LocationComparator';
import Stories from '../components/Stories';
import LoginPrompt from '../components/LoginPrompt';
import LoginModal from '../components/LoginModal';
import ProductRecommendations from '../components/ProductRecommendations';
import WeatherMap from '../components/WeatherMap';
import LocationInfo from '../components/LocationInfo';
import './DashboardPage.css';
import '../styles/DashboardStandard.css'; // Import standard styles

/**
 * DashboardPage Component
 */
const DashboardPage = () => {
    const location = useLocation();
    // State for selected location (default: null - will be set to user's location)
    const [selectedLocation, setSelectedLocation] = useState(null);

    // State for weather data
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    
    // Listen for authentication changes
    useEffect(() => {
        const checkAuth = () => {
            setIsAuthenticated(authService.isAuthenticated());
        };
        
        // Check auth on mount
        checkAuth();
        
        // Listen for storage changes (when user logs in/out)
        const handleStorageChange = () => {
            checkAuth();
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);


    // Get user's current location on component mount or handle location from router state
    useEffect(() => {
        const initializeLocation = async () => {
            try {
                setLoading(true);
                setLocationError(null);
                
                // Check if location data was passed from SearchPage
                if (location.state?.selectedLocation) {
                    setSelectedLocation(location.state.selectedLocation);
                    return;
                }
                
                // Try to get user's current location
                const currentLocation = await getCurrentLocation();
                setSelectedLocation(currentLocation);
            } catch (err) {
                console.error('Error getting current location:', err);
                setLocationError(err.message);
                
                // Fallback to default location (Dĩ An)
                const defaultLocation = {
                    name: 'Dĩ An',
                    lat: 10.98,
                    lon: 106.75
                };
                setSelectedLocation(defaultLocation);
            }
        };

        initializeLocation();
    }, [location.state]);

    const [resolvedLocationName, setResolvedLocationName] = useState(null);
    // Fetch weather data when component mounts or location changes
    useEffect(() => {
        if (!selectedLocation) return; // Don't fetch if location is not set yet
        const loadWeatherData = async () => {
            setLoading(true);
            setError(null);

            try {
                const data = await fetchWeatherData(selectedLocation.lat, selectedLocation.lon);
                setWeatherData(data);
                setResolvedLocationName(data?.location?.name || selectedLocation?.name);
            } catch (err) {
                setError('Không thể tải dữ liệu thời tiết. Vui lòng thử lại sau.');
                console.error('Error loading weather data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadWeatherData();
    }, [selectedLocation]);


    // Handle location selection from Header dropdown
    const handleLocationSelect = async (locationData) => {
        try {
            setError(null);
            setLocationError(null);
            if (locationData?.name) {
                setResolvedLocationName(locationData.name);
            }
            setSelectedLocation(locationData);
            // Weather data will be refreshed by the effect watching selectedLocation
        } catch (err) {
            console.error('Error fetching weather data:', err);
            setError('Không thể tải dữ liệu thời tiết. Vui lòng thử lại.');
        }
    };

    const handleLoginSuccess = (user) => {
        setIsAuthenticated(true);
        setIsLoginModalOpen(false);
    };

    return (
        <div className="dashboard-page">
            {/* Header*/}
            <Header />

            {/* Location Error Alert */}
            {locationError && (
                <div className="location-error-banner">
                    <div className="error-icon">⚠️</div>
                    <div className="error-content">
                        <p>{locationError}</p>
                        <p className="error-note">Đang sử dụng vị trí mặc định: Dĩ An</p>
                    </div>
                </div>
            )}

            {/* Login Prompt Banner */}
            {!isAuthenticated && (
                <div className="dashboard-login-banner">
                    <div className="login-banner-content">
                        <LoginPrompt onLoginClick={() => setIsLoginModalOpen(true)} />
                    </div>
                </div>
            )}

            {/* Main Dashboard Container */}
            <div className="dashboard-container">
                <aside className="dashboard-sidebar">
                    <LocationSelector 
                        onLocationSelect={handleLocationSelect}
                        currentLocation={resolvedLocationName ? { ...selectedLocation, name: resolvedLocationName } : selectedLocation}
                    />
                    
                    {/* Location Info Card - Hidden on Mobile */}
                    {weatherData && (
                        <LocationInfo 
                            data={weatherData} 
                            className="hide-on-mobile" 
                        />
                    )}

                    {/* Stories Section - Moved to Sidebar */}
                    {isAuthenticated && (
                        <div className="sidebar-stories">
                            <Stories location={selectedLocation?.name} />
                        </div>
                    )}
                </aside>

                {/* Main Content Area */}
                <main className="dashboard-main">
                    {loading && (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p>
                                {selectedLocation
                                    ? (resolvedLocationName
                                        ? `Đang tải dữ liệu thời tiết cho ${resolvedLocationName}...`
                                        : 'Đang tải dữ liệu thời tiết...')
                                    : 'Đang lấy vị trí hiện tại...'
                                }
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="error-container">
                            <div className="error-icon">⚠️</div>
                            <p>{error}</p>
                            <button onClick={() => window.location.reload()} className="retry-button">
                                Thử lại
                            </button>
                        </div>
                    )}

                    {!loading && !error && weatherData && (
                        <div className="dashboard-grid">
                            {/* Row 1: Current Weather (Full Width) */}
                            <div className="grid-row full-width-row">
                                <div className="grid-cell hero-cell">
                                    {/* Interactive Weather Map (Background) */}
                                    <WeatherMap 
                                        selectedLocation={selectedLocation ? { ...selectedLocation, name: resolvedLocationName || selectedLocation.name } : null}
                                        currentWeatherData={weatherData.current_weather}
                                    />

                                    {/* Floating Content Overlay */}
                                    <div className="hero-content-overlay">
                                        <div className="location-header">
                                            <h2>{resolvedLocationName || selectedLocation?.name}</h2>
                                        </div>
                                        <CurrentWeather data={weatherData.current_weather} />
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Only: Location Info Card (Appears after Map) */}
                            {weatherData && (
                                <div className="grid-row full-width-row show-on-mobile">
                                    <LocationInfo data={weatherData} />
                                </div>
                            )}

                            {/* Row 2: Forecast Chart (Full Width) */}
                            {isAuthenticated && (
                                <div className="grid-row full-width-row">
                                    <div className="grid-cell chart-cell">
                                        <h2 className="section-title">Dự Báo Chi Tiết</h2>
                                        <HourlyForecastChart 
                                            data={weatherData.hourly_forecast} 
                                            dailyData={weatherData.daily_forecast}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Row 3: Anomaly & Smart Recommendations (Split Row) */}
                            {isAuthenticated && (
                                <div className="grid-row analysis-row">
                                    <div className="grid-cell anomaly-cell">
                                        <h2 className="section-title">Phân Tích Bất Thường</h2>
                                        <AnomalyDisplay 
                                            anomalyData={weatherData.anomaly} 
                                            location={selectedLocation}
                                        />
                                    </div>
                                    <div className="grid-cell recommendation-cell">
                                        <h2 className="section-title">Lời Khuyên Hôm Nay</h2>
                                        <Recommendation recommendation={weatherData.recommendation} />
                                    </div>
                                </div>
                            )}

                            {/* Row 4: Product Recommendations (Full Width) */}
                            <div className="grid-row full-width-row">
                                <div className="grid-cell no-padding">
                                    <h2 className="section-title padding-24">Đề Xuất Cho Bạn</h2>
                                    <ProductRecommendations weatherData={weatherData} />
                                </div>
                            </div>
                            
                            {/* Row 5: Location Comparison (Full Width) */}
                            {isAuthenticated && (
                                <div className="grid-row full-width-row">
                                    <div className="grid-cell no-padding">
                                        <h2 className="section-title padding-24">So Sánh Địa Điểm</h2>
                                        <LocationComparator />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* Footer */}
            <footer className="dashboard-footer">
                <p>
                    Dữ liệu thời tiết được cung cấp bởi{' '}
                    <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">
                        Open-Meteo API
                    </a>
                </p>
                <p className="footer-note">
                    Weather Analysis Dashboard © 2025 | Cập nhật thời gian thực
                </p>
            </footer>

            {/* Login Modal */}
            <LoginModal 
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onLoginSuccess={handleLoginSuccess}
            />
        </div>
    );
};

export default DashboardPage;
