/**
 * NGÂN HÀNG 20 CÂU HỎI ÔN TẬP TOÁN LỚP 5 - BỘ SÁCH KẾT NỐI TRI THỨC VỚI CUỘC SỐNG
 * Chuẩn ma trận đánh giá theo Thông tư 27/2020/TT-BGDĐT
 * Phân bổ: 10 câu Học kỳ 1, 10 câu Học kỳ 2 (8 câu Mức 1, 8 câu Mức 2, 4 câu Mức 3)
 */
const NGAN_HANG_20_CAU_HOI = [
  {
    id: 1,
    hocKy: 1,
    chuDe: "Chủ đề 1: Ôn tập và bổ sung",
    mucDo: 1,
    tenMucDo: "Mức 1 (Nhận biết)",
    nhanVat: "Nam",
    cauHoi: "Bạn Nam có hỗn số 3 và 4/5 (viết là 3 4/5). Nam muốn chuyển hỗn số này thành phân số. Phân số Nam nhận được là:",
    cacLuaChon: {
      A: "12/5",
      B: "19/5",
      C: "7/5",
      D: "34/5"
    },
    dapAnDung: "B",
    goiYCuaRobot: "Muốn chuyển một hỗn số thành phân số, em lấy phần nguyên nhân với mẫu số rồi cộng với tử số, giữ nguyên mẫu số nhé!",
    loiGiaiChiTiet: "Ta có: 3 4/5 = (3 × 5 + 4) / 5 = (15 + 4) / 5 = 19/5. Vậy đáp án đúng là B."
  },
  {
    id: 2,
    hocKy: 1,
    chuDe: "Chủ đề 1: Ôn tập và bổ sung",
    mucDo: 2,
    tenMucDo: "Mức 2 (Thông hiểu)",
    nhanVat: "Việt & Nam",
    cauHoi: "Việt và Nam sưu tầm được tất cả 60 con tem. Biết rằng số tem của Việt bằng 2/3 số tem của Nam. Hỏi bạn Nam sưu tầm được bao nhiêu con tem?",
    cacLuaChon: {
      A: "24 con tem",
      B: "36 con tem",
      C: "40 con tem",
      D: "20 con tem"
    },
    dapAnDung: "B",
    goiYCuaRobot: "Đây là bài toán 'Tìm hai số khi biết Tổng và Tỉ số'. Em hãy tìm tổng số phần bằng nhau (2 + 3 = 5 phần), sau đó tính giá trị 1 phần rồi tìm số tem của Nam nhé!",
    loiGiaiChiTiet: "Theo sơ đồ, tổng số phần bằng nhau là: 2 + 3 = 5 (phần).\nGiá trị của một phần là: 60 : 5 = 12 (con tem).\nSố tem của bạn Nam là: 12 × 3 = 36 (con tem).\nĐáp số: 36 con tem. Vậy đáp án đúng là B."
  },
  {
    id: 3,
    hocKy: 1,
    chuDe: "Chủ đề 2: Số thập phân",
    mucDo: 1,
    tenMucDo: "Mức 1 (Nhận biết)",
    nhanVat: "Mai",
    cauHoi: "Trong giờ học Toán, bạn Mai viết lên bảng số thập phân 24,586. Chữ số 8 trong số thập phân này có giá trị là bao nhiêu?",
    cacLuaChon: {
      A: "8 đơn vị",
      B: "8/10",
      C: "8/100",
      D: "8/1000"
    },
    dapAnDung: "C",
    goiYCuaRobot: "Ở bên phải dấu phẩy: chữ số đầu tiên là hàng phần mười, chữ số thứ hai là hàng phần trăm, chữ số thứ ba là hàng phần nghìn!",
    loiGiaiChiTiet: "Số thập phân 24,586 có chữ số 5 ở hàng phần mười (5/10), chữ số 8 ở hàng phần trăm nên có giá trị là 8/100 (tức 0,08). Vậy đáp án đúng là C."
  },
  {
    id: 4,
    hocKy: 1,
    chuDe: "Chủ đề 2: Số thập phân",
    mucDo: 2,
    tenMucDo: "Mức 2 (Thông hiểu)",
    nhanVat: "Rô-bốt",
    cauHoi: "Rô-bốt ghi lại cân nặng của bốn chú cún con như sau: Cún Mực nặng 3,45 kg; Cún Vàng nặng 3,5 kg; Cún Đốm nặng 3,405 kg; Cún Bạch nặng 3,54 kg. Chú cún con có cân nặng nhẹ nhất là:",
    cacLuaChon: {
      A: "Cún Mực",
      B: "Cún Vàng",
      C: "Cún Đốm",
      D: "Cún Bạch"
    },
    dapAnDung: "C",
    goiYCuaRobot: "So sánh các số thập phân có phần nguyên bằng nhau (đều là 3): Em hãy so sánh chữ số ở hàng phần mười, nếu bằng nhau thì so sánh tiếp hàng phần trăm và phần nghìn!",
    loiGiaiChiTiet: "Ta viết các số thập phân với số chữ số phần thập phân bằng nhau: 3,450 kg; 3,500 kg; 3,405 kg; 3,540 kg.\nSo sánh ta có: 3,405 < 3,450 < 3,500 < 3,540.\nNhư vậy chú cún nhẹ nhất là Cún Đốm (3,405 kg). Vậy đáp án đúng là C."
  },
  {
    id: 5,
    hocKy: 1,
    chuDe: "Chủ đề 3: Một số đơn vị đo diện tích",
    mucDo: 1,
    tenMucDo: "Mức 1 (Nhận biết)",
    nhanVat: "Mi",
    cauHoi: "Bác nông dân làng bạn Mi có một khu đồi trồng chè rộng 4,5 ha. Khu đồi chè đó có diện tích bằng bao nhiêu mét vuông (m²)?",
    cacLuaChon: {
      A: "450 m²",
      B: "4 500 m²",
      C: "45 000 m²",
      D: "450 000 m²"
    },
    dapAnDung: "C",
    goiYCuaRobot: "Em hãy nhớ quy tắc: 1 héc-ta (ha) = 10 000 m². Muốn đổi từ ha sang m², ta nhân số đó với 10 000!",
    loiGiaiChiTiet: "Ta có: 1 ha = 10 000 m².\nDo đó: 4,5 ha = 4,5 × 10 000 = 45 000 m².\nVậy đáp án đúng là C."
  },
  {
    id: 6,
    hocKy: 1,
    chuDe: "Chủ đề 3: Một số đơn vị đo diện tích",
    mucDo: 2,
    tenMucDo: "Mức 2 (Thông hiểu)",
    nhanVat: "Việt & Mai",
    cauHoi: "Việt và Mai tìm hiểu diện tích hai khu rừng tự nhiên: Khu rừng A có diện tích 3 km² 25 ha, khu rừng B có diện tích 320 ha. Phát biểu nào sau đây là đúng?",
    cacLuaChon: {
      A: "Khu rừng A có diện tích lớn hơn khu rừng B",
      B: "Khu rừng B có diện tích lớn hơn khu rừng A",
      C: "Hai khu rừng có diện tích bằng nhau",
      D: "Khu rừng A rộng gấp 10 lần khu rừng B"
    },
    dapAnDung: "A",
    goiYCuaRobot: "Hãy đổi diện tích cả hai khu rừng về cùng một đơn vị là héc-ta (ha). Nhớ rằng: 1 km² = 100 ha!",
    loiGiaiChiTiet: "Đổi 3 km² 25 ha ra héc-ta:\nTa có 1 km² = 100 ha nên 3 km² = 300 ha.\nSuy ra: 3 km² 25 ha = 300 ha + 25 ha = 325 ha.\nVì 325 ha > 320 ha nên khu rừng A có diện tích lớn hơn khu rừng B (lớn hơn 5 ha). Vậy đáp án đúng là A."
  },
  {
    id: 7,
    hocKy: 1,
    chuDe: "Chủ đề 4: Các phép tính với số thập phân",
    mucDo: 1,
    tenMucDo: "Mức 1 (Nhận biết)",
    nhanVat: "Rô-bốt",
    cauHoi: "Rô-bốt đố các bạn: 'Khi nhân số thập phân 48,25 với 0,1 ta chỉ cần chuyển dấu phẩy sang bên nào và mấy chữ số?'",
    cacLuaChon: {
      A: "Sang bên phải 1 chữ số, được 482,5",
      B: "Sang bên trái 1 chữ số, được 4,825",
      C: "Sang bên trái 2 chữ số, được 0,4825",
      D: "Sang bên phải 2 chữ số, được 4825"
    },
    dapAnDung: "B",
    goiYCuaRobot: "Quy tắc vàng: Nhân một số với 0,1; 0,01; 0,001... ta chỉ việc dời dấu phẩy của số đó lần lượt sang bên trái một, hai, ba... chữ số (tương đương chia cho 10, 100, 1000)!",
    loiGiaiChiTiet: "Khi nhân 48,25 với 0,1, ta chuyển dấu phẩy sang bên trái một chữ số, ta được kết quả là 4,825. Vậy đáp án đúng là B."
  },
  {
    id: 8,
    hocKy: 1,
    chuDe: "Chủ đề 4: Các phép tính với số thập phân",
    mucDo: 2,
    tenMucDo: "Mức 2 (Thông hiểu)",
    nhanVat: "Mai",
    cauHoi: "Mẹ nhờ Mai đi siêu thị mua 2,5 kg táo với giá 36 nghìn đồng một ki-lô-gam và 1,8 kg nho với giá 45 nghìn đồng một ki-lô-gam. Hỏi Mai phải trả cô thu ngân tất cả bao nhiêu nghìn đồng?",
    cacLuaChon: {
      A: "161 nghìn đồng",
      B: "171 nghìn đồng",
      C: "180 nghìn đồng",
      D: "153 nghìn đồng"
    },
    dapAnDung: "B",
    goiYCuaRobot: "Em tính số tiền mua táo (2,5 × 36), số tiền mua nho (1,8 × 45), rồi cộng hai số tiền đó lại nhé!",
    loiGiaiChiTiet: "Số tiền mua táo là: 2,5 × 36 = 90 (nghìn đồng).\nSố tiền mua nho là: 1,8 × 45 = 81 (nghìn đồng).\nTổng số tiền Mai phải trả là: 90 + 81 = 171 (nghìn đồng).\nĐáp số: 171 nghìn đồng. Vậy đáp án đúng là B."
  },
  {
    id: 9,
    hocKy: 1,
    chuDe: "Chủ đề 5: Một số hình phẳng. Chu vi và diện tích",
    mucDo: 2,
    tenMucDo: "Mức 2 (Thông hiểu)",
    nhanVat: "Nam",
    cauHoi: "Bạn Nam làm một tấm thiệp hình thang có đáy lớn 16 cm, đáy bé 10 cm và chiều cao bằng một nửa đáy lớn. Diện tích tấm thiệp hình thang đó là:",
    cacLuaChon: {
      A: "104 cm²",
      B: "208 cm²",
      C: "80 cm²",
      D: "130 cm²"
    },
    dapAnDung: "A",
    goiYCuaRobot: "Bước 1: Tính chiều cao (16 : 2). Bước 2: Dùng công thức S = (a + b) × h : 2 để tính diện tích hình thang!",
    loiGiaiChiTiet: "Chiều cao của tấm thiệp hình thang là: 16 : 2 = 8 (cm).\nDiện tích tấm thiệp hình thang là: S = (16 + 10) × 8 : 2 = 26 × 8 : 2 = 104 (cm²).\nĐáp số: 104 cm². Vậy đáp án đúng là A."
  },
  {
    id: 10,
    hocKy: 1,
    chuDe: "Chủ đề 5: Một số hình phẳng. Chu vi và diện tích",
    mucDo: 3,
    tenMucDo: "Mức 3 (Vận dụng)",
    nhanVat: "Rô-bốt & Việt",
    cauHoi: "Rô-bốt cùng các bạn chăm sóc một bồn hoa hình tròn có bán kính là 3 m đặt giữa sân trường. Xung quanh bồn hoa, các bạn xây một lối đi bộ bằng xi măng rộng 1 m. Diện tích của lối đi bộ xung quanh bồn hoa là bao nhiêu mét vuông?",
    cacLuaChon: {
      A: "21,98 m²",
      B: "28,26 m²",
      C: "50,24 m²",
      D: "12,56 m²"
    },
    dapAnDung: "A",
    goiYCuaRobot: "Diện tích lối đi bộ chính là diện tích hình vành khăn: Lấy diện tích hình tròn lớn (bán kính R = 3 + 1 = 4 m) trừ đi diện tích hình tròn nhỏ (bồn hoa r = 3 m)!",
    loiGiaiChiTiet: "Bán kính của hình tròn lớn bao gồm cả lối đi bộ là: R = 3 + 1 = 4 (m).\nDiện tích hình tròn lớn là: S_lớn = 4 × 4 × 3,14 = 50,24 (m²).\nDiện tích bồn hoa hình tròn nhỏ là: S_nhỏ = 3 × 3 × 3,14 = 28,26 (m²).\nDiện tích lối đi bộ là: S_lối_đi = S_lớn - S_nhỏ = 50,24 - 28,26 = 21,98 (m²).\nĐáp số: 21,98 m². Vậy đáp án đúng là A."
  },
  {
    id: 11,
    hocKy: 2,
    chuDe: "Chủ đề 7: Tỉ số và các bài toán liên quan",
    mucDo: 1,
    tenMucDo: "Mức 1 (Nhận biết)",
    nhanVat: "Mai",
    cauHoi: "Lớp 5A của bạn Mai có 32 học sinh, trong đó có 8 học sinh hoàn thành xuất sắc nhiệm vụ học tập. Tỉ số phần trăm của số học sinh hoàn thành xuất sắc so với cả lớp là:",
    cacLuaChon: {
      A: "20%",
      B: "25%",
      C: "30%",
      D: "40%"
    },
    dapAnDung: "B",
    goiYCuaRobot: "Muốn tìm tỉ số phần trăm của hai số 8 và 32, em lấy 8 chia cho 32, sau đó lấy thương nhân với 100 rồi viết thêm kí hiệu % vào bên phải!",
    loiGiaiChiTiet: "Ta có: 8 : 32 = 0,25.\nChuyển về tỉ số phần trăm: 0,25 = 25%.\nVậy tỉ số phần trăm học sinh xuất sắc so với học sinh cả lớp là 25%. Đáp án đúng là B."
  },
  {
    id: 12,
    hocKy: 2,
    chuDe: "Chủ đề 7: Tỉ số và các bài toán liên quan",
    mucDo: 3,
    tenMucDo: "Mức 3 (Vận dụng)",
    nhanVat: "Nam",
    cauHoi: "Nhân dịp chuẩn bị năm học mới, một cửa hàng sách giảm giá 20% cho tất cả các loại cặp sách. Bạn Nam chọn mua một chiếc cặp sách có giá niêm yết là 250 000 đồng. Nam đưa cho cô thu ngân tờ tiền 500 000 đồng. Hỏi cô thu ngân phải trả lại Nam bao nhiêu tiền?",
    cacLuaChon: {
      A: "200 000 đồng",
      B: "250 000 đồng",
      C: "300 000 đồng",
      D: "350 000 đồng"
    },
    dapAnDung: "C",
    goiYCuaRobot: "Bước 1: Tính số tiền được giảm (250 000 × 20 : 100). Bước 2: Tính số tiền thực tế mua cặp. Bước 3: Lấy 500 000 trừ số tiền thực tế mua cặp để ra số tiền trả lại!",
    loiGiaiChiTiet: "Số tiền chiếc cặp được giảm giá là: 250 000 × 20 : 100 = 50 000 (đồng).\nSố tiền thực tế Nam phải trả để mua chiếc cặp là: 250 000 - 50 000 = 200 000 (đồng).\nCô thu ngân phải trả lại Nam số tiền là: 500 000 - 200 000 = 300 000 (đồng).\nĐáp số: 300 000 đồng. Vậy đáp án đúng là C."
  },
  {
    id: 13,
    hocKy: 2,
    chuDe: "Chủ đề 8: Thể tích. Đơn vị đo thể tích",
    mucDo: 1,
    tenMucDo: "Mức 1 (Nhận biết)",
    nhanVat: "Mi",
    cauHoi: "Bé Mi có một bình nước trái cây chứa 1,5 dm³ nước cam. Lượng nước cam đó bằng bao nhiêu xăng-ti-mét khối (cm³)?",
    cacLuaChon: {
      A: "15 cm³",
      B: "150 cm³",
      C: "1 500 cm³",
      D: "15 000 cm³"
    },
    dapAnDung: "C",
    goiYCuaRobot: "Mối liên hệ giữa dm³ và cm³: 1 dm³ = 1 000 cm³. Đổi từ dm³ sang cm³, em nhân số đó với 1 000 nhé!",
    loiGiaiChiTiet: "Ta có: 1 dm³ = 1 000 cm³.\nVậy 1,5 dm³ = 1,5 × 1 000 = 1 500 cm³.\nĐáp án đúng là C."
  },
  {
    id: 14,
    hocKy: 2,
    chuDe: "Chủ đề 8: Thể tích. Đơn vị đo thể tích",
    mucDo: 2,
    tenMucDo: "Mức 2 (Thông hiểu)",
    nhanVat: "Việt",
    cauHoi: "Một bể nuôi cá hình hộp chữ nhật đang chứa 0,075 m³ nước. Việt muốn đổ thêm nước vào bể để bể chứa đúng 100 lít nước. Hỏi bạn Việt cần đổ thêm bao nhiêu lít nước nữa? (Biết 1 dm³ = 1 lít)",
    cacLuaChon: {
      A: "25 lít",
      B: "92,5 lít",
      C: "75 lít",
      D: "35 lít"
    },
    dapAnDung: "A",
    goiYCuaRobot: "Đổi 0,075 m³ sang dm³ (tương đương số lít nước hiện có trong bể). Sau đó lấy 100 lít trừ đi số nước đã có!",
    loiGiaiChiTiet: "Đổi 0,075 m³ = 0,075 × 1 000 = 75 dm³ = 75 lít nước.\nLượng nước Việt cần đổ thêm vào bể là: 100 - 75 = 25 (lít).\nĐáp số: 25 lít. Vậy đáp án đúng là A."
  },
  {
    id: 15,
    hocKy: 2,
    chuDe: "Chủ đề 9: Diện tích và thể tích hình khối",
    mucDo: 1,
    tenMucDo: "Mức 1 (Nhận biết)",
    nhanVat: "Rô-bốt",
    cauHoi: "Rô-bốt chỉ vào một tấm bìa khai triển phẳng gồm 1 hình chữ nhật lớn và 2 hình tròn bằng nhau gắn ở hai cạnh đối diện của hình chữ nhật. Khi cuộn và dán mép tấm bìa này lại, Rô-bốt sẽ thu được hình khối nào?",
    cacLuaChon: {
      A: "Hình lập phương",
      B: "Hình hộp chữ nhật",
      C: "Hình trụ",
      D: "Hình cầu"
    },
    dapAnDung: "C",
    goiYCuaRobot: "Hình trụ gồm hai mặt đáy là hai hình tròn bằng nhau và mặt xung quanh khi trải phẳng ra là một hình chữ nhật!",
    loiGiaiChiTiet: "Hình khai triển gồm một mặt xung quanh hình chữ nhật và hai mặt đáy là hai hình tròn bằng nhau chính là hình khai triển của hình trụ. Vậy đáp án đúng là C."
  },
  {
    id: 16,
    hocKy: 2,
    chuDe: "Chủ đề 9: Diện tích và thể tích hình khối",
    mucDo: 3,
    tenMucDo: "Mức 3 (Vận dụng)",
    nhanVat: "Nam & Việt",
    cauHoi: "Phòng học của lớp Nam có dạng hình hộp chữ nhật dài 8 m, rộng 6 m và cao 3,5 m. Bác thợ cần sơn mặt trong của 4 bức tường xung quanh và trần phòng học. Biết tổng diện tích các cửa sổ và cửa ra vào là 12 m². Diện tích cần quét sơn của phòng học là:",
    cacLuaChon: {
      A: "146 m²",
      B: "134 m²",
      C: "182 m²",
      D: "194 m²"
    },
    dapAnDung: "B",
    goiYCuaRobot: "Diện tích quét sơn = Diện tích 4 bức tường xung quanh (Sxq) + Diện tích trần nhà (1 mặt đáy) - Diện tích các cửa!",
    loiGiaiChiTiet: "Chu vi đáy phòng học là: (8 + 6) × 2 = 28 (m).\nDiện tích xung quanh (4 bức tường) là: 28 × 3,5 = 98 (m²).\nDiện tích trần nhà là: 8 × 6 = 48 (m²).\nDiện tích cần quét sơn là: 98 + 48 - 12 = 134 (m²).\nĐáp số: 134 m². Vậy đáp án đúng là B."
  },
  {
    id: 17,
    hocKy: 2,
    chuDe: "Chủ đề 10: Vận tốc, Quãng đường, Thời gian",
    mucDo: 1,
    tenMucDo: "Mức 1 (Nhận biết)",
    nhanVat: "Việt",
    cauHoi: "Bạn Việt tập chạy bộ quanh công viên hết 45 phút. Khi chuyển đổi khoảng thời gian này sang đơn vị giờ dưới dạng số thập phân, ta được kết quả là:",
    cacLuaChon: {
      A: "0,45 giờ",
      B: "0,5 giờ",
      C: "0,75 giờ",
      D: "4,5 giờ"
    },
    dapAnDung: "C",
    goiYCuaRobot: "Một giờ có 60 phút. Muốn đổi từ phút sang giờ, em lấy số phút chia cho 60: 45 : 60 = ?",
    loiGiaiChiTiet: "Ta có: 45 phút = 45/60 giờ = 3/4 giờ = 0,75 giờ. (Lưu ý: Rất nhiều bạn hay nhầm thành 0,45 giờ, nhưng 1 giờ = 60 phút chứ không phải 100 phút). Vậy đáp án đúng là C."
  },
  {
    id: 18,
    hocKy: 2,
    chuDe: "Chủ đề 10: Vận tốc, Quãng đường, Thời gian",
    mucDo: 2,
    tenMucDo: "Mức 2 (Thông hiểu)",
    nhanVat: "Mai",
    cauHoi: "Bố chở Mai về quê bằng xe máy với vận tốc 42 km/h. Hai bố con xuất phát từ nhà lúc 7 giờ 15 phút và về đến quê lúc 9 giờ 45 phút. Quãng đường từ nhà Mai về quê dài bao nhiêu ki-lô-mét?",
    cacLuaChon: {
      A: "84 km",
      B: "105 km",
      C: "126 km",
      D: "96 km"
    },
    dapAnDung: "B",
    goiYCuaRobot: "Bước 1: Tính thời gian đi (Thời điểm đến - Thời điểm đi). Bước 2: Đổi thời gian ra số giờ. Bước 3: Tính quãng đường s = v × t!",
    loiGiaiChiTiet: "Thời gian bố con Mai đi trên đường là: 9 giờ 45 phút - 7 giờ 15 phút = 2 giờ 30 phút.\nĐổi: 2 giờ 30 phút = 2,5 giờ.\nQuãng đường từ nhà Mai về quê là: s = v × t = 42 × 2,5 = 105 (km).\nĐáp số: 105 km. Vậy đáp án đúng là B."
  },
  {
    id: 19,
    hocKy: 2,
    chuDe: "Chủ đề 10: Vận tốc, Quãng đường, Thời gian",
    mucDo: 3,
    tenMucDo: "Mức 3 (Vận dụng)",
    nhanVat: "Rô-bốt & Nam",
    cauHoi: "Lúc 8 giờ sáng, một người đi xe máy từ thị trấn A đến thị trấn B với vận tốc 35 km/h. Cùng lúc đó, một ô tô đi từ thị trấn B về A với vận tốc 55 km/h. Biết khoảng cách giữa hai thị trấn là 135 km. Hỏi hai xe gặp nhau lúc mấy giờ?",
    cacLuaChon: {
      A: "9 giờ 30 phút",
      B: "9 giờ 15 phút",
      C: "10 giờ",
      D: "8 giờ 45 phút"
    },
    dapAnDung: "A",
    goiYCuaRobot: "Hai xe chuyển động ngược chiều xuất phát cùng lúc: Bước 1: Tính tổng hai vận tốc (35 + 55). Bước 2: Tính thời gian gặp nhau = Quãng đường : Tổng vận tốc. Bước 3: Lấy thời điểm khởi hành cộng thời gian đi!",
    loiGiaiChiTiet: "Tổng vận tốc của hai xe là: 35 + 55 = 90 (km/h).\nThời gian hai xe đi để gặp nhau là: 135 : 90 = 1,5 (giờ).\nĐổi: 1,5 giờ = 1 giờ 30 phút.\nHai xe gặp nhau lúc: 8 giờ + 1 giờ 30 phút = 9 giờ 30 phút.\nĐáp số: 9 giờ 30 phút. Vậy đáp án đúng là A."
  },
  {
    id: 20,
    hocKy: 2,
    chuDe: "Chủ đề 11: Thống kê và xác suất",
    mucDo: 2,
    tenMucDo: "Mức 2 (Thông hiểu)",
    nhanVat: "Rô-bốt",
    cauHoi: "Rô-bốt tiến hành khảo sát 150 học sinh khối 5 về câu lạc bộ năng khiếu yêu thích nhất và vẽ biểu đồ hình quạt tròn: CLB Mỹ thuật chiếm 40%, CLB Cầu lông chiếm 30%, CLB Cờ vua chiếm 10%, phần còn lại là CLB Âm nhạc. Số bạn học sinh yêu thích CLB Âm nhạc là:",
    cacLuaChon: {
      A: "20 học sinh",
      B: "25 học sinh",
      C: "30 học sinh",
      D: "35 học sinh"
    },
    dapAnDung: "C",
    goiYCuaRobot: "Toàn bộ hình quạt tròn tương ứng 100%. Bước 1: Lấy 100% trừ đi tỉ số phần trăm của 3 CLB đã biết để tìm % của CLB Âm nhạc. Bước 2: Tính số học sinh của CLB Âm nhạc!",
    loiGiaiChiTiet: "Tỉ số phần trăm số học sinh yêu thích CLB Âm nhạc là:\n100% - (40% + 30% + 10%) = 100% - 80% = 20%.\nSố học sinh yêu thích CLB Âm nhạc là:\n150 × 20 : 100 = 30 (học sinh).\nĐáp số: 30 học sinh. Vậy đáp án đúng là C."
  }
];

// Xuất module cho môi trường Node hoặc Browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NGAN_HANG_20_CAU_HOI;
}
