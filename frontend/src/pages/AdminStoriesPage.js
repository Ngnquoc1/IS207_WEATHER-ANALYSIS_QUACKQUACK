import React from 'react';
import StoryManagement from '../components/StoryManagement';
import './AdminStoriesPage.css';

const AdminStoriesPage = () => {
  return (
    <div className="admin-stories-page">
      <div className="page-header">
        <h2>📰 Stories Management</h2>
        <p>Quản lý và đăng bài viết tin tức thời tiết</p>
      </div>
      <StoryManagement />
    </div>
  );
};

export default AdminStoriesPage;

