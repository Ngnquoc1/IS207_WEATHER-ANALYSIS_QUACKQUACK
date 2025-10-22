import React, { useState } from 'react';
import './ManualTab.css';

const ManualTab = ({ 
  isDark,
  // Props từ SearchModal
  selectedLocation,
  setSelectedLocation,
  loading,
  setLoading,
  error,
  setError,
  onSelectLocation
  
}) => {
  // Manual input state
  const [manualLat, setManualLat] = useState('');
  const [manualLon, setManualLon] = useState('');

  // Handle manual input validation
  const isValidCoordinates = (lat, lon) => {
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    return !isNaN(latNum) && !isNaN(lonNum) && 
           latNum >= -90 && latNum <= 90 && 
           lonNum >= -180 && lonNum <= 180;
  };

  // Handle manual search
  const handleManualSearch = () => {
    if (isValidCoordinates(manualLat, manualLon)) {
      if (setError) setError('');
      if (setLoading) setLoading(true);
      
      // Simulate API call giống SearchModal
      setTimeout(() => {
        const locationName = `Tọa độ ${parseFloat(manualLat).toFixed(4)}, ${parseFloat(manualLon).toFixed(4)}`;
        const locationData = {
          name: locationName,
          latitude: parseFloat(manualLat),
          longitude: parseFloat(manualLon)
        };
        
        if (setSelectedLocation) {
          setSelectedLocation(locationData);
        }
        if (setLoading) setLoading(false);
      }, 1000);
    }
  };

  return (
    <div className={`manual-tab ${isDark ? 'theme-dark' : 'theme-light'}`}>
      {/* Manual Input Form */}
      <div className="manual-input-form">
        <div className="input-group">
          <label>Vĩ độ</label>
          <input 
            type="number" 
            value={manualLat}
            onChange={(e) => setManualLat(e.target.value)}
            placeholder="Khoảng: -90 đến 90"
            min="-90" 
            max="90"
            step="any"
          />
        </div>
        <div className="input-group">
          <label>Kinh độ</label>
          <input 
            type="number" 
            value={manualLon}
            onChange={(e) => setManualLon(e.target.value)}
            placeholder="Khoảng: -180 đến 180"
            min="-180" 
            max="180"
            step="any"
          />
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <button 
          className="search-button"
          onClick={handleManualSearch}
          disabled={loading || !isValidCoordinates(manualLat, manualLon)}
        >
          {loading ? 'Đang tìm...' : 'Tìm Vị Trí'}
        </button>
        
        {/* Add selected location display giống SearchModal */}
        {selectedLocation && (
          <div className="selected-location">
            <h3>Vị Trí Đã Chọn:</h3>
            <div className="location-info">
              <p><strong>Tên:</strong> {selectedLocation.name}</p>
              <p><strong>Vĩ độ:</strong> {selectedLocation.latitude}</p>
              <p><strong>Kinh độ:</strong> {selectedLocation.longitude}</p>
            </div>
            <button 
              className="select-button"
              onClick={onSelectLocation}
            >
              Xem Thời Tiết Tại Đây
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManualTab;
