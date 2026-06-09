import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Form, Button, Row, Col, Modal, Alert, Badge, Accordion } from 'react-bootstrap';
import axios from 'axios';

// Import các component con

import TrangHoSo from './TrangHoSo';

// Hệ thống Endpoint từ hằng số
import { API_LOTS, API_LOTSS, API_MESSAGES } from '../constants/api'; 

function TrangKhachHang() {
  // --- 📦 1. KHAI BÁO CÁC STATE HỆ THỐNG ---
  const [cauTrucHaTang, setCauTrucHaTang] = useState({}); 
  const [currentView, setCurrentView] = useState("home"); 
  const [coSoDangChon, setCoSoDangChon] = useState("");
  const [khuDangChon, setKhuDangChon] = useState("");

  // Trạng thái Popup ĐẶT CHỖ
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null); 
  const [bienSoDat, setBienSoDat] = useState("");
  const [loaiXeDat, setLoaiXeDat] = useState("Ô tô"); 
  const [loiBienSoDat, setLoiBienSoDat] = useState(""); 

  // Trạng thái Popup HỦY CHỖ 
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [slotMuonHuy, setSlotMuonHuy] = useState(null); 
  const [bienSoXacNhanHuy, setBienSoXacNhanHuy] = useState("");
  const [loiXacNhanHuy, setLoiXacNhanHuy] = useState("");

  // Quản lý danh sách đơn đặt & bảng giá
  const [danhSachDonDat, setDanhSachDonDat] = useState([]);
  const [bangGiaAdmin, setBangGiaAdmin] = useState({ "Ô tô": 20000, "Xe máy": 5000, "Xe tải": 50000 });

  // Trạng thái FORM PHẢN ÁNH BẢO VỆ
  const [tenODoBaoVe, setTenODoBaoVe] = useState(""); 
  const [bienSoBaoVe, setBienSoBaoVe] = useState(""); 
  const [loiBienSoBaoVe, setLoiBienSoBaoVe] = useState(""); 
  const [noiDungBaoVe, setNoiDungBaoVe] = useState("");
  const [guiBaoVeThanhCong, setGuiBaoVeThanhCong] = useState(false);

  // Trạng thái FORM PHẢN ÁNH ADMIN
  const [noiDungAdmin, setNoiDungAdmin] = useState("");
  const [guiAdminThanhCong, setGuiAdminThanhCong] = useState(false);

  // Danh sách phản hồi hiển thị dưới nhật ký
  const [danhSachPhanHoiAdmin, setDanhSachPhanHoiAdmin] = useState([]);
  const [danhSachPhanHoiBaoVe, setDanhSachPhanHoiBaoVe] = useState([]); 

  // --- 🎯 2. CÁC HÀM XỬ LÝ LOGIC ---

  const kiemTraDinhDangBienSo = (bienSo) => {
    if (!bienSo) return false;
    const chuoiTho = bienSo.trim().toUpperCase().replace(/[\s.-]/g, ''); 
    const regexToanQuoc = /^[0-9]{2}([A-Z][0-9]|[A-Z]{1,2})[0-9]{4,5}$/;
    return regexToanQuoc.test(chuoiTho);
  };

  const kiemTraVaXoaSlotHetHan = useCallback(async (danhSachSlots) => {
    const thoiGianHienTai = Date.now(); 
    const THOI_GIAN_CHO_PHEP = 30 * 60 * 1000; 

    for (const slot of danhSachSlots) {
      if (slot.thoiGianDat) {
        const thoiGianDaTroiQua = thoiGianHienTai - Number(slot.thoiGianDat);
        if (thoiGianDaTroiQua > THOI_GIAN_CHO_PHEP) {
          try {
            await axios.delete(`${API_LOTSS}/${slot.id}`);
          } catch (err) {
            console.error("Lỗi xóa slot hết hạn:", err);
          }
        }
      }
    }
  }, []);

  const fetchUserFeedbacks = async () => {
    try {
      const res = await axios.get(API_MESSAGES);
      const allData = res.data || [];
      setDanhSachPhanHoiAdmin(allData.filter(item => item.loaiTinNhan === "khieu_nai").reverse()); 
      setDanhSachPhanHoiBaoVe(allData.filter(item => item.loaiTinNhan === "chat_user_guard").reverse());
    } catch (error) {
      console.error("Lỗi tải phản hồi:", error);
    }
  };

  const fetchParkingData = useCallback(async () => {
    try {
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
      
      // LÀM SẠCH TÀI KHOẢN ĐĂNG NHẬP ĐỂ LỌC ĐƠN ĐẶT CHÍNH XÁC
      const currentAccount = String(localStorage.getItem('taiKhoan') || "user").trim();
      const myBookedSlots = bookedSlots.filter(b => b.taiKhoan && String(b.taiKhoan).trim() === currentAccount);
      setDanhSachDonDat(myBookedSlots);

      const tree = {};
      allLots.forEach(slot => {
        let cs = slot.coSo || "Cơ sở 1 (HOLA)";
        if(cs.includes("Hòa Lạc") || cs.includes("HOLA")) cs = "Cơ sở 1 (HOLA)";
        
        let kh = "KHU MẶC ĐỊNH";
        if (slot.tenBai && slot.tenBai.includes("-")) {
          kh = slot.tenBai.split("-")[0].trim().toUpperCase();
        } else if (slot.tenBai && /^[A-Za-z]/.test(slot.tenBai)) {
          kh = `KHU ${slot.tenBai.charAt(0).toUpperCase()}`;
        } else if (slot.khu) {
          kh = slot.khu.toUpperCase();
        }

        if (!tree[cs]) tree[cs] = {};
        if (!tree[cs][kh]) tree[cs][kh] = { slots: [], tong: 0, trong: 0, choDat: 0 };

        const slotDatCheck = bookedSlots.find(b => b.tenBai === slot.tenBai && b.coSo === slot.coSo);

        tree[cs][kh].slots.push({
          ...slot,
          daBiDatTruoc: !!slotDatCheck,
          bookingId: slotDatCheck ? slotDatCheck.id : null,
          bienSoXeDaDat: slotDatCheck ? slotDatCheck.bienSo : "",
          loaiXeDaDat: slotDatCheck ? (slotDatCheck.loaiXe || "Ô tô") : ""
        });
        
        tree[cs][kh].tong += 1;
        if (slot.trangThai === "Trống" && !slotDatCheck) tree[cs][kh].trong += 1;
      });

      setCauTrucHaTang(tree);

      const danhSachCoSo = Object.keys(tree);
      if (danhSachCoSo.length > 0) {
        setCoSoDangChon(prev => prev || danhSachCoSo[0]);
        setKhuDangChon(prevKhu => prevKhu || Object.keys(tree[coSoDangChon || danhSachCoSo[0]])[0] || "");
      }
    } catch (error) {
      console.error("Lỗi đồng bộ dữ liệu bãi xe:", error);
    }
  }, [coSoDangChon, kiemTraVaXoaSlotHetHan]);

  useEffect(() => {
    fetchParkingData();
    fetchUserFeedbacks(); 
    const intervalQuet = setInterval(() => {
      fetchParkingData();
      fetchUserFeedbacks(); 
    }, 30000); 
    return () => clearInterval(intervalQuet);
  }, [fetchParkingData]);

  const handleOpenBooking = (slot) => {
    setSelectedSlot(slot);
    setBienSoDat("");
    setLoaiXeDat("Ô tô"); 
    setLoiBienSoDat(""); 
    setShowBookingModal(true);
  };

  // HÀM XÁC NHẬN ĐẶT CHỖ (ĐÃ KHỬ HOÀN TOÀN DỮ LIỆU CỨNG)
  const handleConfirmBooking = async () => {
    if (!bienSoDat.trim()) return;

    if (!kiemTraDinhDangBienSo(bienSoDat)) {
      setLoiBienSoDat(" Định dạng biển số không đúng chuẩn Việt Nam! (Ví dụ: 29A-123.45)");
      return;
    }

    try {
      // Ép sạch chuỗi tên tài khoản lấy từ localStorage đăng nhập thực tế
      const taiKhoanThucTe = String(localStorage.getItem('taiKhoan') || "user").trim();

      const payload = {
        tenBai: selectedSlot.tenBai,
        coSo: selectedSlot.coSo,
        khu: selectedSlot.khu,
        trangThai: "Đã đặt trước",
        bienSo: bienSoDat.trim().toUpperCase(), 
        loaiXe: loaiXeDat, 
        thoiGianDat: Date.now(),
        thoiGianVao: new Date().toLocaleString('vi-VN'), // Thêm trường hiển thị trực quan cho lịch sử
        taiKhoan: taiKhoanThucTe, // Đồng bộ lưu đúng "user", "khanhly"... lên server
        tongTien: bangGiaAdmin[loaiXeDat] || 5000
      };
      
      await axios.post(API_LOTSS, payload);
      setShowBookingModal(false);
      fetchParkingData(); 
    } catch (err) { 
      alert("Lỗi kết nối đặt chỗ"); 
    }
  };

  const handleOpenHuyDatChoModal = (bookingId, tenBaiXea, bienSoGoc) => {
    setSlotMuonHuy({ id: bookingId, tenBai: tenBaiXea, bienSoGoc: bienSoGoc || "" });
    setBienSoXacNhanHuy("");
    setLoiXacNhanHuy("");
    setShowCancelModal(true);
  };

  const handleConfirmHuyDatCho = async () => {
    const nhapVao = (bienSoXacNhanHuy || "").trim().toUpperCase().replace(/[\s.-]/g, '');
    const bienSoDung = (slotMuonHuy?.bienSoGoc || "").trim().toUpperCase().replace(/[\s.-]/g, '');

    if (!bienSoDung) {
      setLoiXacNhanHuy("❌ Hệ thống không tìm thấy biển số đã đăng ký cho vị trí này!");
      return;
    }

    if (nhapVao !== bienSoDung) {
      setLoiXacNhanHuy("❌ Biển số nhập vào không trùng khớp!");
      return;
    }

    try {
      if (slotMuonHuy.id) {
        await axios.delete(`${API_LOTSS}/${slotMuonHuy.id}`);
      } else {
        const resCheck = await axios.get(API_LOTSS);
        const trungSlot = (resCheck.data || []).find(b => b.tenBai === slotMuonHuy.tenBai);
        if (trungSlot) await axios.delete(`${API_LOTSS}/${trungSlot.id}`);
      }
      setShowCancelModal(false);
      alert(`Đã giải phóng vị trí: ${slotMuonHuy.tenBai}`);
      fetchParkingData();
    } catch (error) {
      console.error("Lỗi hủy đơn giữ chỗ:", error);
    }
  };

  // CẬP NHẬT ĐỒNG BỘ TÊN ĐĂNG NHẬP SANG FORM PHẢN ÁNH BẢO VỆ
  const handleGuiBaoVe = async (e) => {
    e.preventDefault();
    if (!kiemTraDinhDangBienSo(bienSoBaoVe)) {
      setLoiBienSoBaoVe("❌ Định dạng biển số xe vi phạm không hợp lệ!");
      return;
    }
    try {
      const taiKhoanThucTe = String(localStorage.getItem('taiKhoan') || "user").trim();
      const payload = {
        loaiTinNhan: "chat_user_guard",
        maCuocTroChuyen: `CHAT_USER_GUARD_${coSoDangChon || "HOLA"}`,
        senderId: taiKhoanThucTe, 
        senderName: `Tài khoản: ${taiKhoanThucTe}`, 
        senderRole: "Customer", 
        receiverRole: "Security",
        coSo: coSoDangChon || "Cơ sở 1 (HOLA)", 
        noiDung: `[Báo lỗi vị trí: ${tenODoBaoVe}] - Xe vi phạm: ${bienSoBaoVe.trim().toUpperCase()}. Ghi chú: ${noiDungBaoVe}`, 
        ngayTao: new Date().toLocaleString('vi-VN')
      };
      await axios.post(API_MESSAGES, payload);
      setGuiBaoVeThanhCong(true); setNoiDungBaoVe(""); setTenODoBaoVe(""); setBienSoBaoVe(""); setLoiBienSoBaoVe("");
      fetchUserFeedbacks();
      setTimeout(() => setGuiBaoVeThanhCong(false), 3000);
    } catch (error) { console.error(error); }
  };

  // CẬP NHẬT ĐỒNG BỘ TÊN ĐĂNG NHẬP SANG FORM GÓP Ý ADMIN
  const handleGuiAdmin = async (e) => {
    e.preventDefault();
    try {
      const taiKhoanThucTe = String(localStorage.getItem('taiKhoan') || "user").trim();
    const payload = {
  tenBai: selectedSlot.tenBai,
  coSo: selectedSlot.coSo,
  khu: selectedSlot.khu,
  trangThai: "Đã đặt trước",
  bienSo: bienSoDat.trim().toUpperCase(),
  loaiXe: loaiXeDat,
  thoiGianDat: Date.now(),
  thoiGianVao: new Date().toLocaleString("vi-VN"),

  taiKhoan: String(
    localStorage.getItem("taiKhoan") || "user"
  ).trim(),

  tongTien: bangGiaAdmin[loaiXeDat] || 5000
};

await axios.post(API_LOTSS, payload);
      setGuiAdminThanhCong(true); setNoiDungAdmin("");
      fetchUserFeedbacks(); 
      setTimeout(() => setGuiAdminThanhCong(false), 3000);
    } catch (error) { console.error(error); }
  };

  const oDoHienThi = cauTrucHaTang[coSoDangChon]?.[khuDangChon]?.slots || [];

  return (
    <Container className="pb-5">
      {/* 🧭 THANH ĐIỀU HƯỚNG CHUYỂN TAB */}
      <div className="d-flex justify-content-between align-items-center my-4 p-3 rounded-4" style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="d-flex gap-2">
          <Button 
            variant={currentView === "home" ? "info" : "outline-secondary"} 
            className={`fw-bold px-3 rounded-3 ${currentView === "home" ? "text-dark" : "text-white"}`}
            onClick={() => setCurrentView("home")}
          >
            🗺️ Sơ đồ bãi xe
          </Button>
         
          <Button 
            variant={currentView === "profile" ? "info" : "outline-secondary"} 
            className={`fw-bold px-3 rounded-3 ${currentView === "profile" ? "text-dark" : "text-white"}`}
            onClick={() => setCurrentView("profile")}
          >
            👤 Hồ sơ cá nhân
          </Button>
        </div>
        
        <Badge bg="dark" className="text-info border border-info px-3 py-2 fs-7 rounded-3 text-uppercase fw-bold">
          Tài khoản: {localStorage.getItem('taiKhoan') || "Khách"}
        </Badge>
      </div>

      {/* ================= VIEW 1: SƠ ĐỒ ĐẶT CHỖ CHÍNH ================= */}
      {currentView === "home" && (
        <>
          <div className="my-4 text-center">
            <h1 className="fw-black tracking-tight mb-0" style={{ 
              fontSize: '2.5rem', fontWeight: '900',
              background: 'linear-gradient(135deg, #38bdf8, #6366f1, #ec4899)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textTransform: 'uppercase' 
            }}>
              🚀 SMART PARKING PLATFORM
            </h1>
             <p className="text-white-50 small m-0 mt-1 font-monospace text-uppercase" style={{ letterSpacing: '0.1em', fontSize: '0.75rem' }}>
          Ứng dụng tìm và đặt chỗ đỗ xe thông minh
        </p>
          </div>

          <hr style={{ borderColor: 'rgba(255,255,255,0.1)' }} className="mb-4"/>

          {/* HIỂN THỊ CÁC Ô ĐANG ĐẶT CỦA USER */}
          {danhSachDonDat.length > 0 && (
            <div className="mb-4">
              <h6 className="fw-bold mb-2 text-warning"> CÁC VỊ TRÍ ĐANG GIỮ CHỖ CỦA BẠN ({danhSachDonDat.length})</h6>
              <Row className="g-3">
                {danhSachDonDat.map((don, index) => (
                  <Col key={don.id || index} md={6} lg={4}>
                    <Alert variant="warning" className="border-0 shadow-sm text-dark m-0 p-3 d-flex justify-content-between align-items-center" style={{ backgroundColor: '#fbbf24', borderRadius: '16px' }}>
                      <div>
                        Vị trí: <strong>{don.tenBai}</strong> ({don.coSo}) <br/>
                        Loại xe: <span className="fw-bold text-primary">{don.loaiXe || "Ô tô"}</span> | Biển số: <Badge bg="dark" className="ms-1 text-uppercase">{don.bienSo}</Badge>
                      </div>
                      <Button variant="danger" size="sm" className="fw-bold rounded-3 text-white" style={{ fontSize: '11px', border: 'none', backgroundColor: '#dc2626' }} onClick={() => handleOpenHuyDatChoModal(don.id, don.tenBai, don.bienSo)}>
                        Hủy Chỗ
                      </Button>
                    </Alert>
                  </Col>
                ))}
              </Row>
            </div>
          )}

          {/* BẢNG BIỂU PHÍ GỬI XE */}
          <Card className="p-4 mb-5 border-0 shadow-lg" style={{ backgroundColor: '#0f172a', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
            <h6 className="fw-bold mb-3 text-center" style={{ color: '#38bdf8', fontSize: '0.85rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                BIỂU PHÍ HIỆN HÀNH (LIVE SYNC)
            </h6>
            <Row className="g-3 text-center">
              <Col xs={4}>
                <div className="p-3 rounded-4" style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                  <small className="d-block fw-bold mb-1" style={{ color: '#38bdf8', fontSize: '0.75rem' }}>🚗 Ô TÔ</small>
                  <span className="fw-extrabold text-white fs-5">{bangGiaAdmin["Ô tô"]?.toLocaleString()}đ</span>
                </div>
              </Col>
              <Col xs={4}>
                <div className="p-3 rounded-4" style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                  <small className="d-block fw-bold mb-1" style={{ color: '#fbbf24', fontSize: '0.75rem' }}>🏍️ XE MÁY</small>
                  <span className="fw-extrabold text-warning fs-5">{bangGiaAdmin["Xe máy"]?.toLocaleString()}đ</span>
                </div>
              </Col>
              <Col xs={4}>
                <div className="p-3 rounded-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                  <small className="d-block fw-bold mb-1" style={{ color: '#f87171', fontSize: '0.75rem' }}>🚚 XE TẢI</small>
                  <span className="fw-extrabold fs-5" style={{ color: '#f87171' }}>{bangGiaAdmin["Xe tải"]?.toLocaleString()}đ</span>
                </div>
              </Col>
            </Row>
          </Card>

          {/* PHÂN CHIA KHU VỰC VÀ SƠ ĐỒ Ô TRỐNG */}
          <Row>
            <Col lg={4} className="mb-4">
              <h5 className="mb-3 fw-bold text-light">📍 Chọn Cơ Sở & Khu Vực</h5>
              <Accordion defaultActiveKey="0" alwaysOpen className="custom-modern-accordion">
                {Object.keys(cauTrucHaTang).map((tenCoSo, idx) => (
                  <Accordion.Item eventKey={String(idx)} key={idx} className="border-0 mb-3 overflow-hidden shadow-sm" style={{ borderRadius: '16px', backgroundColor: '#0f172a' }}>
                    <Accordion.Header>{tenCoSo}</Accordion.Header>
                    <Accordion.Body className="p-2" style={{ backgroundColor: '#0f172a' }}>
                      {Object.keys(cauTrucHaTang[tenCoSo]).map((tenKhuX, i) => {
                        const dataKhu = cauTrucHaTang[tenCoSo][tenKhuX];
                        const isSelected = coSoDangChon === tenCoSo && khuDangChon === tenKhuX;
                        return (
                          <div key={i} onClick={() => { setCoSoDangChon(tenCoSo); setKhuDangChon(tenKhuX); }} className="p-3 mb-2 rounded-4 text-white"
                            style={{ 
                              backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.12)' : '#1e293b',
                              border: isSelected ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.05)', cursor: 'pointer'
                            }}
                          >
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="fw-bold text-warning" style={{ fontSize: '0.9rem' }}>📍 Khu: {tenKhuX}</span>
                              <Badge bg="dark">Tổng: {dataKhu.tong} ô</Badge>
                            </div>
                            <span className="fw-bold" style={{ color: '#10b981', fontSize: '0.75rem' }}>● Trống: {dataKhu.trong}</span>
                          </div>
                        );
                      })}
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Col>

            <Col lg={8} className="mb-4">
              <Card className="p-4 border-0 h-100 shadow-lg" style={{ backgroundColor: '#0f172a', borderRadius: '24px' }}>
                <h5 className="fw-bold text-white mb-4">Sơ đồ phân phối ô đỗ: <span style={{ color: '#38bdf8' }}>{khuDangChon || "Chưa chọn"}</span></h5>
                <Row className="g-3">
                  {oDoHienThi.map((slot) => {
                    const adminChoPhep = slot.choPhepDatChoTruoc === "true" || slot.choPhepDatChoTruoc === true;
                    let bgBlock = "#1e293b", textColor = "#94a3b8", textStatus = "TẠI CỔNG", isClickable = false, borderStyle = "1px solid rgba(255,255,255,0.1)";

                    if (slot.trangThai === "Đầy") {
                      bgBlock = "rgba(239, 68, 68, 0.18)"; textColor = "#f87171"; textStatus = "CÓ XE"; borderStyle = "1.5px solid #ef4444";
                    } else if (slot.daBiDatTruoc) {
                      bgBlock = "rgba(245, 158, 11, 0.18)"; textColor = "#fbbf24"; textStatus = "ĐÃ GIỮ CHỖ"; borderStyle = "1.5px solid #f59e0b";
                    } else if (slot.trangThai === "Trống" && adminChoPhep) {
                      bgBlock = "rgba(16, 185, 129, 0.15)"; textColor = "#34d399"; textStatus = "ĐẶT ONLINE"; isClickable = true; borderStyle = "2px dashed #10b981";
                    }

                    return (
                      <Col key={slot.id} xs={4} sm={3}>
                        <div 
                          onClick={() => {
                            if (slot.daBiDatTruoc) {
                              handleOpenHuyDatChoModal(slot.bookingId, slot.tenBai, slot.bienSoXeDaDat);
                            } else if (isClickable) {
                              handleOpenBooking(slot);
                            }
                          }}
                          className="p-3 d-flex flex-column justify-content-center align-items-center rounded-4"
                          style={{ backgroundColor: bgBlock, border: borderStyle, height: '85px', cursor: 'pointer' }}
                        >
                          <span className="fw-extrabold text-white" style={{ fontSize: '1rem' }}>
                            {slot.tenBai.includes(" - ") ? slot.tenBai.split(" - ")[1] : slot.tenBai}
                          </span>
                          <small className="fw-bold mt-1" style={{ fontSize: '0.62rem', color: textColor }}>
                            {slot.daBiDatTruoc ? "XÁC MINH HỦY" : textStatus}
                          </small>
                        </div>
                      </Col>
                    );
                  })}
                </Row>
              </Card>
            </Col>
          </Row>

          {/* KHỐI GỬI Ý KIẾN / BÁO LỖI */}
          <Row className="g-4 mt-3">
            <Col md={6}>
              <Card className="p-4 border-0 h-100 shadow-lg" style={{ backgroundColor: '#0f172a', borderRadius: '24px' }}>
                <h5 className="fw-bold text-danger mb-2"> Phản Ánh Tới Bảo Vệ</h5>
                <Form onSubmit={handleGuiBaoVe}>
                  {guiBaoVeThanhCong && <Alert variant="success" className="py-2">✔️ Đã gửi tín hiệu!</Alert>}
                  {loiBienSoBaoVe && <Alert variant="danger" className="py-2">{loiBienSoBaoVe}</Alert>}
                  <Form.Group className="mb-3">
                    <Form.Control type="text" placeholder="Tên ô đỗ (Vd: Khu A - Ô 01)" className="text-white border-0 mb-2 py-2.5" style={{ backgroundColor: '#1e293b' }} value={tenODoBaoVe} onChange={(e) => setTenODoBaoVe(e.target.value)} required />
                    <Form.Control type="text" placeholder="Biển số vi phạm" className="text-white border-0 mb-2 py-2.5 text-uppercase" style={{ backgroundColor: '#1e293b' }} value={bienSoBaoVe} onChange={(e) => { setBienSoBaoVe(e.target.value); setLoiBienSoBaoVe(""); }} required />
                    <Form.Control as="textarea" rows={2} placeholder="Mô tả sự cố..." className="text-white border-0 py-2.5" style={{ backgroundColor: '#1e293b' }} value={noiDungBaoVe} onChange={(e) => setNoiDungBaoVe(e.target.value)} required />
                  </Form.Group>
                  <Button type="submit" variant="danger" className="fw-bold w-100 py-2.5">Gửi Ban Hiện Trường</Button>
                </Form>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="p-4 border-0 h-100 shadow-lg" style={{ backgroundColor: '#0f172a', borderRadius: '24px' }}>
                <h5 className="fw-bold text-info mb-2"> Góp Ý Chất Lượng (BQT)</h5>
                <Form onSubmit={handleGuiAdmin}>
                  {guiAdminThanhCong && <Alert variant="success" className="py-2"> Ý kiến đã được ghi nhận!</Alert>}
                  <Form.Group className="mb-3">
                    <Form.Control as="textarea" rows={4} placeholder="Nội dung đóng góp chất lượng dịch vụ..." className="text-white border-0 py-2.5" style={{ backgroundColor: '#1e293b' }} value={noiDungAdmin} onChange={(e) => setNoiDungAdmin(e.target.value)} required />
                  </Form.Group>
                  <Button type="submit" className="fw-bold w-100 text-dark py-2.5" style={{ backgroundColor: '#38bdf8', border: 'none' }}>Gửi Đóng Góp</Button>
                </Form>
              </Card>
            </Col>
          </Row>

          {/* NHẬT KÝ VÀ PHẢN HỒI HỆ THỐNG */}
          <Card className="p-4 border-0 mt-4 shadow-lg text-white" style={{ backgroundColor: '#0f172a', borderRadius: '24px' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold m-0 text-success"> Nhật Ký & Phản Hồi Từ Hệ Thống</h5>
              <span className="badge bg-secondary-subtle text-secondary small">Cập nhật tự động</span>
            </div>
            
            <div className="d-flex flex-column gap-3" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '6px' }}>
              {(!danhSachPhanHoiAdmin || danhSachPhanHoiAdmin.length === 0) && (!danhSachPhanHoiBaoVe || danhSachPhanHoiBaoVe.length === 0) ? (
                <div className="text-center text-muted py-4 small">
                   Bạn chưa gửi phản ánh nào hoặc chưa có phản hồi mới.
                </div>
              ) : (
                [...(danhSachPhanHoiAdmin || []), ...(danhSachPhanHoiBaoVe || [])].map((tin) => {
                  const daDuocXuLy = tin.trangThai === 'Đã phản hồi' || tin.sender === 'guard' || !!tin.phanHoiAdmin;
                  return (
                    <div 
                      key={tin.id} 
                      className="p-3 rounded-4" 
                      style={{ 
                        backgroundColor: '#1e293b', 
                        borderLeft: daDuocXuLy ? '4px solid #10b981' : '4px solid #64748b'
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className={`fw-bold small ${tin.sender === 'guard' || tin.phanHoiAdmin ? 'text-info' : 'text-warning'}`}>
                          {tin.sender === 'guard' || tin.phanHoiAdmin ? ' SECURITY phản hồi' : ' Phản ánh của bạn'}
                        </span>
                        <small className="text-white-50" style={{ fontSize: '0.75rem' }}>
                          {tin.thoiGian || tin.ngayTao || 'Vừa xong'}
                        </small>
                      </div>
                      <p className="m-0 small text-white-50 lh-base">{tin.noiDung}</p>
                      {daDuocXuLy && (
                        <div className="mt-2 pt-2 border-top border-secondary" style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px', padding: '8px' }}>
                          <small className="text-success d-block fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                            ✓ Đã xử lý phản hồi:
                          </small>
                          <p className="m-0 small text-white fw-semibold style-italic">
                            "{tin.phanHoiAdmin || tin.noiDung}"
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </>
      )} 

    

      {/* ================= VIEW 3: HỒ SƠ CÁ NHÂN ================= */}
      {currentView === "profile" && <TrangHoSo />}

      {/* ========================================================================= */}
      {/* Popups Modals */}
      {/* ========================================================================= */}
      
      {/* MODAL ĐẶT CHỖ */}
      <Modal show={showBookingModal} onHide={() => setShowBookingModal(false)} centered>
        <Modal.Body className="p-4" style={{ backgroundColor: '#0f172a', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div className="text-center mb-3">
            <h5 className="text-success fw-bold mb-1">⭐ GIỮ CHỖ TRỰC TUYẾN</h5>
            <p className="text-muted small m-0">Vị trí: <b className="text-white">{selectedSlot?.tenBai}</b></p>
          </div>

          {loiBienSoDat && <Alert variant="danger" className="py-2 border-0 small text-center rounded-3">{loiBienSoDat}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label className="text-muted small fw-bold">1. CHỌN LOẠI PHƯƠNG TIỆN ĐĂNG KÝ:</Form.Label>
            <Form.Select 
              className="text-white border-0 py-2.5" 
              style={{ backgroundColor: '#1e293b', borderRadius: '12px' }}
              value={loaiXeDat}
              onChange={(e) => setLoaiXeDat(e.target.value)}
            >
              <option value="Ô tô" style={{backgroundColor: '#0f172a'}}>🚗 Ô tô</option>
              <option value="Xe máy" style={{backgroundColor: '#0f172a'}}>🏍️ Xe máy</option>
              <option value="Xe tải" style={{backgroundColor: '#0f172a'}}>🚚 Xe tải</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="text-muted small fw-bold">2. NHẬP BIỂN SỐ XE:</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="VÍ DỤ: 29A-123.45" 
              className="text-white text-center fs-3 fw-bold text-uppercase border-0 py-2.5" 
              style={{ borderRadius: '16px', letterSpacing: '2px', backgroundColor: '#1e293b' }}
              value={bienSoDat} 
              onChange={(e) => {
                setBienSoDat(e.target.value);
                setLoiBienSoDat(""); 
              }} 
            />
          </Form.Group>

          <div className="p-3 mb-4 rounded-4 text-center" style={{ backgroundColor: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <span className="text-muted small d-block mb-1">Đơn giá áp dụng:</span>
            <span className="fs-4 fw-extrabold text-info">
              {bangGiaAdmin[loaiXeDat]?.toLocaleString() || 0}đ<small style={{fontSize: '12px', color: '#94a3b8'}}> / giờ</small>
            </span>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="link" className="text-muted text-decoration-none fw-semibold" onClick={() => setShowBookingModal(false)}>Đóng</Button>
            <Button variant="success" className="fw-bold text-dark px-4 py-2 border-0" style={{ borderRadius: '12px', backgroundColor: '#10b981' }} onClick={handleConfirmBooking} disabled={!bienSoDat.trim()}>Xác Nhận Giữ Chỗ</Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* MODAL HỦY CHỖ */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
        <Modal.Body className="p-4" style={{ backgroundColor: '#0f172a', borderRadius: '24px' }}>
          <div className="text-center mb-3">
            <h5 className="text-danger fw-bold mb-1"> XÁC THỰC HỦY GIỮ CHỖ</h5>
            <p className="text-muted small m-0">Vị trí: <b className="text-white">{slotMuonHuy?.tenBai}</b></p>
          </div>
          {loiXacNhanHuy && <Alert variant="danger" className="py-2 border-0 small text-center rounded-3">{loiXacNhanHuy}</Alert>}
          <Form.Group className="mb-4">
            <Form.Control type="text" placeholder="NHẬP BIỂN SỐ XE ĐỂ XÁC MINH HỦY" className="text-white text-center fs-4 fw-bold text-uppercase border-0 py-2.5" style={{ borderRadius: '12px', backgroundColor: '#1e293b' }} value={bienSoXacNhanHuy} onChange={(e) => { setBienSoXacNhanHuy(e.target.value); setLoiXacNhanHuy(""); }} />
          </Form.Group>
          <div className="d-flex justify-content-end gap-2">
            <Button variant="link" className="text-muted text-decoration-none small" onClick={() => setShowCancelModal(false)}>Quay Lại</Button>
            <Button variant="danger" className="fw-bold px-4 py-2 border-0" style={{ borderRadius: '12px', backgroundColor: '#dc2626' }} onClick={handleConfirmHuyDatCho}>Xác Nhận Hủy</Button>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default TrangKhachHang;