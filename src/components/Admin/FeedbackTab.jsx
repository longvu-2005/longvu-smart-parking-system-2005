import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Badge, Card, InputGroup } from 'react-bootstrap'; 
import axios from 'axios';
import { API_MESSAGES } from '../../constants/api'; 

function FeedbackTab() {
  const [danhSachGopY, setDanhSachGopY] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noiDungPhanHoi, setNoiDungPhanHoi] = useState({});

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_MESSAGES);
      const dataKhieuNai = (res.data || []).filter(item => item.loaiTinNhan === "khieu_nai");
      setDanhSachGopY(dataKhieuNai.reverse());
    } catch (error) {
      console.error("Lỗi lấy danh sách góp ý:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleTextChange = (id, value) => {
    setNoiDungPhanHoi(prev => ({ ...prev, [id]: value }));
  };

  const handleGuiPhanHoi = async (id, gopYCu) => {
    const textTraLoi = noiDungPhanHoi[id]?.trim();
    if (!textTraLoi) return;

    try {
      const payloadCapNhat = {
        ...gopYCu,
        phanHoiAdmin: textTraLoi,
        thoiGianPhanHoi: Date.now(),
        trangThai: "Đã phản hồi"
      };

      await axios.put(`${API_MESSAGES}/${id}`, payloadCapNhat);
      handleTextChange(id, "");
      fetchFeedbacks();
    } catch (error) {
      console.error("Lỗi gửi phản hồi:", error);
      alert("❌ Không gửi được phản hồi!");
    }
  };

  // Hệ thống Style Đồng bộ UI Đêm & Neon Glow 
  const styles = {
    glassCard: {
      background: 'rgba(30, 41, 59, 0.45)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '20px',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
    },
    thStyle: {
      color: '#94a3b8',
      fontWeight: '600',
      textTransform: 'uppercase',
      fontSize: '0.8rem',
      letterSpacing: '0.05em',
      borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
      padding: '16px 12px',
    },
    tdStyle: {
      padding: '20px 12px',
      verticalAlign: 'top',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    },
    badgeSuccess: {
      background: 'rgba(16, 185, 129, 0.15)',
      color: '#10b981',
      border: '1px solid rgba(16, 185, 129, 0.3)',
      textShadow: '0 0 8px rgba(16, 185, 129, 0.3)',
      borderRadius: '6px',
    },
    badgeDanger: {
      background: 'rgba(244, 63, 94, 0.15)',
      color: '#f43f5e',
      border: '1px solid rgba(244, 63, 94, 0.3)',
      textShadow: '0 0 8px rgba(244, 63, 94, 0.3)',
      borderRadius: '6px',
    },
    adminReplyBox: {
      background: 'rgba(16, 185, 129, 0.06)',
      borderLeft: '4px solid #10b981',
      borderRadius: '0 12px 12px 0',
      padding: '12px',
    },
    inputFeedback: {
      background: 'rgba(15, 23, 42, 0.6)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: '#f8fafc',
      borderRadius: '10px 0 0 10px',
      fontSize: '0.9rem',
    },
    btnSubmit: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
      border: 'none',
      borderRadius: '0 10px 10px 0',
      fontWeight: '600',
      fontSize: '0.9rem',
      padding: '0 16px',
    }
  };

  return (
    <Card style={styles.glassCard} className="border-0 p-4 text-white shadow">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold m-0 text-purple" style={{ color: '#c084fc', letterSpacing: '-0.02em' }}>
            📩 Hộp Thư Phản Ánh Chất Lượng
          </h4>
          <p className="text-muted small m-0">Tiếp nhận khiếu nại, đóng góp và hỗ trợ khách hàng theo thời gian thực</p>
        </div>
        <Button 
          variant="outline-light" 
          size="sm" 
          onClick={fetchFeedbacks} 
          disabled={loading}
          className="rounded-3 text-white-50 border-secondary align-self-start align-self-sm-center"
        >
          {loading ? '🔄 Đang làm mới...' : '🔄 Làm mới'}
        </Button>
      </div>

     <div className="table-responsive rounded-3" style={{ background: 'rgba(15, 23, 42, 0.2)' }}>
  <Table variant="dark" className="mb-0 bg-transparent" borderless>
    <thead>
      <tr>
        <th style={{ ...styles.thStyle, width: '15%' }}>🕒 Thời gian</th>
        <th style={{ ...styles.thStyle, width: '35%' }}>💬 Nội dung gửi</th>
        <th style={{ ...styles.thStyle, width: '15%' }}>🏷️ Trạng thái</th>
        <th style={{ ...styles.thStyle, width: '35%' }}>⚡ Phản hồi từ Hệ thống</th>
      </tr>
    </thead>
    <tbody>
      {danhSachGopY.length === 0 ? (
        <tr>
          <td colSpan="4" className="text-center text-muted py-5">
            🍃 Hộp thư trống! Chưa có ý kiến phản ánh nào từ khách hàng.
          </td>
        </tr>
      ) : (
        danhSachGopY.map((item) => {
          const thoiGianGui = item.ngayTao 
            ? new Date(item.ngayTao).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) 
            : 'Không rõ';
          const thoiGianTraLoi = item.thoiGianPhanHoi 
            ? new Date(item.thoiGianPhanHoi).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit' }) 
            : '';

          return (
            <tr key={item.id} className="align-top">
              {/* Cột 1: Thời gian - ĐÃ CHUYỂN SANG MÀU TRẮNG */}
              <td style={styles.tdStyle}>
                {/* Sếp chọn 1 trong 2 kiểu dưới đây nhé: */}
                {/* Kiểu A: Trắng tinh hoàn toàn (text-white) */}
                <span className="text-white small fw-semibold d-block mt-1">{thoiGianGui}</span>
                
                {/* Kiểu B: Trắng mờ nhẹ 50% cho sang (Sếp thích kiểu này thì bỏ comment nhé): 
                <span className="text-white-50 small fw-semibold d-block mt-1">{thoiGianGui}</span> 
                */}
              </td>
              
              {/* Cột 2: Nội dung Khách hàng */}
              <td style={styles.tdStyle}>
                <div className="p-3 rounded-4 text-white-50 position-relative" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.03)', whiteSpace: 'pre-line', fontSize: '0.95rem' }}>
                  {item.noiDung || "Không có nội dung"}
                </div>
              </td>
              
              {/* Cột 3: Trạng thái Badge */}
              <td style={styles.tdStyle}>
                <Badge 
                  style={item.trangThai === "Đã phản hồi" ? styles.badgeSuccess : styles.badgeDanger}
                  className="px-2.5 py-1.5 fw-semibold mt-1"
                >
                  {item.trangThai === "Đã phản hồi" ? "● Đã xử lý" : "◌ Chờ phản hồi"}
                </Badge>
              </td>
              
              {/* Cột 4: Form Phản hồi hoặc Nội dung đã rep */}
              <td style={styles.tdStyle}>
                {item.trangThai === "Đã phản hồi" ? (
                  <div style={styles.adminReplyBox} className="shadow-sm">
                    <small className="text-white d-block fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                      ✓ Đã duyệt phản hồi ({thoiGianTraLoi})
                    </small>
                    <p className="m-0 small text-white-50 lh-base" style={{ fontStyle: 'italic' }}>
                      "{item.phanHoiAdmin}"
                    </p>
                  </div>
                ) : (
                  <InputGroup className="shadow-sm mt-1">
                    <Form.Control
                      type="text"
                      placeholder="Phản hồi nhanh tới User..."
                      value={noiDungPhanHoi[item.id] || ""}
                      onChange={(e) => handleTextChange(item.id, e.target.value)}
                      style={styles.inputFeedback}
                      className="form-control-custom"
                    />
                    <Button 
                      style={styles.btnSubmit}
                      disabled={!noiDungPhanHoi[item.id]?.trim()}
                      onClick={() => handleGuiPhanHoi(item.id, item)}
                    >
                      Gửi
                    </Button>
                  </InputGroup>
                )}
              </td>
            </tr>
          );
        })
      )}
    </tbody>
  </Table>
</div>
    </Card>
  );
}

export default FeedbackTab;