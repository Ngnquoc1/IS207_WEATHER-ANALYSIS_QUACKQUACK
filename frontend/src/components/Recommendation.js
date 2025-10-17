import React from 'react';
import './Recommendation.css';

/**
 * Recommendation Component
 * Displays smart weather-based recommendations to users
 */
const Recommendation = ({ recommendation }) => {
    if (!recommendation) {
        return null;
    }

    // Split recommendations by double newline (each recommendation is separated)
    const recommendations = recommendation.split('\n\n').filter(item => item.trim());

    return (
        <div className="recommendation-card">
            <h2>💡 Khuyến Nghị</h2>
            
            <div className="recommendation-content">
                {recommendations.map((item, index) => (
                    <div key={index} className="recommendation-item">
                        {item}
                    </div>
                ))}
            </div>

            <div className="recommendation-footer">
                <small>Dựa trên điều kiện thời tiết hiện tại và dự báo</small>
            </div>
        </div>
    );
};

export default Recommendation;
