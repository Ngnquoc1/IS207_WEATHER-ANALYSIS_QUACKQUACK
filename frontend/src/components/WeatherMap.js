import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, LayerGroup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import './WeatherMap.css';

// Fix for default marker icon in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Component to handle map movement and dynamic loading
const DynamicMarkers = ({ indicator, onCitiesUpdate, selectedLocation, currentWeatherData }) => {
    const map = useMap();
    const [markers, setMarkers] = useState([]);
    const [zoom, setZoom] = useState(map.getZoom());
    
    // Refs for debouncing, cancellation, and caching
    const abortControllerRef = useRef(null);
    const debounceTimerRef = useRef(null);
    const weatherCache = useRef(new Map()); // Cache: "lat,lon" -> { data, timestamp }

    // Function to fetch cities based on bounds using Overpass API
    const fetchCitiesInBounds = React.useCallback(async () => {
        const currentZoom = map.getZoom();
        setZoom(currentZoom);

        // Threshold: Only load markers if zoom >= 5
        if (currentZoom < 5) {
            setMarkers([]);
            onCitiesUpdate([]);
            return;
        }

        // Cancel previous request if it exists
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        // Create new AbortController
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        const bounds = map.getBounds();
        const south = bounds.getSouth();
        const north = bounds.getNorth();
        const west = bounds.getWest();
        const east = bounds.getEast();

        // Optimized Overpass Query (Union is faster than Regex)
        let queryBody = '';
        if (currentZoom > 8) {
            queryBody = `
                node["place"="city"](${south},${west},${north},${east});
                node["place"="town"](${south},${west},${north},${east});
            `;
        } else {
            queryBody = `
                node["place"="city"](${south},${west},${north},${east});
            `;
        }

        const overpassQuery = `
            [out:json][timeout:10];
            (
              ${queryBody}
            );
            out body 15;
        `;

        try {
            console.log('Fetching cities from Overpass API...');
            const overpassUrl = 'https://overpass-api.de/api/interpreter';
            const overpassResponse = await axios.post(overpassUrl, `data=${encodeURIComponent(overpassQuery)}`, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                signal // Pass signal to axios
            });

            if (overpassResponse.data && overpassResponse.data.elements) {
                const cities = overpassResponse.data.elements.map(element => ({
                    name: element.tags.name || 'Unknown',
                    lat: element.lat,
                    lon: element.lon,
                    country: element.tags['addr:country'] || 'Unknown'
                }));

                if (cities.length > 0) {
                    // CACHING LOGIC
                    const now = Date.now();
                    const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes cache

                    const citiesToFetch = [];
                    const cachedWeatherData = [];

                    cities.forEach(city => {
                        // Create a unique key for the city location (rounded to 4 decimals)
                        const key = `${city.lat.toFixed(4)},${city.lon.toFixed(4)}`;
                        const cached = weatherCache.current.get(key);

                        if (cached && (now - cached.timestamp < CACHE_DURATION)) {
                            cachedWeatherData.push(cached.data);
                        } else {
                            citiesToFetch.push(city);
                        }
                    });

                    let newWeatherData = [];
                    
                    // Only fetch if there are new cities not in cache
                    if (citiesToFetch.length > 0) {
                        console.log(`Fetching weather for ${citiesToFetch.length} new cities (${cachedWeatherData.length} cached)...`);
                        const weatherResponse = await axios.post(`${API_BASE_URL}/weather/bulk`, {
                            locations: citiesToFetch
                        }, { signal });

                        newWeatherData = weatherResponse.data.data || weatherResponse.data;

                        // Update cache with new data
                        if (Array.isArray(newWeatherData)) {
                            newWeatherData.forEach(data => {
                                const key = `${data.lat.toFixed(4)},${data.lon.toFixed(4)}`;
                                weatherCache.current.set(key, {
                                    data: data,
                                    timestamp: now
                                });
                            });
                        }
                    } else {
                        console.log(`All ${cities.length} cities loaded from cache.`);
                    }

                    // Combine cached data and new data
                    const finalMarkers = [...cachedWeatherData, ...newWeatherData];

                    if (finalMarkers.length > 0) {
                        setMarkers(finalMarkers);
                        onCitiesUpdate(finalMarkers);
                    }
                } else {
                    console.log('No cities found in viewport.');
                    setMarkers([]);
                    onCitiesUpdate([]);
                }
            }
        } catch (error) {
            if (axios.isCancel(error)) {
                console.log('Request canceled:', error.message);
                return;
            }
            console.error('Error fetching cities:', error);
            // Fallback to backend's default list if Overpass fails
            try {
                const response = await axios.get(`${API_BASE_URL}/weather/bulk`, { 
                    params: {
                        lat_min: south,
                        lat_max: north,
                        lon_min: west,
                        lon_max: east
                    },
                    signal // Pass signal to axios
                });
                
                const fallbackData = response.data.data || response.data;
                
                if (Array.isArray(fallbackData)) {
                    setMarkers(fallbackData);
                    onCitiesUpdate(fallbackData);
                }
            } catch (fallbackError) {
                if (!axios.isCancel(fallbackError)) {
                    console.error('Fallback fetch failed:', fallbackError);
                }
            }
        }
    }, [map, onCitiesUpdate]);

    // Debounced event handler
    const handleMapChange = React.useCallback(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
            fetchCitiesInBounds();
        }, 800); // Increased debounce time to 800ms to reduce flickering
    }, [fetchCitiesInBounds]);

    // Listen for map events
    useMapEvents({
        moveend: handleMapChange,
        zoomend: handleMapChange
    });

    // Initial fetch
    useEffect(() => {
        fetchCitiesInBounds();
        return () => {
            // Cleanup on unmount
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [fetchCitiesInBounds]);

    // Create custom icon for city tags
    const createCustomIcon = (city, value, unit, isSelected) => {
        const className = `map-city-tag ${isSelected ? 'highlighted' : ''}`;
        return L.divIcon({
            className: 'custom-div-icon',
            html: `<div class="${className}">
                    <span class="tag-value">${value}${unit}</span>
                    <span class="tag-separator">/</span>
                    <span class="tag-name">${city.name}</span>
                   </div>`,
            iconSize: null,
            iconAnchor: [0, 0]
        });
    };

    const getIndicatorInfo = (city) => {
        switch (indicator) {
            case 'temperature':
                return { value: city.temperature, unit: '°C', label: 'Nhiệt độ' };
            case 'precipitation':
                return { value: city.precipitation, unit: 'mm', label: 'Lượng mưa' };
            case 'humidity':
                return { value: city.humidity, unit: '%', label: 'Độ ẩm' };
            case 'wind_speed':
                return { value: city.wind_speed, unit: 'km/h', label: 'Tốc độ gió' };
            default:
                return { value: city.temperature, unit: '°C', label: 'Nhiệt độ' };
        }
    };

    // Combine fetched markers with selected location if needed
    const displayMarkers = [...markers];
    
    // Ensure selected location is displayed if we have data for it
    if (selectedLocation) {
        const isSelectedInList = displayMarkers.some(c => 
            Math.abs(c.lat - selectedLocation.lat) < 0.01 && 
            Math.abs(c.lon - selectedLocation.lon) < 0.01
        );

        if (!isSelectedInList) {
            // Add selected location as a temporary marker
            displayMarkers.push({
                name: selectedLocation.name,
                lat: selectedLocation.lat,
                lon: selectedLocation.lon,
                temperature: currentWeatherData?.temperature ?? 'N/A',
                precipitation: currentWeatherData?.precipitation ?? 0,
                humidity: currentWeatherData?.humidity ?? 0,
                wind_speed: currentWeatherData?.wind_speed ?? 0,
                weather_description: currentWeatherData?.weather_description ?? '',
                isTemporary: true
            });
        }
    }

    return (
        <LayerGroup>
            {displayMarkers.map((city, index) => {
                const info = getIndicatorInfo(city);
                const isSelected = selectedLocation && 
                    Math.abs(city.lat - selectedLocation.lat) < 0.01 && 
                    Math.abs(city.lon - selectedLocation.lon) < 0.01;

                return (
                    <Marker 
                        key={`${city.name}-${index}`} 
                        position={[city.lat, city.lon]}
                        icon={createCustomIcon(city, info.value, info.unit, isSelected)}
                    >
                        <Popup>
                            <div className="map-popup-content">
                                <strong>{city.name}</strong><br/>
                                {info.label}: {info.value}{info.unit}<br/>
                                {city.weather_description}
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </LayerGroup>
    );
};

// Component to handle programmatic navigation (flyTo)
const MapNavigator = ({ center, zoom }) => {
    const map = useMap();
    const prevCenterRef = useRef(null);

    useEffect(() => {
        if (center) {
            // Only fly if center has changed significantly
            const shouldFly = !prevCenterRef.current || 
                Math.abs(prevCenterRef.current[0] - center[0]) > 0.0001 || 
                Math.abs(prevCenterRef.current[1] - center[1]) > 0.0001;

            if (shouldFly) {
                map.flyTo(center, zoom, {
                    duration: 1.5
                });
                prevCenterRef.current = center;
            }
        }
    }, [center, zoom, map]);
    return null;
};

const WeatherMap = ({ selectedLocation, currentWeatherData }) => {
    const [indicator, setIndicator] = useState('temperature');
    const [visibleCities, setVisibleCities] = useState([]);

    // Memoize map center to prevent unnecessary re-renders and flyTo triggers
    const mapCenter = React.useMemo(() => {
        return selectedLocation ? [selectedLocation.lat, selectedLocation.lon] : [16.0471, 108.2068];
    }, [selectedLocation?.lat, selectedLocation?.lon]);

    const zoomLevel = React.useMemo(() => {
        return selectedLocation ? 10 : 5;
    }, [selectedLocation]);

    // Detect dark mode
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const checkTheme = () => {
            const isDark = document.body.classList.contains('theme-dark');
            setIsDarkMode(isDark);
        };

        // Check initially
        checkTheme();

        // Create observer to watch for class changes on body
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    return (
        <div className="weather-map-container">
            <div className="weather-map-controls">
                <label htmlFor="indicator-select">Hiển thị:</label>
                <select 
                    id="indicator-select" 
                    value={indicator} 
                    onChange={(e) => setIndicator(e.target.value)}
                >
                    <option value="temperature">Nhiệt độ (°C)</option>
                    <option value="precipitation">Lượng mưa (mm)</option>
                    <option value="humidity">Độ ẩm (%)</option>
                    <option value="wind_speed">Tốc độ gió (km/h)</option>
                </select>
            </div>

            <MapContainer 
                center={mapCenter} 
                zoom={zoomLevel} 
                scrollWheelZoom={true} 
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <ZoomControl position="bottomleft" />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url={isDarkMode 
                        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
                        : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    }
                />
                
                <MapNavigator center={mapCenter} zoom={zoomLevel} />
                
                <DynamicMarkers 
                    indicator={indicator} 
                    onCitiesUpdate={setVisibleCities}
                    selectedLocation={selectedLocation}
                    currentWeatherData={currentWeatherData}
                />
            </MapContainer>
        </div>
    );
};

export default WeatherMap;
