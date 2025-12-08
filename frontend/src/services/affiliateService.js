import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

/**
 * Fetch product recommendations based on weather conditions
 * 
 * @param {string} weatherMain - Weather condition (e.g., 'Rain', 'Clear')
 * @param {number} currentTemp - Current temperature in Celsius
 * @param {number} limit - Maximum number of recommendations (default: 5)
 * @returns {Promise<Object>} Response with recommendations array
 */
export const fetchRecommendations = async (weatherMain, currentTemp, limit = 5) => {
    try {
        console.log('Fetching recommendations:', { weatherMain, currentTemp, limit });
        console.log('API URL:', `${API_BASE_URL}/recommendations`);
        
        const response = await axios.get(`${API_BASE_URL}/recommendations`, {
            params: {
                weather_main: weatherMain,
                current_temp: currentTemp,
                limit: limit,
            },
            timeout: 10000,
        });
        
        console.log('Recommendations response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Affiliate recommendations error:', error);
        console.error('Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
        });
        throw new Error(error.response?.data?.message || 'Failed to fetch recommendations');
    }
};
