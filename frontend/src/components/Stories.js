import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import newsService from '../services/newsService';
import './Stories.css';

const Stories = ({ location }) => {
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [hotStories, setHotStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const [allResponse, hotResponse] = await Promise.all([
        newsService.getStories(),
        newsService.getHotStories(5)
      ]);
      
      setStories(allResponse.stories || []);
      setHotStories(hotResponse.stories || []);
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get top 5 latest stories sorted by date
  const latestStories = stories
    .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
    .slice(0, 5);

  // Stories to display: hot stories if available, otherwise latest stories
  const storiesToDisplay = hotStories.length > 0 ? hotStories : latestStories;
  const isHotSection = hotStories.length > 0;

  const getCategoryColor = (category) => {
    switch (category) {
      case 'warning': return '#dc3545'; // Red
      case 'info': return '#0dcaf0'; // Blue
      default: return '#6c757d'; // Gray
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      'warning': '⚠️ Cảnh báo',
      'info': 'ℹ️ Thông tin',
      'normal': '📰 Tin tức'
    };
    return labels[category] || category;
  };

  const getBackgroundStyle = (story) => {
    if (story.image_url) {
      return {
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${story.image_url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }
    return {
      backgroundColor: getCategoryColor(story.category)
    };
  };

  const formatPublishedDate = (dateString) => {
    if (!dateString) return 'Hôm nay';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="stories-container">
      <div className="stories-header">
        <h2>
          <span className="plus-icon">➕</span>
          Tin tức & Stories Thời tiết tại {location || 'TP.HCM'}
        </h2>
        <div className="update-time">
          Cập nhật lúc: {getCurrentTime()}
        </div>
      </div>

      {/* Stories Section */}
      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : storiesToDisplay.length === 0 ? (
        <div className="no-stories">Chưa có tin tức nào được đăng</div>
      ) : (
        <div className="hot-section">
          {/* Grid of 5 stories */}
          <div className="stories-grid">
            {storiesToDisplay.map((story) => (
              <div
                key={story.id}
                className={`story-card ${isHotSection ? 'hot-card' : ''}`}
                style={getBackgroundStyle(story)}
                onClick={() => window.open(story.url, '_blank')}
              >
                <div className="story-time">
                  {formatPublishedDate(story.published_at)}
                </div>
                <div className={`story-badge ${isHotSection ? 'hot-badge' : ''}`}>
                  {isHotSection ? '🔥 HOT' : getCategoryLabel(story.category)}
                </div>
                <div className="story-content">
                  <div className="story-title">{story.title}</div>
                </div>
              </div>
            ))}
            
            {/* View More Card */}
            <div
              className="story-card view-more-card"
              onClick={() => navigate('/stories')}
            >
              <div className="view-more-icon">➕</div>
              <div className="view-more-text">Xem Thêm Tin Tức</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stories;

