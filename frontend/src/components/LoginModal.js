import React, { useState } from 'react';
import Modal from './common/Modal';
import authService from '../services/authService';
import './LoginModal.css';

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (activeTab === 'login') {
        const response = await authService.login(username, password);
        
        if (onLoginSuccess) {
          onLoginSuccess(response.user);
        }
        
        onClose();
        
        if (response.user.role === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.reload();
        }
      } else {
        if (password !== confirmPassword) {
          setError('Mật khẩu xác nhận không khớp');
          setLoading(false);
          return;
        }
      
        const response = await authService.register({
          name,
          username,
          email,
          password,
          password_confirmation: confirmPassword,
        });
        
        if (onLoginSuccess) {
          onLoginSuccess(response.user);
        }
        
        onClose();
        
        if (response.user.role === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.reload();
        }
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setEmail('');
    setName('');
    setError('');
    setActiveTab('login');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={activeTab === 'login' ? 'Weather Dashboard Login' : 'Đăng ký tài khoản'}
      size="small"
    >
      <div className="login-tabs">
        <button
          type="button"
          className={activeTab === 'login' ? 'active' : ''}
          onClick={() => setActiveTab('login')}
        >
          Đăng nhập
        </button>
        <button
          type="button"
          className={activeTab === 'register' ? 'active' : ''}
          onClick={() => setActiveTab('register')}
        >
          Đăng ký
        </button>
      </div>

      <form onSubmit={handleSubmit} className="login-modal-form">
        {error && <div className="error-message">{error}</div>}
        {activeTab === 'register' && (
          <div className="form-group">
            <label>Họ và tên (tuỳ chọn)</label>
            <input
              type="text"
              placeholder="Nhập họ và tên"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}

        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            placeholder="Nhập username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />
        </div>

        {activeTab === 'register' && (
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        )}

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Nhập password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {activeTab === 'register' && (
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Nhập lại password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        )}

        <button type="submit" disabled={loading} className="login-submit-button">
          {loading ? (activeTab === 'login' ? 'Logging in...' : 'Signing up...') : (activeTab === 'login' ? 'Login' : 'Register')}
        </button>

        {activeTab === 'login' && (
          <div className="login-hint">
            <p>Admin: username=admin, password=123456</p>
            <p>Customer: username=customer, password=123</p>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default LoginModal;

