import React from 'react';
import './AnomalyDisplay.css';

/**
 * AnomalyDisplay Component
 * Displays temperature anomaly alerts when detected
 */
const AnomalyDisplay = ({ anomalyData }) => {
    // Only display if there's an anomaly
    if (!anomalyData || !anomalyData.is_anomaly) {
        return null;
    }

    // Get alert style based on anomaly type
    const getAlertClass = (type) => {
        return type === 'hot' ? 'anomaly-alert hot' : 'anomaly-alert cold';
    };

    return (
        <div className={getAlertClass(anomalyData.type)}>
            <div className="anomaly-icon">
                {anomalyData.type === 'hot' ? '🔥' : '❄️'}
            </div>
            
            <div className="anomaly-content">
                <h3 className="anomaly-title">Phát Hiện Bất Thường Nhiệt Độ</h3>
                <p className="anomaly-message">{anomalyData.message}</p>
                
                <div className="anomaly-stats">
                    <div className="stat-item">
                        <span className="stat-label">Nhiệt độ hiện tại:</span>
                        <span className="stat-value">{anomalyData.current_temp}°C</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Trung bình 30 ngày:</span>
                        <span className="stat-value">{anomalyData.average_temp}°C</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Chênh lệch:</span>
                        <span className="stat-value highlight">±{anomalyData.difference}°C</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnomalyDisplay;
