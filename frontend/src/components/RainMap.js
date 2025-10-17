import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchBulkWeatherData } from '../services/weatherService';
import './RainMap.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const RainMap = ({ isDark }) => {
  const [rainData, setRainData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isUsingDemoData, setIsUsingDemoData] = useState(false);

  // Danh sách các thành phố lớn để lấy dữ liệu mưa
  const majorCities = [
    { name: 'Hà Nội', lat: 21.0285, lon: 105.8542, country: 'Vietnam' },
    { name: 'TP.HCM', lat: 10.8231, lon: 106.6297, country: 'Vietnam' },
    { name: 'Đà Nẵng', lat: 16.0544, lon: 108.2022, country: 'Vietnam' },
    { name: 'Tokyo', lat: 35.6762, lon: 139.6503, country: 'Japan' },
    { name: 'Seoul', lat: 37.5665, lon: 126.9780, country: 'South Korea' },
    { name: 'Beijing', lat: 39.9042, lon: 116.4074, country: 'China' },
    { name: 'Shanghai', lat: 31.2304, lon: 121.4737, country: 'China' },
    { name: 'New York', lat: 40.7128, lon: -74.0060, country: 'USA' },
    { name: 'Los Angeles', lat: 34.0522, lon: -118.2437, country: 'USA' },
    { name: 'London', lat: 51.5074, lon: -0.1278, country: 'UK' },
    { name: 'Paris', lat: 48.8566, lon: 2.3522, country: 'France' },
    { name: 'Berlin', lat: 52.5200, lon: 13.4050, country: 'Germany' },
    { name: 'Rome', lat: 41.9028, lon: 12.4964, country: 'Italy' },
    { name: 'Sydney', lat: -33.8688, lon: 151.2093, country: 'Australia' },
    { name: 'Melbourne', lat: -37.8136, lon: 144.9631, country: 'Australia' },
    { name: 'Mumbai', lat: 19.0760, lon: 72.8777, country: 'India' },
    { name: 'Delhi', lat: 28.7041, lon: 77.1025, country: 'India' },
    { name: 'Dubai', lat: 25.2048, lon: 55.2708, country: 'UAE' },
    { name: 'São Paulo', lat: -23.5505, lon: -46.6333, country: 'Brazil' },
    { name: 'Mexico City', lat: 19.4326, lon: -99.1332, country: 'Mexico' },
    { name: 'Cairo', lat: 30.0444, lon: 31.2357, country: 'Egypt' },
    { name: 'Bangkok', lat: 13.7563, lon: 100.5018, country: 'Thailand' },
    { name: 'Singapore', lat: 1.3521, lon: 103.8198, country: 'Singapore' },
    { name: 'Jakarta', lat: -6.2088, lon: 106.8456, country: 'Indonesia' }
  ];

  useEffect(() => {
    fetchRainData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchRainData = async () => {
    setLoading(true);
    try {
      // Use bulk API instead of individual API calls
      const bulkResponse = await fetchBulkWeatherData();
      
      if (bulkResponse.success) {
        setRainData(bulkResponse.data);
        setIsUsingDemoData(false);
        console.log(`✅ Loaded weather data for ${bulkResponse.total_cities} cities`);
        
        // Log any errors if they exist
        if (bulkResponse.errors && bulkResponse.errors.length > 0) {
          console.warn('⚠️ Some cities failed to load:', bulkResponse.errors);
        }
      } else {
        throw new Error(bulkResponse.message || 'Failed to fetch bulk weather data');
      }
    } catch (error) {
      console.error('❌ Error fetching bulk weather data:', error);
      
      // Fallback: Use static data instead of individual API calls to avoid spam
      console.log('🔄 Using static fallback data to avoid API spam...');
      const fallbackData = majorCities.map(city => ({
        ...city,
        precipitation: Math.random() * 5, // Random rain data for demo
        temperature: Math.floor(Math.random() * 30) + 10, // Random temp 10-40°C
        humidity: Math.floor(Math.random() * 40) + 40, // Random humidity 40-80%
        weatherDescription: 'Dữ liệu demo',
        windSpeed: Math.floor(Math.random() * 20) + 5 // Random wind 5-25 km/h
      }));
      
      setRainData(fallbackData);
      setIsUsingDemoData(true);
      console.warn('⚠️ Using demo data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRainColor = (precipitation) => {
    if (precipitation === 0) return '#4CAF50'; // Xanh lá - không mưa
    if (precipitation < 1) return '#8BC34A'; // Xanh lá nhạt - mưa nhẹ
    if (precipitation < 5) return '#FFC107'; // Vàng - mưa vừa
    if (precipitation < 10) return '#FF9800'; // Cam - mưa to
    return '#F44336'; // Đỏ - mưa rất to
  };

  const getRainSize = (precipitation) => {
    const baseSize = 8;
    const maxSize = 25;
    return Math.min(baseSize + precipitation * 2, maxSize);
  };

  const handleLocationClick = (city) => {
    // Navigate to dashboard with this location
    const params = new URLSearchParams({
      lat: city.lat,
      lon: city.lon,
      name: city.name
    });
    window.location.href = `/dashboard?${params.toString()}`;
  };

  if (loading) {
    return (
      <div className="map-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải dữ liệu mưa từ các thành phố trên thế giới...</p>
      </div>
    );
  }

  return (
    <div className={`rain-map-container ${isDark ? 'theme-dark' : 'theme-light'}`}>
      <div className="map-header">
        <h2>Bản Đồ Lượng Mưa Thế Giới</h2>
        <p>Click vào các điểm để xem chi tiết thời tiết và chuyển đến dashboard</p>
        {isUsingDemoData && (
          <div className="demo-warning">
            ⚠️ Đang sử dụng dữ liệu demo. Vui lòng kiểm tra kết nối mạng.
          </div>
        )}
      </div>

      <div className="map-legend">
        <h4>Chú thích lượng mưa:</h4>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-dot" style={{ backgroundColor: '#4CAF50' }}></div>
            <span>Không mưa (0mm)</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ backgroundColor: '#8BC34A' }}></div>
            <span>Mưa nhẹ (&lt;1mm)</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ backgroundColor: '#FFC107' }}></div>
            <span>Mưa vừa (1-5mm)</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ backgroundColor: '#FF9800' }}></div>
            <span>Mưa to (5-10mm)</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ backgroundColor: '#F44336' }}></div>
            <span>Mưa rất to (&gt;10mm)</span>
          </div>
        </div>
      </div>

      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '500px', width: '100%' }}
        className="rain-map"
      >
        <TileLayer
          url={isDark 
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {rainData.map((city) => (
          <CircleMarker
            key={city.name}
            center={[city.lat, city.lon]}
            radius={getRainSize(city.precipitation)}
            pathOptions={{
              fillColor: getRainColor(city.precipitation),
              color: '#fff',
              weight: 2,
              opacity: 0.8,
              fillOpacity: 0.7
            }}
            eventHandlers={{
              click: () => setSelectedLocation(city)
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1}>
              <div className="tooltip-content">
                <strong>{city.name}</strong><br/>
                <span>{city.country}</span><br/>
                <span>Mưa: {city.precipitation}mm</span>
              </div>
            </Tooltip>

            <Popup>
              <div className="popup-content">
                <h3>{city.name}, {city.country}</h3>
                <div className="weather-details">
                  <p><strong>Lượng mưa:</strong> {city.precipitation}mm</p>
                  <p><strong>Nhiệt độ:</strong> {city.temperature}°C</p>
                  <p><strong>Độ ẩm:</strong> {city.humidity}%</p>
                  <p><strong>Tốc độ gió:</strong> {city.windSpeed} km/h</p>
                  <p><strong>Thời tiết:</strong> {city.weatherDescription}</p>
                </div>
                <button 
                  className="view-details-btn"
                  onClick={() => handleLocationClick(city)}
                >
                  Xem Chi Tiết Thời Tiết
                </button>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {selectedLocation && (
        <div className="selected-location-info">
          <h3>Thông tin chi tiết: {selectedLocation.name}</h3>
          <div className="location-details">
            <p><strong>Quốc gia:</strong> {selectedLocation.country}</p>
            <p><strong>Lượng mưa:</strong> {selectedLocation.precipitation}mm</p>
            <p><strong>Nhiệt độ:</strong> {selectedLocation.temperature}°C</p>
            <p><strong>Độ ẩm:</strong> {selectedLocation.humidity}%</p>
            <p><strong>Tốc độ gió:</strong> {selectedLocation.windSpeed} km/h</p>
            <p><strong>Thời tiết:</strong> {selectedLocation.weatherDescription}</p>
          </div>
          <button 
            className="navigate-btn"
            onClick={() => handleLocationClick(selectedLocation)}
          >
            Chuyển đến Dashboard
          </button>
        </div>
      )}

      <div className="map-info">
        <p><strong>Lưu ý:</strong> Dữ liệu được cập nhật theo thời gian thực từ Open-Meteo API</p>
        <p>Tổng số thành phố được theo dõi: {rainData.length}/24</p>
        <p><strong>Performance:</strong> Sử dụng bulk API để tối ưu tốc độ tải</p>
        {isUsingDemoData && (
          <p><strong>⚠️ Demo Mode:</strong> Đang sử dụng dữ liệu mẫu để tránh spam API</p>
        )}
      </div>
    </div>
  );
};

export default RainMap;
