import React, { useState, useEffect } from 'react';
import newsService from '../services/newsService';
import './Stories.css';

const Stories = ({ location }) => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const response = await newsService.getStories();
      setStories(response.stories || []);
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setLoading(false);
    }
  };

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

      <div className="stories-grid">
        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : stories.length === 0 ? (
          <div className="no-stories">Chưa có tin tức nào được đăng</div>
        ) : (
          <>
            {stories.slice(0, 3).map((story) => (
              <div
                key={story.id}
                className="story-card"
                style={getBackgroundStyle(story)}
                onClick={() => window.open(story.url, '_blank')}
              >
                {/* Thời gian đăng bài ở góc trên bên phải */}
                <div className="story-time">
                  {formatPublishedDate(story.published_at)}
                </div>
                
                {/* Badge category ở góc trên bên trái */}
                <div className="story-badge">{getCategoryLabel(story.category)}</div>
                
                {/* Title ở phía dưới */}
                <div className="story-content">
                  <div className="story-title">{story.title}</div>
                </div>
              </div>
            ))}
            
            <div
              className="story-card view-more-card"
              onClick={() => setIsModalOpen(true)}
            >
              <div className="view-more-icon">➕</div>
              <div className="view-more-text">Xem Thêm Tin Tức</div>
            </div>
          </>
        )}
      </div>

      {/* Modal for all stories */}
      {isModalOpen && (
        <div className="stories-modal" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Tất cả tin tức</h3>
              <button onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <div className="modal-stories">
              {stories.map((story) => (
                <div
                  key={story.id}
                  className="modal-story-item"
                  onClick={() => window.open(story.url, '_blank')}
                >
                  {story.image_url && (
                    <img src={story.image_url} alt={story.title} />
                  )}
                  <div className="modal-story-info">
                    <h4>{story.title}</h4>
                    <p>{story.description}</p>
                    <span className="story-source">{story.source}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stories;

