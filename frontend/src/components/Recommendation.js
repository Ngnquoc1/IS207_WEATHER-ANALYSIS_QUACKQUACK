import React from 'react';
import './Recommendation.css';

/**
 * Recommendation Component
 * Displays smart weather-based recommendations to users
 */
const Recommendation = ({ recommendation }) => {
    if (!recommendation) {
        return (
            <div className="recommendation-card">
                <h2 className="section-title">Gợi Ý Thông Minh</h2>
                <div className="no-recommendation">
                    <p>Không có khuyến nghị đặc biệt cho thời tiết hiện tại.</p>
                </div>
            </div>
        );
    }

    // Split recommendations by double newline (each recommendation is separated)
    const recommendations = recommendation.split('\n\n').filter(item => item.trim());

    return (
        <div className="recommendation-card">
            <h2 className="section-title">Gợi Ý Thông Minh</h2>
            
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
