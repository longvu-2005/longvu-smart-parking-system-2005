import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; // 👈 Cần import hook này để chuyển sang trang mới
import axios from 'axios';

import { API_USERS } from '../constants/api'; 

function TrangLogin({ requiredRole, onLoginSuccess }) {
  const navigate = useNavigate(); // 👈 Khai báo để dùng hàm điều hướng
  const [taiKhoan, setTaiKhoan] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [loiDangNhap, setLoiDangNhap] = useState("");
  const [danhSachTaiKhoan, setDanhSachTaiKhoan] = useState([]);

  // Fetch danh sách tài khoản từ API để so khớp đăng nhập
  const fetchUsers = async () => {
    try {
      const res = await axios.get(API_USERS);
      setDanhSachTaiKhoan(res.data);
    } catch (error) {
      console.error("Lỗi kết nối dữ liệu tài khoản:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

 const handleLogin = (e) => {
    e.preventDefault();

    const usernameNhap = taiKhoan.trim();
    const passwordNhap = matKhau.trim();

    const SUPER_ADMIN_USER = "Longmaichat";
    const SUPER_ADMIN_PASS = "ongvuac1"; 

    if (
      requiredRole === "ADMIN" && 
      usernameNhap === SUPER_ADMIN_USER && 
      passwordNhap === SUPER_ADMIN_PASS
    ) {
      const superAdminData = {
        id: "super-admin",
        taiKhoan: SUPER_ADMIN_USER,
        hoTen: "Super Admin Hệ Thống",
        role: "ADMIN"
      };
      localStorage.setItem("userHienTai", JSON.stringify(superAdminData));
      onLoginSuccess("ADMIN"); // 🚀 Chỉ cần gọi hàm này, App.jsx sẽ tự lo phần còn lại
      return; 
    }

    const taiKhoanHopLe = danhSachTaiKhoan.find(user => {
      const roleAPI = user.role ? user.role.toUpperCase() : "";
      const roleYeuCau = requiredRole.toUpperCase();
      return (
        user.taiKhoan === usernameNhap && 
        user.matKhau === passwordNhap && 
        roleAPI === roleYeuCau
      );
    });

    if (taiKhoanHopLe) {
      localStorage.setItem("userHienTai", JSON.stringify(taiKhoanHopLe));
      onLoginSuccess(requiredRole.toUpperCase()); // 🚀 Chỉ cần kích hoạt đồng bộ vai trò lên App.jsx
    } else {
      setLoiDangNhap(`❌ Tài khoản không có quyền truy cập vùng ${requiredRole} hoặc sai thông tin!`);
    }
  };
  
  const getRoleBadgeColor = () => {
    if (requiredRole === 'ADMIN') return '#fbbf24'; 
    if (requiredRole === 'SECURITY') return '#f87171'; 
    return '#38bdf8'; 
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
      <Card className="p-4 border-0 shadow-lg" style={{ backgroundColor: '#1e293b', borderRadius: '24px', width: '100%', maxWidth: '450px' }}>
        <div className="text-center mb-4">
          <h3 className="fw-black text-white">YÊU CẦU ĐĂNG NHẬP</h3>
          <p style={{ color: getRoleBadgeColor(), fontSize: '0.95rem' }} className="fw-bold">
            Khu vực giới hạn dành riêng cho: {requiredRole}
          </p>
        </div>

        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3">
            <Form.Label className="text-secondary fw-semibold">Tài khoản</Form.Label>
            <Form.Control 
              type="text" 
              placeholder={requiredRole === "ADMIN" ? "Nhập tài khoản hoặc tài khoản cứu hộ" : "Nhập tên tài khoản"}
              value={taiKhoan}
              onChange={(e) => setTaiKhoan(e.target.value)}
              className="bg-dark text-white border-secondary"
              required
            />
          </Form.Group>

          <Form.Group className="mb-2"> {/* Giảm margin đáy một chút để cân đối với nút Quên mật khẩu */}
            <Form.Label className="text-secondary fw-semibold">Mật khẩu</Form.Label>
            <Form.Control 
              type="password" 
              placeholder="Nhập mật khẩu tương ứng" 
              value={matKhau}
              onChange={(e) => setMatKhau(e.target.value)}
              className="bg-dark text-white border-secondary"
              required
            />
          </Form.Group>

          {/* 🚀 ĐÃ THÊM: Nút Quên mật khẩu nằm gọn gàng ngay dưới ô nhập Mật khẩu */}
          <div className="text-end mb-3">
            <Button 
              type="button"
              variant="link" 
              className="p-0 text-secondary small text-decoration-none fw-semibold"
              style={{ fontSize: '0.85rem', transition: '0.2s' }}
              onClick={() => navigate('/quen-mat-khau')}
              onMouseEnter={(e) => e.target.style.color = '#38bdf8'}
              onMouseLeave={(e) => e.target.style.color = '#64748b'}
            >
              Quên mật khẩu?
            </Button>
          </div>

          {loiDangNhap && <p className="text-danger small mb-3 fw-bold">{loiDangNhap}</p>}

          <Button type="submit" className="w-100 fw-bold border-0 py-2 text-dark" style={{ backgroundColor: getRoleBadgeColor(), borderRadius: '12px' }}>
             Đăng Nhập Vào Phân Hệ
          </Button>

          {/* 🚀 ĐOẠN CHECK CHUẨN: Đứng độc lập dưới nút bấm login, không làm hỏng cấu trúc Form */}
          {requiredRole === "USER" && (
            <div className="text-center mt-3">
              <span className="text-secondary small">Chưa có tài khoản? </span>
              <Button 
                type="button"
                variant="link" 
                className="p-0 text-info small fw-bold text-decoration-none ms-1"
                onClick={() => navigate('/dang-ky-user')} // Bay thẳng sang trang cấu hình thông tin mới
              >
                Đăng ký tài khoản thành viên
              </Button>
            </div>
          )}
        </Form>
      </Card>
    </Container>
  );
}

export default TrangLogin;