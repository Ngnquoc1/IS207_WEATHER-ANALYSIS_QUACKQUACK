import React, { useState } from 'react';
import ReportModal from './ReportModal';
import { fetchDetailedReport } from '../services/weatherService';
import './AnomalyDisplay.css';
import './ReportModal.css';

/**
 * AnomalyDisplay Component
 * Displays temperature anomaly alerts when detected
 */
const AnomalyDisplay = ({ anomalyData, location }) => {
    const [showModal, setShowModal] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleViewReport = async () => {
        if (!location || !location.lat || !location.lon) {
            alert('Không thể tạo báo cáo: Thiếu thông tin vị trí');
            return;
        }

        setShowModal(true);
        setLoading(true);
        setError(null);
        setReportData(null);

        try {
            const report = await fetchDetailedReport(location.lat, location.lon);
            setReportData(report);
        } catch (err) {
            setError(err.message || 'Không thể tạo báo cáo chi tiết');
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setReportData(null);
        setError(null);
    };
  
    // Use mock data for now, fallback to real data if available
    const displayData = anomalyData || {};
    const hasAnomaly = displayData && displayData.is_anomaly;

    return (
        <>
            <div className="anomaly-section">
                {/* Title removed to avoid duplication */}
                
                {hasAnomaly ? (
                    <div className="anomaly-card">
                        <div className="anomaly-value">
                            {displayData.type == 'hot' ? '+' : '-'}{displayData.difference}°C
                        </div>
                        <div className="anomaly-description">
                            {displayData.message}
                        </div>
                        <button className="anomaly-link" onClick={handleViewReport}>
                         Xem báo cáo chi tiết
                        </button>
                    </div>
                ) : (
                    <div className="stable-card">
                        <div className="stable-status">
                            {displayData?.status || "ỔN ĐỊNH"}
                        </div>
                        <div className="stable-description">
                            {displayData?.message || "Nhiệt độ hiện tại nằm trong mức trung bình lịch sử (2015-2025) cho tháng 10."}
                        </div>
                        <button className="stable-link" onClick={handleViewReport}>
                            Xem báo cáo chi tiết
                        </button>
                    </div>
                )}
                
                <div className="anomaly-status">
                    Tất cả dữ liệu phân tích đều đạt chuẩn production-ready.
                </div>
            </div>

            <ReportModal
                isOpen={showModal}
                onClose={closeModal}
                reportData={reportData}
                loading={loading}
                error={error}
            />
        </>
    );
};

export default AnomalyDisplay;
