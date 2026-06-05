import React, { useState } from 'react'; // Giữ nguyên việc xóa useEffect thừa để sạch WARNING
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
  // 🔑 Khởi tạo State từ localStorage để khi F5 trình duyệt KHÔNG BỊ mất trạng thái đăng nhập
  const [userRole, setUserRole] = useState(() => {
    const savedUser = localStorage.getItem("userHienTai");
    if (savedUser) {
      const userObj = JSON.parse(savedUser);
      return userObj.role ? userObj.role.toUpperCase() : null; // Chuyển 'Admin' -> 'ADMIN' cho khớp logic bên dưới
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
                <NavLink to="/" className={({ isActive }) => isActive ? "nav-link px-4 py-2 rounded-pill fw-bold text-dark bg-info" : "nav-link px-4 py-2 text-secondary fw-semibold"} end>
                  🙋‍♂️ Cho Bạn
                </NavLink>
                <NavLink to="/admin" className={({ isActive }) => isActive ? "nav-link px-4 py-2 rounded-pill fw-bold text-dark bg-warning" : "nav-link px-4 py-2 text-secondary fw-semibold"}>
                  🛠️ Quản Lý
                </NavLink>
                <NavLink to="/security" className={({ isActive }) => isActive ? "nav-link px-4 py-2 rounded-pill fw-bold text-white bg-danger" : "nav-link px-4 py-2 text-secondary fw-semibold"}>
                  🛡️ An Ninh
                </NavLink>
                
                {/* Hiển thị Badge vai trò hiện tại và nút Thoát nếu đã login */}
                {userRole && (
                  <>
                    <span className="badge bg-light text-dark px-3 py-2 fw-bold me-2">
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
            
            {/* 🚀 Các route công khai (Ai cũng vào được) */}
            <Route path="/dang-ky-user" element={<TrangDangKyUser />} />
            
            {/* 🟢 ĐÃ SỬA: Bốc thẻ này từ dòng 39 quăng vào đây nằm gọn gàng trong <Routes> */}
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

            {/* Tự động chuyển hướng nếu gõ sai URL - Phải luôn ở đáy cùng */}
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