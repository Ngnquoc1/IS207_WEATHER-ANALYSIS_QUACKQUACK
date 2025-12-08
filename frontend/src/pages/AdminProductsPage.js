import React, { useState, useEffect } from 'react';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductActive,
} from '../services/adminProductService';
import './AdminProductsPage.css';

const WEATHER_TAGS = ['rain', 'drizzle', 'thunderstorm', 'clear', 'sunny', 'clouds', 'fog', 'snow'];

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    weather_tag: '',
    is_active: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    original_link: '',
    weather_tags: [],
    min_temp: '',
    max_temp: '',
    is_active: true,
  });
  const [formErrors, setFormErrors] = useState({});
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadProducts(1);
  }, []);

  const loadProducts = async (page) => {
    setLoading(true);
    try {
      const response = await fetchProducts(page, filters);
      setProducts(response.products.data);
      setPagination({
        current_page: response.products.current_page,
        last_page: response.products.last_page,
        per_page: response.products.per_page,
        total: response.products.total,
      });
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  const applyFilters = () => {
    loadProducts(1);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      image_url: '',
      original_link: '',
      weather_tags: [],
      min_temp: '',
      max_temp: '',
      is_active: true,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      image_url: product.image_url,
      original_link: product.original_link,
      weather_tags: product.weather_tags,
      min_temp: product.min_temp || '',
      max_temp: product.max_temp || '',
      is_active: product.is_active,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleWeatherTagChange = (e) => {
    const { value, checked } = e.target;
    let updatedTags = [...formData.weather_tags];
    if (checked) {
      updatedTags.push(value);
    } else {
      updatedTags = updatedTags.filter((tag) => tag !== value);
    }
    setFormData({ ...formData, weather_tags: updatedTags });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors({});

    // Prepare data
    const submitData = {
      ...formData,
      min_temp: formData.min_temp === '' ? null : parseInt(formData.min_temp),
      max_temp: formData.max_temp === '' ? null : parseInt(formData.max_temp),
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, submitData);
        showNotification('Product updated successfully!', 'success');
      } else {
        await createProduct(submitData);
        showNotification('Product created successfully!', 'success');
      }
      setShowModal(false);
      loadProducts(pagination.current_page);
    } catch (error) {
      if (error.errors) {
        setFormErrors(error.errors);
      }
      showNotification(error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await toggleProductActive(id);
      showNotification('Product status updated!', 'success');
      loadProducts(pagination.current_page);
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteProduct(id);
      showNotification('Product deleted successfully!', 'success');
      loadProducts(pagination.current_page);
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="admin-products-page">
      {/* Notification Toast */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h2>🛍️ Product Management</h2>
          <p>Quản lý sản phẩm affiliate cho gợi ý thời tiết</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary">
          ➕ Add New Product
        </button>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <input
          type="text"
          placeholder="Search by name or description..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
        />

        <select value={filters.weather_tag} onChange={(e) => handleFilterChange('weather_tag', e.target.value)}>
          <option value="">All Weather Tags</option>
          {WEATHER_TAGS.map((tag) => (
            <option key={tag} value={tag}>
              {tag.charAt(0).toUpperCase() + tag.slice(1)}
            </option>
          ))}
        </select>

        <select value={filters.is_active} onChange={(e) => handleFilterChange('is_active', e.target.value)}>
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>

        <button onClick={applyFilters} className="btn-secondary">
          🔍 Apply Filters
        </button>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="loading-state">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <p>No products found</p>
          <button onClick={openCreateModal} className="btn-primary">
            Create your first product
          </button>
        </div>
      ) : (
        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Weather Tags</th>
                <th>Temp Range</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="product-thumbnail"
                      onError={(e) => (e.target.src = 'https://via.placeholder.com/80')}
                    />
                  </td>
                  <td>
                    <strong>{product.name}</strong>
                    <br />
                    <small className="text-muted">
                      {product.description.length > 60
                        ? product.description.substring(0, 60) + '...'
                        : product.description}
                    </small>
                  </td>
                  <td>
                    <div className="tags-container">
                      {product.weather_tags.map((tag) => (
                        <span key={tag} className={`tag tag-${tag}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    {product.min_temp !== null && product.max_temp !== null
                      ? `${product.min_temp}°C - ${product.max_temp}°C`
                      : 'No restriction'}
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleActive(product.id, product.is_active)}
                      className={`status-badge ${product.is_active ? 'active' : 'inactive'}`}
                    >
                      {product.is_active ? '✓ Active' : '✗ Inactive'}
                    </button>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => openEditModal(product)}
                        className="btn-icon btn-edit"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="btn-icon btn-delete"
                        title="Delete"
                      >
                        🗑️
                      </button>
                      <a
                        href={product.affiliate_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-icon btn-link"
                        title="Test Link"
                      >
                        🔗
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && products.length > 0 && (
        <div className="pagination">
          <button
            onClick={() => loadProducts(pagination.current_page - 1)}
            disabled={pagination.current_page === 1}
            className="btn-secondary"
          >
            ← Previous
          </button>

          <span className="page-info">
            Page {pagination.current_page} of {pagination.last_page} ({pagination.total} products)
          </span>

          <button
            onClick={() => loadProducts(pagination.current_page + 1)}
            disabled={pagination.current_page === pagination.last_page}
            className="btn-secondary"
          >
            Next →
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingProduct ? 'Edit Product' : 'Create New Product'}</h3>
              <button onClick={() => setShowModal(false)} className="close-btn">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  maxLength="255"
                />
                {formErrors.name && <span className="error-text">{formErrors.name[0]}</span>}
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  maxLength="1000"
                  rows="3"
                />
                {formErrors.description && <span className="error-text">{formErrors.description[0]}</span>}
              </div>

              <div className="form-group">
                <label>Image URL *</label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  required
                  placeholder="https://images.unsplash.com/..."
                />
                {formErrors.image_url && <span className="error-text">{formErrors.image_url[0]}</span>}
                {formData.image_url && (
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="image-preview"
                    onError={(e) => (e.target.style.display = 'none')}
                  />
                )}
              </div>

              <div className="form-group">
                <label>Original Product Link (Shopee/Tiki/Lazada) *</label>
                <input
                  type="url"
                  name="original_link"
                  value={formData.original_link}
                  onChange={handleInputChange}
                  required
                  placeholder="https://shopee.vn/..."
                />
                {formErrors.original_link && <span className="error-text">{formErrors.original_link[0]}</span>}
                <small className="help-text">Will be converted to AccessTrade deep link automatically</small>
              </div>

              <div className="form-group">
                <label>Weather Tags * (Select one or more)</label>
                <div className="checkbox-group">
                  {WEATHER_TAGS.map((tag) => (
                    <label key={tag} className="checkbox-label">
                      <input
                        type="checkbox"
                        value={tag}
                        checked={formData.weather_tags.includes(tag)}
                        onChange={handleWeatherTagChange}
                      />
                      {tag.charAt(0).toUpperCase() + tag.slice(1)}
                    </label>
                  ))}
                </div>
                {formErrors.weather_tags && <span className="error-text">{formErrors.weather_tags[0]}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Min Temperature (°C)</label>
                  <input
                    type="number"
                    name="min_temp"
                    value={formData.min_temp}
                    onChange={handleInputChange}
                    min="-50"
                    max="60"
                    placeholder="Leave empty for no restriction"
                  />
                  {formErrors.min_temp && <span className="error-text">{formErrors.min_temp[0]}</span>}
                </div>

                <div className="form-group">
                  <label>Max Temperature (°C)</label>
                  <input
                    type="number"
                    name="max_temp"
                    value={formData.max_temp}
                    onChange={handleInputChange}
                    min="-50"
                    max="60"
                    placeholder="Leave empty for no restriction"
                  />
                  {formErrors.max_temp && <span className="error-text">{formErrors.max_temp[0]}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  Active (visible to users)
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
