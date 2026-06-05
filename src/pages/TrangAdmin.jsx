import React, { useState, useEffect } from 'react';
import { Container, Nav, Button } from 'react-bootstrap'; 
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
  const [coSo, setCoSo] = useState('Cơ sở 1 (Hòa Lạc)');
  const [tenKhu, setTenKhu] = useState('');
  const [soLuongCho, setSoLuongCho] = useState(10);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resXe, resBai] = await Promise.all([axios.get(API_VEHICLES), axios.get(API_LOTS)]);
      setDanhSachXe(resXe.data);
      setDanhSachBai(resBai.data);
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
    setSinhLoading(true);
    try {
      for (let i = 1; i <= soLuongCho; i++) {
        await axios.post(API_LOTS, { coSo, tenBai: `${tenKhu.toUpperCase()} - Ô ${i < 10 ? '0'+i : i}`, trangThai: "Trống", choPhepDatChoTruoc: "false" });
      }
      setShowModalBai(false);
      fetchData();
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

  const { tongTien, dataChart } = locDanhSachXeTheoThoiGian(danhSachXe, boLocThoiGian);
  const cauTrucHaTang = layCauTrucHaTang(danhSachBai);

  // Định nghĩa style inline cho các hiệu ứng hiện đại (Glassmorphism & Gradient)
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
        <div className="my-5 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">
          <div>
            <h1 className="fw-black mb-1 tracking-tight" style={styles.headerGradient}>
               HỆ THỐNG QUẢN TRỊ ADMIN
            </h1>
            {/* 🔑 ĐÃ ĐỔI ĐƯỜNG DẪN KHỚP VỚI APP.JSX CỦA SẾP */}
            <Button 
              variant="warning" 
              className="fw-bold mt-2"
              onClick={() => navigate('/admin/dang-ky-tong')}
            >
              🔑 Vào Trang Đăng Ký Tổng
            </Button>
          </div>
          
          {/* Navigation Tabs cải tiến cực mượt */}
          <Nav 
            variant="pills" 
            activeKey={currentTab} 
            onSelect={setCurrentTab} 
            className="p-15 rounded-3 d-flex align-items-center"
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
        </div>

        {/* Khối thống kê tổng quan */}
        <div className="mb-5 animated fadeIn">
          <SummaryCards 
            soLuongBai={danhSachBai.length} 
            soXeTrongBai={danhSachXe.filter(x => x.trangThai !== "Đã xuất bãi").length} 
            tongTien={tongTien} 
          />
        </div>

        {/* Nội dung các Tab được bọc trong các container mịn màng */}
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