// Trang Đăng Ký Tài Khoản Thành Viên Mới Dành Cho Khách Hàng (User)
import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_USERS } from '../constants/api'; // Sếp nhớ check lại đường dẫn import api này cho đúng nhé

function TrangDangKyUser() {
  const navigate = useNavigate();
  
  const [taiKhoan, setTaiKhoan] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [hoTen, setHoTen] = useState("");
  const [cauHoiBaoMat, setCauHoiBaoMat] = useState("Tên con thú cưng đầu tiên của bạn là gì?");
  const [cauTraLoi, setCauTraLoi] = useState("");
  
  const [loi, setLoi] = useState("");
  const [loading, setLoading] = useState(false);
  const [danhSachTaiKhoan, setDanhSachTaiKhoan] = useState([]);

  // Tải danh sách tài khoản hiện tại về để check trùng tài khoản
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(API_USERS);
        setDanhSachTaiKhoan(res.data);
      } catch (error) {
        console.error("Lỗi kết nối dữ liệu:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoi("");

    const tkChuan = taiKhoan.trim();
    const nameChuan = hoTen.trim();
    const tlChuan = cauTraLoi.trim();

    if (!tkChuan || !matKhau || !nameChuan || !tlChuan) {
      setLoi("❌ Vui lòng điền đầy đủ tất cả các trường thông tin!");
      return;
    }

    // Kiểm tra tài khoản đã tồn tại chưa
    const biTrung = danhSachTaiKhoan.some(user => user.taiKhoan.toLowerCase() === tkChuan.toLowerCase());
    if (biTrung) {
      setLoi("❌ Tên tài khoản này đã tồn tại trên hệ thống!");
      return;
    }

    setLoading(true);
    try {
      // Đẩy dữ liệu đăng ký mới lên MockAPI
      await axios.post(API_USERS, {
        taiKhoan: tkChuan,
        matKhau: matKhau,
        hoTen: nameChuan,
        role: "User", // Mặc định tự đăng ký là quyền User
        cauHoiBaoMat: cauHoiBaoMat,
        cauTraLoi: tlChuan,
        ngayTao: new Date().toLocaleString('vi-VN')
      });

      alert(`🎉 Đăng ký tài khoản thành công! Khởi tạo thành viên: ${nameChuan}`);
      // Đăng ký xong tự động đá về trang đăng nhập của User luôn
      navigate('/'); 
    } catch (err) {
      setLoi("❌ Lỗi hệ thống, không thể hoàn tất đăng ký lúc này!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '80vh' }}>
      <Card className="p-4 border-0 shadow-lg text-white" style={{ backgroundColor: '#1e293b', borderRadius: '24px', width: '100%', maxWidth: '550px' }}>
        
        <div className="text-center mb-4">
          <h3 className="fw-black text-info">✨ ĐĂNG KÝ THÀNH VIÊN</h3>
          <p className="text-secondary small">Tạo tài khoản SmartPark để trải nghiệm các dịch vụ bãi đỗ thông minh</p>
        </div>

        <Form onSubmit={handleRegister}>
          {/* Họ và tên */}
          <Form.Group className="mb-3">
            <Form.Label className="text-secondary fw-semibold">Họ và Tên</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="Nhập họ và tên của bạn (Ví dụ: Nguyễn Văn Vũ)"
              value={hoTen}
              onChange={(e) => setHoTen(e.target.value)}
              className="bg-dark text-white border-secondary py-2"
              required
            />
          </Form.Group>

          {/* Tài khoản & Mật khẩu xếp song song cho gọn gàng */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="text-secondary fw-semibold">Tài khoản (Username)</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Tên đăng nhập"
                  value={taiKhoan}
                  onChange={(e) => setTaiKhoan(e.target.value)}
                  className="bg-dark text-white border-secondary py-2"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="text-secondary fw-semibold">Mật khẩu</Form.Label>
                <Form.Control 
                  type="password" 
                  placeholder="Mật khẩu tài khoản"
                  value={matKhau}
                  onChange={(e) => setMatKhau(e.target.value)}
                  className="bg-dark text-white border-secondary py-2"
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <hr className="border-secondary my-4" />

          {/* PHÂN HỆ BẢO MẬT TÀI KHOẢN */}
          <div className="mb-3">
            <h6 className="text-warning fw-bold">🔒 Cấu Hình Khôi Phục Tài Khoản</h6>
            <p className="text-secondary" style={{ fontSize: '0.85rem' }}>Dùng để lấy lại mật khẩu an toàn khi sếp lỡ quên</p>
          </div>

          {/* Chọn câu hỏi bảo mật */}
          <Form.Group className="mb-3">
            <Form.Label className="text-secondary fw-semibold">Chọn Câu Hỏi Bảo Mật</Form.Label>
            <Form.Select 
              value={cauHoiBaoMat}
              onChange={(e) => setCauHoiBaoMat(e.target.value)}
              className="bg-dark text-white border-secondary py-2"
            >
              <option value="Tên con thú cưng đầu tiên của bạn là gì?">Tên con thú cưng đầu tiên của bạn là gì?</option>
              <option value="Trường tiểu học bạn theo học tên là gì?">Trường tiểu học bạn theo học tên là gì?</option>
              <option value="Nơi sinh của bố/mẹ bạn ở tỉnh thành nào?">Nơi sinh của bố/mẹ bạn ở tỉnh thành nào?</option>
              <option value="Món ăn yêu thích nhất của bạn là gì?">Món ăn yêu thích nhất của bạn là gì?</option>
            </Form.Select>
          </Form.Group>

          {/* Câu trả lời bảo mật */}
          <Form.Group className="mb-4">
            <Form.Label className="text-secondary fw-semibold">Câu Trả Lời Của Bạn</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="Nhập câu trả lời bảo mật (Nhớ viết chính xác)"
              value={cauTraLoi}
              onChange={(e) => setCauTraLoi(e.target.value)}
              className="bg-dark text-white border-secondary py-2"
              required
            />
          </Form.Group>

          {loi && <p className="text-danger small mb-3 fw-bold">{loi}</p>}

          {/* Nút bấm xử lý */}
          <Button type="submit" variant="info" className="w-100 fw-bold border-0 py-25 text-dark mb-3" style={{ borderRadius: '12px' }} disabled={loading}>
            {loading ? "⌛ Đang đăng ký thành viên..." : "🚀 Hoàn Tất Đăng Ký Tài Khoản"}
          </Button>

          <div className="text-center">
            <Button variant="link" className="text-secondary small text-decoration-none p-0" onClick={() => navigate('/')}>
              ⬅️ Quay lại đăng nhập
            </Button>
          </div>
        </Form>
      </Card>
    </Container>
  );
}

export default TrangDangKyUser;