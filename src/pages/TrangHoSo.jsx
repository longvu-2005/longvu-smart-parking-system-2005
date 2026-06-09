import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; // 👈 1. THÊM DÒNG NÀY
import { API_USERS } from '../constants/api';

function TrangHoSo() {
  const navigate = useNavigate(); // 👈 2. KHỞI TẠO NAVIGATE
  
  // Các state cũ giữ nguyên...
  const [profile, setProfile] = useState({
    taiKhoan: '',
    matKhau: '',
    role: '',
    hoTen: '',
    cauHoiBaoMat: '',
    ngayTao: ''
  });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Luồng check user và fetch API cũ của bạn giữ nguyên vẹn...
    const savedUser = localStorage.getItem("userHienTai");
    if (!savedUser) {
      alert("Không tìm thấy thông tin đăng nhập! Vui lòng quay lại trang đăng nhập.");
      setLoading(false);
      return;
    }

    const userObj = JSON.parse(savedUser);
    const id = userObj.id || userObj._id || userObj.ID; 
    setUserId(id);

    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_USERS}/${id}`);
        const data = await response.json();
        if (response.ok) {
          setProfile(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      if (id === "super-admin") {
        setProfile({
          taiKhoan: userObj.taiKhoan,
          matKhau: "********",
          role: "ADMIN",
          hoTen: userObj.hoTen,
          cauHoiBaoMat: "Không áp dụng cho tài khoản cứu hộ",
          ngayTao: "Hệ thống"
        });
        setLoading(false);
      } else {
        fetchProfile();
      }
    } else {
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleLuuThongTin = async (e) => {
    e.preventDefault();
    if (!userId) return;
    if (userId === "super-admin") return alert("Tài khoản cứu hộ không thể sửa đổi!");

    try {
      const response = await fetch(`${API_USERS}/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });

      if (response.ok) {
        const savedUser = localStorage.getItem("userHienTai");
        if (savedUser) {
          const userObj = JSON.parse(savedUser);
          localStorage.setItem("userHienTai", JSON.stringify({ ...userObj, ...profile }));
        }
        alert(" Cập nhật hồ sơ thành công!");
        
        // 💾 Tự động điều hướng user về trang chính sau khi lưu thành công
        handleQuayLai();
      } else {
        alert("Cập nhật thất bại!");
      }
    } catch (error) {
      alert("Lỗi kết nối!");
    }
  };

  // ➡️ 3. HÀM XỬ LÝ QUAY LẠI THÔNG MINH THEO VAI TRÒ
  const handleQuayLai = () => {
    const roleHienTai = String(profile.role || '').toUpperCase();
    if (roleHienTai === 'ADMIN') {
      navigate('/admin');
       // Nếu là Admin thì back về trang quản trị
    }
    if(roleHienTai === 'SECURITY') {
      navigate('/security');
        // Nếu là Bảo vệ thì back về trang bảo vệ
      }
    else {
      navigate('/'); // Nếu là khách hàng thì back về trang chủ bãi xe
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="info" />
        <p className="text-white mt-2">Đang tải hồ sơ từ hệ thống...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4" style={{ maxWidth: '800px' }}>
      
      {/* 4. THAY ĐỔI TIÊU ĐỀ: Tích hợp nút Back đồng bộ layout */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h2 className="text-white mb-0">Hồ Sơ Cá Nhân</h2>
        
        <Button 
          variant="outline-light" 
          className="fw-bold rounded-pill px-3 shadow-sm d-flex align-items-center gap-2"
          onClick={handleQuayLai}
          style={{ border: '1px solid rgba(255, 255, 255, 0.3)' }}
        >
          Quay Lại
        </Button>
      </div>

      <Card className="border-0 shadow-lg" style={{ backgroundColor: '#1e293b', borderRadius: '20px' }}>
        <Card.Body className="p-4 text-white">
          <Form onSubmit={handleLuuThongTin}>
            {/* Toàn bộ ruột các ô input form của bạn giữ nguyên vẹn ở đây... */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-secondary fw-semibold">Họ và Tên</Form.Label>
                  <Form.Control type="text" name="hoTen" value={profile.hoTen || ''} onChange={handleChange} style={{ backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '10px' }} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-secondary fw-semibold">Tài Khoản (Username)</Form.Label>
                  <Form.Control type="text" name="taiKhoan" value={profile.taiKhoan || ''} readOnly style={{ backgroundColor: '#1e293b', color: '#94a3b8', border: '1px solid #334155', borderRadius: '10px', cursor: 'not-allowed' }} />
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-secondary fw-semibold">Câu Hỏi Bảo Mật</Form.Label>
                  <Form.Control type="text" name="cauHoiBaoMat" value={profile.cauHoiBaoMat || ''} onChange={handleChange} style={{ backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '10px' }} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-secondary fw-semibold">Mật Khẩu</Form.Label>
                  <Form.Control type="password" name="matKhau" value={profile.matKhau || ''} onChange={handleChange} disabled={userId === "super-admin"} style={{ backgroundColor: userId === "super-admin" ? '#1e293b' : '#0f172a', color: userId === "super-admin" ? '#94a3b8' : '#fff', border: '1px solid #334155', borderRadius: '10px' }} required />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-secondary fw-semibold">Vai Trò Hệ Thống (Role)</Form.Label>
                  <Form.Control type="text" name="role" value={profile.role || ''} readOnly style={{ backgroundColor: '#1e293b', color: '#94a3b8', border: '1px solid #334155', borderRadius: '10px', cursor: 'not-allowed' }} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-secondary fw-semibold">Ngày Tạo Tài Khoản</Form.Label>
                  <Form.Control type="text" name="ngayTao" value={profile.ngayTao || ''} readOnly style={{ backgroundColor: '#1e293b', color: '#94a3b8', border: '1px solid #334155', borderRadius: '10px', cursor: 'not-allowed' }} />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end">
              <Button variant="info" type="submit" className="fw-bold rounded-pill px-4 text-dark">
                💾 Lưu Thay Đổi
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default TrangHoSo;