// Bảng Điều Khiển Quản Lý Xe Đang Đỗ - Giao Diện Bảo Vệ Xem Danh Sách Xe và Cho Xe Ra Bãi

import React from 'react';
import { Card, Table, Button, Badge, Row, Col, Form } from 'react-bootstrap';

function VehicleTable({ 
  xeDangHienThi, 
  handleChoXeRa, 
  searchTerm, 
  setSearchTerm, 
  filterLoaiXe, 
  setFilterLoaiXe 
}) {
  return (
    <div>
      {/* 🔍 THANH TÌM KIẾM VÀ BỘ LỌC THÔNG MINH */}
      <Row className="mb-3 g-2">
        <Col md={8} xs={12}>
          <Form.Control
            type="text"
            placeholder="🔍 Nhập nhanh biển số (Ví dụ: 29A, 12345 hoặc chỉ cần vài số cuối)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              backgroundColor: '#1e293b', 
              color: '#fff', 
              border: '1px solid #475569',
              borderRadius: '10px',
              height: '45px'
            }}
          />
        </Col>
        <Col md={4} xs={12}>
          <Form.Select
            value={filterLoaiXe}
            onChange={(e) => setFilterLoaiXe(e.target.value)}
            style={{ 
              backgroundColor: '#1e293b', 
              color: '#fff', 
              border: '1px solid #475569',
              borderRadius: '10px',
              height: '45px'
            }}
          >
            <option value="Tất cả">🚚 Tất cả loại xe</option>
            <option value="Ô tô">🚗 Ô tô</option>
            <option value="Xe tải">🚚 Xe tải</option>
            <option value="Xe máy">🏍️ Xe máy</option>
          </Form.Select>
        </Col>
      </Row>

      {/* BẢNG DANH SÁCH XE */}
      <Card className="border-0 shadow-lg overflow-hidden" style={{ backgroundColor: '#1e293b', borderRadius: '20px' }}>
        <Table responsive variant="dark" className="mb-0 align-middle text-center">
          <thead>
            <tr style={{ color: '#94a3b8' }}>
              <th>Biển Số</th>
              <th>Loại Xe</th>
              <th>Thuộc Cơ Sở</th>
              <th>Vị Trí Ô Đỗ</th>
              <th>Thời Gian Vào</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {xeDangHienThi.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-secondary py-4">
                  Không tìm thấy xe nào khớp với bộ lọc hiện tại!
                </td>
              </tr>
            ) : (
              xeDangHienThi.map(xe => (
                <tr key={xe.id}>
                  <td className="fw-bold text-info fs-5">{xe.bienSo}</td>
                  <td>
                    <Badge bg="light" text="dark">
                      {xe.loaiXe.includes("Ô tô") ? "🚗 Ô tô" : xe.loaiXe.includes("Xe tải") ? "🚚 Xe tải" : "🏍️ Xe máy"}
                    </Badge>
                  </td>
                  <td>{xe.coSo}</td>
                  <td className="text-warning fw-bold">{xe.viTri}</td>
                  <td className="text-secondary small">{xe.thoiGianVao}</td>
                  <td>
                    <Button variant="danger" size="sm" className="fw-bold rounded-pill px-3" onClick={() => handleChoXeRa(xe)}>
                       Xuất Bãi
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}

export default VehicleTable;