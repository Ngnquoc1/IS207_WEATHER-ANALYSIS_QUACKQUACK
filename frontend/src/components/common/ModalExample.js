import React, { useState } from 'react';
import { Modal } from '../common';

const ModalExample = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSize, setModalSize] = useState('medium');

  const openModal = (size = 'medium') => {
    setModalSize(size);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Modal Component Examples (Portal Version)</h2>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => openModal('small')}>
          Open Small Modal
        </button>
        <button onClick={() => openModal('medium')}>
          Open Medium Modal
        </button>
        <button onClick={() => openModal('large')}>
          Open Large Modal
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={`${modalSize.charAt(0).toUpperCase() + modalSize.slice(1)} Modal (Portal)`}
        size={modalSize}
        portalId="modal-portal"
      >
        <div>
          <p>This is a {modalSize} modal example using React Portal.</p>
          <p>Modal is now rendered outside the React root DOM tree!</p>
          <p>You can put any content here including:</p>
          <ul>
            <li>Forms</li>
            <li>Images</li>
            <li>Charts</li>
            <li>Any React components</li>
          </ul>
          
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button onClick={closeModal} style={{ padding: '8px 16px' }}>
              Close Modal
            </button>
            <button onClick={() => alert('Action clicked!')} style={{ padding: '8px 16px' }}>
              Action Button
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ModalExample;
