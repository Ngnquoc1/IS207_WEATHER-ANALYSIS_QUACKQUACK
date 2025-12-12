import React from 'react';

const LocationInfo = ({ data, className = '' }) => {
    if (!data) return null;

    return (
        <div className={`location-info-card ${className}`}>
            <h3>Thông tin chi tiết</h3>
            <div className="info-row">
                <span className="label">Vĩ độ:</span>
                <span className="value">{data.location?.latitude}°</span>
            </div>
            <div className="info-row">
                <span className="label">Kinh độ:</span>
                <span className="value">{data.location?.longitude}°</span>
            </div>
            <div className="info-row">
                <span className="label">Múi giờ:</span>
                <span className="value">{data.location?.timezone}</span>
            </div>
        </div>
    );
};

export default LocationInfo;
