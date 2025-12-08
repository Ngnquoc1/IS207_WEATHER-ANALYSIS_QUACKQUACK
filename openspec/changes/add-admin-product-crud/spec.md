# OpenSpec: Admin Product Management (Affiliate CRUD)

**Feature ID:** `add-admin-product-crud`  
**Status:** Draft  
**Created:** 2025-12-08  
**Author:** Development Team  

---

## 1. Overview

### 1.1 Purpose
Enable administrators to manage affiliate product recommendations through a comprehensive CRUD interface. This allows admins to add, edit, delete, and toggle product visibility without direct database access.

### 1.2 Business Context
- Admins need to maintain product catalog for weather-based recommendations
- Update affiliate links when partnerships change
- Control which products are active/visible to users
- Manage weather tag mappings and temperature ranges
- Monitor product performance through admin dashboard

### 1.3 Success Criteria
- ✅ Admins can view paginated product list
- ✅ Admins can create new products with validation
- ✅ Admins can update existing products
- ✅ Admins can delete products (soft delete preferred)
- ✅ Admins can quickly toggle product active status
- ✅ All operations protected by admin authentication
- ✅ Responsive UI works on desktop and tablet

---

## 2. Current State Analysis

### 2.1 Existing Infrastructure

**Database:**
- ✅ `products` collection exists in MongoDB
- ✅ Schema: `id`, `name`, `description`, `image_url`, `original_link`, `weather_tags[]`, `min_temp`, `max_temp`, `is_active`, `timestamps`

**Backend:**
- ✅ `Product` model with MongoDB connection
- ✅ `getAffiliateLinkAttribute()` accessor generates deep links
- ✅ Admin authentication middleware available
- ✅ `RecommendationController` for user-facing recommendations

**Frontend:**
- ✅ `AdminPage.js` exists for user management
- ✅ Admin layout and routing configured
- ✅ Axios configured with base URL

### 2.2 Gaps to Address
- ❌ No admin CRUD controller for products
- ❌ No admin product management UI
- ❌ No pagination for product listing
- ❌ No validation for product form inputs
- ❌ No image upload functionality (using URL for MVP)

---

## 3. Technical Specification

### 3.1 Backend Implementation

#### 3.1.1 Controller: `Admin\ProductController`

**File:** `backend/app/Http/Controllers/Admin/ProductController.php`

**Namespace:** `App\Http\Controllers\Admin`

**Middleware:** `auth:sanctum`, `admin` (verify user role = 'admin')

**Methods:**

##### `index(Request $request): JsonResponse`
List all products with pagination.

**Request Query Parameters:**
```
?page=1&per_page=10&search=&weather_tag=&is_active=
```

**Query Logic:**
- Filter by `search` (name or description contains)
- Filter by `weather_tag` (array contains specific tag)
- Filter by `is_active` (boolean)
- Sort by `created_at` DESC
- Paginate 10-50 items per page

**Response:**
```json
{
  "success": true,
  "products": {
    "data": [
      {
        "id": "6935c3941ac6f7c6340f4f12",
        "name": "Áo Mưa Poncho Dày Dặn",
        "description": "Áo mưa poncho cao cấp...",
        "image_url": "https://images.unsplash.com/...",
        "original_link": "https://shopee.vn/...",
        "affiliate_link": "https://go.isclix.com/deep_link/6863738094162080240?url=...",
        "weather_tags": ["rain", "drizzle", "thunderstorm"],
        "min_temp": 15,
        "max_temp": 35,
        "is_active": true,
        "created_at": "2025-12-08T10:30:00Z",
        "updated_at": "2025-12-08T10:30:00Z"
      }
    ],
    "current_page": 1,
    "last_page": 3,
    "per_page": 10,
    "total": 25
  }
}
```

##### `store(Request $request): JsonResponse`
Create a new product.

**Validation Rules:**
```php
[
    'name' => 'required|string|max:255',
    'description' => 'required|string|max:1000',
    'image_url' => 'required|url|max:500',
    'original_link' => 'required|url|max:500',
    'weather_tags' => 'required|array|min:1',
    'weather_tags.*' => 'string|in:rain,drizzle,thunderstorm,clear,sunny,clouds,fog,snow',
    'min_temp' => 'nullable|integer|min:-50|max:60',
    'max_temp' => 'nullable|integer|min:-50|max:60|gte:min_temp',
    'is_active' => 'boolean'
]
```

**Custom Validation:**
- If `min_temp` provided, `max_temp` must be >= `min_temp`
- Weather tags must be from predefined list
- Both temps can be null (universal product)

**Response (Success 201):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "product": { /* full product object */ }
}
```

**Response (Validation Error 422):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "original_link": ["The original link must be a valid URL."],
    "weather_tags": ["The weather tags field is required."]
  }
}
```

##### `show($id): JsonResponse`
Get single product details.

**Response:**
```json
{
  "success": true,
  "product": { /* full product object */ }
}
```

**Error (404):**
```json
{
  "success": false,
  "message": "Product not found"
}
```

##### `update(Request $request, $id): JsonResponse`
Update existing product.

**Validation:** Same as `store()`, all fields optional except `weather_tags` (if provided, must have at least 1 tag)

**Response (Success 200):**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "product": { /* updated product object */ }
}
```

##### `destroy($id): JsonResponse`
Delete product permanently (or soft delete if implemented).

**Response (Success 200):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

**Note:** Consider implementing soft deletes by adding `deleted_at` field instead of permanent deletion.

##### `toggleActive($id): JsonResponse`
Quick toggle for `is_active` status.

**Logic:**
```php
$product = Product::findOrFail($id);
$product->is_active = !$product->is_active;
$product->save();
```

**Response:**
```json
{
  "success": true,
  "message": "Product status updated",
  "is_active": false
}
```

#### 3.1.2 Routes

**File:** `backend/routes/api.php`

**Route Group:**
```php
// Admin Product Management (Protected by auth:sanctum + admin middleware)
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/products', [Admin\ProductController::class, 'index']);
    Route::post('/products', [Admin\ProductController::class, 'store']);
    Route::get('/products/{id}', [Admin\ProductController::class, 'show']);
    Route::put('/products/{id}', [Admin\ProductController::class, 'update']);
    Route::delete('/products/{id}', [Admin\ProductController::class, 'destroy']);
    Route::patch('/products/{id}/toggle-active', [Admin\ProductController::class, 'toggleActive']);
});
```

**Security:**
- `auth:sanctum`: Verify user is authenticated with valid token
- `admin`: Custom middleware to check `user.role === 'admin'`
- Return 401 if not authenticated
- Return 403 if authenticated but not admin

#### 3.1.3 Middleware: `admin`

**File:** `backend/app/Http/Middleware/AdminMiddleware.php`

**Logic:**
```php
public function handle(Request $request, Closure $next)
{
    if (!$request->user() || $request->user()->role !== 'admin') {
        return response()->json([
            'success' => false,
            'message' => 'Access denied. Admin privileges required.'
        ], 403);
    }
    
    return $next($request);
}
```

**Register in `bootstrap/app.php` or `Kernel.php`:**
```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'admin' => \App\Http\Middleware\AdminMiddleware::class,
    ]);
})
```

---

### 3.2 Frontend Implementation

#### 3.2.1 Page Component: `AdminProductsPage`

**File:** `frontend/src/pages/AdminProductsPage.js`

**Route:** `/admin/products`

**Structure:**
```jsx
import React, { useState, useEffect } from 'react';
import axios from '../lib/axios';
import './AdminProductsPage.css';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    weather_tag: '',
    is_active: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Component logic here
  
  return (
    <div className="admin-products-page">
      {/* Header */}
      {/* Filters */}
      {/* Products Table */}
      {/* Pagination */}
      {/* Create/Edit Modal */}
    </div>
  );
};
```

**State Management:**
- `products`: Array of product objects
- `loading`: Boolean for loading state
- `pagination`: Object with `current_page`, `last_page`, `total`
- `filters`: Object with search, weather_tag, is_active
- `showModal`: Boolean to show/hide create/edit modal
- `editingProduct`: Product object when editing, null when creating

#### 3.2.2 UI Sections

##### Header Section
```jsx
<div className="page-header">
  <h2>🛍️ Product Management</h2>
  <p>Quản lý sản phẩm affiliate cho gợi ý thời tiết</p>
  <button onClick={() => openCreateModal()} className="btn-primary">
    ➕ Add New Product
  </button>
</div>
```

##### Filters Section
```jsx
<div className="filters-bar">
  <input 
    type="text" 
    placeholder="Search by name or description..."
    value={filters.search}
    onChange={(e) => setFilters({...filters, search: e.target.value})}
  />
  
  <select 
    value={filters.weather_tag}
    onChange={(e) => setFilters({...filters, weather_tag: e.target.value})}
  >
    <option value="">All Weather Tags</option>
    <option value="rain">Rain</option>
    <option value="clear">Clear</option>
    <option value="clouds">Clouds</option>
    <option value="snow">Snow</option>
    {/* ... more tags */}
  </select>
  
  <select 
    value={filters.is_active}
    onChange={(e) => setFilters({...filters, is_active: e.target.value})}
  >
    <option value="">All Status</option>
    <option value="true">Active</option>
    <option value="false">Inactive</option>
  </select>
  
  <button onClick={() => loadProducts(1)} className="btn-secondary">
    🔍 Apply Filters
  </button>
</div>
```

##### Products Table
```jsx
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
              onError={(e) => e.target.src = 'https://via.placeholder.com/80'}
            />
          </td>
          <td>
            <strong>{product.name}</strong>
            <br />
            <small className="text-muted">{product.description.substring(0, 60)}...</small>
          </td>
          <td>
            <div className="tags-container">
              {product.weather_tags.map(tag => (
                <span key={tag} className={`tag tag-${tag}`}>{tag}</span>
              ))}
            </div>
          </td>
          <td>
            {product.min_temp && product.max_temp 
              ? `${product.min_temp}°C - ${product.max_temp}°C`
              : 'No restriction'}
          </td>
          <td>
            <button 
              onClick={() => toggleActive(product.id, product.is_active)}
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
                onClick={() => handleDelete(product.id)}
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
```

##### Pagination
```jsx
<div className="pagination">
  <button 
    onClick={() => loadProducts(pagination.current_page - 1)}
    disabled={pagination.current_page === 1}
  >
    ← Previous
  </button>
  
  <span className="page-info">
    Page {pagination.current_page} of {pagination.last_page} 
    ({pagination.total} products)
  </span>
  
  <button 
    onClick={() => loadProducts(pagination.current_page + 1)}
    disabled={pagination.current_page === pagination.last_page}
  >
    Next →
  </button>
</div>
```

##### Create/Edit Modal
```jsx
{showModal && (
  <div className="modal-overlay" onClick={() => setShowModal(false)}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h3>{editingProduct ? 'Edit Product' : 'Create New Product'}</h3>
        <button onClick={() => setShowModal(false)} className="close-btn">✕</button>
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
          {formData.image_url && (
            <img 
              src={formData.image_url} 
              alt="Preview" 
              className="image-preview"
              onError={(e) => e.target.style.display = 'none'}
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
          <small className="help-text">
            Will be converted to AccessTrade deep link automatically
          </small>
        </div>
        
        <div className="form-group">
          <label>Weather Tags * (Select one or more)</label>
          <div className="checkbox-group">
            {['rain', 'drizzle', 'thunderstorm', 'clear', 'sunny', 'clouds', 'fog', 'snow'].map(tag => (
              <label key={tag} className="checkbox-label">
                <input 
                  type="checkbox"
                  value={tag}
                  checked={formData.weather_tags.includes(tag)}
                  onChange={handleWeatherTagChange}
                />
                {tag}
              </label>
            ))}
          </div>
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
          </div>
        </div>
        
        <div className="form-group">
          <label className="checkbox-label">
            <input 
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
            />
            Active (visible to users)
          </label>
        </div>
        
        <div className="modal-actions">
          <button 
            type="button" 
            onClick={() => setShowModal(false)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
```

#### 3.2.3 API Service Functions

**File:** `frontend/src/services/adminProductService.js`

```javascript
import axios from '../lib/axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

/**
 * Fetch paginated products with filters
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
 */
export const createProduct = async (productData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin/products`, productData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create product');
  }
};

/**
 * Update existing product
 */
export const updateProduct = async (id, productData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/admin/products/${id}`, productData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update product');
  }
};

/**
 * Delete product
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
 */
export const toggleProductActive = async (id) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/admin/products/${id}/toggle-active`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to toggle product status');
  }
};
```

#### 3.2.4 Styling

**File:** `frontend/src/pages/AdminProductsPage.css`

**Key Styles:**
```css
.admin-products-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.filters-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
}

.products-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.products-table th {
  background: #2c3e50;
  color: white;
  padding: 1rem;
  text-align: left;
}

.products-table td {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.product-thumbnail {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

.tag-rain { background: #3498db; color: white; }
.tag-clear { background: #f39c12; color: white; }
.tag-clouds { background: #95a5a6; color: white; }
.tag-snow { background: #ecf0f1; color: #2c3e50; }

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.status-badge.active {
  background: #27ae60;
  color: white;
}

.status-badge.inactive {
  background: #e74c3c;
  color: white;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  padding: 0.5rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1.2rem;
  transition: transform 0.2s;
}

.btn-icon:hover {
  transform: scale(1.2);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.75rem;
}

.image-preview {
  margin-top: 1rem;
  max-width: 200px;
  border-radius: 8px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .filters-bar {
    flex-direction: column;
  }
  
  .products-table {
    font-size: 0.9rem;
  }
  
  .product-thumbnail {
    width: 60px;
    height: 60px;
  }
}
```

#### 3.2.5 Routing

**File:** `frontend/src/App.js` (or routing config)

```javascript
import AdminProductsPage from './pages/AdminProductsPage';

// Inside Routes component
<Route 
  path="/admin/products" 
  element={
    <PrivateRoute requiredRole="admin">
      <AdminLayout>
        <AdminProductsPage />
      </AdminLayout>
    </PrivateRoute>
  } 
/>
```

**Update Admin Navigation:**
```jsx
// In AdminLayout.js or AdminPage.js
<nav className="admin-nav">
  <Link to="/admin/users">👥 Users</Link>
  <Link to="/admin/products">🛍️ Products</Link>
  <Link to="/admin/stories">📰 Stories</Link>
</nav>
```

---

## 4. Implementation Steps

### Phase 1: Backend Foundation
1. ✅ Create `AdminMiddleware` class
2. ✅ Register middleware in `bootstrap/app.php`
3. ✅ Create `Admin\ProductController` with all methods
4. ✅ Add validation rules for product data
5. ✅ Register routes in `api.php`
6. ✅ Test endpoints with Postman/curl

### Phase 2: Frontend Service Layer
1. ✅ Create `adminProductService.js` with API functions
2. ✅ Test API calls with console logging

### Phase 3: Frontend UI Components
1. ✅ Create `AdminProductsPage.js` component
2. ✅ Implement product table with pagination
3. ✅ Add filters functionality
4. ✅ Create modal for create/edit forms
5. ✅ Implement form validation
6. ✅ Add delete confirmation dialog
7. ✅ Implement toggle active button

### Phase 4: Styling & Polish
1. ✅ Create `AdminProductsPage.css`
2. ✅ Add responsive breakpoints
3. ✅ Style modal and forms
4. ✅ Add loading states and spinners
5. ✅ Add error toast notifications

### Phase 5: Integration & Testing
1. ✅ Add route to App.js
2. ✅ Update admin navigation
3. ✅ Test full CRUD workflow
4. ✅ Test pagination with 20+ products
5. ✅ Test filters with various combinations
6. ✅ Test on mobile devices
7. ✅ Verify affiliate link generation

---

## 5. Testing Strategy

### 5.1 Backend API Tests

**Create Product:**
```bash
curl -X POST http://localhost:8000/api/admin/products \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "Test description",
    "image_url": "https://images.unsplash.com/photo-test",
    "original_link": "https://shopee.vn/test-product",
    "weather_tags": ["rain", "clouds"],
    "min_temp": 20,
    "max_temp": 30,
    "is_active": true
  }'
```

**List Products:**
```bash
curl -X GET "http://localhost:8000/api/admin/products?page=1&search=rain&is_active=true" \
  -H "Authorization: Bearer {admin_token}"
```

**Update Product:**
```bash
curl -X PUT http://localhost:8000/api/admin/products/6935c3941ac6f7c6340f4f12 \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Product Name",
    "is_active": false
  }'
```

**Toggle Active:**
```bash
curl -X PATCH http://localhost:8000/api/admin/products/6935c3941ac6f7c6340f4f12/toggle-active \
  -H "Authorization: Bearer {admin_token}"
```

**Delete Product:**
```bash
curl -X DELETE http://localhost:8000/api/admin/products/6935c3941ac6f7c6340f4f12 \
  -H "Authorization: Bearer {admin_token}"
```

### 5.2 Frontend UI Tests

**Test Cases:**
1. ✅ Admin can view product list on page load
2. ✅ Non-admin users redirected to login/dashboard
3. ✅ Search filter updates table results
4. ✅ Weather tag filter works correctly
5. ✅ Active/inactive filter works
6. ✅ Pagination buttons navigate correctly
7. ✅ Create modal opens with empty form
8. ✅ Form validation shows error messages
9. ✅ Product created successfully, modal closes, table refreshes
10. ✅ Edit modal pre-fills form with product data
11. ✅ Product updated successfully
12. ✅ Toggle active switches status immediately
13. ✅ Delete shows confirmation, removes product on confirm
14. ✅ Image preview shows in form
15. ✅ Affiliate link test button opens new tab

### 5.3 Edge Cases

**Backend:**
- ❌ Create product with duplicate name (should allow)
- ❌ Create product with min_temp > max_temp (should fail validation)
- ❌ Create product with empty weather_tags (should fail validation)
- ❌ Update non-existent product (should return 404)
- ❌ Delete product twice (should return 404 on second attempt)
- ❌ Access endpoints without authentication (should return 401)
- ❌ Access endpoints as non-admin (should return 403)

**Frontend:**
- ❌ Submit form with invalid URL format
- ❌ Submit form without selecting weather tags
- ❌ Load page with no products in database (show empty state)
- ❌ Network error during API call (show error toast)
- ❌ Image URL broken (show placeholder)
- ❌ Extremely long product name (should truncate in table)

---

## 6. Security Considerations

### 6.1 Authentication & Authorization
- ✅ All admin endpoints protected by `auth:sanctum` middleware
- ✅ Additional `admin` middleware checks user role
- ✅ Frontend stores JWT token in localStorage (or httpOnly cookie preferred)
- ✅ Token expiration handled with 401 response → redirect to login

### 6.2 Input Validation
- ✅ Backend validates all inputs server-side (never trust client)
- ✅ URL validation prevents XSS via image_url/original_link
- ✅ String max lengths prevent database overflow
- ✅ Weather tags must be from whitelist (prevent injection)
- ✅ Temperature ranges validated (-50 to 60°C realistic range)

### 6.3 Data Sanitization
- ✅ HTML entities escaped in product name/description
- ✅ URLs encoded properly in affiliate link generation
- ✅ MongoDB injection prevented by using Eloquent ORM

### 6.4 CORS Configuration
- ✅ Backend `config/cors.php` allows frontend domain
- ✅ Credentials included in requests for cookie-based auth

---

## 7. Future Enhancements

### 7.1 Image Upload
Currently using external URLs. Future enhancement:
- Upload images to S3/Cloudinary
- Image compression and optimization
- Multiple image variants (thumbnail, full)

### 7.2 Bulk Operations
- Import products from CSV/Excel
- Bulk activate/deactivate products
- Bulk delete with checkboxes

### 7.3 Analytics
- Track click-through rate on affiliate links
- View most recommended products
- Revenue tracking integration with AccessTrade API

### 7.4 Advanced Filters
- Date range for created_at
- Sort by name, created_at, popularity
- Multi-select weather tags

### 7.5 Product Categories
- Add category field (Clothing, Accessories, Sports, etc.)
- Filter by category
- Category-based recommendations

### 7.6 Soft Deletes
- Add `deleted_at` timestamp field
- Implement restore functionality
- Permanent delete after 30 days

---

## 8. Documentation

### 8.1 Admin User Guide

**Creating a Product:**
1. Click "➕ Add New Product" button
2. Fill in all required fields:
   - Product Name: Short, descriptive name
   - Description: Detailed product information
   - Image URL: Direct link to product image (preferably Unsplash or Imgur)
   - Original Link: Shopee/Lazada/Tiki product page URL
   - Weather Tags: Select one or more applicable weather conditions
   - Temperature Range: Optional min/max (leave empty for universal products)
3. Check "Active" to make product visible immediately
4. Click "Create Product"

**Editing a Product:**
1. Click ✏️ edit icon next to product
2. Modify any fields
3. Click "Update Product"

**Deleting a Product:**
1. Click 🗑️ delete icon
2. Confirm deletion in dialog
3. Product permanently removed (or moved to trash if soft delete enabled)

**Quick Toggle Active:**
1. Click status badge (green "✓ Active" or red "✗ Inactive")
2. Status switches immediately

**Testing Affiliate Link:**
1. Click 🔗 link icon
2. Opens AccessTrade deep link in new tab
3. Should redirect to original product page

### 8.2 Developer Notes

**Adding New Weather Tag:**
1. Update validation in `Admin\ProductController` (line ~50)
2. Update checkbox options in `AdminProductsPage.js` (line ~200)
3. Update CSS color classes in `AdminProductsPage.css`
4. Update `AffiliateService` recommendation logic if needed

**Changing Pagination Size:**
1. Update `per_page` in `Admin\ProductController->index()` default
2. Update `per_page` in `adminProductService.js->fetchProducts()`

**Custom Validation Rules:**
- Add to `store()` and `update()` methods
- Return 422 with error messages
- Frontend displays errors under form fields

---

## 9. Dependencies

### Backend
- ✅ Laravel 12.x
- ✅ mongodb/laravel-mongodb 5.x
- ✅ Laravel Sanctum (for API authentication)

### Frontend
- ✅ React 18.x
- ✅ Axios (HTTP client)
- ✅ React Router v6 (routing)

### External Services
- ✅ MongoDB Atlas (database)
- ✅ AccessTrade (affiliate network)
- ✅ Unsplash/Imgur (image hosting)

---

## 10. Acceptance Criteria

### Must Have (MVP)
- ✅ Admin can view paginated product list
- ✅ Admin can create new product with validation
- ✅ Admin can edit existing product
- ✅ Admin can delete product
- ✅ Admin can toggle active status
- ✅ Search filter works
- ✅ Weather tag filter works
- ✅ Active/inactive filter works
- ✅ Pagination works correctly
- ✅ Modal form validates inputs
- ✅ Error messages displayed clearly
- ✅ Affiliate links generated correctly

### Should Have
- ✅ Responsive design (mobile/tablet)
- ✅ Image preview in form
- ✅ Loading states
- ✅ Empty state when no products
- ✅ Delete confirmation dialog
- ✅ Toast notifications for success/error

### Nice to Have
- ⏳ Image upload to cloud storage
- ⏳ Bulk operations
- ⏳ Product analytics
- ⏳ Soft delete with restore
- ⏳ Export to CSV

---

## 11. Risks & Mitigation

### Risk 1: AccessTrade Link Expiration
**Risk:** AccessTrade deep links may expire or change format.  
**Mitigation:** Store original_link separately, regenerate affiliate links periodically, add fallback to original link.

### Risk 2: Image URL Broken
**Risk:** External image URLs become unavailable.  
**Mitigation:** Use reliable image hosting (Unsplash API), implement placeholder fallback, add image validation check before saving.

### Risk 3: Large Product Catalog Performance
**Risk:** Thousands of products slow down admin page.  
**Mitigation:** Implement server-side pagination, add database indexes on frequently queried fields, cache popular searches.

### Risk 4: Unauthorized Access
**Risk:** Non-admin users access product management.  
**Mitigation:** Strong authentication middleware, role-based access control, audit logging for admin actions.

---

## 12. Rollout Plan

### Phase 1: Backend Development (Day 1-2)
- Implement `AdminMiddleware`
- Create `Admin\ProductController`
- Add API routes
- Test all endpoints

### Phase 2: Frontend Development (Day 3-4)
- Create service layer
- Build UI components
- Implement modal forms
- Add styling

### Phase 3: Integration Testing (Day 5)
- Test full CRUD workflow
- Fix bugs
- Test edge cases
- Mobile testing

### Phase 4: Production Deployment (Day 6)
- Deploy backend to server
- Deploy frontend
- Update DNS/CORS settings
- Monitor error logs

### Phase 5: Documentation & Training (Day 7)
- Write admin user guide
- Record video tutorial
- Train admin staff

---

## 13. Success Metrics

**Functional Metrics:**
- ✅ All CRUD operations work without errors
- ✅ Page load time < 2 seconds
- ✅ API response time < 500ms
- ✅ Zero unauthorized access attempts succeed

**Usability Metrics:**
- ✅ Admin can add product in < 2 minutes
- ✅ Zero training required (intuitive UI)
- ✅ No complaints about confusing interface

**Business Metrics:**
- ✅ 100% of products have valid affiliate links
- ✅ Product catalog updated weekly
- ✅ Click-through rate on recommendations increases by 10%

---

## 14. Appendix

### A. Weather Tag Reference
```javascript
const WEATHER_TAGS = {
  'rain': 'Mưa',
  'drizzle': 'Mưa phùn',
  'thunderstorm': 'Giông bão',
  'clear': 'Trời quang',
  'sunny': 'Nắng',
  'clouds': 'Nhiều mây',
  'fog': 'Sương mù',
  'snow': 'Tuyết'
};
```

### B. Temperature Range Guidelines
- **Hot (30-45°C):** Sunscreen, hats, cooling products
- **Warm (20-30°C):** Light clothing, accessories
- **Moderate (10-20°C):** Jackets, hoodies
- **Cold (-10-10°C):** Heavy coats, thermal wear
- **Universal (null):** Umbrellas, bags, non-temperature-specific

### C. API Response Codes
- `200 OK`: Successful GET, PUT, PATCH
- `201 Created`: Successful POST
- `204 No Content`: Successful DELETE
- `400 Bad Request`: Invalid input format
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Valid token but insufficient permissions
- `404 Not Found`: Resource doesn't exist
- `422 Unprocessable Entity`: Validation failed
- `500 Internal Server Error`: Server-side error

---

**End of Specification**

---

**Approval Required From:**
- [ ] Backend Lead
- [ ] Frontend Lead
- [ ] Product Owner
- [ ] Security Team

**Estimated Effort:** 6-7 days (1 developer)

**Priority:** High

**Target Release:** Sprint 4 (December 2025)
