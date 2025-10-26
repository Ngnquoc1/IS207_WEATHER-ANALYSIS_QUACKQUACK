import React, { useState, useEffect } from 'react';
import newsService from '../services/newsService';
import './StoryManagement.css';

const StoryManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [articles, setArticles] = useState([]);
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [currentStories, setCurrentStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStories, setLoadingStories] = useState(false);
  const [message, setMessage] = useState('');

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setMessage('Vui lòng nhập từ khóa tìm kiếm');
      return;
    }
    
    setLoading(true);
    setMessage('');
    try {
      const response = await newsService.searchNews(searchTerm);
      setArticles(response.articles || []);
      if (response.articles && response.articles.length === 0) {
        setMessage('Không tìm thấy bài viết nào');
      }
    } catch (error) {
      setMessage('Lỗi khi tìm kiếm tin tức');
      console.error('Error searching news:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle select article
  const toggleSelectArticle = (article) => {
    const isSelected = selectedArticles.some(a => a.url === article.url);
    
    if (isSelected) {
      // Remove from selected
      setSelectedArticles(selectedArticles.filter(a => a.url !== article.url));
    } else {
      // Add to selected with default category
      setSelectedArticles([...selectedArticles, {
        ...article,
        category: 'normal'
      }]);
    }
  };

  // Update category for selected article
  const updateCategory = (url, category) => {
    setSelectedArticles(selectedArticles.map(article => 
      article.url === url ? { ...article, category } : article
    ));
  };

  // Remove from selected
  const removeSelected = (url) => {
    setSelectedArticles(selectedArticles.filter(a => a.url !== url));
  };

  // Save all selected articles
  const handleSaveAll = async () => {
    if (selectedArticles.length === 0) {
      setMessage('Chưa có bài viết nào được chọn');
      return;
    }

    setLoading(true);
    try {
      // Save all articles
      const promises = selectedArticles.map(article => 
        newsService.createStory({
          title: article.title,
          description: article.description,
          url: article.url,
          image_url: article.urlToImage,
          author: article.author,
          source: article.source?.name,
          published_at: article.publishedAt,
          category: article.category,
          location: 'TP.HCM'
        })
      );

      await Promise.all(promises);
      
      setMessage(`Đã lưu ${selectedArticles.length} bài viết thành công!`);
      setSelectedArticles([]); // Clear selected
      loadCurrentStories(); // Reload current stories
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Lỗi khi lưu bài viết');
      console.error('Error saving stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const isArticleSelected = (url) => {
    return selectedArticles.some(a => a.url === url);
  };

  // Load current stories on mount
  useEffect(() => {
    loadCurrentStories();
  }, []);

  // Load current stories from database
  const loadCurrentStories = async () => {
    setLoadingStories(true);
    try {
      const response = await newsService.getStories();
      setCurrentStories(response.stories || []);
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setLoadingStories(false);
    }
  };

  // Delete story
  const handleDeleteStory = async (storyId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      return;
    }

    try {
      await newsService.deleteStory(storyId);
      setMessage('Đã xóa bài viết thành công!');
      loadCurrentStories(); // Reload danh sách
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Lỗi khi xóa bài viết');
      console.error('Error deleting story:', error);
    }
  };

  // Helper functions
  const getCategoryLabel = (category) => {
    const labels = {
      'warning': '⚠️ Cảnh báo',
      'info': 'ℹ️ Thông tin',
      'normal': '📰 Tin tức'
    };
    return labels[category] || category;
  };

  const formatPublishedDate = (dateString) => {
    if (!dateString) return 'Chưa có ngày';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="story-management">
      {/* Current Stories Section */}
      <div className="current-stories-section">
        <h2>📋 Bài viết hiện tại đang hiển thị</h2>
        {loadingStories ? (
          <div className="loading">Đang tải...</div>
        ) : currentStories.length === 0 ? (
          <div className="no-stories">Chưa có bài viết nào</div>
        ) : (
          <div className="current-stories-list">
            {currentStories.map((story) => (
              <div key={story.id} className="current-story-item">
                <div className="current-story-content">
                  {story.image_url && (
                    <img src={story.image_url} alt={story.title} />
                  )}
                  <div className="current-story-info">
                    <h4>{story.title}</h4>
                    <p>{story.description}</p>
                    <div className="current-story-meta">
                      <span className={`category-badge category-${story.category}`}>
                        {getCategoryLabel(story.category)}
                      </span>
                      <span className="story-date">
                        📅 {formatPublishedDate(story.published_at)}
                      </span>
                      <span className="story-source">{story.source}</span>
                    </div>
                  </div>
                </div>
                <button
                  className="delete-story-button"
                  onClick={() => handleDeleteStory(story.id)}
                >
                  🗑️ Xóa
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="section-divider"></div>

      {/* Search Section */}
      <div className="search-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Nhập từ khóa tìm kiếm tin tức..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} disabled={loading}>
            {loading ? 'Đang tìm...' : 'Tìm kiếm'}
          </button>
        </div>
        {message && (
          <div className={`message ${message.includes('thành công') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </div>

      {/* Search Results */}
      {articles.length > 0 && (
        <div className="search-results-section">
          <h3>Kết quả tìm kiếm ({articles.length})</h3>
          <div className="articles-list">
            {articles.map((article, index) => {
              const isSelected = isArticleSelected(article.url);
              return (
                <div 
                  key={index} 
                  className={`article-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleSelectArticle(article)}
                >
                  {article.urlToImage && (
                    <img src={article.urlToImage} alt={article.title} />
                  )}
                  <div className="article-info">
                    <h4>{article.title}</h4>
                    <p>{article.description}</p>
                    <div className="article-footer">
                      <span className="article-source">{article.source?.name}</span>
                      <span className="article-date">
                        {new Date(article.publishedAt).toLocaleDateString('vi-VN')}
                      </span>
                      {isSelected && (
                        <span className="selected-badge">✓ Đã chọn</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Articles Section */}
      {selectedArticles.length > 0 && (
        <div className="selected-section">
          <h3>Bài viết đã chọn ({selectedArticles.length})</h3>
          <div className="selected-list">
            {selectedArticles.map((article, index) => (
              <div key={index} className="selected-item">
                <div className="selected-item-info">
                  <h4>{article.title}</h4>
                  <p>{article.source?.name}</p>
                </div>
                <div className="selected-item-controls">
                  <select
                    value={article.category}
                    onChange={(e) => updateCategory(article.url, e.target.value)}
                    className="category-select"
                  >
                    <option value="normal">📰 Tin tức</option>
                    <option value="info">ℹ️ Thông tin</option>
                    <option value="warning">⚠️ Cảnh báo</option>
                  </select>
                  <button
                    className="remove-button"
                    onClick={() => removeSelected(article.url)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="save-section">
            <button 
              className="save-all-button"
              onClick={handleSaveAll}
              disabled={loading}
            >
              {loading ? 'Đang lưu...' : `Lưu ${selectedArticles.length} bài viết`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryManagement;

