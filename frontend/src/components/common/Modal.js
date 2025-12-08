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
      portalContainer.className = 'custom-modal-portal';
      document.body.appendChild(portalContainer);
    }
    
    return portalContainer;
  };

  const modalContent = (
    <div 
      className={`custom-modal-overlay ${className}`}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className={`custom-modal-container custom-modal-${size}`}>
        <div className="custom-modal-header">
          {title && <h2 className="custom-modal-title">{title}</h2>}
          {showCloseButton && (
            <button 
              className="custom-modal-close"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          )}
        </div>
        <div className="custom-modal-body">
          {children}
        </div>
      </div>
    </div>
  );

  // Render modal vào portal
  return createPortal(modalContent, getPortalContainer());
};

export default Modal;
