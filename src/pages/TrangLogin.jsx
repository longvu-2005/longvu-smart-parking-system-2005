import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button } from 'react-bootstrap';
import axios from 'axios';

import { API_USERS } from '../constants/api'; 

function TrangLogin({ requiredRole, onLoginSuccess }) {
  const [taiKhoan, setTaiKhoan] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [loiDangNhap, setLoiDangNhap] = useState("");
  const [danhSachTaiKhoan, setDanhSachTaiKhoan] = useState([]);

  // Fetch danh sách tài khoản từ API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(API_USERS);
        setDanhSachTaiKhoan(res.data);
      } catch (error) {
        console.error("Lỗi kết nối dữ liệu tài khoản:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();

    const usernameNhap = taiKhoan.trim();
    const passwordNhap = matKhau.trim();

    // 1. TÀI KHOẢN ADMIN CHÍNH (Cứu cánh khi mất dữ liệu hệ thống)

    const SUPER_ADMIN_USER = "Longmaichat";
    const SUPER_ADMIN_PASS = "ongvuac1"; 

    if (
      requiredRole === "ADMIN" && 
      usernameNhap === SUPER_ADMIN_USER && 
      passwordNhap === SUPER_ADMIN_PASS
    ) {
      onLoginSuccess("ADMIN");
      return; // Khớp tài khoản tối cao thì cho vào luôn, dừng hàm xử lý bên dưới
    }

    // 2. Nếu không phải Super Admin -> Tiến hành so khớp với dữ liệu từ API của sếp
    const taiKhoanHopLe = danhSachTaiKhoan.find(user => {
      // Chuẩn hóa role về chữ viết thường để so sánh không sợ lệch chữ Hoa - Thường (Admin vs ADMIN)
      const roleAPI = user.role ? user.role.toUpperCase() : "";
      const roleYeuCau = requiredRole.toUpperCase();

      return (
        user.taiKhoan === usernameNhap && 
        user.matKhau === passwordNhap && 
        roleAPI === roleYeuCau
      );
    });

    if (taiKhoanHopLe) {
      // Đồng bộ trả về đúng định dạng role viết hoa để khớp với logic App.jsx của sếp
      onLoginSuccess(requiredRole.toUpperCase()); 
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

          <Form.Group className="mb-4">
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

          {loiDangNhap && <p className="text-danger small mb-3 fw-bold">{loiDangNhap}</p>}

          <Button type="submit" className="w-100 fw-bold border-0 py-2 text-dark" style={{ backgroundColor: getRoleBadgeColor(), borderRadius: '12px' }}>
             Đăng Nhập Vào Phân Hệ
          </Button>
        </Form>
      </Card>
    </Container>
  );
}

export default TrangLogin;