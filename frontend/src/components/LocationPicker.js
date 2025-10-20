import React, { useState } from 'react';
import { MapTab, ManualTab } from './LocationPickerComponents';
import './LocationPicker.css';


const LocationPicker = ({ 
  isDark, 
  onLocationSelect, 
  mapType = 'standard',
  // New props từ SearchModal
  selectedLocation,
  setSelectedLocation,
  loading,
  setLoading,
  error,
  setError,
  onSelectLocation
}) => {
  // Tab state
  const [activeTab, setActiveTab] = useState('map'); // 'map' | 'manual'

  return (
    <div className={`location-picker-container ${isDark ? 'theme-dark' : 'theme-light'}`}>
      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveTab('map')}
        >
          Chọn trên Bản đồ
        </button>
        <button 
          className={`tab-button ${activeTab === 'manual' ? 'active' : ''}`}
          onClick={() => setActiveTab('manual')}
        >
          Nhập Tọa độ Thủ công
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'map' ? (  
        <MapTab 
          isDark={isDark}
          onSelectLocation={onSelectLocation}
          setSelectedLocation={setSelectedLocation}
          mapType={mapType}
          // Pass SearchModal's state và handlers
          selectedLocation={selectedLocation}
          loading={loading}
          setLoading={setLoading}
          error={error}
          setError={setError}
        />
      ) : (
        <ManualTab 
          isDark={isDark}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          loading={loading}
          setLoading={setLoading}
          error={error}
          setError={setError}
          onSelectLocation={onSelectLocation}
        />
      )}
    </div>
  );
};

export default LocationPicker;
