import React, { useState } from 'react'; 
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import TrangKhachHang from './pages/TrangKhachHang';
import TrangAdmin from './pages/TrangAdmin';
import TrangSecurity from './pages/TrangSecurity';
import TrangLogin from './pages/TrangLogin';
import TrangQuenMatKhau from './pages/TrangQuenMatKhau';
import TrangDangKyUser from './pages/TrangDangKyUser'; 

import TrangDangKyTong from './components/Admin/rangDangKyTong';
import Footer from './pages/Footer'; 

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

function App() {
  // 🔑 Khởi tạo State từ localStorage để khi F5 trình duyệt KHWOWNG BỊ mất trạng thái đăng nhập
  const [userRole, setUserRole] = useState(() => {
    const savedUser = localStorage.getItem("userHienTai");
    if (savedUser) {
      const userObj = JSON.parse(savedUser);
      return userObj.role ? userObj.role.toUpperCase() : null; 
    }
    return null;
  });

  const handleLogout = () => {
    localStorage.removeItem("userHienTai"); // Xóa sạch bộ nhớ tạm
    setUserRole(null); // Đưa vai trò về null
  };

  // Hàm đồng bộ vai trò khi đăng nhập thành công
  const handleLoginSuccess = (role) => {
    setUserRole(role.toUpperCase());
  };

  return (
    <Router>
      {/* 🟢 KHỐI CHA: Cấu hình Flexbox tổng lực để quản lý chiều cao màn hình */}
      <div style={{ 
        backgroundColor: '#0f172a', 
        minHeight: '100vh', 
        color: '#f8fafc', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative'
      }}>
        
        {/* NAVBAR */}
        <Navbar expand="lg" className="py-3 mb-4" style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155', zIndex: 10 }}>
          <Container>
            <Navbar.Brand href="/" className="fw-black fs-4" style={{ color: '#38bdf8' }}>
              ⚡ SMARTPARK
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0 bg-secondary" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ms-auto gap-2 align-items-center">
                
                {/* 🚀 ĐÃ CẬP NHẬT: Ẩn/Hiện Menu thông minh dựa vào trạng thái và Vai trò (userRole) */}
                
                {/* 1. Nút "Cho Bạn" - Chỉ hiện khi chưa đăng nhập HOẶC đã đăng nhập đúng quyền USER */}
                {(!userRole || userRole === 'USER') && (
                  <NavLink 
                    to="/" 
                    className={({ isActive }) => isActive ? "nav-link px-4 py-2 rounded-pill fw-bold text-dark bg-info" : "nav-link px-4 py-2 text-secondary fw-semibold"} 
                    end
                  >
                    🙋‍♂️ Cho Bạn
                  </NavLink>
                )}

                {/* 2. Nút "Quản Lý" - Chỉ hiện khi chưa đăng nhập HOẶC đã đăng nhập đúng quyền ADMIN */}
                {(!userRole || userRole === 'ADMIN') && (
                  <NavLink 
                    to="/admin" 
                    className={({ isActive }) => isActive ? "nav-link px-4 py-2 rounded-pill fw-bold text-dark bg-warning" : "nav-link px-4 py-2 text-secondary fw-semibold"}
                  >
                    🛠️ Quản Lý
                  </NavLink>
                )}

                {/* 3. Nút "An Ninh" - Chỉ hiện khi chưa đăng nhập HOẶC đã đăng nhập đúng quyền SECURITY */}
                {(!userRole || userRole === 'SECURITY') && (
                  <NavLink 
                    to="/security" 
                    className={({ isActive }) => isActive ? "nav-link px-4 py-2 rounded-pill fw-bold text-white bg-danger" : "nav-link px-4 py-2 text-secondary fw-semibold"}
                  >
                    🛡️ An Ninh
                  </NavLink>
                )}
                
                {/* Hiển thị Badge vai trò hiện tại và nút Thoát nếu đã login */}
                {userRole && (
                  <>
                    <span className="badge bg-light text-dark px-3 py-2 fw-bold ms-2 me-2">
                      Vai trò: {userRole}
                    </span>
                    <Button variant="outline-danger" size="sm" className="rounded-pill px-3 fw-bold" onClick={handleLogout}>
                      🚪 Thoát
                    </Button>
                  </>
                )}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        {/* HỆ THỐNG ĐIỀU HƯỚNG VÀ BẢO VỆ ROUTE (AUTHORIZATION) */}
        <div style={{ flexGrow: 1, width: '100%' }}>
          <Routes>
            
            {/* Các route công khai */}
            <Route path="/dang-ky-user" element={<TrangDangKyUser />} />
            <Route path="/quen-mat-khau" element={<TrangQuenMatKhau />} />

            {/* 1. TRANG KHÁCH HÀNG: Phải có quyền USER */}
            <Route 
              path="/" 
              element={userRole === 'USER' ? <TrangKhachHang /> : <TrangLogin requiredRole="USER" onLoginSuccess={handleLoginSuccess} />} 
            />

            {/* 2. TRANG ADMIN TỔNG: Phải có quyền ADMIN */}
            <Route 
              path="/admin" 
              element={userRole === 'ADMIN' ? <TrangAdmin /> : <TrangLogin requiredRole="ADMIN" onLoginSuccess={handleLoginSuccess} />} 
            />

            {/* ROUTE MỚI: TRANG ĐĂNG KÝ TỔNG (NẰM TRONG PHÂN HỆ ADMIN) */}
            <Route 
              path="/admin/dang-ky-tong" 
              element={userRole === 'ADMIN' ? <TrangDangKyTong /> : <Navigate to="/admin" />} 
            />
            
            {/* 3. TRANG SECURITY: Phải có quyền SECURITY */}
            <Route 
              path="/security" 
              element={userRole === 'SECURITY' ? <TrangSecurity /> : <TrangLogin requiredRole="SECURITY" onLoginSuccess={handleLoginSuccess} />} 
            /> 

            {/* Tự động chuyển hướng nếu gõ sai URL */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>

        {/* 🟢 FOOTER CHUẨN */}
        <Footer />

      </div>
    </Router>
  );
}

export default App;