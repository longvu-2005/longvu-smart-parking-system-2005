import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';

function SummaryCards({ soLuongBai, soXeTrongBai, tongTien }) {
  
  // Hệ thống style kính mờ và tản sáng Neon đồng bộ giao diện Admin Đêm
  const styles = {
    glassCard: {
      background: 'rgba(30, 41, 59, 0.45)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.06)',
      borderRadius: '20px',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.25)',
      position: 'relative',
      overflow: 'hidden',
    },
    titleText: {
      color: '#94a3b8',
      fontSize: '0.75rem',
      fontWeight: '700',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
    },
    valueText: (colorGlow) => ({
      fontWeight: '800',
      fontSize: '2rem',
      letterSpacing: '-0.03em',
      color: colorGlow,
      textShadow: `0 0 12px ${colorGlow}33`, // Đổ bóng phát sáng mờ cùng tông màu số
    }),
    iconWrapper: (bgColor, iconColor) => ({
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      background: bgColor,
      color: iconColor,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.3rem',
      boxShadow: `0 4px 12px ${bgColor}`,
    })
  };

  return (
    <Row className="g-4 mb-4">
      {/* Thẻ 1: Ô Đỗ Toàn Hệ Thống */}
      <Col sm={6} xl={4}>
        <Card style={styles.glassCard} className="p-4 border-0 h-100">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex flex-column gap-1">
              <span style={styles.titleText}>Ô Đỗ Toàn Hệ Thống</span>
              <h2 className="m-0 mt-1" style={styles.valueText('#38bdf8')}>
                {soLuongBai} <span style={{ fontSize: '1.2rem', fontWeight: '500' }}>Ô</span>
              </h2>
            </div>
            
          </div>
        </Card>
      </Col>

      {/* Thẻ 2: Xe Đang Trong Bãi */}
      <Col sm={6} xl={4}>
        <Card style={styles.glassCard} className="p-4 border-0 h-100">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex flex-column gap-1">
              <span style={styles.titleText}>Xe Đang Trong Bãi</span>
              <h2 className="m-0 mt-1" style={styles.valueText('#10b981')}>
                {soXeTrongBai} <span style={{ fontSize: '1.2rem', fontWeight: '500' }}>Xe</span>
              </h2>
            </div>
         
          </div>
        </Card>
      </Col>

      {/* Thẻ 3: Doanh Thu Theo Bộ Lọc */}
      <Col sm={12} xl={4}>
        <Card style={styles.glassCard} className="p-4 border-0 h-100">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex flex-column gap-1">
              <span style={styles.titleText}>Doanh Thu Theo Bộ Lọc</span>
              <h2 className="m-0 mt-1" style={styles.valueText('#fbbf24')}>
                {tongTien.toLocaleString('vi-VN')} <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>đ</span>
              </h2>
            </div>
           
          </div>
        </Card>
      </Col>
    </Row>
  );
}

export default SummaryCards;