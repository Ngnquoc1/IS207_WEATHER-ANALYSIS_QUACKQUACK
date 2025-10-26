import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPrompt.css';

const LoginPrompt = () => {
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate('/login');
    };

    return (
        <div className="login-prompt">
            <div className="login-prompt-icon">🔒</div>
            <h3>Đăng nhập để xem nhiều thông tin hơn</h3>
            <p>
                Bạn đang xem phiên bản giới hạn với thông tin thời tiết hiện tại.
                Đăng nhập để truy cập đầy đủ các tính năng:
            </p>
            <ul className="prompt-features">
                <li>📊 Dự báo thời tiết theo giờ</li>
                <li>📈 Phân tích bất thường</li>
                <li>💡 Khuyến nghị thông minh</li>
                <li>🗺️ So sánh địa điểm</li>
                <li>📰 Tin tức và câu chuyện</li>
            </ul>
            <button onClick={handleLogin} className="prompt-login-button">
                Đăng nhập ngay
            </button>
        </div>
    );
};

export default LoginPrompt;

