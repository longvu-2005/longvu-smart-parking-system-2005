import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_USERS } from '../constants/api'; // Sếp check lại đường dẫn config API nhé

function TrangQuenMatKhau() {
  const navigate = useNavigate();
  const [danhSachTaiKhoan, setDanhSachTaiKhoan] = useState([]);
  
  // Các state quản lý quy trình
  const [taiKhoanNhap, setTaiKhoanNhap] = useState("");
  const [userTimDuoc, setUserTimDuoc] = useState(null);
  const [cauTraLoiNhap, setCauTraLoiNhap] = useState("");
  const [matKhauMoi, setMatKhauMoi] = useState("");
  const [nhapLaiMatKhauMoi, setNhapLaiMatKhauMoi] = useState("");
  
  // Trạng thái màn hình: 1 = Nhập TK, 2 = Trả lời câu hỏi, 3 = Đổi mật khẩu thành công/Form đổi mật khẩu
  const [step, setStep] = useState(1); 
  const [thongBaoLoi, setThongBaoLoi] = useState("");
  const [loading, setLoading] = useState(false);

  // Lấy dữ liệu user về để kiểm tra
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(API_USERS);
        setDanhSachTaiKhoan(res.data);
      } catch (error) {
        console.error("Lỗi lấy danh sách tài khoản:", error);
      }
    };
    fetchUsers();
  }, []);

  // BƯỚC 1: Tìm tài khoản
  const handleCheckUsername = (e) => {
    e.preventDefault();
    setThongBaoLoi("");
    
    const account = danhSachTaiKhoan.find(u => u.taiKhoan.trim().toLowerCase() === taiKhoanNhap.trim().toLowerCase());
    
    if (!account) {
      setThongBaoLoi("❌ Tên tài khoản không tồn tại trên hệ thống!");
      return;
    }
    
    if (!account.cauHoiBaoMat) {
      setThongBaoLoi("❌ Tài khoản này chưa cấu hình câu hỏi bảo mật! Không thể tự khôi phục.");
      return;
    }

    setUserTimDuoc(account);
    setStep(2); // Chuyển sang bước trả lời câu hỏi
  };

  // BƯỚC 2: Kiểm tra câu trả lời câu hỏi bảo mật
  const handleCheckAnswer = (e) => {
    e.preventDefault();
    setThongBaoLoi("");

    const answerGoc = userTimDuoc.cauTraLoi ? userTimDuoc.cauTraLoi.trim().toLowerCase() : "";
    const answerNhap = cauTraLoiNhap.trim().toLowerCase();

    if (answerNhap !== answerGoc) {
      setThongBaoLoi("❌ Câu trả lời bảo mật không chính xác! Vui lòng thử lại.");
      return;
    }

    setStep(3); // Khớp rồi thì cho qua bước đổi mật khẩu
  };

  // BƯỚC 3: Tiến hành cập nhật mật khẩu mới lên API mockup / DB
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setThongBaoLoi("");

    if (matKhauMoi.length < 3) {
      setThongBaoLoi("❌ Mật khẩu mới phải từ 3 ký tự trở lên!");
      return;
    }

    if (matKhauMoi !== nhapLaiMatKhauMoi) {
      setThongBaoLoi("❌ Mật khẩu nhập lại không trùng khớp!");
      return;
    }

    setLoading(true);
    try {
      // Gửi lệnh PUT/PATCH để cập nhật riêng trường mật khẩu của ID user đó
      await axios.put(`${API_USERS}/${userTimDuoc.id}`, {
        ...userTimDuoc, // Giữ nguyên toàn bộ thông tin cũ (hoTen, role, cauHoiBaoMat...)
        matKhau: matKhauMoi // Ghi đè mật khẩu mới vào đây
      });

      alert("🎉 Đổi mật khẩu thành công! Bạn sẽ được chuyển về trang đăng nhập.");
      navigate('/'); // Đá về trang chủ/login
    } catch (error) {
      setThongBaoLoi("❌ Lỗi hệ thống! Không thể đổi mật khẩu lúc này.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
      <Card className="p-4 border-0 shadow-lg text-white" style={{ backgroundColor: '#1e293b', borderRadius: '24px', width: '100%', maxWidth: '450px' }}>
        <div className="text-center mb-4">
          <h3 className="fw-black text-info">KHÔI PHỤC MẬT KHẨU</h3>
          <p className="text-secondary small">Hệ thống xác thực đỗ xe thông minh SmartPark</p>
        </div>

        {thongBaoLoi && <p className="text-danger small fw-bold mb-3 text-center">{thongBaoLoi}</p>}

        {/* ----------------- BƯỚC 1: NHẬP TÊN TÀI KHOẢN ----------------- */}
        {step === 1 && (
          <Form onSubmit={handleCheckUsername}>
            <Form.Group className="mb-4">
              <Form.Label className="text-secondary fw-semibold">Nhập tên tài khoản của bạn</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Ví dụ: long, user123..." 
                value={taiKhoanNhap}
                onChange={(e) => setTaiKhoanNhap(e.target.value)}
                className="bg-dark text-white border-secondary"
                required
              />
            </Form.Group>
            <Button type="submit" variant="info" className="w-100 fw-bold py-2 text-dark" style={{ borderRadius: '12px' }}>
              Kiểm Tra Tài Khoản
            </Button>
          </Form>
        )}

        {/* ----------------- BƯỚC 2: TRẢ LỜI CÂU HỎI BẢO MẬT ----------------- */}
        {step === 2 && (
          <Form onSubmit={handleCheckAnswer}>
            <div className="p-3 mb-3 border border-secondary rounded bg-dark">
              <span className="text-info small fw-bold">Câu hỏi bảo mật của sếp:</span>
              <p className="mb-0 mt-1 text-white fw-bold">{userTimDuoc?.cauHoiBaoMat}</p>
            </div>

            <Form.Group className="mb-4">
              <Form.Label className="text-secondary fw-semibold">Câu trả lời của bạn</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Nhập câu trả lời đã cài đặt" 
                value={cauTraLoiNhap}
                onChange={(e) => setCauTraLoiNhap(e.target.value)}
                className="bg-dark text-white border-secondary"
                required
              />
            </Form.Group>

            <div className="d-flex gap-2">
              <Button variant="secondary" className="w-50 fw-bold" onClick={() => setStep(1)} style={{ borderRadius: '12px' }}>
                Quay lại
              </Button>
              <Button type="submit" variant="warning" className="w-50 fw-bold text-dark" style={{ borderRadius: '12px' }}>
                Xác Thực
              </Button>
            </div>
          </Form>
        )}

        {/* ----------------- BƯỚC 3: NHẬP MẬT KHẨU MỚI ----------------- */}
        {step === 3 && (
          <Form onSubmit={handleResetPassword}>
            <Form.Group className="mb-3">
              <Form.Label className="text-secondary fw-semibold">Mật khẩu mới</Form.Label>
              <Form.Control 
                type="password" 
                placeholder="Nhập mật khẩu mới" 
                value={matKhauMoi}
                onChange={(e) => setMatKhauMoi(e.target.value)}
                className="bg-dark text-white border-secondary"
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="text-secondary fw-semibold">Nhập lại mật khẩu mới</Form.Label>
              <Form.Control 
                type="password" 
                placeholder="Xác nhận lại mật khẩu mới" 
                value={nhapLaiMatKhauMoi}
                onChange={(e) => setNhapLaiMatKhauMoi(e.target.value)}
                className="bg-dark text-white border-secondary"
                required
              />
            </Form.Group>

            <Button type="submit" variant="success" className="w-100 fw-bold py-2 text-white" style={{ borderRadius: '12px' }} disabled={loading}>
              {loading ? "Đang cập nhật..." : "Xác Nhận Đổi Mật Khẩu"}
            </Button>
          </Form>
        )}

        <div className="text-center mt-4">
          <Button variant="link" className="text-secondary small text-decoration-none p-0" onClick={() => navigate('/')}>
            ← Quay lại đăng nhập
          </Button>
        </div>
      </Card>
    </Container>
  );
}

export default TrangQuenMatKhau;