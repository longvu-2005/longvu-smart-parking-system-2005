import React from 'react';
import { Card, Table } from 'react-bootstrap';

function VehicleTab({ xeTrongBai, lichSuXeRa }) {
  
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
      {/* KHỐI 1: XE ĐANG ĐỖ THỰC TẾ */}
      <Card style={styles.glassCard} className="border-0 p-4 mb-4 text-white shadow">
        <div className="mb-3">
          <h5 className="text-info fw-bold m-0" style={{ letterSpacing: '-0.02em' }}>
            🚗 Xe Đang Đỗ Thực Tế
          </h5>
          <p className="text-muted small m-0">Danh sách phương tiện hiện diện trong các ô đỗ của toàn hệ thống</p>
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

      {/* KHỐI 2: NHẬT KÝ LỊCH SỬ RA VÀO */}
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
              {lichSuXeRa.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted small">Chưa có dữ liệu lịch sử ra vào.</td>
                </tr>
              ) : (
                lichSuXeRa.map(xe => {
                  // 🟢 SỬA LỖI DIỆT TẬN GỐC NaN TẠI ĐÂY:
                  // Quét qua tất cả các trường có thể lưu số tiền, nếu lỗi hoặc trống thì gán = 0
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
                      {/* Hiển thị số tiền an toàn không lo lỗi */}
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
      </Card>
    </>
  );
}

export default VehicleTab;