import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import newsService from '../services/newsService';
import Header from '../components/Header';
import './StoriesPage.css';

const StoriesPage = () => {
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
        newsService.getStories(1, 100), // Get up to 100 stories
        newsService.getHotStories(10)
      ]);
      
      setStories(allResponse.stories || []);
      setHotStories(hotResponse.stories || []);
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'warning': return '#dc3545';
      case 'info': return '#0dcaf0';
      default: return '#6c757d';
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

  const handleStoryClick = (story) => {
    window.open(story.url, '_blank');
  };

  return (
    <div className="stories-page">
      <Header />
      
      <main className="stories-page-content">
        <div className="stories-page-header">
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            ← Quay lại Dashboard
          </button>
          <h1>📰 Tất Cả Tin Tức & Stories</h1>
          <p>Khám phá các bài viết mới nhất về thời tiết</p>
        </div>

        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : (
          <>
            {/* Hot Stories Section */}
            {hotStories.length > 0 && (
              <div className="hot-stories-section">
                <h2 className="section-title">
                  🔥 Tin Nóng - Hot Stories
                </h2>
                <div className="stories-grid large">
                  {hotStories.map((story) => (
                    <div
                      key={story.id}
                      className="story-card large hot-card"
                      style={getBackgroundStyle(story)}
                      onClick={() => handleStoryClick(story)}
                    >
                      <div className="story-time">
                        {formatPublishedDate(story.published_at)}
                      </div>
                      <div className="story-badge hot-badge">
                        🔥 HOT
                      </div>
                      <div className="story-content">
                        <div className="story-title">{story.title}</div>
                        {story.description && (
                          <div className="story-description">{story.description}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Stories Section */}
            <div className="all-stories-section">
              <h2 className="section-title">
                📰 Tất Cả Tin Tức
              </h2>
              <div className="stories-list">
                {stories.map((story) => (
                  <div
                    key={story.id}
                    className="story-list-item"
                    onClick={() => handleStoryClick(story)}
                  >
                    {story.image_url && (
                      <img src={story.image_url} alt={story.title} className="story-thumbnail" />
                    )}
                    <div className="story-list-content">
                      <div className="story-list-header">
                        <h3 className="story-list-title">
                          {story.is_hot && '🔥 '}
                          {story.title}
                        </h3>
                        <span className={`category-badge category-${story.category}`}>
                          {getCategoryLabel(story.category)}
                        </span>
                      </div>
                      {story.description && (
                        <p className="story-list-description">{story.description}</p>
                      )}
                      <div className="story-list-footer">
                        <span className="story-list-source">{story.source}</span>
                        <span className="story-list-date">
                          📅 {formatPublishedDate(story.published_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default StoriesPage;

