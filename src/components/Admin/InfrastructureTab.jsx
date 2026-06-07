import React, { useState } from 'react';
import { Accordion, Card, Button, Badge, Row, Col } from 'react-bootstrap';

function InfrastructureTab({ cauTrucHaTang, handleXoaO, handleOpenModal, handleToggleDatCho }) {
  // 1. LẤY DANH SÁCH CÁC CƠ SỞ ĐANG CÓ TỪ DỮ LIỆU GỐC
  const cacCoSo = Object.keys(cauTrucHaTang || {});
  const [coSoHienTai, setCoSoHienTai] = useState(cacCoSo[0] || 'Cơ sở 1 (HOLA)');

  // 2. TỰ ĐỘNG BÓC TÁCH VÀ GỘP CHÍNH XÁC: CƠ SỞ => KHU A, KHU B => Ô 01, Ô 02
  // Bỏ qua hoàn toàn logic phân cụm lỗi của helper, gom trực tiếp dựa trên tên bãi đỗ
  const duLieuKhuGộpChuan = {};
  
  // Duyệt qua toàn bộ các ô thuộc cơ sở đang chọn để gom nhóm theo Khu A, Khu B...
  if (cauTrucHaTang[coSoHienTai]) {
    // Phẳng hóa tất cả các ô trong cơ sở hiện tại ra để gom lại từ đầu
    const tatCaOTrongCoSo = Object.values(cauTrucHaTang[coSoHienTai]).flat();
    
    tatCaOTrongCoSo.forEach(o => {
      if (!o || !o.tenBai) return;
      
      // Mặc định nếu tên bãi là "KHU A - Ô 01" -> tách lấy chữ "KHU A" làm tên Khu
      let tenKhuVuc = "KHU VỰC CHUNG";
      if (o.tenBai.includes(' - ')) {
        tenKhuVuc = o.tenBai.split(' - ')[0].trim().toUpperCase();
      } else {
        // Fallback nếu chuỗi không có dấu gạch ngang (Ví dụ: "KHU A Ô 01")
        const match = o.tenBai.match(/^([a-zA-Z\sĂăÂâĐđÊêÔôƠơƯưỨứỨứẤấẦầẨẩẬậỚớỜờỞởỢợỆệỀềỂểỄễ]+)/);
        if (match) tenKhuVuc = match[1].trim().toUpperCase();
      }
      
      // Thêm ô đỗ vào đúng mảng của Khu vực đó
      if (!duLieuKhuGộpChuan[tenKhuVuc]) {
        duLieuKhuGộpChuan[tenKhuVuc] = [];
      }
      duLieuKhuGộpChuan[tenKhuVuc].push(o);
    });
  }

  // Sắp xếp các ô đỗ trong từng khu theo thứ tự tăng dần (Ô 01 -> Ô 02 -> Ô 10)
  Object.keys(duLieuKhuGộpChuan).forEach(khu => {
    duLieuKhuGộpChuan[khu].sort((a, b) => a.tenBai.localeCompare(b.tenBai, undefined, { numeric: true, sensitivity: 'base' }));
  });

  const danhSachPhanKhuChuan = Object.keys(duLieuKhuGộpChuan).sort();

  return (
    <div className="p-4 rounded-4 shadow" style={{ background: 'rgba(30, 41, 59, 0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
      
      {/* 📍 CẤP 1: CHỌN CƠ SỞ (HÒA LẠC, XUÂN THỦY...) */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4 pb-3 border-bottom border-secondary">
        <div className="d-flex gap-2 flex-wrap">
          {cacCoSo.length > 0 ? (
            cacCoSo.map((cs) => (
              <Button
                key={cs}
                variant={coSoHienTai === cs ? "primary" : "outline-light"}
                className="fw-bold px-4 py-2 rounded-3"
                onClick={() => setCoSoHienTai(cs)}
              >
                 {cs}
              </Button>
            ))
          ) : (
            <Badge bg="secondary" className="p-2 fs-6">Chưa có cơ sở nào</Badge>
          )}
        </div>
        
        {/* Giữ nguyên nút mở modal sinh bãi tự động của sếp */}
        <Button variant="success" className="fw-bold px-4 py-2 rounded-3 shadow-sm" onClick={handleOpenModal}>
          Quy Hoạch Thêm Khu Mới
        </Button>
      </div>

      <h4 className="fw-bold text-info mb-4"> Cơ sở: {coSoHienTai}</h4>

      {/* 🗂️ CẤP 2: DANH SÁCH CÁC KHU A, KHU B, KHU C (CLICK ĐỂ BUNG Ô BÊN TRONG) */}
      {danhSachPhanKhuChuan.length > 0 ? (
        <Accordion defaultActiveKey="0">
          {danhSachPhanKhuChuan.map((tenKhu, index) => {
            const cacOTrongKhu = duLieuKhuGộpChuan[tenKhu] || [];
            const soOTroTrongKhu = cacOTrongKhu.filter(o => o.trangThai === "Trống").length;

            return (
              <Accordion.Item eventKey={String(index)} key={tenKhu} className="mb-3 border-0 rounded-3 overflow-hidden shadow-sm">
                
                {/* Thanh tiêu đề hiển thị: Khu A, Khu B... */}
                <Accordion.Header>
                  <div className="d-flex justify-content-between align-items-center w-100 pe-3">
                    <span className="fw-bold text-dark fs-5"> {tenKhu}</span>
                    <div className="d-flex gap-2">
                      <Badge bg="primary" className="px-3 py-2 text-white fw-bold">
                        Tổng: {cacOTrongKhu.length} Slots
                      </Badge>
                      <Badge bg="success" className="px-3 py-2 text-white fw-bold">
                        Trống: {soOTroTrongKhu}
                      </Badge>
                    </div>
                  </div>
                </Accordion.Header>

                {/* 🚗 CẤP 3: CÁC Ô ĐỖ XE BÊN TRONG CỦA KHU ĐÓ VÀ CHỨC NĂNG THAO TÁC */}
                <Accordion.Body style={{ backgroundColor: '#1e293b' }} className="text-white p-4">
                  <Row className="g-3">
                    {cacOTrongKhu.map((o) => (
                      <Col xs={12} sm={6} md={4} lg={3} key={o.id}>
                        <Card className="h-100 border-0 bg-dark text-white rounded-3 shadow-sm">
                          <Card.Body className="d-flex flex-column justify-content-between p-3">
                            <div>
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <h6 className="fw-bold m-0 text-truncate text-warning"> {o.tenBai}</h6>
                                <Badge bg={o.trangThai === "Trống" ? "success" : "danger"} className="fw-bold">
                                  {o.trangThai}
                                </Badge>
                              </div>
                              <p className="small text-secondary mb-3">
                                Đặt trước: {o.choPhepDatChoTruoc === "true" ? (
                                  <span className="text-success fw-bold">Bật</span>
                                ) : (
                                  <span className="text-muted">Tắt</span>
                                )}
                              </p>
                            </div>

                            {/* Giữ nguyên 100% hai nút chức năng Khóa/Mở đặt chỗ và Xóa ô đỗ của sếp */}
                            <div className="d-flex gap-2 mt-2">
                              <Button 
                                size="sm" 
                                variant={o.choPhepDatChoTruoc === "true" ? "warning" : "outline-warning"} 
                                className="w-100 fw-bold small py-1"
                                onClick={() => handleToggleDatCho(o)}
                              >
                                {o.choPhepDatChoTruoc === "true" ? "Mở đặt" : "Khóa đặt"}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline-danger" 
                                className="fw-bold px-2 py-1"
                                onClick={() => handleXoaO(o.id, o.trangThai)}
                              >
                                🗑️
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Accordion.Body>
              </Accordion.Item>
            );
          })}
        </Accordion>
      ) : (
        <div className="text-center py-5 text-muted border border-dashed rounded-3">
          <p className="fs-5 mb-0"> Cơ sở này chưa có khu vực đỗ xe nào</p>
        </div>
      )}
    </div>
  );
}

export default InfrastructureTab;