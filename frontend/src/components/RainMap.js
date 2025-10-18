import React from 'react';
import LocationPicker from './LocationPicker';
import './RainMap.css';

const RainMap = ({ isDark, onLocationSelect }) => {
  const handleLocationSelect = (location) => {
    // Call the parent callback first
    if (onLocationSelect) {
      onLocationSelect(location);
    }
    
    // // Only navigate to dashboard if no parent callback (standalone usage)
    // if (!onLocationSelect) {
    //   const params = new URLSearchParams({
    //     lat: location.lat,
    //     lon: location.lon,
    //     name: location.name
    //   });
    //   window.location.href = `/dashboard?${params.toString()}`;
    // }
  };

  return (
    <div className={`rain-map-container ${isDark ? 'theme-dark' : 'theme-light'}`}>
      <LocationPicker 
        isDark={isDark} 
        onLocationSelect={handleLocationSelect}
      />
    </div>
  );
};

export default RainMap;
