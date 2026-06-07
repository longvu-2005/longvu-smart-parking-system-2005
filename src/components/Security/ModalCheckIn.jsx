import React from 'react';
import { Modal, Form, Button, Row, Col, Badge } from 'react-bootstrap';

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
  danhSachSlotsOnline = [] // Giá trị mặc định là mảng rỗng để tránh undefined
}) {
  
  // Hàm xử lý chọn nhanh xe từ list đặt chỗ
  const handleChonNhanh = (slot) => {
    if (!slot) return;
    setBienSo(slot.bienSo || "");
    setLoaiXe(slot.loaiXe || "Ô tô");
    setCoSoChon(slot.coSo || "Cơ sở 1 (HOLA)");
    setViTri(slot.tenBai || "");
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" style={{ color: '#0f172a' }}>
      <Modal.Header closeButton className="fw-bold">
        Tiếp Nhận Xe Mới
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body style={{ backgroundColor: '#f8fafc' }}>
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
                <Form.Select value={viTri} onChange={(e) => setViTri(e.target.value)} isInvalid={!!errors.viTri}>
                  <option value="">-- Chọn ô đỗ trống --</option>
                  {oTrongTheoCoSo && oTrongTheoCoSo.map(o => (
                    <option key={o.id} value={o.tenBai}>{o.tenBai}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Cột phải: Danh sách hàng đợi Online (ĐÃ FIX LỖI CRASH) */}
            <Col md={5} style={{ borderLeft: '1px solid #dee2e6' }}>
              <h6 className="fw-bold text-warning mb-3"> Xe đang đợi Online</h6>
              <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                {Array.isArray(danhSachSlotsOnline) && danhSachSlotsOnline.length > 0 ? (
                  danhSachSlotsOnline.map((slot, index) => {
                    // Kiểm tra an toàn: nếu slot bị null/undefined thì bỏ qua
                    if (!slot) return null;
                    
                    return (
                      <div 
                        key={slot.id || index} 
                        className="p-2 mb-2 border rounded shadow-sm" 
                        onClick={() => handleChonNhanh(slot)}
                        style={{ 
                          cursor: 'pointer', 
                          backgroundColor: bienSo === slot.bienSo ? '#e8f5e9' : '#ffffff',
                          borderLeft: bienSo === slot.bienSo ? '4px solid #198754' : '1px solid #dee2e6'
                        }}
                      >
                        <Badge bg="secondary">{slot.bienSo || "Không BS"}</Badge>
                        <div className="small text-muted mt-1">Vị trí: {slot.tenBai || "N/A"}</div>
                      </div>
                    );
                  })
                ) : (
                  <small className="text-muted fst-italic">Không có dữ liệu xe đợi ở cổng.</small>
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