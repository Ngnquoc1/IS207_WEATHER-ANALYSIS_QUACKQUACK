import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import AdminSidebar from '../components/AdminSidebar';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const currentUser = authService.getUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      await authService.logout();
      navigate('/dashboard');
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="admin-layout">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-main">
        <header className="admin-header">
          <div className="admin-header-content">
            <div className="admin-header-left">
              <button className="mobile-menu-btn" onClick={toggleSidebar}>
                ☰
              </button>
              <h1>Admin Dashboard</h1>
            </div>
            <div className="admin-header-right">
              <span className="user-info">
                Welcome, <strong>{currentUser?.name}</strong> ({currentUser?.role})
              </span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          </div>
        </header>
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

