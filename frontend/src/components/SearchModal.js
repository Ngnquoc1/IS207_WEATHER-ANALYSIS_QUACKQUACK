import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import LocationPicker from './LocationPicker';
import Modal from './common/Modal';
import './SearchModal.css';

const SearchModal = ({ isOpen, onClose, onLocationSelect }) => {
    const { isDark } = useTheme();
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [mapType, setMapType] = useState('standard');


    // Handle location selection and close modal
    const handleSelectLocation = () => {
        if (selectedLocation) {
            const locationData = {
                name: selectedLocation.name,
                lat: selectedLocation.latitude,
                lon: selectedLocation.longitude
            };
            
            // Call the callback function to pass location data to parent
            onLocationSelect(locationData);
            onClose();
        }
    };


    // Reset form when modal closes
    const handleClose = () => {
        setSelectedLocation(null);
        setError('');
        setLoading(false);
        setMapType('standard'); // Reset map type
        onClose();
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={handleClose}
            title="Tìm Kiếm Vị Trí"
            size="large"
            className={`search-modal ${isDark ? 'theme-dark' : 'theme-light'}`}
        >
            <div className="search-modal-content">
                <LocationPicker 
                    isDark={isDark}
                    
                    mapType={mapType}
                    // Pass SearchModal's state và handlers
                    selectedLocation={selectedLocation}
                    setSelectedLocation={setSelectedLocation}
                    loading={loading}
                    setLoading={setLoading}
                    error={error}
                    setError={setError}
                    onSelectLocation={handleSelectLocation}
                />
            </div>
        </Modal>
    );
};

export default SearchModal;
