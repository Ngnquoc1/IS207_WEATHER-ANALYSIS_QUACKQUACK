import axios from 'axios';

// Base URL for the Laravel backend API
// Automatically detect environment and use appropriate URL
const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'http://backend:80/api'  // Use backend container name for Docker deployment
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
        const response = await axios.get(`${API_BASE_URL}/weather/${lat}/${lon}`, {
            timeout: 10000, // 10 second timeout
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        if (error.code === 'ECONNABORTED') {
            throw new Error('Request timeout - please try again');
        } else if (error.response?.status === 404) {
            throw new Error('Weather data not found for this location');
        } else if (error.response?.status >= 500) {
            throw new Error('Server error - please try again later');
        } else {
            throw new Error('Failed to fetch weather data');
        }
    }
};

/**
 * Fetch weather data for multiple cities in bulk (for RainMap)
 * This reduces API calls from 24 individual requests to 1 bulk request
 * @returns {Promise} - Bulk weather data for all major cities
 */
export const fetchBulkWeatherData = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/weather/bulk`, {
            timeout: 30000, // 30 second timeout for bulk request
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching bulk weather data:', error);
        if (error.code === 'ECONNABORTED') {
            throw new Error('Bulk request timeout - please try again');
        } else if (error.response?.status === 404) {
            throw new Error('Bulk weather endpoint not found');
        } else if (error.response?.status >= 500) {
            throw new Error('Server error - please try again later');
        } else {
            throw new Error('Failed to fetch bulk weather data');
        }
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
                    default:
                        errorMessage = 'Lỗi không xác định khi lấy vị trí';
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
        // Using Open-Meteo's reverse geocoding API with timeout
        const response = await axios.get(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=vi`, {
            timeout: 5000, // 5 second timeout
            headers: {
                'Accept': 'application/json',
            }
        });
        
        if (response.data.results && response.data.results.length > 0) {
            const location = response.data.results[0];
            return location.name || location.admin1 || location.country;
        }
        return null;
    } catch (error) {
        console.warn('Reverse geocoding failed, using coordinates:', error.message);
        return null; // Return null to use coordinates fallback
    }
};

const weatherService = {
    fetchWeatherData,
    fetchBulkWeatherData,
    fetchComparisonData,
    getCurrentLocation
};

export default weatherService;
