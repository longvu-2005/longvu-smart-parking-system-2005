import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Form, Button, Row, Col, Modal, Alert, Badge, Accordion } from 'react-bootstrap';
import axios from 'axios';

// 🔑 Khai báo hệ thống Endpoint từ file hằng số của sếp
import { API_LOTS, API_LOTSS, API_MESSAGES } from '../constants/api'; 

function TrangKhachHang() {
  const [cauTrucHaTang, setCauTrucHaTang] = useState({}); 
  
  // Trạng thái menu phân khu đang chọn
  const [coSoDangChon, setCoSoDangChon] = useState("");
  const [khuDangChon, setKhuDangChon] = useState("");

  // Popup đặt chỗ
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null); 
  const [bienSoDat, setBienSoDat] = useState("");
  const [currentBooking, setCurrentBooking] = useState(null);

  // 💰 BẢNG GIÁ XE ĐỘNG ĐỒNG BỘ THỜI GIAN THỰC TỪ ADMIN KHÔNG LỖI EXPORT
  const [bangGiaAdmin, setBangGiaAdmin] = useState({ "Ô tô": 20000, "Xe máy": 5000, "Xe tải": 50000 });

  // 📝 TRẠNG THÁI 2 FORM PHẢN ÁNH RIÊNG BIỆT
  const [loaiXeBaoVe, setLoaiXeBaoVe] = useState("");
  const [noiDungBaoVe, setNoiDungBaoVe] = useState("");
  const [guiBaoVeThanhCong, setGuiBaoVeThanhCong] = useState(false);

  const [noiDungAdmin, setNoiDungAdmin] = useState("");
  const [guiAdminThanhCong, setGuiAdminThanhCong] = useState(false);

  // Trạng thái lưu danh sách phản hồi từ hệ thống trả về cho User xem
  const [danhSachPhanHoiAdmin, setDanhSachPhanHoiAdmin] = useState([]);
  const [danhSachPhanHoiBaoVe, setDanhSachPhanHoiBaoVe] = useState([]); // Thêm trạng thái nhận của Bảo Vệ

  // --- ⏱️ HÀM KIỂM TRA VÀ TỰ ĐỘNG XÓA YÊU CẦU ĐẶT TRƯỚC QUÁ 30 PHÚT ---
  const kiemTraVaXoaSlotHetHan = useCallback(async (danhSachSlots) => {
    const thoiGianHienTai = Date.now(); 
    const BAO_NHIEU_PHUT = 30;
    const THOI_GIAN_CHO_PHEP = BAO_NHIEU_PHUT * 60 * 1000; 

    for (const slot of danhSachSlots) {
      if (slot.thoiGianDat) {
        const thoiGianDaTroiQua = thoiGianHienTai - Number(slot.thoiGianDat);
        
        if (thoiGianDaTroiQua > THOI_GIAN_CHO_PHEP) {
          try {
            await axios.delete(`${API_LOTSS}/${slot.id}`);
            console.log(` Hệ thống tự động xóa ô hết hạn 30p: ${slot.tenBai}`);
          } catch (err) {
            console.error("Lỗi xóa slot hết hạn tự động:", err);
          }
        }
      }
    }
  }, []);

  // --- 📥 TẢI DANH SÁCH PHẢN HỒI CỦA ADMIN + BẢO VỆ VỀ CHO USER XEM ---
  const fetchUserFeedbacks = async () => {
    try {
      const res = await axios.get(API_MESSAGES);
      const allData = res.data || [];
      
      // Lọc tin khiếu nại gửi Admin như cũ
      const dataKhieuNai = allData.filter(item => item.loaiTinNhan === "khieu_nai");
      setDanhSachPhanHoiAdmin(dataKhieuNai.reverse()); 

      // TÍNH NĂNG THÊM: Lọc tin nhắn gửi bảo vệ (chat_user_guard) để xem phản hồi hiện trường
      const dataBaoVe = allData.filter(item => item.loaiTinNhan === "chat_user_guard");
      setDanhSachPhanHoiBaoVe(dataBaoVe.reverse());
    } catch (error) {
      console.error("Lỗi tải phản hồi hệ thống:", error);
    }
  };

  // --- 🔄 HÀM TẢI VÀ ĐỒNG BỘ DỮ LIỆU BÃI XE + BẢNG GIÁ ---
  const fetchParkingData = useCallback(async () => {
    try {
      // Đọc bảng giá thời gian thực từ LocalStorage y hệt trang Security sếp nhé
      setBangGiaAdmin({
        "Ô tô": Number(localStorage.getItem('giaOTo')) || 20000,
        "Xe máy": Number(localStorage.getItem('giaXeMay')) || 5000,
        "Xe tải": Number(localStorage.getItem('giaXeTai')) || 50000
      });

      const resSlotsCheck = await axios.get(API_LOTSS);
      const bookedSlotsCheck = resSlotsCheck.data || [];
      
      await kiemTraVaXoaSlotHetHan(bookedSlotsCheck);

      const [resLots, resSlots] = await axios.all([
        axios.get(API_LOTS),
        axios.get(API_LOTSS)
      ]);

      const allLots = resLots.data || [];
      const bookedSlots = resSlots.data || [];

      const tree = {};
      allLots.forEach(slot => {
        let cs = slot.coSo || "Cơ sở 1 (HOLA)";
        if(cs.includes("Hòa Lạc") || cs.includes("HOLA")) cs = "Cơ sở 1 (HOLA)";
        
        const kh = slot.khu || "KHU MẶC ĐỊNH";

        if (!tree[cs]) tree[cs] = {};
        if (!tree[cs][kh]) tree[cs][kh] = { slots: [], tong: 0, trong: 0, choDat: 0 };

        const biTrungCheckDat = bookedSlots.some(b => b.tenBai === slot.tenBai && b.coSo === slot.coSo);

        const slotTrangThaiThuc = {
          ...slot,
          daBiDatTruoc: biTrungCheckDat
        };

        tree[cs][kh].slots.push(slotTrangThaiThuc);
        tree[cs][kh].tong += 1;

        if (slot.trangThai === "Trống" && !biTrungCheckDat) {
          tree[cs][kh].trong += 1;
        }
        
        if (slot.choPhepDatChoTruoc === "true" || slot.choPhepDatChoTruoc === true) {
          tree[cs][kh].choDat += 1;
        }
      });

      setCauTrucHaTang(tree);

      const danhSachCoSo = Object.keys(tree);
      if (danhSachCoSo.length > 0) {
        setCoSoDangChon(prev => prev || danhSachCoSo[0]);
        setCauTrucHaTang(prevTree => {
          const currentCS = coSoDangChon || danhSachCoSo[0];
          if (prevTree[currentCS]) {
            const danhSachKhu = Object.keys(prevTree[currentCS]);
            if (danhSachKhu.length > 0) {
              setKhuDangChon(prevKhu => prevKhu || danhSachKhu[0]);
            }
          }
          return prevTree;
        });
      }

    } catch (error) {
      console.error("Lỗi đồng bộ dữ liệu b bãi:", error);
    }
  }, [coSoDangChon, kiemTraVaXoaSlotHetHan]);

  // Luôn lắng nghe cập nhật chu kỳ thời gian thực (định kỳ 30s reload)
  useEffect(() => {
    fetchParkingData();
    fetchUserFeedbacks(); 
    
    // Lắng nghe đổi giá tức thì từ tab Admin
    window.addEventListener('storage', fetchParkingData);
    
    const intervalQuetHetHan = setInterval(() => {
      fetchParkingData();
      fetchUserFeedbacks(); 
    }, 30000); 

    return () => {
      clearInterval(intervalQuetHetHan);
      window.removeEventListener('storage', fetchParkingData);
    };
  }, [fetchParkingData]);

  // --- ⚡ XỬ LÝ KHÁCH HÀNG ĐẶT CHỖ ---
  const handleOpenBooking = (slot) => {
    const duocPhepDatOnline = slot.choPhepDatChoTruoc === "true" || slot.choPhepDatChoTruoc === true;
    if (slot.trangThai !== "Trống" || slot.daBiDatTruoc || !duocPhepDatOnline || currentBooking) {
      return;
    }
    setSelectedSlot(slot);
    setBienSoDat("");
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!bienSoDat.trim()) return;
    try {
      const payload = {
        tenBai: selectedSlot.tenBai,
        coSo: selectedSlot.coSo,
        khu: selectedSlot.khu,
        trangThai: "Đã đặt trước",
        bienSo: bienSoDat.trim().toUpperCase(),
        thoiGianDat: Date.now() 
      };
      
      await axios.post(API_LOTSS, payload);
      setCurrentBooking(payload);
      setShowBookingModal(false);
      fetchParkingData(); 
    } catch (err) { 
      alert("Lỗi kết nối đặt chỗ "); 
    }
  };

  // --- 📢 XỬ LÝ GỬI PHẢN ÁNH CHỖ ĐỖ CHO BẢO VỆ (LƯU LÊN MOCKAPI) ---
  const handleGuiBaoVe = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        loaiTinNhan: "chat_user_guard",
        maCuocTroChuyen: `CHAT_USER_GUARD_${coSoDangChon || "HOLA"}`,
        senderId: "khach_vãng_lai", 
        senderName: "Người dùng hệ thống", 
        senderRole: "Customer",
        receiverRole: "Security",
        coSo: coSoDangChon || "Cơ sở 1 (HOLA)", 
        noiDung: `[Báo lỗi vị trí: ${loaiXeBaoVe}] - ${noiDungBaoVe}`, 
        ngayTao: new Date().toISOString()
      };

      await axios.post(API_MESSAGES, payload);
      setGuiBaoVeThanhCong(true);
      setNoiDungBaoVe("");
      setLoaiXeBaoVe("");
      fetchUserFeedbacks(); // Reload lại để cập nhật danh sách ngay lập tức
      setTimeout(() => setGuiBaoVeThanhCong(false), 3000);
    } catch (error) {
      console.error("Lỗi gửi tin nhắn cho bảo vệ:", error);
      alert("Không kết nối được tới đội bảo vệ");
    }
  };

  // --- 📢 XỬ LÝ GỬI PHẢN ÁNH CHẤT LƯỢNG CHO ADMIN (LƯU LÊN MOCKAPI) ---
  const handleGuiAdmin = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        loaiTinNhan: "khieu_nai",
        maCuocTroChuyen: `KHIEUNAI_${Date.now()}`,
        senderId: "khach_vãng_lai",
        senderName: "Người dùng hệ thống",
        senderRole: "Customer",
        receiverRole: "Admin",
        coSo: coSoDangChon || "Tất cả",
        noiDung: noiDungAdmin,
        ngayTao: new Date().toISOString()
      };

      await axios.post(API_MESSAGES, payload);
      setGuiAdminThanhCong(true);
      setNoiDungAdmin("");
      fetchUserFeedbacks(); 
      setTimeout(() => setGuiAdminThanhCong(false), 3000);
    } catch (error) {
      console.error("Lỗi gửi khiêu nại lên Admin:", error);
      alert("Gửi phản ánh thất bại. Vui lòng kiểm tra lại kết nối mạng hoặc endpoint API!");
    }
  };

  const oDoHienThi = cauTrucHaTang[coSoDangChon]?.[khuDangChon]?.slots || [];

  return (
    <div style={{ backgroundColor: '#05070c', minHeight: '100vh', width: '100%' }}>
      <Container className="pb-5 pt-2" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif", color: '#f8fafc' }}>
        
        {/* HEADER SECTION - CHÁY VÀ SẮC NÉT */}
        <div className="text-center my-5 position-relative">
          <h1 className="fw-black tracking-tight mb-2" style={{ 
            fontSize: '2.3rem',
            fontWeight: '900',
            background: 'linear-gradient(135deg, #38bdf8, #6366f1, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textTransform: 'uppercase'
          }}>
            🚀 SMART PARKING PLATFORM
          </h1>
          <p className="text-muted small mx-auto" style={{ maxWidth: '500px', color: '#64748b', letterSpacing: '1px' }}>
           <span className="text-warning fw-bold">Dich vụ đặt chỗ trước sẽ bị hủy sau 30 phút nếu chưa check-in.</span> 
          </p>
        </div>

        {/* ALERT THÔNG BÁO GIỮ CHỖ */}
        {currentBooking && (
          <Alert variant="warning" className="border-0 shadow-lg mb-4 text-dark p-3 d-flex align-items-center gap-2" style={{ 
            backgroundColor: '#fbbf24', 
            borderRadius: '16px',
            boxShadow: '0 10px 25px -5px rgba(251, 191, 36, 0.3)'
          }}>
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            <div>
              Vị trí <strong>{currentBooking.tenBai}</strong> đã được giữ thành công. Vui lòng di chuyển vào bãi trong vòng <strong>30 phút</strong>!
            </div>
          </Alert>
        )}

        {/* 💰 BẢNG GIÁ ĐỒNG BỘ - ĐẨY NỀN LÊN CARD LIÊN KẾT ĐẬM ĐẶC */}
        <Card className="p-4 mb-5 border-0 shadow-lg" style={{ backgroundColor: '#0f172a', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
          <h6 className="fw-bold mb-3 text-center" style={{ color: '#38bdf8', fontSize: '0.85rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
             BIỂU PHÍ HIỆN HÀNH (LIVE SYNC)
          </h6>
          <Row className="g-3 text-center">
            <Col xs={4}>
              <div className="p-3 rounded-4" style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                <small className="d-block fw-bold mb-1" style={{ color: '#38bdf8', fontSize: '0.75rem' }}>🚗 Ô TÔ</small>
                <span className="fw-extrabold text-white fs-5">{bangGiaAdmin["Ô tô"].toLocaleString()}đ<small style={{fontSize: '11px', color: '#94a3b8'}}> /h</small></span>
              </div>
            </Col>
            <Col xs={4}>
              <div className="p-3 rounded-4" style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                <small className="d-block fw-bold mb-1" style={{ color: '#fbbf24', fontSize: '0.75rem' }}>🏍️ XE MÁY</small>
                <span className="fw-extrabold text-warning fs-5">{bangGiaAdmin["Xe máy"].toLocaleString()}đ<small style={{fontSize: '11px', color: '#94a3b8'}}> /h</small></span>
              </div>
            </Col>
            <Col xs={4}>
              <div className="p-3 rounded-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <small className="d-block fw-bold mb-1" style={{ color: '#f87171', fontSize: '0.75rem' }}>🚚 XE TẢI</small>
                <span className="fw-extrabold fs-5" style={{ color: '#f87171' }}>{bangGiaAdmin["Xe tải"].toLocaleString()}đ<small style={{fontSize: '11px', color: '#94a3b8'}}> /h</small></span>
              </div>
            </Col>
          </Row>
        </Card>

        <Row>
          {/* BÊN TRÁI: ACCORDION PHÂN KHU TÁCH NỀN BIỆT LẬP */}
          <Col lg={4} className="mb-4">
            <h5 className="mb-3 fw-bold text-light d-flex align-items-center gap-2" style={{ fontSize: '1.1rem' }}>
              <span></span> Chọn Cơ Sở & Khu Vực
            </h5>
            <Accordion defaultActiveKey="0" alwaysOpen className="custom-modern-accordion">
              {Object.keys(cauTrucHaTang).map((tenCoSo, idx) => (
                <Accordion.Item eventKey={String(idx)} key={idx} className="border-0 mb-3 overflow-hidden shadow-sm" style={{ borderRadius: '16px', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
                  <Accordion.Header className="fw-bold text-white"> {tenCoSo}</Accordion.Header>
                  <Accordion.Body className="p-2" style={{ backgroundColor: '#0f172a' }}>
                    {Object.keys(cauTrucHaTang[tenCoSo]).map((tenKhuX, i) => {
                      const dataKhu = cauTrucHaTang[tenCoSo][tenKhuX];
                      const isSelected = coSoDangChon === tenCoSo && khuDangChon === tenKhuX;
                      return (
                        <div 
                          key={i}
                          onClick={() => { setCoSoDangChon(tenCoSo); setKhuDangChon(tenKhuX); }}
                          className="p-3 mb-2 rounded-4 text-white position-relative"
                          style={{ 
                            backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.12)' : '#1e293b',
                            border: isSelected ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.05)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease-in-out'
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="fw-bold text-warning" style={{ fontSize: '0.9rem' }}>📍 Khu: {tenKhuX}</span>
                            <Badge bg="dark" className="border border-secondary-subtle text-light fw-medium px-2 py-1" style={{ fontSize: '0.65rem' }}>
                              Tổng: {dataKhu.tong} ô
                            </Badge>
                          </div>
                          <div className="d-flex gap-3" style={{ fontSize: '0.75rem' }}>
                            <span className="fw-bold" style={{ color: '#10b981' }}>● Trống: {dataKhu.trong}</span>
                            <span style={{ color: '#94a3b8' }}>● Đặt trước: {dataKhu.choDat}</span>
                          </div>
                        </div>
                      );
                    })}
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </Col>

          {/* BÊN PHẢI: LƯỚI Ô ĐỖ NEON CHÁY TRÊN NỀN CARD ĐẬM ĐẶC */}
          <Col lg={8} className="mb-4">
            <Card className="p-4 border-0 h-100 shadow-lg" style={{ backgroundColor: '#0f172a', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <h5 className="fw-bold text-white m-0">Sơ đồ phân phối ô đỗ: <span style={{ color: '#38bdf8' }}>{khuDangChon || "Chưa chọn"}</span></h5>
                {currentBooking && <span className="badge bg-danger-subtle text-danger border border-danger-subtle py-1.5 px-2.5 rounded-3" style={{fontSize: '11px'}}>Bạn đang có 1 đơn giữ chỗ</span>}
              </div>
              
              <Row className="g-3">
                {oDoHienThi.map((slot) => {
                  const adminChoPhep = slot.choPhepDatChoTruoc === "true" || slot.choPhepDatChoTruoc === true;
                  
                  let bgBlock = "#1e293b"; 
                  let textColor = "#94a3b8";
                  let textStatus = "TẠI CỔNG";
                  let isClickable = false;
                  let borderStyle = "1px solid rgba(255,255,255,0.1)";

                  if (slot.trangThai === "Đầy") {
                    bgBlock = "rgba(239, 68, 68, 0.18)"; 
                    textColor = "#f87171";
                    textStatus = "CÓ XE";
                    borderStyle = "1.5px solid #ef4444";
                  } else if (slot.daBiDatTruoc) {
                    bgBlock = "rgba(245, 158, 11, 0.18)"; 
                    textColor = "#fbbf24";
                    textStatus = "ĐÃ GIỮ CHỖ";
                    borderStyle = "1.5px solid #f59e0b";
                  } else if (slot.trangThai === "Trống" && adminChoPhep) {
                    bgBlock = "rgba(16, 185, 129, 0.15)"; 
                    textColor = "#34d399";
                    textStatus = "ĐẶT ONLINE";
                    isClickable = !currentBooking;
                    borderStyle = "2px dashed #10b981";
                  }

                  return (
                    <Col key={slot.id} xs={4} sm={3}>
                      <div 
                        onClick={() => { if (isClickable) handleOpenBooking(slot); }}
                        className="p-3 d-flex flex-column justify-content-center align-items-center rounded-4 text-center position-relative overflow-hidden"
                        style={{ 
                          backgroundColor: bgBlock, 
                          border: borderStyle,
                          height: '85px', 
                          cursor: isClickable ? 'pointer' : 'not-allowed',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                        onMouseEnter={(e) => {
                          if (isClickable) {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 12px 20px -3px rgba(16, 185, 129, 0.35)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <span className="fw-extrabold text-white" style={{ fontSize: '1rem', letterSpacing: '0.5px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                          {slot.tenBai.includes(" - ") ? slot.tenBai.split(" - ")[1] : slot.tenBai}
                        </span>
                        <small className="fw-bold mt-1" style={{ fontSize: '0.62rem', color: textColor, letterSpacing: '0.5px' }}>{textStatus}</small>
                        
                        {adminChoPhep && slot.trangThai === "Trống" && !slot.daBiDatTruoc && (
                          <div className="position-absolute" style={{ top: '4px', right: '6px', fontSize: '0.65rem', filter: 'drop-shadow(0 0 4px #fbbf24)' }}>⭐</div>
                        )}
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </Card>
          </Col>
        </Row>

        {/* ================= 📢 PHÂN HỆ 2 CỔNG PHẢN ÁNH ================= */}
        <Row className="g-4 mt-3">
          <Col md={6}>
            <Card className="p-4 border-0 h-100 shadow-lg position-relative overflow-hidden" style={{ backgroundColor: '#0f172a', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
              <div className="position-absolute top-0 start-0 w-100" style={{ height: '4px', background: 'linear-gradient(to right, #ef4444, #f87171)' }}></div>
              <h5 className="fw-bold text-danger mb-2 d-flex align-items-center gap-2" style={{fontSize: '1.1rem'}}>
                <span></span> Phản Ánh Tới Bảo Vệ (Hiện Trường)
              </h5>
        
              <Form onSubmit={handleGuiBaoVe}>
                {guiBaoVeThanhCong && <Alert variant="success" className="py-2 border-0 shadow-sm rounded-3 bg-success text-white small">✔️ Đã gửi tín hiệu định vị thành công tới đội tuần tra!</Alert>}
                <Form.Group className="mb-3">
                  <Form.Control type="text" placeholder="Nhập tên ô đỗ (Ví dụ: Khu A - Ô 02)..." className="text-white border-0 mb-3 py-2.5 shadow-none" style={{ borderRadius: '12px', fontSize: '0.9rem', backgroundColor: '#1e293b' }} value={loaiXeBaoVe} onChange={(e) => setLoaiXeBaoVe(e.target.value)} required />
                  <Form.Control as="textarea" rows={2} placeholder="Mô tả hiện trạng vi phạm..." className="text-white border-0 py-2.5 shadow-none" style={{ borderRadius: '12px', fontSize: '0.9rem', backgroundColor: '#1e293b' }} value={noiDungBaoVe} onChange={(e) => setNoiDungBaoVe(e.target.value)} required />
                </Form.Group>
                <Button type="submit" variant="danger" className="fw-bold w-100 py-2.5 border-0" style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', fontSize: '0.9rem' }}>Gửi Yêu Cầu Khẩn Cấp</Button>
              </Form>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="p-4 border-0 h-100 shadow-lg position-relative overflow-hidden" style={{ backgroundColor: '#0f172a', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
              <div className="position-absolute top-0 start-0 w-100" style={{ height: '4px', background: 'linear-gradient(to right, #38bdf8, #6366f1)' }}></div>
              <h5 className="fw-bold text-info mb-2 d-flex align-items-center gap-2" style={{fontSize: '1.1rem'}}>
                <span></span> Góp Ý Chất Lượng (Ban Quản Trị)
              </h5>
              
              <Form onSubmit={handleGuiAdmin}>
                {guiAdminThanhCong && <Alert variant="success" className="py-2 border-0 shadow-sm rounded-3 bg-info text-dark small fw-bold">✔️ Ý kiến đóng góp đã được ghi nhận trên hệ thống trung tâm!</Alert>}
                <Form.Group className="mb-3">
                  <Form.Control as="textarea" rows={3.5} placeholder="Nội dung gửi Ban quản trị..." className="text-white border-0 py-2.5 shadow-none" style={{ borderRadius: '12px', fontSize: '0.9rem', backgroundColor: '#1e293b' }} value={noiDungAdmin} onChange={(e) => setNoiDungAdmin(e.target.value)} required />
                </Form.Group>
                <Button type="submit" className="fw-bold w-100 text-dark py-2.5 border-0" style={{ borderRadius: '12px', backgroundColor: '#38bdf8', fontSize: '0.9rem' }}>Gửi Đóng Góp Ý Kiến</Button>
              </Form>
            </Card>
          </Col>
        </Row>

        {/* ================= 📩 LỊCH SỬ NHẬN PHẢN HỒI (Hộp thư Bảo vệ & Admin) ================= */}
        <Row className="mt-5 g-4">
          {/* Hộp Thư Đội Bảo Vệ */}
          <Col md={6}>
            <Card className="p-4 border-0 shadow-lg h-100" style={{ backgroundColor: '#0f172a', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
              <h5 className="fw-bold text-danger mb-3 d-flex align-items-center gap-2" style={{fontSize: '1.1rem'}}>
                <span>🚨</span> Nhật Ký Hiện Trường (Đội Bảo Vệ)
              </h5>
              {danhSachPhanHoiBaoVe.length === 0 ? (
                <p className="text-muted small m-0 fst-italic p-3 rounded-3 text-center" style={{backgroundColor: '#1e293b'}}>Chưa có phản ánh hiện trường nào.</p>
              ) : (
                <div style={{ maxHeight: '320px', overflowY: 'auto', paddingRight: '6px' }} className="custom-scrollbar">
                  {danhSachPhanHoiBaoVe.map((item, idx) => (
                    <div key={item.id || idx} className="p-3 mb-3 border-0 shadow-sm" style={{ borderRadius: '16px', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.03)' }}>
                      <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                        <small className="text-muted fw-semibold d-flex align-items-center gap-1" style={{fontSize: '11px'}}>
                          <span>⏱</span> {item.ngayTao ? new Date(item.ngayTao).toLocaleString('vi-VN') : 'Không rõ'}
                        </small>
                        {item.trangThaiXuly === "Đã xử lý" || item.trangThai === "Đã phản hồi" ? (
                          <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 rounded-3" style={{fontSize: '10px'}}>Đã xử lý</span>
                        ) : (
                          <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1 rounded-3" style={{fontSize: '10px'}}>Đang điều phối</span>
                        )}
                      </div>
                      <p className="m-0 text-white mb-2" style={{fontSize: '0.9rem'}}><strong className="text-danger">Yêu cầu:</strong> "{item.noiDung}"</p>
                      
                      {(item.phanHoiBaoVe || item.replyMessage || item.phanHoiAdmin) && (
                        <div className="mt-3 p-3 rounded-3" style={{ backgroundColor: '#0f172a', borderLeft: '3px solid #ef4444' }}>
                          <small className="fw-bold d-block mb-1" style={{ fontSize: '0.75rem', color: '#f87171' }}>
                            ĐỘI TUẦN TRA ĐÁP ỨNG:
                          </small>
                          <span className="small text-light fst-italic">"{item.phanHoiBaoVe || item.replyMessage || item.phanHoiAdmin}"</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </Col>

          {/* Hộp Thư Ban Quản Trị */}
          <Col md={6}>
            <Card className="p-4 border-0 shadow-lg h-100" style={{ backgroundColor: '#0f172a', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
              <h5 className="fw-bold text-warning mb-3 d-flex align-items-center gap-2" style={{fontSize: '1.1rem'}}>
                <span>📩</span> Hộp Thư Phản Hồi (Ban Quản Trị)
              </h5>
              {danhSachPhanHoiAdmin.length === 0 ? (
                <p className="text-muted small m-0 fst-italic p-3 rounded-3 text-center" style={{backgroundColor: '#1e293b'}}>Chưa có tin nhắn phản hồi nào từ Ban Quản Trị.</p>
              ) : (
                <div style={{ maxHeight: '320px', overflowY: 'auto', paddingRight: '6px' }} className="custom-scrollbar">
                  {danhSachPhanHoiAdmin.map((item, idx) => (
                    <div key={item.id || idx} className="p-3 mb-3 border-0 shadow-sm" style={{ borderRadius: '16px', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.03)' }}>
                      <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                        <small className="text-muted fw-semibold d-flex align-items-center gap-1" style={{fontSize: '11px'}}>
                          <span>⏱</span> {item.ngayTao ? new Date(item.ngayTao).toLocaleString('vi-VN') : 'Không rõ'}
                        </small>
                        {item.trangThai === "Đã phản hồi" ? (
                          <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 rounded-3" style={{fontSize: '10px'}}>Đã giải quyết</span>
                        ) : (
                          <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 rounded-3" style={{fontSize: '10px'}}>Đang xử lý</span>
                        )}
                      </div>
                      <p className="m-0 text-white mb-2" style={{fontSize: '0.9rem'}}><strong className="text-info">Ý kiến của bạn:</strong> "{item.noiDung}"</p>
                      
                      {item.trangThai === "Đã phản hồi" && (
                        <div className="mt-3 p-3 rounded-3" style={{ backgroundColor: '#0f172a', borderLeft: '3px solid #10b981' }}>
                          <small className="fw-bold d-block mb-1" style={{ fontSize: '0.75rem', color: '#10b981' }}>
                            BAN QUẢN TRỊ PHẢN HỒI ({item.thoiGianPhanHoi ? new Date(item.thoiGianPhanHoi).toLocaleString('vi-VN') : ''}):
                          </small>
                          <span className="small text-light fst-italic">"{item.phanHoiAdmin}"</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* POPUP NHẬP BIỂN SỐ */}
        <Modal show={showBookingModal} onHide={() => setShowBookingModal(false)} centered contentClassName="border-0 shadow-2xl" style={{ borderRadius: '24px' }}>
          <Modal.Body className="p-4" style={{backgroundColor: '#0f172a', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)'}}>
            <div className="text-center mb-4">
              <h5 className="text-success fw-bold mb-1" style={{letterSpacing: '0.5px'}}>⭐ GIỮ CHỖ TRỰC TUYẾN</h5>
              <p className="text-muted small m-0">Vị trí: <b className="text-white">{selectedSlot?.tenBai}</b> ({selectedSlot?.coSo})</p>
            </div>
            <Form.Group className="mb-4">
              <Form.Control 
                type="text" 
                placeholder="BIỂN SỐ XE (VD: 29A12345)" 
                className="text-white text-center fs-2 fw-black text-uppercase border-0 py-3 input-license-plate" 
                style={{ borderRadius: '16px', letterSpacing: '3px', backgroundColor: '#1e293b' }}
                value={bienSoDat} 
                onChange={(e) => setBienSoDat(e.target.value)} 
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="link" className="text-muted text-decoration-none fw-semibold" onClick={() => setShowBookingModal(false)}>Hủy bỏ</Button>
              <Button variant="success" className="fw-bold text-dark px-4 py-2 border-0 shadow-sm" style={{ borderRadius: '12px', backgroundColor: '#10b981' }} onClick={handleConfirmBooking} disabled={!bienSoDat.trim()}>Xác Nhận Giữ Chỗ</Button>
            </div>
          </Modal.Body>
        </Modal>

        {/* Custom Styles Injection */}
        <style>{`
          .custom-modern-accordion .accordion-button {
            background-color: #1e293b !important;
            color: white !important;
            box-shadow: none !important;
            font-weight: 700;
            border-radius: 16px !important;
          }
          .custom-modern-accordion .accordion-button:not(.collapsed) {
            background-color: #1e293b !important;
            color: #38bdf8 !important;
            border-bottom-left-radius: 0px !important;
            border-bottom-right-radius: 0px !important;
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #0f172a;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #334155;
            border-radius: 10px;
          }
          .input-license-plate::placeholder {
            font-size: 1.1rem !important;
            letter-spacing: 0px !important;
            opacity: 0.4;
          }
          .form-control:focus {
            background-color: #1e293b !important;
            color: #fff !important;
            border-color: #38bdf8 !important;
            box-shadow: 0 0 0 0.25rem rgba(56, 189, 248, 0.2) !important;
          }
        `}</style>
      </Container>
    </div>
  );
}

export default TrangKhachHang;