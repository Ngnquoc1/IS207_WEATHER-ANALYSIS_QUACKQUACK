import React from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = '',
  size = 'medium', // small, medium, large
  portalId = 'modal-portal' // ID của portal container
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // Tìm portal container hoặc tạo mới
  const getPortalContainer = () => {
    let portalContainer = document.getElementById(portalId);
    
    if (!portalContainer) {
      // Tạo portal container nếu chưa tồn tại
      portalContainer = document.createElement('div');
      portalContainer.id = portalId;
      portalContainer.className = 'modal-portal-container';
      document.body.appendChild(portalContainer);
    }
    
    return portalContainer;
  };

  const modalContent = (
    <div 
      className={`modal-overlay ${className}`}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className={`modal-container modal-${size}`}>
        <div className="modal-header">
          {title && <h2 className="modal-title">{title}</h2>}
          {showCloseButton && (
            <button 
              className="modal-close-button"
              onClick={onClose}
              aria-label="Close modal"
            >
              ×
            </button>
          )}
        </div>
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );

  // Render modal vào portal
  return createPortal(modalContent, getPortalContainer());
};

export default Modal;
