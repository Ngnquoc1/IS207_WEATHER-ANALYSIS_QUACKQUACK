import React, { useState, useEffect } from 'react';
import { fetchLocationByName } from '../../services/weatherService';
import './NameTab.css';

/**
 * NameTab Component
 * Allows users to search for locations by name using Open-Meteo Geocoding API
 */
const NameTab = ({ 
  isDark,
  selectedLocation,
  setSelectedLocation,
  loading,
  setLoading,
  error,
  setError,
  onSelectLocation
}) => {
  // Internal state for search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search effect
  useEffect(() => {
    // Clear results if query is too short
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setError('');
      return;
    }

    // Debounce search (500ms)
    const timer = setTimeout(async () => {
      setIsSearching(true);
      setError('');

      try {
        console.log('Searching for:', searchQuery);
        const results = await fetchLocationByName(searchQuery);
        console.log('Search results:', results);
        setSearchResults(results);
        
        // If no results, show friendly message
        if (!results || results.length === 0) {
          setError('Không tìm thấy địa điểm nào phù hợp');
        }
      } catch (err) {
        console.error('Search error:', err);
        setError(err.message || 'Không thể tìm kiếm địa điểm. Vui lòng kiểm tra kết nối mạng.');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    // Cleanup timer on query change
    return () => clearTimeout(timer);
  }, [searchQuery, setError]);

  // Handle result selection
  const handleSelectResult = (result) => {
    setSelectedLocation({
      name: result.name,
      latitude: result.latitude,
      longitude: result.longitude,
      country: result.country,
      admin1: result.admin1
    });
    setSearchResults([]); // Clear results after selection
    setSearchQuery(''); // Clear search input
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setError('');
  };

  return (
    <div className={`name-tab-container ${isDark ? 'theme-dark' : 'theme-light'}`}>
      {/* Search Input Section */}
      <div className="search-input-section">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Nhập tên thành phố, quốc gia..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Tìm kiếm địa điểm theo tên"
          />
          {searchQuery && (
            <button 
              className="clear-button"
              onClick={handleClearSearch}
              aria-label="Xóa tìm kiếm"
            >
              ✕
            </button>
          )}
        </div>

        {/* Search hint */}
        {searchQuery.length === 1 && (
          <p className="search-hint">Nhập ít nhất 2 ký tự để tìm kiếm</p>
        )}
      </div>

      {/* Loading State */}
      {isSearching && (
        <div className="search-loading">
          <div className="loading-spinner"></div>
          <p>Đang tìm kiếm...</p>
        </div>
      )}

      {/* Error Message */}
      {error && !isSearching && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <div>
            <p>{error}</p>
            {searchQuery && (
              <button 
                className="retry-button"
                onClick={() => {
                  setError('');
                  setSearchQuery(searchQuery + ' '); // Trigger re-search
                  setTimeout(() => setSearchQuery(searchQuery.trim()), 100);
                }}
              >
                Thử lại
              </button>
            )}
          </div>
        </div>
      )}

      {/* Search Results */}
      {!isSearching && searchResults.length > 0 && (
        <div className="search-results">
          <p className="results-count">
            Tìm thấy {searchResults.length} kết quả
          </p>
          <div className="results-list" role="listbox">
            {searchResults.map((result) => (
              <div
                key={result.id}
                className="result-item"
                onClick={() => handleSelectResult(result)}
                role="option"
                aria-selected={false}
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleSelectResult(result);
                }}
              >
                <div className="result-name">{result.name}</div>
                <div className="result-details">
                  {result.admin1 && `${result.admin1}, `}{result.country}
                </div>
                <div className="result-coords">
                  {result.latitude.toFixed(4)}°, {result.longitude.toFixed(4)}°
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results Message */}
      {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && !error && (
        <div className="no-results">
          <span className="no-results-icon">🔍</span>
          <p>Không tìm thấy địa điểm nào</p>
          <p className="no-results-hint">Thử tìm kiếm với từ khóa khác</p>
        </div>
      )}

      {/* Selected Location Display */}
      {selectedLocation && (
        <div className="selected-location-display">
          <h4>Địa điểm đã chọn</h4>
          <div className="selected-location-info">
            <p className="location-name">{selectedLocation.name}</p>
            {selectedLocation.admin1 && (
              <p className="location-region">{selectedLocation.admin1}, {selectedLocation.country}</p>
            )}
            {!selectedLocation.admin1 && selectedLocation.country && (
              <p className="location-region">{selectedLocation.country}</p>
            )}
            <p className="location-coords">
              Vĩ độ: {selectedLocation.latitude}° | Kinh độ: {selectedLocation.longitude}°
            </p>
          </div>
          <button 
            className="confirm-button"
            onClick={onSelectLocation}
            disabled={!selectedLocation}
          >
            Chọn vị trí này
          </button>
        </div>
      )}

      {/* Empty State (no search yet) */}
      {!searchQuery && !selectedLocation && searchResults.length === 0 && (
        <div className="empty-state">
          <span className="empty-state-icon">🗺️</span>
          <h3>Tìm kiếm địa điểm</h3>
          <p>Nhập tên thành phố, quốc gia hoặc địa danh để tìm kiếm</p>
          <div className="search-examples">
            <p className="examples-title">Ví dụ:</p>
            <div className="example-chips">
              <span className="example-chip" onClick={() => setSearchQuery('Hà Nội')}>Hà Nội</span>
              <span className="example-chip" onClick={() => setSearchQuery('Paris')}>Paris</span>
              <span className="example-chip" onClick={() => setSearchQuery('Tokyo')}>Tokyo</span>
              <span className="example-chip" onClick={() => setSearchQuery('New York')}>New York</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NameTab;
