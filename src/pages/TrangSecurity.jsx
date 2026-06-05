import React, { useState, useEffect } from 'react';
import { Container, Button, Row, Col, Card } from 'react-bootstrap';
import axios from 'axios'; 

// 🔑 IMPORT ĐẦY ĐỦ CẢ 3 ENDPOINT CỦA SẾP
import { API_VEHICLES, API_LOTS, API_LOTSS } from '../constants/api'; 
import { layXeDangInBai } from '../utils/securityHelpers'; 
import VehicleTable from '../components/Security/VehicleTable';
import ModalCheckIn from '../components/Security/ModalCheckIn';

function TrangSecurity() {
  const [danhSachXe, setDanhSachXe] = useState([]);
  const [danhSachBai, setDanhSachBai] = useState([]);
  const [danhSachSlotsOnline, setDanhSachSlotsOnline] = useState([]); // 👈 THÊM: Lưu data đặt chỗ từ API_LOTSS
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // 💰 BẢNG GIÁ ĐỒNG BỘ THỜI GIAN THỰC TỪ ADMIN
  const [bangGiaAdmin, setBangGiaAdmin] = useState({ "Ô tô": 20000, "Xe máy": 5000, "Xe tải": 50000 });

  // TRẠNG THÁI FORM CHECK-IN
  const [bienSo, setBienSo] = useState("");
  const [loaiXe, setLoaiXe] = useState("Ô tô"); 
  const [coSoChon, setCoSoChon] = useState("Cơ sở 1 (HOLA)"); 
  const [viTri, setViTri] = useState("");
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLoaiXe, setFilterLoaiXe] = useState("Tất cả");

  // 🔄 HÀM TẢI DỮ LIỆU ĐỒNG BỘ TỪ CẢ 3 BẢNG API
  const fetchData = async () => {
    setBangGiaAdmin({
      "Ô tô": Number(localStorage.getItem('giaOTo')) || 20000,
      "Xe máy": Number(localStorage.getItem('giaXeMay')) || 5000,
      "Xe tải": Number(localStorage.getItem('giaXeTai')) || 50000
    });

    setLoading(true);
    try {
      // Kéo đồng thời cả Xe, Hạ tầng gốc, và Danh sách Slots đặt online
      const [resXe, resBai, resSlots] = await Promise.all([
        axios.get(API_VEHICLES),
        axios.get(API_LOTS),
        axios.get(API_LOTSS) 
      ]);
      setDanhSachXe(resXe.data || []);
      setDanhSachBai(resBai.data || []);
      setDanhSachSlotsOnline(resSlots.data || []); // Cập nhật danh sách đặt chỗ thực tế
    } catch (error) {
      console.error("Lỗi đồng bộ tích hợp hệ thống phía bảo vệ:", error);
    } finally {
      setLoading(false);
    }
  };

  // Vòng đời lắng nghe cập nhật chu kỳ thực 30s
  useEffect(() => {
    fetchData();
    window.addEventListener('storage', fetchData);
    
    const interval = setInterval(fetchData, 30000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', fetchData);
    };
  }, []);

  // 🛠️ KHÓA BARRIER: Tự động tìm vị trí trống THỰC SỰ (Loại bỏ ô có tên trong danh sách slots online)
  useEffect(() => {
    const oTrongThucSu = danhSachBai.filter(b => {
      const khopCoSo = b.coSo === coSoChon;
      const thucTeTrong = b.trangThai === "Trống";
      // Kiểm tra xem ô này có đang bị ai đặt trên mạng không
      const biDatOnline = danhSachSlotsOnline.some(s => s.tenBai?.trim().toUpperCase() === b.tenBai?.trim().toUpperCase());
      
      return khopCoSo && thucTeTrong && !biDatOnline;
    });
    setViTri(oTrongThucSu.length > 0 ? oTrongThucSu[0].tenBai : "");
  }, [coSoChon, danhSachBai, danhSachSlotsOnline]);

  // Bộ lọc tìm kiếm xe thực tế trong bãi
  const xeDangHienThi = layXeDangInBai(danhSachXe).filter(xe => {
    const bienSoChuanHoa = xe.bienSo ? xe.bienSo.replace(/[-.\s]/g, "").toUpperCase() : "";
    const tuKhoaChuanHoa = searchTerm.replace(/[-.\s]/g, "").toUpperCase();
    const khopBienSo = bienSoChuanHoa.includes(tuKhoaChuanHoa);
    const khopLoaiXe = filterLoaiXe === "Tất cả" || (xe.loaiXe && xe.loaiXe.toUpperCase().includes(filterLoaiXe.toUpperCase()));
    return khopBienSo && khopLoaiXe;
  });

  // 🛠️ LỌC DANH SÁCH Ô TRỐNG SẠCH ĐỂ ĐƯA VÀO SELECT BOX (Không hiện ô đã đặt online)
  const oTrongThucSuTheoCoSo = danhSachBai.filter(b => {
    const khopCoSo = b.coSo === coSoChon;
    const thucTeTrong = b.trangThai === "Trống";
    const biDatOnline = danhSachSlotsOnline.some(s => s.tenBai?.trim().toUpperCase() === b.tenBai?.trim().toUpperCase());
    
    return khopCoSo && thucTeTrong && !biDatOnline;
  });

  const handleOpenAdd = () => {
    setBienSo("");
    setLoaiXe("Ô tô");
    setErrors({});
    setShowModal(true);
  };

  // Xử lý Check-in xe vãng lai tại cổng barrier
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bienSo.trim()) {
      setErrors({ bienSo: "Biển số không được để trống" });
      return;
    }
    if (!viTri) {
      alert("Hết vị trí trống khả dụng cho xe vãng lai rồi sếp ơi!");
      return;
    }

    try {
      await axios.post(API_VEHICLES, {
        bienSo: bienSo.trim().toUpperCase(),
        loaiXe,
        coSo: coSoChon,
        viTri,
        thoiGianVao: new Date().toLocaleString('vi-VN'),
        trangThai: "Đang trong bãi"
      });

      // Cập nhật trạng thái ô đỗ trong bãi thành Đầy
      const oChon = danhSachBai.find(b => b.coSo === coSoChon && b.tenBai === viTri);
      if (oChon) {
        await axios.put(`${API_LOTS}/${oChon.id}`, {
          ...oChon,
          trangThai: "Đầy"
        });
      }

      await fetchData();
      setShowModal(false);
    } catch (err) {
      alert("Lỗi khi check-in xe mới!");
    }
  };

  // Xử lý cho xe xuất bãi hoàn trả hạ tầng (Đồng thời giải phóng nếu trùng slot online)
  const handleChoXeRa = async (xe) => {
    if (!window.confirm(`Xác nhận cho xe ${xe.bienSo} xuất bãi?`)) return;
    try {
      await axios.put(`${API_VEHICLES}/${xe.id}`, {
        ...xe,
        thoiGianRa: new Date().toLocaleString('vi-VN'),
        trangThai: "Đã xuất bãi"
      });

      // Cập nhật bảng bãi xe gốc về Trống
      const oMoLai = danhSachBai.find(b => b.coSo === xe.coSo && b.tenBai === xe.viTri);
      if (oMoLai) {
        await axios.put(`${API_LOTS}/${oMoLai.id}`, {
          ...oMoLai,
          trangThai: "Trống"
        });
      }

      // 🛠️ Nếu xe này chính là xe đã đặt chỗ online trước đó, xóa luôn bản ghi ở API_LOTSS để giải phóng grid khách hàng
      const slotOnlineTrung = danhSachSlotsOnline.find(s => s.bienSo?.trim().toUpperCase() === xe.bienSo?.trim().toUpperCase());
      if (slotOnlineTrung) {
        await axios.delete(`${API_LOTSS}/${slotOnlineTrung.id}`);
      }

      await fetchData();
    } catch (err) {
      alert("Lỗi xuất bãi!");
    }
  };

  return (
    <Container className="pb-5" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif", color: '#e2e8f0' }}>
      
      {/* HEADER SECTION - HIỆN ĐẠI CYBERPUNK */}
      <div className="text-center my-5 relative">
        <h2 className="fw-black tracking-tight" style={{ 
          fontSize: '2.2rem', 
          fontWeight: '900', 
          background: 'linear-gradient(to right, #38bdf8, #818cf8, #c084fc)', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent',
          textTransform: 'uppercase'
        }}>
          🛡️ SMARTPARK SECURITY GATE
        </h2>
        
      </div>

      <Row className="g-4 mb-4 align-items-stretch">
        {/* BIỂU PHÍ ĐỒNG BỘ - GLASSMORPHISM CARD */}
        <Col lg={7} md={12}>
          <Card className="h-100 border-0 p-4" style={{ 
            backgroundColor: '#0f172a', 
            borderRadius: '24px', 
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
          }}>
            <h6 className="fw-bold mb-3" style={{ color: '#38bdf8', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
               Biểu phí gửi xe trực tuyến (Đồng bộ từ Admin)
            </h6>
            <Row className="g-3 text-center">
              <Col xs={4}>
                <div className="p-3 rounded-4" style={{ backgroundColor: 'rgba(56, 189, 248, 0.06)', border: '1px solid rgba(56, 189, 248, 0.15)' }}>
                  <small className="d-block fw-bold mb-1" style={{ color: '#38bdf8', fontSize: '0.7rem' }}>🚗 Ô TÔ</small>
                  <span className="fw-extrabold text-white fs-5">{bangGiaAdmin["Ô tô"].toLocaleString()}đ<small style={{fontSize: '11px', color: '#94a3b8'}}> /h</small></span>
                </div>
              </Col>
              <Col xs={4}>
                <div className="p-3 rounded-4" style={{ backgroundColor: 'rgba(251, 191, 36, 0.06)', border: '1px solid rgba(251, 191, 36, 0.15)' }}>
                  <small className="d-block fw-bold mb-1" style={{ color: '#fbbf24', fontSize: '0.7rem' }}>🏍️ XE MÁY</small>
                  <span className="fw-extrabold text-warning fs-5">{bangGiaAdmin["Xe máy"].toLocaleString()}đ<small style={{fontSize: '11px', color: '#94a3b8'}}> /h</small></span>
                </div>
              </Col>
              <Col xs={4}>
                <div className="p-3 rounded-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                  <small className="d-block fw-bold mb-1" style={{ color: '#ef4444', fontSize: '0.7rem' }}>🚚 XE TẢI</small>
                  <span className="fw-extrabold style-danger fs-5" style={{ color: '#f87171' }}>{bangGiaAdmin["Xe tải"].toLocaleString()}đ<small style={{fontSize: '11px', color: '#94a3b8'}}> /h</small></span>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* BUTTON ACTION - KHU VỰC ĐIỀU KHIỂN GATE */}
        <Col lg={5} md={12} className="d-flex flex-column justify-content-center">
          <Button 
            onClick={handleOpenAdd} 
            className="w-100 h-100 border-0 fw-bold d-flex align-items-center justify-content-center gap-2" 
            style={{ 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '24px',
              fontSize: '1.1rem',
              boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.3s ease',
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <span style={{ fontSize: '1.4rem' }}>➕</span> TIẾP NHẬN XE VÀO BÃI
          </Button>
        </Col>
      </Row>

      {/* 📅 DANH SÁCH XE ĐÃ ĐẶT CHỖ ONLINE - BIẾN THÀNH COCKPIT LIVE STREAM */}
      <div className="mb-5 p-4 rounded-4 shadow-sm border-0" style={{ 
        backgroundColor: '#0f172a', 
        borderLeft: '4px solid #fbbf24',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
      }}>
        <div className="d-flex align-items-center gap-2 mb-3">
          <span className="position-relative d-flex h-3 w-3" style={{ height: '10px', width: '10px' }}>
            <span className="animate-ping position-absolute inline-flex h-100 w-100 rounded-circle bg-warning opacity-75" style={{ animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }}></span>
            <span className="relative inline-flex rounded-circle bg-warning" style={{ height: '10px', width: '10px' }}></span>
          </span>
          <h6 className="text-warning fw-bold mb-0" style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>
            DANH SÁCH ĐẶT CHỖ ONLINE (LIVE STREAM APP KHÁCH HÀNG)
          </h6>
        </div>
        
        {danhSachSlotsOnline.length > 0 ? (
          <div className="d-flex gap-2 flex-wrap">
            {danhSachSlotsOnline.map((slot, idx) => (
              <div 
                key={slot.id || idx} 
                className="px-3 py-2 rounded-3 d-flex align-items-center gap-2 shadow-sm"
                style={{ 
                  backgroundColor: 'rgba(251, 191, 36, 0.08)', 
                  border: '1px solid rgba(251, 191, 36, 0.2)',
                  fontSize: '0.85rem'
                }}
              >
                <span style={{color: '#fbbf24'}}>🚗</span>
                <span className="fw-bold text-white">{slot.bienSo || "Ẩn Biển Số"}</span>
                <span style={{color: '#64748b'}}>|</span>
                <span className="text-secondary">Vị trí: <strong style={{ color: '#f87171' }}>{slot.tenBai}</strong></span>
                <span className="badge bg-dark text-warning border border-warning-subtle py-1 px-2" style={{fontSize: '10px'}}>{slot.coSo || "Cơ sở 1"}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-muted fst-italic small d-flex align-items-center gap-2">
         
          </div>
        )}
      </div>

      {/* DANH SÁCH QUẢN LÝ XE THỰC TẾ TRONG BÃI */}
      <div className="p-1 rounded-4" style={{ 
        backgroundColor: '#0f172a',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
      }}>
        {loading ? (
          <div className="text-center my-5 p-5 text-muted">
            <div className="spinner-border text-info mb-3" role="status"></div>
            <div className="small tracking-wider" style={{textTransform: 'uppercase'}}>⏳ Đang đồng bộ dữ liệu hạ tầng bãi xe...</div>
          </div>
        ) : (
          <VehicleTable 
            xeDangHienThi={xeDangHienThi} 
            handleChoXeRa={handleChoXeRa}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterLoaiXe={filterLoaiXe}
            setFilterLoaiXe={setFilterLoaiXe}
          />
        )}
      </div>

      {/* MODAL CHECK-IN ĐÃ ĐƯỢC LỌC KHÓA BẢO VỆ KHÔNG CHO CHỌN ĐÈ */}
      <ModalCheckIn
        show={showModal}
        onHide={() => setShowModal(false)}
        handleSubmit={handleSubmit}
        bienSo={bienSo} setBienSo={setBienSo}
        loaiXe={loaiXe} setLoaiXe={setLoaiXe}
        coSoChon={coSoChon} setCoSoChon={setCoSoChon}
        viTri={viTri} setViTri={setViTri}
        oTrongTheoCoSo={oTrongThucSuTheoCoSo} 
        errors={errors}
      />

      {/* CSS Animation Đèn Nháy Live Stream */}
      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </Container>
  );
}

export default TrangSecurity;