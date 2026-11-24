/**
 * ============================================================================
 * ĐẢO KHO BÁU TOÁN 5 - TRÌNH ĐIỀU HÀNH GAME CHÍNH (GAME ENGINE)
 * Quản lý vòng đời trò chơi, chuyển màn hình, lưu trữ tiến độ, tính điểm,
 * chuỗi combo, đấu Boss, chế độ tốc độ 60s và hệ thống huy hiệu danh giá.
 * ============================================================================
 */

class MathTreasureGame {
  constructor() {
    this.storageKey = 'daoKhoBauToan5_save_v2';
    this.state = this.loadState();

    // Biến tạm trong lượt chơi hiện tại
    this.currentLandId = 1;
    this.currentStageId = 1;
    this.isBossStage = false;
    this.currentQuestionIndex = 0; // 0 -> 9 (10 câu mỗi màn)
    this.totalQuestions = 10;
    this.hearts = 3;
    this.score = 0;
    this.combo = 0;
    this.maxComboInStage = 0;
    this.currentQuestion = null;
    this.isAnswerLocked = false;
    this.bossMaxHP = 5;
    this.bossCurrentHP = 5;

    // Chế độ tốc độ 60s
    this.speedTimer = null;
    this.speedTimeLeft = 60;
    this.speedScore = 0;
    this.speedCorrectCount = 0;
    this.speedCurrentQuestion = null;

    // Danh sách 5 vùng đất chuẩn GDPT 2018
    this.landsConfig = [
      {
        id: 1,
        name: "Rừng Phân Số",
        tagline: "Vùng đất bí ẩn của những nhát chia đều",
        icon: "🌲",
        bossName: "Vua Khỉ Rừng Rậm",
        bossIcon: "🐒",
        colorClass: "from-emerald-500 to-teal-600",
        borderClass: "border-emerald-600",
        stages: [
          { id: 1, name: "Rút gọn & Tối giản phân số", desc: "Tìm ước chung và đưa phân số về tối giản" },
          { id: 2, name: "So sánh phân số & Quy đồng", desc: "So sánh cùng mẫu, cùng tử và so sánh với 1" },
          { id: 3, name: "Khám phá Hỗn số", desc: "Chuyển đổi hỗn số và phân số thập phân" },
          { id: 4, name: "Bốn phép tính phân số", desc: "Cộng, trừ, nhân, chia và bài toán tìm x" },
          { id: 5, name: "Đấu Boss: Vua Khỉ Rừng Rậm", isBoss: true, desc: "Tính thuận tiện và giải toán lời văn phân số" }
        ]
      },
      {
        id: 2,
        name: "Đảo Số Thập Phân",
        tagline: "Đại dương của các hàng thập phân kì diệu",
        icon: "🏝️",
        bossName: "Bạch Tuộc Khổng Lồ",
        bossIcon: "🐙",
        colorClass: "from-sky-500 to-blue-600",
        borderClass: "border-sky-600",
        stages: [
          { id: 1, name: "Đọc, viết & So sánh thập phân", desc: "Nhận biết hàng phần mười, trăm, nghìn" },
          { id: 2, name: "Phép cộng & trừ số thập phân", desc: "Đặt tính thẳng cột dấu phẩy chuẩn xác" },
          { id: 3, name: "Phép nhân số thập phân", desc: "Nhân nhẩm 10, 100, 0,1, 0,01 và nhân 2 số thập phân" },
          { id: 4, name: "Phép chia số thập phân", desc: "Chia cho số tự nhiên và chia cho số thập phân" },
          { id: 5, name: "Đấu Boss: Bạch Tuộc Khổng Lồ", isBoss: true, desc: "Tính nhanh biểu thức số thập phân phức tạp" }
        ]
      },
      {
        id: 3,
        name: "Vịnh Phần Trăm",
        tagline: "Thương cảng nhộn nhịp của tỉ số và mua sắm",
        icon: "⚓",
        bossName: "Hải Tặc Râu Đen",
        bossIcon: "🏴‍☠️",
        colorClass: "from-amber-500 to-orange-600",
        borderClass: "border-amber-600",
        stages: [
          { id: 1, name: "Tìm tỉ số phần trăm 2 số", desc: "Chuyển thương sang tỉ số phần trăm %" },
          { id: 2, name: "Tìm giá trị % của một số", desc: "Tính toán lượng phần trăm trong thực tế" },
          { id: 3, name: "Tìm số khi biết giá trị %", desc: "Bài toán ngược tìm tổng thể ban đầu" },
          { id: 4, name: "Toán giảm giá & Tiết kiệm", desc: "Tính tiền khuyến mãi, giá sau giảm" },
          { id: 5, name: "Đấu Boss: Hải Tặc Râu Đen", isBoss: true, desc: "Bẫy giảm giá liên tiếp của Râu Đen" }
        ]
      },
      {
        id: 4,
        name: "Thành Cổ Hình Học & Đo Lường",
        tagline: "Kỳ quan của những hình khối và không gian",
        icon: "🏰",
        bossName: "Người Đá Cổ Đại",
        bossIcon: "🗿",
        colorClass: "from-purple-500 to-indigo-600",
        borderClass: "border-purple-600",
        stages: [
          { id: 1, name: "Đổi đơn vị diện tích & thể tích", desc: "Bảng m², ha, m³, dm³, lít và cm³" },
          { id: 2, name: "Diện tích Tam giác & Hình thang", desc: "Quan sát hình vẽ SVG và tính diện tích" },
          { id: 3, name: "Chu vi & Diện tích Hình tròn", desc: "Ứng dụng số Pi (3,14) với bán kính, đường kính" },
          { id: 4, name: "Hình hộp chữ nhật & Lập phương", desc: "Diện tích xung quanh, toàn phần và thể tích" },
          { id: 5, name: "Đấu Boss: Người Đá Cổ Đại", isBoss: true, desc: "Bài toán thực tế bể cá không nắp và đổ nước" }
        ]
      },
      {
        id: 5,
        name: "Đỉnh Cao Chuyển Động",
        tagline: "Đỉnh núi mây ngàn của tốc độ và thời gian",
        icon: "⛰️",
        bossName: "Rồng Thần Bão Tố",
        bossIcon: "🐉",
        colorClass: "from-rose-500 to-red-600",
        borderClass: "border-rose-600",
        stages: [
          { id: 1, name: "Vận tốc chuyển động đều", desc: "Công thức v = s : t và đơn vị km/h, m/s" },
          { id: 2, name: "Quãng đường & Thời gian", desc: "Đổi số đo thời gian phút sang số thập phân" },
          { id: 3, name: "Hai vật đi ngược chiều", desc: "Tính thời gian và địa điểm hai xe gặp nhau" },
          { id: 4, name: "Hai vật đi cùng chiều", desc: "Bài toán xe sau đuổi kịp xe trước" },
          { id: 5, name: "Đấu Boss: Rồng Thần Bão Tố", isBoss: true, desc: "Chuyển động trên dòng nước (xuôi dòng, ngược dòng)" }
        ]
      }
    ];

    // Hệ thống huy hiệu
    this.badgesConfig = [
      { id: 'first_blood', name: 'Thủy Thủ Tân Binh', icon: '⚓', desc: 'Hoàn thành câu hỏi đầu tiên' },
      { id: 'combo_master', name: 'Tia Chớp Tính Nhẩm', icon: '⚡', desc: 'Đạt chuỗi combo 5 câu đúng liên tiếp' },
      { id: 'flawless', name: 'Chiến Binh Bất Bại', icon: '🛡️', desc: 'Vượt qua một màn với 3 tim nguyên vẹn' },
      { id: 'boss_1', name: 'Khuất Phục Vua Khỉ', icon: '🐒', desc: 'Hạ gục Boss Rừng Phân Số' },
      { id: 'boss_2', name: 'Đánh Bại Bạch Tuộc', icon: '🐙', desc: 'Hạ gục Boss Đảo Số Thập Phân' },
      { id: 'boss_3', name: 'Trừng Trị Râu Đen', icon: '🏴‍☠️', desc: 'Hạ gục Boss Vịnh Phần Trăm' },
      { id: 'boss_4', name: 'Thức Tỉnh Người Đá', icon: '🗿', desc: 'Hạ gục Boss Thành Cổ Hình Học' },
      { id: 'boss_5', name: 'Chúa Tể Bão Tố', icon: '🐉', desc: 'Hạ gục Rồng Thần Đỉnh Cao Chuyển Động' },
      { id: 'speed_runner', name: 'Kỷ Lục Gia 60 Giây', icon: '⏱️', desc: 'Đạt từ 15 câu đúng trong Đấu Tốc Độ' },
      { id: 'master_island', name: 'Vua Đảo Kho Báu', icon: '👑', desc: 'Thu thập đủ 50 ngôi sao trên đảo' }
    ];
  }

  // Khởi tạo trạng thái mặc định hoặc đọc từ localStorage
  loadState() {
    const defaultData = {
      stars: 0,
      totalScore: 0,
      unlockedLands: [1], // Mở khóa vùng 1 ban đầu
      stagesProgress: {
        // "1-1": { stars: 3, completed: true, highScore: 100 }
      },
      badges: [],
      speedHighScore: 0
    };

    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        return Object.assign(defaultData, JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Lỗi đọc localStorage:", e);
    }
    return defaultData;
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
      this.updateHeaderStats();
    } catch (e) {
      console.warn("Lỗi lưu localStorage:", e);
    }
  }

  // Khởi động giao diện
  init() {
    this.updateHeaderStats();
    this.renderWorldMap();
    this.setupGlobalEvents();
    this.checkTotalStars();
  }

  updateHeaderStats() {
    const starEl = document.getElementById('header-stars');
    const scoreEl = document.getElementById('header-score');
    if (starEl) starEl.textContent = this.state.stars;
    if (scoreEl) scoreEl.textContent = this.state.totalScore.toLocaleString('vi-VN');
  }

  // ===================== ĐIỀU HƯỚNG MÀN HÌNH =====================

  showScreen(screenId) {
    const screens = [
      'screen-world-map',
      'screen-stage-select',
      'screen-quiz',
      'screen-speed',
      'screen-badges'
    ];

    screens.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        if (id === screenId) el.classList.remove('hidden');
        else el.classList.add('hidden');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.soundEngine) window.soundEngine.playClick();
  }

  // 1. Render Bản đồ 5 Vùng đất
  renderWorldMap() {
    const container = document.getElementById('world-map-container');
    if (!container) return;

    let html = '';
    this.landsConfig.forEach(land => {
      const isUnlocked = this.state.unlockedLands.includes(land.id);
      
      // Tính sao trong vùng này
      let landStars = 0;
      let completedStages = 0;
      land.stages.forEach(st => {
        const key = `${land.id}-${st.id}`;
        if (this.state.stagesProgress[key]) {
          landStars += this.state.stagesProgress[key].stars || 0;
          if (this.state.stagesProgress[key].completed) completedStages++;
        }
      });

      const maxStars = land.stages.length * 3;

      html += `
      <div class="island-card bg-white rounded-3xl p-6 border-4 ${isUnlocked ? land.borderClass : 'border-slate-300 opacity-80'} relative overflow-hidden flex flex-col justify-between">
        <!-- Huy hiệu số sao & Tiến độ góc trên -->
        <div class="flex items-center justify-between mb-4">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300">
            <span>⭐</span> ${landStars} / ${maxStars} Sao
          </span>
          <span class="text-xs font-black ${isUnlocked ? 'text-slate-600' : 'text-slate-400'}">
            Màn: ${completedStages} / ${land.stages.length}
          </span>
        </div>

        <!-- Biểu tượng Vùng đất và Tên -->
        <div class="flex items-start gap-4 mb-4">
          <div class="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center text-4xl bg-gradient-to-br ${land.colorClass} shadow-md text-white border-2 border-white/60">
            ${land.icon}
          </div>
          <div>
            <h3 class="text-xl font-black text-slate-800">${land.name}</h3>
            <p class="text-xs text-slate-500 font-bold mt-0.5">${land.tagline}</p>
            <div class="mt-2 inline-flex items-center gap-1 text-xs font-extrabold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200">
              <span>${land.bossIcon}</span> Boss: ${land.bossName}
            </div>
          </div>
        </div>

        <!-- Thanh tiến trình của vùng -->
        <div class="w-full bg-slate-100 rounded-full h-3 border border-slate-200 overflow-hidden mb-5">
          <div class="h-full bg-gradient-to-r ${land.colorClass} progress-bar-inner" style="width: ${(completedStages / land.stages.length) * 100}%"></div>
        </div>

        <!-- Nút hành động -->
        <div>
          ${isUnlocked ? `
            <button onclick="game.openLand(${land.id})" class="w-full py-3 rounded-2xl font-black text-base btn-3d btn-3d-green shadow-sm flex items-center justify-center gap-2">
              <span>Khám phá ngay</span> <span>➔</span>
            </button>
          ` : `
            <button disabled class="w-full py-3 rounded-2xl font-black text-sm bg-slate-200 text-slate-400 border-b-4 border-slate-300 cursor-not-allowed flex items-center justify-center gap-2">
              <span>🔒 Cần hoàn thành vùng trước</span>
            </button>
          `}
        </div>
      </div>
      `;
    });

    container.innerHTML = html;
  }

  // 2. Mở vùng đất -> Hiển thị danh sách màn chơi
  openLand(landId) {
    this.currentLandId = landId;
    const land = this.landsConfig.find(l => l.id === landId);
    if (!land) return;

    const titleEl = document.getElementById('stage-select-title');
    const descEl = document.getElementById('stage-select-desc');
    const container = document.getElementById('stages-list-container');

    if (titleEl) titleEl.innerHTML = `<span class="mr-2">${land.icon}</span>${land.name}`;
    if (descEl) descEl.textContent = land.tagline;

    let html = '';
    land.stages.forEach((st, idx) => {
      const key = `${landId}-${st.id}`;
      const prog = this.state.stagesProgress[key];
      const stars = prog ? prog.stars : 0;
      const isCompleted = prog ? prog.completed : false;

      // Màn 1 luôn mở; màn sau mở khi màn trước đã hoàn thành
      const prevKey = `${landId}-${st.id - 1}`;
      const isStageUnlocked = (st.id === 1) || (this.state.stagesProgress[prevKey] && this.state.stagesProgress[prevKey].completed);

      html += `
      <div class="bg-white rounded-2xl p-5 border-3 ${st.isBoss ? 'border-rose-400 bg-rose-50/50' : (isStageUnlocked ? 'border-slate-200 hover:border-sky-300' : 'border-slate-200 opacity-60')} shadow-sm transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div class="flex items-center gap-3.5">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black ${st.isBoss ? 'bg-rose-500 text-white animate-boss-glow' : (isCompleted ? 'bg-emerald-500 text-white' : 'bg-sky-500 text-white')} shadow">
            ${st.isBoss ? land.bossIcon : `0${st.id}`}
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h4 class="font-black text-slate-800 text-base md:text-lg">${st.name}</h4>
              ${st.isBoss ? '<span class="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">ĐẤU BOSS</span>' : ''}
            </div>
            <p class="text-xs text-slate-500 font-bold mt-0.5">${st.desc}</p>
          </div>
        </div>

        <div class="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <!-- Hiển thị sao đã đạt -->
          <div class="flex items-center gap-1 text-base">
            <span class="${stars >= 1 ? 'text-amber-400' : 'text-slate-300'}">⭐</span>
            <span class="${stars >= 2 ? 'text-amber-400' : 'text-slate-300'}">⭐</span>
            <span class="${stars >= 3 ? 'text-amber-400' : 'text-slate-300'}">⭐</span>
          </div>

          <!-- Nút chơi -->
          ${isStageUnlocked ? `
            <button onclick="game.startStage(${landId}, ${st.id})" class="px-5 py-2.5 rounded-xl font-black text-sm btn-3d ${st.isBoss ? 'btn-3d-rose' : 'btn-3d-blue'} shadow">
              ${isCompleted ? 'Chơi lại' : 'Bắt đầu'}
            </button>
          ` : `
            <button disabled class="px-5 py-2.5 rounded-xl font-black text-sm bg-slate-200 text-slate-400 border-b-4 border-slate-300 cursor-not-allowed">
              🔒 Đang khóa
            </button>
          `}
        </div>
      </div>
      `;
    });

    if (container) container.innerHTML = html;
    this.showScreen('screen-stage-select');
  }

  // ===================== VÒNG LẶP CHƠI (STAGE GAMEPLAY) =====================

  startStage(landId, stageId) {
    this.currentLandId = landId;
    this.currentStageId = stageId;
    const land = this.landsConfig.find(l => l.id === landId);
    const stage = land.stages.find(s => s.id === stageId);
    this.isBossStage = !!stage.isBoss;

    this.hearts = 3;
    this.score = 0;
    this.combo = 0;
    this.maxComboInStage = 0;
    this.currentQuestionIndex = 0;
    this.totalQuestions = this.isBossStage ? 5 : 10;
    this.bossMaxHP = 5;
    this.bossCurrentHP = 5;

    // Cập nhật tên màn hình
    const bannerEl = document.getElementById('quiz-stage-title');
    if (bannerEl) {
      bannerEl.innerHTML = `<span class="mr-1.5">${land.icon}</span>${land.name} - ${stage.name}`;
    }

    // Hiển thị hoặc ẩn thanh máu Boss
    const bossBar = document.getElementById('boss-health-container');
    if (bossBar) {
      if (this.isBossStage) {
        bossBar.classList.remove('hidden');
        document.getElementById('boss-name-label').textContent = land.bossName;
        document.getElementById('boss-icon-avatar').textContent = land.bossIcon;
        this.updateBossHPUI();
        if (window.soundEngine) window.soundEngine.playBossRoar();
      } else {
        bossBar.classList.add('hidden');
      }
    }

    this.updateHeartsUI();
    this.updateComboUI();
    this.showScreen('screen-quiz');
    this.setMascotExpression('idle', 'Chào bạn! Cùng vượt qua thử thách này nhé!');
    this.loadNextQuestion();
  }

  loadNextQuestion() {
    this.isAnswerLocked = false;
    this.currentQuestionIndex++;

    // Cập nhật thanh tiến trình
    const progressPct = ((this.currentQuestionIndex - 1) / this.totalQuestions) * 100;
    const progInner = document.getElementById('quiz-progress-fill');
    const progText = document.getElementById('quiz-progress-text');
    if (progInner) progInner.style.width = `${progressPct}%`;
    if (progText) progText.textContent = `Câu ${this.currentQuestionIndex} / ${this.totalQuestions}`;

    // Sinh câu hỏi từ MathGenerator
    this.currentQuestion = window.MathGenerator.generateQuestion(
      this.currentLandId,
      this.currentStageId,
      this.currentQuestionIndex
    );

    this.renderQuestionUI();
  }

  renderQuestionUI() {
    const qBox = document.getElementById('quiz-question-box');
    const answerContainer = document.getElementById('quiz-answer-container');
    const nextBtnContainer = document.getElementById('quiz-next-btn-container');

    if (!qBox || !answerContainer) return;
    if (nextBtnContainer) nextBtnContainer.classList.add('hidden');

    // Render nội dung câu hỏi và hình SVG nếu có
    let qHTML = `
      <div class="text-base sm:text-lg md:text-xl font-black text-slate-800 leading-relaxed">
        ${this.currentQuestion.question}
      </div>
    `;

    if (this.currentQuestion.svg) {
      qHTML += this.currentQuestion.svg;
    }

    if (this.currentQuestion.subText) {
      qHTML += `<div class="mt-2 text-xs md:text-sm font-bold text-sky-700 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200 inline-block">${this.currentQuestion.subText}</div>`;
    }

    qBox.innerHTML = qHTML;

    // Render khu vực đáp án (Trắc nghiệm hoặc Tự điền)
    if (this.currentQuestion.type === 'choice') {
      let optionsHTML = '<div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">';
      this.currentQuestion.options.forEach((opt, idx) => {
        const letters = ['A', 'B', 'C', 'D'];
        optionsHTML += `
          <button onclick="game.handleChoiceAnswer(this, '${encodeURIComponent(opt)}')" class="quiz-option-btn w-full p-4 rounded-2xl bg-white font-black text-base text-slate-800 text-left flex items-center gap-3">
            <span class="w-8 h-8 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center text-sm font-black text-slate-600 flex-shrink-0">
              ${letters[idx] || (idx + 1)}
            </span>
            <span class="flex-grow">${opt}</span>
          </button>
        `;
      });
      optionsHTML += '</div>';
      answerContainer.innerHTML = optionsHTML;
    } else {
      // Tự điền đáp số
      answerContainer.innerHTML = `
        <div class="bg-white p-5 rounded-2xl border-3 border-sky-300 shadow-sm max-w-md mx-auto space-y-3">
          <label class="block text-xs font-black text-slate-600 uppercase">Nhập đáp số của bạn:</label>
          <div class="flex items-center gap-2">
            <input type="text" id="quiz-input-field" placeholder="Ví dụ: 12,5 hoặc 3/4" 
                   onkeydown="if(event.key==='Enter') game.handleInputAnswer()"
                   class="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-sky-500 focus:outline-none font-black text-xl text-slate-800 text-center tracking-wider font-mono">
            <button onclick="game.handleInputAnswer()" class="px-6 py-3 rounded-xl font-black text-base btn-3d btn-3d-green shadow-sm whitespace-nowrap">
              Gửi 🚀
            </button>
          </div>
          <p class="text-[11px] text-slate-400 text-center font-bold">Chấp nhận cả dấu phẩy (,) và dấu chấm (.)</p>
        </div>
      `;
      // Tự động focus ô nhập
      setTimeout(() => {
        const inp = document.getElementById('quiz-input-field');
        if (inp) inp.focus();
      }, 100);
    }

    // Tự động render chuẩn định dạng toán học KaTeX nếu có
    this.renderMath(qBox);
    this.renderMath(answerContainer);
  }

  // Tiện ích render chuẩn font toán học KaTeX
  renderMath(element) {
    if (!element) return;
    if (typeof renderMathInElement === 'function') {
      try {
        renderMathInElement(element, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\(', right: '\\)', display: false },
            { left: '\\[', right: '\\]', display: true }
          ],
          throwOnError: false
        });
      } catch (e) {
        console.warn("KaTeX render error:", e);
      }
    }
  }

  // Xử lý câu trả lời trắc nghiệm
  handleChoiceAnswer(btnElement, encodedOpt) {
    if (this.isAnswerLocked) return;
    this.isAnswerLocked = true;
    const chosen = decodeURIComponent(encodedOpt);
    const correct = this.currentQuestion.correctAnswer;
    const isCorrect = (chosen === correct);

    // Đổi màu nút
    if (isCorrect) {
      btnElement.classList.add('selected-correct');
      this.processAnswerResult(true);
    } else {
      btnElement.classList.add('selected-wrong');
      // Highlight nút đúng
      document.querySelectorAll('.quiz-option-btn').forEach(btn => {
        if (btn.innerHTML.includes(correct)) {
          btn.classList.add('selected-correct');
        }
      });
      this.processAnswerResult(false);
    }
  }

  // Xử lý câu tự điền đáp số
  handleInputAnswer() {
    if (this.isAnswerLocked) return;
    const inp = document.getElementById('quiz-input-field');
    if (!inp) return;
    const userVal = inp.value.trim();
    if (!userVal) {
      alert("Bạn ơi, hãy nhập đáp số trước khi bấm gửi nhé!");
      return;
    }

    this.isAnswerLocked = true;
    const isCorrect = window.MathGenerator.checkAnswerEqual(
      userVal,
      this.currentQuestion.correctAnswer,
      this.currentQuestion.acceptableAnswers
    );

    inp.disabled = true;
    if (isCorrect) {
      inp.classList.add('bg-green-100', 'border-green-500', 'text-green-800');
    } else {
      inp.classList.add('bg-red-100', 'border-red-500', 'text-red-800');
    }

    this.processAnswerResult(isCorrect);
  }

  // Xử lý kết quả trả lời (Đúng hoặc Sai)
  processAnswerResult(isCorrect) {
    if (isCorrect) {
      // 1. TĂNG ĐIỂM & COMBO
      this.combo++;
      if (this.combo > this.maxComboInStage) this.maxComboInStage = this.combo;

      let multiplier = 1;
      if (this.combo >= 5) multiplier = 3;
      else if (this.combo >= 3) multiplier = 2;
      else if (this.combo >= 2) multiplier = 1.5;

      const earned = Math.round(10 * multiplier);
      this.score += earned;
      this.state.totalScore += earned;

      // Âm thanh
      if (this.combo >= 2) {
        if (window.soundEngine) window.soundEngine.playCombo(this.combo);
      } else {
        if (window.soundEngine) window.soundEngine.playCorrect();
      }

      // Pháo giấy nhỏ chúc mừng
      if (window.confetti && this.combo >= 2) {
        window.confetti({
          particleCount: 25 * Math.min(this.combo, 4),
          spread: 50,
          origin: { y: 0.75 }
        });
      }

      // Giảm máu Boss nếu đang đấu Boss
      if (this.isBossStage) {
        this.bossCurrentHP = Math.max(0, this.bossCurrentHP - 1);
        this.updateBossHPUI();
        if (window.soundEngine) window.soundEngine.playBossHit();
      }

      // Mascot biểu cảm
      this.setMascotExpression('cheering', `Tuyệt đỉnh! Chuỗi x${this.combo} xuất sắc!`);
      this.updateComboUI();
      this.updateHeaderStats();

      // Kiểm tra huy hiệu
      this.unlockBadge('first_blood');
      if (this.combo >= 5) this.unlockBadge('combo_master');

      // Tự động chuyển câu sau 1,2 giây nếu không có giải thích cần đọc
      setTimeout(() => {
        this.checkNextStep();
      }, 1200);

    } else {
      // 2. TRẢ LỜI SAI: MẤT 1 TIM, RESET COMBO
      this.hearts--;
      this.combo = 0;
      this.updateHeartsUI();
      this.updateComboUI();

      if (window.soundEngine) window.soundEngine.playWrong();
      this.setMascotExpression('sad', 'Đừng nản lòng nhé! Xem lời giải bên dưới để rút kinh nghiệm nào!');

      // Hiệu ứng rung câu hỏi
      const box = document.getElementById('quiz-question-box');
      if (box) {
        box.classList.add('animate-shake');
        setTimeout(() => box.classList.remove('animate-shake'), 400);
      }

      // Hiển thị ngay lời giải thích chi tiết
      this.showInstantExplanation();
    }
  }

  showInstantExplanation() {
    const modal = document.getElementById('explanation-modal');
    const content = document.getElementById('explanation-content');
    if (!modal || !content) return;

    let ansDisplay = this.currentQuestion.correctAnswer;
    if (this.currentQuestion.type === 'input') {
      ansDisplay = `<span class="text-emerald-700 font-black">${this.currentQuestion.correctAnswer}</span>`;
    }

    content.innerHTML = `
      <div class="space-y-4">
        <div class="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300">
          <div class="text-xs font-black text-emerald-800 uppercase">Đáp án chính xác:</div>
          <div class="text-lg font-black text-emerald-900 mt-1">${ansDisplay}</div>
        </div>

        ${this.currentQuestion.formula ? `
          <div class="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300">
            <div class="text-xs font-black text-amber-800 uppercase flex items-center gap-1.5">
              <span>💡</span> CÔNG THỨC GHI NHỚ:
            </div>
            <div class="text-sm font-black text-amber-900 mt-1 font-mono">${this.currentQuestion.formula}</div>
          </div>
        ` : ''}

        <div class="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200">
          <div class="text-xs font-black text-slate-700 uppercase flex items-center gap-1.5">
            <span>📝</span> CÁC BƯỚC GIẢI CHI TIẾT:
          </div>
          <div class="text-sm font-bold text-slate-800 mt-2 leading-relaxed">${this.currentQuestion.explanation}</div>
        </div>
      </div>
    `;

    this.renderMath(content);
    modal.classList.remove('hidden');
  }

  closeExplanationAndContinue() {
    const modal = document.getElementById('explanation-modal');
    if (modal) modal.classList.add('hidden');
    this.checkNextStep();
  }

  // Kiểm tra chuyển câu hoặc kết thúc màn chơi
  checkNextStep() {
    if (this.hearts <= 0) {
      // Hết tim -> Game Over
      this.handleGameOver();
      return;
    }

    // Nếu đang đấu Boss và đã hết máu Boss
    if (this.isBossStage && this.bossCurrentHP <= 0) {
      this.handleStageVictory();
      return;
    }

    // Nếu hết số câu
    if (this.currentQuestionIndex >= this.totalQuestions) {
      this.handleStageVictory();
      return;
    }

    // Chuyển sang câu tiếp theo
    this.loadNextQuestion();
  }

  // ===================== KẾT THÚC MÀN CHƠI =====================

  handleStageVictory() {
    if (window.soundEngine) window.soundEngine.playLevelUp();

    // Tính sao dựa trên số tim còn lại
    let earnedStars = this.hearts; // 3 tim = 3 sao, 2 tim = 2 sao, 1 tim = 1 sao
    if (earnedStars <= 0) earnedStars = 1;

    const key = `${this.currentLandId}-${this.currentStageId}`;
    const oldProg = this.state.stagesProgress[key] || { stars: 0, completed: false, highScore: 0 };

    // Tăng số sao tích lũy nếu đạt kỷ lục sao mới
    if (earnedStars > oldProg.stars) {
      this.state.stars += (earnedStars - oldProg.stars);
    }

    this.state.stagesProgress[key] = {
      stars: Math.max(earnedStars, oldProg.stars),
      completed: true,
      highScore: Math.max(this.score, oldProg.highScore || 0)
    };

    // Nếu vừa đánh bại Boss, mở khóa vùng tiếp theo
    if (this.isBossStage) {
      const nextLandId = this.currentLandId + 1;
      if (nextLandId <= 5 && !this.state.unlockedLands.includes(nextLandId)) {
        this.state.unlockedLands.push(nextLandId);
      }
      this.unlockBadge(`boss_${this.currentLandId}`);
      if (window.soundEngine) window.soundEngine.playVictory();
    }

    // Kiểm tra huy hiệu không mất máu
    if (this.hearts === 3) this.unlockBadge('flawless');

    this.saveState();

    // Hiển thị màn hình chiến thắng
    this.showVictoryModal(earnedStars);
  }

  showVictoryModal(stars) {
    const modal = document.getElementById('victory-modal');
    if (!modal) return;

    document.getElementById('victory-score').textContent = `+${this.score} điểm`;
    document.getElementById('victory-max-combo').textContent = `Chuỗi x${this.maxComboInStage}`;

    // Render sao
    let starsHTML = '';
    for (let i = 1; i <= 3; i++) {
      starsHTML += `<span class="text-4xl sm:text-5xl ${i <= stars ? 'text-amber-400 animate-bounce' : 'text-slate-300'}">⭐</span>`;
    }
    document.getElementById('victory-stars-box').innerHTML = starsHTML;

    modal.classList.remove('hidden');

    // Bắn pháo giấy hoành tráng
    if (window.confetti) {
      window.confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        window.confetti({
          particleCount: 80,
          angle: 60,
          spread: 60,
          origin: { x: 0 }
        });
        window.confetti({
          particleCount: 80,
          angle: 120,
          spread: 60,
          origin: { x: 1 }
        });
      }, 350);
    }
  }

  handleGameOver() {
    if (window.soundEngine) window.soundEngine.playGameOver();
    const modal = document.getElementById('gameover-modal');
    if (modal) modal.classList.remove('hidden');
    this.setMascotExpression('sad', 'Hết tim rồi! Hãy nghỉ ngơi một chút rồi thử lại nhé!');
  }

  retryCurrentStage() {
    const gModal = document.getElementById('gameover-modal');
    const vModal = document.getElementById('victory-modal');
    if (gModal) gModal.classList.add('hidden');
    if (vModal) vModal.classList.add('hidden');

    this.startStage(this.currentLandId, this.currentStageId);
  }

  backToStageSelect() {
    const gModal = document.getElementById('gameover-modal');
    const vModal = document.getElementById('victory-modal');
    if (gModal) gModal.classList.add('hidden');
    if (vModal) vModal.classList.add('hidden');

    this.openLand(this.currentLandId);
  }

  backToWorldMap() {
    const gModal = document.getElementById('gameover-modal');
    const vModal = document.getElementById('victory-modal');
    if (gModal) gModal.classList.add('hidden');
    if (vModal) vModal.classList.add('hidden');

    this.renderWorldMap();
    this.showScreen('screen-world-map');
  }

  // ===================== CHẾ ĐỘ TỐC ĐỘ 60 GIÂY =====================

  startSpeedMode() {
    this.speedTimeLeft = 60;
    this.speedScore = 0;
    this.speedCorrectCount = 0;
    this.showScreen('screen-speed');

    const timerEl = document.getElementById('speed-timer-val');
    const scoreEl = document.getElementById('speed-score-val');
    if (timerEl) timerEl.textContent = '60';
    if (scoreEl) scoreEl.textContent = '0';

    if (this.speedTimer) clearInterval(this.speedTimer);

    // Đếm ngược 60s
    this.speedTimer = setInterval(() => {
      this.speedTimeLeft--;
      if (timerEl) timerEl.textContent = this.speedTimeLeft;

      if (this.speedTimeLeft <= 10) {
        if (timerEl) timerEl.classList.add('text-rose-600', 'animate-pulse');
        if (window.soundEngine) window.soundEngine.playTick(true);
      } else {
        if (window.soundEngine) window.soundEngine.playTick(false);
      }

      if (this.speedTimeLeft <= 0) {
        clearInterval(this.speedTimer);
        this.endSpeedMode();
      }
    }, 1000);

    this.loadNextSpeedQuestion();
  }

  loadNextSpeedQuestion() {
    this.speedCurrentQuestion = window.MathGenerator.generateSpeedQuestion();
    const qBox = document.getElementById('speed-question-box');
    const ansBox = document.getElementById('speed-answers-container');

    if (qBox) {
      qBox.innerHTML = `<div class="text-2xl sm:text-3xl font-black text-slate-800">${this.speedCurrentQuestion.question}</div>`;
    }

    if (ansBox) {
      let html = '<div class="grid grid-cols-2 gap-3 max-w-md mx-auto">';
      this.speedCurrentQuestion.options.forEach(opt => {
        html += `
          <button onclick="game.handleSpeedAnswer(this, '${encodeURIComponent(opt)}')" class="quiz-option-btn p-4 rounded-2xl bg-white font-black text-lg text-slate-800 text-center">
            ${opt}
          </button>
        `;
      });
      html += '</div>';
      ansBox.innerHTML = html;
    }

    this.renderMath(qBox);
    this.renderMath(ansBox);
  }

  handleSpeedAnswer(btnEl, encodedOpt) {
    const chosen = decodeURIComponent(encodedOpt);
    const correct = this.speedCurrentQuestion.correctAnswer;

    if (chosen === correct) {
      this.speedCorrectCount++;
      this.speedScore += (this.speedCurrentQuestion.points || 10);
      this.speedTimeLeft = Math.min(60, this.speedTimeLeft + 1); // Thưởng thêm 1 giây!

      if (window.soundEngine) window.soundEngine.playCorrect();
      document.getElementById('speed-score-val').textContent = this.speedScore;
      document.getElementById('speed-count-val').textContent = this.speedCorrectCount;

      this.loadNextSpeedQuestion();
    } else {
      if (window.soundEngine) window.soundEngine.playWrong();
      btnEl.classList.add('selected-wrong');
      setTimeout(() => {
        this.loadNextSpeedQuestion();
      }, 300);
    }
  }

  endSpeedMode() {
    if (this.speedTimer) clearInterval(this.speedTimer);

    // Cập nhật kỷ lục cá nhân
    const isNewRecord = this.speedScore > (this.state.speedHighScore || 0);
    if (isNewRecord) {
      this.state.speedHighScore = this.speedScore;
    }
    this.state.totalScore += this.speedScore;
    this.saveState();

    if (this.speedCorrectCount >= 15) {
      this.unlockBadge('speed_runner');
    }

    if (window.soundEngine) window.soundEngine.playVictory();

    const modal = document.getElementById('speed-result-modal');
    if (modal) {
      document.getElementById('speed-final-score').textContent = `${this.speedScore} điểm`;
      document.getElementById('speed-final-count').textContent = `${this.speedCorrectCount} câu`;
      document.getElementById('speed-high-record').textContent = `${this.state.speedHighScore} điểm`;
      modal.classList.remove('hidden');
    }
  }

  // ===================== HUY HIỆU & TIỆN ÍCH UI =====================

  unlockBadge(badgeId) {
    if (!this.state.badges.includes(badgeId)) {
      this.state.badges.push(badgeId);
      this.saveState();
      if (window.soundEngine) window.soundEngine.playBadgeUnlock();

      const b = this.badgesConfig.find(x => x.id === badgeId);
      if (b) {
        this.showToastNotification(`🎖️ Mở khóa huy hiệu: <b>${b.name}</b>!`);
      }
    }
  }

  renderBadgesScreen() {
    const container = document.getElementById('badges-grid-container');
    if (!container) return;

    let html = '';
    this.badgesConfig.forEach(b => {
      const isUnlocked = this.state.badges.includes(b.id);
      html += `
        <div class="bg-white rounded-2xl p-5 border-3 ${isUnlocked ? 'border-amber-400 bg-amber-50/40 shadow-sm' : 'border-slate-200 opacity-60'} flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${isUnlocked ? 'bg-amber-400 text-white shadow' : 'bg-slate-200 text-slate-400'} flex-shrink-0">
            ${isUnlocked ? b.icon : '🔒'}
          </div>
          <div>
            <h4 class="font-black text-slate-800 text-base">${b.name}</h4>
            <p class="text-xs text-slate-500 font-bold mt-1">${b.desc}</p>
            <span class="inline-block mt-2 text-[10px] font-black px-2 py-0.5 rounded-full ${isUnlocked ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}">
              ${isUnlocked ? 'ĐÃ ĐẠT ĐƯỢC' : 'CHƯA MỞ KHÓA'}
            </span>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
    this.showScreen('screen-badges');
  }

  updateHeartsUI() {
    const container = document.getElementById('quiz-hearts-box');
    if (!container) return;

    let html = '';
    for (let i = 1; i <= 3; i++) {
      if (i <= this.hearts) {
        html += `<span class="text-rose-500 text-2xl animate-heart-beat" title="Còn mạng">❤️</span>`;
      } else {
        html += `<span class="text-slate-300 text-2xl" title="Mất mạng">🖤</span>`;
      }
    }
    container.innerHTML = html;
  }

  updateComboUI() {
    const flameEl = document.getElementById('quiz-combo-badge');
    const countEl = document.getElementById('quiz-combo-count');
    if (!flameEl) return;

    if (this.combo >= 2) {
      flameEl.classList.remove('hidden');
      if (countEl) countEl.textContent = `x${this.combo}`;
    } else {
      flameEl.classList.add('hidden');
    }
  }

  updateBossHPUI() {
    const fillEl = document.getElementById('boss-hp-fill');
    const textEl = document.getElementById('boss-hp-text');
    if (fillEl) {
      const pct = (this.bossCurrentHP / this.bossMaxHP) * 100;
      fillEl.style.width = `${pct}%`;
      if (pct <= 30) {
        fillEl.className = 'h-full bg-rose-600 transition-all duration-300';
      } else if (pct <= 60) {
        fillEl.className = 'h-full bg-amber-500 transition-all duration-300';
      } else {
        fillEl.className = 'h-full bg-emerald-500 transition-all duration-300';
      }
    }
    if (textEl) {
      textEl.textContent = `${this.bossCurrentHP} / ${this.bossMaxHP} HP`;
    }
  }

  setMascotExpression(type, message) {
    const faceEl = document.getElementById('mascot-expression-face');
    const msgEl = document.getElementById('mascot-message-bubble');

    if (msgEl && message) msgEl.textContent = message;

    if (faceEl) {
      if (type === 'cheering') {
        faceEl.innerHTML = `
          <!-- Mắt sao vui vẻ -->
          <circle cx="38" cy="46" r="7" fill="#fbbf24"/>
          <circle cx="62" cy="46" r="7" fill="#fbbf24"/>
          <path d="M 38 60 Q 50 74 62 60" stroke="#0f172a" stroke-width="4" stroke-linecap="round" fill="#f43f5e"/>
        `;
      } else if (type === 'sad') {
        faceEl.innerHTML = `
          <!-- Mắt buồn an ủi -->
          <ellipse cx="38" cy="48" rx="6" ry="7" fill="#0f172a"/>
          <ellipse cx="62" cy="48" rx="6" ry="7" fill="#0f172a"/>
          <path d="M 40 68 Q 50 60 60 68" stroke="#0f172a" stroke-width="4" stroke-linecap="round" fill="none"/>
        `;
      } else {
        // Idle
        faceEl.innerHTML = `
          <circle cx="38" cy="46" r="6" fill="#0f172a"/>
          <circle cx="62" cy="46" r="6" fill="#0f172a"/>
          <path d="M 42 62 Q 50 70 58 62" stroke="#0f172a" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        `;
      }
    }
  }

  showToastNotification(htmlMsg) {
    const toast = document.getElementById('game-toast');
    if (!toast) return;

    toast.innerHTML = htmlMsg;
    toast.classList.remove('hidden', 'opacity-0', 'translate-y-4');
    toast.classList.add('opacity-100', 'translate-y-0');

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-4');
      setTimeout(() => toast.classList.add('hidden'), 300);
    }, 3000);
  }

  checkTotalStars() {
    if (this.state.stars >= 50) {
      this.unlockBadge('master_island');
    }
  }

  setupGlobalEvents() {
    // Sound toggle
    const sBtn = document.getElementById('sound-toggle-btn');
    if (sBtn) {
      sBtn.addEventListener('click', () => {
        if (window.soundEngine) {
          const isMuted = window.soundEngine.toggleMute();
          document.getElementById('sound-icon-on').classList.toggle('hidden', isMuted);
          document.getElementById('sound-icon-off').classList.toggle('hidden', !isMuted);
        }
      });
    }
  }
}

// Khởi tạo game toàn cục
window.game = new MathTreasureGame();
document.addEventListener('DOMContentLoaded', () => {
  window.game.init();
});
