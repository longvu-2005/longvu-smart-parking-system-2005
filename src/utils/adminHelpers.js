export const locDanhSachXeTheoThoiGian = (danhSachXe, boLocThoiGian) => {
  const xeDaRa = danhSachXe.filter(xe => xe.trangThai === "Đã xuất bãi");
  let chartFormat = [];
  let tongTienLoc = 0;

  const bayGio = new Date();
  const chuoiHomNay = bayGio.toLocaleDateString('vi-VN'); 

  // Trường hợp 1: Bộ lọc HÔM NAY
  if (boLocThoiGian === 'homnay') {
    const cacKhungGio = {
      '06:00': { doanhThu: 0, luongXe: 0 },
      '09:00': { doanhThu: 0, luongXe: 0 },
      '12:00': { doanhThu: 0, luongXe: 0 },
      '15:00': { doanhThu: 0, luongXe: 0 },
      '18:00': { doanhThu: 0, luongXe: 0 },
      '21:00': { doanhThu: 0, luongXe: 0 }
    };

    xeDaRa.forEach(xe => {
      if (!xe.thoiGianRa) return;
      if (xe.thoiGianRa.includes(chuoiHomNay) || true) { 
        tongTienLoc += Number(xe.soTien || 0);
        const timGio = xe.thoiGianRa.match(/(\d{1,2}):/);
        if (timGio) {
          const gio = parseInt(timGio[1]);
          let mocGio = '21:00';
          if (gio < 9) mocGio = '06:00';
          else if (gio < 12) mocGio = '09:00';
          else if (gio < 15) mocGio = '12:00';
          else if (gio < 18) mocGio = '15:00';
          else if (gio < 21) mocGio = '18:00';

          cacKhungGio[mocGio].doanhThu += Number(xe.soTien || 0);
          cacKhungGio[mocGio].luongXe += 1;
        }
      }
    });

    chartFormat = Object.keys(cacKhungGio).map(g => ({
      name: g,
      doanhThu: cacKhungGio[g].doanhThu,
      luongXe: cacKhungGio[g].luongXe
    }));
  } 
  // Trường hợp 2: Bộ lọc 1 THÁNG QUA
  else if (boLocThoiGian === '1thang') {
    const cacTuanTrongThang = {
      'Tuần 1': { doanhThu: 0, luongXe: 0 },
      'Tuần 2': { doanhThu: 0, luongXe: 0 },
      'Tuần 3': { doanhThu: 0, luongXe: 0 },
      'Tuần 4': { doanhThu: 0, luongXe: 0 }
    };

    xeDaRa.forEach(xe => {
      if (!xe.thoiGianRa) return;
      tongTienLoc += Number(xe.soTien || 0);
      const timNgay = xe.thoiGianRa.match(/(\d{1,2})\//);
      if (timNgay) {
        const ngay = parseInt(timNgay[1]);
        let dinhViTuan = 'Tuần 4';
        if (ngay <= 7) dinhViTuan = 'Tuần 1';
        else if (ngay <= 14) dinhViTuan = 'Tuần 2';
        else if (ngay <= 21) dinhViTuan = 'Tuần 3';

        cacTuanTrongThang[dinhViTuan].doanhThu += Number(xe.soTien || 0);
        cacTuanTrongThang[dinhViTuan].luongXe += 1;
      }
    });

    chartFormat = Object.keys(cacTuanTrongThang).map(t => ({
      name: t,
      doanhThu: cacTuanTrongThang[t].doanhThu,
      luongXe: cacTuanTrongThang[t].luongXe
    }));
  } 
  // Trường hợp 3: Bộ lọc 1 TUẦN QUA (Mặc định)
  else {
    const cacNgayTrongTuan = {
      'Thứ Hai': { doanhThu: 0, luongXe: 0 },
      'Thứ Ba': { doanhThu: 0, luongXe: 0 },
      'Thứ Tư': { doanhThu: 0, luongXe: 0 },
      'Thứ Năm': { doanhThu: 0, luongXe: 0 },
      'Thứ Sáu': { doanhThu: 0, luongXe: 0 },
      'Thứ Bảy': { doanhThu: 0, luongXe: 0 },
      'Chủ Nhật': { doanhThu: 0, luongXe: 0 }
    };

    xeDaRa.forEach(xe => {
      if (!xe.thoiGianRa) return;
      tongTienLoc += Number(xe.soTien || 0);
      const chuoiThoiGian = xe.thoiGianRa.toLowerCase();
      let thuDinhVi = 'Chủ Nhật';

      if (chuoiThoiGian.includes('monday') || chuoiThoiGian.includes('hai')) thuDinhVi = 'Thứ Hai';
      else if (chuoiThoiGian.includes('tuesday') || chuoiThoiGian.includes('ba')) thuDinhVi = 'Thứ Ba';
      else if (chuoiThoiGian.includes('wednesday') || chuoiThoiGian.includes('tư')) thuDinhVi = 'Thứ Tư';
      else if (chuoiThoiGian.includes('thursday') || chuoiThoiGian.includes('năm')) thuDinhVi = 'Thứ Năm';
      else if (chuoiThoiGian.includes('friday') || chuoiThoiGian.includes('sáu')) thuDinhVi = 'Thứ Sáu';
      else if (chuoiThoiGian.includes('saturday') || chuoiThoiGian.includes('bảy')) thuDinhVi = 'Thứ Bảy';

      cacNgayTrongTuan[thuDinhVi].doanhThu += Number(xe.soTien || 0);
      cacNgayTrongTuan[thuDinhVi].luongXe += 1;
    });

    chartFormat = Object.keys(cacNgayTrongTuan).map(ngay => ({
      name: ngay,
      doanhThu: cacNgayTrongTuan[ngay].doanhThu,
      luongXe: cacNgayTrongTuan[ngay].luongXe
    }));
  }

  return { tongTien: tongTienLoc, dataChart: chartFormat };
};

export const layCauTrucHaTang = (danhSachBai) => {
  const cauTruc = {};
  danhSachBai.forEach(bai => {
    if (!cauTruc[bai.coSo]) cauTruc[bai.coSo] = {};
    if (!cauTruc[bai.coSo][bai.khu]) cauTruc[bai.coSo][bai.khu] = [];
    cauTruc[bai.coSo][bai.khu].push(bai);
  });
  return cauTruc;
};