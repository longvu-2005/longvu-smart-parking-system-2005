import React, { useState, useEffect } from 'react';
import { Container, Button, Card, Form, InputGroup } from 'react-bootstrap';
import axios from 'axios'; 

import { API_VEHICLES, API_LOTS, API_LOTSS, API_MESSAGES } from '../constants/api'; 
import { layXeDangInBai } from '../utils/securityHelpers'; 
import VehicleTable from '../components/Security/VehicleTable';
import ModalCheckIn from '../components/Security/ModalCheckIn';

function TrangSecurity() {
  const [danhSachXe, setDanhSachXe] = useState([]);
  const [danhSachBai, setDanhSachBai] = useState([]);
  const [danhSachSlotsOnline, setDanhSachSlotsOnline] = useState([]); 
  const [danhSachTinNhan, setDanhSachTinNhan] = useState([]); 
  const [showModal, setShowModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterLoaiXe, setFilterLoaiXe] = useState("Tất cả"); 
  const [bienSo, setBienSo] = useState("");
  const [loaiXe, setLoaiXe] = useState("Ô tô"); 
  const [coSoChon, setCoSoChon] = useState("Cơ sở 1 (HOLA)"); 
  const [viTri, setViTri] = useState("");

  const [noiDungPhanHoi, setNoiDungPhanHoi] = useState({});

  const fetchData = async () => {
    try {
      const [resXe, resBai, resSlots, resMessages] = await Promise.all([
        axios.get(API_VEHICLES), axios.get(API_LOTS), axios.get(API_LOTSS), axios.get(API_MESSAGES)
      ]);
      setDanhSachXe(resXe.data || []);
      setDanhSachBai(resBai.data || []);
      setDanhSachSlotsOnline(resSlots.data || []); 
      setDanhSachTinNhan((resMessages.data || []).filter(item => item.loaiTinNhan === "chat_user_guard").reverse());
    } catch (error) { console.error("Lỗi đồng bộ dữ liệu:", error); }
  };

  useEffect(() => { fetchData(); const interval = setInterval(fetchData, 30000); return () => clearInterval(interval); }, []);

  const xeDaLoc = layXeDangInBai(danhSachXe).filter(xe => {
    const matchSearch = xe.bienSo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchLoaiXe = filterLoaiXe === "Tất cả" || xe.loaiXe === filterLoaiXe;
    return matchSearch && matchLoaiXe;
  });

  // --- Logic Xe Ra (ĐÃ ĐỒNG BỘ GIÁ TỪ ADMIN) ---
  const handleChoXeRa = async (xe) => {
    if (!window.confirm(`Xác nhận cho xe ${xe.bienSo} xuất bãi?`)) return;
    
    const thoiGianVao = new Date(xe.thoiGianVao);
    const thoiGianRa = new Date();
    const soGio = Math.max(1, Math.ceil((thoiGianRa - thoiGianVao) / (1000 * 60 * 60)));
    
    // ĐỒNG BỘ ĐƠN GIÁ TỪ ADMIN LƯU TRONG LOCALSTORAGE TẠI ĐÂY SẾP ƠI
    const giaOToAdmin = Number(localStorage.getItem('giaOTo')) || 20000;
    const giaXeMayAdmin = Number(localStorage.getItem('giaXeMay')) || 5000;
    const giaXeTaiAdmin = Number(localStorage.getItem('giaXeTai')) || 50000;

    // Chọn đúng đơn giá Admin cấu hình dựa trên loại xe
    const donGia = xe.loaiXe === "Ô tô" ? giaOToAdmin : (xe.loaiXe === "Xe tải" ? giaXeTaiAdmin : giaXeMayAdmin);
    const tongTien = soGio * donGia;

    await axios.put(`${API_VEHICLES}/${xe.id}`, { 
      ...xe, 
      trangThai: "Đã xuất bãi", 
      thoiGianRa: thoiGianRa.toLocaleString('vi-VN'),
      tongTien: tongTien 
    });

    const oMoLai = danhSachBai.find(b => b.coSo === xe.coSo && b.tenBai === xe.viTri);
    if (oMoLai) await axios.put(`${API_LOTS}/${oMoLai.id}`, { ...oMoLai, trangThai: "Trống" });
    
    alert(`Xe ${xe.bienSo} đã xuất bãi. Tổng tiền tính theo giá Admin (${donGia.toLocaleString()}đ/h x ${soGio}h): ${tongTien.toLocaleString()}đ`);
    fetchData();
  };

  // --- Logic Xe Vào ---
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    const xeTrung = danhSachXe.find(x => x.bienSo.toUpperCase() === bienSo.toUpperCase() && x.trangThai === "Đang trong bãi");
    if (xeTrung) {
      alert(`❌ Lỗi: Xe ${bienSo.toUpperCase()} đã có trong bãi tại vị trí ${xeTrung.viTri}`);
      return;
    }

    try {
      await axios.post(API_VEHICLES, { 
        bienSo: bienSo.toUpperCase(), 
        loaiXe, 
        coSo: coSoChon, 
        viTri, 
        thoiGianVao: new Date().toLocaleString('vi-VN'), 
        trangThai: "Đang trong bãi", 
        tongTien: 0 
      });
      
      const oChon = danhSachBai.find(b => b.coSo === coSoChon && b.tenBai === viTri);
      if (oChon) await axios.put(`${API_LOTS}/${oChon.id}`, { ...oChon, trangThai: "Đầy" });
      
      const xeOnlineTrung = danhSachSlotsOnline.find(s => s.bienSo?.toUpperCase() === bienSo.toUpperCase());
      if (xeOnlineTrung) await axios.delete(`${API_LOTSS}/${xeOnlineTrung.id}`);
      
      setShowModal(false);
      setBienSo("");
      fetchData();
    } catch (err) { alert("Lỗi hệ thống khi tiếp nhận xe!"); }
  };

  // --- HÀM XỬ LÝ PHẢN HỒI ---
  const handleGuiPhanHoi = async (tinNhanGocId, userId) => {
    const textPhanHoi = noiDungPhanHoi[tinNhanGocId];
    if (!textPhanHoi || !textPhanHoi.trim()) {
      alert("Sếp vui lòng điền nội dung trước khi phản hồi nhé!");
      return;
    }

    try {
      await axios.post(API_MESSAGES, {
        userId: userId || "Unknow", 
        sender: "guard",            
        noiDung: textPhanHoi.trim(),
        loaiTinNhan: "chat_user_guard",
        thoiGian: new Date().toLocaleString('vi-VN')
      });

      alert("Gửi phản hồi thành công sếp ơi!");
      setNoiDungPhanHoi(prev => ({ ...prev, [tinNhanGocId]: "" }));
      fetchData(); 
    } catch (error) { alert("Lỗi khi gửi tin nhắn phản hồi!"); }
  };

  return (
    <Container className="pb-5 mt-3">
      {/* 🛡️ BANNER TIÊU ĐỀ KHÔNG GIAN ĐIỀU KHIỂN */}
      <div className="text-center mb-4 position-relative py-3 rounded-4" style={{ background: 'linear-gradient(180deg, rgba(6, 182, 212, 0.1) 0%, rgba(6, 182, 212, 0) 100%)' }}>
        <h2 className="text-center m-0 text-info fw-extrabold tracking-wider fs-3" style={{ textShadow: '0 0 15px rgba(6, 182, 212, 0.4)' }}>
          🛡️ SMARTPARK SECURITY GATE
        </h2>
        <p className="text-white-50 small m-0 mt-1 font-monospace text-uppercase" style={{ letterSpacing: '0.1em', fontSize: '0.75rem' }}>
          Hệ thống điều phối an ninh & kiểm soát ra vào bãi
        </p>
      </div>
      
      {/* 🟩 BẢNG ĐIỀU KHIỂN TRUNG TÂM (GLASS CARD FULL TÍNH NĂNG) */}
      <Card 
        className="p-4 border-0 shadow-lg text-white" 
        style={{ 
          background: 'rgba(30, 41, 59, 0.45)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '24px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* THANH ĐIỀU HƯỚNG TÁC VỤ VÀ NÚT CHECK-IN */}
        <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <div className="d-flex align-items-center gap-2">
            <span className="p-2 rounded-3 bg-info bg-opacity-10 text-info d-flex align-items-center justify-content-center">
              🎛️
            </span>
            <div>
              <h6 className="m-0 fw-bold text-white">Quản Lý Luồng Xe Hiện Tại</h6>
              <small className="text-white-50" style={{ fontSize: '0.75rem' }}>Tìm kiếm, lọc danh sách và điều phối xe xuất bãi</small>
            </div>
          </div>

          {/* NÚT TIẾP NHẬN XE ĐÃ ĐƯỢC THU GỌN TINH TẾ */}
          <Button 
            variant="success" 
            className="fw-bold px-4 py-2.5 shadow-sm border-0 d-flex align-items-center gap-2 rounded-3 transition-all" 
            style={{ 
              backgroundColor: '#10b981',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
              fontSize: '0.9rem'
            }} 
            onClick={() => setShowModal(true)}
          >
             TIẾP NHẬN XE VÀO BÃI
          </Button>
        </div>

        {/* COMPONENT THÀNH PHẦN BÊN TRONG BẢNG */}
        <VehicleTable 
          xeDangHienThi={xeDaLoc} 
          handleChoXeRa={handleChoXeRa}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          filterLoaiXe={filterLoaiXe} setFilterLoaiXe={setFilterLoaiXe}
        />
      </Card>

     {/* 🚨 HỘP THƯ PHẢN ÁNH HIỆN TRƯỜNG - UI MODERN DASHBOARD */}
      <div className="mt-5 p-4 rounded-4 shadow-lg text-white" style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h6 className="fw-bold m-0 text-uppercase tracking-wider" style={{ color: '#f8fafc', fontSize: '0.95rem' }}>
            🚨 Hộp Thư Phản Ánh Hiện Trường
          </h6>
          <span className="badge bg-danger-subtle text-danger px-2.5 py-1.5 fw-semibold" style={{ fontSize: '0.75rem' }}>
            Live Feed
          </span>
        </div>

        {/* Lọc danh sách: Chỉ duyệt qua các tin nhắn gốc từ Khách hàng để lồng câu trả lời vào trong */}
        {danhSachTinNhan.filter(tin => tin.sender !== 'guard').length === 0 ? (
          <div className="text-center text-muted py-5 small">
            🍃 Hiện tại chưa nhận được phản ánh nào từ hiện trường.
          </div>
        ) : (
          danhSachTinNhan
            .filter(tin => tin.sender !== 'guard') 
            .map(tin => {
              // Tìm câu trả lời tương ứng của Bảo vệ cho tin nhắn này (nếu có)
              // Giả định DB của sếp map qua tin.id hoặc tin.phanHoiAdmin. 
              // Nếu sếp lưu tin trả lời thành dòng riêng, dùng: danhSachTinNhan.find(t => t.replyTo === tin.id)
              const cauTraLoiCuaBaoVe = tin.phanHoiAdmin; 

              return (
                <div key={tin.id} className="p-3 mb-4 rounded-4 transition-all" style={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.03)' }}>
                  
                  {/* --- KHỐI TIN NHẮN GỐC CỦA KHÁCH HÀNG --- */}
                  {/* --- KHỐI TIN NHẮN GỐC CỦA KHÁCH HÀNG --- */}
<div className="d-flex justify-content-between align-items-start mb-2">
  <div className="d-flex align-items-center gap-2">
    <span className="badge bg-danger text-uppercase font-monospace fw-bold" style={{ fontSize: '0.7rem', padding: '5px 8px' }}>
      👤 KH (ID: {tin.userId || 'Ẩn danh'})
    </span>
  </div>
  
  {/* 🟢 ĐÃ ĐỔI: Hiển thị thời gian gửi thực tế từ database (Định dạng: Giờ:Phút Ngày/Tháng) */}
  <small className="text-white-50 font-monospace" style={{ fontSize: '0.75rem' }}>
    {tin.thoiGian || tin.ngayTao ? (
      new Date(tin.thoiGian || tin.ngayTao).toLocaleString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit', 
        day: '2-digit', 
        month: '2-digit' 
      })
    ) : (
      "Không rõ thời gian" /* Trường hợp dự phòng nếu data bị trống mốc thời gian */
    )}
  </small>
</div>
                  
                  {/* Nội dung khách gửi */}
                  <p className="m-0 text-slate-200 fs-6 pl-1" style={{ color: '#e2e8f0', whiteSpace: 'pre-line' }}>
                    {tin.noiDung}
                  </p>

                  {/* --- CÂU TRẢ LỜI LỒNG NGAY PHÍA DƯỚI (NẾU ĐÃ CÓ) --- */}
                  {cauTraLoiCuaBaoVe ? (
                    <div className="mt-3 p-3 rounded-3" style={{ backgroundColor: 'rgba(16, 185, 129, 0.06)', borderLeft: '3px solid #10b981', marginLeft: '10px' }}>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="text-success fw-bold text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '0.02em' }}>
                           Phản hồi từ Bảo Vệ
                        </span>
                      </div>
                      <p className="m-0 text-white-50 small fw-medium style-italic">
                        "{cauTraLoiCuaBaoVe}"
                      </p>
                    </div>
                  ) : (
                    /* --- FORM NHẬP PHẢN HỒI (CHỈ HIỂN THỊ KHI CHƯA TRẢ LỜI) --- */
                    <div className="mt-3 pt-3 border-top" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                      <InputGroup size="sm" className="shadow-sm">
                        <Form.Control
                          type="text"
                          placeholder="Nhập nội dung xử lý / phản hồi nhanh tới khách..."
                          style={{ backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '8px 12px', fontSize: '0.85rem' }}
                          className="rounded-start-3"
                          value={noiDungPhanHoi[tin.id] || ""}
                          onChange={(e) => setNoiDungPhanHoi(prev => ({ ...prev, [tin.id]: e.target.value }))}
                        />
                        <Button 
                          variant="success" 
                          className="fw-bold px-3 rounded-end-3 d-flex align-items-center gap-1" 
                          style={{ fontSize: '0.85rem', backgroundColor: '#10b981', border: 'none' }}
                          disabled={!noiDungPhanHoi[tin.id]?.trim()}
                          onClick={() => handleGuiPhanHoi(tin.id, tin.userId)}
                        >
                           Gửi USER
                        </Button>
                      </InputGroup>
                    </div>
                  )}

                </div>
              );
            })
        )}
      </div>

      {/* Giữ nguyên ModalCheckIn phía dưới của sếp */}
      <ModalCheckIn
        show={showModal} onHide={() => setShowModal(false)} handleSubmit={handleSubmit}
        bienSo={bienSo} setBienSo={setBienSo} loaiXe={loaiXe} setLoaiXe={setLoaiXe}
        coSoChon={coSoChon} setCoSoChon={setCoSoChon} viTri={viTri} setViTri={setViTri}
        oTrongTheoCoSo={danhSachBai.filter(b => 
          b.trangThai === "Trống" && 
          b.coSo === coSoChon && 
          b.tenBai && b.tenBai.length > 0
        )} 
        danhSachSlotsOnline={danhSachSlotsOnline}
      />

      <ModalCheckIn
        show={showModal} onHide={() => setShowModal(false)} handleSubmit={handleSubmit}
        bienSo={bienSo} setBienSo={setBienSo} loaiXe={loaiXe} setLoaiXe={setLoaiXe}
        coSoChon={coSoChon} setCoSoChon={setCoSoChon} viTri={viTri} setViTri={setViTri}
        oTrongTheoCoSo={danhSachBai.filter(b => 
          b.trangThai === "Trống" && 
          b.coSo === coSoChon && 
          b.tenBai && b.tenBai.length > 0
        )} 
        danhSachSlotsOnline={danhSachSlotsOnline}
      />
    </Container>
  );
}
export default TrangSecurity;