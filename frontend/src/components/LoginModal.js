import React, { useState } from 'react';
import Modal from './common/Modal';
import authService from '../services/authService';
import './LoginModal.css';

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await authService.login(username, password);
      
      // Call success callback
      if (onLoginSuccess) {
        onLoginSuccess(response.user);
      }
      
      // Close modal
      onClose();
      
      // Redirect based on role
      if (response.user.role === 'admin') {
        window.location.href = '/admin';
      } else {
        // Stay on dashboard, just refresh
        window.location.reload();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setUsername('');
    setPassword('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Weather Dashboard Login"
      size="small"
    >
      <form onSubmit={handleSubmit} className="login-modal-form">
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading} className="login-submit-button">
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <div className="login-hint">
          <p>Admin: username=admin, password=123456</p>
          <p>Customer: username=customer, password=123</p>
        </div>
      </form>
    </Modal>
  );
};

export default LoginModal;

