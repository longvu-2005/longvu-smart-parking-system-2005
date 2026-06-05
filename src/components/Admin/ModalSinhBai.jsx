// Modal Sinh Bãi Đỗ Xe Tự Động - Giao Diện Quản Trị Viên

import React from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

function ModalSinhBai({ 
  show, onHide, sinhLoading, loiForm, handleSinhTuDongBaiDo,
  coSo, setCoSo, tenKhu, setTenKhu, soLuongCho, setSoLuongCho 
}) {
  return (
    <Modal show={show} onHide={() => !sinhLoading && onHide()} centered backdrop={sinhLoading ? 'static' : true}>
      <Modal.Header closeButton={!sinhLoading} style={{ backgroundColor: '#f8fafc' }}>
        <Modal.Title className="fw-bold text-dark">Quy Hoạch Khu Đỗ</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSinhTuDongBaiDo}>
        <Modal.Body style={{ backgroundColor: '#f8fafc', color: '#0f172a' }}>
          {loiForm && <div className="alert alert-danger py-2 small fw-bold">{loiForm}</div>}
          {sinhLoading && <div className="alert alert-warning py-2 text-center fw-bold">⏳ Đang chạy vòng đồng bộ tạo ô đỗ tuần tự... Vui lòng đợi!</div>}

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold text-secondary">Chọn Cơ Sở Quyết Định</Form.Label>
            <Form.Select value={coSo} onChange={(e) => setCoSo(e.target.value)} disabled={sinhLoading}>
              <option value="Cơ sở 1 (HOLA)">HOLA</option>
              <option value="Cơ sở 2 (XAVALO)">XAVALO</option>
              <option value="Cơ sở 3 (FUDA)">FUDA</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold text-secondary">Tên Khu (Ví dụ: KHU A, KHU B)</Form.Label>
            <Form.Control type="text" placeholder="Nhập tên khu..." value={tenKhu} onChange={(e) => setTenKhu(e.target.value)} disabled={sinhLoading} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold text-secondary">Số Lượng Ô Cần Sinh (Tối đa 50)</Form.Label>
            <Form.Control type="number" min="1" max="50" value={soLuongCho} onChange={(e) => setSoLuongCho(parseInt(e.target.value))} disabled={sinhLoading} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: '#f8fafc' }}>
          <Button variant="light" onClick={onHide} disabled={sinhLoading}>Hủy</Button>
          <Button type="submit" variant="dark" className="fw-bold" disabled={sinhLoading}>Bắt Đầu Xây Dựng Chỗ</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default ModalSinhBai;