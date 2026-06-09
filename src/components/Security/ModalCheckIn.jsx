import React, { useMemo } from 'react';
import { Modal, Form, Button, Row, Col, Badge } from 'react-bootstrap';

// Tách inline style ra ngoài để tránh tạo mới object mỗi lần render
const MODAL_STYLE = { color: '#0f172a' };
const BODY_STYLE = { backgroundColor: '#f8fafc' };
const RIGHT_COL_STYLE = { borderLeft: '1px solid #dee2e6' };
const LIST_CONTAINER_STYLE = { maxHeight: '250px', overflowY: 'auto' };

function ModalCheckIn({
  show,
  onHide,
  handleSubmit,
  bienSo,
  setBienSo,
  loaiXe,
  setLoaiXe,
  coSoChon,
  setCoSoChon,
  viTri,
  setViTri,
  oTrongTheoCoSo = [],
  errors = {},
  danhSachSlotsOnline = []
}) {
  
  // Hàm xử lý chọn nhanh xe từ list đặt chỗ
  const handleChonNhanh = (slot) => {
    if (!slot) return;
    setBienSo(slot.bienSo || "");
    setLoaiXe(slot.loaiXe || "Ô tô");
    setCoSoChon(slot.coSo || "Cơ sở 1 (HOLA)");
    
    // Lưu ý: Đảm bảo component cha xử lý kịp việc cập nhật danh sách ô trống 
    // theo cơ sở mới trước khi set vị trí này.
    setTimeout(() => {
      setViTri(slot.tenBai || "");
    }, 50); 
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" style={MODAL_STYLE}>
      <Modal.Header closeButton className="fw-bold">
        Tiếp Nhận Xe Mới
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body style={BODY_STYLE}>
          <Row>
            {/* Cột trái: Form nhập liệu chính */}
            <Col md={7}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold text-secondary">Biển Số Xe</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Ví dụ: 29A-12345" 
                  value={bienSo || ""} 
                  onChange={(e) => setBienSo(e.target.value)} 
                  isInvalid={!!errors.bienSo} 
                />
                <Form.Control.Feedback type="invalid">{errors.bienSo}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold text-secondary">Loại Xe</Form.Label>
                <Form.Select value={loaiXe} onChange={(e) => setLoaiXe(e.target.value)}>
                  <option value="Ô tô">🚗 Ô tô</option>
                  <option value="Xe tải">🚚 Xe tải</option>
                  <option value="Xe máy">🏍️ Xe máy</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold text-secondary">Chọn Cơ Sở</Form.Label>
                <Form.Select value={coSoChon} onChange={(e) => setCoSoChon(e.target.value)}>
                  <option value="Cơ sở 1 (HOLA)">HOLA</option>
                  <option value="Cơ sở 2 (XAVALO)">XAVALO</option>
                  <option value="Cơ sở 3 (FUDA)">FUDA</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold text-secondary">Chọn Ô Đỗ</Form.Label>
                <Form.Select 
                  value={viTri} 
                  onChange={(e) => setViTri(e.target.value)} 
                  isInvalid={!!errors.viTri}
                >
                  <option value="">-- Chọn ô đỗ trống --</option>
                  {oTrongTheoCoSo.map(o => (
                    <option key={o.id} value={o.tenBai}>{o.tenBai}</option>
                  ))}
                </Form.Select>
                {/* FIX: Thêm hiển thị báo lỗi cho vị trí đỗ xe */}
                <Form.Control.Feedback type="invalid">{errors.viTri}</Form.Control.Feedback> 
              </Form.Group>
            </Col>

            {/* Cột phải: Danh sách hàng đợi Online */}
            <Col md={5} style={RIGHT_COL_STYLE}>
              <h6 className="fw-bold text-warning mb-3">Xe đang đợi Online</h6>
              <div style={LIST_CONTAINER_STYLE}>
                {Array.isArray(danhSachSlotsOnline) && danhSachSlotsOnline.length > 0 ? (
                  danhSachSlotsOnline.map((slot, index) => {
                    if (!slot) return null;
                    
                    const isSelected = bienSo === slot.bienSo;
                    
                    return (
                      <div 
                        key={slot.id || index} 
                        className="p-2 mb-2 border rounded shadow-sm transition-all" 
                        onClick={() => handleChonNhanh(slot)}
                        style={{ 
                          cursor: 'pointer', 
                          backgroundColor: isSelected ? '#e8f5e9' : '#ffffff',
                          borderLeft: isSelected ? '4px solid #198754' : '1px solid #dee2e6',
                          transition: 'all 0.2s ease' // Thêm hiệu ứng mượt khi click chọn
                        }}
                      >
                        <Badge bg={isSelected ? "success" : "secondary"}>
                          {slot.bienSo || "Không BS"}
                        </Badge>
                        <div className="small text-muted mt-1">
                          Cơ sở: {slot.coSo ? slot.coSo.replace("Cơ sở ", "") : "N/A"}
                        </div>
                        <div className="small text-dark fw-medium">Vị trí đặt: {slot.tenBai || "N/A"}</div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4 text-muted fst-italic">
                    <small>Không có dữ liệu xe đợi ở cổng.</small>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Hủy</Button>
          <Button type="submit" variant="success" className="fw-bold">Xác Nhận Cho Vào</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default ModalCheckIn;