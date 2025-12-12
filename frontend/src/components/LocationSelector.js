import React, { useState } from 'react';
import SearchModal from './SearchModal';
import './LocationSelector.css';

const LocationSelector = ({ onLocationSelect, currentLocation }) => {
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

    // Quick location presets
    const quickLocations = [
        { name: 'Dĩ An', lat: 10.98, lon: 106.75 },
        { name: 'Hồ Chí Minh', lat: 10.82, lon: 106.63 },
        { name: 'Hà Nội', lat: 21.03, lon: 105.85 },
        { name: 'Đà Nẵng', lat: 16.07, lon: 108.22 },
        { name: 'Nha Trang', lat: 12.24, lon: 109.19 },
        { name: 'Đà Lạt', lat: 11.94, lon: 108.44 }
    ];

    const handleCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        name: 'Vị trí hiện tại',
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    };
                    onLocationSelect(location);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    alert('Không thể lấy vị trí hiện tại');
                }
            );
        } else {
            alert('Trình duyệt không hỗ trợ định vị');
        }
    };

    return (
        <div className="location-selector-panel">
            <div className="selector-header">
                <h3>Chọn Vị Trí</h3>
            </div>

            <div className="selector-actions">
                <button 
                    className="action-button primary"
                    onClick={() => setIsSearchModalOpen(true)}
                >
                    Tìm kiếm địa điểm
                </button>
                
                <button 
                    className="action-button secondary"
                    onClick={handleCurrentLocation}
                >
                    Vị trí hiện tại
                </button>
            </div>

            <div className="quick-locations">
                <h4>Địa điểm phổ biến</h4>
                <div className="location-chips">
                    {quickLocations.map((loc, index) => (
                        <button
                            key={index}
                            className={`location-chip ${currentLocation?.name === loc.name ? 'active' : ''}`}
                            onClick={() => onLocationSelect(loc)}
                        >
                            {loc.name}
                        </button>
                    ))}
                </div>
            </div>

            <SearchModal 
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                onLocationSelect={(loc) => {
                    onLocationSelect(loc);
                    setIsSearchModalOpen(false);
                }}
            />
        </div>
    );
};

export default LocationSelector;
