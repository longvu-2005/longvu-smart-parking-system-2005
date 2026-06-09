import React, { useState, useEffect } from 'react';
import { Table, Badge, Card, Spinner, Button, Modal } from 'react-bootstrap';
import axios from 'axios';

// Định nghĩa Endpoint API của bạn
import { API_LOTSS } from '../constants/api'; 

function TrangLichSu() {
  const [danhSachLichSu, setDanhSachLichSu] = useState([]);
  const [dangTaiDuLieu, setDangTaiDuLieu] = useState(true);
  const [veChiTiet, setVeChiTiet] = useState(null);
  const [showModalVe, setShowModalVe] = useState(false);

  // Hàm tải dữ liệu lịch sử từ Server và phân loại theo tài khoản
 const taiDuLieuLichSu = async () => {
  try {
    setDangTaiDuLieu(true);

    const res = await axios.get(API_LOTSS);
    const tatCaDon = res.data || [];

    // Tài khoản đang đăng nhập
    const taiKhoanHienTai = String(
      localStorage.getItem("taiKhoan") || ""
    )
      .trim()
      .toLowerCase();

    // Chỉ lấy lịch sử của chính tài khoản đó
    const lichSuCaNhan = tatCaDon.filter((don) => {
      const tkDon = String(
        don.taiKhoan || ""
      )
        .trim()
        .toLowerCase();

      return tkDon === taiKhoanHienTai;
    });

    // Mới nhất lên đầu
    setDanhSachLichSu([...lichSuCaNhan].reverse());

  } catch (error) {
    console.error("Lỗi tải lịch sử đỗ xe:", error);
  } finally {
    setDangTaiDuLieu(false);
  }
};

  useEffect(() => {
    taiDuLieuLichSu();
  }, []);

  // Xem chi tiết vé điện tử dạng Modal
  const xemChiTietVe = (ve) => {
    setVeChiTiet(ve);
    setShowModalVe(true);
  };

  return (
    <Card className="p-4 border-0 shadow-lg text-white" style={{ backgroundColor: '#0f172a', borderRadius: '24px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold m-0" style={{ 
          background: 'linear-gradient(135deg, #38bdf8, #6366f1)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textTransform: 'uppercase'
        }}>
          🗓️ Lịch Sử Đỗ Xe Cá Nhân
        </h4>
        <Button variant="outline-info" size="sm" className="rounded-3" onClick={taiDuLieuLichSu}>
          🔄 Làm mới dữ liệu
        </Button>
      </div>

      {dangTaiDuLieu ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="info" className="mb-2" />
          <p className="text-muted small">Đang đồng bộ lịch sử đỗ xe...</p>
        </div>
      ) : danhSachLichSu.length === 0 ? (
        <div className="text-center py-5 rounded-4" style={{ backgroundColor: '#1e293b', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <span style={{ fontSize: '3rem' }}>📭</span>
          <p className="fw-semibold text-muted mt-3 mb-0">Bạn chưa có lịch sử đỗ xe nào trong hệ thống!</p>
          <small className="text-white-50">Mọi lượt đặt chỗ hoặc lượt xe ra/vào bãi của riêng bạn sẽ xuất hiện tại đây.</small>
        </div>
      ) : (
        <div className="table-responsive rounded-4 shadow-sm" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <Table hover responsive className="m-0 align-middle custom-dark-table" style={{ backgroundColor: '#1e293b', color: '#e2e8f0' }}>
            <thead style={{ backgroundColor: '#0f172a', color: '#94a3b8' }}>
              <tr className="border-bottom border-secondary text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                <th className="py-3 ps-4">Biển Số</th>
                <th className="py-3">Loại Xe</th>
                <th className="py-3">Cơ Sở</th>
                <th className="py-3">Vị Trí Đỗ</th>
                <th className="py-3">Thời Gian Vào</th>
                <th className="py-3">Thời Gian Ra</th>
                <th className="py-3">Trạng Thái</th>
                <th className="py-3 pe-4 text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {danhSachLichSu.map((don, index) => {
                let variantBadge = "secondary";
                let textTrangThai = don.trangThai || "Chờ xử lý";
                
                // Chuẩn hóa và làm đẹp trạng thái
                if (textTrangThai === "Đã xuất bãi" || textTrangThai === "Đã hoàn thành" || textTrangThai === "Đã rời bãi") {
                  variantBadge = "info";
                  textTrangThai = "Đã xuất bãi";
                } else if (textTrangThai === "Đang đỗ" || textTrangThai === "Đang trong bãi") {
                  variantBadge = "success";
                  textTrangThai = "Đang đỗ";
                } else if (textTrangThai === "Đã đặt trước" || textTrangThai === "Đang giữ chỗ") {
                  variantBadge = "warning";
                  textTrangThai = "Đã đặt trước";
                }

                // Đọc linh hoạt tên trường từ API thực tế của bạn
                const hienThiViTri = don.viTri || don.vitri || don.tenBai || "Chưa rõ";
                const hienThiTGThucVao = don.thoiGianVao || don.thoiGianDat || "---";

                return (
                  <tr key={don.id || index} className="border-bottom border-secondary-subtle" style={{ backgroundColor: '#1e293b' }}>
                    <td className="py-3 ps-4 fw-bold">
                      <Badge bg="dark" className="text-info border border-info text-uppercase px-2.5 py-1.5" style={{ letterSpacing: '1px' }}>
                        {don.bienSo}
                      </Badge>
                    </td>
                    <td className="py-3 text-white-50">{don.loaiXe || "Ô tô"}</td>
                    <td className="py-3 fw-semibold">{don.coSo || "Cơ sở 1 (HOLA)"}</td>
                    <td className="py-3 text-warning fw-bold">{hienThiViTri}</td> 
                    <td className="py-3 text-white-50" style={{ fontSize: '0.85rem' }}>{hienThiTGThucVao}</td>
                    <td className="py-3 text-white-50" style={{ fontSize: '0.85rem' }}>{don.thoiGianRa || "---"}</td>
                    <td className="py-3">
                      <Badge bg={variantBadge} className="text-dark fw-bold px-2 py-1.5 rounded-2">
                        {textTrangThai}
                      </Badge>
                    </td>
                    <td className="py-3 pe-4 text-center">
                      <Button variant="outline-light" size="sm" className="fw-semibold px-2.5 py-1 rounded-3" style={{ fontSize: '11px' }} onClick={() => xemChiTietVe(don)}>
                        🎟️ Xem Vé
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      )}

      {/* MODAL CHI TIẾT VẾ ĐIỆN TỬ */}
      <Modal show={showModalVe} onHide={() => setShowModalVe(false)} centered>
        <Modal.Body className="p-4" style={{ backgroundColor: '#0f172a', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div className="text-center mb-4 pb-3 border-bottom border-secondary">
            <h5 className="text-info fw-bold mb-1">🎫 VÉ XE ĐIỆN TỬ SMART PARKING</h5>
            <small className="text-muted text-uppercase">Mã giao dịch: #{veChiTiet?.id || "N/A"}</small>
          </div>

          <div className="d-flex flex-column gap-3 text-white mb-4">
            <div className="d-flex justify-content-between">
              <span className="text-muted">Biển số xe:</span>
              <span className="fw-bold text-info text-uppercase">{veChiTiet?.bienSo}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-muted">Loại xe:</span>
              <span className="fw-semibold">{veChiTiet?.loaiXe || "Ô tô"}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-muted">Vị trí đỗ:</span>
              <span className="fw-bold text-warning">{veChiTiet?.viTri || veChiTiet?.vitri || veChiTiet?.tenBai}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-muted">Cơ sở:</span>
              <span className="fw-semibold">{veChiTiet?.coSo || "Cơ sở 1 (HOLA)"}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-muted">Thời gian vào:</span>
              <span className="fw-semibold text-white-50 small">{veChiTiet?.thoiGianVao || veChiTiet?.thoiGianDat || "---"}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-muted">Thời gian ra:</span>
              <span className="fw-semibold text-white-50 small">{veChiTiet?.thoiGianRa || "---"}</span>
            </div>
            <div className="d-flex justify-content-between border-top border-secondary pt-2">
              <span className="text-muted">Tổng tiền thanh toán:</span>
              <span className="fw-bold text-success">
                {veChiTiet?.tongTien ? `${veChiTiet.tongTien.toLocaleString('vi-VN')} VNĐ` : "5.000 VNĐ"}
              </span>
            </div>
            <div className="d-flex justify-content-between border-top border-secondary pt-2">
              <span className="text-muted">Trạng thái kiểm soát:</span>
              <span className="fw-bold text-info">{veChiTiet?.trangThai}</span>
            </div>
          </div>

          <div className="text-center bg-white p-3 rounded-4 mb-4 shadow-sm" style={{ maxWidth: '180px', margin: '0 auto' }}>
            <div style={{ width: '150px', height: '150px', backgroundColor: '#e2e8f0', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
              <span className="text-dark fw-bold" style={{ fontSize: '10px', textAlign: 'center' }}>[ QR CODE ]<br/>SUCCESS<br/>#{veChiTiet?.id}</span>
            </div>
            <small className="text-dark d-block fw-bold mt-2" style={{ fontSize: '10px' }}>Vé hợp lệ tại cổng ra/vào</small>
          </div>

          <div className="d-flex justify-content-center">
            <Button variant="secondary" className="fw-bold px-4 rounded-3" onClick={() => setShowModalVe(false)}>
              Đóng Cửa Sổ
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </Card>
  );
}

export default TrangLichSu;