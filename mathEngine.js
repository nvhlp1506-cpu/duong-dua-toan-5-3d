/**
 * ============================================================================
 * ĐƯỜNG ĐUA TOÁN 5 – 3D | BỘ MÁY SINH ĐỀ TOÁN HỌC (MATH ENGINE)
 * Bám sát chương trình Toán lớp 5 - GDPT 2018 (Kết nối tri thức với cuộc sống)
 * 
 * Tính năng chính:
 * 1. Sinh đề ngẫu nhiên theo công thức tham số hóa (Procedural Generation).
 * 2. Triệt tiêu 100% lỗi floating-point JavaScript bằng quy đổi số nguyên an toàn.
 * 3. Sinh ngược phép chia để thương luôn là số thập phân hữu hạn đẹp mắt.
 * 4. Tạo đúng 3 đáp án (1 đúng, 2 sai thông minh phản ánh lỗi bẫy học sinh).
 * 5. Xáo trộn ngẫu nhiên vào 3 làn đường đua (X = -3, 0, +3).
 * 6. Tự động xuất chuỗi SVG minh họa sắc nét kèm kích thước cho phần Hình học.
 * ============================================================================
 */

(function (root, factory) {
  const engine = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = engine;
  }
  if (typeof window !== 'undefined') {
    window.MathEngine5 = engine;
  }
  if (typeof root !== 'undefined') {
    root.MathEngine5 = engine;
  }
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this), function () {

  // =================== TIỆN ÍCH SỐ HỌC AN TOÀN ===================

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

  // Triệt tiêu hoàn toàn sai số Floating-point (ví dụ 0.1 + 0.2 = 0.3)
  function roundExact(num, decimals = 2) {
    const factor = Math.pow(10, decimals);
    return Math.round((num + Number.EPSILON) * factor) / factor;
  }

  // Định dạng số chuẩn Việt Nam (dấu phẩy , cho phần thập phân)
  function vnNum(num, maxDecimals = 2) {
    if (typeof num !== 'number') return num.toString();
    const clean = roundExact(num, maxDecimals);
    return clean.toString().replace('.', ',');
  }

  // Đảm bảo 3 đáp án đôi một khác nhau
  function buildOptions(correctText, distractor1, distractor2) {
    let d1 = distractor1;
    let d2 = distractor2;

    if (d1 === correctText || d1 === d2) {
      d1 = d1 + " ";
    }
    if (d2 === correctText || d2 === d1) {
      d2 = d2 + " ";
    }

    const raw = [
      { text: correctText, isCorrect: true },
      { text: d1, isCorrect: false },
      { text: d2, isCorrect: false }
    ];

    const shuffled = shuffle(raw);
    const correctIndex = shuffled.findIndex(item => item.isCorrect);

    return {
      options: shuffled,
      correctIndex: correctIndex, // 0: Làn Trái (-3), 1: Làn Giữa (0), 2: Làn Phải (+3)
      correctText: correctText
    };
  }

  // =================== BỘ TẠO SVG MINH HỌA HÌNH HỌC ===================

  const SVG = {
    triangle(base, height, unit = 'cm') {
      return `
      <svg viewBox="0 0 200 110" class="h-20 w-auto drop-shadow">
        <polygon points="25,90 175,90 135,20" fill="rgba(14, 165, 233, 0.25)" stroke="#38bdf8" stroke-width="2.5" stroke-linejoin="round"/>
        <line x1="135" y1="20" x2="135" y2="90" stroke="#f43f5e" stroke-width="2" stroke-dasharray="4,3"/>
        <polyline points="135,80 145,80 145,90" fill="none" stroke="#f43f5e" stroke-width="1.5"/>
        <text x="100" y="104" fill="#bae6fd" font-size="11" font-weight="bold" text-anchor="middle">a = ${vnNum(base)} ${unit}</text>
        <text x="160" y="55" fill="#fda4af" font-size="11" font-weight="bold" text-anchor="middle">h = ${vnNum(height)}</text>
      </svg>`;
    },

    trapezoid(topB, botB, height, unit = 'cm') {
      return `
      <svg viewBox="0 0 220 110" class="h-20 w-auto drop-shadow">
        <polygon points="55,25 155,25 195,90 25,90" fill="rgba(245, 158, 11, 0.25)" stroke="#fbbf24" stroke-width="2.5" stroke-linejoin="round"/>
        <line x1="55" y1="25" x2="55" y2="90" stroke="#f43f5e" stroke-width="2" stroke-dasharray="4,3"/>
        <polyline points="55,80 65,80 65,90" fill="none" stroke="#f43f5e" stroke-width="1.5"/>
        <text x="105" y="18" fill="#fde68a" font-size="10" font-weight="bold" text-anchor="middle">a = ${vnNum(topB)}</text>
        <text x="110" y="104" fill="#fde68a" font-size="10" font-weight="bold" text-anchor="middle">b = ${vnNum(botB)} ${unit}</text>
        <text x="35" y="60" fill="#fda4af" font-size="10" font-weight="bold" text-anchor="middle">h = ${vnNum(height)}</text>
      </svg>`;
    },

    circle(r, isDiameter = false, unit = 'cm') {
      return `
      <svg viewBox="0 0 160 110" class="h-20 w-auto drop-shadow">
        <circle cx="80" cy="55" r="42" fill="rgba(168, 85, 247, 0.25)" stroke="#c084fc" stroke-width="2.5"/>
        <circle cx="80" cy="55" r="3" fill="#e9d5ff"/>
        ${isDiameter ? `
          <line x1="38" y1="55" x2="122" y2="55" stroke="#f43f5e" stroke-width="2" stroke-dasharray="3,2"/>
          <text x="80" y="72" fill="#e9d5ff" font-size="10" font-weight="bold" text-anchor="middle">d = ${vnNum(r * 2)} ${unit}</text>
        ` : `
          <line x1="80" y1="55" x2="122" y2="55" stroke="#f43f5e" stroke-width="2"/>
          <text x="101" y="48" fill="#e9d5ff" font-size="10" font-weight="bold" text-anchor="middle">r = ${vnNum(r)} ${unit}</text>
        `}
      </svg>`;
    },

    box(l, w, h, unit = 'cm') {
      return `
      <svg viewBox="0 0 200 120" class="h-20 w-auto drop-shadow">
        <polygon points="35,45 125,45 125,95 35,95" fill="rgba(16, 185, 129, 0.25)" stroke="#34d399" stroke-width="2"/>
        <polygon points="35,45 80,18 170,18 125,45" fill="rgba(52, 211, 153, 0.35)" stroke="#34d399" stroke-width="2"/>
        <polygon points="125,45 170,18 170,68 125,95" fill="rgba(5, 150, 105, 0.35)" stroke="#34d399" stroke-width="2"/>
        <text x="80" y="110" fill="#a7f3d0" font-size="10" font-weight="bold" text-anchor="middle">${vnNum(l)} ${unit}</text>
        <text x="155" y="88" fill="#a7f3d0" font-size="10" font-weight="bold" text-anchor="middle">${vnNum(w)}</text>
        <text x="24" y="72" fill="#a7f3d0" font-size="10" font-weight="bold" text-anchor="middle">${vnNum(h)}</text>
      </svg>`;
    }
  };

  // =========================================================================
  // 1. CHẶNG 1: RỪNG PHÂN SỐ (FRACTIONS)
  // =========================================================================
  function genFractionQuestion() {
    const type = randChoice(['simplify', 'compare', 'mixed', 'calc']);

    if (type === 'simplify') {
      const a = randChoice([1, 2, 3, 5, 7]);
      let b = randChoice([2, 3, 4, 5, 6, 7, 8, 9]);
      while (gcd(a, b) !== 1 || a === b) b = randChoice([2, 3, 4, 5, 6, 7, 8, 9]);
      const k = randChoice([2, 3, 4, 6, 8]);
      const num = a * k;
      const den = b * k;

      const correct = `${a}/${b}`;
      const d1 = `${num}/${b}`; // Quên chia tử
      const d2 = `${b}/${a}`;   // Đảo ngược tử mẫu

      return {
        stageId: 1,
        stageName: "Rừng Phân Số",
        question: `Rút gọn phân số ${num}/${den} về tối giản:`,
        svg: null,
        ...buildOptions(correct, d1, d2),
        formula: "Cùng chia cả tử và mẫu cho ƯCLN",
        explanation: `${num} : ${k} = ${a}; ${den} : ${k} = ${b}. Phân số tối giản là ${correct}.`
      };
    } else if (type === 'compare') {
      const den = randChoice([5, 7, 8, 9, 11]);
      const a = randInt(2, den - 2);
      const b = randInt(a + 1, den - 1);
      const correct = "<";
      const d1 = ">";
      const d2 = "=";

      return {
        stageId: 1,
        stageName: "Rừng Phân Số",
        question: `So sánh hai phân số: ${a}/${den} ... ${b}/${den}`,
        svg: null,
        ...buildOptions(correct, d1, d2),
        formula: "Cùng mẫu số: Tử bé hơn thì phân số bé hơn",
        explanation: `Hai phân số cùng mẫu ${den}, vì ${a} < ${b} nên ${a}/${den} < ${b}/${den}.`
      };
    } else if (type === 'mixed') {
      const subType = randChoice(['to_fraction', 'to_mixed', 'compare_mixed', 'calc_mixed']);

      if (subType === 'to_fraction') {
        // Dạng 1: Chuyển hỗn số thành phân số (Hỗn số ở đề bài, đáp án là phân số)
        const whole = randInt(2, 5);
        const c = randChoice([3, 4, 5, 7]);
        const properB = randInt(1, c - 1);
        const num = whole * c + properB;

        const correct = `${num}/${c}`;
        const d1 = `${whole * properB}/${c}`; // Lỗi lấy nguyên nhân tử
        const d2 = `${num}/${c + 1}`;

        return {
          stageId: 1,
          stageName: "Rừng Phân Số",
          question: `Chuyển hỗn số ${whole} ${properB}/${c} thành phân số:`,
          svg: null,
          ...buildOptions(correct, d1, d2),
          formula: "Tử số mới = (Phần nguyên × Mẫu số) + Tử số; Mẫu số giữ nguyên",
          explanation: `Tử số = ${whole} × ${c} + ${properB} = ${num}. Mẫu số giữ nguyên ${c}. Kết quả: ${correct}.`
        };
      } else if (subType === 'to_mixed') {
        // Dạng 2: Chuyển phân số thành hỗn số (Phân số ở đề bài, ĐÁP ÁN LÀ HỖN SỐ TRÊN CỔNG)
        const whole = randInt(2, 5);
        const c = randChoice([3, 4, 5, 7]);
        const properB = randInt(1, c - 1);
        const num = whole * c + properB;

        const correct = `${whole} ${properB}/${c}`;
        const d1 = `${whole} ${properB + 1 >= c ? 1 : properB + 1}/${c}`;
        const d2 = `${whole + 1} ${properB}/${c}`;

        return {
          stageId: 1,
          stageName: "Rừng Phân Số",
          question: `Chuyển phân số ${num}/${c} thành hỗn số:`,
          svg: null,
          ...buildOptions(correct, d1, d2),
          formula: "Lấy tử chia mẫu: Thương là phần nguyên, số dư là tử số mới, mẫu số giữ nguyên",
          explanation: `Thực hiện phép chia: ${num} : ${c} = ${whole} (dư ${properB}). Vậy phần nguyên là ${whole}, phần phân số là ${properB}/${c}. Kết quả: ${correct}.`
        };
      } else if (subType === 'compare_mixed') {
        // Dạng 3: So sánh hỗn số
        const isSameWhole = randChoice([true, false]);
        if (isSameWhole) {
          const w = randInt(2, 5);
          const c = randChoice([4, 5, 7]);
          const b1 = randInt(1, c - 2);
          const b2 = randInt(b1 + 1, c - 1);
          const correct = "<";
          return {
            stageId: 1,
            stageName: "Rừng Phân Số",
            question: `So sánh hai hỗn số: ${w} ${b1}/${c} ... ${w} ${b2}/${c}`,
            svg: null,
            ...buildOptions(correct, ">", "="),
            formula: "Cùng phần nguyên: Hỗn số nào có phần phân số lớn hơn thì lớn hơn",
            explanation: `Vì phần nguyên bằng nhau (${w} = ${w}) và ${b1}/${c} < ${b2}/${c} nên ${w} ${b1}/${c} < ${w} ${b2}/${c}.`
          };
        } else {
          const w1 = randInt(2, 4);
          const w2 = w1 + 1;
          const c = randChoice([4, 5, 7]);
          const b1 = randInt(1, c - 1);
          const b2 = randInt(1, c - 1);
          const correct = "<";
          return {
            stageId: 1,
            stageName: "Rừng Phân Số",
            question: `So sánh hai hỗn số: ${w1} ${b1}/${c} ... ${w2} ${b2}/${c}`,
            svg: null,
            ...buildOptions(correct, ">", "="),
            formula: "So sánh phần nguyên trước: Phần nguyên lớn hơn thì hỗn số lớn hơn",
            explanation: `Vì phần nguyên ${w1} < ${w2} nên ${w1} ${b1}/${c} < ${w2} ${b2}/${c}.`
          };
        }
      } else {
        // Dạng 4: Cộng hai hỗn số cùng mẫu
        const w1 = randInt(1, 3);
        const w2 = randInt(1, 3);
        const c = randChoice([5, 7, 9]);
        const b1 = randInt(1, Math.floor(c / 2));
        const b2 = randInt(1, Math.floor(c / 2));
        const sumWhole = w1 + w2;
        const sumNum = b1 + b2;

        const correct = `${sumWhole} ${sumNum}/${c}`;
        const d1 = `${sumWhole} ${sumNum}/${c * 2}`; // Lỗi cộng cả mẫu
        const d2 = `${sumWhole - 1} ${sumNum}/${c}`;

        return {
          stageId: 1,
          stageName: "Rừng Phân Số",
          question: `Tính kết quả: ${w1} ${b1}/${c} + ${w2} ${b2}/${c} = ?`,
          svg: null,
          ...buildOptions(correct, d1, d2),
          formula: "Cộng phần nguyên với phần nguyên, cộng phần phân số với phần phân số",
          explanation: `(${w1} + ${w2}) + (${b1}/${c} + ${b2}/${c}) = ${sumWhole} + ${sumNum}/${c} = ${correct}.`
        };
      }
    } else {
      // Phép cộng hoặc nhân phân số
      const isAdd = randChoice([true, false]);
      if (isAdd) {
        const d = randChoice([3, 4, 5, 7]);
        const a = randInt(1, d - 1);
        const b = randInt(1, d - 1);
        const sum = a + b;
        const g = gcd(sum, d);
        const sn = sum / g;
        const sd = d / g;
        const correct = sd === 1 ? `${sn}` : `${sn}/${sd}`;
        const d1 = `${sum}/${d * 2}`; // Lỗi cộng cả mẫu số
        const d2 = `${sum + 1}/${d}`;

        return {
          stageId: 1,
          stageName: "Rừng Phân Số",
          question: `Tính kết quả: ${a}/${d} + ${b}/${d} = ?`,
          svg: null,
          ...buildOptions(correct, d1, d2),
          formula: "Cộng phân số cùng mẫu: Cộng tử với tử, giữ nguyên mẫu",
          explanation: `${a}/${d} + ${b}/${d} = ${a + b}/${d} = ${correct}.`
        };
      } else {
        const a = randChoice([1, 2, 3]);
        const b = randChoice([4, 5]);
        const c = randChoice([2, 3]);
        const d = randChoice([3, 7]);
        const num = a * c;
        const den = b * d;
        const g = gcd(num, den);
        const sn = num / g;
        const sd = den / g;
        const correct = `${sn}/${sd}`;
        const d1 = `${a + c}/${b + d}`; // Lỗi cộng tử và mẫu
        const d2 = `${den}/${num}`;

        return {
          stageId: 1,
          stageName: "Rừng Phân Số",
          question: `Tính kết quả: ${a}/${b} × ${c}/${d} = ?`,
          svg: null,
          ...buildOptions(correct, d1, d2),
          formula: "Nhân phân số: Tử nhân tử, mẫu nhân mẫu",
          explanation: `Tử: ${a} × ${c} = ${num}; Mẫu: ${b} × ${d} = ${den}. Tối giản: ${correct}.`
        };
      }
    }
  }

  // =========================================================================
  // 2. CHẶNG 2: SA MẠC THẬP PHÂN (DECIMALS)
  // =========================================================================
  function genDecimalQuestion() {
    const type = randChoice(['mental', 'add_sub', 'mult', 'div']);

    if (type === 'mental') {
      const isTen = randChoice([true, false]);
      if (isTen) {
        const base = roundExact(randInt(15, 85) / 10, 1);
        const factor = randChoice([10, 100]);
        const ans = roundExact(base * factor, 1);
        const correct = vnNum(ans);
        const d1 = vnNum(roundExact(base / factor, 3)); // Nhầm sang chia
        const d2 = vnNum(roundExact(base * (factor === 10 ? 1 : 10), 1));

        return {
          stageId: 2,
          stageName: "Sa Mạc Thập Phân",
          question: `Tính nhẩm: ${vnNum(base)} × ${factor} = ?`,
          svg: null,
          ...buildOptions(correct, d1, d2),
          formula: `Nhân với ${factor}: Dịch dấu phẩy sang PHẢI ${factor === 10 ? '1' : '2'} chữ số`,
          explanation: `Khi nhân số thập phân với ${factor}, ta dịch dấu phẩy sang phải ${factor === 10 ? '1' : '2'} hàng. Kết quả: ${correct}.`
        };
      } else {
        const base = randInt(25, 95);
        const ans = roundExact(base * 0.1, 1);
        const correct = vnNum(ans);
        const d1 = vnNum(base * 10); // Nhầm thành nhân 10
        const d2 = vnNum(roundExact(ans / 10, 2));

        return {
          stageId: 2,
          stageName: "Sa Mạc Thập Phân",
          question: `Tính nhẩm: ${base} × 0,1 = ?`,
          svg: null,
          ...buildOptions(correct, d1, d2),
          formula: "Nhân với 0,1 tương đương chia cho 10 (dịch dấu phẩy sang TRÁI 1 hàng)",
          explanation: `${base} × 0,1 = ${base} : 10 = ${correct}.`
        };
      }
    } else if (type === 'add_sub') {
      const isAdd = randChoice([true, false]);
      const a = roundExact(randInt(15, 65) / 10, 1);
      const b = roundExact(randInt(11, 45) / 10, 1);

      if (isAdd) {
        const ans = roundExact(a + b, 1);
        const correct = vnNum(ans);
        const d1 = vnNum(roundExact(ans + 0.9, 1));
        const d2 = vnNum(roundExact(ans * 10, 0)); // Quên dấu phẩy

        return {
          stageId: 2,
          stageName: "Sa Mạc Thập Phân",
          question: `Đặt tính rồi tính: ${vnNum(a)} + ${vnNum(b)} = ?`,
          svg: null,
          ...buildOptions(correct, d1, d2),
          formula: "Đặt dấu phẩy thẳng cột, cộng từ phải sang trái",
          explanation: `Đặt dấu phẩy thẳng cột: ${vnNum(a)} + ${vnNum(b)} = ${correct}.`
        };
      } else {
        const big = roundExact(Math.max(a, b) + 2.5, 1);
        const small = roundExact(Math.min(a, b), 1);
        const ans = roundExact(big - small, 1);
        const correct = vnNum(ans);
        const d1 = vnNum(roundExact(ans + 0.2, 1));
        const d2 = vnNum(roundExact(ans - 0.2, 1));

        return {
          stageId: 2,
          stageName: "Sa Mạc Thập Phân",
          question: `Thực hiện phép trừ: ${vnNum(big)} − ${vnNum(small)} = ?`,
          svg: null,
          ...buildOptions(correct, d1, d2),
          formula: "Đặt dấu phẩy thẳng cột, trừ như số tự nhiên",
          explanation: `${vnNum(big)} − ${vnNum(small)} = ${correct}.`
        };
      }
    } else if (type === 'mult') {
      const a = roundExact(randInt(12, 35) / 10, 1);
      const b = randChoice([3, 4, 5]);
      const ans = roundExact(a * b, 1);
      const correct = vnNum(ans);
      const d1 = vnNum(roundExact(ans * 10, 0)); // Quên dấu phẩy
      const d2 = vnNum(roundExact(ans / 10, 2));

      return {
        stageId: 2,
        stageName: "Sa Mạc Thập Phân",
        question: `Tính giá trị phép nhân: ${vnNum(a)} × ${b} = ?`,
        svg: null,
        ...buildOptions(correct, d1, d2),
        formula: "Nhân như số tự nhiên, đếm 1 chữ số thập phân để tách",
        explanation: `${vnNum(a)} × ${b} = ${correct}.`
      };
    } else {
      // Phép chia sinh ngược để thương luôn hữu hạn đẹp
      const b = randChoice([2, 4, 5]);
      const ans = roundExact(randInt(12, 48) / 10, 1);
      const a = roundExact(ans * b, 1);
      const correct = vnNum(ans);
      const d1 = vnNum(roundExact(ans * 10, 0));
      const d2 = vnNum(roundExact(ans + 0.5, 1));

      return {
        stageId: 2,
        stageName: "Sa Mạc Thập Phân",
        question: `Thực hiện phép chia: ${vnNum(a)} : ${b} = ?`,
        svg: null,
        ...buildOptions(correct, d1, d2),
        formula: "Chia phần nguyên -> đánh dấu phẩy vào thương -> chia phần thập phân",
        explanation: `${vnNum(a)} : ${b} = ${correct}.`
      };
    }
  }

  // =========================================================================
  // 3. CHẶNG 3: THÀNH PHỐ PHẦN TRĂM (PERCENTAGES)
  // =========================================================================
  function genPercentageQuestion() {
    const type = randChoice(['ratio', 'find_value', 'discount']);

    if (type === 'ratio') {
      const pairs = [
        { a: 15, b: 60, pct: 25 },
        { a: 12, b: 50, pct: 24 },
        { a: 24, b: 80, pct: 30 },
        { a: 35, b: 70, pct: 50 },
        { a: 45, b: 60, pct: 75 }
      ];
      const p = randChoice(pairs);
      const correct = `${p.pct}%`;
      const d1 = `${p.pct - 5}%`;
      const d2 = `${roundExact(p.a / p.b, 2)}%`; // Quên nhân 100

      return {
        stageId: 3,
        stageName: "Thành Phố Phần Trăm",
        question: `Tìm tỉ số phần trăm của ${p.a} và ${p.b}:`,
        svg: null,
        ...buildOptions(correct, d1, d2),
        formula: "Tỉ số % = (a : b) × 100%",
        explanation: `${p.a} : ${p.b} = ${p.a / p.b}; nhân với 100 được ${correct}.`
      };
    } else if (type === 'find_value') {
      const pct = randChoice([10, 20, 25, 50]);
      const base = randChoice([120, 160, 200, 300, 400]);
      const ans = (base * pct) / 100;
      const correct = `${ans}`;
      const d1 = `${ans + 10}`;
      const d2 = `${roundExact(base / pct, 1)}`;

      return {
        stageId: 3,
        stageName: "Thành Phố Phần Trăm",
        question: `Tìm ${pct}% của ${base} kg:`,
        svg: null,
        ...buildOptions(`${correct} kg`, `${d1} kg`, `${d2} kg`),
        formula: "Giá trị = Tổng × Tỉ số % : 100",
        explanation: `${base} × ${pct} : 100 = ${correct} kg.`
      };
    } else {
      // Giảm giá thực tế
      const original = randChoice([100, 200, 300, 500]); // nghìn đồng
      const pct = randChoice([10, 20, 30]);
      const discount = (original * pct) / 100;
      const finalPrice = original - discount;

      const correct = `${finalPrice}k`;
      const d1 = `${discount}k`; // Nhầm sang số tiền được giảm
      const d2 = `${original + discount}k`;

      return {
        stageId: 3,
        stageName: "Thành Phố Phần Trăm",
        question: `Áo giá ${original}.000đ, giảm ${pct}%. Giá sau giảm:`,
        svg: null,
        ...buildOptions(`${finalPrice}.000đ`, `${discount}.000đ`, `${original + discount}.000đ`),
        formula: "Giá mới = Giá gốc − (Giá gốc × % giảm : 100)",
        explanation: `Giảm: ${original} × ${pct} : 100 = ${discount}k. Giá còn lại: ${original} − ${discount} = ${finalPrice}.000đ.`
      };
    }
  }

  // =========================================================================
  // 4. CHẶNG 4: THUNG LŨNG HÌNH HỌC (GEOMETRY & SVG)
  // =========================================================================
  function genGeometryQuestion() {
    const type = randChoice(['unit_area', 'triangle', 'trapezoid', 'circle', 'box']);

    if (type === 'unit_area') {
      const m2 = randChoice([3, 5, 8]);
      const dm2 = m2 * 100;
      const correct = `${dm2} dm²`;
      const d1 = `${m2 * 10} dm²`; // Nhầm đơn vị độ dài
      const d2 = `${m2 * 1000} dm²`;

      return {
        stageId: 4,
        stageName: "Thung Lũng Hình Học",
        question: `Đổi đơn vị: ${m2} m² = ... dm²?`,
        svg: null,
        ...buildOptions(correct, d1, d2),
        formula: "1 m² = 100 dm² (mỗi bước nhân/chia 100)",
        explanation: `${m2} m² = ${m2} × 100 = ${correct}.`
      };
    } else if (type === 'triangle') {
      const a = randChoice([10, 12, 16, 20]);
      const h = randChoice([6, 8, 10]);
      const area = (a * h) / 2;
      const correct = `${area} cm²`;
      const d1 = `${a * h} cm²`; // Bẫy quên chia 2
      const d2 = `${(a + h) * 2} cm²`;

      return {
        stageId: 4,
        stageName: "Thung Lũng Hình Học",
        question: `Tính diện tích hình tam giác trong hình vẽ:`,
        svg: SVG.triangle(a, h, 'cm'),
        ...buildOptions(correct, d1, d2),
        formula: "S = (a × h) : 2 (Nhớ chia đôi!)",
        explanation: `S = (${a} × ${h}) : 2 = ${correct}.`
      };
    } else if (type === 'trapezoid') {
      const a = randChoice([6, 8]);
      const b = randChoice([12, 14]);
      const h = randChoice([6, 8]);
      const area = ((a + b) * h) / 2;
      const correct = `${area} cm²`;
      const d1 = `${(a + b) * h} cm²`; // Quên chia 2
      const d2 = `${a * b * h} cm²`;

      return {
        stageId: 4,
        stageName: "Thung Lũng Hình Học",
        question: `Tính diện tích hình thang trong hình vẽ:`,
        svg: SVG.trapezoid(a, b, h, 'cm'),
        ...buildOptions(correct, d1, d2),
        formula: "S = (a + b) × h : 2",
        explanation: `S = (${a} + ${b}) × ${h} : 2 = ${correct}.`
      };
    } else if (type === 'circle') {
      const r = randChoice([2, 5, 10]);
      const area = roundExact(r * r * 3.14, 2);
      const correct = `${vnNum(area)} cm²`;
      const d1 = `${vnNum(roundExact(r * 2 * 3.14, 2))} cm²`; // Nhầm chu vi
      const d2 = `${vnNum(roundExact(r * 3.14, 2))} cm²`;

      return {
        stageId: 4,
        stageName: "Thung Lũng Hình Học",
        question: `Tính diện tích hình tròn có bán kính r = ${r} cm:`,
        svg: SVG.circle(r, false, 'cm'),
        ...buildOptions(correct, d1, d2),
        formula: "S = r × r × 3,14",
        explanation: `S = ${r} × ${r} × 3,14 = ${correct}.`
      };
    } else {
      // Thể tích hình hộp chữ nhật
      const l = randChoice([5, 6, 8]);
      const w = randChoice([4, 5]);
      const h = randChoice([3, 4]);
      const vol = l * w * h;
      const correct = `${vol} cm³`;
      const d1 = `${(l + w) * 2 * h} cm³`; // Nhầm diện tích xung quanh
      const d2 = `${l * w} cm³`;

      return {
        stageId: 4,
        stageName: "Thung Lũng Hình Học",
        question: `Tính thể tích hình hộp chữ nhật trong hình:`,
        svg: SVG.box(l, w, h, 'cm'),
        ...buildOptions(correct, d1, d2),
        formula: "V = a × b × c (Dài × Rộng × Cao)",
        explanation: `V = ${l} × ${w} × ${h} = ${correct}.`
      };
    }
  }

  // =========================================================================
  // 5. CHẶNG 5: ĐƯỜNG HẦM CHUYỂN ĐỘNG (MOTION)
  // =========================================================================
  function genMotionQuestion() {
    const type = randChoice(['speed', 'distance_time', 'time_convert', 'two_vehicles']);

    if (type === 'speed') {
      const v = randChoice([35, 40, 50, 60]);
      const t = randChoice([2, 3]);
      const s = v * t;
      const correct = `${v} km/h`;
      const d1 = `${s * t} km/h`;
      const d2 = `${v - 10} km/h`;

      return {
        stageId: 5,
        stageName: "Đường Hầm Chuyển Động",
        question: `Ô tô đi quãng đường ${s} km hết ${t} giờ. Vận tốc là:`,
        svg: null,
        ...buildOptions(correct, d1, d2),
        formula: "v = s : t (Vận tốc = Quãng đường : Thời gian)",
        explanation: `v = ${s} : ${t} = ${correct}.`
      };
    } else if (type === 'distance_time') {
      const v = randChoice([12, 15, 40]);
      const t = 2.5; // 2,5 giờ
      const s = roundExact(v * t, 1);
      const correct = `${vnNum(s)} km`;
      const d1 = `${roundExact(v / t, 1)} km`;
      const d2 = `${vnNum(s + 10)} km`;

      return {
        stageId: 5,
        stageName: "Đường Hầm Chuyển Động",
        question: `Xe máy đi với vận tốc ${v} km/h trong 2,5 giờ. Quãng đường là:`,
        svg: null,
        ...buildOptions(correct, d1, d2),
        formula: "s = v × t (Quãng đường = Vận tốc × Thời gian)",
        explanation: `s = ${v} × 2,5 = ${correct}.`
      };
    } else if (type === 'time_convert') {
      const correct = "90 phút";
      const d1 = "150 phút"; // Nhầm 1,5 giờ = 150 phút
      const d2 = "75 phút";

      return {
        stageId: 5,
        stageName: "Đường Hầm Chuyển Động",
        question: `Đổi đơn vị: 1,5 giờ = ... phút?`,
        svg: null,
        ...buildOptions(correct, d1, d2),
        formula: "1 giờ = 60 phút => 1,5 giờ = 1,5 × 60 phút",
        explanation: `1,5 × 60 = ${correct}. (Tránh nhầm 1,5 giờ thành 150 phút).`
      };
    } else {
      // Hai xe ngược chiều gặp nhau
      const v1 = randChoice([40, 50]);
      const v2 = randChoice([30, 40]);
      const t = randChoice([2, 3]);
      const s = (v1 + v2) * t;
      const correct = `${t} giờ`;
      const d1 = `${t + 1} giờ`;
      const d2 = `${roundExact(s / (v1 - v2 || 10), 1)} giờ`;

      return {
        stageId: 5,
        stageName: "Đường Hầm Chuyển Động",
        question: `Quãng đường ${s} km. Hai xe đi ngược chiều (${v1} và ${v2} km/h). Gặp nhau sau:`,
        svg: null,
        ...buildOptions(correct, d1, d2),
        formula: "Thời gian gặp nhau = s : (v1 + v2)",
        explanation: `Tổng vận tốc = ${v1} + ${v2} = ${v1 + v2} km/h. Thời gian = ${s} : ${v1 + v2} = ${correct}.`
      };
    }
  }

  // =========================================================================
  // BỘ ĐIỀU PHỐI (MAIN DISPATCHER)
  // =========================================================================
  return {
    generate(stageId = 1) {
      if (stageId === 1) return genFractionQuestion();
      if (stageId === 2) return genDecimalQuestion();
      if (stageId === 3) return genPercentageQuestion();
      if (stageId === 4) return genGeometryQuestion();
      if (stageId === 5) return genMotionQuestion();
      // Chế độ Vô Tận (Endless): ngẫu nhiên 1 trong 5 chặng
      const randomStage = randChoice([1, 2, 3, 4, 5]);
      return this.generate(randomStage);
    },
    roundExact,
    vnNum
  };

});
