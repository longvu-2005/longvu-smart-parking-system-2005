import React from 'react';
import { Card, Table, Button, Badge, Row, Col, Form } from 'react-bootstrap';

function VehicleTable({ xeDangHienThi, handleChoXeRa, searchTerm, setSearchTerm, filterLoaiXe, setFilterLoaiXe }) {
  return (
    <div>
      <Row className="mb-3 g-2">
        <Col md={8}><Form.Control placeholder="🔍 Tìm biển số..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{backgroundColor: '#1e293b', color: '#fff'}} /></Col>
        <Col md={4}>
          <Form.Select value={filterLoaiXe} onChange={(e) => setFilterLoaiXe(e.target.value)} style={{backgroundColor: '#1e293b', color: '#fff'}}>
            <option value="Tất cả">Tất cả loại xe</option>
            <option value="Ô tô">Ô tô</option>
            <option value="Xe tải">Xe tải</option>
            <option value="Xe máy">Xe máy</option>
          </Form.Select>
        </Col>
      </Row>

      <Card className="border-0 shadow-lg" style={{ backgroundColor: '#1e293b' }}>
        <Table responsive variant="dark" className="align-middle text-center">
          <thead><tr><th>Biển Số</th><th>Loại Xe</th><th>Vị Trí</th><th>Thao Tác</th></tr></thead>
          <tbody>
            {xeDangHienThi.map(xe => (
              <tr key={xe.id}>
                <td className="fw-bold text-info">{xe.bienSo}</td>
                <td><Badge bg="light" text="dark">{xe.loaiXe}</Badge></td>
                <td>{xe.viTri}</td>
                <td><Button variant="danger" size="sm" onClick={() => handleChoXeRa(xe)}>Xuất Bãi</Button></td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
export default VehicleTable;