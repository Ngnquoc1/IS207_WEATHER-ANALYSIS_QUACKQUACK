import axios from 'axios';

// Base URL for the Laravel backend API
// Automatically detect environment and use appropriate URL
const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? '/api'  // Use relative path for Docker deployment
    : 'http://localhost:8000/api';  // Use localhost for development

/**
 * Weather Service
 * Handles all API calls to the Laravel backend
 */

/**
 * Fetch comprehensive weather data for a specific location
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise} - Weather data including current, forecast, anomaly, and recommendations
 */
export const fetchWeatherData = async (lat, lon) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/weather/${lat}/${lon}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
};

/**
 * Compare weather data between two locations
 * @param {Object} location1 - First location {lat, lon, name}
 * @param {Object} location2 - Second location {lat, lon, name}
 * @returns {Promise} - Comparison data
 */
export const fetchComparisonData = async (location1, location2) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/weather/comparison`, {
            location1,
            location2
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching comparison data:', error);
        throw error;
    }
};

/**
 * Get user's current location using Geolocation API
 * @returns {Promise} - Promise that resolves with {lat, lon, name}
 */
export const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                
                try {
                    // Optional: Get location name using reverse geocoding
                    const locationName = await getLocationName(latitude, longitude);
                    resolve({
                        lat: latitude,
                        lon: longitude,
                        name: locationName || `Vị trí hiện tại (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`
                    });
                } catch (error) {
                    // If reverse geocoding fails, still return coordinates
                    resolve({
                        lat: latitude,
                        lon: longitude,
                        name: `Vị trí hiện tại (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`
                    });
                }
            },
            (error) => {
                let errorMessage = 'Không thể lấy vị trí hiện tại';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Người dùng đã từ chối quyền truy cập vị trí';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Thông tin vị trí không khả dụng';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Yêu cầu vị trí đã hết thời gian chờ';
                        break;
                }
                reject(new Error(errorMessage));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            }
        );
    });
};

/**
 * Get location name from coordinates using reverse geocoding
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<string>} - Location name
 */
const getLocationName = async (lat, lon) => {
    try {
        // Using Open-Meteo's reverse geocoding API
        const response = await axios.get(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=vi`);
        
        if (response.data.results && response.data.results.length > 0) {
            const location = response.data.results[0];
            return location.name || location.admin1 || location.country;
        }
        return null;
    } catch (error) {
        console.error('Error getting location name:', error);
        return null;
    }
};

const weatherService = {
    fetchWeatherData,
    fetchComparisonData,
    getCurrentLocation
};

export default weatherService;
