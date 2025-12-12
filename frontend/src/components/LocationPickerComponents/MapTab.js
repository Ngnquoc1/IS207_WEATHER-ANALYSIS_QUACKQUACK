import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap, useMapEvents, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapTab.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icons for different marker types
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 25px;
      height: 25px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      position: relative;
    ">
      <div style="
        transform: rotate(45deg);
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(45deg);
        width: 8px;
        height: 8px;
        background-color: white;
        border-radius: 50%;
      "></div>
    </div>`,
    iconSize: [25, 25],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24]
  });
};

// Predefined icons
const blueIcon = createCustomIcon('#007bff'); // Blue for current position
const redIcon = createCustomIcon('#dc3545');  // Red for selected position

// Popular locations data
const popularLocations = [
  { name: 'Hà Nội', coords: [21.0285, 105.8542] },
  { name: 'TPHCM', coords: [10.8231, 106.6297] },
  { name: 'Tokyo', coords: [35.6762, 139.6503] },
  { name: 'New York', coords: [40.7128, -74.0060] },
  { name: 'London', coords: [51.5074, -0.1278] },
  { name: 'Paris', coords: [48.8566, 2.3522] }
];

// Map type configurations
const mapConfigs = {
  standard: {
    name: 'OpenStreetMap Standard (Tiêu chuẩn)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  satellite: {
    name: 'Esri World Imagery (Vệ tinh)',
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
  },
  terrain: {
    name: 'OpenTopoMap (Địa hình)',
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://opentopomap.org/">OpenTopoMap</a>',
  },
  dark: {
    name: 'CartoDB Dark (Tối)',
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  }
};

// Map Controls Component - Sử dụng useMap và useMapEvents hooks
const MapControls = ({ 
  currentPosition, 
  isLoadingLocation,
  onCoordinatesChange,
  resetClickedPosition,
  onMapCenterChange,
  onMapCenterReset,
  onMapClick
}) => {
  const map = useMap();
  const [currentCenter, setCurrentCenter] = useState(map.getCenter());
  const [clickedPosition, setClickedPosition] = useState(null);
  
  // Reset clicked position when resetClickedPosition changes
  useEffect(() => {
    if (resetClickedPosition) {
      setClickedPosition(null);
    }
  }, [resetClickedPosition]);
  
  // Handle return to current location - moved from parent component
  const handleReturnToCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newPosition = [latitude, longitude];
          
          // Use map.setView() to move map directly
          map.setView(newPosition, map.getZoom());
          
          // Update coordinates through callback
          if (onCoordinatesChange) {
            onCoordinatesChange({ lat: latitude, lon: longitude });
          }
          
          console.log('Returned to current position:', latitude, longitude);
        },
        (error) => {
          console.error('Error getting current location:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0 // Always get fresh location
        }
      );
    }
  }, [map, onCoordinatesChange]);

  // Handle map center changes from parent (popular locations)
  const handleMapCenterChange = useCallback((coords) => {
    map.setView(coords, map.getZoom());
    if (onCoordinatesChange) {
      onCoordinatesChange({ lat: coords[0], lon: coords[1] });
    }
  }, [map, onCoordinatesChange]);

  // Listen for map center changes from parent
  useEffect(() => {
    if (onMapCenterChange) {
      handleMapCenterChange(onMapCenterChange);
      // Reset the prop after using it
      if (onMapCenterReset) {
        onMapCenterReset();
      }
    }
  }, [onMapCenterChange, handleMapCenterChange, onMapCenterReset]);
  
  // Sử dụng useMapEvents để lắng nghe map events
  useMapEvents({
  
    move: (e) => {
      const center = map.getCenter();
      setCurrentCenter(center);
      if (onCoordinatesChange) {
        onCoordinatesChange({ lat: center.lat, lon: center.lng });
      }
    },
    click: (e) => {
      const { lat, lng } = e.latlng;
      setClickedPosition([lat, lng]);
      if (onCoordinatesChange) {
        onCoordinatesChange({ lat, lon: lng });
      }
      // Call handleMapClick to set selected location
      if (onMapClick) {
        onMapClick({ lat, lon: lng });
      }
    }
  });
  
  return (
    <>
      {/* Floating Card */}
      <div className="floating-card">
        <div className="coordinate-display">
          <span>Vĩ độ: {currentCenter.lat.toFixed(5)}</span>
          <span>Kinh độ: {currentCenter.lng.toFixed(5)}</span>
        </div>
      </div>

      {/* Current location marker */}
      {!isLoadingLocation && currentPosition && (
        <Marker position={currentPosition} icon={blueIcon}>
          <Tooltip direction="top" offset={[0, -10]} opacity={1}>
            <div className="location-tooltip">
              <strong>Vị trí hiện tại</strong><br/>
              <span>{currentPosition[0].toFixed(4)}, {currentPosition[1].toFixed(4)}</span>
            </div>
          </Tooltip>
        </Marker>
      )}

      {/* Clicked position marker */}
      {clickedPosition && (
        <Marker position={clickedPosition} icon={redIcon}>
          <Tooltip direction="top" offset={[0, -10]} opacity={1}>
            <div className="location-tooltip">
              <strong>Vị trí đã chọn</strong><br/>
              <span>{clickedPosition[0].toFixed(4)}, {clickedPosition[1].toFixed(4)}</span>
            </div>
          </Tooltip>
        </Marker>
      )}

      {/* Return to current location button */}
      <div className="map-return-location-btn">
        <button 
          className="return-location-button"
          onClick={(e) => {
            e.stopPropagation(); // Ngăn chặn event bubbling
            e.preventDefault(); // Ngăn chặn default behavior
            handleReturnToCurrentLocation();
          }}
          disabled={isLoadingLocation}
          title="Về vị trí hiện tại"
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <span>Về vị trí hiện tại</span>
        </button>
      </div>
    </>
  );
};



const MapTab = ({ 
  isDark, 
  onSelectLocation, 
  setSelectedLocation,
  mapType = 'standard',
  // Props từ SearchModal
  selectedLocation,
  loading,
  setLoading,
  error,
  setError
}) => {
  // Simplified state - chỉ giữ những state cần thiết ở component cha
  const [currentPosition, setCurrentPosition] = useState([21.0285, 105.8542]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [resetClickedPosition, setResetClickedPosition] = useState(false);
  const [mapCenterToSet, setMapCenterToSet] = useState(null);

  const currentMapConfig = mapConfigs[mapType] || mapConfigs.standard;

  // Initialize current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newPosition = [latitude, longitude];
          setCurrentPosition(newPosition);
          setMapCenterToSet(newPosition); // Set initial map center
          setIsLoadingLocation(false);
          console.log('Current position:', latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLoadingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      console.log('Geolocation is not supported by this browser.');
      setIsLoadingLocation(false);
    }
  }, []);

  // Handle popular location selection
  const handleLocationSelect = useCallback((coords) => {
    setMapCenterToSet(coords);
    setResetClickedPosition(true); // Reset clicked marker
    setTimeout(() => setResetClickedPosition(false), 100); // Reset flag after a short delay
  }, []);

  // Handle coordinates change from map movement
  const handleCoordinatesChange = useCallback((coordinates) => {
    // Coordinates are handled by MapControls component
  }, []);

  const reverseGeocodeName = async (lat, lon) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&accept-language=vi`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'weather-dashboard/1.0 (+https://localhost)'
        }
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data?.address?.city
        || data?.address?.town
        || data?.address?.village
        || data?.display_name
        || null;
    } catch (e) {
      console.warn('Reverse geocode (Nominatim) failed', e);
      return null;
    }
  };

  // Handle map click to set selected location
  const handleMapClick = useCallback(async (coordinates) => {
    if (setError) setError('');
    if (setLoading) setLoading(true);
    
    const fallbackName = `Tọa độ ${coordinates.lat.toFixed(4)}, ${coordinates.lon.toFixed(4)}`;
    let locationName = fallbackName;

    const name = await reverseGeocodeName(coordinates.lat, coordinates.lon);
    if (name) locationName = name;

    const locationData = {
      name: locationName,
      latitude: coordinates.lat,
      longitude: coordinates.lon
    };
    
    if (setSelectedLocation) {
      setSelectedLocation(locationData);
    }
    if (setLoading) setLoading(false);
  }, [setSelectedLocation, setLoading, setError]);

  // Reset map center after it's been used
  const resetMapCenter = useCallback(() => {
    setMapCenterToSet(null);
  }, []);

  return (
    <div className={`map-tab ${isDark ? 'theme-dark' : 'theme-light'}`}>
      {/* Popular Locations */}
      <div className="popular-locations">
        {popularLocations.map(location => (
          <button 
            key={location.name}
            className="location-chip"
            onClick={() => handleLocationSelect(location.coords)}
          >
            {location.name}
          </button>
        ))}
      </div>


      {/* Map and Selected Location Container */}
      <div className="map-and-location-wrapper">
        {/* Map Container */}
        <div style={{height: '100%'}} className="map-container">
          <MapContainer
            center={[21.0285, 105.8542]} // Default center, will be changed by setView
            zoom={10}
            className="location-picker-map"
            zoomControl={false}
          >
            <ZoomControl position="bottomleft" />
            <TileLayer
              url={currentMapConfig.url}
              attribution={currentMapConfig.attribution}
            />
            
            <MapControls
              currentPosition={currentPosition}
              isLoadingLocation={isLoadingLocation}
              onCoordinatesChange={handleCoordinatesChange}
              resetClickedPosition={resetClickedPosition}
              onMapCenterChange={mapCenterToSet}
              onMapCenterReset={resetMapCenter}
              onMapClick={handleMapClick}
            />
          </MapContainer>
        </div>

        {/* Selected Location Display */}
        {selectedLocation && (
          <div className="selected-location sidebar">
            <h3>Vị Trí Đã Chọn:</h3>
            <div className="location-info">
              <p><strong>Tên:</strong> {selectedLocation.name}</p>
              <p><strong>Vĩ độ:</strong> {selectedLocation.latitude}</p>
              <p><strong>Kinh độ:</strong> {selectedLocation.longitude}</p>
            </div>
            <button 
              className="select-button"
              onClick={onSelectLocation}
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Xem Thời Tiết Tại Đây'}
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}
     
    </div>
  );
};

export default MapTab;
