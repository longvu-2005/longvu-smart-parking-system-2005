import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Card, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { API_LOTSS } from '../../constants/api';

function AdminParkingTab() {
  const [danhSachO, setDanhSachO] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_LOTSS);
      setDanhSachO(res.data);
    } catch (err) {
      console.error("Lỗi lấy dữ liệu bãi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const toggleDatCho = async (slot) => {
    const trangThaiMoi = slot.choPhepDatChoTruoc === "true" ? "false" : "true";
    try {
      await axios.put(`${API_LOTSS}/${slot.id}`, {
        ...slot,
        choPhepDatChoTruoc: trangThaiMoi
      });
      fetchData();
    } catch (err) {
      alert(" Lỗi cập nhật trạng thái!");
    }
  };

  // Inline Styles mang phong cách Glassmorphism & Neon Glow
  const styles = {
    glassCard: {
      background: 'rgba(30, 41, 59, 0.45)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '16px',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
    },
    thStyle: {
      color: '#94a3b8',
      fontWeight: '600',
      textTransform: 'uppercase',
      fontSize: '0.8rem',
      letterSpacing: '0.05em',
      borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
      padding: '16px 20px',
    },
    tdStyle: {
      color: '#f8fafc',
      padding: '16px 20px',
      verticalAlign: 'middle',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    },
    badgeOpen: {
      background: 'rgba(16, 185, 129, 0.15)',
      color: '#10b981',
      border: '1px solid rgba(16, 185, 129, 0.3)',
      padding: '6px 12px',
      borderRadius: '8px',
      textShadow: '0 0 10px rgba(16, 185, 129, 0.4)',
    },
    badgeLocked: {
      background: 'rgba(239, 68, 68, 0.15)',
      color: '#ef4444',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      padding: '6px 12px',
      borderRadius: '8px',
      textShadow: '0 0 10px rgba(239, 68, 68, 0.4)',
    },
    btnAction: (isOpen) => ({
      background: isOpen 
        ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' 
        : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      border: 'none',
      borderRadius: '10px',
      padding: '8px 16px',
      fontWeight: '600',
      fontSize: '0.9rem',
      boxShadow: isOpen 
        ? '0 4px 12px rgba(239, 68, 68, 0.2)' 
        : '0 4px 12px rgba(59, 130, 246, 0.2)',
      transition: 'all 0.2s ease',
    })
  };

  return (
    <Card style={styles.glassCard} className="p-4 border-0 text-white shadow">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-info" style={{ letterSpacing: '-0.03em' }}>
            ⚡ BẢNG ĐIỀU KHIỂN Ô ĐỖ
          </h4>
          <p className="text-muted small mb-0">Cấp quyền hoặc đóng băng tính năng đặt chỗ trước của từng vị trí</p>
        </div>
        <Button 
          variant="outline-light" 
          size="sm" 
          onClick={fetchData} 
          className="rounded-3 border-secondary text-muted"
        >
          🔄 Làm mới ({danhSachO.length})
        </Button>
      </div>

      <div className="table-responsive rounded-3" style={{ background: 'rgba(15, 23, 42, 0.3)' }}>
        <Table variant="dark" className="mb-0 bg-transparent" borderless>
          <thead>
            <tr>
              <th style={styles.thStyle}>📍 Tên Ô Bãi</th>
              <th style={styles.thStyle}>⚙️ Trạng Thái Đặt Trước</th>
              <th style={styles.thStyle} className="text-end">Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3" className="text-center py-5 text-muted">
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Đang tải cấu hình dữ liệu...
                </td>
              </tr>
            ) : danhSachO.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center py-5 text-muted">Không tìm thấy ô đỗ nào.</td>
              </tr>
            ) : (
              danhSachO.map(slot => {
                const isOpen = slot.choPhepDatChoTruoc === "true";
                return (
                  <tr key={slot.id} className="align-middle admin-table-row">
                    <td style={styles.tdStyle} className="fw-semibold text-white-50">
                      <span className="text-white bg-dark px-2 py-1 rounded me-2 border border-secondary small">
                        {slot.coSo?.split(' ')[0] || 'Khu'}
                      </span>
                      {slot.tenBai}
                    </td>
                    <td style={styles.tdStyle}>
                      <span style={isOpen ? styles.badgeOpen : styles.badgeLocked}>
                        {isOpen ? "● Đang mở đặt" : "◌ Đã khóa"}
                      </span>
                    </td>
                    <td style={styles.tdStyle} className="text-end">
                      <Button 
                        style={styles.btnAction(isOpen)}
                        className="btn-hover-scale"
                        onClick={() => toggleDatCho(slot)}
                      >
                        {isOpen ? "🔒 Khóa đặt" : "🔑 Mở đặt"}
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      </div>
    </Card>
  );
}

export default AdminParkingTab;