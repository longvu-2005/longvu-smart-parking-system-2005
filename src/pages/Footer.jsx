import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

function Footer() {
  const currentYear = new Date().getFullYear();

  const styles = {
    // 🟢 ĐÃ FIX THUỘC TÍNH: Loại bỏ absolute/fixed, dùng block chuẩn và tạo khoảng cách
    footerWrapper: {
      background: 'rgba(15, 23, 42, 0.6)', 
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
      padding: '48px 0 24px 0',
      width: '100%',
      position: 'relative', // Chuyển về trạng thái tĩnh trong luồng flexbox
      marginTop: '60px',    // Đẩy cách xa các bảng dữ liệu phía trên ra một đoạn đẹp đẽ
      clear: 'both'         // Chặn mọi hiện tượng tràn layout do float gây ra
    },
    brandTitle: {
      fontSize: '1.2rem',
      fontWeight: '800',
      letterSpacing: '-0.02em',
      background: 'linear-gradient(135deg, #38bdf8 0%, #10b981 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    sectionTitle: {
      color: '#f8fafc',
      fontSize: '0.85rem',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      marginBottom: '20px',
    },
    linkItem: {
      color: '#94a3b8',
      fontSize: '0.9rem',
      textDecoration: 'none',
      transition: 'all 0.2s ease',
      display: 'inline-block',
      marginBottom: '10px',
    },
    infoText: {
      color: '#64748b',
      fontSize: '0.9rem',
      lineHeight: '1.6',
    },
    bottomBar: {
      borderTop: '1px solid rgba(255, 255, 255, 0.04)',
      paddingTop: '24px',
      marginTop: '40px',
    },
    statusIndicator: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      background: 'rgba(16, 185, 129, 0.08)',
      color: '#10b981',
      border: '1px solid rgba(16, 185, 129, 0.2)',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '600',
    }
  };

  return (
    <footer style={styles.footerWrapper}>
      <Container>
        <Row className="g-4">
          {/* CỘT 1: THÔNG TIN THƯƠNG HIỆU */}
          <Col lg={4} md={6}>
            <div className="d-flex flex-column gap-3">
              <span style={styles.brandTitle}> SMART PARKING SYSTEM</span>
              <p style={styles.infoText} className="m-0 pe-lg-4">
                Giải pháp quản lý bãi đỗ xe thông minh toàn diện, tối ưu hóa không gian thực tế và tự động hóa quy trình kiểm soát phương tiện ra vào.
              </p>
              <div>
                <div style={styles.statusIndicator}>
                  <span className="position-relative d-flex h-2 w-2">
                    <span className="animate-ping position-absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success">●</span>
                  </span>
                  Hệ thống vận hành ổn định
                </div>
              </div>
            </div>
          </Col>

          {/* CỘT 2: LINK ĐIỀU HƯỚNG TRANG CHÍNH */}
          <Col lg={2} sm={6} xs={6}>
            <h6 style={styles.sectionTitle}>Bảng điều khiển</h6>
            <div className="d-flex flex-column">
              <a href="#dashboard" style={styles.linkItem} className="footer-link-hover">📊 Tổng quan</a>
              <a href="#infrastructure" style={styles.linkItem} className="footer-link-hover">🏢 Quản lý bãi</a>
              <a href="#vehicles" style={styles.linkItem} className="footer-link-hover">🚗 Giám sát xe</a>
              <a href="#history" style={styles.linkItem} className="footer-link-hover">📝 Nhật ký ra vào</a>
            </div>
          </Col>

          {/* CỘT 3: LINK QUY ĐỊNH / TIỆN ÍCH */}
          <Col lg={2} sm={6} xs={6}>
            <h6 style={styles.sectionTitle}>Tính năng mở rộng</h6>
            <div className="d-flex flex-column">
              <a href="#booking" style={styles.linkItem} className="footer-link-hover">⚡ Đặt chỗ Online</a>
              <a href="#analytics" style={styles.linkItem} className="footer-link-hover">📈 Báo cáo doanh thu</a>
              <a href="#settings" style={styles.linkItem} className="footer-link-hover">⚙️ Cấu hình hệ thống</a>
              <a href="#support" style={styles.linkItem} className="footer-link-hover">🛠️ Hỗ trợ kỹ thuật</a>
            </div>
          </Col>

          {/* CỘT 4: THÔNG TIN LIÊN HỆ / KỸ THUẬT */}
          <Col lg={4} md={6}>
            <h6 style={styles.sectionTitle}>Thông tin vận hành</h6>
            <div className="d-flex flex-column gap-2" style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              <div className="d-flex align-items-center gap-2">
                <span>📍</span> <span className="text-truncate">FPT University - HOLA</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span>✉️</span> <span>Teamfor5@fpt.edu.vn</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span>🛡️</span> <span>Bảo mật dữ liệu camera AI tích hợp</span>
              </div>
            </div>
          </Col>
        </Row>

        {/* THANH BẢN QUYỀN DƯỚI ĐÁY */}
        <Row style={styles.bottomBar} className="align-items-center">
          <Col md={6} className="text-center text-md-start mb-3 mb-md-0">
            <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
              © {currentYear} <strong>Smart Parking</strong>. By LONG VU.
            </span>
          </Col>
          <Col md={6} className="text-center text-md-end">
           
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;