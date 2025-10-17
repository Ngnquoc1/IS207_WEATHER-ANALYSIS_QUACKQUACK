import axios from 'axios';

// Base URL for the Laravel backend API
// Change this to match your Laravel backend URL
const API_BASE_URL = 'http://localhost:8000/api';

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

const weatherService = {
    fetchWeatherData,
    fetchComparisonData
};

export default weatherService;
