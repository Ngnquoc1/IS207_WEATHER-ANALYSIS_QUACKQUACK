import React from 'react';
import ReactMarkdown from 'react-markdown';
import './ReportModal.css';

/**
 * ReportModal Component
 * Displays detailed weather report in a modal overlay
 */
const ReportModal = ({ isOpen, onClose, reportData, loading, error }) => {
    if (!isOpen) return null;

    return (
        <div className="report-modal-overlay" onClick={onClose}>
            <div className="report-modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="report-modal-header">
                    <h2> Báo Cáo Phân Tích Thời Tiết Chi Tiết</h2>
                    <button className="close-button" onClick={onClose}>
                        ✕
                    </button>
                </div>

                {/* Modal Body */}
                <div className="report-modal-body">
                    {loading && (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Đang tạo báo cáo chi tiết bằng AI...</p>
                            <small>Vui lòng đợi 10-15 giây</small>
                        </div>
                    )}

                    {error && (
                        <div className="error-state">
                            <span className="error-icon">⚠️</span>
                            <p>{error}</p>
                            <button onClick={onClose} className="retry-button">
                                Đóng
                            </button>
                        </div>
                    )}

                    {!loading && !error && reportData && (
                        <div className="report-content">
                            {/* Source Indicator */}
                            <div className="report-source">
                                <span className="timestamp">
                                    {new Date(reportData.generated_at).toLocaleString('vi-VN')}
                                </span>
                            </div>

                            {/* Markdown Content */}
                            <div className="markdown-content">
                                <ReactMarkdown>{reportData.report}</ReactMarkdown>
                            </div>

                            {/* Footer Actions */}
                            <div className="report-actions">
                                <button className="print-button" onClick={() => window.print()}>
                                    In báo cáo
                                </button>
                                <button className="close-action-button" onClick={onClose}>
                                    Đóng
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportModal;
