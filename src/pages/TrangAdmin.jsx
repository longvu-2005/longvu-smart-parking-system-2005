import React, { useState, useEffect } from 'react';
import { Container, Button, Nav, Row, Col } from 'react-bootstrap'; // 👈 Thêm Row, Col vào đây 
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import { API_VEHICLES, API_LOTS } from '../constants/api';
import { locDanhSachXeTheoThoiGian, layCauTrucHaTang } from '../utils/adminHelpers';

import SummaryCards from '../components/Admin/SummaryCards';
import VehicleTab from '../components/Admin/VehicleTab';
import InfrastructureTab from '../components/Admin/InfrastructureTab';
import ChartsTab from '../components/Admin/ChartsTab';
import ModalSinhBai from '../components/Admin/ModalSinhBai';
import FeedbackTab from '../components/Admin/FeedbackTab';

function TrangAdmin() {
  const navigate = useNavigate();
  const [danhSachXe, setDanhSachXe] = useState([]);
  const [danhSachBai, setDanhSachBai] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sinhLoading, setSinhLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState('xe');
  
  const [giaOTo, setGiaOTo] = useState(() => Number(localStorage.getItem('giaOTo')) || 20000);
  const [giaXeMay, setGiaXeMay] = useState(() => Number(localStorage.getItem('giaXeMay')) || 5000);
  const [giaXeTai, setGiaXeTai] = useState(() => Number(localStorage.getItem('giaXeTai')) || 50000);
  const [isEditingGia, setIsEditingGia] = useState(false);
  const [boLocThoiGian, setBoLocThoiGian] = useState('7ngay');

  const [showModalBai, setShowModalBai] = useState(false);
  const [coSo, setCoSo] = useState('Cơ sở 1 (HOLA)'); // 💡 Giữ chuẩn định dạng khởi tạo ban đầu
  const [tenKhu, setTenKhu] = useState('');
  const [soLuongCho, setSoLuongCho] = useState(10);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resXe, resBai] = await Promise.all([axios.get(API_VEHICLES), axios.get(API_LOTS)]);
      setDanhSachXe(resXe.data || []);
      setDanhSachBai(resBai.data || []);
    } catch (error) { console.error("Lỗi đồng bộ:", error); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleToggleDatCho = async (bai) => {
    try {
      const trangThaiMoi = bai.choPhepDatChoTruoc === "true" ? "false" : "true";
      await axios.put(`${API_LOTS}/${bai.id}`, { ...bai, choPhepDatChoTruoc: trangThaiMoi });
      await fetchData();
    } catch (error) { alert("Lỗi khi cập nhật quyền đặt chỗ!"); }
  };

  const handleSinhTuDongBaiDo = async (e) => {
    e.preventDefault();
    if (!tenKhu.trim()) {
      alert("Vui lòng nhập tên khu trước khi xây dựng chỗ sếp ơi!");
      return;
    }
    setSinhLoading(true);
    try {
      const tenKhuChuan = tenKhu.trim().toUpperCase();
      for (let i = 1; i <= soLuongCho; i++) {
        await axios.post(API_LOTS, { 
          coSo, 
          phanKhu: tenKhuChuan, 
          tenBai: `${tenKhuChuan} - Ô ${i < 10 ? '0'+i : i}`, 
          trangThai: "Trống", 
          choPhepDatChoTruoc: "false" 
        });
      }
      setTenKhu('');
      setShowModalBai(false);
      await fetchData();
    } catch (error) { alert("Lỗi sinh ô!"); } 
    finally { setSinhLoading(false); }
  };

  const handleXoaO = async (id, trangThai) => {
    if (trangThai === "Đầy") return alert("Ô đang có xe!");
    if (window.confirm("Xác nhận xóa?")) {
      await axios.delete(`${API_LOTS}/${id}`);
      fetchData();
    }
  };

  // --- LOGIC CHUẨN HÓA KHÔNG LÀM MẤT DỮ LIỆU ---
  const danhSachXeDaChuanHoa = danhSachXe.map(xe => {
    let ngayRaChuan = null;
    if (xe.thoiGianRa && typeof xe.thoiGianRa === 'string') {
      const parts = xe.thoiGianRa.split(', ');
      if (parts.length === 2) {
        const dateParts = parts[0].split('/');
        const timeParts = parts[1].split(':');
        if (dateParts.length === 3 && timeParts.length === 3) {
          ngayRaChuan = new Date(dateParts[2], dateParts[1] - 1, dateParts[0], timeParts[0], timeParts[1], timeParts[2]);
        }
      }
    }
    const soTienNuột = Number(xe.tongTien) || Number(xe.soTien) || Number(xe.tien) || 0;
    return {
      ...xe,
      thoiGianRa: ngayRaChuan || xe.thoiGianRa,
      tongTien: soTienNuột,
      soTien: soTienNuột,
      tien: soTienNuột
    };
  });

  const { tongTien, dataChart } = locDanhSachXeTheoThoiGian(danhSachXeDaChuanHoa, boLocThoiGian);

  const danhSachBaiDaChuanHoa = danhSachBai.map(bai => {
    if (bai.phanKhu) return bai;
    let phanKhuTuDong = "KHU VỰC CHUNG";
    if (bai.tenBai && bai.tenBai.includes(' - ')) {
      phanKhuTuDong = bai.tenBai.split(' - ')[0].toUpperCase();
    } else if (bai.tenBai) {
      const match = bai.tenBai.match(/^([a-zA-Z\sĂăÂâĐđÊêÔôƠơƯưỨứỨứẤấẦầẨẩẬậỚớỜờỞởỢợỆệỀềỂểỄễ]+)/);
      if (match) phanKhuTuDong = match[1].trim().toUpperCase();
    }
    return {
      ...bai,
      phanKhu: phanKhuTuDong
    };
  });

  const cauTrucHaTang = layCauTrucHaTang(danhSachBaiDaChuanHoa);

  const styles = {
    pageContainer: {
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
      minHeight: '100vh',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    },
    headerGradient: {
      background: 'linear-gradient(45deg, #38bdf8, #818cf8, #c084fc)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    navWrapper: {
      background: 'rgba(30, 41, 59, 0.7)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
    },
    tabLink: (isActive) => ({
      color: isActive ? '#fff' : '#94a3b8',
      background: isActive ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' : 'transparent',
      borderRadius: '10px',
      transition: 'all 0.3s ease',
      fontWeight: '600',
      padding: '10px 20px',
      boxShadow: isActive ? '0 4px 15px rgba(59, 130, 246, 0.4)' : 'none',
    })
  };

  return (
  <div style={styles.pageContainer} className="text-white w-100 position-relative m-0">
    <Container className="pb-5 pt-3">
      
      {/* Header Section */}
      <div className="my-5">
        
        {/* 1. Tiêu đề luôn lên ĐẦU và CĂN GIỮA */}
        <div className="text-center mb-4">
          <h1 className="fw-black mb-1 tracking-tight" style={styles.headerGradient}>
            ADMINISTRATIVE MANAGEMENT SYSTEM
          </h1>
           <p className="text-white-50 small m-0 mt-1 font-monospace text-uppercase" style={{ letterSpacing: '0.1em', fontSize: '1rem' }}>
          Hệ thống quản lý quản trị
        </p>
        </div>
        
        {/* 2. Chia hàng: Bên TRÁI là nút chọn, bên PHẢI là menu tab đăng ký tổng */}
        <Row className="align-items-center gap-3 gap-md-0">
          
          {/* Cột Bên Trái: Chứa nút chọn */}
          <Col md={6} className="text-center text-md-start">
            <Button 
              variant="warning" 
              className="fw-bold"
              onClick={() => navigate('/admin/dang-ky-tong')}
            >
              🔑 Vào Trang Đăng Ký Tổng
            </Button>
          </Col>
          
          {/* Cột Bên Phải: Chứa các khung điều hướng tab */}
          <Col md={6} className="d-flex justify-content-center justify-content-md-end">
            <Nav 
              variant="pills" 
              activeKey={currentTab} 
              onSelect={setCurrentTab} 
              className="p-15 rounded-3 d-flex align-items-center flex-wrap"
              style={styles.navWrapper}
            >
              <Nav.Item className="m-1">
                <Nav.Link eventKey="xe" style={styles.tabLink(currentTab === 'xe')}>
                  🚗 Xe Ra Vào
                </Nav.Link>
              </Nav.Item>
              <Nav.Item className="m-1">
                <Nav.Link eventKey="bai" style={styles.tabLink(currentTab === 'bai')}>
                  🏢 Hạ Tầng
                </Nav.Link>
              </Nav.Item>
              <Nav.Item className="m-1">
                <Nav.Link eventKey="bieudo" style={styles.tabLink(currentTab === 'bieudo')}>
                  📈 Doanh Thu
                </Nav.Link>
              </Nav.Item>
              <Nav.Item className="m-1">
                <Nav.Link eventKey="gopy" style={styles.tabLink(currentTab === 'gopy')}>
                  📩 Góp Ý
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>

        </Row>
      </div>

      {/* Khối thống kê tổng quan (Giữ nguyên bên dưới) */}
      <div className="mb-5 animated fadeIn">
        <SummaryCards 
          soLuongBai={danhSachBai.length} 
          soXeTrongBai={danhSachXe.filter(x => x.trangThai !== "Đã xuất bãi").length} 
          tongTien={tongTien} 
        />
      </div>

        {/* Nội dung các Tab */}
        <div className="tab-content-wrapper transition-all">
          {currentTab === 'xe' && (
            <VehicleTab 
              xeTrongBai={danhSachXe.filter(x => x.trangThai !== "Đã xuất bãi")} 
              lichSuXeRa={danhSachXe.filter(x => x.trangThai === "Đã xuất bãi")} 
            />
          )}
          
          {currentTab === 'bai' && (
            <InfrastructureTab 
              cauTrucHaTang={cauTrucHaTang} 
              handleXoaO={handleXoaO} 
              handleOpenModal={() => setShowModalBai(true)}
              handleToggleDatCho={handleToggleDatCho}
            />
          )}

          {currentTab === 'bieudo' && (
            <ChartsTab 
              dataChart={dataChart} 
              boLocThoiGian={boLocThoiGian} 
              setBoLocThoiGian={setBoLocThoiGian} 
              giaOTo={giaOTo} setGiaOTo={setGiaOTo} 
              giaXeMay={giaXeMay} setGiaXeMay={setGiaXeMay} 
              giaXeTai={giaXeTai} setGiaXeTai={setGiaXeTai} 
              isEditingGia={isEditingGia} 
              setIsEditingGia={setIsEditingGia} 
            />
          )}
          
          {currentTab === 'gopy' && <FeedbackTab />}
        </div>

        {/* Modal cấu hình sinh bài */}
        <ModalSinhBai 
          show={showModalBai} 
          onHide={() => setShowModalBai(false)} 
          sinhLoading={sinhLoading} 
          handleSinhTuDongBaiDo={handleSinhTuDongBaiDo} 
          coSo={coSo} setCoSo={setCoSo} 
          tenKhu={tenKhu} setTenKhu={setTenKhu} 
          soLuongCho={soLuongCho} setSoLuongCho={setSoLuongCho} 
        />
      </Container>
    </div>
  );
}

export default TrangAdmin;