import React, { useState, useEffect } from 'react';
import { fetchRecommendations } from '../services/affiliateService';
import './ProductRecommendations.css';

const ProductRecommendations = ({ weatherData }) => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadRecommendations = async () => {
            console.log('ProductRecommendations weatherData:', weatherData);
            console.log('current_weather:', weatherData?.current_weather);
            
            if (!weatherData?.current_weather) {
                console.log('No current_weather data, skipping recommendations');
                setLoading(false);
                return;
            }

            const weatherMain = weatherData.current_weather.weather_main;
            const temperature = weatherData.current_weather.temperature;
            
            console.log('Extracted values:', { weatherMain, temperature });
            
            if (!weatherMain) {
                console.error('weather_main is missing!');
                setLoading(false);
                setError('Thiếu thông tin thời tiết');
                return;
            }

            try {
                setLoading(true);
                setError(null);
                
                const data = await fetchRecommendations(
                    weatherMain,
                    Math.round(temperature),
                    5
                );
                
                setRecommendations(data.recommendations || []);
            } catch (err) {
                console.error('Failed to load recommendations:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadRecommendations();
    }, [weatherData]);

    if (loading) {
        return (
            <div className="product-recommendations">
                <div className="loading">Đang tải gợi ý sản phẩm...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="product-recommendations">
                <div className="error">Không thể tải gợi ý sản phẩm</div>
            </div>
        );
    }

    if (!recommendations.length) {
        return null;
    }

    return (
        <div className="product-recommendations">
            <div className="recommendations-header">
                <h3>Sản phẩm gợi ý dựa trên thời tiết</h3>
                <p className="recommendations-subtitle">
                    Phù hợp với thời tiết {weatherData.current_weather.weather_main} và nhiệt độ {Math.round(weatherData.current_weather.temperature)}°C
                </p>
            </div>
            
            <div className="product-grid">
                {recommendations.map((product) => (
                    <div key={product.id} className="product-card">
                        <div className="product-image">
                            <img 
                                src={product.image_url} 
                                alt={product.name}
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                                }}
                            />
                        </div>
                        
                        <div className="product-info">
                            <h4 className="product-name">{product.name}</h4>
                            <p className="product-description">{product.description}</p>
                            
                            <div className="product-meta">
                                <div className="weather-tags">
                                    {product.weather_tags.map((tag, index) => (
                                        <span key={index} className="weather-tag">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                
                                {product.temp_range.min !== null && product.temp_range.max !== null && (
                                    <div className="temp-range">
                                        <span>{product.temp_range.min}°C - {product.temp_range.max}°C</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <a 
                            href={product.affiliate_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="buy-button"
                        >
                            Mua ngay
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductRecommendations;
