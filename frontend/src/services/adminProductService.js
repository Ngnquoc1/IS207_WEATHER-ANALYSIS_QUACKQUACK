import axios from '../lib/axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

/**
 * Fetch paginated products with filters
 * @param {number} page - Page number (default: 1)
 * @param {Object} filters - Filter options { search, weather_tag, is_active }
 * @returns {Promise} API response with products data
 */
export const fetchProducts = async (page = 1, filters = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/products`, {
      params: {
        page,
        per_page: 10,
        ...filters
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch products');
  }
};

/**
 * Create new product
 * @param {Object} productData - Product data to create
 * @returns {Promise} API response with created product
 */
export const createProduct = async (productData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin/products`, productData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to create product';
    const errors = error.response?.data?.errors || {};
    throw { message, errors };
  }
};

/**
 * Update existing product
 * @param {string} id - Product ID
 * @param {Object} productData - Updated product data
 * @returns {Promise} API response with updated product
 */
export const updateProduct = async (id, productData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/admin/products/${id}`, productData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to update product';
    const errors = error.response?.data?.errors || {};
    throw { message, errors };
  }
};

/**
 * Delete product
 * @param {string} id - Product ID
 * @returns {Promise} API response
 */
export const deleteProduct = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/admin/products/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete product');
  }
};

/**
 * Toggle product active status
 * @param {string} id - Product ID
 * @returns {Promise} API response with new status
 */
export const toggleProductActive = async (id) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/admin/products/${id}/toggle-active`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to toggle product status');
  }
};
