import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import authService from '../services/authService';
import LoginModal from './LoginModal';
import './Header.css';

/**
 * Header Component
 **/
const Header = () => {
    const { toggleTheme, isDark } = useTheme();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // Load current user info and listen for changes
    useEffect(() => {
        const loadUser = () => {
            const user = authService.getUser();
            setCurrentUser(user);
        };
        
        loadUser();
        
        // Listen for storage changes (when user logs in/out in another tab)
        const handleStorageChange = () => {
            loadUser();
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // Handle logout
    const handleLogout = async () => {
        if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            await authService.logout();
            window.location.href = '/dashboard';
        }
    };

    // Handle login success
    const handleLoginSuccess = (user) => {
        setCurrentUser(user);
        setIsLoginModalOpen(false);
    };

    return (
        <header className="header">
            <div className="header-container">
                {/* Title */}
                <div className="header-title">
                    <h1>Weather Analysis Dashboard</h1>
                </div>

                {/* Right side controls */}
                <div className="header-controls">
                    {currentUser && (
                        <div className="user-info-container">
                            <span className="user-name">
                                {currentUser.name}
                            </span>
                            <span className="user-role">
                                ({currentUser.role})
                            </span>
                        </div>
                    )}

                    {/* Theme Toggle */}
                    <button 
                        className="theme-toggle"
                        onClick={toggleTheme}
                        title={`Chuyển sang ${isDark ? 'sáng' : 'tối'}`}
                    >
                        {isDark ? '☀️' : '🌙'}
                    </button>

                    {currentUser ? (
                        <button 
                            className="logout-button"
                            onClick={handleLogout}
                            title="Đăng xuất"
                        >
                            Đăng xuất
                        </button>
                    ) : (
                        <button 
                            className="login-button"
                            onClick={() => setIsLoginModalOpen(true)}
                            title="Đăng nhập"
                        >
                            Đăng nhập
                        </button>
                    )}

                    {/* Language Selector */}
                    <button className="language-selector">
                        VI
                    </button>
                </div>
            </div>

            {/* Login Modal */}
            <LoginModal 
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onLoginSuccess={handleLoginSuccess}
            />
        </header>
    );
};

export default Header;
