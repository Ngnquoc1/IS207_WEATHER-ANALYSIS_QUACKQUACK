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
import './DashboardPage.css';

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

            {/* Main Dashboard Container */}
            <div className="dashboard-container">
                <aside className="dashboard-sidebar">
                    <LocationSelector 
                        onLocationSelect={handleLocationSelect}
                        currentLocation={resolvedLocationName ? { ...selectedLocation, name: resolvedLocationName } : selectedLocation}
                    />
                    
                    {/* Location Info Card */}
                    {weatherData && (
                        <div className="location-info-card">
                            <h3>Thông tin chi tiết</h3>
                            <div className="info-row">
                                <span className="label">Vĩ độ:</span>
                                <span className="value">{weatherData.location?.latitude}°</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Kinh độ:</span>
                                <span className="value">{weatherData.location?.longitude}°</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Múi giờ:</span>
                                <span className="value">{weatherData.location?.timezone}</span>
                            </div>
                        </div>
                    )}

                    {/* Login Prompt in Sidebar for Guests */}
                    {!isAuthenticated && (
                        <div className="sidebar-login-prompt">
                            <LoginPrompt onLoginClick={() => setIsLoginModalOpen(true)} />
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
                            <div className="grid-row top-row">
                                <div className="grid-cell hero-cell">
                                    <div className="location-header">
                                        <h2>{resolvedLocationName || selectedLocation?.name}</h2>
                                    </div>
                                    <CurrentWeather data={weatherData.current_weather} />
                                </div>
                                
                                {isAuthenticated && (
                                    <div className="grid-cell anomaly-cell">
                                        <AnomalyDisplay 
                                            anomalyData={weatherData.anomaly} 
                                            location={selectedLocation}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Middle Row: Forecast Chart (Full Width) */}
                            {isAuthenticated && (
                                <div className="grid-row middle-row">
                                    <div className="grid-cell chart-cell">
                                        <HourlyForecastChart 
                                            data={weatherData.hourly_forecast} 
                                            dailyData={weatherData.daily_forecast}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Bottom Section: Split Layout */}
                            <div className="grid-row bottom-section">
                                {/* Left Column (2/3): Products & Comparison */}
                                <div className="bottom-left-col">
                                    <div className="grid-cell">
                                        <ProductRecommendations weatherData={weatherData} />
                                    </div>
                                    
                                    {isAuthenticated && (
                                        <div className="grid-cell">
                                            <LocationComparator />
                                        </div>
                                    )}
                                </div>

                                {/* Right Column (1/3): Insights & Stories */}
                                {isAuthenticated && (
                                    <div className="bottom-right-col">
                                        <div className="grid-cell">
                                            <Recommendation recommendation={weatherData.recommendation} />
                                        </div>
                                        
                                        <div className="grid-cell flex-grow">
                                            <Stories location={selectedLocation?.name} />
                                        </div>
                                    </div>
                                )}
                            </div>
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
