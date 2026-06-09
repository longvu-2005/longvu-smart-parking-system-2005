import React, { useState } from 'react'; 
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Container, Navbar, Nav, Button, Badge } from 'react-bootstrap';
import TrangKhachHang from './pages/TrangKhachHang';
import TrangAdmin from './pages/TrangAdmin';
import TrangSecurity from './pages/TrangSecurity';
import TrangLogin from './pages/TrangLogin';
import TrangQuenMatKhau from './pages/TrangQuenMatKhau';
import TrangDangKyUser from './pages/TrangDangKyUser'; 
import TrangHoSo from './pages/TrangHoSo'; 
import Footer from './pages/Footer'; 

// 🚀 CHÚ Ý: Hãy sửa lại dòng này cho đúng với đường dẫn thực tế trên máy bạn
import TrangDangKyTong from './components/Admin/rangDangKyTong'; 

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

function App() {
  // 🔑 Khởi tạo State từ localStorage để giữ trạng thái khi F5
  const [userRole, setUserRole] = useState(() => {
    const savedUser = localStorage.getItem("userHienTai");
    if (savedUser) {
      const userObj = JSON.parse(savedUser);
      return userObj.role ? userObj.role.toUpperCase() : null; 
    }
    return null;
  });

  const handleLogout = () => {
    localStorage.removeItem("userHienTai"); 
    setUserRole(null); 
  };

  // Hàm đồng bộ vai trò khi đăng nhập thành công
  const handleLoginSuccess = (role) => {
    setUserRole(role.toUpperCase());
  };

  return (
    <Router>
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
            <Navbar.Brand href="/" className="fw-black fs-4" style={{ color: '#38bdf8', fontWeight: '900' }}>
              ⚡ SMARTPARK
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0 bg-secondary" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ms-auto gap-2 align-items-center">
                
                {!userRole ? (
                  <>
                    <NavLink 
                      to="/" 
                      className={({ isActive }) => isActive ? "nav-link px-4 py-2 rounded-pill fw-bold text-dark bg-info" : "nav-link px-4 py-2 text-secondary fw-semibold"} 
                      end
                    >
                      🙋‍♂️ Cho Bạn
                    </NavLink>

                    <NavLink 
                      to="/admin" 
                      className={({ isActive }) => isActive ? "nav-link px-4 py-2 rounded-pill fw-bold text-dark bg-warning" : "nav-link px-4 py-2 text-secondary fw-semibold"}
                    >
                      🛠️ Quản Lý
                    </NavLink>

                    <NavLink 
                      to="/security" 
                      className={({ isActive }) => isActive ? "nav-link px-4 py-2 rounded-pill fw-bold text-white bg-danger" : "nav-link px-4 py-2 text-secondary fw-semibold"}
                    >
                      🛡️ An Ninh
                    </NavLink>
                    
                    <Badge bg="secondary" className="px-3 py-2 fw-bold ms-2 text-uppercase">
                      🔒 Chưa Đăng Nhập
                    </Badge>
                  </>
                ) : (
                  <>
                    <NavLink 
                      to="/ho-so" 
                      className={({ isActive }) => isActive ? "nav-link px-4 py-2 rounded-pill fw-bold text-dark bg-light" : "nav-link px-4 py-2 text-secondary fw-semibold"}
                    >
                      👤 Hồ Sơ
                    </NavLink>

                    <Badge bg="light" text="dark" className="px-3 py-2 fw-bold ms-2 me-2">
                      Đang dùng: {userRole}
                    </Badge>

                    <Button variant="outline-danger" size="sm" className="rounded-pill px-3 fw-bold" onClick={handleLogout}>
                      🚪 Thoát
                    </Button>
                  </>
                )}
                
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        {/* HỆ THỐNG ROUTING VÀ PHÂN QUYỀN TRUY CẬP */}
        <div style={{ flexGrow: 1, width: '100%' }}>
          <Routes>
            <Route path="/dang-ky-user" element={<TrangDangKyUser />} />
            <Route path="/quen-mat-khau" element={<TrangQuenMatKhau />} />

            {/* 1. Tuyến đường KHÁCH HÀNG */}
            <Route 
              path="/" 
              element={userRole === 'USER' ? <TrangKhachHang /> : <TrangLogin requiredRole="USER" onLoginSuccess={handleLoginSuccess} />} 
            />

            {/* 2. Tuyến đường ADMIN chính */}
            <Route 
              path="/admin" 
              element={userRole === 'ADMIN' ? <TrangAdmin /> : <TrangLogin requiredRole="ADMIN" onLoginSuccess={handleLoginSuccess} />} 
            />

            {/* 🎯 ĐÃ MỞ LẠI: Tuyến đường Đăng Ký Tổng dành riêng cho ADMIN */}
            <Route 
              path="/admin/dang-ky-tong" 
              element={userRole === 'ADMIN' ? <TrangDangKyTong /> : <Navigate to="/admin" />} 
            />
            
            {/* 3. Tuyến đường AN NINH / BẢO VỆ */}
            <Route 
              path="/security" 
              element={userRole === 'SECURITY' ? <TrangSecurity /> : <TrangLogin requiredRole="SECURITY" onLoginSuccess={handleLoginSuccess} />} 
            /> 

            {/* Tuyến đường Hồ Sơ Cá Nhân */}
            <Route 
              path="/ho-so" 
              element={userRole ? <TrangHoSo /> : <Navigate to="/" />} 
            />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </Router>
  );
}

export default App;