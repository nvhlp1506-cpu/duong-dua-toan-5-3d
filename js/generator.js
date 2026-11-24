/**
 * ============================================================================
 * ĐẢO KHO BÁU TOÁN 5 - BỘ MÁY SINH ĐỀ THÔNG MINH (PROCEDURAL GENERATOR)
 * Chuẩn Chương trình GDPT 2018 - Bộ sách Kết nối tri thức với cuộc sống
 * 
 * Tính năng nổi bật:
 * 1. Thuật toán sinh số ngẫu nhiên tham số hóa, vô hạn câu hỏi không trùng lặp.
 * 2. Triệt tiêu 100% lỗi sai dấu phẩy động JavaScript (0.1 + 0.2 != 0.3) bằng số nguyên quy đổi.
 * 3. Chuẩn hóa hiển thị tiếng Việt (dấu phẩy , cho số thập phân, ví dụ 14,5).
 * 4. Tạo đáp án nhiễu (distractors) dựa trên bẫy và lỗi tư duy kinh điển của học sinh lớp 5.
 * 5. Tự động vẽ hình học & sơ đồ chuyển động bằng SVG trực quan có ghi kích thước.
 * 6. Lời giải chi tiết từng bước & công thức ghi nhớ tức thì.
 * ============================================================================
 */

const MathGenerator = (function () {

  // =================== TIỆN ÍCH TOÁN HỌC & LÀM TRÒN CHUẨN ===================

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function shuffle(arr) {
    const res = [...arr];
    for (let i = res.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [res[i], res[j]] = [res[j], res[i]];
    }
    return res;
  }

  function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a || 1;
  }

  function lcm(a, b) {
    return Math.abs(a * b) / gcd(a, b);
  }

  // Khắc phục hoàn toàn lỗi Floating-Point JS (ví dụ 0.1 + 0.2 = 0.3)
  function roundClean(num, decimals = 2) {
    const factor = Math.pow(10, decimals);
    return Math.round((num + Number.EPSILON) * factor) / factor;
  }

  // Định dạng số chuẩn Việt Nam (ví dụ: 12,5 hoặc 1.250)
  function vnNumber(num, maxDecimals = 3) {
    if (typeof num !== 'number') return num;
    const clean = roundClean(num, maxDecimals);
    return clean.toString().replace('.', ',');
  }

  // Render phân số chuẩn định dạng toán học (hỗ trợ KaTeX và fallback CSS chuẩn SGK)
  function renderFraction(numerator, denominator) {
    if (typeof katex !== 'undefined') {
      try {
        return katex.renderToString(`\\frac{${numerator}}{${denominator}}`, { throwOnError: false });
      } catch (e) {}
    }
    return `<span class="math-fraction"><span class="num">${numerator}</span><span class="den">${denominator}</span></span>`;
  }

  // Render hỗn số chuẩn toán học
  function renderMixed(whole, numerator, denominator) {
    if (typeof katex !== 'undefined') {
      try {
        return katex.renderToString(`{${whole}}\\frac{${numerator}}{${denominator}}`, { throwOnError: false });
      } catch (e) {}
    }
    return `<span class="math-mixed"><span class="whole">${whole}</span>${renderFraction(numerator, denominator)}</span>`;
  }

  // Tiện ích bọc biến số toán học (x, y, a, b, s, v, t, S...) in nghiêng Serif
  function mathVar(v) {
    return `<span class="math-var">${v}</span>`;
  }

  // Tiện ích bọc công thức toán học
  function mathFormula(latexOrHtml) {
    return `<span class="math-font font-semibold">${latexOrHtml}</span>`;
  }

  // Chuẩn hóa câu trả lời học sinh nhập (chấp nhận cả 12,5 lẫn 12.5)
  function normalizeInput(val) {
    if (val === null || val === undefined) return '';
    return val.toString().trim().replace(',', '.');
  }

  // So sánh kết quả tự điền
  function checkAnswerEqual(userVal, correctVal, acceptableList = []) {
    const userClean = normalizeInput(userVal);
    const correctClean = normalizeInput(correctVal);

    if (userClean === correctClean) return true;

    // Kiểm tra danh sách chấp nhận
    for (const alt of acceptableList) {
      if (normalizeInput(alt) === userClean) return true;
    }

    // Nếu cả hai là số thực, kiểm tra sai số rất nhỏ
    const uNum = parseFloat(userClean);
    const cNum = parseFloat(correctClean);
    if (!isNaN(uNum) && !isNaN(cNum)) {
      if (Math.abs(uNum - cNum) < 0.001) return true;
    }

    return false;
  }

  // =================== CÁC HÀM TẠO SVG HÌNH HỌC VÀ CHUYỂN ĐỘNG (CHUẨN TOÁN HỌC) ===================

  function createTriangleSVG(base, height, unit = 'cm') {
    return `
    <div class="my-3 flex justify-center">
      <svg viewBox="0 0 280 160" class="w-64 max-w-full h-auto drop-shadow-md">
        <!-- Nền tam giác -->
        <polygon points="40,130 240,130 180,30" fill="#bae6fd" stroke="#0284c7" stroke-width="3" stroke-linejoin="round"/>
        <!-- Đường cao nét đứt -->
        <line x1="180" y1="30" x2="180" y2="130" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="5,4"/>
        <!-- Ký hiệu góc vuông -->
        <polyline points="180,118 192,118 192,130" fill="none" stroke="#ef4444" stroke-width="2"/>
        <!-- Nhãn đáy (định dạng toán học) -->
        <text x="140" y="152" fill="#0369a1" font-size="14" font-weight="bold" text-anchor="middle" font-family="'STIX Two Text', 'Cambria Math', 'Times New Roman', serif">Đáy <tspan font-style="italic">a</tspan> = ${vnNumber(base)} ${unit}</text>
        <!-- Nhãn chiều cao -->
        <text x="215" y="75" fill="#dc2626" font-size="14" font-weight="bold" text-anchor="middle" font-family="'STIX Two Text', 'Cambria Math', 'Times New Roman', serif"><tspan font-style="italic">h</tspan> = ${vnNumber(height)} ${unit}</text>
      </svg>
    </div>`;
  }

  function createTrapezoidSVG(topBase, bottomBase, height, unit = 'cm') {
    return `
    <div class="my-3 flex justify-center">
      <svg viewBox="0 0 300 170" class="w-68 max-w-full h-auto drop-shadow-md">
        <!-- Nền hình thang -->
        <polygon points="80,40 200,40 260,130 40,130" fill="#fef08a" stroke="#ca8a04" stroke-width="3" stroke-linejoin="round"/>
        <!-- Chiều cao nét đứt -->
        <line x1="80" y1="40" x2="80" y2="130" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="5,4"/>
        <!-- Ký hiệu góc vuông -->
        <polyline points="80,118 92,118 92,130" fill="none" stroke="#ef4444" stroke-width="2"/>
        <!-- Đáy bé & Đáy lớn -->
        <text x="140" y="28" fill="#854d0e" font-size="14" font-weight="bold" text-anchor="middle" font-family="'STIX Two Text', 'Cambria Math', 'Times New Roman', serif">Đáy bé <tspan font-style="italic">a</tspan> = ${vnNumber(topBase)} ${unit}</text>
        <text x="150" y="152" fill="#854d0e" font-size="14" font-weight="bold" text-anchor="middle" font-family="'STIX Two Text', 'Cambria Math', 'Times New Roman', serif">Đáy lớn <tspan font-style="italic">b</tspan> = ${vnNumber(bottomBase)} ${unit}</text>
        <!-- Chiều cao -->
        <text x="50" y="85" fill="#dc2626" font-size="14" font-weight="bold" text-anchor="middle" font-family="'STIX Two Text', 'Cambria Math', 'Times New Roman', serif"><tspan font-style="italic">h</tspan> = ${vnNumber(height)} ${unit}</text>
      </svg>
    </div>`;
  }

  function createCircleSVG(radius, isDiameter = false, unit = 'cm') {
    const label = isDiameter 
      ? `Đường kính <tspan font-style="italic">d</tspan> = ${vnNumber(radius * 2)} ${unit}`
      : `Bán kính <tspan font-style="italic">r</tspan> = ${vnNumber(radius)} ${unit}`;
    
    return `
    <div class="my-3 flex justify-center">
      <svg viewBox="0 0 240 180" class="w-56 max-w-full h-auto drop-shadow-md">
        <circle cx="120" cy="90" r="65" fill="#fed7aa" stroke="#ea580c" stroke-width="3"/>
        <circle cx="120" cy="90" r="4" fill="#c2410c"/>
        <text x="110" y="85" fill="#7c2d12" font-size="13" font-weight="bold" font-family="'STIX Two Text', 'Cambria Math', 'Times New Roman', serif"><tspan font-style="italic">O</tspan></text>
        ${isDiameter ? `
          <line x1="55" y1="90" x2="185" y2="90" stroke="#c2410c" stroke-width="2.5" stroke-dasharray="4,3"/>
        ` : `
          <line x1="120" y1="90" x2="185" y2="90" stroke="#c2410c" stroke-width="2.5"/>
        `}
        <text x="120" y="172" fill="#9a3412" font-size="14" font-weight="bold" text-anchor="middle" font-family="'STIX Two Text', 'Cambria Math', 'Times New Roman', serif">${label}</text>
      </svg>
    </div>`;
  }

  function createBoxSVG(length, width, height, unit = 'cm', isCube = false) {
    const title = isCube 
      ? `Hình lập phương cạnh <tspan font-style="italic">a</tspan> = ${vnNumber(length)} ${unit}`
      : `Dài ${vnNumber(length)} ${unit}, Rộng ${vnNumber(width)} ${unit}, Cao ${vnNumber(height)} ${unit}`;
    
    return `
    <div class="my-3 flex justify-center">
      <svg viewBox="0 0 280 180" class="w-64 max-w-full h-auto drop-shadow-md font-sans">
        <!-- Mặt trước -->
        <polygon points="50,70 170,70 170,140 50,140" fill="#bbf7d0" stroke="#16a34a" stroke-width="2.5"/>
        <!-- Mặt trên -->
        <polygon points="50,70 110,30 230,30 170,70" fill="#86efac" stroke="#16a34a" stroke-width="2.5"/>
        <!-- Mặt bên phải -->
        <polygon points="170,70 230,30 230,100 170,140" fill="#4ade80" stroke="#16a34a" stroke-width="2.5"/>
        <!-- Nét khuất bên trong -->
        <line x1="50" y1="140" x2="110" y2="100" stroke="#15803d" stroke-width="1.5" stroke-dasharray="4,3"/>
        <line x1="110" y1="30" x2="110" y2="100" stroke="#15803d" stroke-width="1.5" stroke-dasharray="4,3"/>
        <line x1="110" y1="100" x2="230" y2="100" stroke="#15803d" stroke-width="1.5" stroke-dasharray="4,3"/>
        <!-- Kích thước -->
        <text x="110" y="156" fill="#166534" font-size="13" font-weight="bold" text-anchor="middle" font-family="'STIX Two Text', 'Cambria Math', 'Times New Roman', serif">${vnNumber(length)} ${unit}</text>
        <text x="210" y="125" fill="#166534" font-size="13" font-weight="bold" text-anchor="middle" font-family="'STIX Two Text', 'Cambria Math', 'Times New Roman', serif">${vnNumber(width)} ${unit}</text>
        <text x="35" y="105" fill="#166534" font-size="13" font-weight="bold" text-anchor="middle" font-family="'STIX Two Text', 'Cambria Math', 'Times New Roman', serif">${vnNumber(height)} ${unit}</text>
        <text x="140" y="174" fill="#14532d" font-size="13" font-weight="bold" text-anchor="middle" font-family="'STIX Two Text', 'Cambria Math', 'Times New Roman', serif">${title}</text>
      </svg>
    </div>`;
  }

  function createMotionSVG(v1, v2, distance, isOpposite = true) {
    if (isOpposite) {
      return `
      <div class="my-3 flex justify-center">
        <svg viewBox="0 0 340 120" class="w-72 max-w-full h-auto drop-shadow-md">
          <!-- Đường đi -->
          <line x1="30" y1="80" x2="310" y2="80" stroke="#475569" stroke-width="4" stroke-linecap="round"/>
          <!-- Cột mốc A và B -->
          <circle cx="30" cy="80" r="5" fill="#0284c7"/>
          <text x="30" y="100" fill="#0369a1" font-size="13" font-weight="bold" text-anchor="middle" font-family="'STIX Two Text', 'Cambria Math', 'Times New Roman', serif"><tspan font-style="italic">A</tspan></text>
          <circle cx="310" cy="80" r="5" fill="#dc2626"/>
          <text x="310" y="100" fill="#b91c1c" font-size="13" font-weight="bold" text-anchor="middle" font-family="'STIX Two Text', 'Cambria Math', 'Times New Roman', serif"><tspan font-style="italic">B</tspan></text>
          <!-- Xe 1 đi từ A -->
          <rect x="40" y="55" width="30" height="15" rx="3" fill="#38bdf8"/>
          <path d="M 75 62 L 95 62 M 90 57 L 96 62 L 90 67" stroke="#0284c7" stroke-width="2.5" fill="none"/>
          <text x="55" y="48" fill="#0284c7" font-size="12" font-weight="bold" text-anchor="middle" font-family="'STIX Two Text', 'Cambria Math', 'Times New Roman', serif"><tspan font-style="italic">v</tspan><tspan font-size="9" dy="2">1</tspan><tspan font-size="12" dy="-2"> = ${v1} km/h</tspan></text>
          <!-- Xe 2 đi từ B -->
          <rect x="270" y="55" width="30" height="15" rx="3" fill="#f87171"/>
          <path d="M 265 62 L 245 62 M 250 57 L 244 62 L 250 67" stroke="#dc2626" stroke-width="2.5" fill="none"/>
          <text x="285" y="48" fill="#dc2626" font-size="12" font-weight="bold" text-anchor="middle" font-family="'STIX Two Text', 'Cambria Math', 'Times New Roman', serif"><tspan font-style="italic">v</tspan><tspan font-size="9" dy="2">2</tspan><tspan font-size="12" dy="-2"> = ${v2} km/h</tspan></text>
          <!-- Quãng đường AB -->
          <line x1="30" y1="20" x2="310" y2="20" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3,3"/>
          <text x="170" y="18" fill="#334155" font-size="13" font-weight="bold" text-anchor="middle" font-family="'STIX Two Text', 'Cambria Math', 'Times New Roman', serif">Khoảng cách <tspan font-style="italic">s</tspan> = ${distance} km</text>
        </svg>
      </div>`;
    } else {
      return `
      <div class="my-3 flex justify-center">
        <svg viewBox="0 0 340 120" class="w-72 max-w-full h-auto drop-shadow-md">
          <line x1="30" y1="80" x2="310" y2="80" stroke="#475569" stroke-width="4" stroke-linecap="round"/>
          <circle cx="30" cy="80" r="5" fill="#0284c7"/>
          <text x="30" y="100" fill="#0369a1" font-size="13" font-weight="bold" text-anchor="middle" font-family="'STIX Two Text', 'Cambria Math', 'Times New Roman', serif"><tspan font-style="italic">A</tspan></text>
          <!-- Xe đi trước -->
          <rect x="130" y="55" width="28" height="15" rx="3" fill="#fbbf24"/>
          <path d="M 162 62 L 180 62 M 175 57 L 181 62 L 175 67" stroke="#d97706" stroke-width="2.5" fill="none"/>
          <text x="144" y="48" fill="#d97706" font-size="12" font-weight="bold" text-anchor="middle" font-family="'STIX Two Text', 'Cambria Math', 'Times New Roman', serif"><tspan font-style="italic">v</tspan><tspan font-size="9" dy="2">1</tspan><tspan font-size="12" dy="-2"> = ${v1} km/h</tspan></text>
          <!-- Xe đuổi theo -->
          <rect x="40" y="55" width="28" height="15" rx="3" fill="#38bdf8"/>
          <path d="M 72 62 L 95 62 M 90 57 L 96 62 L 90 67" stroke="#0284c7" stroke-width="2.5" fill="none"/>
          <text x="54" y="48" fill="#0284c7" font-size="12" font-weight="bold" text-anchor="middle" font-family="'STIX Two Text', 'Cambria Math', 'Times New Roman', serif"><tspan font-style="italic">v</tspan><tspan font-size="9" dy="2">2</tspan><tspan font-size="12" dy="-2"> = ${v2} km/h</tspan></text>
          <!-- Khoảng cách lúc bắt đầu đuổi -->
          <line x1="40" y1="20" x2="140" y2="20" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3,3"/>
          <text x="90" y="16" fill="#334155" font-size="12" font-weight="bold" text-anchor="middle" font-family="'STIX Two Text', 'Cambria Math', 'Times New Roman', serif">Cách nhau ${distance} km</text>
        </svg>
      </div>`;
    }
  }

  // =========================================================================
  // VÙNG ĐẤT 1: RỪNG PHÂN SỐ (FRACTION FOREST)
  // =========================================================================

  const FractionLand = {
    // 1-1: Rút gọn phân số
    generateStage1(isInput) {
      const a = randChoice([1, 2, 3, 5, 7]);
      let b = randChoice([2, 3, 4, 5, 6, 7, 8, 9]);
      while (gcd(a, b) !== 1 || a === b) {
        b = randChoice([2, 3, 4, 5, 6, 7, 8, 9]);
      }
      const k = randChoice([2, 3, 4, 5, 6, 8, 9]);
      const num = a * k;
      const den = b * k;

      const questionText = `Rút gọn phân số ${renderFraction(num, den)} về phân số tối giản:`;
      const correctStr = `${a}/${b}`;
      const correctFractionHTML = renderFraction(a, b);

      if (isInput) {
        return {
          question: questionText,
          subText: `Nhập dạng phân số (ví dụ: ${a}/${b}):`,
          type: 'input',
          correctAnswer: correctStr,
          acceptableAnswers: [correctStr, `${a} / ${b}`],
          explanation: `Ta thấy cả tử số ${num} và mẫu số ${den} cùng chia hết cho ${k}:<br>${num} : ${k} = ${a}; ${den} : ${k} = ${b}.<br>Vậy phân số tối giản là ${renderFraction(a, b)}.`,
          formula: `Cùng chia cả tử số và mẫu số cho ước chung lớn nhất (${k}).`,
          hint: `Tìm số mà cả ${num} và ${den} đều chia hết!`
        };
      }

      // Tạo các phương án nhiễu phổ biến
      const distractors = [
        renderFraction(num, b), // Quên chia tử
        renderFraction(a, den), // Quên chia mẫu
        renderFraction(a + 1, b), // Rút gọn nhầm
        renderFraction(b, a), // Đảo ngược phân số
        renderFraction(a * 2, b * 2) // Chưa tối giản hoàn toàn
      ].filter(x => x !== correctFractionHTML);

      const options = shuffle([correctFractionHTML, ...distractors.slice(0, 3)]);

      return {
        question: questionText,
        type: 'choice',
        options: options,
        correctAnswer: correctFractionHTML,
        explanation: `Chia cả tử số và mẫu số cho ${k}: ${num} : ${k} = ${a}; ${den} : ${k} = ${b}. Phân số tối giản là ${renderFraction(a, b)}.`,
        formula: `Tối giản phân số bằng cách chia cả tử và mẫu cho ước chung lớn nhất.`,
        hint: `Hãy nhẩm xem ${num} và ${den} cùng chia hết cho số nào!`
      };
    },

    // 1-2: So sánh phân số
    generateStage2(isInput) {
      const mode = randChoice(['sameDenom', 'sameNum', 'compareWithOne']);

      if (mode === 'sameDenom') {
        const den = randChoice([7, 9, 11, 13, 15]);
        const a = randInt(2, den - 2);
        const b = randInt(a + 1, den - 1);
        const qText = `Điền dấu thích hợp (&lt;, &gt;, =) vào chỗ chấm:<br>${renderFraction(a, den)} ... ${renderFraction(b, den)}`;
        const correct = '<';

        return {
          question: qText,
          type: 'choice',
          options: ['<', '>', '='],
          correctAnswer: correct,
          explanation: `Hai phân số có cùng mẫu số dương (${den}), phân số nào có tử số bé hơn (${a} &lt; ${b}) thì phân số đó bé hơn.`,
          formula: `Trong hai phân số cùng mẫu số, phân số có tử lớn hơn thì lớn hơn.`,
          hint: `Mẫu số giống nhau rồi, em hãy so sánh tử số nhé!`
        };
      } else if (mode === 'sameNum') {
        const num = randChoice([3, 4, 5, 7]);
        const den1 = randInt(4, 8);
        const den2 = randInt(den1 + 1, 12);
        const qText = `Điền dấu thích hợp (&lt;, &gt;, =) vào chỗ chấm:<br>${renderFraction(num, den1)} ... ${renderFraction(num, den2)}`;
        const correct = '>';

        return {
          question: qText,
          type: 'choice',
          options: ['<', '>', '='],
          correctAnswer: correct,
          explanation: `Hai phân số có cùng tử số dương (${num}), phân số nào có mẫu số bé hơn (${den1} &lt; ${den2}) thì phân số đó LỚN HƠN.`,
          formula: `Cùng tử số: Phân số có mẫu BÉ hơn thì phân số đó LỚN hơn.`,
          hint: `Chia cùng số kẹo cho ít bạn hơn thì mỗi bạn nhận được nhiều hơn!`
        };
      } else {
        const a = randInt(3, 8);
        const b = randInt(3, 8);
        const isGreater = a > b;
        const correct = isGreater ? '>' : (a < b ? '<' : '=');
        const qText = `So sánh phân số ${renderFraction(a, b)} với 1:`;

        return {
          question: qText,
          type: 'choice',
          options: ['<', '>', '='],
          correctAnswer: correct,
          explanation: isGreater 
            ? `Tử số (${a}) lớn hơn mẫu số (${b}) nên phân số lớn hơn 1.`
            : (a < b ? `Tử số (${a}) bé hơn mẫu số (${b}) nên phân số bé hơn 1.` : `Tử số bằng mẫu số nên phân số bằng 1.`),
          formula: `Tử > Mẫu: Phân số > 1. Tử < Mẫu: Phân số < 1. Tử = Mẫu: Phân số = 1.`,
          hint: `So sánh tử số với mẫu số của phân số.`
        };
      }
    },

    // 1-3: Hỗn số
    generateStage3(isInput) {
      const whole = randInt(2, 6);
      const b = randChoice([1, 2, 3, 5]);
      const c = randChoice([4, 5, 7, 8]);
      const properB = b < c ? b : 1;
      const num = whole * c + properB;

      const qText = `Chuyển hỗn số ${renderMixed(whole, properB, c)} thành phân số:`;
      const correctStr = `${num}/${c}`;
      const correctHTML = renderFraction(num, c);

      if (isInput) {
        return {
          question: qText,
          subText: `Nhập dạng tử/mẫu (ví dụ: ${num}/${c}):`,
          type: 'input',
          correctAnswer: correctStr,
          acceptableAnswers: [correctStr, `${num} / ${c}`],
          explanation: `Tử số mới = (Phần nguyên × Mẫu số) + Tử số cũ = (${whole} × ${c}) + ${properB} = ${num}.<br>Giữ nguyên mẫu số là ${c}. Kết quả: ${renderFraction(num, c)}.`,
          formula: `Hỗn số a b/c = (a × c + b) / c`,
          hint: `Lấy phần nguyên nhân mẫu số rồi cộng với tử số!`
        };
      }

      const distractors = [
        renderFraction(whole * properB, c), // Nhầm lấy nguyên nhân tử
        renderFraction(num, c + 1),
        renderFraction(whole + properB, c), // Lấy nguyên cộng tử
        renderFraction(num + 2, c)
      ].filter(x => x !== correctHTML);

      return {
        question: qText,
        type: 'choice',
        options: shuffle([correctHTML, ...distractors.slice(0, 3)]),
        correctAnswer: correctHTML,
        explanation: `Tử số = ${whole} × ${c} + ${properB} = ${num}. Giữ nguyên mẫu ${c}. Ta được ${renderFraction(num, c)}.`,
        formula: `Tử số = (Nguyên × Mẫu) + Tử; Mẫu giữ nguyên.`,
        hint: `Nguyên nhân mẫu rồi cộng tử nhé!`
      };
    },

    // 1-4: Các phép tính phân số (+, -, *, /)
    generateStage4(isInput) {
      const op = randChoice(['+', '-', '*', '/']);

      if (op === '+') {
        const d = randChoice([3, 4, 5, 6]);
        const a = randInt(1, d - 1);
        const b = randInt(1, d - 1);
        const sum = a + b;
        const g = gcd(sum, d);
        const simpNum = sum / g;
        const simpDen = d / g;

        const qText = `Tính kết quả: ${renderFraction(a, d)} + ${renderFraction(b, d)} = ?`;
        const ansHTML = simpDen === 1 ? `${simpNum}` : renderFraction(simpNum, simpDen);
        const ansStr = simpDen === 1 ? `${simpNum}` : `${simpNum}/${simpDen}`;

        return {
          question: qText,
          type: 'choice',
          options: shuffle([
            ansHTML,
            renderFraction(sum, d * 2), // Lỗi cộng cả mẫu
            renderFraction(Math.abs(a - b) || 1, d),
            renderFraction(sum + 1, d)
          ]),
          correctAnswer: ansHTML,
          explanation: `Cùng mẫu số ${d}: Lấy tử cộng tử (${a} + ${b} = ${sum}), giữ nguyên mẫu số ${d}. Rút gọn được ${ansHTML}.`,
          formula: `Cộng hai phân số cùng mẫu: Cộng tử với tử, giữ nguyên mẫu.`,
          hint: `Hai phân số đã cùng mẫu số rồi!`
        };
      } else if (op === '*') {
        const a = randChoice([1, 2, 3]);
        const b = randChoice([3, 4, 5]);
        const c = randChoice([2, 3, 5]);
        const d = randChoice([5, 7]);
        const num = a * c;
        const den = b * d;
        const g = gcd(num, den);
        const sn = num / g;
        const sd = den / g;

        const qText = `Tính: ${renderFraction(a, b)} × ${renderFraction(c, d)} = ?`;
        const ansHTML = renderFraction(sn, sd);

        return {
          question: qText,
          type: 'choice',
          options: shuffle([
            ansHTML,
            renderFraction(a + c, b + d), // Lỗi cộng chéo
            renderFraction(a * d, b * c),
            renderFraction(sn + 1, sd)
          ]),
          correctAnswer: ansHTML,
          explanation: `Nhân hai phân số: Lấy tử nhân tử (${a} × ${c} = ${num}), mẫu nhân mẫu (${b} × ${d} = ${den}). Rút gọn được ${ansHTML}.`,
          formula: `Tử × Tử trên Mẫu × Mẫu.`,
          hint: `Nhân tử với tử, mẫu với mẫu!`
        };
      } else {
        // Phép chia phân số
        const a = randChoice([2, 3, 4]);
        const b = randChoice([5, 7]);
        const c = randChoice([1, 2, 3]);
        const d = randChoice([2, 3, 4]);
        const num = a * d;
        const den = b * c;
        const g = gcd(num, den);
        const sn = num / g;
        const sd = den / g;

        const qText = `Tìm <span class="math-var">x</span> biết: <span class="math-var">x</span> <span class="math-op">&times;</span> ${renderFraction(c, d)} = ${renderFraction(a, b)}`;
        const ansHTML = renderFraction(sn, sd);

        return {
          question: qText,
          type: 'choice',
          options: shuffle([
            ansHTML,
            renderFraction(a * c, b * d), // Nhầm thành nhân
            renderFraction(sd, sn),
            renderFraction(sn + 1, sd)
          ]),
          correctAnswer: ansHTML,
          explanation: `<span class="math-var">x</span> = ${renderFraction(a, b)} : ${renderFraction(c, d)} = ${renderFraction(a, b)} <span class="math-op">&times;</span> ${renderFraction(d, c)} = ${renderFraction(num, den)} = ${ansHTML}.`,
          formula: `Muốn tìm thừa số chưa biết, ta lấy tích chia cho thừa số đã biết. Chia phân số là nhân với nghịch đảo.`,
          hint: `Lấy tích chia cho thừa số đã biết nhé!`
        };
      }
    },

    // 1-5 (Boss Vua Khỉ Rừng Rậm)
    generateBoss() {
      const mode = randChoice(['convenient', 'wordProblem']);
      if (mode === 'convenient') {
        const a = randChoice([2, 3, 4]);
        const b = randChoice([7, 9, 11]);
        const m = randChoice([1, 2, 3]);
        const n = randChoice([4, 5]);
        const sumM = m + (5 - m);

        const qText = `🐒 <b>VUA KHỈ THÁCH ĐẤU:</b> Tính bằng cách thuận tiện nhất:<br>
        A = ${renderFraction(a, b)} × ${renderFraction(m, 5)} + ${renderFraction(a, b)} × ${renderFraction(5 - m, 5)}`;
        
        const ansHTML = renderFraction(a, b);
        const ansStr = `${a}/${b}`;

        return {
          bossName: "Vua Khỉ Rừng Rậm",
          question: qText,
          type: 'choice',
          options: shuffle([
            ansHTML,
            renderFraction(a * 2, b),
            renderFraction(a, b * 2),
            "1"
          ]),
          correctAnswer: ansHTML,
          explanation: `Đặt thừa số chung ${renderFraction(a, b)} ra ngoài:<br>
          A = ${renderFraction(a, b)} × (${renderFraction(m, 5)} + ${renderFraction(5 - m, 5)})<br>
          A = ${renderFraction(a, b)} × ${renderFraction(5, 5)} = ${renderFraction(a, b)} × 1 = ${renderFraction(a, b)}.`,
          formula: `a × b + a × c = a × (b + c)`,
          hint: `Quan sát hai tích có phân số nào giống nhau không!`
        };
      } else {
        const total = randChoice([60, 80, 100, 120]);
        const fNum = randChoice([2, 3]);
        const fDen = 5;
        const ans = (total * fNum) / fDen;

        const qText = `🐒 <b>VUA KHỈ RA ĐỀ:</b> Đội khỉ hái được tất cả ${total} quả chuối. Buổi sáng chúng đã ăn hết ${renderFraction(fNum, fDen)} số chuối đó. Hỏi đàn khỉ đã ăn bao nhiêu quả chuối?`;

        return {
          bossName: "Vua Khỉ Rừng Rậm",
          question: qText,
          type: 'input',
          subText: "Nhập số quả chuối:",
          correctAnswer: `${ans}`,
          acceptableAnswers: [`${ans}`, `${ans} quả`],
          explanation: `Số quả chuối đã ăn là:<br>${total} × ${fNum} : ${fDen} = ${ans} (quả).`,
          formula: `Tìm phân số của một số: Lấy số đó nhân với phân số.`,
          hint: `Lấy tổng số chuối nhân với ${fNum} rồi chia cho ${fDen}!`
        };
      }
    }
  };

  // =========================================================================
  // VÙNG ĐẤT 2: ĐẢO SỐ THẬP PHÂN (DECIMAL ISLAND)
  // =========================================================================

  const DecimalLand = {
    // 2-1: Hàng của số thập phân, đọc/viết và so sánh
    generateStage1(isInput) {
      const mode = randChoice(['placeValue', 'compare']);

      if (mode === 'placeValue') {
        const intPart = randInt(12, 89);
        const d1 = randInt(1, 9);
        const d2 = randInt(1, 9);
        const d3 = randInt(1, 9);
        const numStr = `${intPart},${d1}${d2}${d3}`;
        
        const qTarget = randChoice([
          { digit: d1, name: 'hàng phần mười', val: `0,${d1}` },
          { digit: d2, name: 'hàng phần trăm', val: `0,0${d2}` },
          { digit: d3, name: 'hàng phần nghìn', val: `0,00${d3}` }
        ]);

        const qText = `Trong số thập phân <b>${numStr}</b>, chữ số <b>${qTarget.digit}</b> có giá trị là bao nhiêu?`;

        const options = shuffle([
          qTarget.val,
          `${qTarget.digit}`,
          `0,${qTarget.digit}0`,
          qTarget.name === 'hàng phần trăm' ? `0,${qTarget.digit}` : `0,00${qTarget.digit}`
        ]);

        return {
          question: qText,
          type: 'choice',
          options: options,
          correctAnswer: qTarget.val,
          explanation: `Chữ số ${qTarget.digit} đứng ở vị trí ${qTarget.name} sau dấu phẩy, nên có giá trị là ${qTarget.val}.`,
          formula: `Sau dấu phẩy: Hàng thứ 1 là phần mười, hàng thứ 2 là phần trăm, hàng thứ 3 là phần nghìn.`,
          hint: `Đếm xem chữ số đó đứng thứ mấy sau dấu phẩy!`
        };
      } else {
        // So sánh hai số thập phân
        const aInt = randInt(5, 30);
        const dA = randInt(1, 8);
        const dB = randInt(dA + 1, 9);
        const num1 = `${aInt},${dA}`;
        const num2 = `${aInt},0${dB}`; // Bẫy kinh điển: 15,3 so với 15,08

        const qText = `So sánh hai số thập phân sau:<br><b>${num1}</b> ... <b>${num2}</b>`;

        return {
          question: qText,
          type: 'choice',
          options: ['>', '<', '='],
          correctAnswer: '>',
          explanation: `Phần nguyên bằng nhau (${aInt}). So sánh hàng phần mười: chữ số ${dA} &gt; 0, do đó <b>${num1} &gt; ${num2}</b> (nhiều bạn hay nhầm vì thấy ${dB} lớn hơn ${dA}).`,
          formula: `So sánh phần nguyên trước. Nếu bằng nhau, so sánh lần lượt hàng phần mười, phần trăm, phần nghìn.`,
          hint: `Đừng nhìn vào độ dài của số, hãy so sánh hàng phần mười trước nhé!`
        };
      }
    },

    // 2-2: Cộng, trừ số thập phân
    generateStage2(isInput) {
      const isAdd = randChoice([true, false]);
      const int1 = randInt(15, 65);
      const dec1 = randInt(1, 9);
      const int2 = randInt(5, int1 - 2);
      const dec2 = randInt(1, 9);

      const n1 = roundClean(int1 + dec1 / 10, 1);
      const n2 = roundClean(int2 + dec2 / 10, 1);

      if (isAdd) {
        const sum = roundClean(n1 + n2, 1);
        const qText = `Đặt tính rồi tính: <b>${vnNumber(n1)} + ${vnNumber(n2)} = ?</b>`;
        const ansStr = vnNumber(sum);

        if (isInput) {
          return {
            question: qText,
            type: 'input',
            subText: "Nhập kết quả (dùng dấu phẩy hoặc chấm):",
            correctAnswer: ansStr,
            acceptableAnswers: [ansStr, sum.toString()],
            explanation: `Viết số hạng này dưới số hạng kia sao cho các chữ số ở cùng một hàng và dấu phẩy thẳng cột với nhau:<br>${vnNumber(n1)} + ${vnNumber(n2)} = <b>${ansStr}</b>.`,
            formula: `Cộng số thập phân: Đặt dấu phẩy thẳng cột, cộng như số tự nhiên, hạ dấu phẩy thẳng cột.`,
            hint: `Nhớ đặt dấu phẩy thẳng cột với nhau nhé!`
          };
        }

        return {
          question: qText,
          type: 'choice',
          options: shuffle([
            ansStr,
            vnNumber(roundClean(sum + 0.9, 1)),
            vnNumber(roundClean(sum - 0.1, 1)),
            vnNumber(roundClean(sum * 10, 0))
          ]),
          correctAnswer: ansStr,
          explanation: `Cộng thẳng cột dấu phẩy: ${vnNumber(n1)} + ${vnNumber(n2)} = <b>${ansStr}</b>.`,
          formula: `Cộng như số tự nhiên rồi đặt dấu phẩy ở kết quả thẳng cột.`,
          hint: `Cộng từ phải sang trái bình thường!`
        };
      } else {
        const diff = roundClean(n1 - n2, 1);
        const qText = `Thực hiện phép trừ: <b>${vnNumber(n1)} - ${vnNumber(n2)} = ?</b>`;
        const ansStr = vnNumber(diff);

        return {
          question: qText,
          type: 'choice',
          options: shuffle([
            ansStr,
            vnNumber(roundClean(diff + 0.2, 1)),
            vnNumber(roundClean(diff - 0.2, 1)),
            vnNumber(roundClean(diff + 1, 1))
          ]),
          correctAnswer: ansStr,
          explanation: `Đặt dấu phẩy thẳng cột và trừ từ phải sang trái: ${vnNumber(n1)} - ${vnNumber(n2)} = <b>${ansStr}</b>.`,
          formula: `Trừ số thập phân: Đặt dấu phẩy thẳng cột, trừ như số tự nhiên.`,
          hint: `Nhớ mượn 1 nếu số bị trừ nhỏ hơn số trừ!`
        };
      }
    },

    // 2-3: Nhân số thập phân (bao gồm nhân nhẩm 10, 100, 0.1, 0.01)
    generateStage3(isInput) {
      const mode = randChoice(['mental10', 'mental01', 'multiplyDec']);

      if (mode === 'mental10') {
        const base = roundClean(randInt(12, 78) / 10, 1);
        const mul = randChoice([10, 100]);
        const res = roundClean(base * mul, 1);
        const qText = `Tính nhẩm nhanh: <b>${vnNumber(base)} × ${mul} = ?</b>`;
        const ansStr = vnNumber(res);

        return {
          question: qText,
          type: 'choice',
          options: shuffle([
            ansStr,
            vnNumber(roundClean(base * (mul === 10 ? 1 : 10), 1)),
            vnNumber(roundClean(base / mul, 3)),
            vnNumber(roundClean(base * mul + 10, 1))
          ]),
          correctAnswer: ansStr,
          explanation: `Khi nhân một số thập phân với ${mul}, ta chỉ việc chuyển dấu phẩy của số đó sang bên <b>phải</b> ${mul === 10 ? 'một' : 'hai'} chữ số.<br>${vnNumber(base)} × ${mul} = <b>${ansStr}</b>.`,
          formula: `Nhân với 10, 100, 1000: Dịch dấu phẩy sang PHẢI 1, 2, 3 chữ số.`,
          hint: `Nhân với 10, 100 thì số lớn lên: dịch dấu phẩy sang bên PHẢI!`
        };
      } else if (mode === 'mental01') {
        const intVal = randInt(15, 95);
        const mul = randChoice([0.1, 0.01]);
        const res = roundClean(intVal * mul, 2);
        const mulStr = mul === 0.1 ? '0,1' : '0,01';
        const qText = `Tính nhẩm: <b>${intVal} × ${mulStr} = ?</b>`;
        const ansStr = vnNumber(res);

        return {
          question: qText,
          type: 'choice',
          options: shuffle([
            ansStr,
            vnNumber(roundClean(intVal * 10, 0)),
            vnNumber(roundClean(res * 10, 1)),
            vnNumber(roundClean(res / 10, 3))
          ]),
          correctAnswer: ansStr,
          explanation: `Nhân với ${mulStr} tương đương với chia cho ${mul === 0.1 ? '10' : '100'}. Ta dịch dấu phẩy sang bên <b>trái</b> ${mul === 0.1 ? 'một' : 'hai'} chữ số: kết quả là <b>${ansStr}</b>.`,
          formula: `Nhân với 0,1; 0,01: Dịch dấu phẩy sang TRÁI 1, 2 chữ số.`,
          hint: `Nhân với 0,1 thì số bé đi: dịch dấu phẩy sang TRÁI!`
        };
      } else {
        const a = roundClean(randInt(2, 6) / 10 + randInt(1, 4), 1);
        const b = randChoice([2, 3, 4, 5]);
        const res = roundClean(a * b, 1);
        const qText = `Tính giá trị phép tính: <b>${vnNumber(a)} × ${b} = ?</b>`;
        const ansStr = vnNumber(res);

        if (isInput) {
          return {
            question: qText,
            type: 'input',
            subText: "Nhập kết quả:",
            correctAnswer: ansStr,
            acceptableAnswers: [ansStr, res.toString()],
            explanation: `Thực hiện nhân như nhân các số tự nhiên: ${a * 10} × ${b} = ${res * 10}. Sau đó đếm phần thập phân của ${vnNumber(a)} có 1 chữ số, dùng dấu phẩy tách ở tích 1 chữ số kể từ phải sang trái: <b>${ansStr}</b>.`,
            formula: `Nhân như số tự nhiên, sau đó đếm số chữ số thập phân để tách dấu phẩy.`,
            hint: `Cứ nhân như thường rồi đếm xem có bao nhiêu chữ số sau dấu phẩy!`
          };
        }

        return {
          question: qText,
          type: 'choice',
          options: shuffle([
            ansStr,
            vnNumber(roundClean(res * 10, 0)),
            vnNumber(roundClean(res / 10, 2)),
            vnNumber(roundClean(res + 0.5, 1))
          ]),
          correctAnswer: ansStr,
          explanation: `Nhân như số tự nhiên rồi đặt dấu phẩy: ${vnNumber(a)} × ${b} = <b>${ansStr}</b>.`,
          formula: `Tách ở tích bấy nhiêu chữ số kể từ phải sang trái.`,
          hint: `Nhân xong nhớ đếm 1 chữ số sau dấu phẩy!`
        };
      }
    },

    // 2-4: Chia số thập phân (chia cho số tự nhiên, chia cho số thập phân)
    generateStage4(isInput) {
      const b = randChoice([2, 4, 5, 8]);
      const res = roundClean(randInt(11, 45) / 10, 1);
      const a = roundClean(res * b, 2);

      const qText = `Thực hiện phép chia: <b>${vnNumber(a)} : ${b} = ?</b>`;
      const ansStr = vnNumber(res);

      if (isInput) {
        return {
          question: qText,
          type: 'input',
          subText: "Nhập kết quả:",
          correctAnswer: ansStr,
          acceptableAnswers: [ansStr, res.toString()],
          explanation: `Chia phần nguyên trước: được phần nguyên của thương, viết dấu phẩy vào thương rồi hạ từng chữ số ở phần thập phân để chia tiếp.<br>${vnNumber(a)} : ${b} = <b>${ansStr}</b>.`,
          formula: `Chia phần nguyên -> Viết dấu phẩy vào thương -> Tiếp tục chia phần thập phân.`,
          hint: `Chia hết phần nguyên nhớ viết dấu phẩy vào thương ngay!`
        };
      }

      return {
        question: qText,
        type: 'choice',
        options: shuffle([
          ansStr,
          vnNumber(roundClean(res * 10, 0)),
          vnNumber(roundClean(res / 10, 2)),
          vnNumber(roundClean(res + 0.3, 1))
        ]),
        correctAnswer: ansStr,
        explanation: `${vnNumber(a)} : ${b} = <b>${ansStr}</b>.`,
        formula: `Chia số thập phân cho số tự nhiên: Đặt dấu phẩy vào thương ngay sau khi chia hết phần nguyên.`,
        hint: `Thực hiện chia từ trái sang phải!`
      };
    },

    // 2-5 (Boss Bạch Tuộc Khổng Lồ)
    generateBoss() {
      // Tính thuận tiện số thập phân
      const common = roundClean(randChoice([2.5, 3.6, 4.8, 6.2]), 1);
      const part1 = randChoice([1.7, 2.3, 3.4]);
      const part2 = roundClean(10 - part1, 1);
      const res = roundClean(common * 10, 1);

      const qText = `🐙 <b>BẠCH TUỘC KHỔNG LỒ PHUN MỰC:</b> Hãy tính nhanh giá trị biểu thức sau:<br>
      <b>${vnNumber(common)} × ${vnNumber(part1)} + ${vnNumber(common)} × ${vnNumber(part2)} = ?</b>`;
      const ansStr = vnNumber(res);

      return {
        bossName: "Bạch Tuộc Khổng Lồ",
        question: qText,
        type: 'choice',
        options: shuffle([
          ansStr,
          vnNumber(roundClean(common * 100, 0)),
          vnNumber(roundClean(res - 10, 1)),
          vnNumber(roundClean(common, 1))
        ]),
        correctAnswer: ansStr,
        explanation: `Đưa thừa số chung <b>${vnNumber(common)}</b> ra ngoài:<br>
        = ${vnNumber(common)} × (${vnNumber(part1)} + ${vnNumber(part2)})<br>
        = ${vnNumber(common)} × 10 = <b>${ansStr}</b>. Rất nhanh và không sợ nhầm lẫn!`,
        formula: `Tính chất phân phối: a × b + a × c = a × (b + c)`,
        hint: `Nhóm ${vnNumber(common)} chung lại, xem hai số trong ngoặc cộng lại bằng mấy!`
      };
    }
  };

  // =========================================================================
  // VÙNG ĐẤT 3: VỊNH PHẦN TRĂM (PERCENTAGE BAY)
  // =========================================================================

  const PercentageLand = {
    // 3-1: Tìm tỉ số phần trăm của hai số
    generateStage1(isInput) {
      const pairs = [
        { a: 15, b: 60, pct: 25 },
        { a: 12, b: 50, pct: 24 },
        { a: 18, b: 72, pct: 25 },
        { a: 24, b: 80, pct: 30 },
        { a: 35, b: 70, pct: 50 },
        { a: 45, b: 60, pct: 75 }
      ];
      const p = randChoice(pairs);
      const qText = `Tỉ số phần trăm của <b>${p.a}</b> và <b>${p.b}</b> là bao nhiêu?`;
      const ansStr = `${p.pct}%`;

      if (isInput) {
        return {
          question: qText,
          type: 'input',
          subText: "Nhập số phần trăm (chỉ cần nhập số, ví dụ 25):",
          correctAnswer: `${p.pct}`,
          acceptableAnswers: [`${p.pct}`, `${p.pct}%`],
          explanation: `Cách tìm tỉ số phần trăm:<br>1. Tìm thương: ${p.a} : ${p.b} = ${p.a / p.b}<br>2. Nhân thương đó với 100 và viết thêm kí hiệu %: ${p.a / p.b} × 100 = <b>${p.pct}%</b>.`,
          formula: `Tỉ số phần trăm của a và b = (a : b) × 100%`,
          hint: `Lấy số thứ nhất chia cho số thứ hai rồi nhân 100 nhé!`
        };
      }

      return {
        question: qText,
        type: 'choice',
        options: shuffle([
          ansStr,
          `${p.pct - 5}%`,
          `${p.pct + 10}%`,
          `${roundClean(p.a / p.b, 2)}%` // Lỗi quên nhân 100
        ]),
        correctAnswer: ansStr,
        explanation: `Lấy ${p.a} : ${p.b} = ${p.a / p.b}. Sau đó nhân 100 và thêm ký hiệu % ta được <b>${p.pct}%</b>.`,
        formula: `(a : b) × 100%`,
        hint: `Chia số trước cho số sau rồi nhân với 100!`
      };
    },

    // 3-2: Tìm giá trị phần trăm của một số
    generateStage2(isInput) {
      const pct = randChoice([10, 20, 25, 30, 50, 75]);
      const total = randChoice([120, 160, 200, 240, 300, 400]);
      const res = (total * pct) / 100;

      const qText = `Tìm <b>${pct}%</b> của <b>${total}</b>:`;
      const ansStr = `${res}`;

      if (isInput) {
        return {
          question: qText,
          type: 'input',
          subText: "Nhập giá trị tìm được:",
          correctAnswer: ansStr,
          acceptableAnswers: [ansStr],
          explanation: `Muốn tìm ${pct}% của ${total}, ta lấy ${total} nhân với ${pct} rồi chia cho 100 (hoặc lấy ${total} chia cho 100 rồi nhân với ${pct}):<br>${total} × ${pct} : 100 = <b>${res}</b>.`,
          formula: `Tìm a% của số B = B × a : 100`,
          hint: `Lấy ${total} nhân với ${pct} rồi chia cho 100!`
        };
      }

      return {
        question: qText,
        type: 'choice',
        options: shuffle([
          ansStr,
          `${res + 10}`,
          `${res - 5}`,
          `${roundClean(total / pct, 1)}`
        ]),
        correctAnswer: ansStr,
        explanation: `${total} × ${pct} : 100 = <b>${res}</b>.`,
        formula: `Giá trị = Tổng × Tỉ số % : 100`,
        hint: `Lấy số đó nhân với số phần trăm rồi chia 100.`
      };
    },

    // 3-3: Tìm một số khi biết giá trị phần trăm của nó
    generateStage3(isInput) {
      const pct = randChoice([20, 25, 40, 50]);
      const total = randChoice([150, 200, 250, 300, 400]);
      const part = (total * pct) / 100;

      const qText = `Biết <b>${pct}%</b> của một số là <b>${part}</b>. Số đó là:`;
      const ansStr = `${total}`;

      return {
        question: qText,
        type: 'choice',
        options: shuffle([
          ansStr,
          `${part * pct}`,
          `${total + 50}`,
          `${(part * pct) / 100}` // Nhầm phép tính
        ]),
        correctAnswer: ansStr,
        explanation: `Muốn tìm một số biết ${pct}% của nó là ${part}, ta lấy ${part} chia cho ${pct} rồi nhân với 100:<br>${part} : ${pct} × 100 = <b>${total}</b>.`,
        formula: `Tìm số khi biết a% của nó là b = b : a × 100`,
        hint: `Ngược lại với bài trước: lấy giá trị đã biết chia cho số phần trăm rồi nhân 100!`
      };
    },

    // 3-4: Bài toán thực tế về giảm giá & khuyến mãi
    generateStage4(isInput) {
      const originalPrice = randChoice([100000, 150000, 200000, 250000, 500000]);
      const discountPct = randChoice([10, 15, 20, 25, 30]);
      const discountAmount = (originalPrice * discountPct) / 100;
      const finalPrice = originalPrice - discountAmount;

      const qText = `Một chiếc ba lô có giá niêm yết là <b>${originalPrice.toLocaleString('vi-VN')} đồng</b>. Nhân dịp lễ hội, cửa hàng giảm giá <b>${discountPct}%</b>. Hỏi người mua phải trả bao nhiêu tiền?`;
      const ansStr = finalPrice.toLocaleString('vi-VN') + ' đồng';
      const ansShort = `${finalPrice}`;

      if (isInput) {
        return {
          question: qText,
          type: 'input',
          subText: "Nhập số tiền phải trả (chỉ nhập số, ví dụ 170000):",
          correctAnswer: ansShort,
          acceptableAnswers: [ansShort, finalPrice.toLocaleString('vi-VN'), `${finalPrice} đồng`],
          explanation: `Số tiền được giảm giá là:<br>${originalPrice.toLocaleString('vi-VN')} × ${discountPct} : 100 = ${discountAmount.toLocaleString('vi-VN')} (đồng).<br>Số tiền người mua phải trả là:<br>${originalPrice.toLocaleString('vi-VN')} - ${discountAmount.toLocaleString('vi-VN')} = <b>${finalPrice.toLocaleString('vi-VN')} đồng</b>.`,
          formula: `Giá sau giảm = Giá gốc - (Giá gốc × % giảm : 100)`,
          hint: `Tính số tiền được giảm trước, rồi lấy giá gốc trừ đi nhé!`
        };
      }

      return {
        question: qText,
        type: 'choice',
        options: shuffle([
          ansStr,
          discountAmount.toLocaleString('vi-VN') + ' đồng', // Bẫy chọn nhầm số tiền giảm
          (originalPrice + discountAmount).toLocaleString('vi-VN') + ' đồng',
          (finalPrice - 20000).toLocaleString('vi-VN') + ' đồng'
        ]),
        correctAnswer: ansStr,
        explanation: `Được giảm: ${originalPrice.toLocaleString('vi-VN')} × ${discountPct} : 100 = ${discountAmount.toLocaleString('vi-VN')} đồng.<br>Giá phải trả: ${originalPrice.toLocaleString('vi-VN')} - ${discountAmount.toLocaleString('vi-VN')} = <b>${ansStr}</b>.`,
        formula: `Cẩn thận đừng chọn nhầm số tiền ĐƯỢC GIẢM với số tiền PHẢI TRẢ!`,
        hint: `Người mua phải trả = Giá ban đầu trừ đi tiền giảm giá.`
      };
    },

    // 3-5 (Boss Hải Tặc Râu Đen)
    generateBoss() {
      const price = 400000;
      const d1 = 20; // Giảm 20%
      const p1 = price * (1 - d1 / 100); // 320.000
      const d2 = 10; // Giảm thêm 10% trên giá đã giảm
      const p2 = p1 * (1 - d2 / 100); // 288.000

      const qText = `🏴‍☠️ <b>HẢI TẶC RÂU ĐEN ĐẶT BẪY:</b> Kho báu có một chiếc áo giáp vàng giá niêm yết <b>400.000 đồng</b>. Cửa hàng giảm giá lần một là <b>20%</b>. Sau đó, với khách có thẻ thủy thủ, họ giảm thêm <b>10% trên giá đã giảm</b>. Hỏi thủy thủ phải trả bao nhiêu tiền?`;
      const ansStr = `288.000 đồng`;

      return {
        bossName: "Hải Tặc Râu Đen",
        question: qText,
        type: 'choice',
        options: shuffle([
          ansStr,
          `280.000 đồng`, // Lỗi kinh điển: cộng gộp 20% + 10% = 30% giảm từ 400k thành 280k
          `320.000 đồng`,
          `300.000 đồng`
        ]),
        correctAnswer: ansStr,
        explanation: `<b>BẪY CỰC LỚN:</b> Không được cộng gộp 20% + 10% = 30% vì 10% sau là tính trên giá ĐÃ GIẢM!<br>
        - Giá sau khi giảm lần một: 400.000 - (400.000 × 20 : 100) = 320.000 đồng.<br>
        - Số tiền giảm lần hai (10% của 320.000): 320.000 × 10 : 100 = 32.000 đồng.<br>
        - Số tiền thực tế phải trả: 320.000 - 32.000 = <b>288.000 đồng</b>. Râu Đen đã bị lật tẩy mưu mô!`,
        formula: `Giảm giá liên tiếp: Tính từng bước theo giá trị mới, không cộng dồn tỉ lệ %!`,
        hint: `Đừng cộng hai tỉ số phần trăm lại với nhau nhé!`
      };
    }
  };

  // =========================================================================
  // VÙNG ĐẤT 4: THÀNH CỔ HÌNH HỌC & ĐO LƯỜNG (GEOMETRY CITADEL)
  // =========================================================================

  const GeometryLand = {
    // 4-1: Đổi đơn vị đo diện tích & thể tích
    generateStage1(isInput) {
      const mode = randChoice(['area', 'volume']);

      if (mode === 'area') {
        const conversions = [
          { fromVal: 5, fromU: 'm²', toU: 'dm²', mul: 100, ans: '500' },
          { fromVal: 3.5, fromU: 'm²', toU: 'dm²', mul: 100, ans: '350' },
          { fromVal: 2, fromU: 'ha', toU: 'm²', mul: 10000, ans: '20000' },
          { fromVal: 450, fromU: 'dm²', toU: 'm²', mul: 0.01, ans: '4,5' },
          { fromVal: 1.2, fromU: 'ha', toU: 'm²', mul: 10000, ans: '12000' }
        ];
        const item = randChoice(conversions);
        const qText = `Điền số thích hợp vào chỗ chấm:<br><b>${vnNumber(item.fromVal)} ${item.fromU} = ... ${item.toU}</b>`;

        if (isInput) {
          return {
            question: qText,
            type: 'input',
            subText: `Nhập giá trị đổi sang ${item.toU}:`,
            correctAnswer: item.ans,
            acceptableAnswers: [item.ans, item.ans.replace(',', '.')],
            explanation: `Hai đơn vị đo diện tích liền kề gấp hoặc kém nhau 100 lần (riêng 1 ha = 10 000 m²).<br>Do đó: <b>${vnNumber(item.fromVal)} ${item.fromU} = ${item.ans} ${item.toU}</b>.`,
            formula: `1 m² = 100 dm² = 10 000 cm²; 1 ha = 10 000 m²`,
            hint: `Đơn vị diện tích mỗi bước nhảy gấp/kém 100 lần nhé!`
          };
        }

        return {
          question: qText,
          type: 'choice',
          options: shuffle([
            `${item.ans} ${item.toU}`,
            `${vnNumber(item.fromVal * 10)} ${item.toU}`, // Nhầm đơn vị độ dài (gấp 10)
            `${vnNumber(item.fromVal * 1000)} ${item.toU}`,
            `${vnNumber(item.fromVal * 0.1)} ${item.toU}`
          ]),
          correctAnswer: `${item.ans} ${item.toU}`,
          explanation: `Mỗi đơn vị đo diện tích liền nhau hơn kém nhau 100 lần (1 ha = 10 000 m²). Kết quả là <b>${item.ans} ${item.toU}</b>.`,
          formula: `Diện tích: 1 bước chuyển đổi nhân hoặc chia cho 100.`,
          hint: `Diện tích có số 2 ở trên đầu nên có 2 chữ số 0 (100) đấy!`
        };
      } else {
        // Thể tích
        const conversions = [
          { fromVal: 3, fromU: 'm³', toU: 'dm³', ans: '3000' },
          { fromVal: 2.5, fromU: 'dm³', toU: 'lít', ans: '2,5' }, // 1 dm3 = 1 lít
          { fromVal: 4000, fromU: 'cm³', toU: 'dm³', ans: '4' },
          { fromVal: 1.5, fromU: 'm³', toU: 'dm³', ans: '1500' }
        ];
        const item = randChoice(conversions);
        const qText = `Đổi đơn vị đo thể tích:<br><b>${vnNumber(item.fromVal)} ${item.fromU} = ... ${item.toU}</b>`;

        return {
          question: qText,
          type: 'choice',
          options: shuffle([
            `${item.ans} ${item.toU}`,
            `${vnNumber(item.fromVal * 100)} ${item.toU}`,
            `${vnNumber(item.fromVal * 10)} ${item.toU}`,
            `${vnNumber(item.fromVal / 100)} ${item.toU}`
          ]),
          correctAnswer: `${item.ans} ${item.toU}`,
          explanation: `Hai đơn vị đo thể tích liền kề gấp hoặc kém nhau 1.000 lần. Đặc biệt: <b>1 dm³ = 1 lít</b>.<br>Kết quả: <b>${item.ans} ${item.toU}</b>.`,
          formula: `1 m³ = 1000 dm³ = 1 000 000 cm³; 1 dm³ = 1 lít.`,
          hint: `Thể tích có số 3 ở trên đầu nên có 3 chữ số 0 (1000) nhé!`
        };
      }
    },

    // 4-2: Tam giác & Hình thang (có kèm SVG kích thước)
    generateStage2(isInput) {
      const isTriangle = randChoice([true, false]);

      if (isTriangle) {
        const base = randChoice([12, 16, 20, 24]);
        const height = randChoice([8, 10, 15, 18]);
        const area = (base * height) / 2;

        const qText = `Tính diện tích hình tam giác có độ dài đáy <span class="math-var">a</span> = <b>${base} cm</b> và chiều cao <span class="math-var">h</span> = <b>${height} cm</b> (hình minh họa bên dưới):`;
        const svg = createTriangleSVG(base, height, 'cm');
        const ansStr = `${area} cm²`;
        const ansVal = `${area}`;

        if (isInput) {
          return {
            question: qText,
            svg: svg,
            type: 'input',
            subText: "Nhập số diện tích (cm²):",
            correctAnswer: ansVal,
            acceptableAnswers: [ansVal, `${ansVal} cm²`, `${ansVal} cm2`],
            explanation: `Diện tích hình tam giác bằng đáy nhân chiều cao (cùng đơn vị đo) rồi chia cho 2:<br><span class="math-font"><span class="math-var">S</span> = (${base} &times; ${height}) : 2 = <b>${area} cm²</b></span>.`,
            formula: `<span class="math-font"><span class="math-var">S</span> = (<span class="math-var">a</span> &times; <span class="math-var">h</span>) : 2</span> (Nhớ chia cho 2!)`,
            hint: `Đừng quên chia cho 2 sau khi nhân đáy với chiều cao nhé!`
          };
        }

        return {
          question: qText,
          svg: svg,
          type: 'choice',
          options: shuffle([
            ansStr,
            `${base * height} cm²`, // Bẫy quên chia 2 kinh điển
            `${(base + height) * 2} cm²`,
            `${area + 12} cm²`
          ]),
          correctAnswer: ansStr,
          explanation: `<span class="math-font"><span class="math-var">S</span> = (${base} &times; ${height}) : 2 = <b>${area} cm²</b></span>. Học sinh rất hay quên bước chia 2!`,
          formula: `<span class="math-font"><span class="math-var">S</span> = (<span class="math-var">a</span> &times; <span class="math-var">h</span>) : 2</span>`,
          hint: `Nhớ chia cho 2!`
        };
      } else {
        // Hình thang
        const topB = randChoice([6, 8, 10]);
        const botB = randChoice([12, 14, 16]);
        const h = randChoice([6, 8, 10]);
        const area = ((topB + botB) * h) / 2;

        const qText = `Tính diện tích hình thang có đáy bé <span class="math-var">a</span> = ${topB} cm, đáy lớn <span class="math-var">b</span> = ${botB} cm và chiều cao <span class="math-var">h</span> = ${h} cm như hình vẽ:`;
        const svg = createTrapezoidSVG(topB, botB, h, 'cm');
        const ansStr = `${area} cm²`;

        return {
          question: qText,
          svg: svg,
          type: 'choice',
          options: shuffle([
            ansStr,
            `${(topB + botB) * h} cm²`, // Bẫy quên chia 2
            `${topB * botB * h} cm²`,
            `${area - 8} cm²`
          ]),
          correctAnswer: ansStr,
          explanation: `Diện tích hình thang bằng tổng hai đáy nhân với chiều cao rồi chia cho 2:<br><span class="math-font"><span class="math-var">S</span> = (${topB} + ${botB}) &times; ${h} : 2 = ${topB + botB} &times; ${h} : 2 = <b>${area} cm²</b></span>.`,
          formula: `<span class="math-font"><span class="math-var">S</span> = [(<span class="math-var">a</span> + <span class="math-var">b</span>) &times; <span class="math-var">h</span>] : 2</span>`,
          hint: `Cộng 2 đáy lại, nhân chiều cao rồi chia đôi!`
        };
      }
    },

    // 4-3: Chu vi & Diện tích hình tròn (có SVG)
    generateStage3(isInput) {
      const mode = randChoice(['perimeter', 'area']);
      const r = randChoice([2, 3, 5, 10]);

      if (mode === 'perimeter') {
        const p = roundClean(r * 2 * 3.14, 2);
        const qText = `Tính chu vi hình tròn có bán kính <span class="math-var">r</span> = <b>${r} cm</b> (lấy số Pi = 3,14):`;
        const svg = createCircleSVG(r, false, 'cm');
        const ansStr = `${vnNumber(p)} cm`;

        return {
          question: qText,
          svg: svg,
          type: 'choice',
          options: shuffle([
            ansStr,
            `${vnNumber(roundClean(r * 3.14, 2))} cm`, // Quên nhân 2
            `${vnNumber(roundClean(r * r * 3.14, 2))} cm²`, // Nhầm sang diện tích
            `${vnNumber(roundClean(p + 3.14, 2))} cm`
          ]),
          correctAnswer: ansStr,
          explanation: `Chu vi hình tròn = Bán kính &times; 2 &times; 3,14:<br><span class="math-font"><span class="math-var">C</span> = ${r} &times; 2 &times; 3,14 = <b>${vnNumber(p)} cm</b></span>.`,
          formula: `<span class="math-font"><span class="math-var">C</span> = <span class="math-var">r</span> &times; 2 &times; 3,14</span> hoặc <span class="math-font"><span class="math-var">C</span> = <span class="math-var">d</span> &times; 3,14</span>`,
          hint: `Lấy bán kính nhân 2 rồi nhân 3,14.`
        };
      } else {
        const area = roundClean(r * r * 3.14, 2);
        const qText = `Tính diện tích hình tròn có bán kính <span class="math-var">r</span> = <b>${r} cm</b> (lấy số Pi = 3,14):`;
        const svg = createCircleSVG(r, false, 'cm');
        const ansStr = `${vnNumber(area)} cm²`;

        if (isInput) {
          return {
            question: qText,
            svg: svg,
            type: 'input',
            subText: "Nhập số diện tích (dùng dấu phẩy hoặc chấm):",
            correctAnswer: vnNumber(area),
            acceptableAnswers: [vnNumber(area), area.toString()],
            explanation: `Diện tích hình tròn = Bán kính &times; Bán kính &times; 3,14:<br><span class="math-font"><span class="math-var">S</span> = ${r} &times; ${r} &times; 3,14 = <b>${vnNumber(area)} cm²</b></span>.`,
            formula: `<span class="math-font"><span class="math-var">S</span> = <span class="math-var">r</span> &times; <span class="math-var">r</span> &times; 3,14</span>`,
            hint: `Nhớ lấy bán kính nhân chính nó rồi nhân 3,14!`
          };
        }

        return {
          question: qText,
          svg: svg,
          type: 'choice',
          options: shuffle([
            ansStr,
            `${vnNumber(roundClean(r * 2 * 3.14, 2))} cm²`, // Nhầm sang chu vi
            `${vnNumber(roundClean(r * 3.14, 2))} cm²`,
            `${vnNumber(roundClean(area + 5, 2))} cm²`
          ]),
          correctAnswer: ansStr,
          explanation: `<span class="math-font"><span class="math-var">S</span> = ${r} &times; ${r} &times; 3,14 = <b>${ansStr}</b></span>.`,
          formula: `<span class="math-font"><span class="math-var">S</span> = <span class="math-var">r</span> &times; <span class="math-var">r</span> &times; 3,14</span>`,
          hint: `Bán kính nhân bán kính rồi nhân 3,14!`
        };
      }
    },

    // 4-4: Diện tích xung quanh, toàn phần và Thể tích khối hộp chữ nhật, hình lập phương
    generateStage4(isInput) {
      const isCube = randChoice([true, false]);

      if (isCube) {
        const a = randChoice([3, 4, 5, 10]);
        const sXq = a * a * 4;
        const sTp = a * a * 6;
        const v = a * a * a;
        const target = randChoice(['V', 'Stp', 'Sxq']);

        let targetName = 'Thể tích';
        let targetAns = `${v} cm³`;
        let formulaStr = `V = a × a × a`;
        if (target === 'Stp') {
          targetName = 'Diện tích toàn phần';
          targetAns = `${sTp} cm²`;
          formulaStr = `Stp = a × a × 6`;
        } else if (target === 'Sxq') {
          targetName = 'Diện tích xung quanh';
          targetAns = `${sXq} cm²`;
          formulaStr = `Sxq = a × a × 4`;
        }

        const qText = `Cho hình lập phương có cạnh a = <b>${a} cm</b> (hình vẽ). Tính <b>${targetName}</b> của hình lập phương đó:`;
        const svg = createBoxSVG(a, a, a, 'cm', true);

        return {
          question: qText,
          svg: svg,
          type: 'choice',
          options: shuffle([
            targetAns,
            `${a * a} cm²`, // Chỉ tính 1 mặt
            target === 'V' ? `${sTp} cm³` : `${v} cm²`,
            `${a * 4} cm`
          ]),
          correctAnswer: targetAns,
          explanation: `Với hình lập phương cạnh ${a} cm:<br>${targetName} = <b>${targetAns}</b>.`,
          formula: `${formulaStr} (Hình lập phương có 6 mặt là hình vuông bằng nhau)`,
          hint: `Hình lập phương có 6 mặt vuông bằng nhau!`
        };
      } else {
        const l = randChoice([6, 8, 10]);
        const w = randChoice([4, 5]);
        const h = randChoice([3, 4]);
        const v = l * w * h;

        const qText = `Một hình hộp chữ nhật có chiều dài ${l} cm, chiều rộng ${w} cm và chiều cao ${h} cm. Tính thể tích của hình hộp:`;
        const svg = createBoxSVG(l, w, h, 'cm', false);
        const ansStr = `${v} cm³`;

        if (isInput) {
          return {
            question: qText,
            svg: svg,
            type: 'input',
            subText: "Nhập thể tích (cm³):",
            correctAnswer: `${v}`,
            acceptableAnswers: [`${v}`, `${v} cm³`, `${v} cm3`],
            explanation: `Thể tích hình hộp chữ nhật = Chiều dài × Chiều rộng × Chiều cao:<br>V = ${l} × ${w} × ${h} = <b>${v} cm³</b>.`,
            formula: `V = a × b × c (cùng đơn vị đo)`,
            hint: `Lấy dài nhân rộng nhân cao!`
          };
        }

        return {
          question: qText,
          svg: svg,
          type: 'choice',
          options: shuffle([
            ansStr,
            `${(l + w) * 2 * h} cm³`, // Nhầm sang diện tích xung quanh
            `${l * w} cm³`,
            `${v + 20} cm³`
          ]),
          correctAnswer: ansStr,
          explanation: `V = ${l} × ${w} × ${h} = <b>${ansStr}</b>.`,
          formula: `Thể tích = Dài × Rộng × Cao`,
          hint: `Nhân cả 3 kích thước lại với nhau!`
        };
      }
    },

    // 4-5 (Boss Người Đá Cổ Đại)
    generateBoss() {
      // Bài toán bể cá kính không nắp
      const l = 8; // 8 dm
      const w = 5; // 5 dm
      const h = 4; // 4 dm
      const sXq = (l + w) * 2 * h; // (8+5)*2*4 = 104 dm2
      const sBottom = l * w; // 40 dm2
      const sKinh = sXq + sBottom; // 144 dm2 (không nắp chỉ cộng 1 đáy)

      const qText = `🗿 <b>NGƯỜI ĐÁ CỔ ĐẠI THỨC TỈNH:</b> Bác Ba làm một chiếc bể cá bằng kính dạng hình hộp chữ nhật (<b>không có nắp</b>) có chiều dài 8 dm, chiều rộng 5 dm và chiều cao 4 dm. Hỏi diện tích kính cần dùng để làm bể cá đó là bao nhiêu dm²?`;
      const ansStr = `144 dm²`;

      return {
        bossName: "Người Đá Cổ Đại",
        question: qText,
        type: 'choice',
        options: shuffle([
          ansStr,
          `184 dm²`, // Bẫy tính cả 2 đáy (có nắp)
          `104 dm²`, // Bẫy chỉ tính diện tích xung quanh
          `160 dm²`
        ]),
        correctAnswer: ansStr,
        explanation: `<b>CHÚ Ý QUAN TRỌNG:</b> Bể cá <b>không có nắp</b> nên chỉ có 1 mặt đáy ở dưới!<br>
        - Diện tích xung quanh: (8 + 5) × 2 × 4 = 104 dm².<br>
        - Diện tích mặt đáy: 8 × 5 = 40 dm².<br>
        - Diện tích kính dùng làm bể cá: 104 + 40 = <b>144 dm²</b>. Người Đá đã bị khuất phục!`,
        formula: `Diện tích thùng/bể không nắp = S xung quanh + S 1 đáy`,
        hint: `Bể không có nắp nên chỉ có MỘT mặt đáy thôi nhé!`
      };
    }
  };

  // =========================================================================
  // VÙNG ĐẤT 5: ĐỈNH CAO CHUYỂN ĐỘNG (MOTION SUMMIT)
  // =========================================================================

  const MotionLand = {
    // 5-1: Vận tốc đều (v = s / t)
    generateStage1(isInput) {
      const v = randChoice([35, 40, 45, 50, 60]);
      const t = randChoice([2, 3, 4]);
      const s = v * t;

      const qText = `Một ô tô đi được quãng đường <b>${s} km</b> trong thời gian <b>${t} giờ</b>. Vận tốc của ô tô đó là:`;
      const ansStr = `${v} km/giờ`;
      const ansVal = `${v}`;

      if (isInput) {
        return {
          question: qText,
          type: 'input',
          subText: "Nhập vận tốc (chỉ nhập số, km/giờ):",
          correctAnswer: ansVal,
          acceptableAnswers: [ansVal, `${ansVal} km/h`, `${ansVal} km/giờ`],
          explanation: `Muốn tính vận tốc ta lấy quãng đường chia cho thời gian:<br><span class="math-font"><span class="math-var">v</span> = <span class="math-var">s</span> : <span class="math-var">t</span> = ${s} : ${t} = <b>${v} km/giờ</b></span>.`,
          formula: `<span class="math-font"><span class="math-var">v</span> = <span class="math-var">s</span> : <span class="math-var">t</span></span> (Vận tốc = Quãng đường : Thời gian)`,
          hint: `Lấy quãng đường chia cho thời gian!`
        };
      }

      return {
        question: qText,
        type: 'choice',
        options: shuffle([
          ansStr,
          `${s * t} km/giờ`,
          `${v - 5} km/giờ`,
          `${v + 10} km/giờ`
        ]),
        correctAnswer: ansStr,
        explanation: `<span class="math-font"><span class="math-var">v</span> = ${s} : ${t} = <b>${ansStr}</b></span>.`,
        formula: `<span class="math-font"><span class="math-var">v</span> = <span class="math-var">s</span> : <span class="math-var">t</span></span>`,
        hint: `Lấy quãng đường chia thời gian.`
      };
    },

    // 5-2: Quãng đường (s = v * t) và Thời gian (t = s / v)
    generateStage2(isInput) {
      const mode = randChoice(['distance', 'timeWithMinutes']);

      if (mode === 'distance') {
        const v = randChoice([12, 15, 42, 54]);
        const t = randChoice([2.5, 1.5, 3]); // ví dụ 2,5 giờ
        const s = roundClean(v * t, 1);

        const qText = `Một người đi xe máy với vận tốc <b>${v} km/giờ</b> trong <b>${vnNumber(t)} giờ</b>. Quãng đường người đó đi được là:`;
        const ansStr = `${vnNumber(s)} km`;

        return {
          question: qText,
          type: 'choice',
          options: shuffle([
            ansStr,
            `${roundClean(v / t, 1)} km`,
            `${vnNumber(s + 10)} km`,
            `${vnNumber(s - 5)} km`
          ]),
          correctAnswer: ansStr,
          explanation: `Muốn tính quãng đường ta lấy vận tốc nhân với thời gian:<br><span class="math-font"><span class="math-var">s</span> = <span class="math-var">v</span> &times; <span class="math-var">t</span> = ${v} &times; ${vnNumber(t)} = <b>${ansStr}</b></span>.`,
          formula: `<span class="math-font"><span class="math-var">s</span> = <span class="math-var">v</span> &times; <span class="math-var">t</span></span> (Quãng đường = Vận tốc &times; Thời gian)`,
          hint: `Lấy vận tốc nhân với thời gian!`
        };
      } else {
        // Đổi thời gian phút sang giờ
        const h = 2;
        const m = 30; // 2 giờ 30 phút = 2,5 giờ
        const v = 40;
        const s = v * 2.5; // 100 km

        const qText = `Một ô tô chạy với vận tốc 40 km/giờ. Hỏi để đi hết quãng đường 100 km thì ô tô đó đi hết bao nhiêu thời gian?`;

        return {
          question: qText,
          type: 'choice',
          options: shuffle([
            `2 giờ 30 phút`,
            `2 giờ 50 phút`, // Lỗi nhầm 2,5 giờ = 2 giờ 50 phút
            `2 giờ 15 phút`,
            `3 giờ`
          ]),
          correctAnswer: `2 giờ 30 phút`,
          explanation: `Thời gian ô tô đi là: <span class="math-font">100 : 40 = 2,5</span> (giờ).<br><b>LƯU Ý QUAN TRỌNG:</b> 2,5 giờ = 2 giờ + 0,5 giờ = 2 giờ + (0,5 &times; 60 phút) = <b>2 giờ 30 phút</b> (nhiều bạn nhầm thành 2 giờ 50 phút!).`,
          formula: `<span class="math-font"><span class="math-var">t</span> = <span class="math-var">s</span> : <span class="math-var">v</span></span>; 0,5 giờ = 30 phút; 0,25 giờ = 15 phút`,
          hint: `2,5 giờ tức là 2 giờ rưỡi, bằng 2 giờ bao nhiêu phút?`
        };
      }
    },

    // 5-3: Hai chuyển động ngược chiều (gặp nhau)
    generateStage3(isInput) {
      const v1 = randChoice([40, 45, 50]);
      const v2 = randChoice([30, 35, 40]);
      const t = randChoice([2, 3]);
      const s = (v1 + v2) * t;

      const qText = `Quãng đường AB dài <b>${s} km</b>. Cùng lúc, một ô tô đi từ A đến B với vận tốc <b>${v1} km/giờ</b> và một xe máy đi từ B về A với vận tốc <b>${v2} km/giờ</b>. Hỏi sau mấy giờ hai xe gặp nhau?`;
      const svg = createMotionSVG(v1, v2, s, true);
      const ansStr = `${t} giờ`;
      const ansVal = `${t}`;

      if (isInput) {
        return {
          question: qText,
          svg: svg,
          type: 'input',
          subText: "Nhập số giờ để gặp nhau:",
          correctAnswer: ansVal,
          acceptableAnswers: [ansVal, `${ansVal} giờ`],
          explanation: `Sau mỗi giờ, hai xe đi được quãng đường là (tổng vận tốc):<br>${v1} + ${v2} = ${v1 + v2} (km/giờ).<br>Thời gian để hai xe gặp nhau là:<br>${s} : ${v1 + v2} = <b>${t} giờ</b>.`,
          formula: `<span class="math-font"><span class="math-var">t</span> = <span class="math-var">s</span> : (<span class="math-var">v</span><sub>1</sub> + <span class="math-var">v</span><sub>2</sub>)</span>`,
          hint: `Đi ngược chiều: cộng hai vận tốc lại rồi lấy quãng đường chia cho tổng đó!`
        };
      }

      return {
        question: qText,
        svg: svg,
        type: 'choice',
        options: shuffle([
          ansStr,
          `${s / (v1 - v2)} giờ`, // Nhầm sang hiệu vận tốc
          `${t + 1} giờ`,
          `${t + 2} giờ`
        ]),
        correctAnswer: ansStr,
        explanation: `Tổng hai vận tốc: ${v1} + ${v2} = ${v1 + v2} km/h.<br>Thời gian gặp nhau: ${s} : ${v1 + v2} = <b>${ansStr}</b>.`,
        formula: `<span class="math-font">Chuyển động ngược chiều: <span class="math-var">t</span> = <span class="math-var">s</span> : (<span class="math-var">v</span><sub>1</sub> + <span class="math-var">v</span><sub>2</sub>)</span>`,
        hint: `Cộng hai vận tốc lại rồi lấy quãng đường chia!`
      };
    },

    // 5-4: Hai chuyển động cùng chiều (đuổi kịp nhau)
    generateStage4(isInput) {
      const vBicycle = 12; // Xe đạp 12 km/h
      const vMotor = 36; // Xe máy 36 km/h
      const tLead = randChoice([1, 2]); // Xe đạp đi trước 1 hoặc 2 giờ
      const sDistance = vBicycle * tLead; // Khoảng cách lúc bắt đầu đuổi
      const vDiff = vMotor - vBicycle; // 24 km/h
      const tCatch = sDistance / vDiff; // 0.5 hoặc 1 giờ

      const qText = `Một người đi xe đạp khởi hành từ A với vận tốc 12 km/giờ. Sau <b>${tLead} giờ</b>, một người đi xe máy cũng khởi hành từ A đuổi theo với vận tốc 36 km/giờ. Hỏi sau bao lâu kể từ lúc xe máy bắt đầu đi thì đuổi kịp xe đạp?`;
      const svg = createMotionSVG(vBicycle, vMotor, sDistance, false);
      const ansStr = tCatch === 1 ? `1 giờ` : (tCatch === 2 ? `2 giờ` : `30 phút`);

      return {
        question: qText,
        svg: svg,
        type: 'choice',
        options: shuffle([
          ansStr,
          `${tLead} giờ`,
          `3 giờ`,
          `1 giờ 30 phút`
        ]),
        correctAnswer: ansStr,
        explanation: `Bước 1: Quãng đường xe đạp đi trước trong ${tLead} giờ là: 12 &times; ${tLead} = ${sDistance} km.<br>
        Bước 2: Mỗi giờ xe máy đi nhanh hơn xe đạp (hiệu vận tốc): 36 − 12 = 24 km/giờ.<br>
        Bước 3: Thời gian xe máy đuổi kịp: ${sDistance} : 24 = ${tCatch} giờ (${ansStr}).`,
        formula: `<span class="math-font"><span class="math-var">t</span> = <span class="math-var">s</span><sub>kc</sub> : (<span class="math-var">v</span><sub>2</sub> − <span class="math-var">v</span><sub>1</sub>)</span>`,
        hint: `Tính khoảng cách xe đạp đã đi trước, rồi chia cho hiệu hai vận tốc!`
      };
    },

    // 5-5 (Boss Rồng Thần Bão Tố)
    generateBoss() {
      // Chuyển động trên dòng nước
      const vThuc = 25; // Vận tốc thực của thuyền 25 km/h
      const vNuoc = 3;  // Vận tốc dòng nước 3 km/h
      const vXuoi = vThuc + vNuoc; // 28 km/h
      const vNguoc = vThuc - vNuoc; // 22 km/h
      const tXuoi = 2; // Đi xuôi dòng 2 giờ
      const s = vXuoi * tXuoi; // 56 km

      const qText = `🐉 <b>RỒNG THẦN BÃO TỐ GIÁNG THẾ:</b> Một ca nô đi xuôi dòng khúc sông từ A đến B dài <b>${s} km</b> hết <b>${tXuoi} giờ</b>. Biết vận tốc của dòng nước là <b>${vNuoc} km/giờ</b>. Hỏi vận tốc thực của ca nô khi nước yên lặng là bao nhiêu km/giờ?`;
      const ansStr = `${vThuc} km/giờ`;
      const ansVal = `${vThuc}`;

      return {
        bossName: "Rồng Thần Bão Tố",
        question: qText,
        type: 'choice',
        options: shuffle([
          ansStr,
          `${vXuoi} km/giờ`, // Bẫy chọn vận tốc xuôi dòng
          `${vXuoi + vNuoc} km/giờ`,
          `${vThuc - 5} km/giờ`
        ]),
        correctAnswer: ansStr,
        explanation: `Bước 1: Vận tốc ca nô khi xuôi dòng là: ${s} : ${tXuoi} = ${vXuoi} (km/giờ).<br>
        Bước 2: Vận tốc xuôi dòng = Vận tốc thực + Vận tốc dòng nước.<br>
        Do đó: Vận tốc thực của ca nô = Vận tốc xuôi dòng − Vận tốc dòng nước = ${vXuoi} − ${vNuoc} = <b>${ansStr}</b>.<br>
        Rồng Thần Bão Tố đã cúi đầu trước trí tuệ của bạn!`,
        formula: `<span class="math-font"><span class="math-var">v</span><sub>xuôi</sub> = <span class="math-var">v</span><sub>thực</sub> + <span class="math-var">v</span><sub>nước</sub> &rArr; <span class="math-var">v</span><sub>thực</sub> = <span class="math-var">v</span><sub>xuôi</sub> − <span class="math-var">v</span><sub>nước</sub></span>`,
        hint: `Tính vận tốc xuôi dòng trước, rồi trừ đi vận tốc dòng nước nhé!`
      };
    }
  };

  // =========================================================================
  // CHẾ ĐỘ THI ĐẤU TỐC ĐỘ 60 GIÂY (SPEED MENTAL MATH CHALLENGE)
  // =========================================================================

  function generateSpeedQuestion() {
    const topic = randChoice(['mentalMul', 'fractionAdd', 'pctQuick', 'geometryQuick']);

    if (topic === 'mentalMul') {
      const n = randChoice([2.4, 3.5, 0.75, 1.25, 4.2]);
      const factor = randChoice([10, 100]);
      const res = roundClean(n * factor, 1);
      return {
        question: `${vnNumber(n)} × ${factor} = ?`,
        type: 'choice',
        options: shuffle([vnNumber(res), vnNumber(res * 10), vnNumber(n), vnNumber(res / 10)]),
        correctAnswer: vnNumber(res),
        points: 10
      };
    } else if (topic === 'fractionAdd') {
      const d = randChoice([4, 5, 6, 7]);
      const a = randInt(1, d - 2);
      const b = randInt(1, d - a);
      const sum = a + b;
      return {
        question: `${a}/${d} + ${b}/${d} = ?`,
        type: 'choice',
        options: shuffle([`${sum}/${d}`, `${sum}/${d * 2}`, `${a * b}/${d}`, `${sum + 1}/${d}`]),
        correctAnswer: `${sum}/${d}`,
        points: 10
      };
    } else if (topic === 'pctQuick') {
      const pct = randChoice([10, 50, 25]);
      const base = randChoice([40, 80, 120, 200, 400]);
      const res = (base * pct) / 100;
      return {
        question: `${pct}% của ${base} là:`,
        type: 'choice',
        options: shuffle([`${res}`, `${res + 10}`, `${res * 2}`, `${res - 5}`]),
        correctAnswer: `${res}`,
        points: 15
      };
    } else {
      const a = randChoice([4, 6, 8, 10]);
      const h = randChoice([3, 5, 7]);
      const area = (a * h) / 2;
      return {
        question: `Diện tích tam giác đáy ${a}m, cao ${h}m:`,
        type: 'choice',
        options: shuffle([`${area} m²`, `${a * h} m²`, `${area + 5} m²`, `${area * 2} m²`]),
        correctAnswer: `${area} m²`,
        points: 15
      };
    }
  }

  // =========================================================================
  // BỘ ĐIỀU PHỐI CHÍNH (MAIN DISPATCHER)
  // =========================================================================

  return {
    generateQuestion(landId, stageId, questionIndex) {
      // Xen kẽ câu trắc nghiệm (chẵn) và tự điền (lẻ)
      const isInput = (questionIndex % 2 === 1);

      if (landId === 1) {
        if (stageId === 1) return FractionLand.generateStage1(isInput);
        if (stageId === 2) return FractionLand.generateStage2(isInput);
        if (stageId === 3) return FractionLand.generateStage3(isInput);
        if (stageId === 4) return FractionLand.generateStage4(isInput);
        if (stageId === 5) return FractionLand.generateBoss();
      } else if (landId === 2) {
        if (stageId === 1) return DecimalLand.generateStage1(isInput);
        if (stageId === 2) return DecimalLand.generateStage2(isInput);
        if (stageId === 3) return DecimalLand.generateStage3(isInput);
        if (stageId === 4) return DecimalLand.generateStage4(isInput);
        if (stageId === 5) return DecimalLand.generateBoss();
      } else if (landId === 3) {
        if (stageId === 1) return PercentageLand.generateStage1(isInput);
        if (stageId === 2) return PercentageLand.generateStage2(isInput);
        if (stageId === 3) return PercentageLand.generateStage3(isInput);
        if (stageId === 4) return PercentageLand.generateStage4(isInput);
        if (stageId === 5) return PercentageLand.generateBoss();
      } else if (landId === 4) {
        if (stageId === 1) return GeometryLand.generateStage1(isInput);
        if (stageId === 2) return GeometryLand.generateStage2(isInput);
        if (stageId === 3) return GeometryLand.generateStage3(isInput);
        if (stageId === 4) return GeometryLand.generateStage4(isInput);
        if (stageId === 5) return GeometryLand.generateBoss();
      } else if (landId === 5) {
        if (stageId === 1) return MotionLand.generateStage1(isInput);
        if (stageId === 2) return MotionLand.generateStage2(isInput);
        if (stageId === 3) return MotionLand.generateStage3(isInput);
        if (stageId === 4) return MotionLand.generateStage4(isInput);
        if (stageId === 5) return MotionLand.generateBoss();
      }

      // Mặc định fallback
      return FractionLand.generateStage1(isInput);
    },

    generateSpeedQuestion,
    checkAnswerEqual,
    vnNumber,
    roundClean
  };

})();

// Export globally
window.MathGenerator = MathGenerator;
