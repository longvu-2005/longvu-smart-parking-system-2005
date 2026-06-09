import React, { useState } from 'react';
import { Card, Table, Button } from 'react-bootstrap';

function VehicleTab({ xeTrongBai, lichSuXeRa }) {
  // --- STATE PHÂN TRANG CHO BẢNG LỊCH SỬ ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Số dòng trên 1 trang

  // --- LOGIC TÍNH TOÁN PHÂN TRANG ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLichSu = lichSuXeRa.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(lichSuXeRa.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  const styles = {
    glassCard: {
      background: 'rgba(30, 41, 59, 0.45)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.06)',
      borderRadius: '16px',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
    },
    thStyle: {
      color: '#94a3b8',
      fontWeight: '600',
      textTransform: 'uppercase',
      fontSize: '0.75rem',
      letterSpacing: '0.05em',
      borderBottom: '2px solid rgba(255, 255, 255, 0.08)',
      padding: '14px',
    },
    tdStyle: {
      padding: '14px',
      verticalAlign: 'middle',
      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    },
    customTag: (color) => ({
      background: `${color}14`, 
      color: color,
      border: `1px solid ${color}33`, 
      padding: '4px 10px',
      borderRadius: '6px',
      fontSize: '0.8rem',
      fontWeight: '600',
      display: 'inline-block'
    }),
    timeInActive: {
      color: '#cbd5e1', 
      fontFamily: 'monospace',
      fontSize: '0.85rem'
    },
    timeInHistory: {
      color: '#f1f5f9', 
      fontFamily: 'monospace',
      fontSize: '0.85rem'
    },
    timeOutHistory: {
      color: '#38bdf8', 
      fontFamily: 'monospace',
      fontSize: '0.85rem'
    },
    moneyText: {
      color: '#10b981', 
      fontWeight: '700',
      textShadow: '0 0 8px rgba(16, 185, 129, 0.2)'
    }
  };

  return (
    <>
      {/* KHỐI 1: XE ĐANG ĐỖ THỰC TẾ (Không phân trang) */}
      <Card style={styles.glassCard} className="border-0 p-4 mb-4 text-white shadow">
        <div className="mb-3">
          <h5 className="text-info fw-bold m-0" style={{ letterSpacing: '-0.02em' }}>
            🚗 Xe Đang Đỗ Thực Tế
          </h5>
          
        </div>

        <div className="table-responsive rounded-3" style={{ background: 'rgba(15, 23, 42, 0.2)' }}>
          <Table variant="dark" className="text-center align-middle m-0 bg-transparent" borderless>
            <thead>
              <tr>
                <th style={styles.thStyle}>Biển Số</th>
                <th style={styles.thStyle}>Loại Xe</th>
                <th style={styles.thStyle}>Cơ Sở</th>
                <th style={styles.thStyle}>Vị Trí Ô</th>
                <th style={styles.thStyle}>Thời Gian Vào</th>
              </tr>
            </thead>
            <tbody>
              {xeTrongBai.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted small">Hiện tại không có xe trong bãi.</td>
                </tr>
              ) : (
                xeTrongBai.map(xe => (
                  <tr key={xe.id}>
                    <td style={styles.tdStyle} className="fw-bold text-white fs-5 font-monospace">
                      {xe.bienSo}
                    </td>
                    <td style={styles.tdStyle}>
                      <span style={styles.customTag('#38bdf8')}>{xe.loaiXe}</span>
                    </td>
                    <td style={styles.tdStyle}>
                      <span style={styles.customTag('#94a3b8')}>{xe.coSo}</span>
                    </td>
                    <td style={styles.tdStyle}>
                      <span style={styles.customTag('#fbbf24')}>{xe.viTri}</span>
                    </td>
                    <td style={styles.tdStyle}>
                      <span style={styles.timeInActive}>{xe.thoiGianVao}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </Card>

      {/* KHỐI 2: NHẬT KÝ LỊCH SỬ RA VÀO (Đã thêm Phân trang) */}
      <Card style={styles.glassCard} className="border-0 p-4 text-white shadow">
        <div className="mb-3">
          <h5 className="text-success fw-bold m-0" style={{ letterSpacing: '-0.02em' }}>
            📝 Nhật Ký Lịch Sử Ra Vào Toàn Bãi
          </h5>
          <p className="text-muted small m-0">Lịch sử giao dịch, mốc thời gian và doanh thu thu được từ các lượt xe đã ra</p>
        </div>

        <div className="table-responsive rounded-3" style={{ background: 'rgba(15, 23, 42, 0.2)' }}>
          <Table variant="dark" className="text-center align-middle m-0 bg-transparent" borderless>
            <thead>
              <tr>
                <th style={styles.thStyle}>Biển Số</th>
                <th style={styles.thStyle}>Loại Xe</th>
                <th style={styles.thStyle}>Thời Gian Vào</th>
                <th style={styles.thStyle}>Thời Gian Ra</th>
                <th style={styles.thStyle}>Tiền Thu</th>
              </tr>
            </thead>
            <tbody>
              {currentLichSu.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted small">Chưa có dữ liệu lịch sử ra vào.</td>
                </tr>
              ) : (
                // Lặp qua mảng currentLichSu (đã bị cắt bởi phân trang)
                currentLichSu.map(xe => {
                  const layTienHople = Number(xe.soTien) || Number(xe.tongTien) || Number(xe.tien) || 0;
                  const hienThiTien = isNaN(layTienHople) ? 0 : layTienHople;

                  return (
                    <tr key={xe.id}>
                      <td style={styles.tdStyle} className="fw-semibold text-white-50 fs-5 font-monospace">
                        {xe.bienSo}
                      </td>
                      <td style={styles.tdStyle}>
                        <span style={styles.customTag('#64748b')}>{xe.loaiXe}</span>
                      </td>
                      <td style={styles.tdStyle}>
                        <span style={styles.timeInHistory}>{xe.thoiGianVao}</span>
                      </td>
                      <td style={styles.tdStyle}>
                        <span style={styles.timeOutHistory}>{xe.thoiGianRa}</span>
                      </td>
                      <td style={styles.tdStyle}>
                        <span style={styles.moneyText}>
                          +{hienThiTien.toLocaleString('vi-VN')} đ
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>

        {/* --- THANH ĐIỀU HƯỚNG PHÂN TRANG (Tông màu tối / xanh emerald) --- */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center align-items-center mt-4 gap-2">
            <Button 
              variant="outline-secondary" 
              size="sm" 
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              style={{ borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              &laquo; Trước
            </Button>

            {[...Array(totalPages)].map((_, index) => (
              <Button
                key={index + 1}
                variant={currentPage === index + 1 ? "success" : "outline-secondary"}
                size="sm"
                onClick={() => handlePageChange(index + 1)}
                style={{ 
                  borderRadius: '8px', 
                  fontWeight: currentPage === index + 1 ? 'bold' : 'normal',
                  color: currentPage === index + 1 ? '#fff' : '',
                  border: currentPage === index + 1 ? 'none' : '1px solid rgba(255,255,255,0.1)'
                }}
              >
                {index + 1}
              </Button>
            ))}

            <Button 
              variant="outline-secondary" 
              size="sm" 
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              style={{ borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              Sau &raquo;
            </Button>
          </div>
        )}
      </Card>
    </>
  );
}

export default VehicleTab;