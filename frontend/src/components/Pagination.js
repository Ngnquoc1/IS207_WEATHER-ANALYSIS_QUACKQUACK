import React from 'react';
import './Pagination.css';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems,
  itemsPerPage,
  onPageChange,
  showInfo = true,
  itemName = 'items',
  className = ''
}) => {
  // Don't render if only one page
  if (totalPages <= 1) return null;

  const from = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const to = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    
    // Always show first page
    pages.push(1);
    
    // Calculate pages to show around current page
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);
    
    // Add ellipsis before if needed
    if (startPage > 2) {
      pages.push('ellipsis-left');
    }
    
    // Add pages around current
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Add ellipsis after if needed
    if (endPage < totalPages - 1) {
      pages.push('ellipsis-right');
    }
    
    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages.map((page, index) => {
      if (page === 'ellipsis-left' || page === 'ellipsis-right') {
        return (
          <span key={`ellipsis-${index}`} className="pagination-ellipsis">
            ...
          </span>
        );
      }
      
      return (
        <button
          key={page}
          className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </button>
      );
    });
  };

  return (
    <div className={`pagination-container ${className}`}>
      {showInfo && (
        <div className="pagination-info">
          Hiển thị {from} - {to} trong tổng {totalItems} {itemName}
        </div>
      )}
      
      <div className="pagination">
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          ← Trước
        </button>
        
        {renderPageNumbers()}
        
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          Sau →
        </button>
      </div>
    </div>
  );
};

export default Pagination;

