/**
 * Lọc danh sách xe đang thực tế đỗ trong bãi
 */
export const layXeDangInBai = (danhSachXe) => {
  return danhSachXe.filter(xe => xe.trangThai === "Đang trong bãi" || !xe.trangThai);
};

/**
 * Lọc danh sách các ô đỗ còn TRỐNG theo từng Cơ sở
 */
export const layOTrongTheoCoSo = (danhSachBai, coSoChon) => {
  return danhSachBai.filter(b => b.coSo === coSoChon && b.trangThai === "Trống");
};