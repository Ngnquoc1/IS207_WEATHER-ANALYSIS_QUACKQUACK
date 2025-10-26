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
        newsService.getHotStories(5) // Get top 5 hot stories
      ]);
      
      setStories(allResponse.stories || []);
      setHotStories(hotResponse.stories || []);
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get IDs of hot stories to filter them out from latest news
  const hotStoryIds = hotStories.map(story => story.id);
  
  // Get latest 5 stories excluding hot stories, sorted by date
  const latestStories = stories
    .filter(story => !hotStoryIds.includes(story.id))
    .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
    .slice(0, 5);

  // All stories sorted by date (including hot ones)
  const allStoriesSorted = stories.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

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
          <h1>Tất Cả Tin Tức & Bài Viết</h1>
          <p>Khám phá những thông tin nổi bật và cập nhật mới nhất.</p>
        </div>

        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : (
          <>
            {/* Hot Stories Section - Show top 5 hot stories */}
            {hotStories.length > 0 && (
              <div className="hot-stories-section">
                <div className="hot-section-header">
                  <h2 className="section-title">
                    <span className="flame-icon">🔥</span>
                    Tin Nóng - Hot Stories
                  </h2>
                  <div className="red-divider"></div>
                  <a href="#all-stories" className="view-all-link">
                    Xem tất cả →
                  </a>
                </div>
                
                {/* Grid of 5 hot stories */}
                <div className="hot-stories-grid">
                  {hotStories.map((story) => (
                    <div
                      key={story.id}
                      className="story-card hot-story-card"
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
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Latest News Section - Show top 5 latest (excluding hot) */}
            {latestStories.length > 0 && (
              <div className="latest-news-section">
                <div className="latest-news-header">
                  <h2 className="section-title">
                    Tin Tức Mới Nhất
                  </h2>
                  <div className="gray-divider"></div>
                  <button className="discover-more-link">
                    Khám phá thêm →
                  </button>
                </div>
                
                <div className="news-grid">
                  {latestStories.map((story) => (
                    <div
                      key={story.id}
                      className="news-item"
                      onClick={() => handleStoryClick(story)}
                    >
                      <div className="news-thumbnail">
                        {story.image_url ? (
                          <img src={story.image_url} alt={story.title} />
                        ) : (
                          <div className="thumbnail-placeholder">Thumb</div>
                        )}
                      </div>
                      <div className="news-content">
                        <h3 className="news-title">{story.title}</h3>
                        <div className="news-meta">
                          <span className="news-category">{getCategoryLabel(story.category)}</span>
                          <span className="dot-separator">•</span>
                          <span className="news-date">
                            🕐 {formatPublishedDate(story.published_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Stories Section - Show all stories including hot */}
            <div className="all-stories-section" id="all-stories">
              <div className="latest-news-header">
                <h2 className="section-title">
                  Tất Cả Tin Tức
                </h2>
                <div className="gray-divider"></div>
              </div>
              
              <div className="news-grid">
                {allStoriesSorted.map((story) => (
                  <div
                    key={story.id}
                    className="news-item"
                    onClick={() => handleStoryClick(story)}
                  >
                    <div className="news-thumbnail">
                      {story.image_url ? (
                        <img src={story.image_url} alt={story.title} />
                      ) : (
                        <div className="thumbnail-placeholder">Thumb</div>
                      )}
                    </div>
                    <div className="news-content">
                      <h3 className="news-title">
                        {story.is_hot && '🔥 '}
                        {story.title}
                      </h3>
                      <div className="news-meta">
                        <span className="news-category">{getCategoryLabel(story.category)}</span>
                        <span className="dot-separator">•</span>
                        <span className="news-date">
                          🕐 {formatPublishedDate(story.published_at)}
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

