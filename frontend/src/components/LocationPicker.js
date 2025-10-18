import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './LocationPicker.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Component to handle map click events
const MapClickHandler = ({ onLocationSelect, setSelectedLocation, setClickedPosition }) => {
  useMapEvents({
    click: (e) => {
      console.log("Map clicked!", e);
      const { lat, lng } = e.latlng;
      const newLocation = {
        lat: lat,
        lon: lng,
        name: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
      };
      console.log("new location ", newLocation);
      setSelectedLocation(newLocation);
      setClickedPosition([lat, lng]);
      
      // Call the callback function to pass location to parent
      if (onLocationSelect) {
        onLocationSelect(newLocation);
      }
    }
  });
  return null;
};

const LocationPicker = ({ isDark, onLocationSelect }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [clickedPosition, setClickedPosition] = useState(null);

  const handleConfirmLocation = () => {
    if (selectedLocation && onLocationSelect) {
      onLocationSelect(selectedLocation);
    }
  };

  const handleClearSelection = () => {
    setSelectedLocation(null);
    setClickedPosition(null);
  };

  return (
    <div className={`location-picker-container ${isDark ? 'theme-dark' : 'theme-light'}`}>
      <div className="picker-header">
        <h2>Chọn Vị Trí Trên Bản Đồ</h2>
        <p>Click vào bất kỳ vị trí nào trên bản đồ để chọn tọa độ</p>
      </div>

      <div className="map-container">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{ height: '500px', width: '100%' }}
          className="location-picker-map"
        >
          <TileLayer
            url={isDark 
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            }
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          <MapClickHandler 
            onLocationSelect={onLocationSelect}
            setSelectedLocation={setSelectedLocation}
            setClickedPosition={setClickedPosition}
          />

          {clickedPosition && (
            <Marker position={clickedPosition}>
              <Popup>
                <div className="location-popup">
                  <h4>Vị trí đã chọn</h4>
                  <p><strong>Vĩ độ:</strong> {selectedLocation.lat.toFixed(6)}</p>
                  <p><strong>Kinh độ:</strong> {selectedLocation.lon.toFixed(6)}</p>
                  <p><strong>Tọa độ:</strong> {selectedLocation.name}</p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {selectedLocation && (
        <div className="selected-location-info">
          <h3>Vị trí đã chọn:</h3>
          <div className="location-details">
            <p><strong>Vĩ độ:</strong> {selectedLocation.lat.toFixed(6)}</p>
            <p><strong>Kinh độ:</strong> {selectedLocation.lon.toFixed(6)}</p>
            <p><strong>Tọa độ:</strong> {selectedLocation.name}</p>
          </div>
          <div className="action-buttons">
            <button 
              className="confirm-btn"
              onClick={handleConfirmLocation}
            >
              Xác Nhận Vị Trí
            </button>
            <button 
              className="clear-btn"
              onClick={handleClearSelection}
            >
              Chọn Lại
            </button>
          </div>
        </div>
      )}

      <div className="picker-instructions">
        <h4>Hướng dẫn sử dụng:</h4>
        <ul>
          <li>Click vào bất kỳ vị trí nào trên bản đồ để chọn tọa độ</li>
          <li>Marker sẽ xuất hiện tại vị trí bạn đã click</li>
          <li>Click "Xác Nhận Vị Trí" để sử dụng tọa độ này cho tìm kiếm</li>
          <li>Click "Chọn Lại" để xóa và chọn vị trí khác</li>
        </ul>
      </div>
    </div>
  );
};

export default LocationPicker;
