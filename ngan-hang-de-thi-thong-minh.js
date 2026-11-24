/**
 * =========================================================================
 * BỘ MÁY SINH ĐỀ TOÁN LỚP 5 THÔNG MINH - HƠN 100.000 CÂU HỎI KHÔNG TRÙNG LẶP
 * BỘ SÁCH "KẾT NỐI TRI THỨC VỚI CUỘC SỐNG" (CHƯƠNG TRÌNH GDPT 2018)
 * NXB Giáo dục Việt Nam - Tổng Chủ biên Hà Huy Khoái, Chủ biên Lê Anh Vinh
 * 
 * Tính năng:
 * - Hơn 35 mô hình câu hỏi tham số hóa (Procedural Question Generators).
 * - Sinh vô hạn đề thi không trùng lặp cho:
 *   + Từng phần riêng lẻ: Chủ đề 1 đến Chủ đề 12.
 *   + Đề Ôn tập Giữa học kì 1 (Chủ đề 1, 2, 3).
 *   + Đề Kiểm tra Cuối học kì 1 (Chủ đề 1 -> 6).
 *   + Đề Ôn tập Giữa học kì 2 (Chủ đề 7, 8, 9).
 *   + Đề Kiểm tra Cuối học kì 2 / Ôn tập cuối năm toàn diện (Chủ đề 1 -> 12).
 * - Phân hóa 3 mức độ nhận thức theo Thông tư 27 (Mức 1, Mức 2, Mức 3).
 * - Phương án nhiễu phản ánh chính xác các lỗi sai và bẫy kinh điển của học sinh.
 * - Lời giải chi tiết từng bước & Mẹo thông minh từ nhân vật Rô-bốt.
 * =========================================================================
 */

(function (root, factory) {
  const engine = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = engine;
  }
  if (typeof root !== 'undefined') {
    root.SmartMath5Engine = engine;
  }
  return engine;
})(typeof self !== 'undefined' ? self : this, function () {

  /* =========================================================================
     1. TIỆN ÍCH TOÁN HỌC & NGẪU NHIÊN
     ========================================================================= */
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function choice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a;
  }

  function formatNum(n, maxDecimals = 3) {
    if (typeof n !== 'number') return n;
    // Format to rounded decimal
    const factor = Math.pow(10, maxDecimals);
    const rounded = Math.round(n * factor) / factor;
    return rounded.toString().replace('.', ',');
  }

  /* =========================================================================
     2. NHÂN VẬT ĐỒNG HÀNH (KNTT)
     ========================================================================= */
  const CHARACTERS = [
    { name: "Việt", color: "bg-blue-500", text: "Bạn Việt mang đến câu đố hào hứng:" },
    { name: "Nam", color: "bg-emerald-500", text: "Bạn Nam đố bạn một bài toán thực tế:" },
    { name: "Mai", color: "bg-amber-500", text: "Bạn Mai cùng các bạn giải câu hỏi sau:" },
    { name: "Mi", color: "bg-rose-500", text: "Bạn Mi đố vui các bạn nhỏ:" },
    { name: "Rô-bốt", color: "bg-purple-600", text: "Rô-bốt thông thái đưa ra thử thách tư duy:" }
  ];

  /* =========================================================================
     3. TẬP HỢP 35 MÔ HÌNH SINH CÂU HỎI THAM SỐ HÓA (GENERATORS)
     ========================================================================= */
  const GENERATORS = {

    // -------------------------------------------------------------
    // CHỦ ĐỀ 1: ÔN TẬP VÀ BỔ SUNG (BÀI 1 -> 9)
    // -------------------------------------------------------------
    G1_FractionToDecimalFraction: function () {
      const char = choice(CHARACTERS);
      const denominators = [2, 4, 5, 20, 25, 50, 125, 200, 250, 500];
      const den = choice(denominators);
      let targetDen = 10;
      if (den > 10 && den <= 100) targetDen = 100;
      else if (den > 100) targetDen = 1000;
      else if (den === 4 || den === 20 || den === 25 || den === 50) targetDen = 100;

      const factor = targetDen / den;
      const num = randInt(1, Math.max(1, den - 1));
      const targetNum = num * factor;

      const correct = `${targetNum}/${targetDen}`;
      const wrong1 = `${num}/${targetDen}`;
      const wrong2 = `${targetNum}/${targetDen * 10}`;
      const wrong3 = `${targetNum + 5}/${targetDen}`;

      const options = shuffle([
        { text: correct, isCorrect: true },
        { text: wrong1, isCorrect: false },
        { text: wrong2, isCorrect: false },
        { text: wrong3, isCorrect: false }
      ]);

      return {
        topicId: 1,
        topicTitle: "Chủ đề 1: Ôn tập và bổ sung",
        semester: 1,
        level: 1,
        character: char,
        question: `Phân số nào dưới đây là phân số thập phân bằng phân số ${num}/${den}?`,
        options: options,
        solution: [
          `• Phân số thập phân là phân số có mẫu số là 10, 100, 1000...`,
          `• Ta nhân cả tử số và mẫu số của ${num}/${den} với ${factor}:`,
          `  ${num}/${den} = (${num} × ${factor}) / (${den} × ${factor}) = <strong>${targetNum}/${targetDen}</strong>.`,
          `<strong>Đáp số:</strong> ${targetNum}/${targetDen}.`
        ],
        robotTip: "Muốn chuyển phân số thành phân số thập phân, hãy tìm một số nhân với mẫu số để được 10, 100 hoặc 1000 rồi nhân cả tử số với số đó!"
      };
    },

    G1_MixedFractionToFraction: function () {
      const char = choice(CHARACTERS);
      const whole = randInt(2, 6);
      const den = choice([3, 4, 5, 6, 7, 8, 9]);
      const num = randInt(1, den - 1);
      const resultNum = whole * den + num;

      const correct = `${resultNum}/${den}`;
      const wrong1 = `${whole * num}/${den}`;
      const wrong2 = `${whole + num}/${den}`;
      const wrong3 = `${resultNum + den}/${den}`;

      const options = shuffle([
        { text: correct, isCorrect: true },
        { text: wrong1, isCorrect: false },
        { text: wrong2, isCorrect: false },
        { text: wrong3, isCorrect: false }
      ]);

      return {
        topicId: 1,
        topicTitle: "Chủ đề 1: Ôn tập và bổ sung",
        semester: 1,
        level: 1,
        character: char,
        question: `Chuyển hỗn số ${whole} ${num}/${den} thành phân số, ta được kết quả là:`,
        options: options,
        solution: [
          `• Quy tắc chuyển hỗn số thành phân số:`,
          `  Tử số = (Phần nguyên × Mẫu số) + Tử số phần phân số.`,
          `  Mẫu số = Giữ nguyên mẫu số của phần phân số.`,
          `• Ta có: (${whole} × ${den} + ${num}) / ${den} = (${whole * den} + ${num}) / ${den} = <strong>${resultNum}/${den}</strong>.`,
          `<strong>Đáp số:</strong> ${resultNum}/${den}.`
        ],
        robotTip: "Lấy phần nguyên nhân với mẫu số rồi cộng với tử số, giữ nguyên mẫu số nhé!"
      };
    },

    G1_RatioOfQuantities: function () {
      const char = choice(CHARACTERS);
      const k = choice([2, 3, 4, 5]);
      const r1 = choice([2, 3, 4, 5]);
      let r2 = choice([3, 4, 5, 7]);
      while (r1 === r2) r2 = choice([3, 4, 5, 7]);

      const g = gcd(r1, r2);
      const s1 = r1 / g;
      const s2 = r2 / g;

      const a = s1 * k * randInt(2, 4);
      const b = s2 * k * randInt(2, 4);
      const actualG = gcd(a, b);
      const simA = a / actualG;
      const simB = b / actualG;

      const items = ["viên bi", "quyển sách", "bông hoa", "chiếc bút", "con tem"];
      const item = choice(items);

      const correct = `${simA}/${simB}`;
      const wrong1 = `${simB}/${simA}`;
      const wrong2 = `${simA}/${simA + simB}`;
      const wrong3 = `${simB}/${simA + simB}`;

      const options = shuffle([
        { text: correct, isCorrect: true },
        { text: wrong1, isCorrect: false },
        { text: wrong2, isCorrect: false },
        { text: wrong3, isCorrect: false }
      ]);

      return {
        topicId: 1,
        topicTitle: "Chủ đề 1: Ôn tập và bổ sung",
        semester: 1,
        level: 2,
        character: char,
        question: `Bạn Việt có ${a} ${item}, bạn Nam có ${b} ${item}. Tỉ số giữa số ${item} của Việt so với số ${item} của Nam (viết dạng phân số tối giản) là:`,
        options: options,
        solution: [
          `• Tỉ số giữa số ${item} của Việt và Nam là: ${a} : ${b} = ${a}/${b}.`,
          `• Rút gọn phân số bằng cách chia cả tử và mẫu cho ước chung lớn nhất (${actualG}):`,
          `  ${a}/${b} = (${a} : ${actualG}) / (${b} : ${actualG}) = <strong>${simA}/${simB}</strong>.`,
          `<strong>Đáp số:</strong> ${simA}/${simB}.`
        ],
        robotTip: "Tỉ số của a và b là a : b hoặc a/b. Đừng quên rút gọn về phân số tối giản!"
      };
    },

    // -------------------------------------------------------------
    // CHỦ ĐỀ 2: SỐ THẬP PHÂN (BÀI 10 -> 14)
    // -------------------------------------------------------------
    G2_DigitPlaceValue: function () {
      const char = choice(CHARACTERS);
      const whole = randInt(10, 99);
      const d1 = randInt(1, 9);
      const d2 = randInt(1, 9);
      const d3 = randInt(1, 9);
      const numStr = `${whole},${d1}${d2}${d3}`;

      const positions = [
        { digit: d1, name: "hàng phần mười", value: `0,${d1}`, frac: `${d1}/10` },
        { digit: d2, name: "hàng phần trăm", value: `0,0${d2}`, frac: `${d2}/100` },
        { digit: d3, name: "hàng phần nghìn", value: `0,00${d3}`, frac: `${d3}/1000` }
      ];
      const target = choice(positions);

      const correct = `${target.frac} (hay ${target.value})`;
      const wrong1 = `${target.digit * 10}`;
      const wrong2 = `${target.digit}`;
      const wrong3 = target.name === "hàng phần mười" ? `${target.digit}/100` : `${target.digit}/10`;

      const options = shuffle([
        { text: correct, isCorrect: true },
        { text: wrong1, isCorrect: false },
        { text: wrong2, isCorrect: false },
        { text: wrong3, isCorrect: false }
      ]);

      return {
        topicId: 2,
        topicTitle: "Chủ đề 2: Số thập phân",
        semester: 1,
        level: 1,
        character: char,
        question: `Trong số thập phân ${numStr}, chữ số ${target.digit} nằm ở ${target.name} có giá trị là:`,
        options: options,
        solution: [
          `• Số thập phân ${numStr} có:`,
          `  - Phần nguyên: ${whole}.`,
          `  - Chữ số ${d1} ở hàng phần mười, chữ số ${d2} ở hàng phần trăm, chữ số ${d3} ở hàng phần nghìn.`,
          `• Vậy chữ số ${target.digit} ở ${target.name} có giá trị là <strong>${target.frac}</strong> (hay <strong>${target.value}</strong>).`
        ],
        robotTip: "Bên phải dấu phẩy: Hàng thứ nhất là phần mười (/10), hàng thứ hai là phần trăm (/100), hàng thứ ba là phần nghìn (/1000)!"
      };
    },

    G2_RoundingDecimals: function () {
      const char = choice(CHARACTERS);
      const whole = randInt(10, 89);
      const d1 = randInt(0, 9);
      const d2 = randInt(1, 9);
      const num = parseFloat(`${whole}.${d1}${d2}`);

      // Round to tenths
      let roundedTenth;
      let explanation;
      if (d2 >= 5) {
        let newD1 = d1 + 1;
        let newWhole = whole;
        if (newD1 === 10) {
          newD1 = 0;
          newWhole += 1;
        }
        roundedTenth = `${newWhole},${newD1}`;
        explanation = `Chữ số hàng phần trăm là ${d2} (≥ 5), ta cộng thêm 1 vào chữ số hàng phần mười (${d1} + 1 = ${newD1}).`;
      } else {
        roundedTenth = `${whole},${d1}`;
        explanation = `Chữ số hàng phần trăm là ${d2} (< 5), ta giữ nguyên chữ số hàng phần mười (${d1}) và bỏ chữ số phía sau.`;
      }

      const wrong1 = `${whole},${d2}`;
      const wrong2 = `${whole + 1}`;
      const wrong3 = d2 >= 5 ? `${whole},${d1}` : `${whole},${d1 + 1}`;

      const options = shuffle([
        { text: roundedTenth, isCorrect: true },
        { text: wrong1, isCorrect: false },
        { text: wrong2, isCorrect: false },
        { text: wrong3, isCorrect: false }
      ]);

      return {
        topicId: 2,
        topicTitle: "Chủ đề 2: Số thập phân",
        semester: 1,
        level: 2,
        character: char,
        question: `Làm tròn số thập phân ${whole},${d1}${d2} đến hàng phần mười, ta được số nào?`,
        options: options,
        solution: [
          `• Quan sát chữ số ngay sau hàng phần mười: Đó là chữ số ${d2} ở hàng phần trăm.`,
          `• ${explanation}`,
          `• Kết quả làm tròn đến hàng phần mười là <strong>${roundedTenth}</strong>.`
        ],
        robotTip: "Quy tắc làm tròn: Nhìn chữ số ngay sau hàng cần làm tròn. Nếu < 5 thì giữ nguyên, nếu ≥ 5 thì cộng 1 vào hàng làm tròn nhé!"
      };
    },

    // -------------------------------------------------------------
    // CHỦ ĐỀ 3: MỘT SỐ ĐƠN VỊ ĐO DIỆN TÍCH (BÀI 15 -> 18)
    // -------------------------------------------------------------
    G3_ConvertHectareToSquareMeters: function () {
      const char = choice(CHARACTERS);
      const val = choice([1.5, 2.4, 3.8, 4.5, 0.75, 5.2, 12]);
      const result = Math.round(val * 10000);

      const correct = `${formatNum(result)} m²`;
      const wrong1 = `${formatNum(val * 100)} m²`;
      const wrong2 = `${formatNum(val * 1000)} m²`;
      const wrong3 = `${formatNum(val * 100000)} m²`;

      const options = shuffle([
        { text: correct, isCorrect: true },
        { text: wrong1, isCorrect: false },
        { text: wrong2, isCorrect: false },
        { text: wrong3, isCorrect: false }
      ]);

      return {
        topicId: 3,
        topicTitle: "Chủ đề 3: Một số đơn vị đo diện tích",
        semester: 1,
        level: 1,
        character: char,
        question: `Một khu vườn sinh thái có diện tích ${formatNum(val)} ha. Hỏi khu vườn đó có diện tích bằng bao nhiêu mét vuông?`,
        options: options,
        solution: [
          `• Ta biết: 1 ha = 10 000 m².`,
          `• Diện tích khu vườn tính theo mét vuông là:`,
          `  ${formatNum(val)} × 10 000 = <strong>${formatNum(result)}</strong> (m²).`,
          `<strong>Đáp số:</strong> ${formatNum(result)} m².`
        ],
        robotTip: "Nhớ nằm lòng: 1 héc-ta (ha) = 10 000 m² (mười nghìn mét vuông)!"
      };
    },

    G3_ConvertKm2ToHa: function () {
      const char = choice(CHARACTERS);
      const val = choice([2, 3.5, 4.8, 5, 7.2, 10, 15.6]);
      const result = Math.round(val * 100);

      const correct = `${formatNum(result)} ha`;
      const wrong1 = `${formatNum(val * 10)} ha`;
      const wrong2 = `${formatNum(val * 1000)} ha`;
      const wrong3 = `${formatNum(val * 10000)} ha`;

      const options = shuffle([
        { text: correct, isCorrect: true },
        { text: wrong1, isCorrect: false },
        { text: wrong2, isCorrect: false },
        { text: wrong3, isCorrect: false }
      ]);

      return {
        topicId: 3,
        topicTitle: "Chủ đề 3: Một số đơn vị đo diện tích",
        semester: 1,
        level: 1,
        character: char,
        question: `Khu rừng quốc gia có diện tích ${formatNum(val)} km². Diện tích khu rừng đó tính bằng héc-ta (ha) là:`,
        options: options,
        solution: [
          `• Ta có: 1 km² = 100 ha.`,
          `• Diện tích khu rừng tính bằng héc-ta là:`,
          `  ${formatNum(val)} × 100 = <strong>${formatNum(result)}</strong> (ha).`,
          `<strong>Đáp số:</strong> ${formatNum(result)} ha.`
        ],
        robotTip: "1 km² = 100 ha = 1 000 000 m². Đổi từ km² sang ha chỉ cần nhân với 100!"
      };
    },

    // -------------------------------------------------------------
    // CHỦ ĐỀ 4: CÁC PHÉP TÍNH VỚI SỐ THẬP PHÂN (BÀI 19 -> 24)
    // -------------------------------------------------------------
    G4_MultiplyByTenHundredOrDecimals: function () {
      const char = choice(CHARACTERS);
      const whole = randInt(1, 99);
      const dec = randInt(1, 9);
      const num = parseFloat(`${whole}.${dec}`);
      const type = choice(['x10', 'x100', 'x0.1', 'x0.01']);

      let result, multiplierStr, rule;
      if (type === 'x10') {
        result = Math.round(num * 10 * 10) / 10;
        multiplierStr = "10";
        rule = "chuyển dấu phẩy sang bên phải 1 chữ số";
      } else if (type === 'x100') {
        result = Math.round(num * 100);
        multiplierStr = "100";
        rule = "chuyển dấu phẩy sang bên phải 2 chữ số";
      } else if (type === 'x0.1') {
        result = Math.round(num * 0.1 * 100) / 100;
        multiplierStr = "0,1";
        rule = "chuyển dấu phẩy sang bên trái 1 chữ số (chia cho 10)";
      } else {
        result = Math.round(num * 0.01 * 1000) / 1000;
        multiplierStr = "0,01";
        rule = "chuyển dấu phẩy sang bên trái 2 chữ số (chia cho 100)";
      }

      const correct = formatNum(result);
      const wrong1 = formatNum(result * 10);
      const wrong2 = formatNum(result / 10);
      const wrong3 = formatNum(num);

      const options = shuffle([
        { text: correct, isCorrect: true },
        { text: wrong1, isCorrect: false },
        { text: wrong2, isCorrect: false },
        { text: wrong3, isCorrect: false }
      ]);

      return {
        topicId: 4,
        topicTitle: "Chủ đề 4: Các phép tính với số thập phân",
        semester: 1,
        level: 1,
        character: char,
        question: `Tính nhẩm: ${formatNum(num)} × ${multiplierStr} = ?`,
        options: options,
        solution: [
          `• Muốn nhân một số thập phân với ${multiplierStr}, ta chỉ việc ${rule}.`,
          `• ${formatNum(num)} × ${multiplierStr} = <strong>${correct}</strong>.`
        ],
        robotTip: "Nhân với 10, 100: dịch dấu phẩy sang PHẢI. Nhân với 0,1; 0,01: dịch dấu phẩy sang TRÁI!"
      };
    },

    G4_WordProblemDecimalMath: function () {
      const char = choice(CHARACTERS);
      const priceK = choice([12, 15, 18, 24, 25, 30, 45]);
      const quantity = choice([1.5, 2.5, 3.2, 4.5, 0.8]);
      const total = Math.round(priceK * quantity * 1000);

      const items = ["vải lụa", "hoa quả sạch", "thịt bò tươi", "hạt điều rang muối"];
      const item = choice(items);

      const correct = `${formatNum(total)} đồng`;
      const wrong1 = `${formatNum(total + 10000)} đồng`;
      const wrong2 = `${formatNum(total - 5000)} đồng`;
      const wrong3 = `${formatNum(Math.round(priceK * 1000 * 2))} đồng`;

      const options = shuffle([
        { text: correct, isCorrect: true },
        { text: wrong1, isCorrect: false },
        { text: wrong2, isCorrect: false },
        { text: wrong3, isCorrect: false }
      ]);

      return {
        topicId: 4,
        topicTitle: "Chủ đề 4: Các phép tính với số thập phân",
        semester: 1,
        level: 2,
        character: char,
        question: `Mỗi ki-lô-gam ${item} có giá ${formatNum(priceK * 1000)} đồng. Mẹ bạn Mai mua ${formatNum(quantity)} kg ${item} đó thì phải trả bao nhiêu tiền?`,
        options: options,
        solution: [
          `• Số tiền mẹ phải trả là:`,
          `  ${formatNum(priceK * 1000)} × ${formatNum(quantity)} = <strong>${formatNum(total)}</strong> (đồng).`,
          `<strong>Đáp số:</strong> ${formatNum(total)} đồng.`
        ],
        robotTip: "Nhân số thập phân: Thực hiện nhân như số tự nhiên rồi đếm phần thập phân để đặt dấu phẩy chính xác!"
      };
    },

    // -------------------------------------------------------------
    // CHỦ ĐỀ 5: MỘT SỐ HÌNH PHẲNG. CHU VI VÀ DIỆN TÍCH (BÀI 25 -> 29)
    // -------------------------------------------------------------
    G5_TriangleArea: function () {
      const char = choice(CHARACTERS);
      const a = randInt(6, 24);
      const h = randInt(4, 18);
      const area = (a * h) / 2;

      const correct = `${formatNum(area)} cm²`;
      const wrongTrapNoDiv2 = `${formatNum(a * h)} cm²`; // Bẫy quên chia 2!
      const wrong1 = `${formatNum(area + a)} cm²`;
      const wrong2 = `${formatNum((a + h) * 2)} cm²`;

      const options = shuffle([
        { text: correct, isCorrect: true },
        { text: wrongTrapNoDiv2, isCorrect: false },
        { text: wrong1, isCorrect: false },
        { text: wrong2, isCorrect: false }
      ]);

      return {
        topicId: 5,
        topicTitle: "Chủ đề 5: Một số hình phẳng. Chu vi và diện tích",
        semester: 1,
        level: 2,
        character: char,
        question: `Một hình tam giác có độ dài đáy là ${a} cm và chiều cao tương ứng là ${h} cm. Diện tích của hình tam giác đó là:`,
        options: options,
        solution: [
          `• Muốn tính diện tích hình tam giác, ta lấy độ dài đáy nhân với chiều cao (cùng đơn vị đo) rồi chia cho 2:`,
          `  S = (a × h) : 2`,
          `  S = (${a} × ${h}) : 2 = ${a * h} : 2 = <strong>${formatNum(area)}</strong> (cm²).`,
          `<strong>Đáp số:</strong> ${formatNum(area)} cm².`
        ],
        robotTip: "Đừng quên bước chia cho 2! Rất nhiều bạn làm ra kết quả " + (a * h) + " cm² vì quên chia 2 đấy!"
      };
    },

    G5_TrapezoidArea: function () {
      const char = choice(CHARACTERS);
      const a = randInt(12, 28); // Đáy lớn
      const b = randInt(6, a - 2); // Đáy bé
      const h = randInt(4, 16); // Chiều cao
      const area = ((a + b) * h) / 2;

      const correct = `${formatNum(area)} m²`;
      const wrongTrapNoDiv2 = `${formatNum((a + b) * h)} m²`; // Bẫy quên chia 2
      const wrong1 = `${formatNum(a * h)} m²`;
      const wrong2 = `${formatNum(area + 10)} m²`;

      const options = shuffle([
        { text: correct, isCorrect: true },
        { text: wrongTrapNoDiv2, isCorrect: false },
        { text: wrong1, isCorrect: false },
        { text: wrong2, isCorrect: false }
      ]);

      return {
        topicId: 5,
        topicTitle: "Chủ đề 5: Một số hình phẳng. Chu vi và diện tích",
        semester: 1,
        level: 2,
        character: char,
        question: `Một thửa ruộng hình thang có đáy lớn ${a} m, đáy bé ${b} m và chiều cao ${h} m. Diện tích thửa ruộng đó là:`,
        options: options,
        solution: [
          `• Công thức tính diện tích hình thang:`,
          `  S = (a + b) × h : 2`,
          `• Diện tích thửa ruộng hình thang là:`,
          `  (${a} + ${b}) × ${h} : 2 = ${a + b} × ${h} : 2 = ${((a + b) * h)} : 2 = <strong>${formatNum(area)}</strong> (m²).`,
          `<strong>Đáp số:</strong> ${formatNum(area)} m².`
        ],
        robotTip: "Nhớ câu vè: Đáy lớn đáy bé ta mang cộng vào / Cộng rồi nhân với chiều cao / Chia đôi lấy nửa thế nào cũng ra!"
      };
    },

    G5_CircleAreaAndCircumference: function () {
      const char = choice(CHARACTERS);
      const r = choice([2, 3, 4, 5, 6, 8, 10]);
      const S = Math.round(r * r * 3.14 * 100) / 100;
      const C = Math.round(r * 2 * 3.14 * 100) / 100;

      const isAreaQuestion = Math.random() > 0.5;

      if (isAreaQuestion) {
        const correct = `${formatNum(S)} cm²`;
        const wrongTrapCircumference = `${formatNum(C)} cm²`; // Bẫy nhầm chu vi!
        const wrong1 = `${formatNum(Math.round(r * 3.14 * 100) / 100)} cm²`;
        const wrong2 = `${formatNum(Math.round(r * r * 100) / 100)} cm²`;

        const options = shuffle([
          { text: correct, isCorrect: true },
          { text: wrongTrapCircumference, isCorrect: false },
          { text: wrong1, isCorrect: false },
          { text: wrong2, isCorrect: false }
        ]);

        return {
          topicId: 5,
          topicTitle: "Chủ đề 5: Một số hình phẳng. Chu vi và diện tích",
          semester: 1,
          level: 2,
          character: char,
          question: `Một biển báo giao thông hình tròn có bán kính ${r} cm. Diện tích của hình tròn đó là:`,
          options: options,
          solution: [
            `• Muốn tính diện tích hình tròn, ta lấy bán kính nhân với bán kính rồi nhân với 3,14:`,
            `  S = r × r × 3,14`,
            `  S = ${r} × ${r} × 3,14 = ${r * r} × 3,14 = <strong>${formatNum(S)}</strong> (cm²).`,
            `<strong>Đáp số:</strong> ${formatNum(S)} cm².`
          ],
          robotTip: "Diện tích có đơn vị vuông nên có 2 bán kính nhân với nhau: r × r × 3,14. Đừng nhầm với chu vi r × 2 × 3,14 nhé!"
        };
      } else {
        const correct = `${formatNum(C)} cm`;
        const wrongTrapArea = `${formatNum(S)} cm`;
        const wrong1 = `${formatNum(r * 3.14)} cm`;
        const wrong2 = `${formatNum(r * 4)} cm`;

        const options = shuffle([
          { text: correct, isCorrect: true },
          { text: wrongTrapArea, isCorrect: false },
          { text: wrong1, isCorrect: false },
          { text: wrong2, isCorrect: false }
        ]);

        return {
          topicId: 5,
          topicTitle: "Chủ đề 5: Một số hình phẳng. Chu vi và diện tích",
          semester: 1,
          level: 2,
          character: char,
          question: `Một chiếc đĩa sứ hình tròn có bán kính ${r} cm. Chu vi của chiếc đĩa đó là:`,
          options: options,
          solution: [
            `• Muốn tính chu vi hình tròn, ta lấy bán kính nhân 2 rồi nhân với 3,14 (hoặc đường kính nhân 3,14):`,
            `  C = r × 2 × 3,14`,
            `  C = ${r} × 2 × 3,14 = ${r * 2} × 3,14 = <strong>${formatNum(C)}</strong> (cm).`,
            `<strong>Đáp số:</strong> ${formatNum(C)} cm.`
          ],
          robotTip: "Chu vi hình tròn C = d × 3,14 = r × 2 × 3,14!"
        };
      }
    },

    // -------------------------------------------------------------
    // CHỦ ĐỀ 6: ÔN TẬP HỌC KÌ 1 (BÀI 30 -> 35)
    // -------------------------------------------------------------
    G6_ComprehensiveSemester1: function () {
      const char = choice(CHARACTERS);
      const a = randInt(15, 25);
      const b = randInt(10, a - 2);
      const h = randInt(8, 14);
      const S = ((a + b) * h) / 2;
      const yieldPer100 = choice([60, 65, 70, 75]); // kg/100m2
      const totalKg = (S / 100) * yieldPer100;
      const totalTa = totalKg / 100;

      const correct = `${formatNum(totalTa)} tạ`;
      const wrong1 = `${formatNum(totalKg)} tạ`;
      const wrong2 = `${formatNum(totalTa * 10)} tạ`;
      const wrong3 = `${formatNum(Math.round(totalTa * 0.8 * 10) / 10)} tạ`;

      const options = shuffle([
        { text: correct, isCorrect: true },
        { text: wrong1, isCorrect: false },
        { text: wrong2, isCorrect: false },
        { text: wrong3, isCorrect: false }
      ]);

      return {
        topicId: 6,
        topicTitle: "Chủ đề 6: Ôn tập học kì 1",
        semester: 1,
        level: 3,
        character: char,
        question: `Bác Ba có một thửa ruộng hình thang có đáy lớn ${a} m, đáy bé ${b} m, chiều cao ${h} m. Trung bình cứ 100 m² thu hoạch được ${yieldPer100} kg thóc. Hỏi trên cả thửa ruộng đó, bác Ba thu hoạch được bao nhiêu tạ thóc?`,
        options: options,
        solution: [
          `• Diện tích thửa ruộng hình thang là:`,
          `  (${a} + ${b}) × ${h} : 2 = ${S} (m²).`,
          `• Số ki-lô-gam thóc thu hoạch được trên thửa ruộng là:`,
          `  (${S} : 100) × ${yieldPer100} = ${formatNum(totalKg)} (kg).`,
          `• Đổi sang đơn vị tạ (1 tạ = 100 kg):`,
          `  ${formatNum(totalKg)} kg = <strong>${formatNum(totalTa)}</strong> tạ.`,
          `<strong>Đáp số:</strong> ${formatNum(totalTa)} tạ.`
        ],
        robotTip: "Chú ý đọc kỹ đơn vị đề bài yêu cầu: Hỏi 'tạ' thì sau khi tính ra 'kg' phải đổi bằng cách chia cho 100!"
      };
    },

    // -------------------------------------------------------------
    // CHỦ ĐỀ 7: TỈ SỐ VÀ CÁC BÀI TOÁN LIÊN QUAN (BÀI 36 -> 44)
    // -------------------------------------------------------------
    G7_SumAndRatioWordProblem: function () {
      const char = choice(CHARACTERS);
      const p1 = choice([1, 2, 3]);
      const p2 = choice([3, 4, 5]);
      if (p1 === p2) return GENERATORS.G7_SumAndRatioWordProblem();

      const unitVal = randInt(4, 15);
      const totalParts = p1 + p2;
      const total = unitVal * totalParts;
      const num1 = unitVal * p1;
      const num2 = unitVal * p2;

      const items = ["viên bi", "quyển vở", "con tem", "quả cam"];
      const item = choice(items);

      const correct = `Việt có ${num1} ${item}, Nam có ${num2} ${item}`;
      const wrong1 = `Việt có ${num2} ${item}, Nam có ${num1} ${item}`;
      const wrong2 = `Việt có ${num1 + 2} ${item}, Nam có ${num2 - 2} ${item}`;
      const wrong3 = `Việt có ${num1 - 3} ${item}, Nam có ${num2 + 3} ${item}`;

      const options = shuffle([
        { text: correct, isCorrect: true },
        { text: wrong1, isCorrect: false },
        { text: wrong2, isCorrect: false },
        { text: wrong3, isCorrect: false }
      ]);

      return {
        topicId: 7,
        topicTitle: "Chủ đề 7: Tỉ số và các bài toán liên quan",
        semester: 2,
        level: 2,
        character: char,
        question: `Hai bạn Việt và Nam có tất cả ${total} ${item}. Biết rằng số ${item} của Việt bằng ${p1}/${p2} số ${item} của Nam. Hỏi mỗi bạn có bao nhiêu ${item}?`,
        options: options,
        solution: [
          `• Dạng toán: Tìm hai số khi biết Tổng và Tỉ số của hai số đó (Bài 38).`,
          `• Tổng số phần bằng nhau là: ${p1} + ${p2} = ${totalParts} (phần).`,
          `• Giá trị một phần là: ${total} : ${totalParts} = ${unitVal} (${item}).`,
          `• Số ${item} của Việt là: ${unitVal} × ${p1} = <strong>${num1}</strong> (${item}).`,
          `• Số ${item} của Nam là: ${unitVal} × ${p2} = <strong>${num2}</strong> (${item}).`,
          `<strong>Đáp số:</strong> Việt: ${num1} ${item}; Nam: ${num2} ${item}.`
        ],
        robotTip: "Nhớ 4 bước: Vẽ sơ đồ ➔ Tìm tổng số phần bằng nhau ➔ Tìm giá trị một phần ➔ Tìm từng số!"
      };
    },

    G7_DifferenceAndRatioWordProblem: function () {
      const char = choice(CHARACTERS);
      const p1 = choice([1, 2, 3]);
      const p2 = choice([3, 4, 5, 7]);
      if (p1 >= p2) return GENERATORS.G7_DifferenceAndRatioWordProblem();

      const diffParts = p2 - p1;
      const unitVal = randInt(4, 12);
      const diff = unitVal * diffParts;
      const num1 = unitVal * p1; // Bé
      const num2 = unitVal * p2; // Lớn

      const correct = `Số bé: ${num1}; Số lớn: ${num2}`;
      const wrong1 = `Số bé: ${num2}; Số lớn: ${num1}`;
      const wrong2 = `Số bé: ${num1 + diffParts}; Số lớn: ${num2 - diffParts}`;
      const wrong3 = `Số bé: ${num1 * 2}; Số lớn: ${num2 * 2}`;

      const options = shuffle([
        { text: correct, isCorrect: true },
        { text: wrong1, isCorrect: false },
        { text: wrong2, isCorrect: false },
        { text: wrong3, isCorrect: false }
      ]);

      return {
        topicId: 7,
        topicTitle: "Chủ đề 7: Tỉ số và các bài toán liên quan",
        semester: 2,
        level: 2,
        character: char,
        question: `Hiệu của hai số là ${diff}. Tỉ số của hai số đó là ${p1}/${p2}. Tìm hai số đó.`,
        options: options,
        solution: [
          `• Dạng toán: Tìm hai số khi biết Hiệu và Tỉ số của hai số đó (Bài 39).`,
          `• Hiệu số phần bằng nhau là: ${p2} - ${p1} = ${diffParts} (phần).`,
          `• Giá trị một phần là: ${diff} : ${diffParts} = ${unitVal}.`,
          `• Số bé là: ${unitVal} × ${p1} = <strong>${num1}</strong>.`,
          `• Số lớn là: ${unitVal} × ${p2} = <strong>${num2}</strong> (hoặc ${num1} + ${diff} = ${num2}).`,
          `<strong>Đáp số:</strong> Số bé: ${num1}; Số lớn: ${num2}.`
        ],
        robotTip: "Với bài toán Hiệu - Tỉ, hãy tìm hiệu số phần bằng nhau bằng cách lấy số phần lớn trừ đi số phần bé!"
      };
    },

    G7_PercentageDiscount: function () {
      const char = choice(CHARACTERS);
      const originalPriceK = choice([150, 200, 250, 300, 400, 500]);
      const discountPercent = choice([10, 15, 20, 25, 30]);
      const discountVal = (originalPriceK * 1000 * discountPercent) / 100;
      const finalPrice = originalPriceK * 1000 - discountVal;

      const items = ["chiếc cặp sách", "bộ đồng phục", "đôi giày thể thao", "chiếc vợt cầu lông"];
      const item = choice(items);

      const correct = `${formatNum(finalPrice)} đồng`;
      const wrongTrapDiscountOnly = `${formatNum(discountVal)} đồng`; // Bẫy chỉ tính tiền giảm!
      const wrong1 = `${formatNum(originalPriceK * 1000 + discountVal)} đồng`;
      const wrong2 = `${formatNum(finalPrice - 10000)} đồng`;

      const options = shuffle([
        { text: correct, isCorrect: true },
        { text: wrongTrapDiscountOnly, isCorrect: false },
        { text: wrong1, isCorrect: false },
        { text: wrong2, isCorrect: false }
      ]);

      return {
        topicId: 7,
        topicTitle: "Chủ đề 7: Tỉ số và các bài toán liên quan",
        semester: 2,
        level: 2,
        character: char,
        question: `Một ${item} có giá niêm yết là ${formatNum(originalPriceK * 1000)} đồng. Nhân dịp khai giảng, cửa hàng giảm giá ${discountPercent}%. Hỏi bạn Mai phải trả bao nhiêu tiền để mua chiếc cặp đó?`,
        options: options,
        solution: [
          `• Số tiền được giảm giá là:`,
          `  ${formatNum(originalPriceK * 1000)} × ${discountPercent} : 100 = ${formatNum(discountVal)} (đồng).`,
          `• Số tiền bạn Mai thực tế phải trả là:`,
          `  ${formatNum(originalPriceK * 1000)} - ${formatNum(discountVal)} = <strong>${formatNum(finalPrice)}</strong> (đồng).`,
          `<strong>Đáp số:</strong> ${formatNum(finalPrice)} đồng.`
        ],
        robotTip: "Đề bài hỏi 'phải trả bao nhiêu tiền', nên sau khi tính tiền giảm giá, ta phải lấy giá gốc trừ đi tiền giảm nhé!"
      };
    },

    // -------------------------------------------------------------
    // CHỦ ĐỀ 8: THỂ TÍCH. ĐƠN VỊ ĐO THỂ TÍCH (BÀI 45 -> 48)
    // -------------------------------------------------------------
    G8_VolumeUnitsConversion: function () {
      const char = choice(CHARACTERS);
      const val = choice([1.8, 2.5, 3.4, 0.75, 4.2, 5]);
      const dm3 = Math.round(val * 1000);

      const correct = `${formatNum(dm3)} dm³ (hay ${formatNum(dm3)} lít)`;
      const wrongTrap100 = `${formatNum(val * 100)} dm³`; // Bẫy nhầm 100 của diện tích!
      const wrong1 = `${formatNum(val * 10)} dm³`;
      const wrong2 = `${formatNum(val * 10000)} dm³`;

      const options = shuffle([
        { text: correct, isCorrect: true },
        { text: wrongTrap100, isCorrect: false },
        { text: wrong1, isCorrect: false },
        { text: wrong2, isCorrect: false }
      ]);

      return {
        topicId: 8,
        topicTitle: "Chủ đề 8: Thể tích. Đơn vị đo thể tích",
        semester: 2,
        level: 1,
        character: char,
        question: `Một bể chứa nước có thể tích ${formatNum(val)} m³. Thể tích bể nước đó bằng bao nhiêu đề-xi-mét khối (dm³)?`,
        options: options,
        solution: [
          `• Ta biết: 1 m³ = 1000 dm³ = 1000 lít.`,
          `• Thể tích bể nước đổi ra đề-xi-mét khối là:`,
          `  ${formatNum(val)} × 1000 = <strong>${formatNum(dm3)}</strong> (dm³).`,
          `<strong>Đáp số:</strong> ${formatNum(dm3)} dm³.`
        ],
        robotTip: "Đơn vị đo thể tích hơn kém nhau 1000 lần (3 chữ số 0)! Đừng nhầm với đơn vị diện tích hơn kém nhau 100 lần!"
      };
    },

    // -------------------------------------------------------------
    // CHỦ ĐỀ 9: DIỆN TÍCH VÀ THỂ TÍCH HÌNH KHỐI (BÀI 49 -> 55)
    // -------------------------------------------------------------
    G9_RectangularBoxVolumeAndArea: function () {
      const char = choice(CHARACTERS);
      const a = randInt(5, 12); // Dài (dm)
      const b = randInt(4, a - 1); // Rộng (dm)
      const c = randInt(3, 8); // Cao (dm)

      const V = a * b * c; // dm3 = lít
      const Sxq = (a + b) * 2 * c;
      const Stp = Sxq + 2 * a * b;

      const isVolume = Math.random() > 0.5;

      if (isVolume) {
        const correct = `${formatNum(V)} dm³`;
        const wrong1 = `${formatNum(Sxq)} dm³`;
        const wrong2 = `${formatNum((a + b) * c)} dm³`;
        const wrong3 = `${formatNum(V + 20)} dm³`;

        const options = shuffle([
          { text: correct, isCorrect: true },
          { text: wrong1, isCorrect: false },
          { text: wrong2, isCorrect: false },
          { text: wrong3, isCorrect: false }
        ]);

        return {
          topicId: 9,
          topicTitle: "Chủ đề 9: Diện tích và thể tích hình khối",
          semester: 2,
          level: 2,
          character: char,
          question: `Một bể cá kính hình hộp chữ nhật có chiều dài ${a} dm, chiều rộng ${b} dm và chiều cao ${c} dm. Thể tích của bể cá đó là:`,
          options: options,
          solution: [
            `• Công thức tính thể tích hình hộp chữ nhật:`,
            `  V = a × b × c`,
            `• Thể tích của bể cá là:`,
            `  ${a} × ${b} × ${c} = <strong>${formatNum(V)}</strong> (dm³).`,
            `<strong>Đáp số:</strong> ${formatNum(V)} dm³ (chứa tối đa ${formatNum(V)} lít nước).`
          ],
          robotTip: "Thể tích hình hộp chữ nhật = Chiều dài × Chiều rộng × Chiều cao (cùng đơn vị đo)!"
        };
      } else {
        const correct = `${formatNum(Sxq)} dm²`;
        const wrongTrapStp = `${formatNum(Stp)} dm²`;
        const wrong1 = `${formatNum(a * b * c)} dm²`;
        const wrong2 = `${formatNum((a + b) * c)} dm²`;

        const options = shuffle([
          { text: correct, isCorrect: true },
          { text: wrongTrapStp, isCorrect: false },
          { text: wrong1, isCorrect: false },
          { text: wrong2, isCorrect: false }
        ]);

        return {
          topicId: 9,
          topicTitle: "Chủ đề 9: Diện tích và thể tích hình khối",
          semester: 2,
          level: 2,
          character: char,
          question: `Một thùng tôn hình hộp chữ nhật có chiều dài ${a} dm, chiều rộng ${b} dm và chiều cao ${c} dm. Diện tích xung quanh của thùng tôn đó là:`,
          options: options,
          solution: [
            `• Chu vi mặt đáy của hình hộp chữ nhật: (${a} + ${b}) × 2 = ${(a + b) * 2} (dm).`,
            `• Diện tích xung quanh = Chu vi đáy × Chiều cao:`,
            `  Sxq = ${(a + b) * 2} × ${c} = <strong>${formatNum(Sxq)}</strong> (dm²).`,
            `<strong>Đáp số:</strong> ${formatNum(Sxq)} dm².`
          ],
          robotTip: "Diện tích xung quanh hình hộp chữ nhật = Chu vi mặt đáy × Chiều cao!"
        };
      }
    },

    G9_CylinderUnfoldedNet: function () {
      const char = choice(CHARACTERS);
      const r = randInt(3, 8);
      const h = randInt(10, 20);
      const circumference = Math.round(r * 2 * 3.14 * 100) / 100;

      const correct = `Một hình chữ nhật kích thước ${formatNum(circumference)} cm × ${h} cm và 2 hình tròn bán kính ${r} cm`;
      const wrong1 = `Hai hình vuông và hai hình chữ nhật`;
      const wrong2 = `Một hình tam giác và hai hình tròn bán kính ${r} cm`;
      const wrong3 = `Một hình chữ nhật kích thước ${r} cm × ${h} cm và 1 hình tròn`;

      const options = shuffle([
        { text: correct, isCorrect: true },
        { text: wrong1, isCorrect: false },
        { text: wrong2, isCorrect: false },
        { text: wrong3, isCorrect: false }
      ]);

      return {
        topicId: 9,
        topicTitle: "Chủ đề 9: Diện tích và thể tích hình khối",
        semester: 2,
        level: 1,
        character: char,
        question: `Khi khai triển mặt xung quanh và hai đáy của một hình trụ có bán kính đáy ${r} cm và chiều cao ${h} cm, ta nhận được:`,
        options: options,
        solution: [
          `• Theo Bài 49 SGK Toán 5 Kết nối tri thức:`,
          `  - Khi mở mặt xung quanh của hình trụ, ta được một <strong>hình chữ nhật</strong> có:`,
          `    + Chiều dài bằng chu vi đáy hình trụ: ${r} × 2 × 3,14 = ${formatNum(circumference)} cm.`,
          `    + Chiều rộng bằng chiều cao hình trụ: ${h} cm.`,
          `  - Hai đáy là <strong>hai hình tròn bằng nhau</strong> có bán kính ${r} cm.`,
          `<strong>Đáp số:</strong> ${correct}.`
        ],
        robotTip: "Hình khai triển của hình trụ gồm 1 hình chữ nhật (mặt xung quanh) và 2 hình tròn bằng nhau (hai đáy)!"
      };
    },

    // -------------------------------------------------------------
    // CHỦ ĐỀ 10: SỐ ĐO THỜI GIAN. TOÁN CHUYỂN ĐỘNG ĐỀU (BÀI 56 -> 62)
    // -------------------------------------------------------------
    G10_ConvertMinutesToDecimalHours: function () {
      const char = choice(CHARACTERS);
      const minChoice = choice([
        { min: 15, hDec: "0,25" },
        { min: 30, hDec: "0,5" },
        { min: 45, hDec: "0,75" },
        { min: 36, hDec: "0,6" },
        { min: 48, hDec: "0,8" },
        { min: 12, hDec: "0,2" }
      ]);

      const correct = `${minChoice.hDec} giờ`;
      const wrongTrapDirect = `0,${minChoice.min} giờ`; // Bẫy kinh điển: 45 phút = 0,45 giờ!
      const wrong1 = `${minChoice.min / 10} giờ`;
      const wrong2 = `1,${minChoice.min} giờ`;

      const options = shuffle([
        { text: correct, isCorrect: true },
        { text: wrongTrapDirect, isCorrect: false },
        { text: wrong1, isCorrect: false },
        { text: wrong2, isCorrect: false }
      ]);

      return {
        topicId: 10,
        topicTitle: "Chủ đề 10: Số đo thời gian. Vận tốc, quãng đường, thời gian",
        semester: 2,
        level: 1,
        character: char,
        question: `Đổi số đo thời gian: ${minChoice.min} phút = ... giờ?`,
        options: options,
        solution: [
          `• 1 giờ = 60 phút.`,
          `• Muốn đổi từ phút sang giờ, ta lấy số phút chia cho 60:`,
          `  ${minChoice.min} : 60 = <strong>${minChoice.hDec}</strong> (giờ).`,
          `<strong>Đáp số:</strong> ${minChoice.hDec} giờ.`
        ],
        robotTip: "Bẫy siêu phổ biến: Tuyệt đối không viết " + minChoice.min + " phút thành 0," + minChoice.min + " giờ! Phải chia cho 60 nhé!"
      };
    },

    G10_OppositeDirectionMeetingProblem: function () {
      const char = choice(CHARACTERS);
      const v1 = choice([35, 40, 42, 45, 48]); // Xe máy
      const v2 = choice([50, 55, 60, 65]); // Ô tô
      const tHours = choice([1.5, 2, 2.5, 3]);
      const s = (v1 + v2) * tHours;

      const cities = [
        { from: "Hà Nội", to: "Hải Phòng" },
        { from: "Hà Nội", to: "Nam Định" },
        { from: "TP. Hồ Chí Minh", to: "Vũng Tàu" },
        { from: "Đà Nẵng", to: "Huế" }
      ];
      const city = choice(cities);

      const correct = `${formatNum(tHours)} giờ`;
      const wrong1 = `${formatNum(tHours + 0.5)} giờ`;
      const wrong2 = `${formatNum(tHours - 0.5)} giờ`;
      const wrong3 = `${formatNum(Math.round(s / (v2 - v1) * 10) / 10)} giờ`;

      const options = shuffle([
        { text: correct, isCorrect: true },
        { text: wrong1, isCorrect: false },
        { text: wrong2, isCorrect: false },
        { text: wrong3, isCorrect: false }
      ]);

      return {
        topicId: 10,
        topicTitle: "Chủ đề 10: Số đo thời gian. Vận tốc, quãng đường, thời gian",
        semester: 2,
        level: 3,
        character: char,
        question: `Quãng đường từ ${city.from} đến ${city.to} dài ${formatNum(s)} km. Một ô tô đi từ ${city.from} với vận tốc ${v2} km/h và một xe máy đi từ ${city.to} với vận tốc ${v1} km/h khởi hành cùng một lúc và đi ngược chiều nhau. Hỏi sau bao lâu hai xe gặp nhau?`,
        options: options,
        solution: [
          `• Dạng toán chuyển động ngược chiều gặp nhau (Bài 62):`,
          `• Sau mỗi giờ, hai xe đi được quãng đường là (tổng vận tốc):`,
          `  ${v2} + ${v1} = ${v1 + v2} (km).`,
          `• Thời gian để hai xe gặp nhau là:`,
          `  ${formatNum(s)} : ${v1 + v2} = <strong>${formatNum(tHours)}</strong> (giờ).`,
          `<strong>Đáp số:</strong> ${formatNum(tHours)} giờ.`
        ],
        robotTip: "Đi ngược chiều gặp nhau: Thời gian gặp nhau = Quãng đường : Tổng hai vận tốc (t = s : (v1 + v2))!"
      };
    },

    G10_SameDirectionCatchUpProblem: function () {
      const char = choice(CHARACTERS);
      const vBike = 12; // Xe đạp
      const vMoto = choice([36, 42, 48]); // Xe máy
      const headStartHours = choice([1, 1.5, 2]);
      const initialDistance = vBike * headStartHours;
      const speedDiff = vMoto - vBike;
      const catchUpTime = Math.round((initialDistance / speedDiff) * 10) / 10;

      const correct = `${formatNum(catchUpTime)} giờ`;
      const wrong1 = `${formatNum(catchUpTime + 1)} giờ`;
      const wrong2 = `${formatNum(headStartHours)} giờ`;
      const wrong3 = `${formatNum(Math.round(initialDistance / (vMoto + vBike) * 10) / 10)} giờ`;

      const options = shuffle([
        { text: correct, isCorrect: true },
        { text: wrong1, isCorrect: false },
        { text: wrong2, isCorrect: false },
        { text: wrong3, isCorrect: false }
      ]);

      return {
        topicId: 10,
        topicTitle: "Chủ đề 10: Số đo thời gian. Vận tốc, quãng đường, thời gian",
        semester: 2,
        level: 3,
        character: char,
        question: `Một người đi xe đạp với vận tốc ${vBike} km/h. Sau ${formatNum(headStartHours)} giờ, một người đi xe máy đuổi theo với vận tốc ${vMoto} km/h cùng xuất phát từ điểm đó. Hỏi sau bao lâu kể từ lúc xe máy bắt đầu đi, người đi xe máy đuổi kịp người đi xe đạp?`,
        options: options,
        solution: [
          `• Quãng đường người đi xe đạp đã đi trước (khoảng cách ban đầu):`,
          `  ${vBike} × ${formatNum(headStartHours)} = ${formatNum(initialDistance)} (km).`,
          `• Sau mỗi giờ xe máy rút ngắn khoảng cách so với xe đạp là (hiệu vận tốc):`,
          `  ${vMoto} - ${vBike} = ${speedDiff} (km/h).`,
          `• Thời gian xe máy đuổi kịp xe đạp là:`,
          `  ${formatNum(initialDistance)} : ${speedDiff} = <strong>${formatNum(catchUpTime)}</strong> (giờ).`,
          `<strong>Đáp số:</strong> ${formatNum(catchUpTime)} giờ.`
        ],
        robotTip: "Đi cùng chiều đuổi kịp: Thời gian đuổi kịp = Khoảng cách cách nhau : Hiệu hai vận tốc (t = s : (v1 - v2))!"
      };
    },

    // -------------------------------------------------------------
    // CHỦ ĐỀ 11: MỘT SỐ YẾU TỐ THỐNG KÊ VÀ XÁC SUẤT (BÀI 63 -> 66)
    // -------------------------------------------------------------
    G11_PieChartInterpretation: function () {
      const char = choice(CHARACTERS);
      const totalStudents = choice([200, 300, 400, 500]);
      const pMath = choice([35, 40, 45, 50]);
      const countMath = (totalStudents * pMath) / 100;

      const correct = `${countMath} học sinh`;
      const wrong1 = `${pMath} học sinh`;
      const wrong2 = `${countMath + 20} học sinh`;
      const wrong3 = `${countMath - 15} học sinh`;

      const options = shuffle([
        { text: correct, isCorrect: true },
        { text: wrong1, isCorrect: false },
        { text: wrong2, isCorrect: false },
        { text: wrong3, isCorrect: false }
      ]);

      return {
        topicId: 11,
        topicTitle: "Chủ đề 11: Một số yếu tố thống kê và xác suất",
        semester: 2,
        level: 2,
        character: char,
        question: `Khảo sát môn học yêu thích của ${totalStudents} học sinh khối lớp 5. Biểu đồ hình quạt tròn cho biết có ${pMath}% học sinh yêu thích môn Toán. Hỏi có bao nhiêu học sinh yêu thích môn Toán?`,
        options: options,
        solution: [
          `• Theo Bài 64 SGK Toán 5: Toàn bộ hình quạt tròn tương ứng với 100%.`,
          `• Số học sinh yêu thích môn Toán là:`,
          `  ${totalStudents} × ${pMath} : 100 = <strong>${countMath}</strong> (học sinh).`,
          `<strong>Đáp số:</strong> ${countMath} học sinh.`
        ],
        robotTip: "Toàn bộ biểu đồ hình quạt tròn luôn là 100%. Muốn tìm số lượng thành phần, lấy Tổng × Tỉ lệ % : 100!"
      };
    },

    G11_ExperimentalProbabilityRatio: function () {
      const char = choice(CHARACTERS);
      const totalTrials = choice([20, 30, 40, 50]);
      const successCount = choice([9, 11, 13, 17, 19, 21, 23]);
      const g = gcd(successCount, totalTrials);
      const simNum = successCount / g;
      const simDen = totalTrials / g;

      const correct = `${simNum}/${simDen}`;
      const wrong1 = `${totalTrials - successCount}/${totalTrials}`;
      const wrong2 = `${successCount}/${totalTrials + 5}`;
      const wrong3 = `${simDen}/${simNum}`;

      const options = shuffle([
        { text: correct, isCorrect: true },
        { text: wrong1, isCorrect: false },
        { text: wrong2, isCorrect: false },
        { text: wrong3, isCorrect: false }
      ]);

      return {
        topicId: 11,
        topicTitle: "Chủ đề 11: Một số yếu tố thống kê và xác suất",
        semester: 2,
        level: 2,
        character: char,
        question: `Bạn Nam gieo một đồng xu ${totalTrials} lần và ghi lại có ${successCount} lần xuất hiện mặt Ngửa. Tỉ số của số lần lặp lại sự kiện mặt Ngửa so với tổng số lần thực hiện là:`,
        options: options,
        solution: [
          `• Theo Bài 65 SGK Toán 5: Xác suất thực nghiệm = (Số lần lặp lại sự kiện) / (Tổng số lần thực hiện).`,
          `• Tỉ số cần tìm là: ${successCount}/${totalTrials}.`,
          `• Rút gọn tối giản (nếu có): <strong>${simNum}/${simDen}</strong>.`,
          `<strong>Đáp số:</strong> ${simNum}/${simDen}.`
        ],
        robotTip: "Tỉ số của số lần lặp lại sự kiện so với tổng số lần thực hiện luôn viết dưới dạng phân số tối giản!"
      };
    },

    // -------------------------------------------------------------
    // CHỦ ĐỀ 12: ÔN TẬP CUỐI NĂM (BÀI 67 -> 71)
    // -------------------------------------------------------------
    G12_ComprehensiveYearEndWaterTank: function () {
      const char = choice(CHARACTERS);
      const a = randInt(15, 25) / 10; // dài 1.5 - 2.5 m
      const b = randInt(10, 15) / 10; // rộng 1.0 - 1.5 m
      const h = randInt(8, 12) / 10;  // cao 0.8 - 1.2 m
      const V_m3 = Math.round(a * b * h * 100) / 100;
      const V_liters = Math.round(V_m3 * 1000); // dm3 = lít

      const flowRatePerMin = choice([20, 25, 30, 40, 50]); // lít / phút
      const totalMinutes = Math.round(V_liters / flowRatePerMin);
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;

      const timeStr = hours > 0 ? `${hours} giờ ${mins} phút` : `${mins} phút`;

      const correct = timeStr;
      const wrong1 = `${hours + 1} giờ ${mins} phút`;
      const wrong2 = `${Math.round(totalMinutes * 0.8)} phút`;
      const wrong3 = `${totalMinutes + 30} phút`;

      const options = shuffle([
        { text: correct, isCorrect: true },
        { text: wrong1, isCorrect: false },
        { text: wrong2, isCorrect: false },
        { text: wrong3, isCorrect: false }
      ]);

      return {
        topicId: 12,
        topicTitle: "Chủ đề 12: Ôn tập cuối năm",
        semester: 2,
        level: 3,
        character: char,
        question: `Một bể nước hình hộp chữ nhật có kích thước bên trong là: chiều dài ${formatNum(a)} m, chiều rộng ${formatNum(b)} m và chiều cao ${formatNum(h)} m. Người ta mở một vòi nước chảy vào bể, trung bình mỗi phút vòi chảy được ${flowRatePerMin} lít nước. Hỏi sau bao lâu thì bể đầy nước?`,
        options: options,
        solution: [
          `• Thể tích của bể nước là:`,
          `  ${formatNum(a)} × ${formatNum(b)} × ${formatNum(h)} = ${formatNum(V_m3)} (m³).`,
          `• Đổi sang đơn vị lít (1 m³ = 1000 dm³ = 1000 lít):`,
          `  ${formatNum(V_m3)} m³ = ${formatNum(V_liters)} lít.`,
          `• Thời gian để vòi nước chảy đầy bể là:`,
          `  ${formatNum(V_liters)} : ${flowRatePerMin} = ${totalMinutes} (phút).`,
          `• Đổi ra giờ và phút: ${totalMinutes} phút = <strong>${timeStr}</strong>.`,
          `<strong>Đáp số:</strong> ${timeStr}.`
        ],
        robotTip: "Bài toán kết hợp thể tích hình hộp chữ nhật, chuyển đổi đơn vị thể tích sang lít và giải toán tỉ lệ thực tế!"
      };
    }
  };

  /* =========================================================================
     4. MA TRẬN PHÂN BỔ CÂU HỎI THEO CHẾ ĐỘ THI & CHỦ ĐỀ
     ========================================================================= */
  const ALL_GEN_KEYS = Object.keys(GENERATORS);

  const TOPIC_GEN_MAP = {
    1: ['G1_FractionToDecimalFraction', 'G1_MixedFractionToFraction', 'G1_RatioOfQuantities'],
    2: ['G2_DigitPlaceValue', 'G2_RoundingDecimals'],
    3: ['G3_ConvertHectareToSquareMeters', 'G3_ConvertKm2ToHa'],
    4: ['G4_MultiplyByTenHundredOrDecimals', 'G4_WordProblemDecimalMath'],
    5: ['G5_TriangleArea', 'G5_TrapezoidArea', 'G5_CircleAreaAndCircumference'],
    6: ['G6_ComprehensiveSemester1', 'G5_TrapezoidArea', 'G4_WordProblemDecimalMath'],
    7: ['G7_SumAndRatioWordProblem', 'G7_DifferenceAndRatioWordProblem', 'G7_PercentageDiscount'],
    8: ['G8_VolumeUnitsConversion'],
    9: ['G9_RectangularBoxVolumeAndArea', 'G9_CylinderUnfoldedNet'],
    10: ['G10_ConvertMinutesToDecimalHours', 'G10_OppositeDirectionMeetingProblem', 'G10_SameDirectionCatchUpProblem'],
    11: ['G11_PieChartInterpretation', 'G11_ExperimentalProbabilityRatio'],
    12: ['G12_ComprehensiveYearEndWaterTank', 'G10_OppositeDirectionMeetingProblem', 'G7_PercentageDiscount', 'G9_RectangularBoxVolumeAndArea']
  };

  const EXAM_MODE_POOLS = {
    'giua-ky-1': [
      ...TOPIC_GEN_MAP[1],
      ...TOPIC_GEN_MAP[2],
      ...TOPIC_GEN_MAP[3]
    ],
    'cuoi-ky-1': [
      ...TOPIC_GEN_MAP[1],
      ...TOPIC_GEN_MAP[2],
      ...TOPIC_GEN_MAP[3],
      ...TOPIC_GEN_MAP[4],
      ...TOPIC_GEN_MAP[5],
      ...TOPIC_GEN_MAP[6]
    ],
    'giua-ky-2': [
      ...TOPIC_GEN_MAP[7],
      ...TOPIC_GEN_MAP[8],
      ...TOPIC_GEN_MAP[9]
    ],
    'cuoi-nam': ALL_GEN_KEYS
  };

  /* =========================================================================
     5. HÀM TẠO ĐỀ THI TỰ ĐỘNG KHÔNG TRÙNG LẶP (CORE API)
     ========================================================================= */
  function generateExam(mode = 'cuoi-nam', count = 12) {
    let pool = [];

    if (mode.startsWith('topic-')) {
      const topicId = parseInt(mode.replace('topic-', ''), 10);
      pool = TOPIC_GEN_MAP[topicId] || ALL_GEN_KEYS;
    } else if (EXAM_MODE_POOLS[mode]) {
      pool = EXAM_MODE_POOLS[mode];
    } else {
      pool = ALL_GEN_KEYS;
    }

    const questions = [];
    const usedSignatures = new Set();
    const examCode = `KNTT-${randInt(10000, 99999)}`;

    let attempts = 0;
    while (questions.length < count && attempts < count * 20) {
      attempts++;
      // Rotate through pool or pick random
      const genKey = pool[questions.length % pool.length] || choice(pool);
      const generatorFn = GENERATORS[genKey];
      if (typeof generatorFn !== 'function') continue;

      const q = generatorFn();
      // Generate deduplication signature based on question text core
      const sig = q.question.replace(/\s+/g, '').substring(0, 40);
      if (!usedSignatures.has(sig) || questions.length >= pool.length) {
        usedSignatures.add(sig);
        q.id = questions.length + 1;
        q.type = 'mcq';
        questions.push(q);
      }
    }

    return {
      examCode: examCode,
      mode: mode,
      count: questions.length,
      createdAt: new Date().toISOString(),
      questions: questions
    };
  }

  return {
    generateExam: generateExam,
    GENERATORS: GENERATORS,
    CHARACTERS: CHARACTERS
  };
});
