import React from 'react';
import { Button, Accordion, Table, Badge } from 'react-bootstrap';

function InfrastructureTab({ cauTrucHaTang, handleXoaO, handleOpenModal, handleToggleDatCho }) {
  
  const styles = {
    btnPlanning: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      border: 'none',
      borderRadius: '12px',
      fontWeight: '700',
      padding: '10px 20px',
      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
      transition: 'all 0.3s ease',
    },
    coSoItem: {
      background: 'transparent',
      border: 'none',
      marginBottom: '32px', // 🟢 ĐÃ SỬA: Tăng khoảng cách để Cơ sở không bị dính vào Phân khu bên dưới
    },
    coSoHeader: {
      color: '#38bdf8', // Màu xanh Cyan đồng bộ hệ thống tối
      fontSize: '1.3rem',
      fontWeight: '700',
      letterSpacing: '-0.02em',
      paddingLeft: '0px', // Đẩy sát lề trái
    },
    khuItem: {
      background: 'rgba(15, 23, 42, 0.45)', // Nền tối mờ khớp chuẩn với Deep Dark UI
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: '12px',
      marginBottom: '12px',
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
    badgeTrangThai: (status) => ({
      background: status === "Trống" ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
      color: status === "Trống" ? '#10b981' : '#ef4444',
      border: status === "Trống" ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
      textShadow: status === "Trống" ? '0 0 8px rgba(16, 185, 129, 0.3)' : '0 0 8px rgba(239, 68, 68, 0.3)',
      padding: '6px 12px',
      borderRadius: '8px',
    }),
    btnToggle: (isOpen) => ({
      background: isOpen ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)',
      color: isOpen ? '#10b981' : '#94a3b8',
      border: isOpen ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
      fontWeight: '600',
      fontSize: '0.8rem',
      borderRadius: '8px',
      padding: '6px 12px',
      transition: 'all 0.2s ease'
    }),
    btnDelete: {
      color: '#f43f5e',
      border: '1px solid rgba(244, 63, 94, 0.2)',
      background: 'rgba(244, 63, 94, 0.05)',
      borderRadius: '8px',
      fontSize: '0.8rem',
      padding: '6px 12px',
    }
  };

  return (
    <>
      {/* Khối Header Hành động */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="text-info fw-bold m-0" style={{ letterSpacing: '-0.02em' }}>
             Phân Cấp Hạ Tầng Đỗ Xe
          </h4>
          <p className="text-muted small m-0">Quản lý sơ đồ vị trí, trạng thái ô đỗ và phân quyền đặt chỗ online</p>
        </div>
        <Button 
          style={styles.btnPlanning} 
          className="d-flex align-items-center justify-content-center gap-2 align-self-start align-self-sm-center" 
          onClick={handleOpenModal}
        >
          <span> Quy Hoạch Khu Đỗ</span>
        </Button>
      </div>

      {/* Accordion Phân Cấp Lớn (Cơ Sở) */}
      <Accordion defaultActiveKey="0" className="custom-admin-accordion">
        {Object.keys(cauTrucHaTang).map((tenCoSo, idxCoSo) => (
          <Accordion.Item 
            eventKey={String(idxCoSo)} 
            key={tenCoSo} 
            className="shadow-none" 
            style={styles.coSoItem}
          >
            {/* 🟢 ĐÃ SỬA: Ép style loại bỏ hoàn toàn background/border lồng của nút gập mở Bootstrap */}
            <Accordion.Header className="bg-transparent border-0 custom-header-clean">
              <span style={styles.coSoHeader}>
                📍 {tenCoSo}
              </span>
            </Accordion.Header>
            
            {/* 🟢 ĐÃ SỬA: Tạo lớp đệm pt-3 để tách biệt rõ ràng tiêu đề Cơ sở và Phân khu bên dưới */}
            <Accordion.Body className="p-0 pt-3" style={{ background: 'transparent' }}>
              {/* Accordion Con Phân Cấp Nhỏ (Phân Khu) */}
              <Accordion>
                {Object.keys(cauTrucHaTang[tenCoSo]).map((tenKhuFormat, idxKhu) => {
                  const mangO = cauTrucHaTang[tenCoSo][tenKhuFormat];
                  return (
                    <Accordion.Item 
                      eventKey={String(idxKhu)} 
                      key={tenKhuFormat} 
                      className="border-0 overflow-hidden"
                      style={styles.khuItem}
                    >
                      <Accordion.Header>
                        <div className="d-flex align-items-center justify-content-between w-100 pe-3">
                          <span className="fw-bold" style={{ color: '#fbbf24', fontSize: '0.95rem' }}>
                             Phân khu: {tenKhuFormat}
                          </span>
                          <Badge bg="dark" className="text-muted border border-secondary px-2 py-1 font-monospace small">
                            {mangO.length} Slots
                          </Badge>
                        </div>
                      </Accordion.Header>
                      
                      <Accordion.Body className="p-0 bg-transparent">
                        <div className="table-responsive">
                          <Table variant="dark" className="text-center align-middle m-0 bg-transparent" borderless>
                            <thead>
                              <tr>
                                <th style={styles.thStyle}> Kí Hiệu Ô Đỗ</th>
                                <th style={styles.thStyle}> Trạng Thái</th>
                                <th style={styles.thStyle}> Quyền Đặt Trước (Online)</th>
                                <th style={styles.thStyle} className="text-end pe-4">Hành Động</th>
                              </tr>
                            </thead>
                            <tbody>
                              {mangO.map(bai => (
                                <tr key={bai.id}>
                                  <td style={styles.tdStyle} className="fw-bold text-white fs-5 font-monospace">
                                    {bai.tenBai}
                                  </td>
                                  <td style={styles.tdStyle}>
                                    <span style={styles.badgeTrangThai(bai.trangThai)} className="fw-semibold small">
                                      {bai.trangThai === "Trống" ? "● Trống" : "💼 Đầy"}
                                    </span>
                                  </td>
                                  <td style={styles.tdStyle}>
                                    <Button 
                                      size="sm" 
                                      style={styles.btnToggle(bai.choPhepDatChoTruoc === "true")}
                                      onClick={() => handleToggleDatCho(bai)}
                                    >
                                      {bai.choPhepDatChoTruoc === "true" ? "⚡ Đang mở" : "🔒 Đang khóa"}
                                    </Button>
                                  </td>
                                  <td style={styles.tdStyle} className="text-end pe-4">
                                    <Button 
                                      variant="outline-danger" 
                                      size="sm" 
                                      style={styles.btnDelete}
                                      onClick={() => handleXoaO(bai.id, bai.trangThai)}
                                    >
                                      🗑 Gỡ bỏ
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      </Accordion.Body>
                    </Accordion.Item>
                  );
                })}
              </Accordion>
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    </>
  );
}

export default InfrastructureTab;