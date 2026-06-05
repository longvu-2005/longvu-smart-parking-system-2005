import React from 'react';
import { Card, Button, ButtonGroup, Row, Col, Form, InputGroup } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

function ChartsTab({ 
  dataChart, boLocThoiGian, setBoLocThoiGian, 
  giaOTo, setGiaOTo, giaXeMay, setGiaXeMay, giaXeTai ,setGiaXeTai, 
  isEditingGia, setIsEditingGia 
}) {

  // Định nghĩa hệ thống Style cao cấp đồng bộ với Đại Hệ Thống
  const styles = {
    glassCard: {
      background: 'rgba(30, 41, 59, 0.45)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '20px',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
    },
    innerChartBox: {
      background: 'rgba(15, 23, 42, 0.5)',
      border: '1px solid rgba(255, 255, 255, 0.04)',
      borderRadius: '14px',
    },
    inputCustom: (isEditing, activeColor) => ({
      background: isEditing ? 'rgba(15, 23, 42, 0.8)' : 'rgba(15, 23, 42, 0.3)',
      color: isEditing ? activeColor : '#94a3b8',
      border: isEditing ? `1px solid ${activeColor}` : '1px solid rgba(255, 255, 255, 0.05)',
      boxShadow: isEditing ? `0 0 10px rgba(${activeColor === '#f59e0b' ? '245,158,11' : activeColor === '#3b82f6' ? '59,130,246' : '16,185,129'}, 0.2)` : 'none',
      transition: 'all 0.3s ease',
      borderRadius: '12px',
    }),
    btnTimeFilter: (isActive) => ({
      background: isActive ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' : 'transparent',
      color: isActive ? '#fff' : '#94a3b8',
      border: isActive ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '10px',
      padding: '8px 18px',
      fontWeight: '600',
      fontSize: '0.85rem',
      transition: 'all 0.2s ease',
      boxShadow: isActive ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
    }),
    btnActionPrice: {
      background: isEditingGia ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'rgba(255, 255, 255, 0.08)',
      border: 'none',
      borderRadius: '12px',
      fontWeight: '600',
      padding: '10px 20px',
      boxShadow: isEditingGia ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
      transition: 'all 0.2s ease',
    }
  };

  return (
    <>
      {/* 💸 BẢNG CẤU HÌNH BIỂU PHÍ CHỈNH SỬA GIÁ MỚI */}
      <Card style={styles.glassCard} className="p-4 border-0 text-white mb-4">
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
          <div>
            <h4 className="fw-bold text-warning mb-1" style={{ letterSpacing: '-0.02em' }}>
              🪙 Biểu Phí Gửi Xe Toàn Hệ Thống
            </h4>
            <p className="text-muted small mb-0">Cấu hình định mức áp dụng tức thì cho chu kỳ tính toán doanh thu</p>
          </div>
          
          <Button 
            style={styles.btnActionPrice}
            variant={isEditingGia ? "success" : "outline-light"}
            onClick={() => {
              if (isEditingGia) {
                localStorage.setItem('giaOTo', giaOTo);
                localStorage.setItem('giaXeMay', giaXeMay);
                localStorage.setItem('giaXeTai', giaXeTai);
                alert("💾 Hệ thống đã đồng bộ biểu phí mới!");
              }
              setIsEditingGia(!isEditingGia);
            }}
            className={!isEditingGia ? "text-white-50 border-secondary" : ""}
          >
            {isEditingGia ? "💾 Lưu cấu hình" : "⚙️ Chỉnh sửa mức giá"}
          </Button>
        </div>

        <Row className="g-3">
          {/* Ô TÔ */}
          <Col md={4}>
            <Form.Group className="p-2 rounded-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <Form.Label className="text-muted small fw-bold mb-2 tracking-wider">🏎️ GIÁ Ô TÔ / LƯỢT</Form.Label>
              <InputGroup>
                <Form.Control 
                  type="number" 
                  step="1000" 
                  value={giaOTo} 
                  onChange={(e) => setGiaOTo(Number(e.target.value))} 
                  disabled={!isEditingGia} 
                  style={styles.inputCustom(isEditingGia, '#f59e0b')}
                  className="fw-bold fs-5 px-3 py-2 text-warning" 
                />
                {isEditingGia && <InputGroup.Text className="bg-dark text-warning border-0 small">VND</InputGroup.Text>}
              </InputGroup>
            </Form.Group>
          </Col>

          {/* XE MÁY */}
          <Col md={4}>
            <Form.Group className="p-2 rounded-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <Form.Label className="text-muted small fw-bold mb-2 tracking-wider">🛵 GIÁ XE MÁY / LƯỢT</Form.Label>
              <InputGroup>
                <Form.Control 
                  type="number" 
                  step="1000" 
                  value={giaXeMay} 
                  onChange={(e) => setGiaXeMay(Number(e.target.value))} 
                  disabled={!isEditingGia} 
                  style={styles.inputCustom(isEditingGia, '#3b82f6')}
                  className="fw-bold fs-5 px-3 py-2 text-info" 
                />
                {isEditingGia && <InputGroup.Text className="bg-dark text-info border-0 small">VND</InputGroup.Text>}
              </InputGroup>
            </Form.Group>
          </Col>

          {/* XE TẢI */}
          <Col md={4}>
            <Form.Group className="p-2 rounded-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <Form.Label className="text-muted small fw-bold mb-2 tracking-wider">🚚 GIÁ XE TẢI / LƯỢT</Form.Label>
              <InputGroup>
                <Form.Control 
                  type="number" 
                  step="1000" 
                  value={giaXeTai} 
                  onChange={(e) => setGiaXeTai(Number(e.target.value))} 
                  disabled={!isEditingGia} 
                  style={styles.inputCustom(isEditingGia, '#10b981')}
                  className="fw-bold fs-5 px-3 py-2 text-success" 
                />
                {isEditingGia && <InputGroup.Text className="bg-dark text-success border-0 small">VND</InputGroup.Text>}
              </InputGroup>
            </Form.Group>
          </Col>
        </Row>
      </Card>

      {/* 📊 BỘ NÚT CHỌN MỐC THỜI GIAN & ĐỒ THỊ TRỰC QUAN */}
      <Card style={styles.glassCard} className="p-4 border-0 text-white">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <h4 className="fw-bold text-info mb-1" style={{ letterSpacing: '-0.02em' }}>
              📈 Đồ Thị Phân Tích Dữ Liệu Hệ Thống
            </h4>
            <p className="text-muted small mb-0">Theo dõi trực quan doanh thu và lưu lượng phương tiện luân chuyển</p>
          </div>
          
          {/* Bộ lọc thời gian tinh gọn như app di động */}
          <div className="p-1 rounded-3 d-flex gap-1" style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <button style={styles.btnTimeFilter(boLocThoiGian === 'homnay')} onClick={() => setBoLocThoiGian('homnay')}>Hôm Nay</button>
            <button style={styles.btnTimeFilter(boLocThoiGian === '7ngay')} onClick={() => setBoLocThoiGian('7ngay')}>7 Ngày Qua</button>
            <button style={styles.btnTimeFilter(boLocThoiGian === '1thang')} onClick={() => setBoLocThoiGian('1thang')}>1 Tháng Qua</button>
          </div>
        </div>

        <Row className="g-4">
          {/* BIỂU ĐỒ DOANH THU */}
          <Col lg={6}>
            <div className="p-3 style-chart-wrapper" style={styles.innerChartBox}>
              <h6 className="text-white-50 fw-bold mb-4 small tracking-wider">💰 TỔNG THU DOANH THU REAL-TIME (VND)</h6>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <BarChart data={dataChart} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }} 
                      cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                    />
                    {/* Thanh Bar đổ dốc màu nhẹ sang chảnh */}
                    <Bar dataKey="doanhThu" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Col>

          {/* BIỂU ĐỒ LƯU LƯỢNG */}
          <Col lg={6}>
            <div className="p-3 style-chart-wrapper" style={styles.innerChartBox}>
              <h6 className="text-white-50 fw-bold mb-4 small tracking-wider">🚗 LƯU LƯỢNG LƯỢT XE XUẤT BÃI (LƯỢT XE)</h6>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <LineChart data={dataChart} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }} />
                    <Line 
                      type="monotone" 
                      dataKey="luongXe" 
                      stroke="#3b82f6" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#1e293b' }} 
                      activeDot={{ r: 7, shadow: '0 0 10px rgba(59,130,246,0.5)' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </>
  );
}

export default ChartsTab;