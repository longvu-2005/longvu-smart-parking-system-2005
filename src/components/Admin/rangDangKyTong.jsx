// Trang Đăng Ký Tổng - Giao Diện Cấp Quyền & Khóa/Xóa Tài Khoản Nội Bộ

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import { API_USERS } from '../../constants/api';

function TrangDangKyTong() {
  const navigate = useNavigate(); 
  
  const [danhSachUser, setDanhSachUser] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states cho tài khoản nội bộ mới
  const [taiKhoan, setTaiKhoan] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [hoTen, setHoTen] = useState("");
  const [role, setRole] = useState("Security");
  const [errors, setErrors] = useState({});

  // Hàm tải toàn bộ danh sách tài khoản từ MockAPI
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_USERS);
      setDanhSachUser(res.data);
    } catch (err) {
      console.error("Lỗi không thể kết nối Database User:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // 🔥 THÊM MỚI: Logic xử lý Xóa tài khoản nhân sự
  const handleXoaTaiKhoan = async (user) => {
    // 1. Kiểm tra an toàn: Lấy thông tin admin đang đăng nhập hiện tại
    const savedUser = localStorage.getItem("userHienTai");
    const currentAdmin = savedUser ? JSON.parse(savedUser) : null;

    if (user.id === "super-admin" || user.taiKhoan === "admin") {
      alert(" Đây là tài khoản cứu hộ tối cao của hệ thống, không được phép xóa!");
      return;
    }

    if (currentAdmin && (user.id === currentAdmin.id || user.taiKhoan === currentAdmin.taiKhoan)) {
      alert("Bạn không thể tự xóa tài khoản chính mình khi đang đăng nhập!");
      return;
    }

    // 2. Hiện hộp thoại xác nhận chắc chắn muốn xóa
    if (!window.confirm(`BẠN CÓ CHẮC CHẮN MUỐN THU HỒI QUYỀN VÀ XÓA VĨNH VIỄN TÀI KHOẢN [${user.taiKhoan}]?`)) {
      return;
    }

    try {
      // Gửi yêu cầu DELETE lên MockAPI theo id định danh
      await axios.delete(`${API_USERS}/${user.id}`);
      alert(` Đã thu hồi quyền thành công! Tài khoản ${user.taiKhoan} đã bị xóa khỏi hệ thống.`);
      fetchAccounts(); // Tải lại bảng dữ liệu mới nhất
    } catch (err) {
      console.error("Lỗi khi xóa tài khoản:", err);
      alert(" Lỗi hệ thống, không thể xóa tài khoản này!");
    }
  };

  // Xử lý logic khi bấm nút Cấp Tài Khoản
  const handleRegisterTong = async (e) => {
    e.preventDefault();
    setErrors({});
    
    let localErrors = {};
    const tkChuan = taiKhoan.trim();
    const nameChuan = hoTen.trim();

    if (!tkChuan) localErrors.taiKhoan = "Tên tài khoản không được để trống!";
    if (!matKhau) localErrors.matKhau = "Mật khẩu không được để trống!";
    if (!nameChuan) localErrors.hoTen = "Họ tên nhân viên không được để trống!";

    const biTrung = danhSachUser.some(user => user.taiKhoan.toLowerCase() === tkChuan.toLowerCase());
    if (biTrung) {
      localErrors.taiKhoan = "Tài khoản này đã tồn tại trên hệ thống!";
    }

    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      return;
    }

    try {
      await axios.post(API_USERS, {
        taiKhoan: tkChuan,
        matKhau: matKhau,
        hoTen: nameChuan,
        role: role,
        ngayTao: new Date().toLocaleString('vi-VN')
      });

      alert(` Cấp thành công tài khoản [${role}] cho nhân viên: ${nameChuan}`);
      
      setTaiKhoan("");
      setMatKhau("");
      setHoTen("");
      setRole("Security");
      
      fetchAccounts();
    } catch (err) {
      alert("Lỗi hệ thống, không thể cấp tài khoản lúc này!");
    }
  };

  return (
    <Container className="py-4 text-white">
      
      {/* ⬅️ NÚT BACK QUAY LẠI TRANG ADMIN CHÍNH */}
      <div className="mb-4">
        <Button 
          variant="outline-light" 
          className="rounded-pill px-4 fw-bold shadow-sm"
          onClick={() => navigate('/admin')} 
        >
          Quay Lại Trang Quản Lý
        </Button>
      </div>

      {/* TIÊU ĐỀ TRANG CẤP QUYỀN */}
      <div className="text-center mb-5">
        <h2 className="fw-black text-white">HỆ THỐNG ĐĂNG KÝ TỔNG (SUPER ADMIN)</h2>
        <p className="text-info mb-0">Phân hệ quản trị nội bộ - Cấp quyền trực tiếp cho Admin phụ & Bảo vệ</p>
      </div>

      <Row className="g-4">
        {/* CỘT 1: FORM ĐĂNG KÝ NỘI BỘ */}
        <Col lg={4} md={12}>
          <Card className="border-0 shadow-lg p-4" style={{ backgroundColor: '#1e293b', borderRadius: '20px' }}>
            <h4 className="text-warning mb-4 fw-bold">Cấp Nick Nhân Sự</h4>
            <Form onSubmit={handleRegisterTong}>
              
              <Form.Group className="mb-3">
                <Form.Label className="text-secondary fw-bold">Tên Tài Khoản (Username)</Form.Label>
                <Form.Control 
                  type="text" 
                  value={taiKhoan} 
                  onChange={(e) => setTaiKhoan(e.target.value)} 
                  placeholder="Ví dụ: baove_co_so_1"
                  isInvalid={!!errors.taiKhoan}
                  style={{ backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569' }}
                />
                <Form.Control.Feedback type="invalid">{errors.taiKhoan}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="text-secondary fw-bold">Mật Khẩu</Form.Label>
                <Form.Control 
                  type="password" 
                  value={matKhau} 
                  onChange={(e) => setMatKhau(e.target.value)} 
                  placeholder="••••••••"
                  isInvalid={!!errors.matKhau}
                  style={{ backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569' }}
                />
                <Form.Control.Feedback type="invalid">{errors.matKhau}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="text-secondary fw-bold">Họ và Tên</Form.Label>
                <Form.Control 
                  type="text" 
                  value={hoTen} 
                  onChange={(e) => setHoTen(e.target.value)} 
                  placeholder="Ví dụ: Nguyễn Văn Vũ"
                  isInvalid={!!errors.hoTen}
                  style={{ backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569' }}
                />
                <Form.Control.Feedback type="invalid">{errors.hoTen}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="text-secondary fw-bold">Chức Vụ Hệ Thống</Form.Label>
                <Form.Select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  style={{ backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569' }}
                >
                  <option value="Security">Security (Bảo vệ cổng bãi)</option>
                  <option value="Admin">Admin (Quản trị viên phụ)</option>
                  <option value="User">User (Người dùng thông thường)</option>
                </Form.Select>
              </Form.Group>

              <Button type="submit" variant="success" className="w-100 fw-bold py-3" style={{ borderRadius: '12px' }}>
                🚀 Tiến Hành Cấp Quyền
              </Button>
            </Form>
          </Card>
        </Col>

        {/* CỘT 2: BẢNG DANH SÁCH TOÀN BỘ TÀI KHOẢN */}
        <Col lg={8} md={12}>
          <Card className="border-0 shadow-lg overflow-hidden" style={{ backgroundColor: '#1e293b', borderRadius: '20px' }}>
            <div className="p-3 bg-dark bg-opacity-20 border-bottom border-secondary">
              <h5 className="mb-0 text-info fw-bold">Danh Sách Tài Khoản Hệ Thống</h5>
            </div>
            
            {loading ? (
              <div className="text-center py-5 text-warning">⏳Đang đọc dữ liệu phân quyền...</div>
            ) : (
              <Table responsive variant="dark" className="mb-0 align-middle text-center">
                <thead>
                  <tr style={{ color: '#94a3b8' }}>
                    <th>Tài Khoản</th>
                    <th>Họ Tên</th>
                    <th>Mật Khẩu</th> 
                    <th>Vai Trò (Role)</th>
                    <th>Ngày Cấp Nick</th>
                    <th>Hành Động</th> {/* 🔥 ĐÃ THÊM: Tiêu đề cột nút xóa */}
                  </tr>
                </thead>
                <tbody>
                  {danhSachUser.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-secondary py-4">Chưa có tài khoản nào được tạo!</td>
                    </tr>
                  ) : (
                    danhSachUser.map(user => (
                      <tr key={user.id} style={{ borderBottom: '1px solid #334155' }}>
                        <td className="fw-bold text-info">{user.taiKhoan}</td>
                        <td>{user.hoTen}</td>
                        <td className="text-warning font-monospace fw-bold">{user.matKhau}</td>
                        <td>
                          <Badge 
                            bg={user.role === 'Admin' ? 'danger' : user.role === 'Security' ? 'warning' : 'success'} 
                            text={user.role === 'Security' ? 'dark' : 'white'}
                            className="px-3 py-2 fw-bold"
                          >
                            {user.role === 'Admin' ? ' Admin' : user.role === 'Security' ? ' Security' : ' User'}
                          </Badge>
                        </td>
                        <td className="text-secondary small">{user.ngayTao || "Ban đầu"}</td>
                        
                        {/* 🔥 THÊM MỚI: Ô nút xóa tài khoản */}
                        <td>
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            className="fw-bold px-2 py-1"
                            style={{ borderRadius: '6px' }}
                            onClick={() => handleXoaTaiKhoan(user)}
                          >
                            Xóa
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default TrangDangKyTong;