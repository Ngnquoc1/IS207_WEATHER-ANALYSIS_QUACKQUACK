# Bản Đồ Lượng Mưa Thế Giới - RainMap Component

## Tổng quan

Component RainMap hiển thị bản đồ thế giới với dữ liệu lượng mưa thời gian thực từ các thành phố lớn trên toàn cầu. Sử dụng thư viện Leaflet và React-Leaflet để tạo bản đồ tương tác.

## Tính năng chính

### 🗺️ Bản đồ tương tác

- Bản đồ thế giới với tile maps từ OpenStreetMap
- Hỗ trợ chế độ dark/light theme
- Responsive design cho mobile và desktop
- Zoom và pan để khám phá các khu vực

### 🌧️ Hiển thị dữ liệu mưa

- **24 thành phố lớn** được theo dõi trên toàn thế giới
- **Màu sắc trực quan**:
  - 🟢 Xanh lá: Không mưa (0mm)
  - 🟡 Vàng: Mưa nhẹ (<1mm)
  - 🟠 Cam: Mưa vừa (1-5mm)
  - 🔴 Đỏ: Mưa to (>10mm)
- **Kích thước điểm**: Tỷ lệ với lượng mưa

### 📊 Thông tin chi tiết

- **Tooltip**: Hiển thị khi hover chuột
- **Popup**: Thông tin đầy đủ khi click
- **Dữ liệu thời tiết**: Nhiệt độ, độ ẩm, tốc độ gió, mô tả thời tiết

### 🔗 Tích hợp Dashboard

- Click vào thành phố để chuyển đến dashboard
- Truyền tọa độ và tên thành phố qua URL parameters
- Tự động load dữ liệu thời tiết chi tiết

## Cách sử dụng

### Import component

```javascript
import RainMap from "../components/RainMap"

// Trong component
;<RainMap isDark={isDark} />
```

### Props

- `isDark` (boolean): Chế độ dark/light theme

### Dependencies

```json
{
  "leaflet": "^1.9.4",
  "react-leaflet": "^5.0.0"
}
```

## Cấu trúc dữ liệu

### Danh sách thành phố được theo dõi

```javascript
const majorCities = [
  {
    name: "Hà Nội",
    lat: 21.0285,
    lon: 105.8542,
    country: "Vietnam",
  },
  {
    name: "TP.HCM",
    lat: 10.8231,
    lon: 106.6297,
    country: "Vietnam",
  },
  {
    name: "Tokyo",
    lat: 35.6762,
    lon: 139.6503,
    country: "Japan",
  },
  // ... 21 thành phố khác
]
```

### Dữ liệu thời tiết

```javascript
{
  precipitation: 2.5,        // Lượng mưa (mm)
  temperature: 25.3,         // Nhiệt độ (°C)
  humidity: 78,              // Độ ẩm (%)
  windSpeed: 12.5,           // Tốc độ gió (km/h)
  weatherDescription: 'Mưa nhẹ' // Mô tả thời tiết
}
```

## API Integration

### Weather Service

Sử dụng `fetchWeatherData()` từ `weatherService.js`:

```javascript
const weatherData = await fetchWeatherData(
  city.lat,
  city.lon,
)
```

### Backend API

- Endpoint: `/api/weather/{lat}/{lon}`
- Provider: Open-Meteo API
- Timeout: 10 giây
- Error handling: Graceful fallback

## Styling

### CSS Classes chính

- `.rain-map-container`: Container chính
- `.map-header`: Tiêu đề và mô tả
- `.map-legend`: Chú thích màu sắc
- `.rain-map`: Bản đồ Leaflet
- `.selected-location-info`: Thông tin thành phố được chọn

### Theme Support

```css
.theme-dark {
  background-color: #2d3748;
  color: #e2e8f0;
}

.theme-light {
  background-color: #ffffff;
  color: #2d3748;
}
```

## Responsive Design

### Breakpoints

- **Desktop**: > 768px - Layout 2 cột
- **Tablet**: 768px - Layout 1 cột, map trên cùng
- **Mobile**: < 480px - Compact layout, smaller map

### Mobile Optimizations

- Giảm kích thước bản đồ
- Simplified legend
- Touch-friendly interactions
- Optimized popup sizing

## Performance

### Loading States

- Spinner animation khi tải dữ liệu
- Parallel API calls cho tất cả thành phố
- Error handling cho từng thành phố riêng lẻ

### Caching

- Dữ liệu được cache trong component state
- Refresh button để cập nhật dữ liệu
- Optimistic UI updates

## Troubleshooting

### Common Issues

1. **Bản đồ không hiển thị**

   - Kiểm tra CSS imports: `import 'leaflet/dist/leaflet.css'`
   - Verify Leaflet icon fix

2. **Dữ liệu không load**

   - Check network connectivity
   - Verify backend API is running
   - Check browser console for errors

3. **Styling issues**
   - Ensure CSS file is imported
   - Check theme context is working
   - Verify responsive breakpoints

### Debug Mode

Enable console logging:

```javascript
console.log("Rain data:", rainData)
console.log(
  "Selected location:",
  selectedLocation,
)
```

## Future Enhancements

### Planned Features

- [ ] Real-time updates với WebSocket
- [ ] Historical rain data charts
- [ ] Custom city selection
- [ ] Export data functionality
- [ ] Offline mode support
- [ ] More detailed weather layers

### API Improvements

- [ ] Caching layer với Redis
- [ ] Rate limiting
- [ ] Multiple weather providers
- [ ] Batch API calls optimization

## Contributing

### Code Style

- ESLint configuration
- Prettier formatting
- Component documentation
- Error boundary implementation

### Testing

- Unit tests cho utility functions
- Integration tests cho API calls
- E2E tests cho user interactions
- Performance testing

---

**Tác giả**: Weather Analysis Team  
**Phiên bản**: 1.0.0  
**Cập nhật**: 2024
