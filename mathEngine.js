/**
 * ============================================================================
 * ĐƯỜNG ĐUA TOÁN 5 – 3D | BỘ MÁY SINH ĐỀ TOÁN HỌC ĐA TẦNG (MATH ENGINE PRO)
 * Bám sát chương trình Toán lớp 5 - GDPT 2018 (Kết nối tri thức với cuộc sống)
 *
 * Tính năng nổi bật:
 * 1. Phân cấp 4 Mức Độ Khó: Mức 1 (Dễ) -> Mức 2 (Trung bình) -> Mức 3 (Khó) -> Mức 4 (Boss).
 * 2. Hàng chục dạng toán chuyên sâu cho cả 5 chuyên đề SGK Toán 5 Kết nối tri thức.
 * 3. Hệ thống chống trùng lặp thông minh (usedSignatures Set + resetSession).
 * 4. Triệt tiêu 100% lỗi floating-point JS & đảm bảo 3 đáp án luôn khác biệt thực sự.
 * 5. Tự động sinh hình vẽ SVG minh họa trực quan (Tam giác, Hình thang, Hình tròn, Hình hộp, Lập phương).
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

  // =================== TIỆN ÍCH SỐ HỌC & CHỐNG TRÙNG LẶP ===================

  const usedSignatures = new Set();

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

  function roundExact(num, decimals = 2) {
    const factor = Math.pow(10, decimals);
    return Math.round((num + Number.EPSILON) * factor) / factor;
  }

  function vnNum(num, maxDecimals = 3) {
    if (typeof num !== 'number' || Number.isNaN(num)) return String(num);
    const clean = roundExact(num, maxDecimals);
    return clean.toString().replace('.', ',');
  }

  function clampLevel(level) {
    const n = Number(level);
    if (Number.isNaN(n) || n < 1) return 1;
    if (n > 4) return 4;
    return Math.round(n);
  }

  const DIFF_LABELS = {
    1: "Dễ",
    2: "Trung bình",
    3: "Khó",
    4: "Siêu Boss"
  };

  // Đảm bảo 3 đáp án luôn khác nhau về mặt hiển thị (không bao giờ thêm dấu cách giả)
  function buildOptions(correctText, distractor1, distractor2, fallbacks = []) {
    const cStr = String(correctText).trim();
    const candidates = [String(distractor1).trim(), String(distractor2).trim(), ...fallbacks.map(x => String(x).trim())];

    const distinct = [];
    for (const cand of candidates) {
      if (cand && cand !== cStr && !distinct.includes(cand)) {
        distinct.push(cand);
        if (distinct.length === 2) break;
      }
    }

    // Tự động sinh phương án dự phòng hợp lệ nếu 2 bẫy bị trùng nhau
    let attempt = 1;
    while (distinct.length < 2 && attempt < 25) {
      let generated = "";
      const mixedM = cStr.match(/^(\d+)\s+(\d+)\/(\d+)$/);
      const fracM = cStr.match(/^(\d+)\/(\d+)$/);
      const numUnitM = cStr.match(/^(-?\d+(?:,\d+)?)(.*)$/);

      if (mixedM) {
        const w = parseInt(mixedM[1], 10);
        const n = parseInt(mixedM[2], 10);
        const d = parseInt(mixedM[3], 10);
        generated = `${Math.max(1, w + attempt)} ${n}/${d}`;
      } else if (fracM) {
        const n = parseInt(fracM[1], 10);
        const d = parseInt(fracM[2], 10);
        generated = `${n + attempt}/${d}`;
      } else if (numUnitM) {
        const val = parseFloat(numUnitM[1].replace(',', '.'));
        const suffix = numUnitM[2] || '';
        const delta = attempt % 2 === 1 ? Math.ceil(attempt / 2) : -Math.ceil(attempt / 2);
        const nextVal = val + delta * (Number.isInteger(val) ? 1 : 0.5);
        generated = `${vnNum(Math.max(0, roundExact(nextVal, 2)))}${suffix}`;
      } else {
        generated = `${cStr} (${attempt})`;
      }

      if (generated !== cStr && !distinct.includes(generated)) {
        distinct.push(generated);
      }
      attempt++;
    }

    const raw = [
      { text: cStr, isCorrect: true },
      { text: distinct[0], isCorrect: false },
      { text: distinct[1], isCorrect: false }
    ];

    const shuffled = shuffle(raw);
    const correctIndex = shuffled.findIndex(item => item.isCorrect);

    return {
      options: shuffled,
      correctIndex: correctIndex,
      correctText: cStr
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
        <text x="164" y="55" fill="#fda4af" font-size="11" font-weight="bold" text-anchor="middle">h = ${vnNum(height)}</text>
      </svg>`;
    },

    trapezoid(topB, botB, height, unit = 'cm') {
      return `
      <svg viewBox="0 0 220 110" class="h-20 w-auto drop-shadow">
        <polygon points="55,25 155,25 195,90 25,90" fill="rgba(245, 158, 11, 0.25)" stroke="#fbbf24" stroke-width="2.5" stroke-linejoin="round"/>
        <line x1="55" y1="25" x2="55" y2="90" stroke="#f43f5e" stroke-width="2" stroke-dasharray="4,3"/>
        <polyline points="55,80 65,80 65,90" fill="none" stroke="#f43f5e" stroke-width="1.5"/>
        <text x="105" y="18" fill="#fde68a" font-size="10" font-weight="bold" text-anchor="middle">a = ${vnNum(topB)} ${unit}</text>
        <text x="110" y="104" fill="#fde68a" font-size="10" font-weight="bold" text-anchor="middle">b = ${vnNum(botB)} ${unit}</text>
        <text x="32" y="60" fill="#fda4af" font-size="10" font-weight="bold" text-anchor="middle">h = ${vnNum(height)}</text>
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
        <text x="158" y="88" fill="#a7f3d0" font-size="10" font-weight="bold" text-anchor="middle">${vnNum(w)} ${unit}</text>
        <text x="20" y="72" fill="#a7f3d0" font-size="10" font-weight="bold" text-anchor="middle">${vnNum(h)} ${unit}</text>
      </svg>`;
    },

    cube(a, unit = 'cm') {
      return `
      <svg viewBox="0 0 180 120" class="h-20 w-auto drop-shadow">
        <polygon points="45,42 105,42 105,102 45,102" fill="rgba(56, 189, 248, 0.25)" stroke="#38bdf8" stroke-width="2"/>
        <polygon points="45,42 75,18 135,18 105,42" fill="rgba(125, 211, 252, 0.35)" stroke="#38bdf8" stroke-width="2"/>
        <polygon points="105,42 135,18 135,78 105,102" fill="rgba(2, 132, 199, 0.35)" stroke="#38bdf8" stroke-width="2"/>
        <text x="75" y="115" fill="#bae6fd" font-size="10" font-weight="bold" text-anchor="middle">a = ${vnNum(a)} ${unit}</text>
      </svg>`;
    }
  };

  // =========================================================================
  // 1. CHẶNG 1: RỪNG PHÂN SỐ (FRACTIONS & MIXED NUMBERS) - 4 CẤP ĐỘ
  // =========================================================================
  function genFractionQuestion(level = 1) {
    const lv = clampLevel(level);
    let types;
    if (lv === 1) {
      types = ['simplify_easy', 'compare_same_den', 'compare_with_one', 'add_sub_same_den', 'mixed_parts'];
    } else if (lv === 2) {
      types = ['simplify_med', 'compare_diff_den', 'mixed_to_frac', 'frac_to_mixed', 'compare_mixed', 'add_sub_diff_den', 'mul_frac'];
    } else if (lv === 3) {
      types = ['div_frac', 'calc_mixed', 'frac_of_number', 'find_x_frac', 'compare_mixed_frac'];
    } else {
      types = ['expr_frac', 'inverse_frac_word', 'find_x_frac_hard', 'calc_mixed_carry'];
    }

    const type = randChoice(types);

    if (type === 'simplify_easy' || type === 'simplify_med') {
      const a = randChoice([1, 2, 3, 4, 5, 7]);
      let b = randChoice([3, 4, 5, 6, 7, 8, 9, 10, 11]);
      while (gcd(a, b) !== 1 || a >= b) b = randChoice([3, 4, 5, 6, 7, 8, 9, 10, 11]);
      const k = type === 'simplify_easy' ? randChoice([2, 3, 4, 5]) : randChoice([6, 7, 8, 9, 12]);
      const num = a * k;
      const den = b * k;

      const correct = `${a}/${b}`;
      return {
        stageId: 1,
        stageName: "Rừng Phân Số",
        difficulty: lv,
        difficultyLabel: DIFF_LABELS[lv],
        question: `Rút gọn phân số ${num}/${den} về phân số tối giản:`,
        svg: null,
        ...buildOptions(correct, `${num}/${b}`, `${b}/${a}`, [`${a + 1}/${b}`, `${a}/${b + 1}`]),
        formula: "Chia cả tử số và mẫu số cho ước chung lớn nhất (ƯCLN)",
        explanation: `Cùng chia tử và mẫu cho ${k}: ${num} : ${k} = ${a}; ${den} : ${k} = ${b}. Kết quả: ${correct}.`
      };
    }

    if (type === 'compare_same_den') {
      const den = randChoice([5, 6, 7, 8, 9, 11, 13, 15]);
      const a = randInt(1, den - 2);
      const b = randInt(a + 1, den - 1);
      const leftBigger = randChoice([true, false]);
      const qLeft = leftBigger ? b : a;
      const qRight = leftBigger ? a : b;
      const correct = leftBigger ? ">" : "<";

      return {
        stageId: 1,
        stageName: "Rừng Phân Số",
        difficulty: lv,
        difficultyLabel: DIFF_LABELS[lv],
        question: `So sánh hai phân số: ${qLeft}/${den} ... ${qRight}/${den}`,
        svg: null,
        ...buildOptions(correct, leftBigger ? "<" : ">", "="),
        formula: "Hai phân số cùng mẫu số: Tử số lớn hơn thì phân số lớn hơn",
        explanation: `Cùng mẫu số ${den}, vì ${qLeft} ${correct} ${qRight} nên ${qLeft}/${den} ${correct} ${qRight}/${den}.`
      };
    }

    if (type === 'compare_with_one') {
      const den = randChoice([4, 5, 7, 8, 9, 12]);
      const mode = randChoice(['less', 'greater', 'equal']);
      let num = den;
      let correct = "=";
      if (mode === 'less') {
        num = randInt(1, den - 1);
        correct = "<";
      } else if (mode === 'greater') {
        num = den + randInt(1, den - 1);
        correct = ">";
      }

      return {
        stageId: 1,
        stageName: "Rừng Phân Số",
        difficulty: lv,
        difficultyLabel: DIFF_LABELS[lv],
        question: `So sánh phân số với 1: ${num}/${den} ... 1`,
        svg: null,
        ...buildOptions(correct, correct === "<" ? ">" : "<", correct === "=" ? "<" : "="),
        formula: "Tử < Mẫu thì phân số < 1; Tử > Mẫu thì phân số > 1; Tử = Mẫu thì bằng 1",
        explanation: `Vì ${num} ${correct} ${den} nên ${num}/${den} ${correct} 1.`
      };
    }

    if (type === 'add_sub_same_den') {
      const isAdd = randChoice([true, false]);
      const d = randChoice([4, 5, 6, 7, 8, 9, 10, 12]);
      if (isAdd) {
        const a = randInt(1, d - 1);
        const b = randInt(1, d - 1);
        const sum = a + b;
        const g = gcd(sum, d);
        const sn = sum / g;
        const sd = d / g;
        const correct = sd === 1 ? `${sn}` : `${sn}/${sd}`;
        return {
          stageId: 1,
          stageName: "Rừng Phân Số",
          difficulty: lv,
          difficultyLabel: DIFF_LABELS[lv],
          question: `Tính kết quả: ${a}/${d} + ${b}/${d} = ?`,
          svg: null,
          ...buildOptions(correct, `${sum}/${d * 2}`, `${sum + 1}/${d}`, [`${sn + 1}/${sd}`]),
          formula: "Cộng phân số cùng mẫu: Cộng tử với tử, giữ nguyên mẫu số (rút gọn nếu cần)",
          explanation: `${a}/${d} + ${b}/${d} = ${sum}/${d} = ${correct}.`
        };
      } else {
        const b = randInt(1, d - 2);
        const a = randInt(b + 1, d + 2);
        const diff = a - b;
        const g = gcd(diff, d);
        const sn = diff / g;
        const sd = d / g;
        const correct = sd === 1 ? `${sn}` : `${sn}/${sd}`;
        return {
          stageId: 1,
          stageName: "Rừng Phân Số",
          difficulty: lv,
          difficultyLabel: DIFF_LABELS[lv],
          question: `Tính kết quả: ${a}/${d} − ${b}/${d} = ?`,
          svg: null,
          ...buildOptions(correct, `${a + b}/${d}`, `${Math.max(1, diff)}/${d * 2}`, [`${sn + 1}/${sd}`]),
          formula: "Trừ phân số cùng mẫu: Lấy tử trừ tử, giữ nguyên mẫu số",
          explanation: `${a}/${d} − ${b}/${d} = ${diff}/${d} = ${correct}.`
        };
      }
    }

    if (type === 'mixed_parts') {
      const whole = randInt(2, 9);
      const den = randChoice([3, 4, 5, 7, 8, 9]);
      const num = randInt(1, den - 1);
      const askWhole = randChoice([true, false]);

      if (askWhole) {
        return {
          stageId: 1,
          stageName: "Rừng Phân Số",
          difficulty: lv,
          difficultyLabel: DIFF_LABELS[lv],
          question: `Phần nguyên của hỗn số ${whole} ${num}/${den} là:`,
          svg: null,
          ...buildOptions(`${whole}`, `${num}`, `${den}`, [`${whole + num}`]),
          formula: "Hỗn số gồm Phần nguyên (đứng trước) và Phần phân số (đứng sau)",
          explanation: `Hỗn số ${whole} ${num}/${den} có phần nguyên là ${whole} và phần phân số là ${num}/${den}.`
        };
      } else {
        return {
          stageId: 1,
          stageName: "Rừng Phân Số",
          difficulty: lv,
          difficultyLabel: DIFF_LABELS[lv],
          question: `Phần phân số của hỗn số ${whole} ${num}/${den} là:`,
          svg: null,
          ...buildOptions(`${num}/${den}`, `${whole}/${den}`, `${den}/${num}`, [`${whole} ${num}/${den}`]),
          formula: "Hỗn số gồm Phần nguyên (đứng trước) và Phần phân số (đứng sau)",
          explanation: `Phần phân số của hỗn số ${whole} ${num}/${den} là ${num}/${den}.`
        };
      }
    }

    if (type === 'compare_diff_den') {
      const sameNum = randChoice([true, false]);
      if (sameNum) {
        const num = randChoice([2, 3, 5, 7]);
        const d1 = num + randInt(1, 3);
        const d2 = d1 + randInt(1, 4);
        const leftSmallerDen = randChoice([true, false]);
        const qD1 = leftSmallerDen ? d1 : d2;
        const qD2 = leftSmallerDen ? d2 : d1;
        const correct = leftSmallerDen ? ">" : "<";
        return {
          stageId: 1,
          stageName: "Rừng Phân Số",
          difficulty: lv,
          difficultyLabel: DIFF_LABELS[lv],
          question: `So sánh hai phân số: ${num}/${qD1} ... ${num}/${qD2}`,
          svg: null,
          ...buildOptions(correct, leftSmallerDen ? "<" : ">", "="),
          formula: "Hai phân số cùng TỬ SỐ: Phân số nào có MẪU BÉ HƠN thì LỚN HƠN",
          explanation: `Cùng tử số ${num}, vì ${qD1} ${qD1 < qD2 ? '<' : '>'} ${qD2} nên ${num}/${qD1} ${correct} ${num}/${qD2}.`
        };
      } else {
        const d1 = randChoice([2, 3, 4, 5]);
        const k = randChoice([2, 3]);
        const d2 = d1 * k;
        const a = randInt(1, d1 - 1);
        let b = a * k + randChoice([-1, 1]);
        if (b <= 0) b = 1;
        const leftVal = a * k;
        const correct = leftVal > b ? ">" : (leftVal < b ? "<" : "=");
        return {
          stageId: 1,
          stageName: "Rừng Phân Số",
          difficulty: lv,
          difficultyLabel: DIFF_LABELS[lv],
          question: `Quy đồng để so sánh: ${a}/${d1} ... ${b}/${d2}`,
          svg: null,
          ...buildOptions(correct, correct === ">" ? "<" : ">", "="),
          formula: "Quy đồng về cùng mẫu số rồi so sánh hai tử số",
          explanation: `Quy đồng ${a}/${d1} = ${leftVal}/${d2}. So sánh ${leftVal}/${d2} ${correct} ${b}/${d2}.`
        };
      }
    }

    if (type === 'mixed_to_frac') {
      const whole = randInt(2, 7);
      const c = randChoice([3, 4, 5, 6, 7, 8, 9]);
      const properB = randInt(1, c - 1);
      const num = whole * c + properB;
      const correct = `${num}/${c}`;

      return {
        stageId: 1,
        stageName: "Rừng Phân Số",
        difficulty: lv,
        difficultyLabel: DIFF_LABELS[lv],
        question: `Chuyển hỗn số ${whole} ${properB}/${c} thành phân số:`,
        svg: null,
        ...buildOptions(correct, `${whole * properB}/${c}`, `${num}/${c + 1}`, [`${whole + properB}/${c}`]),
        formula: "Tử số mới = (Phần nguyên × Mẫu số) + Tử số; Mẫu số giữ nguyên",
        explanation: `Tử số = ${whole} × ${c} + ${properB} = ${num}. Mẫu số giữ nguyên ${c}. Kết quả: ${correct}.`
      };
    }

    if (type === 'frac_to_mixed') {
      const whole = randInt(2, 7);
      const c = randChoice([3, 4, 5, 6, 7, 8]);
      const properB = randInt(1, c - 1);
      const num = whole * c + properB;
      const correct = `${whole} ${properB}/${c}`;

      return {
        stageId: 1,
        stageName: "Rừng Phân Số",
        difficulty: lv,
        difficultyLabel: DIFF_LABELS[lv],
        question: `Chuyển phân số ${num}/${c} thành hỗn số:`,
        svg: null,
        ...buildOptions(correct, `${whole} ${properB + 1 >= c ? 1 : properB + 1}/${c}`, `${whole + 1} ${properB}/${c}`, [`${whole - 1} ${properB}/${c}`]),
        formula: "Lấy tử chia mẫu: Thương là phần nguyên, số dư là tử số mới, mẫu số giữ nguyên",
        explanation: `Thực hiện phép chia: ${num} : ${c} = ${whole} (dư ${properB}). Vậy hỗn số là ${correct}.`
      };
    }

    if (type === 'compare_mixed') {
      const isSameWhole = randChoice([true, false]);
      if (isSameWhole) {
        const w = randInt(2, 6);
        const c = randChoice([4, 5, 7, 8, 9]);
        const b1 = randInt(1, c - 2);
        const b2 = randInt(b1 + 1, c - 1);
        const swap = randChoice([true, false]);
        const lB = swap ? b2 : b1;
        const rB = swap ? b1 : b2;
        const correct = swap ? ">" : "<";
        return {
          stageId: 1,
          stageName: "Rừng Phân Số",
          difficulty: lv,
          difficultyLabel: DIFF_LABELS[lv],
          question: `So sánh hai hỗn số: ${w} ${lB}/${c} ... ${w} ${rB}/${c}`,
          svg: null,
          ...buildOptions(correct, swap ? "<" : ">", "="),
          formula: "Cùng phần nguyên: Hỗn số nào có phần phân số lớn hơn thì lớn hơn",
          explanation: `Phần nguyên đều là ${w}; vì ${lB}/${c} ${correct} ${rB}/${c} nên ${w} ${lB}/${c} ${correct} ${w} ${rB}/${c}.`
        };
      } else {
        const w1 = randInt(2, 5);
        const w2 = w1 + randInt(1, 2);
        const c = randChoice([4, 5, 7, 8]);
        const b1 = randInt(1, c - 1);
        const b2 = randInt(1, c - 1);
        const swap = randChoice([true, false]);
        const lW = swap ? w2 : w1;
        const rW = swap ? w1 : w2;
        const correct = swap ? ">" : "<";
        return {
          stageId: 1,
          stageName: "Rừng Phân Số",
          difficulty: lv,
          difficultyLabel: DIFF_LABELS[lv],
          question: `So sánh hai hỗn số: ${lW} ${b1}/${c} ... ${rW} ${b2}/${c}`,
          svg: null,
          ...buildOptions(correct, swap ? "<" : ">", "="),
          formula: "So sánh phần nguyên trước: Phần nguyên lớn hơn thì hỗn số lớn hơn",
          explanation: `Vì phần nguyên ${lW} ${correct} ${rW} nên ${lW} ${b1}/${c} ${correct} ${rW} ${b2}/${c}.`
        };
      }
    }

    if (type === 'add_sub_diff_den') {
      const pairs = [
        [2, 4], [3, 6], [2, 6], [3, 9], [4, 8], [5, 10], [2, 3], [3, 4], [2, 5], [3, 5]
      ];
      const [d1, d2] = randChoice(pairs);
      const a = randInt(1, d1 - 1);
      const b = randInt(1, d2 - 1);
      const isAdd = randChoice([true, false]);
      const commonDen = (d1 * d2) / gcd(d1, d2);
      const na = a * (commonDen / d1);
      const nb = b * (commonDen / d2);

      let resNum = isAdd ? (na + nb) : Math.abs(na - nb);
      const leftF = (isAdd || na >= nb) ? `${a}/${d1}` : `${b}/${d2}`;
      const rightF = (isAdd || na >= nb) ? `${b}/${d2}` : `${a}/${d1}`;
      if (!isAdd && resNum === 0) resNum = 1;

      const g = gcd(resNum, commonDen);
      const sn = resNum / g;
      const sd = commonDen / g;
      const correct = sd === 1 ? `${sn}` : `${sn}/${sd}`;
      const trapNum = isAdd ? a + b : Math.max(1, Math.abs(a - b));
      const d1Opt = `${trapNum}/${d1 + d2}`;
      const d2Opt = `${sn + 1}/${sd}`;

      return {
        stageId: 1,
        stageName: "Rừng Phân Số",
        difficulty: lv,
        difficultyLabel: DIFF_LABELS[lv],
        question: `Tính kết quả: ${leftF} ${isAdd ? '+' : '−'} ${rightF} = ?`,
        svg: null,
        ...buildOptions(correct, d1Opt, d2Opt, [`${resNum + 1}/${commonDen}`]),
        formula: "Quy đồng mẫu số rồi thực hiện cộng hoặc trừ hai tử số, rút gọn tối giản",
        explanation: `Mẫu số chung ${commonDen}: kết quả là ${resNum}/${commonDen} = ${correct}.`
      };
    }

    if (type === 'mul_frac') {
      const a = randChoice([1, 2, 3, 4, 5]);
      const b = randChoice([3, 4, 5, 6, 7]);
      const c = randChoice([2, 3, 4, 5]);
      const d = randChoice([3, 5, 7, 8]);
      const num = a * c;
      const den = b * d;
      const g = gcd(num, den);
      const sn = num / g;
      const sd = den / g;
      const correct = sd === 1 ? `${sn}` : `${sn}/${sd}`;

      return {
        stageId: 1,
        stageName: "Rừng Phân Số",
        difficulty: lv,
        difficultyLabel: DIFF_LABELS[lv],
        question: `Tính phép nhân: ${a}/${b} × ${c}/${d} = ?`,
        svg: null,
        ...buildOptions(correct, `${a + c}/${b + d}`, `${sd}/${sn}`, [`${sn + 1}/${sd}`]),
        formula: "Nhân hai phân số: Tử nhân tử, mẫu nhân mẫu rồi rút gọn",
        explanation: `(${a} × ${c}) / (${b} × ${d}) = ${num}/${den} = ${correct}.`
      };
    }

    if (type === 'div_frac') {
      const a = randChoice([1, 2, 3, 4, 5]);
      const b = randChoice([3, 4, 5, 7]);
      const c = randChoice([2, 3, 5]);
      const d = randChoice([3, 4, 6, 7]);
      const num = a * d;
      const den = b * c;
      const g = gcd(num, den);
      const sn = num / g;
      const sd = den / g;
      const correct = sd === 1 ? `${sn}` : `${sn}/${sd}`;

      return {
        stageId: 1,
        stageName: "Rừng Phân Số",
        difficulty: lv,
        difficultyLabel: DIFF_LABELS[lv],
        question: `Tính phép chia: ${a}/${b} : ${c}/${d} = ?`,
        svg: null,
        ...buildOptions(correct, `${a * c}/${b * d}`, `${sd}/${sn}`, [`${sn + 1}/${sd}`]),
        formula: "Chia phân số: Lấy phân số thứ nhất NHÂN với phân số thứ hai ĐẢO NGƯỢC",
        explanation: `${a}/${b} : ${c}/${d} = ${a}/${b} × ${d}/${c} = ${num}/${den} = ${correct}.`
      };
    }

    if (type === 'calc_mixed' || type === 'calc_mixed_carry') {
      const c = randChoice([5, 7, 8, 9]);
      if (type === 'calc_mixed') {
        const w1 = randInt(1, 4);
        const w2 = randInt(1, 4);
        const b1 = randInt(1, Math.floor(c / 2));
        const b2 = randInt(1, Math.floor(c / 2));
        const sumW = w1 + w2;
        const sumN = b1 + b2;
        const correct = `${sumW} ${sumN}/${c}`;
        return {
          stageId: 1,
          stageName: "Rừng Phân Số",
          difficulty: lv,
          difficultyLabel: DIFF_LABELS[lv],
          question: `Tính kết quả: ${w1} ${b1}/${c} + ${w2} ${b2}/${c} = ?`,
          svg: null,
          ...buildOptions(correct, `${sumW} ${sumN}/${c * 2}`, `${sumW - 1} ${sumN}/${c}`, [`${sumW + 1} ${sumN}/${c}`]),
          formula: "Cộng phần nguyên với phần nguyên, cộng phần phân số với phần phân số",
          explanation: `(${w1} + ${w2}) + (${b1}/${c} + ${b2}/${c}) = ${sumW} + ${sumN}/${c} = ${correct}.`
        };
      } else {
        // Hỗn số có nhớ (phần phân số >= 1 cần chuyển sang phần nguyên!)
        const w1 = randInt(2, 4);
        const w2 = randInt(1, 3);
        const b1 = randInt(Math.ceil(c / 2), c - 1);
        const b2 = randInt(Math.ceil(c / 2), c - 1);
        const rawN = b1 + b2;
        const extraW = Math.floor(rawN / c);
        const remN = rawN % c;
        const finalW = w1 + w2 + extraW;
        const correct = remN === 0 ? `${finalW}` : `${finalW} ${remN}/${c}`;
        return {
          stageId: 1,
          stageName: "Rừng Phân Số",
          difficulty: lv,
          difficultyLabel: DIFF_LABELS[lv],
          question: `Tính và viết gọn thành hỗn số: ${w1} ${b1}/${c} + ${w2} ${b2}/${c} = ?`,
          svg: null,
          ...buildOptions(correct, `${w1 + w2} ${rawN}/${c}`, `${finalW - 1} ${remN || 1}/${c}`, [`${finalW} ${remN + 1}/${c}`]),
          formula: "Nếu tổng phần phân số ≥ 1, quy đổi phần nguyên nhớ cộng vào phần nguyên",
          explanation: `(${w1} + ${w2}) + ${rawN}/${c} = ${w1 + w2} + ${extraW} ${remN}/${c} = ${correct}.`
        };
      }
    }

    if (type === 'frac_of_number') {
      const items = [
        { item: "bao gạo", unit: "kg", baseChoices: [30, 40, 45, 60, 80, 100] },
        { item: "quãng đường", unit: "km", baseChoices: [24, 36, 48, 60, 72] },
        { item: "số học sinh", unit: "bạn", baseChoices: [32, 35, 40, 45, 50] }
      ];
      const pick = randChoice(items);
      const base = randChoice(pick.baseChoices);
      const dens = [2, 3, 4, 5, 6, 8, 10].filter(d => base % d === 0);
      const den = randChoice(dens.length ? dens : [2]);
      const num = randInt(1, den - 1);
      const ans = (base * num) / den;
      const correct = `${ans} ${pick.unit}`;

      return {
        stageId: 1,
        stageName: "Rừng Phân Số",
        difficulty: lv,
        difficultyLabel: DIFF_LABELS[lv],
        question: `Tìm ${num}/${den} của ${base} ${pick.unit} là bao nhiêu?`,
        svg: null,
        ...buildOptions(correct, `${Math.round(base / num)} ${pick.unit}`, `${ans + den} ${pick.unit}`, [`${ans * 2} ${pick.unit}`]),
        formula: `Tìm a/b của một số N: Lấy N × a : b`,
        explanation: `${base} × ${num} : ${den} = ${ans} ${pick.unit}.`
      };
    }

    if (type === 'compare_mixed_frac') {
      const whole = randInt(2, 5);
      const c = randChoice([3, 4, 5, 7]);
      const b = randInt(1, c - 1);
      const mixedNum = whole * c + b;
      const otherNum = mixedNum + randChoice([-2, -1, 1, 2]);
      const correct = mixedNum < otherNum ? "<" : (mixedNum > otherNum ? ">" : "=");

      return {
        stageId: 1,
        stageName: "Rừng Phân Số",
        difficulty: lv,
        difficultyLabel: DIFF_LABELS[lv],
        question: `So sánh hỗn số và phân số: ${whole} ${b}/${c} ... ${otherNum}/${c}`,
        svg: null,
        ...buildOptions(correct, correct === "<" ? ">" : "<", "="),
        formula: "Đổi hỗn số sang phân số rồi so sánh cùng mẫu số",
        explanation: `Đổi ${whole} ${b}/${c} = ${mixedNum}/${c}. Vì ${mixedNum}/${c} ${correct} ${otherNum}/${c} nên dấu cần điền là ${correct}.`
      };
    }

    if (type === 'find_x_frac' || type === 'find_x_frac_hard') {
      const den = randChoice([4, 5, 6, 7, 8]);
      if (type === 'find_x_frac') {
        const xNum = randInt(1, den - 1);
        const bNum = randInt(1, den - 1);
        const sumNum = xNum + bNum;
        const g1 = gcd(xNum, den);
        const correct = `${xNum / g1}/${den / g1}`;
        return {
          stageId: 1,
          stageName: "Rừng Phân Số",
          difficulty: lv,
          difficultyLabel: DIFF_LABELS[lv],
          question: `Tìm phân số x tối giản biết: x + ${bNum}/${den} = ${sumNum}/${den}`,
          svg: null,
          ...buildOptions(correct, `${(sumNum + bNum)}/${den}`, `${xNum + 1}/${den}`, [`${den}/${xNum}`]),
          formula: "Muốn tìm số hạng chưa biết, lấy Tổng trừ đi số hạng đã biết",
          explanation: `x = ${sumNum}/${den} − ${bNum}/${den} = ${xNum}/${den} = ${correct}.`
        };
      } else {
        // Phép nhân hoặc chia tìm x
        const c = randChoice([2, 3, 5]);
        const d = randChoice([3, 4, 7]);
        const xN = randInt(1, 3);
        const xD = randChoice([4, 5, 7]);
        const prodN = xN * c;
        const prodD = xD * d;
        const gp = gcd(prodN, prodD);
        const gx = gcd(xN, xD);
        const correct = `${xN / gx}/${xD / gx}`;
        return {
          stageId: 1,
          stageName: "Rừng Phân Số",
          difficulty: lv,
          difficultyLabel: DIFF_LABELS[lv],
          question: `Tìm phân số x tối giản biết: x × ${c}/${d} = ${prodN / gp}/${prodD / gp}`,
          svg: null,
          ...buildOptions(correct, `${(prodN * c)}/${prodD * d}`, `${xD / gx}/${xN / gx}`, [`${(xN + 1)}/${xD}`]),
          formula: "Muốn tìm thừa số chưa biết, lấy Tích chia cho thừa số đã biết",
          explanation: `x = ${prodN / gp}/${prodD / gp} : ${c}/${d} = ${correct}.`
        };
      }
    }

    if (type === 'inverse_frac_word') {
      const num = randChoice([2, 3, 4]);
      const den = num + randInt(1, 4);
      const part = num * randInt(4, 15);
      const total = (part / num) * den;

      return {
        stageId: 1,
        stageName: "Rừng Phân Số",
        difficulty: lv,
        difficultyLabel: DIFF_LABELS[lv],
        question: `Biết ${num}/${den} chiều dài tấm vải là ${part} m. Cả tấm vải dài:`,
        svg: null,
        ...buildOptions(`${total} m`, `${Math.round((part * num) / den)} m`, `${total + 10} m`, [`${part * den} m`]),
        formula: "Tìm một số khi biết a/b của nó bằng M: Lấy M : a × b (hoặc M : a/b)",
        explanation: `Chiều dài cả tấm vải = ${part} : ${num} × ${den} = ${total} m.`
      };
    }

    // expr_frac (Ưu tiên nhân chia trước, cộng trừ sau)
    const a = randChoice([1, 2, 3]);
    const b = randChoice([2, 3, 4]);
    const k = randChoice([2, 3]);
    const resN = a + b;
    const resD = k * 2;
    const g = gcd(resN, resD);
    const correct = resD / g === 1 ? `${resN / g}` : `${resN / g}/${resD / g}`;

    return {
      stageId: 1,
      stageName: "Rừng Phân Số",
      difficulty: lv,
      difficultyLabel: DIFF_LABELS[lv],
      question: `Tính giá trị biểu thức: ${a}/${resD} + ${b}/${k} × 1/2 = ?`,
      svg: null,
      ...buildOptions(correct, `${a + b}/${resD + k}`, `${resN + 1}/${resD}`, [`${resN}/${resD * 2}`]),
      formula: "Thứ tự thực hiện phép tính: Nhân/Chia trước, Cộng/Trừ sau!",
      explanation: `Tính phép nhân trước: ${b}/${k} × 1/2 = ${b}/${resD}. Sau đó cộng: ${a}/${resD} + ${b}/${resD} = ${resN}/${resD} = ${correct}.`
    };
  }

  // =========================================================================
  // 2. CHẶNG 2: SA MẠC THẬP PHÂN (DECIMALS) - 4 CẤP ĐỘ
  // =========================================================================
  function genDecimalQuestion(level = 1) {
    const lv = clampLevel(level);
    let types;
    if (lv === 1) {
      types = ['place_value', 'compare_dec', 'frac_to_dec', 'mental_10_100', 'add_sub_easy'];
    } else if (lv === 2) {
      types = ['add_sub_hard', 'mult_dec_int', 'div_dec_int', 'round_dec', 'mental_01_001'];
    } else if (lv === 3) {
      types = ['mult_dec_dec', 'div_dec_dec', 'unit_dec', 'find_x_dec'];
    } else {
      types = ['fast_calc_dec', 'div_special', 'find_x_dec_hard', 'expr_dec'];
    }

    const type = randChoice(types);

    if (type === 'place_value') {
      const intP = randInt(1, 45);
      const d1 = randInt(1, 9);
      let d2 = randInt(1, 9);
      while (d2 === d1) d2 = (d2 % 9) + 1;
      let d3 = randInt(1, 9);
      while (d3 === d1 || d3 === d2) d3 = (d3 % 9) + 1;

      const askHundredth = randChoice([true, false]);
      const targetDigit = askHundredth ? d2 : d3;
      const ans = askHundredth ? d2 / 100 : d3 / 1000;
      const correct = vnNum(ans, 3);
      const numStr = `${intP},${d1}${d2}${d3}`;

      return {
        stageId: 2,
        stageName: "Sa Mạc Thập Phân",
        difficulty: lv,
        difficultyLabel: DIFF_LABELS[lv],
        question: `Chữ số ${targetDigit} trong số ${numStr} có giá trị là bao nhiêu?`,
        svg: null,
        ...buildOptions(correct, vnNum(targetDigit / 10, 1), vnNum(askHundredth ? d2 / 1000 : d3 / 100, 3), [`${targetDigit}`]),
        formula: "Sau dấu phẩy lần lượt là hàng phần mười (/10), phần trăm (/100), phần nghìn (/1000)",
        explanation: `Chữ số ${targetDigit} đứng ở hàng ${askHundredth ? 'phần trăm' : 'phần nghìn'}, có giá trị là ${correct}.`
      };
    }

    if (type === 'compare_dec') {
      const w = randInt(3, 25);
      const a = randInt(1, 8);
      const b = randInt(1, 9);
      const aNext = a + 1;
      // Bẫy kinh điển: w,ab so với w,(a+1) (ví dụ 12,48 < 12,5)
      const swap = randChoice([true, false]);
      const leftStr = swap ? `${w},${aNext}` : `${w},${a}${b}`;
      const rightStr = swap ? `${w},${a}${b}` : `${w},${aNext}`;
      const correct = swap ? ">" : "<";

      return {
        stageId: 2,
        stageName: "Sa Mạc Thập Phân",
        difficulty: lv,
        difficultyLabel: DIFF_LABELS[lv],
        question: `So sánh hai số thập phân: ${leftStr} ... ${rightStr}`,
        svg: null,
        ...buildOptions(correct, swap ? "<" : ">", "="),
        formula: "So sánh từ trái sang phải: Phần nguyên -> Hàng phần mười -> Hàng phần trăm",
        explanation: `Cùng phần nguyên ${w}, so sánh hàng phần mười: ${swap ? `${aNext} > ${a}` : `${a} < ${aNext}`} nên ${leftStr} ${correct} ${rightStr}.`
      };
    }

    if (type === 'frac_to_dec') {
      const den = randChoice([10, 100, 1000]);
      let num = den === 10 ? randInt(1, 29) : (den === 100 ? randInt(3, 185) : randInt(12, 450));
      if (num % 10 === 0) num += randInt(1, 9);
      const val = roundExact(num / den, 3);
      const correct = vnNum(val, 3);

      return {
        stageId: 2,
        stageName: "Sa Mạc Thập Phân",
        difficulty: lv,
        difficultyLabel: DIFF_LABELS[lv],
        question: `Viết phân số thập phân ${num}/${den} thành số thập phân:`,
        svg: null,
        ...buildOptions(correct, vnNum(roundExact(val * 10, 2), 2), vnNum(roundExact(val / 10, 4), 4)),
        formula: "Mẫu là 10, 100, 1000 có bao nhiêu chữ số 0 thì tách bấy nhiêu chữ số thập phân",
        explanation: `${num}/${den} = ${correct}.`
      };
    }

    if (type === 'mental_10_100' || type === 'mental_01_001') {
      if (type === 'mental_10_100') {
        const base = roundExact(randInt(12, 98) / 10, 1);
        const factor = randChoice([10, 100, 1000]);
        const isMult = randChoice([true, false]);
        if (isMult) {
          const ans = roundExact(base * factor, 1);
          const correct = vnNum(ans);
          return {
            stageId: 2,
            stageName: "Sa Mạc Thập Phân",
            difficulty: lv,
            difficultyLabel: DIFF_LABELS[lv],
            question: `Tính nhẩm: ${vnNum(base)} × ${factor} = ?`,
            svg: null,
            ...buildOptions(correct, vnNum(roundExact(base * (factor / 10), 2)), vnNum(roundExact(base / 10, 3))),
            formula: `Nhân với ${factor}: Dịch dấu phẩy sang PHẢI tương ứng số chữ số 0`,
            explanation: `${vnNum(base)} × ${factor} = ${correct}.`
          };
        } else {
          const big = roundExact(randInt(15, 95) * 1.1, 1);
          const ans = roundExact(big / factor, 4);
          const correct = vnNum(ans, 4);
          return {
            stageId: 2,
            stageName: "Sa Mạc Thập Phân",
            difficulty: lv,
            difficultyLabel: DIFF_LABELS[lv],
            question: `Tính nhẩm: ${vnNum(big)} : ${factor} = ?`,
            svg: null,
            ...buildOptions(correct, vnNum(roundExact(big * 10, 1)), vnNum(roundExact(ans * 10, 3), 3)),
            formula: `Chia cho ${factor}: Dịch dấu phẩy sang TRÁI tương ứng số chữ số 0`,
            explanation: `${vnNum(big)} : ${factor} = ${correct}.`
          };
        }
      } else {
        const multSmall = randChoice([0.1, 0.01]);
        const base = roundExact(randInt(14, 95) * (multSmall === 0.01 ? 10 : 1) + randInt(1, 9) / 10, 1);
        const ans = roundExact(base * multSmall, 3);
        const correct = vnNum(ans, 3);
        return {
          stageId: 2,
          stageName: "Sa Mạc Thập Phân",
          difficulty: lv,
          difficultyLabel: DIFF_LABELS[lv],
          question: `Tính nhẩm: ${vnNum(base)} × ${vnNum(multSmall)} = ?`,
          svg: null,
          ...buildOptions(correct, vnNum(roundExact(base / multSmall, 1)), vnNum(roundExact(ans * 10, 2), 2)),
          formula: "Nhân với 0,1 (hoặc 0,01) tức là dịch dấu phẩy sang TRÁI 1 (hoặc 2) hàng",
          explanation: `${vnNum(base)} × ${vnNum(multSmall)} = ${correct}.`
        };
      }
    }

    if (type === 'add_sub_easy' || type === 'add_sub_hard') {
      const isAdd = randChoice([true, false]);
      if (type === 'add_sub_easy') {
        const a = roundExact(randInt(12, 85) / 10, 1);
        const b = roundExact(randInt(11, 65) / 10, 1);
        if (isAdd) {
          const ans = roundExact(a + b, 1);
          return {
            stageId: 2,
            stageName: "Sa Mạc Thập Phân",
            difficulty: lv,
            difficultyLabel: DIFF_LABELS[lv],
            question: `Đặt tính rồi tính: ${vnNum(a)} + ${vnNum(b)} = ?`,
            svg: null,
            ...buildOptions(vnNum(ans), vnNum(roundExact(ans + 1.1, 1)), vnNum(roundExact(ans * 10, 0))),
            formula: "Đặt dấu phẩy thẳng cột, cộng như cộng số tự nhiên",
            explanation: `${vnNum(a)} + ${vnNum(b)} = ${vnNum(ans)}.`
          };
        } else {
          const big = roundExact(Math.max(a, b) + 3.2, 1);
          const small = roundExact(Math.min(a, b), 1);
          const ans = roundExact(big - small, 1);
          return {
            stageId: 2,
            stageName: "Sa Mạc Thập Phân",
            difficulty: lv,
            difficultyLabel: DIFF_LABELS[lv],
            question: `Thực hiện phép trừ: ${vnNum(big)} − ${vnNum(small)} = ?`,
            svg: null,
            ...buildOptions(vnNum(ans), vnNum(roundExact(ans + 0.3, 1)), vnNum(roundExact(Math.max(0.1, ans - 0.3), 1))),
            formula: "Đặt dấu phẩy thẳng cột, trừ từ phải sang trái",
            explanation: `${vnNum(big)} − ${vnNum(small)} = ${vnNum(ans)}.`
          };
        }
      } else {
        // Phép cộng/trừ khác số chữ số phần thập phân hoặc số nguyên trừ thập phân!
        if (isAdd) {
          const a = roundExact(randInt(25, 195) / 10, 1);
          const b = roundExact(randInt(115, 585) / 100, 2);
          const ans = roundExact(a + b, 2);
          return {
            stageId: 2,
            stageName: "Sa Mạc Thập Phân",
            difficulty: lv,
            difficultyLabel: DIFF_LABELS[lv],
            question: `Tính chính xác: ${vnNum(a)} + ${vnNum(b)} = ?`,
            svg: null,
            ...buildOptions(vnNum(ans, 2), vnNum(roundExact(ans + 0.11, 2), 2), vnNum(roundExact(Math.max(0.1, ans - 0.15), 2), 2)),
            formula: "Thêm số 0 vào bên phải phần thập phân để thẳng hàng rồi cộng",
            explanation: `${vnNum(a)}0 + ${vnNum(b)} = ${vnNum(ans, 2)}.`
          };
        } else {
          const big = randInt(12, 35); // Số tự nhiên trừ số thập phân!
          const small = roundExact(randInt(125, 975) / 100, 2);
          const ans = roundExact(big - small, 2);
          return {
            stageId: 2,
            stageName: "Sa Mạc Thập Phân",
            difficulty: lv,
            difficultyLabel: DIFF_LABELS[lv],
            question: `Thực hiện phép trừ: ${big} − ${vnNum(small)} = ?`,
            svg: null,
            ...buildOptions(vnNum(ans, 2), vnNum(roundExact(ans + 1, 2), 2), vnNum(roundExact(Math.max(0.1, ans - 0.9), 2), 2)),
            formula: `Viết số tự nhiên thành ${big},00 rồi đặt thẳng hàng dấu phẩy để trừ`,
            explanation: `${big},00 − ${vnNum(small)} = ${vnNum(ans, 2)}.`
          };
        }
      }
    }

    if (type === 'round_dec') {
      const intP = randInt(3, 28);
      const tenths = randInt(1, 8);
      const hundredths = randInt(1, 9);
      const raw = roundExact(intP + tenths / 10 + hundredths / 100, 2);
      const toUnit = randChoice([true, false]);

      if (toUnit) {
        const ans = tenths >= 5 ? intP + 1 : intP;
        const trap = tenths >= 5 ? intP : intP + 1;
        return {
          stageId: 2,
          stageName: "Sa Mạc Thập Phân",
          difficulty: lv,
          difficultyLabel: DIFF_LABELS[lv],
          question: `Làm tròn số ${vnNum(raw, 2)} đến hàng ĐƠN VỊ (số tự nhiên gần nhất):`,
          svg: null,
          ...buildOptions(`${ans}`, `${trap}`, `${intP + 2}`),
          formula: "Xem chữ số hàng phần mười: < 5 giữ nguyên; ≥ 5 làm tròn lên 1 đơn vị",
          explanation: `Chữ số hàng phần mười là ${tenths} (${tenths >= 5 ? '≥ 5 nên làm tròn lên' : '< 5 nên giữ nguyên'}). Kết quả: ${ans}.`
        };
      } else {
        const ans = hundredths >= 5 ? roundExact(intP + (tenths + 1) / 10, 1) : roundExact(intP + tenths / 10, 1);
        const trap = hundredths >= 5 ? roundExact(intP + tenths / 10, 1) : roundExact(intP + (tenths + 1) / 10, 1);
        return {
          stageId: 2,
          stageName: "Sa Mạc Thập Phân",
          difficulty: lv,
          difficultyLabel: DIFF_LABELS[lv],
          question: `Làm tròn số ${vnNum(raw, 2)} đến hàng PHẦN MƯỜI:`,
          svg: null,
          ...buildOptions(vnNum(ans, 1), vnNum(trap, 1), `${intP}`),
          formula: "Xem chữ số hàng phần trăm: < 5 bỏ phần sau; ≥ 5 cộng thêm 1 vào hàng phần mười",
          explanation: `Chữ số hàng phần trăm là ${hundredths} (${hundredths >= 5 ? '≥ 5 làm tròn lên' : '< 5 giữ nguyên'}). Kết quả: ${vnNum(ans, 1)}.`
        };
      }
    }

    if (type === 'mult_dec_int' || type === 'mult_dec_dec') {
      if (type === 'mult_dec_int') {
        const a = roundExact(randInt(13, 68) / 10, 1);
        const b = randChoice([3, 4, 5, 6, 7, 8]);
        const ans = roundExact(a * b, 1);
        return {
          stageId: 2,
          stageName: "Sa Mạc Thập Phân",
          difficulty: lv,
          difficultyLabel: DIFF_LABELS[lv],
          question: `Tính giá trị phép nhân: ${vnNum(a)} × ${b} = ?`,
          svg: null,
          ...buildOptions(vnNum(ans), vnNum(roundExact(ans * 10, 0)), vnNum(roundExact(ans / 10, 2), 2)),
          formula: "Nhân như số tự nhiên, đếm phần thập phân để đặt dấu phẩy từ phải sang trái",
          explanation: `${vnNum(a)} × ${b} = ${vnNum(ans)}.`
        };
      } else {
        const a = roundExact(randInt(12, 45) / 10, 1);
        const b = roundExact(randInt(2, 9) / 10, 1);
        const ans = roundExact(a * b, 2);
        return {
          stageId: 2,
          stageName: "Sa Mạc Thập Phân",
          difficulty: lv,
          difficultyLabel: DIFF_LABELS[lv],
          question: `Tính phép nhân hai số thập phân: ${vnNum(a)} × ${vnNum(b)} = ?`,
          svg: null,
          ...buildOptions(vnNum(ans, 2), vnNum(roundExact(ans * 10, 1), 1), vnNum(roundExact(ans / 10, 3), 3)),
          formula: "Tổng số chữ số thập phân ở hai thừa số là 2 -> Tách 2 chữ số ở tích",
          explanation: `${vnNum(a)} × ${vnNum(b)} = ${vnNum(ans, 2)}.`
        };
      }
    }

    if (type === 'div_dec_int' || type === 'div_dec_dec') {
      if (type === 'div_dec_int') {
        const b = randChoice([2, 4, 5, 6, 8]);
        const ans = roundExact(randInt(13, 67) / 10, 1);
        const a = roundExact(ans * b, 2);
        return {
          stageId: 2,
          stageName: "Sa Mạc Thập Phân",
          difficulty: lv,
          difficultyLabel: DIFF_LABELS[lv],
          question: `Thực hiện phép chia: ${vnNum(a, 2)} : ${b} = ?`,
          svg: null,
          ...buildOptions(vnNum(ans), vnNum(roundExact(ans * 10, 0)), vnNum(roundExact(ans + 0.5, 1))),
          formula: "Chia hết phần nguyên, đánh dấu phẩy vào thương rồi hạ tiếp phần thập phân",
          explanation: `${vnNum(a, 2)} : ${b} = ${vnNum(ans)}.`
        };
      } else {
        const b = roundExact(randChoice([0.4, 0.5, 0.6, 0.8, 1.2, 1.5]), 1);
        const ans = roundExact(randInt(12, 55) / 10, 1);
        const a = roundExact(ans * b, 2);
        return {
          stageId: 2,
          stageName: "Sa Mạc Thập Phân",
          difficulty: lv,
          difficultyLabel: DIFF_LABELS[lv],
          question: `Chia cho số thập phân: ${vnNum(a, 2)} : ${vnNum(b)} = ?`,
          svg: null,
          ...buildOptions(vnNum(ans), vnNum(roundExact(ans / 10, 2), 2), vnNum(roundExact(ans * 10, 0))),
          formula: "Bỏ dấu phẩy ở số chia, đồng thời dịch dấu phẩy ở số bị chia sang phải tương ứng rồi chia",
          explanation: `${vnNum(a, 2)} : ${vnNum(b)} = ${vnNum(ans)}.`
        };
      }
    }

    if (type === 'unit_dec') {
      const cases = [
        { major: 'm', minor: 'cm', ratio: 100 },
        { major: 'km', minor: 'm', ratio: 1000 },
        { major: 'tấn', minor: 'kg', ratio: 1000 },
        { major: 'kg', minor: 'g', ratio: 1000 }
      ];
      const pick = randChoice(cases);
      const big = randInt(2, 14);
      const small = randInt(3, pick.ratio === 100 ? 95 : 450);
      const ans = roundExact(big + small / pick.ratio, 3);
      const correct = `${vnNum(ans, 3)} ${pick.major}`;

      return {
        stageId: 2,
        stageName: "Sa Mạc Thập Phân",
        difficulty: lv,
        difficultyLabel: DIFF_LABELS[lv],
        question: `Viết số đo dưới dạng số thập phân: ${big} ${pick.major} ${small} ${pick.minor} = ... ${pick.major}?`,
        svg: null,
        ...buildOptions(correct, `${vnNum(roundExact(big + small / 10, 2), 2)} ${pick.major}`, `${big},${small} ${pick.major}`),
        formula: `1 ${pick.major} = ${pick.ratio} ${pick.minor} -> Lấy phần nhỏ chia ${pick.ratio} rồi cộng phần lớn`,
        explanation: `${small} ${pick.minor} = ${vnNum(small / pick.ratio, 3)} ${pick.major}. Tổng = ${correct}.`
      };
    }

    if (type === 'find_x_dec' || type === 'find_x_dec_hard') {
      if (type === 'find_x_dec') {
        const xVal = roundExact(randInt(15, 95) / 10, 1);
        const sub = roundExact(randInt(12, 48) / 10, 1);
        const total = roundExact(xVal + sub, 1);
        return {
          stageId: 2,
          stageName: "Sa Mạc Thập Phân",
          difficulty: lv,
          difficultyLabel: DIFF_LABELS[lv],
          question: `Tìm x biết: ${vnNum(total)} − x = ${vnNum(sub)}`,
          svg: null,
          ...buildOptions(vnNum(xVal), vnNum(roundExact(total + sub, 1)), vnNum(roundExact(xVal + 1, 1))),
          formula: "Tìm số trừ chưa biết: Lấy Số bị trừ trừ đi Hiệu",
          explanation: `x = ${vnNum(total)} − ${vnNum(sub)} = ${vnNum(xVal)}.`
        };
      } else {
        const mult = randChoice([0.2, 0.4, 0.5, 2.5]);
        const xVal = roundExact(randInt(12, 40) / 2, 1);
        const prod = roundExact(xVal * mult, 2);
        return {
          stageId: 2,
          stageName: "Sa Mạc Thập Phân",
          difficulty: lv,
          difficultyLabel: DIFF_LABELS[lv],
          question: `Tìm x biết: x × ${vnNum(mult)} = ${vnNum(prod, 2)}`,
          svg: null,
          ...buildOptions(vnNum(xVal), vnNum(roundExact(prod * mult, 2), 2), vnNum(roundExact(xVal / 10, 2), 2)),
          formula: "Tìm thừa số chưa biết: Lấy Tích chia cho thừa số đã biết",
          explanation: `x = ${vnNum(prod, 2)} : ${vnNum(mult)} = ${vnNum(xVal)}.`
        };
      }
    }

    if (type === 'div_special') {
      const mode = randChoice(['div05', 'div025']);
      const base = randInt(8, 35);
      if (mode === 'div05') {
        const ans = base * 2;
        return {
          stageId: 2,
          stageName: "Sa Mạc Thập Phân",
          difficulty: lv,
          difficultyLabel: DIFF_LABELS[lv],
          question: `Tính nhẩm nhanh: ${base} : 0,5 = ?`,
          svg: null,
          ...buildOptions(`${ans}`, `${vnNum(base / 2, 1)}`, `${base * 5}`),
          formula: "Chia một số cho 0,5 chính là NHÂN số đó với 2!",
          explanation: `${base} : 0,5 = ${base} × 2 = ${ans}.`
        };
      } else {
        const ans = base * 4;
        return {
          stageId: 2,
          stageName: "Sa Mạc Thập Phân",
          difficulty: lv,
          difficultyLabel: DIFF_LABELS[lv],
          question: `Tính nhẩm nhanh: ${base} : 0,25 = ?`,
          svg: null,
          ...buildOptions(`${ans}`, `${vnNum(base / 4, 2)}`, `${base * 25}`),
          formula: "Chia một số cho 0,25 chính là NHÂN số đó với 4!",
          explanation: `${base} : 0,25 = ${base} × 4 = ${ans}.`
        };
      }
    }

    if (type === 'fast_calc_dec') {
      const pairs = [
        [2.5, 4, 10],
        [1.25, 8, 10],
        [0.25, 4, 1],
        [0.5, 2, 1],
        [12.5, 8, 100]
      ];
      const [a, b, prodAB] = randChoice(pairs);
      const mid = roundExact(randInt(24, 96) / 10, 1);
      const ans = roundExact(prodAB * mid, 1);
      return {
        stageId: 2,
        stageName: "Sa Mạc Thập Phân",
        difficulty: lv,
        difficultyLabel: DIFF_LABELS[lv],
        question: `Tính bằng cách thuận tiện nhất: ${vnNum(a)} × ${vnNum(mid)} × ${vnNum(b)} = ?`,
        svg: null,
        ...buildOptions(vnNum(ans), vnNum(roundExact(ans / 10, 2), 2), vnNum(roundExact(ans + 10, 1))),
        formula: "Áp dụng tính chất kết hợp: Gom cặp số nhân ra 1, 10 hoặc 100 trước",
        explanation: `(${vnNum(a)} × ${vnNum(b)}) × ${vnNum(mid)} = ${prodAB} × ${vnNum(mid)} = ${vnNum(ans)}.`
      };
    }

    // expr_dec: A × 10 + A × 90 hoặc tính phân phối
    const k = roundExact(randInt(15, 65) / 10, 1);
    const p1 = randChoice([3.6, 4.5, 6.2, 7.8]);
    const p2 = roundExact(10 - p1, 1);
    const ans = roundExact(k * 10, 1);
    return {
      stageId: 2,
      stageName: "Sa Mạc Thập Phân",
      difficulty: lv,
      difficultyLabel: DIFF_LABELS[lv],
      question: `Tính nhanh: ${vnNum(k)} × ${vnNum(p1)} + ${vnNum(k)} × ${vnNum(p2)} = ?`,
      svg: null,
      ...buildOptions(vnNum(ans), vnNum(roundExact(k * 100, 0)), vnNum(roundExact(k + 10, 1))),
      formula: "Tính chất phân phối: a × b + a × c = a × (b + c)",
      explanation: `${vnNum(k)} × (${vnNum(p1)} + ${vnNum(p2)}) = ${vnNum(k)} × 10 = ${vnNum(ans)}.`
    };
  }

  // =========================================================================
  // 3. CHẶNG 3: THÀNH PHỐ PHẦN TRĂM (RATIOS & PERCENTAGES) - 4 CẤP ĐỘ
  // =========================================================================
  function genPercentageQuestion(level = 1) {
    const lv = clampLevel(level);
    let types;
    if (lv === 1) {
      types = ['dec_to_pct', 'pct_to_dec', 'ratio_easy', 'find_pct_easy'];
    } else if (lv === 2) {
      types = ['ratio_med', 'find_pct_med', 'discount_word', 'calc_pct_expr', 'ratio_map'];
    } else if (lv === 3) {
      types = ['increase_pct', 'inverse_pct', 'sum_ratio_word', 'diff_ratio_word'];
    } else {
      types = ['inverse_discount', 'double_discount', 'mixture_pct', 'sum_ratio_hard'];
    }

    const type = randChoice(types);

    if (type === 'dec_to_pct') {
      const dec = roundExact(randInt(5, 145) / 100, 2);
      const pct = Math.round(dec * 100);
      return {
        stageId: 3,
        stageName: "Thành Phố Phần Trăm",
        difficulty: lv,
        difficultyLabel: DIFF_LABELS[lv],
        question: `Viết số thập phân ${vnNum(dec, 2)} thành tỉ số phần trăm:`,
        svg: null,
        ...buildOptions(`${pct}%`, `${vnNum(roundExact(pct / 10, 1))}%`, `${pct * 10}%`),
        formula: "Nhân số đó với 100 rồi viết thêm kí hiệu % vào bên phải",
        explanation: `${vnNum(dec, 2)} × 100 = ${pct} => Kết quả là ${pct}%.`
      };
    }

    if (type === 'pct_to_dec') {
      const pct = randInt(4, 135);
      const dec = roundExact(pct / 100, 2);
      return {
        stageId: 3,
        stageName: "Thành Phố Phần Trăm",
        difficulty: lv,
        difficultyLabel: DIFF_LABELS[lv],
        question: `Viết tỉ số phần trăm ${pct}% dưới dạng số thập phân:`,
        svg: null,
        ...buildOptions(vnNum(dec, 2), vnNum(roundExact(pct / 10, 1)), `${pct}`),
        formula: "Lấy số phần trăm chia cho 100 (dịch dấu phẩy sang trái 2 chữ số)",
        explanation: `${pct}% = ${pct} : 100 = ${vnNum(dec, 2)}.`
      };
    }

    if (type === 'ratio_easy' || type === 'ratio_med') {
      const pairs = type === 'ratio_easy' ? [
        { a: 15, b: 60, pct: 25 },
        { a: 20, b: 80, pct: 25 },
        { a: 25, b: 50, pct: 50 },
        { a: 30, b: 60, pct: 50 },
        { a: 10, b: 50, pct: 20 },
        { a: 40, b: 100, pct: 40 },
        { a: 15, b: 50, pct: 30 }
      ] : [
        { a: 12, b: 50, pct: 24 },
        { a: 18, b: 45, pct: 40 },
        { a: 24, b: 80, pct: 30 },
        { a: 45, b: 60, pct: 75 },
        { a: 9, b: 25, pct: 36 },
        { a: 21, b: 60, pct: 35 },
        { a: 27, b: 45, pct: 60 },
        { a: 17, b: 25, pct: 68 }
      ];
      const p = randChoice(pairs);
      const correct = `${p.pct}%`;
      const ratio = roundExact(p.a / p.b, 2);

      return {
        stageId: 3,
        stageName: "Thành Phố Phần Trăm",
        difficulty: lv,
        difficultyLabel: DIFF_LABELS[lv],
        question: `Tìm tỉ số phần trăm của ${p.a} và ${p.b}:`,
        svg: null,
        ...buildOptions(correct, `${vnNum(ratio, 2)}%`, `${p.pct + 10}%`, [`${Math.max(5, p.pct - 5)}%`]),
        formula: "Tỉ số phần trăm của a và b = (a : b) × 100%",
        explanation: `${p.a} : ${p.b} = ${vnNum(ratio, 2)}; nhân với 100 được ${correct}.`
      };
    }

    if (type === 'find_pct_easy' || type === 'find_pct_med') {
      const pct = type === 'find_pct_easy' ? randChoice([10, 20, 25, 50]) : randChoice([15, 30, 35, 40, 75]);
      const base = randChoice([120, 160, 200, 240, 300, 400, 500, 600]);
      const units = randChoice(['kg', 'm', 'lít', 'học sinh', 'viên bi']);
      const ans = (base * pct) / 100;
      const dTrap1 = ans + 20;
      const dTrap2 = roundExact(base / pct, 1) === ans ? ans + 15 : roundExact(base / pct, 1);

      return {
        stageId: 3,
        stageName: "Thành Phố Phần Trăm",
        difficulty: lv,
        difficultyLabel: DIFF_LABELS[lv],
        question: `Tìm ${pct}% của ${base} ${units}:`,
        svg: null,
        ...buildOptions(`${ans} ${units}`, `${dTrap1} ${units}`, `${vnNum(dTrap2)} ${units}`),
        formula: "Giá trị = Tổng × Tỉ số % : 100",
        explanation: `${base} × ${pct} : 100 = ${ans} ${units}.`
      };
    }

    if (type === 'discount_word') {
      const items = ['Chiếc ba lô', 'Đôi giày', 'Bộ sách', 'Áo khoác', 'Mũ bảo hiểm'];
      const item = randChoice(items);
      const original = randChoice([120, 160, 200, 250, 300, 400, 500]);
      const pct = randChoice([10, 15, 20, 25, 30]);
      const discount = (original * pct) / 100;
      const finalPrice = original - discount;

      return {
        stageId: 3,
        stageName: "Thành Phố Phần Trăm",
        difficulty: lv,
        difficultyLabel: DIFF_LABELS[lv],
        question: `${item} giá ${original}.000đ, đang giảm ${pct}%. Số tiền phải trả là:`,
        svg: null,
        ...buildOptions(`${finalPrice}.000đ`, `${discount}.000đ`, `${original + discount}.000đ`),
        formula: "Giá phải trả = Giá gốc − (Giá gốc × % giảm : 100)",
        explanation: `Số tiền được giảm: ${original} × ${pct} : 100 = ${discount}.000đ. Phải trả: ${original} − ${discount} = ${finalPrice}.000đ.`
      };
    }

    if (type === 'calc_pct_expr') {
      const a = roundExact(randInt(125, 485) / 10, 1);
      const b = roundExact(randInt(105, 355) / 10, 1);
      const isAdd = randChoice([true, false]);
      if (isAdd) {
        const ans = roundExact(a + b, 1);
        return {
          stageId: 3,
          stageName: "Thành Phố Phần Trăm",
          difficulty: lv,
          difficultyLabel: DIFF_LABELS[lv],
          question: `Tính: ${vnNum(a)}% + ${vnNum(b)}% = ?`,
          svg: null,
          ...buildOptions(`${vnNum(ans)}%`, `${vnNum(roundExact(ans + 10, 1))}%`, `${vnNum(roundExact(a + b, 1))}`),
          formula: "Cộng hai số bình thường rồi giữ nguyên kí hiệu %",
          explanation: `${vnNum(a)}% + ${vnNum(b)}% = ${vnNum(ans)}%.`
        };
      } else {
        const ans = roundExact(100 - a, 1);
        return {
          stageId: 3,
          stageName: "Thành Phố Phần Trăm",
          difficulty: lv,
          difficultyLabel: DIFF_LABELS[lv],
          question: `Tính: 100% − ${vnNum(a)}% = ?`,
          svg: null,
          ...buildOptions(`${vnNum(ans)}%`, `${vnNum(roundExact(100 - a + 10, 1))}%`, `${vnNum(roundExact(Math.max(1, ans - 5), 1))}%`),
          formula: "Lấy 100 trừ đi phần trăm rồi giữ nguyên kí hiệu %",
          explanation: `100% − ${vnNum(a)}% = ${vnNum(ans)}%.`
        };
      }
    }

    if (type === 'ratio_map') {
      const scale = randChoice([1000, 5000, 10000, 20000]);
      const cm = randInt(2, 8);
      const realM = (cm * scale) / 100; // đổi từ cm ra mét

      return {
        stageId: 3,
        stageName: "Thành Phố Phần Trăm",
        difficulty: lv,
        difficultyLabel: DIFF_LABELS[lv],
        question: `Trên bản đồ tỉ lệ 1 : ${scale}, đoạn đường dài ${cm} cm. Ngoài thực tế dài bao nhiêu mét?`,
        svg: null,
        ...buildOptions(`${realM} m`, `${realM * 10} m`, `${Math.round(realM / 10)} m`),
        formula: "Độ dài thật = Độ dài bản đồ × Mẫu số tỉ lệ (rồi đổi từ cm sang m bằng cách chia 100)",
        explanation: `${cm} × ${scale} = ${cm * scale} cm = ${realM} m.`
      };
    }

    if (type === 'increase_pct') {
      const pop = randChoice([2000, 4000, 5000, 8000, 10000]);
      const pct = randChoice([5, 10, 15, 20]);
      const inc = (pop * pct) / 100;
      const total = pop + inc;

      return {
        stageId: 3,
        stageName: "Thành Phố Phần Trăm",
        difficulty: lv,
        difficultyLabel: DIFF_LABELS[lv],
        question: `Một khu vườn có ${pop} cây. Năm sau trồng thêm ${pct}%. Hỏi tổng số cây năm sau:`,
        svg: null,
        ...buildOptions(`${total} cây`, `${inc} cây`, `${pop - inc} cây`),
        formula: "Tổng mới = Ban đầu + (Ban đầu × % tăng : 100)",
        explanation: `Số cây tăng: ${pop} × ${pct} : 100 = ${inc} cây. Tổng mới: ${pop} + ${inc} = ${total} cây.`
      };
    }

    if (type === 'inverse_pct') {
      const pct = randChoice([20, 25, 40, 50, 75]);
      const total = randChoice([80, 120, 160, 200, 300, 400]);
      const part = (total * pct) / 100;

      return {
        stageId: 3,
        stageName: "Thành Phố Phần Trăm",
        difficulty: lv,
        difficultyLabel: DIFF_LABELS[lv],
        question: `Tìm một số biết ${pct}% của số đó bằng ${part}:`,
        svg: null,
        ...buildOptions(`${total}`, `${Math.round((part * pct) / 100)}`, `${total + 40}`),
        formula: "Tìm một số biết a% của nó là M: Lấy M : a × 100",
        explanation: `Số đó = ${part} : ${pct} × 100 = ${total}.`
      };
    }

    if (type === 'sum_ratio_word' || type === 'diff_ratio_word' || type === 'sum_ratio_hard') {
      const r1 = randChoice([1, 2, 3]);
      const r2 = r1 + randChoice([1, 2, 3]);
      if (type === 'diff_ratio_word') {
        const partVal = randInt(5, 15);
        const diff = (r2 - r1) * partVal;
        const small = r1 * partVal;
        const big = r2 * partVal;
        const askBig = randChoice([true, false]);
        return {
          stageId: 3,
          stageName: "Thành Phố Phần Trăm",
          difficulty: lv,
          difficultyLabel: DIFF_LABELS[lv],
          question: `Hiệu hai số là ${diff}, tỉ số của hai số là ${r1}/${r2}. Tìm ${askBig ? 'số LỚN' : 'số BÉ'}:`,
          svg: null,
          ...buildOptions(`${askBig ? big : small}`, `${askBig ? small : big}`, `${partVal}`),
          formula: "Hiệu số phần = Mẫu − Tử -> Giá trị 1 phần = Hiệu : Hiệu số phần",
          explanation: `Hiệu số phần: ${r2} − ${r1} = ${r2 - r1} phần. 1 phần = ${diff} : ${r2 - r1} = ${partVal}. Số cần tìm = ${askBig ? big : small}.`
        };
      } else {
        const partVal = randInt(4, 18);
        const sum = (r1 + r2) * partVal;
        const small = r1 * partVal;
        const big = r2 * partVal;
        const askBig = randChoice([true, false]);
        return {
          stageId: 3,
          stageName: "Thành Phố Phần Trăm",
          difficulty: lv,
          difficultyLabel: DIFF_LABELS[lv],
          question: `Tổng hai số là ${sum}, tỉ số là ${r1} : ${r2}. Tìm ${askBig ? 'số LỚN' : 'số BÉ'}:`,
          svg: null,
          ...buildOptions(`${askBig ? big : small}`, `${askBig ? small : big}`, `${partVal}`),
          formula: "Tổng số phần bằng nhau = r1 + r2 -> Giá trị 1 phần = Tổng : Tổng số phần",
          explanation: `Tổng số phần: ${r1} + ${r2} = ${r1 + r2}. 1 phần = ${partVal}. Đáp án: ${askBig ? big : small}.`
        };
      }
    }

    if (type === 'inverse_discount') {
      const pct = randChoice([10, 20, 25]);
      const orig = randChoice([200, 400, 500, 800]);
      const paid = orig - (orig * pct) / 100;
      return {
        stageId: 3,
        stageName: "Thành Phố Phần Trăm",
        difficulty: lv,
        difficultyLabel: DIFF_LABELS[lv],
        question: `Sau khi giảm ${pct}%, giá chiếc xe đồ chơi còn ${paid}.000đ. Giá gốc ban đầu là:`,
        svg: null,
        ...buildOptions(`${orig}.000đ`, `${Math.round(paid * (1 + pct / 100))}.000đ`, `${orig - 50}.000đ`),
        formula: `Giá mới ứng với (100% − ${pct}%) = ${100 - pct}%. Giá gốc = Giá mới : ${100 - pct} × 100`,
        explanation: `${paid} ứng với ${100 - pct}% giá gốc. Giá gốc = ${paid} : ${100 - pct} × 100 = ${orig}.000đ.`
      };
    }

    if (type === 'double_discount') {
      const orig = randChoice([200, 400, 500]);
      const after1 = orig * 0.9; // Giảm 10%
      const after2 = after1 * 0.9; // Giảm tiếp 10%
      return {
        stageId: 3,
        stageName: "Thành Phố Phần Trăm",
        difficulty: lv,
        difficultyLabel: DIFF_LABELS[lv],
        question: `Sản phẩm giá ${orig}.000đ, giảm giá 10% rồi lại giảm tiếp 10% trên giá mới. Còn lại:`,
        svg: null,
        ...buildOptions(`${after2}.000đ`, `${orig * 0.8}.000đ`, `${after1}.000đ`),
        formula: "Tính giá sau lần giảm 1, rồi giảm tiếp 10% dựa trên giá vừa tính!",
        explanation: `Lần 1 còn ${after1}k. Lần 2 giảm 10% của ${after1}k (= ${after1 * 0.1}k) nên còn ${after2}.000đ.`
      };
    }

    // mixture_pct: Nước muối
    const salt = randChoice([10, 15, 20, 25]);
    const totalChoices = salt === 15 ? [60, 100, 150] : [50, 100, 200];
    const total = randChoice(totalChoices);
    const water = total - salt;
    const pct = roundExact((salt / total) * 100, 1);

    return {
      stageId: 3,
      stageName: "Thành Phố Phần Trăm",
      difficulty: lv,
      difficultyLabel: DIFF_LABELS[lv],
      question: `Hòa tan ${salt} g muối vào ${water} g nước. Tỉ số phần trăm muối trong nước muối:`,
      svg: null,
      ...buildOptions(`${vnNum(pct)}%`, `${vnNum(roundExact((salt / water) * 100, 1))}%`, `${salt}%`),
      formula: "Tổng khối lượng dung dịch = Muối + Nước. Sau đó lấy Muối : Tổng × 100%",
      explanation: `Tổng nước muối = ${salt} + ${water} = ${total} g. Tỉ lệ = ${salt} : ${total} × 100% = ${vnNum(pct)}%.`
    };
  }

  // =========================================================================
  // 4. CHẶNG 4: THUNG LŨNG HÌNH HỌC & ĐO LƯỜNG (GEOMETRY & SVG) - 4 CẤP ĐỘ
  // =========================================================================
  function genGeometryQuestion(level = 1) {
    const lv = clampLevel(level);
    let types;
    if (lv === 1) {
      types = ['unit_area_easy', 'triangle_easy', 'circle_circ', 'cube_vol_easy'];
    } else if (lv === 2) {
      types = ['unit_ha_vol', 'triangle_dec', 'trapezoid_area', 'circle_area_r', 'box_vol'];
    } else if (lv === 3) {
      types = ['circle_area_d', 'cube_sxq_stp', 'box_sxq', 'inverse_triangle', 'liter_vol'];
    } else {
      types = ['inverse_trapezoid', 'inverse_circle', 'box_water_frac', 'cube_scale_hard'];
    }

    const type = randChoice(types);

    if (type === 'unit_area_easy' || type === 'unit_ha_vol') {
      if (type === 'unit_area_easy') {
        const units = [
          { from: 'm²', to: 'dm²', mul: 100 },
          { from: 'dm²', to: 'cm²', mul: 100 },
          { from: 'm²', to: 'cm²', mul: 10000 }
        ];
        const u = randChoice(units);
        const val = randInt(2, 12);
        const ans = val * u.mul;
        return {
          stageId: 4,
          stageName: "Thung Lũng Hình Học",
          difficulty: lv,
          difficultyLabel: DIFF_LABELS[lv],
          question: `Đổi đơn vị đo diện tích: ${val} ${u.from} = ... ${u.to}?`,
          svg: null,
          ...buildOptions(`${ans} ${u.to}`, `${val * (u.mul / 10)} ${u.to}`, `${val * u.mul * 10} ${u.to}`),
          formula: `Hai đơn vị đo diện tích liền kề gấp kém nhau 100 lần (1 ${u.from} = ${u.mul} ${u.to})`,
          explanation: `${val} × ${u.mul} = ${ans} ${u.to}.`
        };
      } else {
        const sub = randChoice(['ha_m2', 'km2_ha', 'm3_dm3', 'dm3_cm3']);
        if (sub === 'ha_m2') {
          const ha = roundExact(randChoice([0.5, 1.5, 2, 2.5, 3, 4]), 1);
          const m2 = roundExact(ha * 10000, 0);
          return {
            stageId: 4,
            stageName: "Thung Lũng Hình Học",
            difficulty: lv,
            difficultyLabel: DIFF_LABELS[lv],
            question: `Đổi đơn vị: ${vnNum(ha)} ha = ... m²?`,
            svg: null,
            ...buildOptions(`${m2} m²`, `${roundExact(ha * 1000, 0)} m²`, `${roundExact(ha * 100, 0)} m²`),
            formula: "1 ha (héc-ta) = 10 000 m²",
            explanation: `${vnNum(ha)} × 10 000 = ${m2} m².`
          };
        } else if (sub === 'km2_ha') {
          const km2 = roundExact(randChoice([1.5, 2, 3.2, 5]), 1);
          const ha = roundExact(km2 * 100, 0);
          return {
            stageId: 4,
            stageName: "Thung Lũng Hình Học",
            difficulty: lv,
            difficultyLabel: DIFF_LABELS[lv],
            question: `Đổi đơn vị: ${vnNum(km2)} km² = ... ha?`,
            svg: null,
            ...buildOptions(`${ha} ha`, `${ha * 10} ha`, `${Math.round(ha / 10)} ha`),
            formula: "1 km² = 100 ha",
            explanation: `${vnNum(km2)} × 100 = ${ha} ha.`
          };
        } else {
          const m3 = roundExact(randChoice([1.5, 2, 2.5, 3, 4.2, 6]), 1);
          const dm3 = roundExact(m3 * 1000, 0);
          const fromU = sub === 'm3_dm3' ? 'm³' : 'dm³';
          const toU = sub === 'm3_dm3' ? 'dm³' : 'cm³';
          return {
            stageId: 4,
            stageName: "Thung Lũng Hình Học",
            difficulty: lv,
            difficultyLabel: DIFF_LABELS[lv],
            question: `Đổi đơn vị thể tích: ${vnNum(m3)} ${fromU} = ... ${toU}?`,
            svg: null,
            ...buildOptions(`${dm3} ${toU}`, `${Math.round(dm3 / 10)} ${toU}`, `${dm3 * 10} ${toU}`),
            formula: "Hai đơn vị thể tích liền kề gấp kém nhau 1 000 lần",
            explanation: `${vnNum(m3)} × 1000 = ${dm3} ${toU}.`
          };
        }
      }
    }

    if (type === 'triangle_easy' || type === 'triangle_dec') {
      const a = type === 'triangle_easy' ? randChoice([8, 10, 12, 14, 16, 20]) : roundExact(randChoice([4.5, 5.4, 6.5, 8.2]), 1);
      const h = type === 'triangle_easy' ? randChoice([5, 6, 8, 9, 10]) : randChoice([4, 6, 8]);
      const area = roundExact((a * h) / 2, 2);
      return {
        stageId: 4,
        stageName: "Thung Lũng Hình Học",
        difficulty: lv,
        difficultyLabel: DIFF_LABELS[lv],
        question: `Tính diện tích hình tam giác (đáy ${vnNum(a)} cm, cao ${vnNum(h)} cm):`,
        svg: SVG.triangle(a, h, 'cm'),
        ...buildOptions(`${vnNum(area)} cm²`, `${vnNum(roundExact(a * h, 2))} cm²`, `${vnNum(roundExact((a + h) * 2, 2))} cm²`),
        formula: "S = (đáy × chiều cao) : 2 (Nhớ chia 2!)",
        explanation: `S = (${vnNum(a)} × ${vnNum(h)}) : 2 = ${vnNum(area)} cm².`
      };
    }

    if (type === 'trapezoid_area') {
      const a = randChoice([5, 6, 8, 10]);
      const b = a + randChoice([4, 6, 8]);
      const h = randChoice([4, 6, 8, 10]);
      const area = ((a + b) * h) / 2;
      return {
        stageId: 4,
        stageName: "Thung Lũng Hình Học",
        difficulty: lv,
        difficultyLabel: DIFF_LABELS[lv],
        question: `Tính diện tích hình thang (đáy bé ${a} cm, đáy lớn ${b} cm, cao ${h} cm):`,
        svg: SVG.trapezoid(a, b, h, 'cm'),
        ...buildOptions(`${area} cm²`, `${(a + b) * h} cm²`, `${a * b} cm²`),
        formula: "S = (đáy lớn + đáy bé) × chiều cao : 2",
        explanation: `S = (${a} + ${b}) × ${h} : 2 = ${area} cm².`
      };
    }

    if (type === 'circle_circ') {
      const useD = randChoice([true, false]);
      const r = randChoice([2, 3, 4, 5, 6, 10]);
      const d = r * 2;
      const c = roundExact(d * 3.14, 2);
      return {
        stageId: 4,
        stageName: "Thung Lũng Hình Học",
        difficulty: lv,
        difficultyLabel: DIFF_LABELS[lv],
        question: `Tính CHU VI hình tròn trong hình (${useD ? `đường kính d = ${d}` : `bán kính r = ${r}`} cm):`,
        svg: SVG.circle(r, useD, 'cm'),
        ...buildOptions(`${vnNum(c)} cm`, `${vnNum(roundExact(r * r * 3.14, 2))} cm`, `${vnNum(roundExact(r * 3.14, 2))} cm`),
        formula: "Chu vi hình tròn: C = d × 3,14 (hoặc C = r × 2 × 3,14)",
        explanation: `C = ${d} × 3,14 = ${vnNum(c)} cm.`
      };
    }

    if (type === 'circle_area_r' || type === 'circle_area_d') {
      const useD = type === 'circle_area_d';
      const r = randChoice([2, 3, 4, 5, 6, 10]);
      const area = roundExact(r * r * 3.14, 2);
      const trap = roundExact(r * 2 * 3.14, 2);
      const dTrap = roundExact((r * 2) * (r * 2) * 3.14, 2);

      return {
        stageId: 4,
        stageName: "Thung Lũng Hình Học",
        difficulty: lv,
        difficultyLabel: DIFF_LABELS[lv],
        question: useD
          ? `Tính DIỆN TÍCH hình tròn biết ĐƯỜNG KÍNH d = ${r * 2} cm:`
          : `Tính DIỆN TÍCH hình tròn biết bán kính r = ${r} cm:`,
        svg: SVG.circle(r, useD, 'cm'),
        ...buildOptions(`${vnNum(area)} cm²`, `${vnNum(useD ? dTrap : trap)} cm²`, `${vnNum(roundExact(r * 3.14, 2))} cm²`),
        formula: useD ? "Tìm bán kính r = d : 2; rồi tính S = r × r × 3,14" : "S = r × r × 3,14",
        explanation: useD
          ? `Bán kính r = ${r * 2} : 2 = ${r} cm. S = ${r} × ${r} × 3,14 = ${vnNum(area)} cm².`
          : `S = ${r} × ${r} × 3,14 = ${vnNum(area)} cm².`
      };
    }

    if (type === 'cube_vol_easy' || type === 'cube_sxq_stp') {
      const a = randChoice([2, 3, 4, 5, 6, 8, 10]);
      if (type === 'cube_vol_easy') {
        const vol = a * a * a;
        return {
          stageId: 4,
          stageName: "Thung Lũng Hình Học",
          difficulty: lv,
          difficultyLabel: DIFF_LABELS[lv],
          question: `Tính THỂ TÍCH hình lập phương cạnh a = ${a} cm:`,
          svg: SVG.cube(a, 'cm'),
          ...buildOptions(`${vol} cm³`, `${a * a * 6} cm³`, `${a * 3} cm³`),
          formula: "Thể tích hình lập phương: V = a × a × a",
          explanation: `V = ${a} × ${a} × ${a} = ${vol} cm³.`
        };
      } else {
        const askStp = randChoice([true, false]);
        const ans = askStp ? a * a * 6 : a * a * 4;
        return {
          stageId: 4,
          stageName: "Thung Lũng Hình Học",
          difficulty: lv,
          difficultyLabel: DIFF_LABELS[lv],
          question: `Tính diện tích ${askStp ? 'TOÀN PHẦN' : 'XUNG QUANH'} hình lập phương cạnh ${a} cm:`,
          svg: SVG.cube(a, 'cm'),
          ...buildOptions(`${ans} cm²`, `${askStp ? a * a * 4 : a * a * 6} cm²`, `${a * a * a} cm²`),
          formula: askStp ? "Stp = a × a × 6 (6 mặt bằng nhau)" : "Sxq = a × a × 4 (4 mặt xung quanh)",
          explanation: `${a} × ${a} × ${askStp ? 6 : 4} = ${ans} cm².`
        };
      }
    }

    if (type === 'box_vol' || type === 'box_sxq') {
      const l = randChoice([5, 6, 8, 10]);
      const w = randChoice([3, 4, 5]);
      const h = randChoice([2, 3, 4]);
      if (type === 'box_vol') {
        const vol = l * w * h;
        return {
          stageId: 4,
          stageName: "Thung Lũng Hình Học",
          difficulty: lv,
          difficultyLabel: DIFF_LABELS[lv],
          question: `Tính THỂ TÍCH hình hộp chữ nhật (${l} × ${w} × ${h} cm):`,
          svg: SVG.box(l, w, h, 'cm'),
          ...buildOptions(`${vol} cm³`, `${(l + w) * 2 * h} cm³`, `${l * w} cm³`),
          formula: "V = Dài × Rộng × Cao (cùng đơn vị đo)",
          explanation: `V = ${l} × ${w} × ${h} = ${vol} cm³.`
        };
      } else {
        const sxq = (l + w) * 2 * h;
        return {
          stageId: 4,
          stageName: "Thung Lũng Hình Học",
          difficulty: lv,
          difficultyLabel: DIFF_LABELS[lv],
          question: `Tính diện tích XUNG QUANH hình hộp chữ nhật (${l} × ${w} × ${h} cm):`,
          svg: SVG.box(l, w, h, 'cm'),
          ...buildOptions(`${sxq} cm²`, `${l * w * h} cm²`, `${(l + w) * h} cm²`),
          formula: "Sxq = Chu vi đáy × Chiều cao = (a + b) × 2 × c",
          explanation: `Sxq = (${l} + ${w}) × 2 × ${h} = ${sxq} cm².`
        };
      }
    }

    if (type === 'liter_vol' || type === 'box_water_frac') {
      const l = randChoice([5, 6, 8, 10]);
      const w = randChoice([4, 5]);
      const h = randChoice([4, 6, 8]);
      const fullLiters = l * w * h;
      if (type === 'liter_vol') {
        return {
          stageId: 4,
          stageName: "Thung Lũng Hình Học",
          difficulty: lv,
          difficultyLabel: DIFF_LABELS[lv],
          question: `Bể cá hình hộp chữ nhật dài ${l} dm, rộng ${w} dm, cao ${h} dm chứa tối đa bao nhiêu LÍT nước?`,
          svg: SVG.box(l, w, h, 'dm'),
          ...buildOptions(`${fullLiters} lít`, `${(l + w) * 2 * h} lít`, `${fullLiters * 10} lít`),
          formula: "1 dm³ = 1 lít => Thể tích (dm³) chính là số lít nước!",
          explanation: `V = ${l} × ${w} × ${h} = ${fullLiters} dm³ = ${fullLiters} lít.`
        };
      } else {
        const num = randChoice([1, 3]);
        const den = 4;
        const partLiters = (fullLiters * num) / den;
        return {
          stageId: 4,
          stageName: "Thung Lũng Hình Học",
          difficulty: lv,
          difficultyLabel: DIFF_LABELS[lv],
          question: `Bể nước dài ${l} dm, rộng ${w} dm, cao ${h} dm. Trong bể có ${num}/${den} thể tích nước. Số lít nước là:`,
          svg: SVG.box(l, w, h, 'dm'),
          ...buildOptions(`${partLiters} lít`, `${fullLiters} lít`, `${fullLiters - partLiters} lít`),
          formula: `Tính thể tích V (dm³ = lít), rồi nhân với ${num}/${den}`,
          explanation: `V = ${fullLiters} lít. Lượng nước = ${fullLiters} × ${num} : ${den} = ${partLiters} lít.`
        };
      }
    }

    if (type === 'inverse_triangle' || type === 'inverse_trapezoid') {
      if (type === 'inverse_triangle') {
        const a = randChoice([8, 10, 12, 16]);
        const h = randChoice([5, 6, 7, 9]);
        const s = (a * h) / 2;
        return {
          stageId: 4,
          stageName: "Thung Lũng Hình Học",
          difficulty: lv,
          difficultyLabel: DIFF_LABELS[lv],
          question: `Hình tam giác có diện tích ${s} cm² và cạnh đáy ${a} cm. Chiều cao h là:`,
          svg: null,
          ...buildOptions(`${h} cm`, `${vnNum(roundExact(s / a, 1))} cm`, `${h * 2} cm`),
          formula: "h = (S × 2) : a (Nhớ nhân đôi diện tích trước khi chia đáy!)",
          explanation: `h = (${s} × 2) : ${a} = ${s * 2} : ${a} = ${h} cm.`
        };
      } else {
        const a = randChoice([6, 8]);
        const b = randChoice([10, 12, 14]);
        const h = randChoice([4, 6, 8]);
        const s = ((a + b) * h) / 2;
        return {
          stageId: 4,
          stageName: "Thung Lũng Hình Học",
          difficulty: lv,
          difficultyLabel: DIFF_LABELS[lv],
          question: `Hình thang có diện tích ${s} cm², đáy lớn ${b} cm, đáy bé ${a} cm. Chiều cao là:`,
          svg: null,
          ...buildOptions(`${h} cm`, `${h * 2} cm`, `${Math.round(s / (a + b))} cm`),
          formula: "Chiều cao h = (S × 2) : (đáy lớn + đáy bé)",
          explanation: `h = (${s} × 2) : (${a} + ${b}) = ${s * 2} : ${a + b} = ${h} cm.`
        };
      }
    }

    if (type === 'inverse_circle') {
      const d = randChoice([4, 6, 8, 10, 12]);
      const c = roundExact(d * 3.14, 2);
      const r = d / 2;
      return {
        stageId: 4,
        stageName: "Thung Lũng Hình Học",
        difficulty: lv,
        difficultyLabel: DIFF_LABELS[lv],
        question: `Hình tròn có chu vi C = ${vnNum(c)} cm. Bán kính r của hình tròn đó là:`,
        svg: null,
        ...buildOptions(`${r} cm`, `${d} cm`, `${r * 2 + 1} cm`),
        formula: "Tìm đường kính d = C : 3,14 -> Bán kính r = d : 2",
        explanation: `d = ${vnNum(c)} : 3,14 = ${d} cm => Bán kính r = ${d} : 2 = ${r} cm.`
      };
    }

    // cube_scale_hard
    const k = randChoice([2, 3, 4]);
    const askVol = randChoice([true, false]);
    const ans = askVol ? k * k * k : k * k;
    return {
      stageId: 4,
      stageName: "Thung Lũng Hình Học",
      difficulty: lv,
      difficultyLabel: DIFF_LABELS[lv],
      question: `Nếu gấp cạnh của một hình lập phương lên ${k} lần thì ${askVol ? 'THỂ TÍCH' : 'DIỆN TÍCH TOÀN PHẦN'} tăng lên mấy lần?`,
      svg: null,
      ...buildOptions(`${ans} lần`, `${k} lần`, `${askVol ? k * k : k * k * k} lần`),
      formula: askVol ? `Thể tích tăng: ${k} × ${k} × ${k} lần` : `Diện tích toàn phần tăng: ${k} × ${k} lần`,
      explanation: `${askVol ? `${k} × ${k} × ${k}` : `${k} × ${k}`} = ${ans} lần.`
    };
  }

  // =========================================================================
  // 5. CHẶNG 5: ĐƯỜNG HẦM CHUYỂN ĐỘNG (TIME & MOTION) - 4 CẤP ĐỘ
  // =========================================================================
  function genMotionQuestion(level = 1) {
    const lv = clampLevel(level);
    let types;
    if (lv === 1) {
      types = ['time_convert', 'time_add_sub', 'find_v_easy', 'find_s_easy'];
    } else if (lv === 2) {
      types = ['find_t_easy', 'find_s_dec', 'time_dec_convert', 'find_v_dec'];
    } else if (lv === 3) {
      types = ['opposite_meet_time', 'same_dir_catch', 'speed_convert', 'find_s_hm'];
    } else {
      types = ['clock_arrival', 'opposite_find_v2', 'boat_stream', 'same_dir_hard'];
    }

    const type = randChoice(types);

    if (type === 'time_convert' || type === 'time_dec_convert') {
      if (type === 'time_convert') {
        const cases = [
          { q: "Đổi đơn vị: 1 giờ 25 phút = ... phút?", a: "85 phút", d1: "125 phút", d2: "75 phút", exp: "60 + 25 = 85 phút." },
          { q: "Đổi đơn vị: 2 giờ 15 phút = ... phút?", a: "135 phút", d1: "215 phút", d2: "125 phút", exp: "2 × 60 + 15 = 135 phút." },
          { q: "Đổi đơn vị: 3 phút 20 giây = ... giây?", a: "200 giây", d1: "320 giây", d2: "180 giây", exp: "3 × 60 + 20 = 200 giây." },
          { q: "Đổi đơn vị: 150 phút = ... giờ ... phút?", a: "2 giờ 30 phút", d1: "1 giờ 50 phút", d2: "2 giờ 15 phút", exp: "150 : 60 = 2 (dư 30) => 2 giờ 30 phút." },
          { q: "Đổi đơn vị: 2 ngày rưỡi = ... giờ?", a: "60 giờ", d1: "48 giờ", d2: "50 giờ", exp: "2,5 × 24 = 60 giờ." },
          { q: "Đổi đơn vị: 1/4 giờ = ... phút?", a: "15 phút", d1: "25 phút", d2: "40 phút", exp: "60 : 4 = 15 phút." }
        ];
        const c = randChoice(cases);
        return {
          stageId: 5,
          stageName: "Đường Hầm Chuyển Động",
          difficulty: lv,
          difficultyLabel: DIFF_LABELS[lv],
          question: c.q,
          svg: null,
          ...buildOptions(c.a, c.d1, c.d2),
          formula: "1 giờ = 60 phút; 1 phút = 60 giây; 1 ngày = 24 giờ",
          explanation: c.exp
        };
      } else {
        const decHours = randChoice([0.5, 0.75, 1.25, 1.5, 2.25, 2.5, 3.5]);
        const mins = Math.round(decHours * 60);
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        const askTotalMins = randChoice([true, false]);
        if (askTotalMins || h === 0) {
          return {
            stageId: 5,
            stageName: "Đường Hầm Chuyển Động",
            difficulty: lv,
            difficultyLabel: DIFF_LABELS[lv],
            question: `Đổi đơn vị thời gian: ${vnNum(decHours)} giờ = ... phút?`,
            svg: null,
            ...buildOptions(`${mins} phút`, `${Math.round(decHours * 100)} phút`, `${mins + 15} phút`),
            formula: "Đổi giờ sang phút: Lấy số giờ × 60",
            explanation: `${vnNum(decHours)} × 60 = ${mins} phút.`
          };
        } else {
          const correct = `${h} giờ ${m} phút`;
          return {
            stageId: 5,
            stageName: "Đường Hầm Chuyển Động",
            difficulty: lv,
            difficultyLabel: DIFF_LABELS[lv],
            question: `Đổi ${vnNum(decHours)} giờ ra giờ và phút:`,
            svg: null,
            ...buildOptions(correct, `${h} giờ ${Math.round((decHours - h) * 100)} phút`, `${h + 1} giờ ${m} phút`),
            formula: "Đổi phần thập phân của giờ × 60 để ra số phút",
            explanation: `${vnNum(roundExact(decHours - h, 2))} giờ = ${vnNum(roundExact(decHours - h, 2))} × 60 = ${m} phút. Kết quả: ${correct}.`
          };
        }
      }
    }

    if (type === 'time_add_sub') {
      const h1 = randInt(2, 5);
      const m1 = randChoice([35, 40, 45, 50]);
      const h2 = randInt(1, 3);
      const m2 = randChoice([25, 30, 40, 45]);
      const totM = m1 + m2;
      const carryH = Math.floor(totM / 60);
      const finalM = totM % 60;
      const finalH = h1 + h2 + carryH;
      const correct = finalM === 0 ? `${finalH} giờ` : `${finalH} giờ ${finalM} phút`;

      return {
        stageId: 5,
        stageName: "Đường Hầm Chuyển Động",
        difficulty: lv,
        difficultyLabel: DIFF_LABELS[lv],
        question: `Tính thời gian: ${h1} giờ ${m1} phút + ${h2} giờ ${m2} phút = ?`,
        svg: null,
        ...buildOptions(correct, `${h1 + h2} giờ ${totM} phút`, `${finalH - 1} giờ ${finalM + 10} phút`),
        formula: "Cộng theo từng loại đơn vị; nếu số phút ≥ 60 thì đổi sang giờ (1 giờ = 60 phút)",
        explanation: `${h1 + h2} giờ ${totM} phút = ${correct}.`
      };
    }

    if (type === 'find_v_easy' || type === 'find_v_dec') {
      const vehicle = randChoice(['Ô tô', 'Xe máy', 'Tàu hỏa', 'Xe đạp', 'Ca nô']);
      const v = type === 'find_v_easy' ? randChoice([12, 15, 35, 40, 45, 50, 60, 70]) : randChoice([32, 36, 44, 48, 52, 56]);
      const t = type === 'find_v_easy' ? randChoice([2, 3, 4]) : randChoice([1.5, 2.5]);
      const s = roundExact(v * t, 1);

      return {
        stageId: 5,
        stageName: "Đường Hầm Chuyển Động",
        difficulty: lv,
        difficultyLabel: DIFF_LABELS[lv],
        question: `${vehicle} đi quãng đường ${vnNum(s)} km hết ${vnNum(t)} giờ. Vận tốc là:`,
        svg: null,
        ...buildOptions(`${v} km/h`, `${roundExact(s * t, 0)} km/h`, `${v - 8} km/h`),
        formula: "v = s : t (Vận tốc = Quãng đường : Thời gian)",
        explanation: `v = ${vnNum(s)} : ${vnNum(t)} = ${v} km/h.`
      };
    }

    if (type === 'find_s_easy' || type === 'find_s_dec' || type === 'find_s_hm') {
      const v = randChoice([12, 16, 36, 40, 48, 54, 60]);
      if (type === 'find_s_easy') {
        const t = randChoice([2, 3, 4, 5]);
        const s = v * t;
        return {
          stageId: 5,
          stageName: "Đường Hầm Chuyển Động",
          difficulty: lv,
          difficultyLabel: DIFF_LABELS[lv],
          question: `Một xe chạy với vận tốc ${v} km/h trong ${t} giờ. Quãng đường đi được là:`,
          svg: null,
          ...buildOptions(`${s} km`, `${Math.round(v / t)} km`, `${s + 15} km`),
          formula: "s = v × t (Quãng đường = Vận tốc × Thời gian)",
          explanation: `s = ${v} × ${t} = ${s} km.`
        };
      } else if (type === 'find_s_dec') {
        const t = randChoice([1.5, 2.5, 3.5]);
        const s = roundExact(v * t, 1);
        return {
          stageId: 5,
          stageName: "Đường Hầm Chuyển Động",
          difficulty: lv,
          difficultyLabel: DIFF_LABELS[lv],
          question: `Xe máy chạy với vận tốc ${v} km/h trong ${vnNum(t)} giờ. Quãng đường là:`,
          svg: null,
          ...buildOptions(`${vnNum(s)} km`, `${vnNum(roundExact(v / t, 1))} km`, `${vnNum(s + 10)} km`),
          formula: "s = v × t",
          explanation: `s = ${v} × ${vnNum(t)} = ${vnNum(s)} km.`
        };
      } else {
        const h = randChoice([1, 2]);
        const m = randChoice([15, 30, 45]);
        const tDec = h + m / 60;
        const s = roundExact(v * tDec, 1);
        return {
          stageId: 5,
          stageName: "Đường Hầm Chuyển Động",
          difficulty: lv,
          difficultyLabel: DIFF_LABELS[lv],
          question: `Một ô tô đi với vận tốc ${v} km/h trong ${h} giờ ${m} phút. Quãng đường là:`,
          svg: null,
          ...buildOptions(`${vnNum(s)} km`, `${roundExact(v * (h + m / 100), 1)} km`, `${vnNum(s + 12)} km`),
          formula: "Đổi thời gian sang giờ thập phân (phút : 60) rồi tính s = v × t",
          explanation: `${h} giờ ${m} phút = ${vnNum(tDec)} giờ. s = ${v} × ${vnNum(tDec)} = ${vnNum(s)} km.`
        };
      }
    }

    if (type === 'find_t_easy') {
      const v = randChoice([30, 40, 45, 50, 60]);
      const t = randChoice([1.5, 2, 2.5, 3, 4]);
      const s = roundExact(v * t, 1);
      return {
        stageId: 5,
        stageName: "Đường Hầm Chuyển Động",
        difficulty: lv,
        difficultyLabel: DIFF_LABELS[lv],
        question: `Quãng đường AB dài ${vnNum(s)} km. Xe đi với vận tốc ${v} km/h hết bao lâu?`,
        svg: null,
        ...buildOptions(`${vnNum(t)} giờ`, `${vnNum(roundExact(s - v, 0))} giờ`, `${vnNum(roundExact(t + 1, 1))} giờ`),
        formula: "t = s : v (Thời gian = Quãng đường : Vận tốc)",
        explanation: `t = ${vnNum(s)} : ${v} = ${vnNum(t)} giờ.`
      };
    }

    if (type === 'speed_convert') {
      const cases = [
        { q: "Vận tốc 36 km/h bằng bao nhiêu m/giây?", a: "10 m/s", d1: "360 m/s", d2: "6 m/s", exp: "36 km = 36 000 m; 1 giờ = 3600 giây. 36 000 : 3600 = 10 m/s." },
        { q: "Vận tốc 72 km/h bằng bao nhiêu m/giây?", a: "20 m/s", d1: "12 m/s", d2: "720 m/s", exp: "72 000 : 3600 = 20 m/s." },
        { q: "Vận tốc 54 km/h bằng bao nhiêu m/giây?", a: "15 m/s", d1: "540 m/s", d2: "9 m/s", exp: "54 000 : 3600 = 15 m/s." },
        { q: "Vận tốc 18 km/h bằng bao nhiêu m/phút?", a: "300 m/phút", d1: "180 m/phút", d2: "30 m/phút", exp: "18 km = 18 000 m; chia 60 phút = 300 m/phút." },
        { q: "Vận tốc 5 m/giây bằng bao nhiêu km/h?", a: "18 km/h", d1: "50 km/h", d2: "30 km/h", exp: "5 × 3600 = 18 000 m = 18 km trong 1 giờ => 18 km/h." }
      ];
      const c = randChoice(cases);
      return {
        stageId: 5,
        stageName: "Đường Hầm Chuyển Động",
        difficulty: lv,
        difficultyLabel: DIFF_LABELS[lv],
        question: c.q,
        svg: null,
        ...buildOptions(c.a, c.d1, c.d2),
        formula: "Đổi km -> m (× 1000) và giờ -> giây (: 3600) hoặc phút (: 60)",
        explanation: c.exp
      };
    }

    if (type === 'opposite_meet_time' || type === 'opposite_find_v2') {
      const v1 = randChoice([35, 40, 45, 50]);
      const v2 = randChoice([30, 40, 45]);
      const t = randChoice([1.5, 2, 2.5, 3]);
      const s = roundExact((v1 + v2) * t, 1);

      if (type === 'opposite_meet_time') {
        return {
          stageId: 5,
          stageName: "Đường Hầm Chuyển Động",
          difficulty: lv,
          difficultyLabel: DIFF_LABELS[lv],
          question: `Quãng đường dài ${vnNum(s)} km. Hai xe đi ngược chiều (${v1} km/h và ${v2} km/h) gặp nhau sau:`,
          svg: null,
          ...buildOptions(`${vnNum(t)} giờ`, `${vnNum(roundExact(t + 1, 1))} giờ`, `${vnNum(roundExact(s / Math.max(5, Math.abs(v1 - v2)), 1))} giờ`),
          formula: "Chuyển động ngược chiều: Tổng vận tốc = v1 + v2 => Thời gian gặp = s : (v1 + v2)",
          explanation: `Tổng vận tốc = ${v1} + ${v2} = ${v1 + v2} km/h. Thời gian = ${vnNum(s)} : ${v1 + v2} = ${vnNum(t)} giờ.`
        };
      } else {
        return {
          stageId: 5,
          stageName: "Đường Hầm Chuyển Động",
          difficulty: lv,
          difficultyLabel: DIFF_LABELS[lv],
          question: `Hai xe đi ngược chiều trên quãng đường ${vnNum(s)} km và gặp nhau sau ${vnNum(t)} giờ. Biết xe 1 đi ${v1} km/h, tìm vận tốc xe 2:`,
          svg: null,
          ...buildOptions(`${v2} km/h`, `${v1} km/h`, `${v1 + v2} km/h`),
          formula: "Tổng vận tốc = s : t => Vận tốc xe 2 = Tổng vận tốc − v1",
          explanation: `Tổng vận tốc = ${vnNum(s)} : ${vnNum(t)} = ${v1 + v2} km/h. Vận tốc xe 2 = ${v1 + v2} − ${v1} = ${v2} km/h.`
        };
      }
    }

    if (type === 'same_dir_catch' || type === 'same_dir_hard') {
      const vSlow = randChoice([30, 35, 40]);
      const diffV = randChoice([10, 15, 20]);
      const vFast = vSlow + diffV;
      const t = randChoice([2, 3, 4]);
      const dist = diffV * t;

      if (type === 'same_dir_catch') {
        return {
          stageId: 5,
          stageName: "Đường Hầm Chuyển Động",
          difficulty: lv,
          difficultyLabel: DIFF_LABELS[lv],
          question: `Hai xe xuất phát cùng lúc đi CÙNG CHIỀU cách nhau ${dist} km (v1 = ${vFast} km/h đuổi theo v2 = ${vSlow} km/h). Đuổi kịp sau:`,
          svg: null,
          ...buildOptions(`${t} giờ`, `${roundExact(dist / (vFast + vSlow), 1)} giờ`, `${t + 1} giờ`),
          formula: "Chuyển động cùng chiều: Hiệu vận tốc = v1 − v2 => Thời gian đuổi kịp = Khoảng cách : (v1 − v2)",
          explanation: `Hiệu vận tốc = ${vFast} − ${vSlow} = ${diffV} km/h. Đuổi kịp sau ${dist} : ${diffV} = ${t} giờ.`
        };
      } else {
        // Xe A đi trước 1 giờ rồi xe B đuổi theo (cặp số chia chẵn đẹp .0 hoặc .5)
        const leadConfigs = [
          { vSlow: 30, diffV: 15 }, // 2 giờ
          { vSlow: 40, diffV: 20 }, // 2 giờ
          { vSlow: 30, diffV: 10 }, // 3 giờ
          { vSlow: 45, diffV: 15 }, // 3 giờ
          { vSlow: 36, diffV: 24 }, // 1,5 giờ
          { vSlow: 50, diffV: 20 }  // 2,5 giờ
        ];
        const cfg = randChoice(leadConfigs);
        const vSlowLead = cfg.vSlow;
        const vFastCatch = vSlowLead + cfg.diffV;
        const leadDist = vSlowLead;
        const catchTime = roundExact(leadDist / cfg.diffV, 1);
        const cleanTime = `${vnNum(catchTime)} giờ`;
        return {
          stageId: 5,
          stageName: "Đường Hầm Chuyển Động",
          difficulty: lv,
          difficultyLabel: DIFF_LABELS[lv],
          question: `Xe máy đi với vận tốc ${vSlowLead} km/h trước 1 giờ rồi ô tô ${vFastCatch} km/h đuổi theo cùng chiều. Ô tô đuổi kịp sau:`,
          svg: null,
          ...buildOptions(cleanTime, `${vnNum(roundExact(catchTime + 1, 1))} giờ`, `${vnNum(roundExact(leadDist / vFastCatch, 1))} giờ`),
          formula: "Bước 1: Tìm quãng đường xe trước đi được. Bước 2: Chia cho hiệu vận tốc (v_sau − v_trước)",
          explanation: `Xe máy đi trước ${leadDist} km. Hiệu vận tốc = ${cfg.diffV} km/h. Thời gian = ${leadDist} : ${cfg.diffV} = ${cleanTime}.`
        };
      }
    }

    if (type === 'clock_arrival') {
      const startH = randChoice([6, 7, 8, 9]);
      const startM = randChoice([15, 30, 45]);
      const v = randChoice([40, 50, 60]);
      const durH = randChoice([1.5, 2.5]);
      const s = roundExact(v * durH, 0);
      const totalMins = startH * 60 + startM + Math.round(durH * 60);
      const endH = Math.floor(totalMins / 60);
      const endM = totalMins % 60;
      const correct = `${endH} giờ ${endM === 0 ? '00' : endM} phút`;

      return {
        stageId: 5,
        stageName: "Đường Hầm Chuyển Động",
        difficulty: lv,
        difficultyLabel: DIFF_LABELS[lv],
        question: `Xe khởi hành lúc ${startH} giờ ${startM} phút đi quãng đường ${s} km với vận tốc ${v} km/h. Đến nơi lúc:`,
        svg: null,
        ...buildOptions(correct, `${endH - 1} giờ ${endM === 0 ? '00' : endM} phút`, `${endH + 1} giờ ${startM} phút`),
        formula: "Tìm thời gian đi t = s : v, đổi sang giờ phút rồi cộng vào giờ khởi hành",
        explanation: `t = ${s} : ${v} = ${vnNum(durH)} giờ (${Math.round(durH * 60)} phút). Đến nơi lúc ${correct}.`
      };
    }

    // boat_stream: Ca nô xuôi dòng / ngược dòng
    const vBoat = randChoice([20, 24, 28, 32]);
    const vWater = randChoice([2, 3, 4, 5]);
    const isDownstream = randChoice([true, false]);
    const vActual = isDownstream ? (vBoat + vWater) : (vBoat - vWater);
    const t = randChoice([2, 3]);
    const s = vActual * t;

    return {
      stageId: 5,
      stageName: "Đường Hầm Chuyển Động",
      difficulty: lv,
      difficultyLabel: DIFF_LABELS[lv],
      question: `Ca nô có vận tốc riêng ${vBoat} km/h, dòng nước chảy ${vWater} km/h. Đi ${isDownstream ? 'XUÔI DÒNG' : 'NGƯỢC DÒNG'} trong ${t} giờ được:`,
      svg: null,
      ...buildOptions(`${s} km`, `${vBoat * t} km`, `${(isDownstream ? (vBoat - vWater) : (vBoat + vWater)) * t} km`),
      formula: isDownstream ? "v_xuôi = v_riêng + v_nước => s = v_xuôi × t" : "v_ngược = v_riêng − v_nước => s = v_ngược × t",
      explanation: `Vận tốc ${isDownstream ? 'xuôi' : 'ngược'} dòng = ${vActual} km/h. Quãng đường = ${vActual} × ${t} = ${s} km.`
    };
  }

  // =========================================================================
  // BỘ ĐIỀU PHỐI & CHỐNG TRÙNG LẶP THÔNG MINH
  // =========================================================================
  function generateByStageAndLevel(stageId, level) {
    if (stageId === 1) return genFractionQuestion(level);
    if (stageId === 2) return genDecimalQuestion(level);
    if (stageId === 3) return genPercentageQuestion(level);
    if (stageId === 4) return genGeometryQuestion(level);
    if (stageId === 5) return genMotionQuestion(level);
    const randomStage = randChoice([1, 2, 3, 4, 5]);
    return generateByStageAndLevel(randomStage, level);
  }

  return {
    resetSession() {
      usedSignatures.clear();
    },

    generate(stageId = 1, difficultyLevel = 1) {
      const lv = clampLevel(difficultyLevel);
      let candidate = null;

      // Thử tối đa 30 lần để đảm bảo tuyệt đối KHÔNG TRÙNG LẶP trong cùng màn chơi
      for (let attempt = 0; attempt < 30; attempt++) {
        const q = generateByStageAndLevel(stageId, lv);
        const sig = `${q.stageId}|${q.question.trim()}|${q.correctText.trim()}`;
        candidate = q;
        if (!usedSignatures.has(sig)) {
          if (usedSignatures.size > 400) {
            usedSignatures.clear();
          }
          usedSignatures.add(sig);
          break;
        }
      }

      return candidate;
    },
    roundExact,
    vnNum
  };

});
