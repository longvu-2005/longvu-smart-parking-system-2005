// Modal Tiếp Nhận Xe Mới - Giao Diện Bảo Vệ Khi Đưa Xe Vào Bãi Đỗ

import React from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

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
  oTrongTheoCoSo,
  errors
}) {
  return (
    <Modal show={show} onHide={onHide} centered style={{ color: '#0f172a' }}>
      <Modal.Header closeButton className="fw-bold">📥 Tiếp Nhận Xe Mới</Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body style={{ backgroundColor: '#f8fafc' }}>
          
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold text-secondary">Biển Số Xe</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="Ví dụ: 29A-12345" 
              value={bienSo} 
              onChange={(e) => setBienSo(e.target.value)} 
              isInvalid={!!errors.bienSo} 
            />
            <Form.Control.Feedback type="invalid">{errors.bienSo}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold text-secondary">Loại Xe</Form.Label>
            <Form.Select value={loaiXe} onChange={(e) => setLoaiXe(e.target.value)}>
              <option value="Ô tô">🚗 Ô tô</option>
              <option value="Xe tải">🚚 Xe tải</option> {/* 👈 ĐÃ SỬA VALUE THUẦN VÀ ICON TRUCK CHUẨN */}
              <option value="Xe máy">🏍️ Xe máy</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold text-secondary">Chọn Cơ Sở Tiếp Nhận</Form.Label>
            <Form.Select value={coSoChon} onChange={(e) => setCoSoChon(e.target.value)}>
              <option value="Cơ sở 1 (HOLA)">HOLA</option>
              <option value="Cơ sở 2 (XAVALO)">XAVALO</option>
              <option value="Cơ sở 3 (FUDA)">FUDA</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold text-secondary">Chọn Ô Đỗ Còn Trống</Form.Label>
            <Form.Select value={viTri} onChange={(e) => setViTri(e.target.value)} isInvalid={!!errors.viTri}>
              {oTrongTheoCoSo.map(o => (
                <option key={o.id} value={o.tenBai}>{o.tenBai}</option>
              ))}
              {oTrongTheoCoSo.length === 0 && <option value="">❌ Toàn bộ ô đỗ ở cơ sở này đã kín!</option>}
            </Form.Select>
            <Form.Control.Feedback type="invalid">{errors.viTri}</Form.Control.Feedback>
          </Form.Group>

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Hủy</Button>
          <Button type="submit" variant="success" className="fw-bold" disabled={oTrongTheoCoSo.length === 0}>
            Xác Nhận Cho Vào
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default ModalCheckIn;