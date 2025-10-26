import React, { useState, useEffect } from 'react';
import newsService from '../services/newsService';
import Pagination from './Pagination';
import './StoryManagement.css';

const StoryManagement = () => {
  // View state: 'list' or 'create'
  const [currentView, setCurrentView] = useState('list');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [articles, setArticles] = useState([]);
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [currentStories, setCurrentStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStories, setLoadingStories] = useState(false);
  const [message, setMessage] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
    from: 0,
    to: 0
  });

  // Statistics state
  const [statistics, setStatistics] = useState({
    total: 0,
    hot_count: 0,
    by_category: {
      warning: 0,
      info: 0,
      normal: 0
    }
  });

  // Hot stories state
  const [hotStories, setHotStories] = useState([]);

  // Existing URLs state
  const [existingUrls, setExistingUrls] = useState([]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setMessage('Vui lòng nhập từ khóa tìm kiếm');
      return;
    }
    
    setLoading(true);
    setMessage('');
    try {
      const response = await newsService.searchNews(searchTerm);
      const articles = response.articles || [];
      
      // Check which articles already exist
      if (articles.length > 0) {
        const urls = articles.map(a => a.url);
        const checkResponse = await newsService.checkStoriesExist(urls);
        setExistingUrls(checkResponse.existing_urls || []);
      }
      
      setArticles(articles);
      if (articles.length === 0) {
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
    // Don't allow selection if article already exists
    if (isArticleExists(article.url)) {
      setMessage('Bài viết này đã được thêm vào hệ thống!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
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
      setArticles([]); // Clear search results
      setSearchTerm(''); // Clear search term
      loadCurrentStories(); // Reload current stories
      loadStatistics(); // Reload statistics
      
      setTimeout(() => {
        setMessage('');
        setCurrentView('list'); // Navigate back to list view
      }, 2000);
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

  const isArticleExists = (url) => {
    return existingUrls.includes(url);
  };

  // Load current stories on mount
  useEffect(() => {
    loadCurrentStories(1);
    loadStatistics();
    loadHotStories();
  }, []);

  // Load statistics
  const loadStatistics = async () => {
    try {
      const response = await newsService.getStoryStatistics();
      if (response.statistics) {
        setStatistics(response.statistics);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  // Load current stories from database with pagination
  const loadCurrentStories = async (page = 1) => {
    setLoadingStories(true);
    try {
      const response = await newsService.getStories(page, 10);
      setCurrentStories(response.stories || []);
      if (response.pagination) {
        setPagination(response.pagination);
      }
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
      loadCurrentStories(currentPage); // Reload current page
      loadStatistics(); // Reload statistics
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Lỗi khi xóa bài viết');
      console.error('Error deleting story:', error);
    }
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadCurrentStories(page);
  };

  // Load hot stories
  const loadHotStories = async () => {
    try {
      const response = await newsService.getHotStories(5);
      setHotStories(response.stories || []);
    } catch (error) {
      console.error('Error loading hot stories:', error);
    }
  };

  // Toggle hot status
  const toggleHotStatus = async (storyId) => {
    try {
      const story = currentStories.find(s => s.id === storyId);
      const newValue = !story.is_hot;
      
      await newsService.updateStoryStatus(storyId, { is_hot: newValue });
      
      loadCurrentStories(currentPage);
      loadStatistics();
      loadHotStories();
      
      setMessage(newValue ? 'Đã đánh dấu Hot!' : 'Đã bỏ đánh dấu Hot!');
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      setMessage('Lỗi khi cập nhật trạng thái');
      console.error('Error:', error);
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

  // Render Statistics Section
  const renderStatistics = () => (
    <div className="statistics-section">
      <h3>📊 Thống kê</h3>
      <div className="statistics-grid">
        <div className="stat-card stat-total">
          <div className="stat-icon">📰</div>
          <div className="stat-content">
            <div className="stat-value">{statistics.total}</div>
            <div className="stat-label">Tổng số bài viết</div>
          </div>
        </div>
        
        <div className="stat-card stat-hot">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <div className="stat-value">{statistics.hot_count}</div>
            <div className="stat-label">Bài viết Hot</div>
          </div>
        </div>
        
        <div className="stat-card stat-warning">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <div className="stat-value">{statistics.by_category.warning}</div>
            <div className="stat-label">Cảnh báo</div>
          </div>
        </div>
        
        <div className="stat-card stat-info">
          <div className="stat-icon">ℹ️</div>
          <div className="stat-content">
            <div className="stat-value">{statistics.by_category.info}</div>
            <div className="stat-label">Thông tin</div>
          </div>
        </div>
        
        <div className="stat-card stat-normal">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <div className="stat-value">{statistics.by_category.normal}</div>
            <div className="stat-label">Tin tức</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Hot Stories Section
  const renderHotStoriesSection = () => (
    <div className="hot-stories-section">
      <h3>🔥 Bài viết Hot</h3>
      {hotStories.length === 0 ? (
        <div className="no-hot-stories">
          <p>Chưa có bài viết Hot nào</p>
        </div>
      ) : (
        <div className="hot-stories-list">
          {hotStories.map((story) => (
            <div key={story.id} className="hot-story-item">
              <div className="hot-story-content">
                {story.image_url && (
                  <img src={story.image_url} alt={story.title} />
                )}
                <div className="hot-story-info">
                  <h4>{story.title}</h4>
                  <p>{story.description}</p>
                  <div className="hot-story-meta">
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
              <div className="story-controls">
                <button
                  className="hot-toggle active"
                  onClick={() => toggleHotStatus(story.id)}
                  title="Bỏ đánh dấu Hot"
                >
                  🔥 Hot
                </button>
                <button
                  className="delete-story-button"
                  onClick={() => handleDeleteStory(story.id)}
                >
                  🗑️ Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Render List View
  const renderListView = () => (
    <div className="story-list-view">
      {/* Header with Create Button */}
      <div className="view-header">
        <h2>📋 Danh sách bài viết</h2>
        <button 
          className="create-story-button"
          onClick={() => setCurrentView('create')}
        >
          ➕ Tạo bài viết mới
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`message ${message.includes('thành công') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {/* Statistics Section */}
      {renderStatistics()}

      {/* Hot Stories Section */}
      {renderHotStoriesSection()}

      {/* Current Stories List */}
      {loadingStories ? (
        <div className="loading">Đang tải...</div>
      ) : currentStories.length === 0 ? (
        <div className="no-stories">
          <p>Chưa có bài viết nào</p>
          <button 
            className="create-story-button-alt"
            onClick={() => setCurrentView('create')}
          >
            ➕ Tạo bài viết đầu tiên
          </button>
        </div>
      ) : (
        <>
          <h3 style={{ marginTop: '30px', marginBottom: '20px', color: '#333' }}>📰 Tất cả bài viết</h3>
          <div className="current-stories-list">
            {currentStories.filter(story => !story.is_hot).map((story) => (
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
                <div className="story-controls">
                  <button
                    className={`hot-toggle ${story.is_hot ? 'active' : ''}`}
                    onClick={() => toggleHotStatus(story.id)}
                    title={story.is_hot ? 'Bỏ đánh dấu Hot' : 'Đánh dấu Hot'}
                  >
                    🔥 {story.is_hot ? 'Hot' : 'Mark Hot'}
                  </button>
                  <button
                    className="delete-story-button"
                    onClick={() => handleDeleteStory(story.id)}
                  >
                    🗑️ Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Component */}
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.last_page}
            totalItems={pagination.total}
            itemsPerPage={pagination.per_page}
            onPageChange={handlePageChange}
            itemName="bài viết"
          />
        </>
      )}
    </div>
  );

  // Render Create View
  const renderCreateView = () => (
    <div className="story-create-view">
      {/* Header with Back Button */}
      <div className="view-header">
        <button 
          className="back-button"
          onClick={() => {
            setCurrentView('list');
            setArticles([]);
            setSelectedArticles([]);
            setSearchTerm('');
            setMessage('');
          }}
        >
          ← Quay lại danh sách
        </button>
        <h2>➕ Tạo bài viết mới</h2>
      </div>

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
            {loading ? 'Đang tìm...' : '🔍 Tìm kiếm'}
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
              const isExists = isArticleExists(article.url);
              return (
                <div 
                  key={index} 
                  className={`article-card ${isSelected ? 'selected' : ''} ${isExists ? 'exists' : ''}`}
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
                      {isExists && (
                        <span className="exists-badge">✓ Đã thêm</span>
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
              {loading ? 'Đang lưu...' : `💾 Lưu ${selectedArticles.length} bài viết`}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="story-management">
      {currentView === 'list' ? renderListView() : renderCreateView()}
    </div>
  );
};

export default StoryManagement;

