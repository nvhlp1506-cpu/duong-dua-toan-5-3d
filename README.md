# 🚀 Đường Đua Toán 5 – 3D
### Web Game 3D Endless Runner & Boss Battle Toán Lớp 5 (GDPT 2018 – Bộ Kết Nối Tri Thức Với Cuộc Sống)

[![GitHub Pages](https://img.shields.io/badge/Play%20Online-GitHub%20Pages-brightgreen?style=for-the-badge&logo=github)](https://nvhlp1506-cpu.github.io/duong-dua-toan-5-3d/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

---

## 🌟 Giới Thiệu
**"Đường Đua Toán 5 – 3D"** là một ứng dụng Web Game hành động 3D góc nhìn thứ ba (Third-Person 3D Endless Runner & Boss Battle) được thiết kế chuyên biệt cho học sinh lớp 5 theo chương trình GDPT 2018 (bộ sách *Kết nối tri thức với cuộc sống*).

Game kết hợp trải nghiệm đồ họa 3D phong cách Cyberpunk Low-Poly mượt mà với phương pháp sư phạm tương tác cao, giúp học sinh rèn luyện tư duy tính toán nhanh, giải quyết chướng ngại vật toán học và đánh bại các Đại Boss sau mỗi chặng.

---

## 🎮 Tính Năng Nổi Bật

- **Định dạng Toán học chuẩn GDPT 2018**:
  - Hỗn số và phân số hiển thị đúng chuẩn sư phạm với phần nguyên đứng trước, gạch ngang phân số nằm ngang, tử số ở trên và mẫu số ở dưới ($2\frac{3}{7}$, $\frac{17}{7}$).
  - Xử lý số học thập phân chính xác tuyệt đối, triệt tiêu lỗi số chấm động (floating-point).
  - Tự động sinh hình vẽ hình học SVG minh họa có ghi kích thước trực quan (tam giác, hình thang, hình tròn, hình hộp chữ nhật).
- **Cơ chế Chướng ngại vật 1 phút (60 giây)**:
  - Mỗi câu hỏi tương ứng một chướng ngại vật với đồng hồ đếm ngược 60 giây và thanh tiến trình đổi màu khẩn cấp.
  - Nút **"🚀 VƯỢT NGAY"** (phím <kbd>Enter</kbd>): Thưởng điểm tốc độ khi học sinh nhẩm nhanh và chốt đáp án sớm.
- **Bảng Nháp Mini (Scratchpad)**:
  - Tích hợp bảng vẽ nháp tay ngay trên màn hình bằng canvas cảm ứng để học sinh đặt tính mà không cần giấy bút ngoài.
- **Hệ thống Giải thích Tức thì**:
  - Khi trả lời sai hoặc hết giờ, hệ thống cung cấp công thức trọng tâm và các bước giải chi tiết từng bước trước khi sang thử thách kế tiếp.
- **Tối ưu 60 FPS Đa Nền Tảng (Zero-Build)**:
  - Dựng 100% bằng Procedural Low-Poly Three.js, không dùng file `.glb` nặng nề.
  - 100% âm thanh được tổng hợp thời gian thực bằng Web Audio API, không phụ thuộc file `.mp3` ngoài.
  - Tương thích mượt mà trên cả điện thoại cảm ứng, máy tính bảng và máy tính/laptop.

---

## 🗺️ 5 Chặng Kiến Thức & Màn Đấu Boss

1. **Chặng 1: Rừng Phân Số**
   - Rút gọn phân số, so sánh phân số, hỗn số (chuyển đổi, so sánh, cộng hỗn số).
   - *Đại Boss*: **Vua Khỉ Rừng Rậm**
2. **Chặng 2: Sa Mạc Thập Phân**
   - Nhân/chia nhẩm với 10, 100, 0,1, 0,01; cộng trừ nhân chia số thập phân.
   - *Đại Boss*: **Bọ Cạp Khổng Lồ**
3. **Chặng 3: Thành Phố Phần Trăm**
   - Tìm tỉ số phần trăm, tìm giá trị phần trăm của một số, bài toán giảm giá thực tế.
   - *Đại Boss*: **Hải Tặc Cyber**
4. **Chặng 4: Thung Lũng Hình Học & Đo Lường**
   - Đổi đơn vị diện tích/thể tích ($m^2, dm^2, cm^2, cm^3$); diện tích tam giác, hình thang, hình tròn; thể tích hình hộp chữ nhật (kèm hình vẽ SVG).
   - *Đại Boss*: **Người Đá Pha Lê**
5. **Chặng 5: Đường Hầm Chuyển Động**
   - Bài toán chuyển động đều ($s = v \times t$), tìm vận tốc, thời gian, quãng đường, chuyển động ngược chiều.
   - *Đại Boss*: **Rồng Thần Bão Tố**

---

## 🕹️ Hướng Dẫn Điều Khiển

| Thao Tác | Trên Máy Tính (PC / Laptop) | Trên Thiết Bị Di Động (Touch) |
| :--- | :--- | :--- |
| **Chọn Cổng A / B / C** | Phím <kbd>1</kbd>, <kbd>2</kbd>, <kbd>3</kbd> hoặc <kbd>A</kbd>, <kbd>D</kbd> | Chạm vào thẻ Cổng A, B, C |
| **Chốt Vượt Ngay** | Phím <kbd>Enter</kbd> | Chạm nút **🚀 VƯỢT NGAY** |
| **Bật Bảng Nháp** | Nút **📝 BẢNG NHÁP** góc trên | Chạm nút **📝 BẢNG NHÁP** |
| **Hãm Thời Gian (Slow-Mo)** | Giữ phím <kbd>Shift</kbd> | Chạm giữ nút **⏳ SLOW** |
| **Nhảy Lên** | Phím <kbd>W</kbd> hoặc <kbd>Space</kbd> | Chạm nút **🚀 NHẢY** |

---

## 💻 Triển Khai Trực Tiếp (Zero-Build)

Chỉ cần sao chép kho mã nguồn và mở trực tiếp file `index.html` trong bất kỳ trình duyệt hiện đại nào:

```bash
git clone https://github.com/nvhlp1506-cpu/duong-dua-toan-5-3d.git
cd duong-dua-toan-5-3d
# Mở trực tiếp index.html bằng trình duyệt
```

---

© 2026 - Phát triển theo chuẩn GDPT 2018 Bộ GD&ĐT Việt Nam.
