/**
 * ============================================================================
 * ĐƯỜNG ĐUA TOÁN 5 – 3D | GAME ENGINE & THREE.JS CONTROLLER (CARTOON 3D PRO)
 * Chuẩn hiệu năng 60 FPS: Object Pooling, Shared Geometry/Materials,
 * Zero-Allocation Text CanvasTexture, 5 Thế Giới Hoạt Hình 3D Sống Động,
 * Nhân vật & Boss 3D Chi Tiết, Tia Laser 3D, Web Audio API & State Machine.
 * ============================================================================
 */

(function () {
  'use strict';

  /* =========================================================================
   * 1. HẰNG SỐ & BẢNG MÀU PHIM HOẠT HÌNH CHO 5 THẾ GIỚI
   * ========================================================================= */
  const LANES = [-3.0, 0.0, 3.0];
  const TRACK_SEGMENT_LENGTH = 30;
  const NUM_TRACK_SEGMENTS = 8;
  const TRACK_WIDTH = 10.5;
  const BASE_SPEED = 11.2;
  const JUMP_VELOCITY = 10.0;
  const GRAVITY = -28.0;

  const STATES = {
    MENU: 'MENU',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    EXPLAIN: 'EXPLAIN',
    BOSS: 'BOSS',
    VICTORY: 'VICTORY',
    GAMEOVER: 'GAMEOVER'
  };

  function randChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Định dạng hiển thị toán học chuẩn Việt Nam (GDPT 2018 - Toán 5) cho câu hỏi, đáp án, công thức
  function formatMathHTML(rawText) {
    if (!rawText) return '';
    let s = String(rawText);

    // Tránh định dạng lặp nếu chuỗi đã chứa HTML toán học
    if (s.includes('math-mixed') || s.includes('math-fraction')) return s;

    // 1. Hỗn số dạng: "w a/b" (ví dụ: "2 3/7", "3 1/4", "1 2/5")
    s = s.replace(/(\b\d+)\s+(\d+)\/(\d+)\b/g, (match, whole, num, den) => {
      return `<span class="math-mixed"><span class="math-whole">${whole}</span><span class="math-fraction"><span class="math-num">${num}</span><span class="math-den">${den}</span></span></span>`;
    });

    // 2. Phân số dạng: "a/b" (ví dụ: "17/7", "2/7", "18/24")
    s = s.replace(/(\b\d+)\/(\d+)\b/g, (match, num, den) => {
      return `<span class="math-fraction"><span class="math-num">${num}</span><span class="math-den">${den}</span></span>`;
    });

    return s;
  }

  // 5 Chủ Đề Thế Giới Lấy Cảm Hứng Phim Hoạt Hình Tuổi Học Trò
  const STAGE_THEMES = {
    1: {
      name: "Rừng Phân Số",
      worldTitle: "Rừng Thần Tiên",
      icon: "🌲",
      skyTop: "#0284c7",      // Trời xanh trong sáng kiểu Ghibli / Totoro
      skyMid: "#38bdf8",
      skyHorizon: "#a7f3d0",
      sunColor: 0xfef08a,
      cloudColor: 0xffffff,
      starOpacity: 0.08,
      groundColor: 0x047857,  // Đường đá rêu xanh ngọc
      shoulderColor: 0x16a34a,// Thảm cỏ xanh rì
      laneColor: 0xfef08a,    // Vạch kẻ vàng nắng
      curbColor: 0x34d399,
      fogColor: 0x6ee7b7,
      fogDensity: 0.0072,
      mountainColor: 0x059669,
      bossName: "VUA KHỈ RỪNG RẬM",
      bossColor: 0x10b981
    },
    2: {
      name: "Sa Mạc Thập Phân",
      worldTitle: "Ốc Đảo Aladdin",
      icon: "🏜️",
      skyTop: "#312e81",      // Hoàng hôn tím hồng cam kiểu Aladdin
      skyMid: "#db2777",
      skyHorizon: "#fbbf24",
      sunColor: 0xfde047,
      cloudColor: 0xfda4af,
      starOpacity: 0.45,
      groundColor: 0xb45309,  // Đường đá cung điện Agrabah
      shoulderColor: 0xf59e0b,// Đồi cát vàng óng
      laneColor: 0xfef08a,
      curbColor: 0xfbbf24,
      fogColor: 0xfb923c,
      fogDensity: 0.0072,
      mountainColor: 0x92400e,
      bossName: "BỌ CẠP KHỔNG LỒ",
      bossColor: 0xf59e0b
    },
    3: {
      name: "Thành Phố Phần Trăm",
      worldTitle: "San Fransokyo Cyber",
      icon: "🏙️",
      skyTop: "#090d24",      // Đêm đô thị rực rỡ kiểu Big Hero 6 / Spider-Verse
      skyMid: "#581c87",
      skyHorizon: "#ec4899",
      sunColor: 0xf0abfc,
      cloudColor: 0xc084fc,
      starOpacity: 0.75,
      groundColor: 0x1e1b4b,  // Đại lộ công nghệ cao
      shoulderColor: 0x2e1065,
      laneColor: 0x22d3ee,
      curbColor: 0xf472b6,
      fogColor: 0x4c1d95,
      fogDensity: 0.0078,
      mountainColor: 0x1e1b4b,
      bossName: "HẢI TẶC CYBER",
      bossColor: 0xa855f7
    },
    4: {
      name: "Thung Lũng Hình Học",
      worldTitle: "Vương Quốc Băng Giá",
      icon: "❄️",
      skyTop: "#0c4a6e",      // Bầu trời cực quang Arendelle (Frozen)
      skyMid: "#0d9488",
      skyHorizon: "#bae6fd",
      sunColor: 0xe0f2fe,
      cloudColor: 0xf0f9ff,
      starOpacity: 0.5,
      groundColor: 0x0284c7,  // Mặt đường pha lê băng
      shoulderColor: 0xe0f2fe,// Thung lũng tuyết trắng
      laneColor: 0xffffff,
      curbColor: 0x22d3ee,
      fogColor: 0x7dd3fc,
      fogDensity: 0.0072,
      mountainColor: 0x38bdf8,
      bossName: "NGƯỜI ĐÁ PHA LÊ",
      bossColor: 0x06b6d4
    },
    5: {
      name: "Đường Hầm Chuyển Động",
      worldTitle: "Du Hành Ngân Hà",
      icon: "🚀",
      skyTop: "#020617",      // Không gian vũ trụ Wall-E / Doraemon
      skyMid: "#701a75",
      skyHorizon: "#f43f5e",
      sunColor: 0xfb923c,     // Hành tinh Sao Thổ rực rỡ
      cloudColor: 0xfb7185,
      starOpacity: 0.95,
      groundColor: 0x3f0d1f,  // Đường băng lượng tử
      shoulderColor: 0x1e1b4b,
      laneColor: 0xfde047,
      curbColor: 0xfb7185,
      fogColor: 0x6b1236,
      fogDensity: 0.0078,
      mountainColor: 0x881337,
      bossName: "RỒNG THẦN BÃO TỐ",
      bossColor: 0xf43f5e
    }
  };

  /* =========================================================================
   * 2. BỘ TỔNG HỢP ÂM THANH (WEB AUDIO API - ZERO EXTERNAL FILES)
   * ========================================================================= */
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.isMuted = localStorage.getItem('dt5_muted') === 'true';
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggleMute() {
      this.init();
      this.isMuted = !this.isMuted;
      localStorage.setItem('dt5_muted', this.isMuted);
      return this.isMuted;
    }

    playTone(freq, type = 'sine', duration = 0.15, gain = 0.12, pitchDecay = 0, delay = 0) {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;

      try {
        const now = this.ctx.currentTime + delay;
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        if (pitchDecay !== 0) {
          osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq + pitchDecay), now + duration);
        }

        gainNode.gain.setValueAtTime(0.0001, now);
        gainNode.gain.linearRampToValueAtTime(gain, now + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + duration + 0.02);
      } catch (e) {
        // Ignored
      }
    }

    playLaneChange() {
      this.playTone(340, 'triangle', 0.08, 0.09, 150);
    }

    playJump() {
      this.playTone(280, 'sine', 0.22, 0.12, 380);
    }

    playCoin(combo = 0) {
      const baseFreq = 880;
      const multiplier = 1 + Math.min(combo, 8) * 0.08;
      this.playTone(baseFreq * multiplier, 'sine', 0.14, 0.14);
      this.playTone(baseFreq * multiplier * 1.5, 'triangle', 0.18, 0.1, 0, 0.05);
    }

    playCorrect() {
      [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
        this.playTone(f, 'triangle', 0.2, 0.14, 0, i * 0.06);
      });
    }

    playWrong() {
      this.playTone(240, 'sawtooth', 0.35, 0.15, -120);
    }

    playLaser() {
      this.playTone(1200, 'sawtooth', 0.25, 0.18, -900);
    }

    playBossHit() {
      this.playTone(180, 'square', 0.3, 0.2, -90);
    }

    playBossRoar() {
      this.playTone(85, 'sawtooth', 0.8, 0.25, -35);
      this.playTone(130, 'triangle', 0.6, 0.18, 0, 0.1);
    }

    playVictory() {
      [440, 554.37, 659.25, 880, 1108.73, 1318.51].forEach((f, i) => {
        this.playTone(f, 'sine', 0.35, 0.15, 0, i * 0.08);
      });
    }

    playGameOver() {
      [349.23, 311.13, 277.18, 220].forEach((f, i) => {
        this.playTone(f, 'sawtooth', 0.35, 0.12, -20, i * 0.2);
      });
    }

    playTick() {
      this.playTone(850, 'sine', 0.04, 0.08);
    }

    playBoost() {
      this.playTone(420, 'triangle', 0.28, 0.16, 520);
    }
  }

  /* =========================================================================
   * 3. GAME ENGINE CHÍNH
   * ========================================================================= */
  class Game3DEngine {
    constructor() {
      this.state = STATES.MENU;
      this.sound = new SoundEngine();

      // Dữ liệu lưu trữ LocalStorage
      this.savedData = this.loadSavedData();

      // Tiến độ chơi hiện tại
      this.currentStageId = 1;
      this.activeThemeId = 1;
      this.isEndlessMode = false;
      this.questionIndex = 0;
      this.questionsPerStage = 8;
      this.score = 0;
      this.coins = 0;
      this.hearts = 3;
      this.combo = 0;
      this.slowMoEnergy = 100;
      this.isSlowMoActive = false;

      // HỆ THỐNG 1 PHÚT VƯỢT CHƯỚNG NGẠI VẬT (60 GIÂY/CÂU HỎI)
      this.questionTimeLimit = 60.0;
      this.questionTimeRemaining = 60.0;
      this.lastTickSecond = 60;

      // Vật lý người chơi
      this.playerLaneIndex = 1; // 0: Trái, 1: Giữa, 2: Phải
      this.playerTargetX = LANES[1];
      this.playerPosY = 0;
      this.playerVelY = 0;
      this.isJumping = false;
      this.runAnimTimer = 0;
      this.invulnerableTimer = 0;

      // Camera & Cảm giác chơi
      this.cameraBaseFOV = 60;
      this.cameraShakeIntensity = 0;

      // Đại Boss 3D & Tia Laser
      this.bossMaxHP = 4;
      this.bossCurrentHP = 4;
      this.bossMesh = null;
      this.bossHalo = null;
      this.bossStageParts = {};
      this.bossLaneTargetX = 0;
      this.bossMoveTimer = 0;
      this.laserMesh = null;
      this.laserTimer = 0;

      // Thành phần Three.js
      this.container = null;
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.clock = new THREE.Clock();

      // Tài nguyên dùng chung (Shared Geometries & Materials - 60 FPS)
      this.sharedMat = {};
      this.sharedGeo = {};

      // Bầu trời & Thiên thể hoạt hình
      this.skyCanvas = null;
      this.skyCtx = null;
      this.skyTexture = null;
      this.celestialGroup = null;
      this.celestialBody = null;
      this.celestialHalo = null;
      this.planetRing = null;
      this.auroraArch = null;
      this.starField = null;
      this.starMat = null;
      this.cloudPool = [];
      this.skyPropPool = [];

      // Các nhóm Object Pooling đường đua
      this.trackSegments = [];
      this.segmentScenerySets = [];
      this.coinPool = [];
      this.barrierPool = [];
      this.particlePool = [];
      this.particleIndex = 0;

      // Cổng năng lượng 3D
      this.gateWave = {
        active: false,
        z: -100,
        resolved: false,
        meshes: [],
        questionData: null
      };

      // ZERO-ALLOCATION TEXT ON 3D
      this.gateCanvases = [];
      this.gateContexts = [];
      this.gateTextures = [];

      // Nhân vật 3D & Phụ kiện động
      this.playerGroup = null;
      this.playerFlames = [];
      this.playerAura = null;
      this.playerArmL = null;
      this.playerArmR = null;
      this.blobShadow = null;
      this.selectedSkin = this.savedData.selectedSkin || 1;

      // Bảng nháp mini
      this.scratchpadDrawing = false;
      this.scratchpadCtx = null;
      this.scratchpadCanvas = null;

      this.init();
    }

    loadSavedData() {
      const defaultData = {
        highScore: 0,
        coins: 0,
        unlockedSkins: [1],
        selectedSkin: 1
      };
      try {
        const raw = localStorage.getItem('dt5_save_data_v1');
        if (raw) return Object.assign(defaultData, JSON.parse(raw));
      } catch (e) {
        console.warn("Lỗi đọc LocalStorage:", e);
      }
      return defaultData;
    }

    saveData() {
      try {
        localStorage.setItem('dt5_save_data_v1', JSON.stringify(this.savedData));
        this.updateMenuStats();
      } catch (e) {
        console.warn("Lỗi ghi LocalStorage:", e);
      }
    }

    /* =========================================================================
     * 4. KHỞI TẠO THREE.JS, TÀI NGUYÊN CHUNG & BẦU TRỜI HOẠT HÌNH
     * ========================================================================= */
    init() {
      this.container = document.getElementById('game-container');
      if (!this.container) return;

      // 1. Tạo Scene & Sương mù dịu sáng
      this.scene = new THREE.Scene();
      const t1 = STAGE_THEMES[1];
      this.scene.fog = new THREE.FogExp2(t1.fogColor, t1.fogDensity);

      // 2. Tạo Camera
      const isPortrait = window.innerWidth < window.innerHeight;
      const initialFOV = isPortrait ? 78 : this.cameraBaseFOV;
      const aspect = window.innerWidth / window.innerHeight;
      this.camera = new THREE.PerspectiveCamera(initialFOV, aspect, 0.1, 280);
      this.camera.position.set(0, isPortrait ? 5.2 : 4.2, isPortrait ? 9.6 : 7.8);
      this.camera.lookAt(0, 1.4, -8);

      // 3. Renderer 60 FPS
      this.renderer = new THREE.WebGLRenderer({
        powerPreference: "high-performance",
        antialias: window.devicePixelRatio <= 1.5,
        alpha: false,
        depth: true
      });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.outputEncoding = THREE.sRGBEncoding;
      this.container.appendChild(this.renderer.domElement);

      // 4. Ánh sáng rực rỡ chuẩn phim hoạt hình (Hemisphere + Key Directional + Rim)
      const hemiLight = new THREE.HemisphereLight(0xffffff, 0x334155, 1.0);
      hemiLight.position.set(0, 50, 0);
      this.scene.add(hemiLight);

      const dirLight = new THREE.DirectionalLight(0xfffbeb, 0.85);
      dirLight.position.set(18, 35, 22);
      this.scene.add(dirLight);

      // 5. Tạo Tài Nguyên Dùng Chung (Shared Geometries & Materials)
      this.initSharedAssets();

      // 6. Bầu Trời Gradient, Thiên Thể, Sao & Mây Hoạt Hình
      this.buildSkyEnvironment();

      // 7. Zero-Allocation CanvasTextures cho 3 Cổng
      this.initGateCanvasTextures();

      // 8. Xây dựng Đường Đua & 5 Thế Giới Cảnh Quan 3D
      this.buildTrackPool();
      this.buildGateMeshes();
      this.buildCoinPool();
      this.buildParticlePool();

      // 9. Tạo Nhân vật, Boss 3D & Tia Laser 3D
      this.buildPlayer();
      this.buildBossMesh();
      this.buildLaserBeam();

      // 10. Áp dụng theme mặc định cho Menu (Thế giới 1 - Rừng Thần Tiên)
      this.applyStageTheme(1);

      // 11. Đăng ký sự kiện & Bảng Nháp
      this.setupControls();
      this.setupWindowEvents();
      this.initScratchpad();
      this.updateMenuStats();
      this.renderSkinShopItems();

      // 12. Vòng lặp duy nhất 60 FPS
      this.animate = this.animate.bind(this);
      requestAnimationFrame(this.animate);
    }

    initSharedAssets() {
      const t1 = STAGE_THEMES[1];
      this.sharedMat = {
        roadMat: new THREE.MeshLambertMaterial({ color: t1.groundColor, flatShading: true }),
        shoulderMat: new THREE.MeshLambertMaterial({ color: t1.shoulderColor, flatShading: true }),
        curbMat: new THREE.MeshLambertMaterial({ color: t1.curbColor, emissive: t1.curbColor, emissiveIntensity: 0.25, flatShading: true }),
        curbBaseMat: new THREE.MeshLambertMaterial({ color: 0x0f172a, flatShading: true }),
        laneMat: new THREE.MeshBasicMaterial({ color: t1.laneColor, transparent: true, opacity: 0.65 }),
        mountainMat: new THREE.MeshLambertMaterial({ color: t1.mountainColor, flatShading: true }),
        cloudMat: new THREE.MeshLambertMaterial({ color: t1.cloudColor, flatShading: true, emissive: 0xffffff, emissiveIntensity: 0.12 }),

        // Vật liệu dùng chung cho cảnh quan 5 thế giới
        trunkMat: new THREE.MeshLambertMaterial({ color: 0x78350f, flatShading: true }),
        leafDarkMat: new THREE.MeshLambertMaterial({ color: 0x15803d, flatShading: true }),
        leafBrightMat: new THREE.MeshLambertMaterial({ color: 0x22c55e, flatShading: true }),
        mushroomStemMat: new THREE.MeshLambertMaterial({ color: 0xfef9c3, flatShading: true }),
        mushroomGlowCyanMat: new THREE.MeshLambertMaterial({ color: 0x22d3ee, emissive: 0x06b6d4, emissiveIntensity: 0.55, flatShading: true }),
        mushroomGlowPinkMat: new THREE.MeshLambertMaterial({ color: 0xf472b6, emissive: 0xdb2777, emissiveIntensity: 0.55, flatShading: true }),
        lanternRedMat: new THREE.MeshBasicMaterial({ color: 0xfb7185 }),
        lanternGoldMat: new THREE.MeshBasicMaterial({ color: 0xfde047 }),

        pyramidGoldMat: new THREE.MeshLambertMaterial({ color: 0xfbbf24, flatShading: true }),
        palmTrunkMat: new THREE.MeshLambertMaterial({ color: 0x92400e, flatShading: true }),
        cactusMat: new THREE.MeshLambertMaterial({ color: 0x16a34a, flatShading: true }),
        cactusFlowerMat: new THREE.MeshBasicMaterial({ color: 0xf43f5e }),

        buildingDarkMat: new THREE.MeshLambertMaterial({ color: 0x1e1b4b, flatShading: true }),
        buildingSlateMat: new THREE.MeshLambertMaterial({ color: 0x312e81, flatShading: true }),
        neonCyanMat: new THREE.MeshBasicMaterial({ color: 0x22d3ee }),
        neonPinkMat: new THREE.MeshBasicMaterial({ color: 0xf472b6 }),
        neonAmberMat: new THREE.MeshBasicMaterial({ color: 0xfacc15 }),

        crystalMat: new THREE.MeshLambertMaterial({ color: 0x38bdf8, emissive: 0x0ea5e9, emissiveIntensity: 0.4, flatShading: true }),
        snowMat: new THREE.MeshLambertMaterial({ color: 0xf0f9ff, flatShading: true }),
        icePineMat: new THREE.MeshLambertMaterial({ color: 0x0f766e, flatShading: true }),

        warpRingMat: new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.72 }),
        warpRingAltMat: new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.72 }),
        asteroidMat: new THREE.MeshLambertMaterial({ color: 0x475569, flatShading: true }),
        plasmaCoreMat: new THREE.MeshBasicMaterial({ color: 0xfb923c })
      };

      this.sharedGeo = {
        mountainCone: new THREE.ConeGeometry(1, 1, 5),
        cloudPuff: new THREE.DodecahedronGeometry(1, 0),
        trunk: new THREE.CylinderGeometry(0.28, 0.42, 1.8, 6),
        canopy: new THREE.IcosahedronGeometry(1.3, 0),
        canopySmall: new THREE.IcosahedronGeometry(0.95, 0),
        mushStem: new THREE.CylinderGeometry(0.22, 0.3, 0.9, 6),
        mushCap: new THREE.ConeGeometry(0.95, 0.65, 7),
        lanternBody: new THREE.SphereGeometry(0.32, 6, 6),
        postSlim: new THREE.CylinderGeometry(0.08, 0.1, 2.2, 5),

        pyramid: new THREE.ConeGeometry(2.6, 4.2, 4),
        cactusBody: new THREE.CylinderGeometry(0.28, 0.3, 1.8, 6),
        cactusArm: new THREE.CylinderGeometry(0.18, 0.18, 0.8, 5),
        palmLeaf: new THREE.BoxGeometry(1.5, 0.1, 0.38),

        boxBuilding: new THREE.BoxGeometry(2.8, 1, 2.8),
        neonStrip: new THREE.BoxGeometry(2.9, 0.28, 2.9),
        toriiPillar: new THREE.BoxGeometry(0.32, 4.2, 0.32),
        toriiBeam: new THREE.BoxGeometry(3.6, 0.35, 0.4),

        crystalSpike: new THREE.ConeGeometry(0.75, 3.6, 5),
        octaProp: new THREE.OctahedronGeometry(0.85, 0),
        cubeProp: new THREE.BoxGeometry(1.1, 1.1, 1.1),

        warpArch: new THREE.TorusGeometry(6.8, 0.18, 6, 18, Math.PI),
        asteroid: new THREE.DodecahedronGeometry(1.1, 0)
      };
    }

    buildSkyEnvironment() {
      // 1. Canvas Gradient Texture cho bầu trời (Zero-Allocation)
      this.skyCanvas = document.createElement('canvas');
      this.skyCanvas.width = 4;
      this.skyCanvas.height = 256;
      this.skyCtx = this.skyCanvas.getContext('2d');
      this.skyTexture = new THREE.CanvasTexture(this.skyCanvas);
      this.skyTexture.encoding = THREE.sRGBEncoding;
      this.scene.background = this.skyTexture;

      // 2. Thiên thể trung tâm chân trời (Mặt trời / Trăng / Hành tinh Sao Thổ / Cực quang)
      this.celestialGroup = new THREE.Group();
      this.celestialGroup.position.set(0, 26, -165);

      const sunGeo = new THREE.SphereGeometry(12, 16, 16);
      const sunMat = new THREE.MeshBasicMaterial({ color: 0xfef08a, fog: false });
      this.celestialBody = new THREE.Mesh(sunGeo, sunMat);
      this.celestialGroup.add(this.celestialBody);

      const haloGeo = new THREE.CircleGeometry(19, 24);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0xfef08a,
        transparent: true,
        opacity: 0.25,
        fog: false,
        depthWrite: false
      });
      this.celestialHalo = new THREE.Mesh(haloGeo, haloMat);
      this.celestialHalo.position.z = -1;
      this.celestialGroup.add(this.celestialHalo);

      // Vành đai Sao Thổ (Chặng 5 & Chặng 3)
      const ringGeo = new THREE.TorusGeometry(20, 1.4, 4, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xfde047, transparent: true, opacity: 0.7, fog: false });
      this.planetRing = new THREE.Mesh(ringGeo, ringMat);
      this.planetRing.rotation.x = Math.PI / 2.4;
      this.planetRing.rotation.y = 0.35;
      this.planetRing.visible = false;
      this.celestialGroup.add(this.planetRing);

      // Dải Cực Quang Bắc Cực (Chặng 4 Frozen)
      const auroraGeo = new THREE.TorusGeometry(48, 2.6, 5, 28, Math.PI);
      const auroraMat = new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.42, fog: false });
      this.auroraArch = new THREE.Mesh(auroraGeo, auroraMat);
      this.auroraArch.position.set(0, -14, 15);
      this.auroraArch.visible = false;
      this.celestialGroup.add(this.auroraArch);

      this.scene.add(this.celestialGroup);

      // 3. Trường Sao Lấp Lánh (Starfield)
      const starCount = 140;
      const starGeo = new THREE.BufferGeometry();
      const positions = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 180;
        positions[i * 3 + 1] = 14 + Math.random() * 48;
        positions[i * 3 + 2] = -30 - Math.random() * 140;
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      this.starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.75, transparent: true, opacity: 0.4, fog: false });
      this.starField = new THREE.Points(starGeo, this.starMat);
      this.scene.add(this.starField);

      // 4. Pool 12 Đám Mây Hoạt Hình Phồng Xốp (Cartoon Fluffy Clouds)
      for (let i = 0; i < 12; i++) {
        const cloud = new THREE.Group();
        const p1 = new THREE.Mesh(this.sharedGeo.cloudPuff, this.sharedMat.cloudMat);
        p1.scale.set(2.4, 1.4, 1.5);
        const p2 = new THREE.Mesh(this.sharedGeo.cloudPuff, this.sharedMat.cloudMat);
        p2.position.set(-1.9, -0.35, 0.2);
        p2.scale.set(1.5, 1.05, 1.2);
        const p3 = new THREE.Mesh(this.sharedGeo.cloudPuff, this.sharedMat.cloudMat);
        p3.position.set(1.9, -0.3, -0.2);
        p3.scale.set(1.6, 1.1, 1.2);
        cloud.add(p1, p2, p3);

        const side = (i % 2 === 0 ? -1 : 1);
        cloud.position.set(
          side * (10 + Math.random() * 34),
          12 + Math.random() * 10,
          -i * 13 - Math.random() * 8
        );
        const s = 0.8 + Math.random() * 0.7;
        cloud.scale.set(s, s, s);
        this.scene.add(cloud);
        this.cloudPool.push(cloud);
      }

      // 5. Pool Vật Thể Bay Trên Không Trung (Đom đóm/Khinh khí cầu/Tinh thể bay)
      const propGeo = new THREE.OctahedronGeometry(0.42, 0);
      const propMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });
      for (let i = 0; i < 8; i++) {
        const orb = new THREE.Mesh(propGeo, propMat);
        const side = i % 2 === 0 ? -1 : 1;
        orb.position.set(
          side * (7 + Math.random() * 12),
          3.5 + Math.random() * 5,
          -15 - i * 16
        );
        orb.userData = { baseY: orb.position.y, phase: Math.random() * Math.PI * 2 };
        this.scene.add(orb);
        this.skyPropPool.push(orb);
      }
    }

    updateSkyTexture(theme) {
      if (!this.skyCtx) return;
      const grad = this.skyCtx.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, theme.skyTop);
      grad.addColorStop(0.55, theme.skyMid);
      grad.addColorStop(1, theme.skyHorizon);
      this.skyCtx.fillStyle = grad;
      this.skyCtx.fillRect(0, 0, 4, 256);
      this.skyTexture.needsUpdate = true;
    }

    // Chuyển đổi toàn bộ 5 Thế Giới Hoạt Hình tức thì (Zero Allocation!)
    applyStageTheme(stageId) {
      const id = STAGE_THEMES[stageId] ? stageId : 1;
      this.activeThemeId = id;
      const theme = STAGE_THEMES[id];

      // 1. Bầu trời & Sương mù
      this.updateSkyTexture(theme);
      if (this.scene.fog) {
        this.scene.fog.color.setHex(theme.fogColor);
        this.scene.fog.density = theme.fogDensity;
      }

      // 2. Thiên thể & Sao
      if (this.celestialBody) this.celestialBody.material.color.setHex(theme.sunColor);
      if (this.celestialHalo) this.celestialHalo.material.color.setHex(theme.sunColor);
      if (this.planetRing) this.planetRing.visible = (id === 5);
      if (this.auroraArch) this.auroraArch.visible = (id === 4);
      if (this.starMat) this.starMat.opacity = theme.starOpacity;

      // 3. Đổi màu đường đua, thảm địa hình 2 bên, lề đường, núi & mây
      this.sharedMat.roadMat.color.setHex(theme.groundColor);
      this.sharedMat.shoulderMat.color.setHex(theme.shoulderColor);
      this.sharedMat.laneMat.color.setHex(theme.laneColor);
      this.sharedMat.curbMat.color.setHex(theme.curbColor);
      this.sharedMat.curbMat.emissive.setHex(theme.curbColor);
      this.sharedMat.mountainMat.color.setHex(theme.mountainColor);
      this.sharedMat.cloudMat.color.setHex(theme.cloudColor);

      // 4. Bật/tắt đúng bộ cảnh quan 3D của chặng trên tất cả 8 phân đoạn đường đua
      this.segmentScenerySets.forEach(sets => {
        for (let k = 1; k <= 5; k++) {
          if (sets[k]) sets[k].visible = (k === id);
        }
      });

      // 5. Cập nhật màu cho đom đóm / vật thể bay bầu trời
      if (this.skyPropPool.length > 0) {
        this.skyPropPool[0].material.color.setHex(theme.curbColor);
      }

      // 6. Cập nhật ngoại hình Boss 3D
      this.updateBossVisuals(id);
    }

    previewMenuWorld(stageId) {
      if (this.state !== STATES.MENU) return;
      this.sound.playLaneChange();
      this.applyStageTheme(stageId);
    }

    /* =========================================================================
     * 5. ĐƯỜNG ĐUA, ĐỊA HÌNH CHÂN TRỜI & 5 BỘ CẢNH QUAN PHIM HOẠT HÌNH
     * ========================================================================= */
    initGateCanvasTextures() {
      for (let i = 0; i < 3; i++) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;

        this.gateCanvases.push(canvas);
        this.gateContexts.push(ctx);
        this.gateTextures.push(texture);
      }
    }

    buildTrackPool() {
      const roadGeo = new THREE.PlaneGeometry(TRACK_WIDTH, TRACK_SEGMENT_LENGTH);
      roadGeo.rotateX(-Math.PI / 2);

      const shoulderGeo = new THREE.PlaneGeometry(60, TRACK_SEGMENT_LENGTH);
      shoulderGeo.rotateX(-Math.PI / 2);

      const dashGeo = new THREE.PlaneGeometry(0.18, 3.6);
      dashGeo.rotateX(-Math.PI / 2);

      const curbBaseGeo = new THREE.BoxGeometry(0.55, 0.25, TRACK_SEGMENT_LENGTH);
      const curbNeonGeo = new THREE.BoxGeometry(0.22, 0.14, TRACK_SEGMENT_LENGTH);

      for (let i = 0; i < NUM_TRACK_SEGMENTS; i++) {
        const segGroup = new THREE.Group();

        // 1. Mặt đường chính
        const road = new THREE.Mesh(roadGeo, this.sharedMat.roadMat);
        segGroup.add(road);

        // 2. Thảm địa hình 2 bên (trải dài tới đường chân trời -> không còn khoảng không trống rỗng)
        const leftGround = new THREE.Mesh(shoulderGeo, this.sharedMat.shoulderMat);
        leftGround.position.set(-(TRACK_WIDTH / 2 + 30), -0.05, 0);
        const rightGround = new THREE.Mesh(shoulderGeo, this.sharedMat.shoulderMat);
        rightGround.position.set(TRACK_WIDTH / 2 + 30, -0.05, 0);
        segGroup.add(leftGround, rightGround);

        // 3. Vạch phân làn đứt đoạn (tạo cảm giác tốc độ rõ nét!)
        for (const lx of [-1.5, 1.5]) {
          for (let dz = -11; dz <= 11; dz += 7.5) {
            const dash = new THREE.Mesh(dashGeo, this.sharedMat.laneMat);
            dash.position.set(lx, 0.02, dz);
            segGroup.add(dash);
          }
        }

        // 4. Lề đường 2 lớp + Dải Neon sáng
        for (const side of [-1, 1]) {
          const xEdge = side * (TRACK_WIDTH / 2);
          const curbBase = new THREE.Mesh(curbBaseGeo, this.sharedMat.curbBaseMat);
          curbBase.position.set(xEdge, 0.12, 0);
          const curbNeon = new THREE.Mesh(curbNeonGeo, this.sharedMat.curbMat);
          curbNeon.position.set(xEdge, 0.28, 0);
          segGroup.add(curbBase, curbNeon);
        }

        // 5. Dãy núi Low-Poly ở xa 2 bên tạo chiều sâu Parallax
        for (const side of [-1, 1]) {
          const m1 = new THREE.Mesh(this.sharedGeo.mountainCone, this.sharedMat.mountainMat);
          const h1 = 10 + Math.random() * 8;
          m1.scale.set(8 + Math.random() * 4, h1, 8 + Math.random() * 4);
          m1.position.set(side * (28 + Math.random() * 14), h1 / 2 - 0.5, -7);

          const m2 = new THREE.Mesh(this.sharedGeo.mountainCone, this.sharedMat.mountainMat);
          const h2 = 7 + Math.random() * 7;
          m2.scale.set(7 + Math.random() * 3, h2, 7 + Math.random() * 3);
          m2.position.set(side * (24 + Math.random() * 12), h2 / 2 - 0.5, 8);
          segGroup.add(m1, m2);
        }

        // 6. Gắn 5 Bộ Cảnh Quan Riêng Biệt cho 5 Chặng
        this.addScenerySetsToSegment(segGroup);

        segGroup.position.z = -i * TRACK_SEGMENT_LENGTH;
        this.scene.add(segGroup);
        this.trackSegments.push(segGroup);
      }
    }

    addScenerySetsToSegment(segGroup) {
      const sets = {};
      for (let k = 1; k <= 5; k++) {
        sets[k] = new THREE.Group();
        sets[k].visible = (k === 1);
        segGroup.add(sets[k]);
      }

      // === SET 1: RỪNG THẦN TIÊN (TOTORO / PANDORA / KUNG FU PANDA) ===
      for (const side of [-1, 1]) {
        // Cây tán tròn 2 tầng
        for (const zOff of [-9, 6]) {
          const tree = new THREE.Group();
          const trunk = new THREE.Mesh(this.sharedGeo.trunk, this.sharedMat.trunkMat);
          trunk.position.y = 0.9;
          const cap1 = new THREE.Mesh(this.sharedGeo.canopy, this.sharedMat.leafDarkMat);
          cap1.position.y = 2.4;
          const cap2 = new THREE.Mesh(this.sharedGeo.canopySmall, this.sharedMat.leafBrightMat);
          cap2.position.set(0.4 * side, 3.2, 0.2);
          tree.add(trunk, cap1, cap2);
          tree.position.set(side * (8.2 + Math.random() * 3.5), 0, zOff);
          const s = 0.95 + Math.random() * 0.45;
          tree.scale.set(s, s, s);
          sets[1].add(tree);
        }

        // Nấm phát sáng Pandora
        const mush = new THREE.Group();
        const stem = new THREE.Mesh(this.sharedGeo.mushStem, this.sharedMat.mushroomStemMat);
        stem.position.y = 0.45;
        const cap = new THREE.Mesh(this.sharedGeo.mushCap, side < 0 ? this.sharedMat.mushroomGlowCyanMat : this.sharedMat.mushroomGlowPinkMat);
        cap.position.y = 1.0;
        mush.add(stem, cap);
        mush.position.set(side * 6.5, 0, -2);
        sets[1].add(mush);

        // Đèn lồng đỏ treo cột gỗ ven đường
        const post = new THREE.Group();
        const pole = new THREE.Mesh(this.sharedGeo.postSlim, this.sharedMat.trunkMat);
        pole.position.y = 1.1;
        const lantern = new THREE.Mesh(this.sharedGeo.lanternBody, this.sharedMat.lanternRedMat);
        lantern.position.set(-side * 0.35, 2.0, 0);
        const capGold = new THREE.Mesh(this.sharedGeo.mushStem, this.sharedMat.lanternGoldMat);
        capGold.scale.set(0.6, 0.15, 0.6);
        capGold.position.set(-side * 0.35, 2.32, 0);
        post.add(pole, lantern, capGold);
        post.position.set(side * 5.8, 0, 12);
        sets[1].add(post);
      }

      // === SET 2: ỐC ĐẢO ALADDIN (SA MẠC THẬP PHÂN) ===
      for (const side of [-1, 1]) {
        // Kim tự tháp vàng có đỉnh pha lê sáng
        const pyr = new THREE.Group();
        const body = new THREE.Mesh(this.sharedGeo.pyramid, this.sharedMat.pyramidGoldMat);
        body.position.y = 2.1;
        body.rotation.y = Math.PI / 4;
        const tip = new THREE.Mesh(this.sharedGeo.octaProp, this.sharedMat.lanternGoldMat);
        tip.scale.set(0.45, 0.65, 0.45);
        tip.position.y = 4.4;
        pyr.add(body, tip);
        pyr.position.set(side * (12 + Math.random() * 4), 0, -6);
        sets[2].add(pyr);

        // Cây dừa / chà là ốc đảo
        const palm = new THREE.Group();
        const pTrunk = new THREE.Mesh(this.sharedGeo.trunk, this.sharedMat.palmTrunkMat);
        pTrunk.position.y = 1.5;
        pTrunk.scale.set(0.75, 1.7, 0.75);
        pTrunk.rotation.z = side * 0.12;
        palm.add(pTrunk);
        for (let l = 0; l < 4; l++) {
          const leaf = new THREE.Mesh(this.sharedGeo.palmLeaf, this.sharedMat.leafBrightMat);
          leaf.position.set(-side * 0.25, 3.05, 0);
          leaf.rotation.y = (l * Math.PI) / 2 + 0.4;
          leaf.rotation.z = 0.28;
          palm.add(leaf);
        }
        palm.position.set(side * 7.2, 0, 7);
        sets[2].add(palm);

        // Xương rồng hoạt hình có hoa đỏ
        const cactus = new THREE.Group();
        const cBody = new THREE.Mesh(this.sharedGeo.cactusBody, this.sharedMat.cactusMat);
        cBody.position.y = 0.9;
        const arm = new THREE.Mesh(this.sharedGeo.cactusArm, this.sharedMat.cactusMat);
        arm.position.set(-side * 0.4, 1.1, 0);
        arm.rotation.z = side * 0.5;
        const flower = new THREE.Mesh(this.sharedGeo.lanternBody, this.sharedMat.cactusFlowerMat);
        flower.scale.set(0.5, 0.5, 0.5);
        flower.position.y = 1.9;
        cactus.add(cBody, arm, flower);
        cactus.position.set(side * 6.2, 0, -12);
        sets[2].add(cactus);
      }

      // === SET 3: THÀNH PHỐ SAN FRANSOKYO CYBER (BIG HERO 6) ===
      for (const side of [-1, 1]) {
        // 2 Tòa nhà chọc trời Neon phát sáng
        for (const [zOff, h] of [[-8, 9.5], [7, 12.5]]) {
          const bld = new THREE.Group();
          const bMat = (zOff < 0) ? this.sharedMat.buildingDarkMat : this.sharedMat.buildingSlateMat;
          const mainBox = new THREE.Mesh(this.sharedGeo.boxBuilding, bMat);
          mainBox.scale.set(1.1, h, 1.1);
          mainBox.position.y = h / 2;
          bld.add(mainBox);

          // Dải đèn cửa sổ Neon ngang
          for (let wy = 2.0; wy < h - 1; wy += 2.4) {
            const winMat = ((Math.floor(wy) + (side > 0 ? 1 : 0)) % 2 === 0) ? this.sharedMat.neonCyanMat : this.sharedMat.neonPinkMat;
            const band = new THREE.Mesh(this.sharedGeo.neonStrip, winMat);
            band.scale.set(1.12, 1, 1.12);
            band.position.y = wy;
            bld.add(band);
          }
          bld.position.set(side * (9.8 + Math.random() * 2.5), 0, zOff);
          sets[3].add(bld);
        }

        // Cột cổng Torii công nghệ phát sáng ven đường
        const torii = new THREE.Group();
        const tp = new THREE.Mesh(this.sharedGeo.toriiPillar, this.sharedMat.neonPinkMat);
        tp.position.y = 2.1;
        const tb = new THREE.Mesh(this.sharedGeo.toriiBeam, this.sharedMat.neonCyanMat);
        tb.position.set(-side * 0.8, 3.8, 0);
        torii.add(tp, tb);
        torii.position.set(side * 6.0, 0, 0);
        sets[3].add(torii);
      }

      // === SET 4: VƯƠNG QUỐC BĂNG GIÁ (FROZEN / THUNG LŨNG HÌNH HỌC) ===
      for (const side of [-1, 1]) {
        // Cụm Tinh Thể Pha Lê Băng phát sáng
        const cluster = new THREE.Group();
        const c1 = new THREE.Mesh(this.sharedGeo.crystalSpike, this.sharedMat.crystalMat);
        c1.position.y = 1.8;
        const c2 = new THREE.Mesh(this.sharedGeo.crystalSpike, this.sharedMat.crystalMat);
        c2.position.set(0.65, 1.2, 0.3);
        c2.scale.set(0.7, 0.7, 0.7);
        c2.rotation.z = -0.35;
        const c3 = new THREE.Mesh(this.sharedGeo.crystalSpike, this.sharedMat.snowMat);
        c3.position.set(-0.6, 1.0, -0.2);
        c3.scale.set(0.6, 0.6, 0.6);
        c3.rotation.z = 0.3;
        cluster.add(c1, c2, c3);
        cluster.position.set(side * 7.8, 0, -7);
        sets[4].add(cluster);

        // Cây thông tuyết
        const pine = new THREE.Group();
        const pBody = new THREE.Mesh(this.sharedGeo.crystalSpike, this.sharedMat.icePineMat);
        pBody.scale.set(1.6, 1.0, 1.6);
        pBody.position.y = 1.8;
        const pSnow = new THREE.Mesh(this.sharedGeo.crystalSpike, this.sharedMat.snowMat);
        pSnow.scale.set(1.0, 0.45, 1.0);
        pSnow.position.y = 2.9;
        pine.add(pBody, pSnow);
        pine.position.set(side * 10.2, 0, 8);
        sets[4].add(pine);

        // Khối hình học phát sáng trên trụ (gắn với chủ đề Hình học lớp 5!)
        const geoPed = new THREE.Group();
        const ped = new THREE.Mesh(this.sharedGeo.mushStem, this.sharedMat.snowMat);
        ped.position.y = 0.5;
        const shape = new THREE.Mesh(side < 0 ? this.sharedGeo.octaProp : this.sharedGeo.cubeProp, this.sharedMat.crystalMat);
        shape.position.y = 1.9;
        shape.rotation.set(0.4, 0.6, 0.3);
        geoPed.add(ped, shape);
        geoPed.position.set(side * 6.3, 0, 1);
        sets[4].add(geoPed);
      }

      // === SET 5: ĐƯỜNG HẦM NGÂN HÀ (DORAEMON TIME TUNNEL / WALL-E SPACE) ===
      // 2 Vòng Cung Gia Tốc Lượng Tử vòm bắc ngang đường đua
      for (const [zOff, mat] of [[-7.5, this.sharedMat.warpRingMat], [7.5, this.sharedMat.warpRingAltMat]]) {
        const arch = new THREE.Mesh(this.sharedGeo.warpArch, mat);
        arch.position.set(0, 0, zOff);
        sets[5].add(arch);
      }
      // Thiên thạch & tinh thể không gian trôi 2 bên
      for (const side of [-1, 1]) {
        const rock = new THREE.Mesh(this.sharedGeo.asteroid, this.sharedMat.asteroidMat);
        rock.position.set(side * (9 + Math.random() * 4), 2.5 + Math.random() * 2, -2);
        rock.rotation.set(Math.random(), Math.random(), 0);
        const core = new THREE.Mesh(this.sharedGeo.octaProp, this.sharedMat.plasmaCoreMat);
        core.position.set(side * 6.6, 1.6, 8);
        core.scale.set(0.75, 0.75, 0.75);
        sets[5].add(rock, core);
      }

      this.segmentScenerySets.push(sets);
    }

    // Xây dựng 3 Cổng Năng Lượng 3D Nâng Cấp
    buildGateMeshes() {
      const archColors = [0x0284c7, 0xd97706, 0x7e22ce];
      const baseGeo = new THREE.CylinderGeometry(0.28, 0.36, 0.35, 6);
      const pillarGeo = new THREE.BoxGeometry(0.24, 3.2, 0.24);
      const beamGeo = new THREE.BoxGeometry(3.15, 0.34, 0.32);
      const orbGeo = new THREE.OctahedronGeometry(0.22, 0);

      for (let i = 0; i < 3; i++) {
        const gate = new THREE.Group();
        const archMat = new THREE.MeshLambertMaterial({
          color: archColors[i],
          emissive: archColors[i],
          emissiveIntensity: 0.25,
          flatShading: true
        });
        const orbMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

        const bLeft = new THREE.Mesh(baseGeo, archMat);
        bLeft.position.set(-1.4, 0.18, 0);
        const bRight = new THREE.Mesh(baseGeo, archMat);
        bRight.position.set(1.4, 0.18, 0);

        const pLeft = new THREE.Mesh(pillarGeo, archMat);
        pLeft.position.set(-1.4, 1.7, 0);
        const pRight = new THREE.Mesh(pillarGeo, archMat);
        pRight.position.set(1.4, 1.7, 0);

        const beam = new THREE.Mesh(beamGeo, archMat);
        beam.position.set(0, 3.3, 0);

        const orbL = new THREE.Mesh(orbGeo, orbMat);
        orbL.position.set(-1.4, 3.65, 0);
        const orbR = new THREE.Mesh(orbGeo, orbMat);
        orbR.position.set(1.4, 3.65, 0);

        gate.add(bLeft, bRight, pLeft, pRight, beam, orbL, orbR);

        // Mặt bảng hiển thị đáp án bằng CanvasTexture
        const panelGeo = new THREE.PlaneGeometry(2.7, 1.5);
        const panelMat = new THREE.MeshBasicMaterial({
          map: this.gateTextures[i],
          transparent: true,
          side: THREE.DoubleSide
        });
        const panel = new THREE.Mesh(panelGeo, panelMat);
        panel.position.set(0, 2.05, 0);
        gate.add(panel);

        gate.position.set(LANES[i], 0, -100);
        gate.visible = false;
        this.scene.add(gate);
        this.gateWave.meshes.push(gate);
      }
    }

    // Xây dựng Pool Xu Vàng 3D Lấp Lánh
    buildCoinPool() {
      const coinGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.12, 12);
      coinGeo.rotateX(Math.PI / 2);
      const starGeo = new THREE.OctahedronGeometry(0.18, 0);

      const coinMat = new THREE.MeshLambertMaterial({
        color: 0xfbbf24,
        emissive: 0xd97706,
        emissiveIntensity: 0.4,
        flatShading: true
      });
      const gemMat = new THREE.MeshBasicMaterial({ color: 0xfef9c3 });

      for (let i = 0; i < 15; i++) {
        const coinGroup = new THREE.Group();
        const coin = new THREE.Mesh(coinGeo, coinMat);
        const gem = new THREE.Mesh(starGeo, gemMat);
        gem.scale.set(1, 1, 0.5);
        coinGroup.add(coin, gem);

        coinGroup.visible = false;
        coinGroup.position.set(0, 0.85, 0);
        this.scene.add(coinGroup);
        this.coinPool.push(coinGroup);
      }
    }

    // Xây dựng Pool Hạt Vỡ 3D (Sửa lỗi scale & Tách vật liệu màu sắc)
    buildParticlePool() {
      const pGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);

      for (let i = 0; i < 60; i++) {
        const pMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
        const p = new THREE.Mesh(pGeo, pMat);
        p.visible = false;
        p.userData = { vx: 0, vy: 0, vz: 0, life: 0, maxLife: 0.6 };
        this.scene.add(p);
        this.particlePool.push(p);
      }
    }

    spawnExplosion(pos, color = 0xf59e0b, count = 18) {
      for (let i = 0; i < count; i++) {
        const p = this.particlePool[this.particleIndex];
        this.particleIndex = (this.particleIndex + 1) % this.particlePool.length;

        p.material.color.setHex(color);
        p.position.copy(pos);
        p.scale.set(1, 1, 1); // Reset kích thước chuẩn xác!
        p.visible = true;

        const speed = 4 + Math.random() * 6.5;
        const theta = Math.random() * Math.PI * 2;
        const phi = (Math.random() - 0.5) * Math.PI;

        p.userData.vx = Math.cos(theta) * Math.cos(phi) * speed;
        p.userData.vy = Math.sin(phi) * speed + 3.2;
        p.userData.vz = Math.sin(theta) * Math.cos(phi) * speed;
        p.userData.life = 0;
        p.userData.maxLife = 0.45 + Math.random() * 0.4;
      }
    }

    /* =========================================================================
     * 6. XÂY DỰNG NHÂN VẬT 3D, BOSS 3D ĐA CHẶNG & TIA LASER 3D
     * ========================================================================= */
    buildPlayer() {
      if (this.playerGroup) this.scene.remove(this.playerGroup);
      this.playerGroup = new THREE.Group();
      this.playerFlames = [];
      this.playerArmL = null;
      this.playerArmR = null;

      const skinId = this.selectedSkin;
      const flameGeo = new THREE.ConeGeometry(0.16, 0.65, 5);
      flameGeo.rotateX(Math.PI / 2);

      if (skinId === 2) {
        // Skin 2: Rô-bốt Thám Hiểm (Baymax / Wall-E Style)
        const bodyMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc, flatShading: true });
        const trimMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b, flatShading: true });

        const body = new THREE.Mesh(new THREE.BoxGeometry(0.92, 1.0, 0.68), bodyMat);
        body.position.y = 0.65;
        const chest = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.35, 0.72), trimMat);
        chest.position.y = 0.75;
        this.playerGroup.add(body, chest);

        const head = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.55, 0.6), bodyMat);
        head.position.y = 1.45;
        this.playerGroup.add(head);

        // Mắt LED biểu cảm
        const visor = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.24, 0.1), new THREE.MeshBasicMaterial({ color: 0x0f172a }));
        visor.position.set(0, 1.45, -0.28);
        const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
        eyeL.position.set(-0.15, 1.45, -0.32);
        const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
        eyeR.position.set(0.15, 1.45, -0.32);
        this.playerGroup.add(visor, eyeL, eyeR);

        // Ăng-ten trên đầu
        const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.35, 5), trimMat);
        ant.position.set(0, 1.85, 0);
        const antTip = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
        antTip.position.set(0, 2.02, 0);
        this.playerGroup.add(ant, antTip);

        // 2 tay vung vẩy
        const armGeo = new THREE.BoxGeometry(0.22, 0.65, 0.22);
        this.playerArmL = new THREE.Mesh(armGeo, trimMat);
        this.playerArmL.position.set(-0.62, 0.65, 0);
        this.playerArmR = new THREE.Mesh(armGeo, trimMat);
        this.playerArmR.position.set(0.62, 0.65, 0);
        this.playerGroup.add(this.playerArmL, this.playerArmR);

        // Ba lô tên lửa + 2 tia lửa
        const pack = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.65, 0.28), trimMat);
        pack.position.set(0, 0.72, 0.42);
        this.playerGroup.add(pack);

        const fMat = new THREE.MeshBasicMaterial({ color: 0xfb923c });
        for (const fx of [-0.18, 0.18]) {
          const fl = new THREE.Mesh(flameGeo, fMat);
          fl.position.set(fx, 0.48, 0.68);
          this.playerGroup.add(fl);
          this.playerFlames.push(fl);
        }
      } else if (skinId === 3) {
        // Skin 3: Phi Thuyền Hỏa Long Đỏ (Siêu phản lực cánh kép & viền vàng)
        const hullMat = new THREE.MeshLambertMaterial({ color: 0xe11d48, flatShading: true });
        const goldMat = new THREE.MeshLambertMaterial({ color: 0xfbbf24, flatShading: true });
        const darkMat = new THREE.MeshLambertMaterial({ color: 0x881337, flatShading: true });

        const hull = new THREE.Mesh(new THREE.ConeGeometry(0.68, 2.6, 6), hullMat);
        hull.rotateX(-Math.PI / 2);
        hull.position.y = 0.65;
        this.playerGroup.add(hull);

        const wings = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.08, 0.85), darkMat);
        wings.position.set(0, 0.58, 0.25);
        const wingTipsL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.45, 0.9), goldMat);
        wingTipsL.position.set(-1.3, 0.7, 0.35);
        const wingTipsR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.45, 0.9), goldMat);
        wingTipsR.position.set(1.3, 0.7, 0.35);
        this.playerGroup.add(wings, wingTipsL, wingTipsR);

        const canopy = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.32, 0.7), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
        canopy.position.set(0, 0.92, -0.2);
        this.playerGroup.add(canopy);

        const fMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });
        for (const fx of [-0.4, 0, 0.4]) {
          const fl = new THREE.Mesh(flameGeo, fMat);
          fl.position.set(fx, 0.6, 1.35);
          this.playerGroup.add(fl);
          this.playerFlames.push(fl);
        }
      } else {
        // Skin 1: Chiến Hạm Tia Chớp (Nâng cấp chi tiết & 2 động cơ Cyan)
        const shipMat = new THREE.MeshLambertMaterial({ color: 0x0ea5e9, flatShading: true });
        const wingMat = new THREE.MeshLambertMaterial({ color: 0x0369a1, flatShading: true });
        const neonMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

        const ship = new THREE.Mesh(new THREE.ConeGeometry(0.65, 2.4, 6), shipMat);
        ship.rotateX(-Math.PI / 2);
        ship.position.y = 0.62;
        this.playerGroup.add(ship);

        const wings = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.08, 0.82), wingMat);
        wings.position.set(0, 0.56, 0.2);
        const trimL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.38, 0.75), neonMat);
        trimL.position.set(-1.15, 0.66, 0.25);
        const trimR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.38, 0.75), neonMat);
        trimR.position.set(1.15, 0.66, 0.25);
        this.playerGroup.add(wings, trimL, trimR);

        const canopy = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.3, 0.65), new THREE.MeshBasicMaterial({ color: 0xbae6fd }));
        canopy.position.set(0, 0.88, -0.18);
        this.playerGroup.add(canopy);

        const fMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
        for (const fx of [-0.32, 0.32]) {
          const fl = new THREE.Mesh(flameGeo, fMat);
          fl.position.set(fx, 0.56, 1.28);
          this.playerGroup.add(fl);
          this.playerFlames.push(fl);
        }
      }

      // Hào quang Combo dưới thân phi thuyền
      const auraGeo = new THREE.RingGeometry(0.95, 1.25, 20);
      auraGeo.rotateX(-Math.PI / 2);
      const auraMat = new THREE.MeshBasicMaterial({ color: 0xfde047, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
      this.playerAura = new THREE.Mesh(auraGeo, auraMat);
      this.playerAura.position.set(0, 0.08, 0);
      this.playerAura.visible = false;
      this.playerGroup.add(this.playerAura);

      this.playerGroup.position.set(0, 0, 0);
      this.scene.add(this.playerGroup);

      // BLOB SHADOW (GIỮ 60 FPS)
      if (this.blobShadow) this.scene.remove(this.blobShadow);
      const shadowGeo = new THREE.CircleGeometry(0.9, 14);
      shadowGeo.rotateX(-Math.PI / 2);
      const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.45,
        depthWrite: false
      });
      this.blobShadow = new THREE.Mesh(shadowGeo, shadowMat);
      this.blobShadow.position.set(0, 0.02, 0);
      this.scene.add(this.blobShadow);
    }

    buildBossMesh() {
      this.bossMesh = new THREE.Group();
      this.bossStageParts = {};

      // 1. Thân lõi Đại Boss
      const coreGeo = new THREE.DodecahedronGeometry(2.1, 0);
      const coreMat = new THREE.MeshLambertMaterial({ color: 0xf43f5e, flatShading: true });
      const core = new THREE.Mesh(coreGeo, coreMat);
      this.bossMesh.add(core);

      // 2. Vòng Hào Quang Ma Thuật xoay sau lưng Boss
      const haloGeo = new THREE.TorusGeometry(3.2, 0.14, 6, 20);
      const haloMat = new THREE.MeshBasicMaterial({ color: 0xfde047, transparent: true, opacity: 0.75 });
      this.bossHalo = new THREE.Mesh(haloGeo, haloMat);
      this.bossHalo.position.z = -1.2;
      this.bossMesh.add(this.bossHalo);

      // 3. Đôi mắt Boss rực sáng nổi bật
      const eyeVisor = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.55, 0.4), new THREE.MeshBasicMaterial({ color: 0x0f172a }));
      eyeVisor.position.set(0, 0.45, 1.85);
      const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.26, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
      eyeL.position.set(-0.55, 0.45, 2.05);
      const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.26, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
      eyeR.position.set(0.55, 0.45, 2.05);
      this.bossMesh.add(eyeVisor, eyeL, eyeR);

      // 4. Phụ kiện đặc trưng cho 5 Boss
      const goldMat = new THREE.MeshLambertMaterial({ color: 0xfbbf24, flatShading: true });
      const redMat = new THREE.MeshLambertMaterial({ color: 0xe11d48, flatShading: true });
      const cyberMat = new THREE.MeshLambertMaterial({ color: 0x9333ea, flatShading: true });
      const iceMat = new THREE.MeshLambertMaterial({ color: 0x22d3ee, emissive: 0x0891b2, emissiveIntensity: 0.4, flatShading: true });

      // Boss 1: Vua Khỉ (Vương miện vàng + Tay cầm gậy Như Ý)
      const g1 = new THREE.Group();
      for (const cx of [-0.6, 0, 0.6]) {
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.85, 4), goldMat);
        spike.position.set(cx, 2.3, 0);
        g1.add(spike);
      }
      const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 5.4, 6), goldMat);
      staff.rotation.z = Math.PI / 5;
      staff.position.set(2.2, 0, 0.6);
      g1.add(staff);
      this.bossMesh.add(g1);
      this.bossStageParts[1] = g1;

      // Boss 2: Bọ Cạp Khổng Lồ (2 Càng lớn + Đuôi cong chĩa kim độc đỏ)
      const g2 = new THREE.Group();
      for (const side of [-1, 1]) {
        const pincer = new THREE.Mesh(new THREE.ConeGeometry(0.8, 2.4, 5), goldMat);
        pincer.rotation.x = Math.PI / 2;
        pincer.rotation.z = side * -0.4;
        pincer.position.set(side * 2.5, -0.4, 1.2);
        g2.add(pincer);
      }
      const tail1 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.2, 0.7), goldMat);
      tail1.position.set(0, 2.4, -0.5);
      tail1.rotation.x = 0.45;
      const stinger = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.4, 5), redMat);
      stinger.position.set(0, 3.4, 0.6);
      stinger.rotation.x = Math.PI / 1.4;
      g2.add(tail1, stinger);
      this.bossMesh.add(g2);
      this.bossStageParts[2] = g2;

      // Boss 3: Hải Tặc Cyber (Nón tam giác neon + Cánh phản lực tím)
      const g3 = new THREE.Group();
      const hat = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.85, 1.4), cyberMat);
      hat.position.set(0, 2.25, 0.2);
      const skull = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), new THREE.MeshBasicMaterial({ color: 0x22d3ee }));
      skull.position.set(0, 2.25, 0.95);
      g3.add(hat, skull);
      for (const side of [-1, 1]) {
        const wing = new THREE.Mesh(new THREE.ConeGeometry(1.0, 3.6, 4), cyberMat);
        wing.rotateZ(side * Math.PI / 2.6);
        wing.position.set(side * 2.8, 0.1, 0);
        g3.add(wing);
      }
      this.bossMesh.add(g3);
      this.bossStageParts[3] = g3;

      // Boss 4: Người Đá Pha Lê (Vai gai pha lê băng & vương miện kim cương)
      const g4 = new THREE.Group();
      for (const side of [-1, 1]) {
        const sh = new THREE.Mesh(new THREE.ConeGeometry(1.1, 3.2, 5), iceMat);
        sh.rotation.z = side * -0.5;
        sh.position.set(side * 2.4, 0.8, 0);
        g4.add(sh);
      }
      const crystalTop = new THREE.Mesh(new THREE.OctahedronGeometry(0.95, 0), iceMat);
      crystalTop.position.set(0, 2.5, 0);
      g4.add(crystalTop);
      this.bossMesh.add(g4);
      this.bossStageParts[4] = g4;

      // Boss 5: Rồng Thần Bão Tố (Sừng rồng vàng + 4 Cánh rồng lớn)
      const g5 = new THREE.Group();
      for (const side of [-1, 1]) {
        const horn = new THREE.Mesh(new THREE.ConeGeometry(0.32, 1.8, 5), goldMat);
        horn.rotation.z = side * -0.4;
        horn.position.set(side * 1.1, 2.3, 0.4);
        const w1 = new THREE.Mesh(new THREE.ConeGeometry(1.3, 4.4, 4), redMat);
        w1.rotateZ(side * Math.PI / 2.8);
        w1.position.set(side * 3.1, 0.4, -0.3);
        const w2 = new THREE.Mesh(new THREE.ConeGeometry(0.9, 3.2, 4), goldMat);
        w2.rotateZ(side * Math.PI / 2.2);
        w2.position.set(side * 2.6, -0.7, -0.3);
        g5.add(horn, w1, w2);
      }
      this.bossMesh.add(g5);
      this.bossStageParts[5] = g5;

      this.bossMesh.position.set(0, 2.0, -22);
      this.bossMesh.visible = false;
      this.scene.add(this.bossMesh);
      this.updateBossVisuals(1);
    }

    updateBossVisuals(stageId) {
      if (!this.bossMesh) return;
      const theme = STAGE_THEMES[stageId] || STAGE_THEMES[1];
      if (this.bossMesh.children[0]) {
        this.bossMesh.children[0].material.color.setHex(theme.bossColor);
      }
      for (let k = 1; k <= 5; k++) {
        if (this.bossStageParts[k]) {
          this.bossStageParts[k].visible = (k === stageId);
        }
      }
    }

    buildLaserBeam() {
      const geo = new THREE.CylinderGeometry(0.2, 0.35, 24, 8);
      geo.rotateX(Math.PI / 2);
      const mat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.9
      });
      this.laserMesh = new THREE.Mesh(geo, mat);
      this.laserMesh.visible = false;
      this.scene.add(this.laserMesh);
    }

    /* =========================================================================
     * 7. ZERO-ALLOCATION CẬP NHẬT CỔNG ĐÁP ÁN (TEXT ON 3D)
     * ========================================================================= */
    renderGateTextures(questionData) {
      const gateStyles = [
        {
          grad0: 'rgba(14, 165, 233, 0.95)',
          grad1: 'rgba(2, 132, 199, 0.9)',
          border: '#38bdf8',
          letterBg: '#0284c7'
        },
        {
          grad0: 'rgba(245, 158, 11, 0.95)',
          grad1: 'rgba(217, 119, 6, 0.9)',
          border: '#fbbf24',
          letterBg: '#d97706'
        },
        {
          grad0: 'rgba(168, 85, 247, 0.95)',
          grad1: 'rgba(126, 34, 206, 0.9)',
          border: '#c084fc',
          letterBg: '#9333ea'
        }
      ];

      for (let i = 0; i < 3; i++) {
        const canvas = this.gateCanvases[i];
        const ctx = this.gateContexts[i];
        const option = questionData.options[i];
        const style = gateStyles[i];

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, style.grad0);
        grad.addColorStop(1, style.grad1);
        ctx.fillStyle = grad;
        ctx.fillRect(8, 8, canvas.width - 16, canvas.height - 16);

        ctx.strokeStyle = style.border;
        ctx.lineWidth = 12;
        ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

        const letters = ['A', 'B', 'C'];
        ctx.fillStyle = style.letterBg;
        ctx.fillRect(20, 18, 140, 44);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(20, 18, 140, 44);

        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 30px Nunito, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`CỔNG ${letters[i]}`, 90, 40);

        const text = (option.text || '').trim();
        const mixedMatch = text.match(/^(\d+)\s+(\d+)\/(\d+)$/);
        const fracMatch = text.match(/^(\d+)\/(\d+)$/);

        if (mixedMatch) {
          const whole = mixedMatch[1];
          const num = mixedMatch[2];
          const den = mixedMatch[3];
          const centerY = canvas.height / 2 + 14;

          ctx.font = 'bold 64px Nunito, sans-serif';
          const wholeW = ctx.measureText(whole).width;
          ctx.font = 'bold 46px Nunito, sans-serif';
          const numW = ctx.measureText(num).width;
          const denW = ctx.measureText(den).width;
          const fracW = Math.max(numW, denW) + 16;
          const gap = 12;
          const totalW = wholeW + gap + fracW;

          const startX = (canvas.width - totalW) / 2;
          const wholeX = startX + wholeW / 2;
          const fracX = startX + wholeW + gap + fracW / 2;

          ctx.font = 'bold 64px Nunito, sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
          ctx.shadowBlur = 12;
          ctx.fillText(whole, wholeX, centerY);

          ctx.font = 'bold 46px Nunito, sans-serif';
          ctx.textBaseline = 'bottom';
          ctx.fillText(num, fracX, centerY - 4);

          ctx.shadowBlur = 0;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(fracX - fracW / 2, centerY);
          ctx.lineTo(fracX + fracW / 2, centerY);
          ctx.stroke();

          ctx.shadowBlur = 12;
          ctx.textBaseline = 'top';
          ctx.fillText(den, fracX, centerY + 6);
          ctx.shadowBlur = 0;

        } else if (fracMatch) {
          const num = fracMatch[1];
          const den = fracMatch[2];
          const centerY = canvas.height / 2 + 14;

          ctx.font = 'bold 58px Nunito, sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
          ctx.shadowBlur = 12;

          ctx.textBaseline = 'bottom';
          ctx.fillText(num, canvas.width / 2, centerY - 4);

          const numW = ctx.measureText(num).width;
          const denW = ctx.measureText(den).width;
          const lineW = Math.max(numW, denW) + 24;

          ctx.shadowBlur = 0;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 7;
          ctx.beginPath();
          ctx.moveTo(canvas.width / 2 - lineW / 2, centerY);
          ctx.lineTo(canvas.width / 2 + lineW / 2, centerY);
          ctx.stroke();

          ctx.shadowBlur = 12;
          ctx.textBaseline = 'top';
          ctx.fillText(den, canvas.width / 2, centerY + 6);
          ctx.shadowBlur = 0;

        } else {
          let fontSize = 68;
          if (text.length > 12) fontSize = 42;
          else if (text.length > 8) fontSize = 52;
          else if (text.length > 5) fontSize = 60;

          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${fontSize}px Nunito, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
          ctx.shadowBlur = 14;

          ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 18);
          ctx.shadowBlur = 0;
        }

        this.gateTextures[i].needsUpdate = true;
      }
    }

    /* =========================================================================
     * 8. ĐIỀU KHIỂN, SỰ KIỆN ĐA THIẾT BỊ & BẢNG NHÁP MINI
     * ========================================================================= */
    setupControls() {
      window.addEventListener('keydown', (e) => {
        if (this.state === STATES.MENU) {
          if (e.code === 'Space' || e.code === 'Enter') this.startStage(1);
          return;
        }

        if (this.state === STATES.EXPLAIN) {
          if (e.code === 'Space' || e.code === 'Enter') this.resumeAfterExplain();
          return;
        }

        if (this.state === STATES.PLAYING || this.state === STATES.BOSS) {
          if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.moveLane(-1);
          else if (e.code === 'KeyD' || e.code === 'ArrowRight') this.moveLane(1);
          else if (e.code === 'Digit1' || e.code === 'Numpad1') this.selectLaneDirectly(0);
          else if (e.code === 'Digit2' || e.code === 'Numpad2') this.selectLaneDirectly(1);
          else if (e.code === 'Digit3' || e.code === 'Numpad3') this.selectLaneDirectly(2);
          else if (e.code === 'Enter' || e.code === 'NumpadEnter') this.confirmObstaclePass();
          else if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') this.jump();
          else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.toggleSlowMo();
          else if (e.code === 'KeyP' || e.code === 'Escape') this.pauseGame();
        } else if (this.state === STATES.PAUSED) {
          if (e.code === 'KeyP' || e.code === 'Escape') this.resumeGame();
        }
      });

      const unlockAudio = () => this.sound.init();
      ['touchstart', 'touchend', 'pointerdown', 'mousedown', 'keydown'].forEach(evt => {
        window.addEventListener(evt, unlockAudio, { passive: true, once: true });
      });

      let touchStartX = 0;
      let touchStartY = 0;
      let touchStartTime = 0;

      window.addEventListener('touchstart', (e) => {
        if (!e.touches || e.touches.length === 0) return;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
      }, { passive: true });

      window.addEventListener('touchend', (e) => {
        if (!e.changedTouches || e.changedTouches.length === 0) return;
        const target = e.target;
        if (target && target.closest && (target.closest('button') || target.closest('.pointer-events-auto') || target.closest('#scratchpad-modal') || target.closest('#explain-modal') || target.closest('#menu-screen') || target.closest('#victory-modal') || target.closest('#gameover-modal') || target.closest('#pause-modal') || target.closest('#shop-modal'))) {
          return;
        }

        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        const dt = Date.now() - touchStartTime;

        if (dt < 450) {
          if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 24) {
            if (dx > 0) this.moveLane(1);
            else this.moveLane(-1);
          } else if (dy < -26) {
            this.jump();
          } else if (dy > 30) {
            this.toggleSlowMo();
          }
        }
      }, { passive: true });

      const bindTouchBtn = (id, action) => {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.sound.init();
          action();
        });
      };

      bindTouchBtn('hud-opt-0', () => this.selectLaneDirectly(0));
      bindTouchBtn('hud-opt-1', () => this.selectLaneDirectly(1));
      bindTouchBtn('hud-opt-2', () => this.selectLaneDirectly(2));
      bindTouchBtn('btn-confirm-obstacle', () => this.confirmObstaclePass());

      bindTouchBtn('btn-touch-left', () => this.moveLane(-1));
      bindTouchBtn('btn-touch-right', () => this.moveLane(1));
      bindTouchBtn('btn-touch-jump', () => this.jump());
      bindTouchBtn('btn-touch-slowmo', () => this.toggleSlowMo());
      bindTouchBtn('btn-slowmo', () => this.toggleSlowMo());
      bindTouchBtn('btn-scratchpad', () => this.toggleScratchpad());
      bindTouchBtn('btn-pause', () => this.pauseGame());
    }

    setupWindowEvents() {
      window.addEventListener('resize', () => {
        if (!this.camera || !this.renderer) return;
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera.aspect = width / height;
        const isPortrait = width < height;
        this.camera.fov = isPortrait ? 78 : (this.combo >= 3 ? 70 : 60);
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
      });

      document.addEventListener('visibilitychange', () => {
        if (document.hidden && (this.state === STATES.PLAYING || this.state === STATES.BOSS)) {
          this.pauseGame();
        }
      });
    }

    initScratchpad() {
      this.scratchpadCanvas = document.getElementById('scratchpad-canvas');
      if (!this.scratchpadCanvas) return;
      this.scratchpadCtx = this.scratchpadCanvas.getContext('2d');

      const getPos = (e) => {
        const rect = this.scratchpadCanvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
          x: clientX - rect.left,
          y: clientY - rect.top
        };
      };

      const startDraw = (e) => {
        e.preventDefault();
        this.scratchpadDrawing = true;
        const pos = getPos(e);
        this.scratchpadCtx.beginPath();
        this.scratchpadCtx.moveTo(pos.x, pos.y);
      };

      const moveDraw = (e) => {
        if (!this.scratchpadDrawing) return;
        e.preventDefault();
        const pos = getPos(e);
        this.scratchpadCtx.lineTo(pos.x, pos.y);
        this.scratchpadCtx.strokeStyle = '#fde047';
        this.scratchpadCtx.lineWidth = 3;
        this.scratchpadCtx.lineCap = 'round';
        this.scratchpadCtx.lineJoin = 'round';
        this.scratchpadCtx.stroke();
      };

      const endDraw = () => {
        this.scratchpadDrawing = false;
      };

      this.scratchpadCanvas.addEventListener('pointerdown', startDraw);
      this.scratchpadCanvas.addEventListener('pointermove', moveDraw);
      window.addEventListener('pointerup', endDraw);
    }

    toggleScratchpad(forceState) {
      const modal = document.getElementById('scratchpad-modal');
      if (!modal) return;
      const shouldShow = typeof forceState === 'boolean' ? forceState : modal.classList.contains('hidden');
      if (shouldShow) {
        modal.classList.remove('hidden');
        if (this.scratchpadCanvas) {
          const rect = this.scratchpadCanvas.getBoundingClientRect();
          if (this.scratchpadCanvas.width !== Math.floor(rect.width) || this.scratchpadCanvas.height !== Math.floor(rect.height)) {
            this.scratchpadCanvas.width = Math.max(200, Math.floor(rect.width));
            this.scratchpadCanvas.height = Math.max(120, Math.floor(rect.height));
          }
        }
      } else {
        modal.classList.add('hidden');
      }
    }

    clearScratchpad() {
      if (this.scratchpadCtx && this.scratchpadCanvas) {
        this.scratchpadCtx.clearRect(0, 0, this.scratchpadCanvas.width, this.scratchpadCanvas.height);
      }
    }

    selectLaneDirectly(laneIndex) {
      if (this.state !== STATES.PLAYING && this.state !== STATES.BOSS) return;
      if (laneIndex >= 0 && laneIndex <= 2) {
        this.playerLaneIndex = laneIndex;
        this.playerTargetX = LANES[this.playerLaneIndex];
        this.sound.playLaneChange();
        this.updateSelectedOptionUI();
      }
    }

    moveLane(direction) {
      if (this.state !== STATES.PLAYING && this.state !== STATES.BOSS) return;
      const nextIndex = this.playerLaneIndex + direction;
      if (nextIndex >= 0 && nextIndex <= 2) {
        this.playerLaneIndex = nextIndex;
        this.playerTargetX = LANES[this.playerLaneIndex];
        this.sound.playLaneChange();
        this.updateSelectedOptionUI();
      }
    }

    updateOptionsHUD(q) {
      for (let i = 0; i < 3; i++) {
        const textEl = document.getElementById(`hud-opt-text-${i}`);
        if (textEl && q && q.options && q.options[i]) {
          textEl.innerHTML = formatMathHTML(q.options[i].text);
        }
      }
      this.updateSelectedOptionUI();
    }

    updateSelectedOptionUI() {
      for (let i = 0; i < 3; i++) {
        const btn = document.getElementById(`hud-opt-${i}`);
        const badge = document.getElementById(`hud-opt-badge-${i}`);
        if (!btn) continue;

        const isSelected = (this.playerLaneIndex === i);
        if (isSelected) {
          btn.classList.add('ring-2', 'ring-white', 'scale-105', 'z-10');
          if (i === 0) btn.classList.add('bg-sky-500/40', 'border-sky-300', 'shadow-[0_0_15px_rgba(56,189,248,0.5)]');
          if (i === 1) btn.classList.add('bg-amber-500/40', 'border-amber-300', 'shadow-[0_0_15px_rgba(245,158,11,0.5)]');
          if (i === 2) btn.classList.add('bg-purple-500/40', 'border-purple-300', 'shadow-[0_0_15px_rgba(168,85,247,0.5)]');
          if (badge) badge.classList.remove('hidden');
        } else {
          btn.classList.remove(
            'ring-2', 'ring-white', 'scale-105', 'z-10',
            'bg-sky-500/40', 'border-sky-300', 'shadow-[0_0_15px_rgba(56,189,248,0.5)]',
            'bg-amber-500/40', 'border-amber-300', 'shadow-[0_0_15px_rgba(245,158,11,0.5)]',
            'bg-purple-500/40', 'border-purple-300', 'shadow-[0_0_15px_rgba(168,85,247,0.5)]'
          );
          if (badge) badge.classList.add('hidden');
        }
      }
    }

    confirmObstaclePass() {
      if ((this.state !== STATES.PLAYING && this.state !== STATES.BOSS) || !this.gateWave.active || this.gateWave.resolved) return;

      this.toggleScratchpad(false);
      this.sound.playBoost();
      this.gateWave.resolved = true;
      const chosenLane = this.playerLaneIndex;
      const q = this.gateWave.questionData;
      const isCorrect = (chosenLane === q.correctIndex);

      const timeBonus = Math.max(0, Math.floor(this.questionTimeRemaining));

      this.gateWave.z = 0;
      this.gateWave.meshes.forEach(m => m.position.z = 0);

      if (isCorrect) {
        if (timeBonus > 0) {
          this.score += timeBonus;
          this.showTimeBonusToast(timeBonus);
        }
        this.handleCorrectAnswer();
      } else {
        this.handleWrongAnswer(q, false);
      }
    }

    handleQuestionTimeout() {
      if (!this.gateWave.active || this.gateWave.resolved) return;
      this.toggleScratchpad(false);
      this.gateWave.resolved = true;
      const chosenLane = this.playerLaneIndex;
      const q = this.gateWave.questionData;
      const isCorrect = (chosenLane === q.correctIndex);

      this.gateWave.z = 0;
      this.gateWave.meshes.forEach(m => m.position.z = 0);

      if (isCorrect) {
        this.handleCorrectAnswer();
      } else {
        this.handleWrongAnswer(q, true);
      }
    }

    showTimeBonusToast(bonus) {
      const toast = document.getElementById('hud-bonus-toast');
      const sub = document.getElementById('hud-bonus-toast-sub');
      if (toast && sub) {
        sub.textContent = `+${bonus}s Thưởng Tốc Độ (+${bonus} điểm)`;
        toast.classList.remove('hidden');
        setTimeout(() => {
          toast.classList.add('hidden');
        }, 1500);
      }
    }

    updateTimerHUD() {
      const timerEl = document.getElementById('hud-question-timer');
      const secEl = document.getElementById('hud-timer-seconds');
      const barEl = document.getElementById('hud-question-timer-bar');
      const badgeEl = document.getElementById('hud-timer-badge');

      const remaining = Math.max(0, this.questionTimeRemaining);
      const minutes = Math.floor(remaining / 60);
      const seconds = Math.floor(remaining % 60);
      const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

      if (timerEl) timerEl.textContent = formatted;
      if (secEl) secEl.textContent = `${Math.ceil(remaining)}s`;

      const pct = Math.max(0, Math.min(100, (remaining / this.questionTimeLimit) * 100));
      if (barEl) {
        barEl.style.width = `${pct}%`;
        if (remaining <= 10) {
          barEl.className = 'h-full bg-gradient-to-r from-rose-500 to-amber-500 w-full transition-all duration-75 animate-pulse';
        } else if (remaining <= 25) {
          barEl.className = 'h-full bg-gradient-to-r from-amber-400 to-yellow-400 w-full transition-all duration-100';
        } else {
          barEl.className = 'h-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-sky-400 w-full transition-all duration-100';
        }
      }

      if (badgeEl) {
        if (remaining <= 10) {
          badgeEl.className = 'flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-950/90 border border-rose-500/80 shadow-inner animate-pulse';
          if (timerEl) timerEl.className = 'font-mono text-xs sm:text-sm font-black text-rose-400';
        } else if (remaining <= 25) {
          badgeEl.className = 'flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950/90 border border-amber-500/80 shadow-inner';
          if (timerEl) timerEl.className = 'font-mono text-xs sm:text-sm font-black text-amber-300';
        } else {
          badgeEl.className = 'flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/90 border border-cyan-400/60 shadow-inner';
          if (timerEl) timerEl.className = 'font-mono text-xs sm:text-sm font-black text-cyan-300';
        }
      }
    }

    jump() {
      if ((this.state !== STATES.PLAYING && this.state !== STATES.BOSS) || this.isJumping) return;
      this.isJumping = true;
      this.playerVelY = JUMP_VELOCITY;
      this.sound.playJump();
    }

    toggleSlowMo() {
      if (this.slowMoEnergy < 20 && !this.isSlowMoActive) return;
      this.isSlowMoActive = !this.isSlowMoActive;
      const overlay = document.getElementById('slowmo-overlay');
      if (overlay) overlay.style.opacity = this.isSlowMoActive ? '1' : '0';
    }

    /* =========================================================================
     * 9. QUẢN LÝ TIẾN ĐỘ & TRẠNG THÁI GAME (KHÔNG LỖI ĐỆ QUY)
     * ========================================================================= */
    selectStage(stageId) {
      this.currentStageId = stageId;
      this.isEndlessMode = false;
      this.startStage(stageId);
    }

    startEndlessMode() {
      this.isEndlessMode = true;
      this.currentStageId = 1;
      this.startStage(1);
    }

    startStage(stageId) {
      this.currentStageId = stageId;
      this.questionIndex = 0;
      this.hearts = 3;
      this.combo = 0;
      this.score = 0;
      this.coins = 0;
      this.slowMoEnergy = 100;
      this.isSlowMoActive = false;
      this.playerLaneIndex = 1;
      this.playerTargetX = LANES[1];
      this.playerPosY = 0;
      this.playerVelY = 0;
      this.isJumping = false;
      this.invulnerableTimer = 0;
      if (this.playerGroup) this.playerGroup.rotation.set(0, 0, 0);

      // Cập nhật toàn bộ không gian 3D theo chủ đề hoạt hình của chặng
      this.applyStageTheme(stageId);

      // Ẩn vật thể vòng cũ
      this.coinPool.forEach(c => c.visible = false);
      this.particlePool.forEach(p => p.visible = false);
      if (this.laserMesh) this.laserMesh.visible = false;
      this.laserTimer = 0;

      if (this.bossMesh) this.bossMesh.visible = false;
      const bossHud = document.getElementById('boss-hud');
      if (bossHud) bossHud.classList.add('hidden');

      this.hideAllModals();
      this.toggleScratchpad(false);
      this.clearScratchpad();

      const hud = document.getElementById('hud-container');
      if (hud) hud.classList.remove('hidden');

      this.updateHUD();
      this.updateSelectedOptionUI();
      this.state = STATES.PLAYING;

      this.spawnNextQuestion();
    }

    spawnNextQuestion() {
      if (this.state === STATES.BOSS) {
        this.spawnBossQuestion();
        return;
      }

      this.questionIndex++;

      if (!this.isEndlessMode && this.questionIndex > this.questionsPerStage) {
        this.startBossFight();
        return;
      }

      this.initQuestionRound();
    }

    initQuestionRound() {
      this.questionTimeLimit = 60.0;
      this.questionTimeRemaining = 60.0;
      this.lastTickSecond = 60;
      this.updateTimerHUD();

      const q = window.MathEngine5.generate(this.isEndlessMode ? 'endless' : this.currentStageId);

      // Chế độ Vô Tận: tự động chuyển thế giới 3D theo chủ đề câu hỏi!
      if (this.isEndlessMode && q.stageId && q.stageId !== this.activeThemeId) {
        this.applyStageTheme(q.stageId);
      }

      this.gateWave.questionData = q;
      this.gateWave.z = -100;
      this.gateWave.resolved = false;
      this.gateWave.active = true;

      this.renderGateTextures(q);

      for (let i = 0; i < 3; i++) {
        const mesh = this.gateWave.meshes[i];
        mesh.position.set(LANES[i], 0, -100);
        mesh.visible = true;
      }

      this.spawnCoinsBetweenGates(-100, -25);
      this.updateQuestionCard(q);
    }

    spawnBossQuestion() {
      this.initQuestionRound();
    }

    spawnCoinsBetweenGates(startZ, endZ) {
      let poolIdx = 0;
      for (let z = startZ + 18; z < endZ; z += 12) {
        if (Math.random() > 0.25 && poolIdx < this.coinPool.length) {
          const coin = this.coinPool[poolIdx++];
          const lane = randChoice(LANES);
          coin.position.set(lane, 0.85, z);
          coin.visible = true;
        }
      }
    }

    updateQuestionCard(q) {
      const qText = document.getElementById('hud-question-text');
      const qNum = document.getElementById('hud-question-number');
      const stName = document.getElementById('hud-stage-name');
      const svgBox = document.getElementById('hud-svg-container');

      if (qText) qText.innerHTML = formatMathHTML(q.question);
      if (qNum) {
        if (this.state === STATES.BOSS) {
          qNum.textContent = `💥 ĐẤU BOSS (${this.bossCurrentHP} / ${this.bossMaxHP} HP)`;
        } else if (this.isEndlessMode) {
          qNum.textContent = `Chướng ngại vật ${this.questionIndex}`;
        } else {
          qNum.textContent = `Chướng ngại vật ${this.questionIndex} / ${this.questionsPerStage}`;
        }
      }
      if (stName) {
        const theme = STAGE_THEMES[this.activeThemeId] || STAGE_THEMES[1];
        if (this.state === STATES.BOSS) {
          stName.innerHTML = `<span>👾</span> <span class="truncate">${theme.bossName.toUpperCase()}</span>`;
        } else {
          stName.innerHTML = `<span>${theme.icon}</span> <span class="truncate">${this.isEndlessMode ? theme.worldTitle.toUpperCase() : theme.name.toUpperCase()}</span>`;
        }
      }

      if (svgBox) {
        if (q.svg) {
          svgBox.innerHTML = q.svg;
          svgBox.classList.remove('hidden');
        } else {
          svgBox.innerHTML = '';
          svgBox.classList.add('hidden');
        }
      }

      this.updateOptionsHUD(q);
    }

    /* =========================================================================
     * 10. XỬ LÝ VA CHẠM CỔNG ĐÁP ÁN
     * ========================================================================= */
    checkGateCollision() {
      if (!this.gateWave.active || this.gateWave.resolved) return;

      if (this.gateWave.z >= -1.8 && this.gateWave.z <= 1.8) {
        this.toggleScratchpad(false);
        this.gateWave.resolved = true;
        const chosenLane = this.playerLaneIndex;
        const q = this.gateWave.questionData;
        const isCorrect = (chosenLane === q.correctIndex);

        if (isCorrect) {
          this.handleCorrectAnswer();
        } else {
          this.handleWrongAnswer(q, false);
        }
      }
    }

    handleCorrectAnswer() {
      this.combo++;
      const multiplier = this.combo >= 4 ? 3 : (this.combo >= 2 ? 2 : 1);
      const earnedScore = 10 * multiplier;
      this.score += earnedScore;
      this.coins += 2;
      this.savedData.coins += 2;
      this.slowMoEnergy = Math.min(100, this.slowMoEnergy + 25);

      this.sound.playCorrect();
      this.spawnExplosion(new THREE.Vector3(LANES[this.playerLaneIndex], 1.5, 0), 0x34d399, 24);

      if (this.state === STATES.BOSS) {
        this.fireLaserAtBoss();
      }

      this.updateHUD();

      setTimeout(() => {
        if (this.state === STATES.PLAYING || this.state === STATES.BOSS) {
          this.spawnNextQuestion();
        }
      }, 750);
    }

    handleWrongAnswer(questionData, isTimeout = false) {
      this.hearts--;
      this.combo = 0;
      this.cameraShakeIntensity = 0.6;
      this.invulnerableTimer = 1.5;
      this.sound.playWrong();

      const dmg = document.getElementById('damage-overlay');
      if (dmg) {
        dmg.style.opacity = '1';
        setTimeout(() => dmg.style.opacity = '0', 250);
      }

      this.updateHUD();

      if (this.hearts <= 0) {
        this.gameOver();
      } else {
        this.showExplainModal(questionData, isTimeout);
      }
    }

    showExplainModal(q, isTimeout = false) {
      this.state = STATES.EXPLAIN;
      const modal = document.getElementById('explain-modal');
      const iconEl = document.getElementById('explain-icon');
      const titleEl = document.getElementById('explain-title');
      const subEl = document.getElementById('explain-subtitle');
      const qEl = document.getElementById('explain-question');
      const ansEl = document.getElementById('explain-correct-answer');
      const formulaEl = document.getElementById('explain-formula');
      const stepsEl = document.getElementById('explain-steps');
      const svgEl = document.getElementById('explain-svg');

      if (iconEl && titleEl && subEl) {
        if (isTimeout) {
          iconEl.textContent = '⏱️';
          titleEl.textContent = 'HẾT 1 PHÚT VƯỢT CHƯỚNG NGẠI VẬT!';
          subEl.textContent = 'Mỗi chướng ngại vật có 1 phút để tính nháp. Hãy xem công thức chuẩn dưới đây để sẵn sàng cho thử thách kế tiếp:';
        } else {
          iconEl.textContent = '⚠️';
          titleEl.textContent = 'CHƯA CHÍNH XÁC!';
          subEl.textContent = 'Đừng nản lòng! Hãy đọc kỹ công thức và lời giải bên dưới:';
        }
      }

      if (qEl) qEl.innerHTML = formatMathHTML(q.question);
      if (ansEl) ansEl.innerHTML = formatMathHTML(q.correctText);
      if (formulaEl) formulaEl.innerHTML = formatMathHTML(q.formula || "Ghi nhớ quy tắc thực hiện phép tính");
      if (stepsEl) stepsEl.innerHTML = formatMathHTML(q.explanation || "Hãy quan sát kỹ các bước tính toán trên.");

      if (svgEl) {
        if (q.svg) {
          svgEl.innerHTML = q.svg;
          svgEl.classList.remove('hidden');
        } else {
          svgEl.innerHTML = '';
          svgEl.classList.add('hidden');
        }
      }

      if (modal) modal.classList.remove('hidden');
    }

    resumeAfterExplain() {
      const modal = document.getElementById('explain-modal');
      if (modal) modal.classList.add('hidden');

      this.state = this.bossMesh && this.bossMesh.visible ? STATES.BOSS : STATES.PLAYING;
      this.spawnNextQuestion();
    }

    /* =========================================================================
     * 11. ĐẤU BOSS 3D & HIỆU ỨNG LASER
     * ========================================================================= */
    startBossFight() {
      this.state = STATES.BOSS;
      this.bossCurrentHP = this.bossMaxHP;

      const theme = STAGE_THEMES[this.currentStageId] || STAGE_THEMES[1];
      this.updateBossVisuals(this.currentStageId);
      this.bossMesh.visible = true;
      this.bossMesh.position.set(0, 2.0, -22);

      const bossHud = document.getElementById('boss-hud');
      const bossName = document.getElementById('boss-name');
      const bossAvatar = document.getElementById('boss-avatar');
      if (bossHud) bossHud.classList.remove('hidden');
      if (bossName) bossName.textContent = theme.bossName;
      if (bossAvatar) bossAvatar.textContent = theme.icon;

      this.updateBossHPBar();
      this.sound.playBossRoar();
      this.cameraShakeIntensity = 0.5;

      this.spawnBossQuestion();
    }

    fireLaserAtBoss() {
      this.sound.playLaser();
      this.bossCurrentHP--;
      this.updateBossHPBar();

      // Hiển thị chùm Tia Laser 3D nối từ người chơi đến Boss!
      if (this.laserMesh && this.playerGroup && this.bossMesh) {
        const startPos = this.playerGroup.position.clone().add(new THREE.Vector3(0, 0.8, -0.6));
        const endPos = this.bossMesh.position.clone();
        const dist = startPos.distanceTo(endPos);
        const midPos = startPos.clone().add(endPos).multiplyScalar(0.5);
        this.laserMesh.position.copy(midPos);
        this.laserMesh.lookAt(endPos);
        this.laserMesh.scale.set(1.4, 1.4, dist / 24);
        this.laserMesh.visible = true;
        this.laserTimer = 0.35;
      }

      const bossPos = this.bossMesh.position.clone();
      this.spawnExplosion(bossPos, 0xf43f5e, 32);
      this.sound.playBossHit();
      this.cameraShakeIntensity = 0.5;

      if (this.bossCurrentHP <= 0) {
        this.bossMesh.visible = false;
        this.sound.playVictory();
        this.victory();
      }
    }

    updateBossHPBar() {
      const bar = document.getElementById('boss-hp-bar');
      const text = document.getElementById('boss-hp-text');
      if (bar) {
        const pct = (this.bossCurrentHP / this.bossMaxHP) * 100;
        bar.style.width = `${pct}%`;
      }
      if (text) text.textContent = `${this.bossCurrentHP} / ${this.bossMaxHP} HP`;
    }

    /* =========================================================================
     * 12. CẬP NHẬT GIAO DIỆN HUD & MODALS
     * ========================================================================= */
    updateHUD() {
      const heartsContainer = document.getElementById('hud-hearts');
      if (heartsContainer) {
        let html = '';
        for (let i = 1; i <= 3; i++) {
          html += (i <= this.hearts)
            ? '<span class="heart-icon animate-pulse text-rose-500">❤️</span>'
            : '<span class="text-slate-600">🖤</span>';
        }
        heartsContainer.innerHTML = html;
      }

      const comboBadge = document.getElementById('hud-combo-badge');
      const comboText = document.getElementById('hud-combo-text');
      if (comboBadge && comboText) {
        if (this.combo >= 2) {
          comboBadge.classList.remove('hidden');
          comboText.textContent = `x${this.combo >= 4 ? 3 : (this.combo >= 2 ? 2 : 1)}`;
        } else {
          comboBadge.classList.add('hidden');
        }
      }

      const coinsEl = document.getElementById('hud-coins');
      const scoreEl = document.getElementById('hud-score');
      if (coinsEl) coinsEl.textContent = this.coins;
      if (scoreEl) scoreEl.textContent = this.score;

      const slowBar = document.getElementById('hud-slowmo-bar');
      const slowPct = document.getElementById('hud-slowmo-pct');
      if (slowBar) slowBar.style.width = `${this.slowMoEnergy}%`;
      if (slowPct) slowPct.textContent = `${Math.round(this.slowMoEnergy)}%`;
    }

    updateMenuStats() {
      const highScoreEl = document.getElementById('menu-high-score');
      const totalCoinsEl = document.getElementById('menu-total-coins');
      if (highScoreEl) highScoreEl.textContent = this.savedData.highScore;
      if (totalCoinsEl) totalCoinsEl.innerHTML = `<span>🪙</span> ${this.savedData.coins}`;
    }

    victory() {
      this.state = STATES.VICTORY;
      this.toggleScratchpad(false);
      if (this.score > this.savedData.highScore) {
        this.savedData.highScore = this.score;
      }
      this.savedData.coins += 25;
      this.saveData();

      const modal = document.getElementById('victory-modal');
      const stName = document.getElementById('victory-stage-name');
      const scoreEl = document.getElementById('victory-score');
      const coinsEl = document.getElementById('victory-coins');

      const theme = STAGE_THEMES[this.currentStageId] || STAGE_THEMES[1];
      if (stName) stName.textContent = `Bạn đã chinh phục ${theme.worldTitle} (${theme.name})!`;
      if (scoreEl) scoreEl.textContent = `+${this.score}`;
      if (coinsEl) coinsEl.innerHTML = `<span>🪙</span> +${this.coins + 25}`;

      if (modal) modal.classList.remove('hidden');
    }

    gameOver() {
      this.state = STATES.GAMEOVER;
      this.toggleScratchpad(false);
      this.sound.playGameOver();

      if (this.score > this.savedData.highScore) {
        this.savedData.highScore = this.score;
      }
      this.saveData();

      const modal = document.getElementById('gameover-modal');
      const scoreEl = document.getElementById('gameover-score');
      const coinsEl = document.getElementById('gameover-coins');

      if (scoreEl) scoreEl.textContent = this.score;
      if (coinsEl) coinsEl.innerHTML = `<span>🪙</span> ${this.coins}`;

      if (modal) modal.classList.remove('hidden');
    }

    retryStage() {
      this.startStage(this.currentStageId);
    }

    nextStage() {
      const nextId = Math.min(5, this.currentStageId + 1);
      this.startStage(nextId);
    }

    backToMenu() {
      this.state = STATES.MENU;
      this.hideAllModals();
      this.toggleScratchpad(false);

      const hud = document.getElementById('hud-container');
      if (hud) hud.classList.add('hidden');

      const menu = document.getElementById('menu-screen');
      if (menu) menu.classList.remove('hidden');

      if (this.bossMesh) this.bossMesh.visible = false;
      this.gateWave.active = false;
      this.gateWave.meshes.forEach(m => m.visible = false);
      this.coinPool.forEach(c => c.visible = false);

      this.updateMenuStats();
    }

    pauseGame() {
      if (this.state !== STATES.PLAYING && this.state !== STATES.BOSS) return;
      this.state = STATES.PAUSED;
      const modal = document.getElementById('pause-modal');
      if (modal) modal.classList.remove('hidden');
    }

    resumeGame() {
      const modal = document.getElementById('pause-modal');
      if (modal) modal.classList.add('hidden');
      this.state = this.bossMesh && this.bossMesh.visible ? STATES.BOSS : STATES.PLAYING;
    }

    hideAllModals() {
      ['menu-screen', 'explain-modal', 'victory-modal', 'gameover-modal', 'pause-modal', 'shop-modal'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
      });
    }

    toggleSound() {
      const isMuted = this.sound.toggleMute();
      const icon = document.getElementById('menu-sound-icon');
      const text = document.getElementById('menu-sound-text');
      if (icon) icon.textContent = isMuted ? '🔇' : '🔊';
      if (text) text.textContent = `Âm thanh: ${isMuted ? 'TẮT' : 'BẬT'}`;
    }

    /* =========================================================================
     * 13. CỬA HÀNG SKIN 3D
     * ========================================================================= */
    openSkinShop() {
      this.renderSkinShopItems();
      const modal = document.getElementById('shop-modal');
      if (modal) modal.classList.remove('hidden');
    }

    closeSkinShop() {
      const modal = document.getElementById('shop-modal');
      if (modal) modal.classList.add('hidden');
    }

    renderSkinShopItems() {
      const container = document.getElementById('shop-items-container');
      if (!container) return;

      const skins = [
        { id: 1, name: "Chiến Hạm Tia Chớp", price: 0, desc: "Phi thuyền siêu thanh phản lực kép (Mặc định)", icon: "🚀" },
        { id: 2, name: "Rô-bốt Thám Hiểm", price: 50, desc: "Robot Baymax trắng-vàng mắt kính LED đáng yêu", icon: "🤖" },
        { id: 3, name: "Phi Thuyền Hỏa Long Đỏ", price: 100, desc: "Chiến hạm vũ trụ 3 động cơ cánh kép viền vàng", icon: "🛸" }
      ];

      let html = '';
      skins.forEach(s => {
        const isUnlocked = this.savedData.unlockedSkins.includes(s.id);
        const isSelected = this.savedData.selectedSkin === s.id;

        html += `
          <div class="glass-panel p-3.5 rounded-2xl border ${isSelected ? 'border-amber-400 bg-amber-500/10' : 'border-white/10'} flex items-center justify-between gap-3 text-left">
            <div class="flex items-center gap-3">
              <span class="text-3xl">${s.icon}</span>
              <div>
                <div class="text-xs font-black text-white">${s.name}</div>
                <div class="text-[10px] text-slate-400">${s.desc}</div>
              </div>
            </div>

            <div>
              ${isSelected ? `
                <span class="px-3 py-1.5 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-black">
                  ĐANG DÙNG
                </span>
              ` : (isUnlocked ? `
                <button onclick="game3D.equipSkin(${s.id})" class="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-black transition">
                  Chọn Dùng
                </button>
              ` : `
                <button onclick="game3D.buySkin(${s.id}, ${s.price})" class="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center gap-1">
                  <span>🪙</span> ${s.price}
                </button>
              `)}
            </div>
          </div>
        `;
      });

      container.innerHTML = html;
    }

    buySkin(skinId, price) {
      if (this.savedData.coins >= price) {
        this.savedData.coins -= price;
        this.savedData.unlockedSkins.push(skinId);
        this.savedData.selectedSkin = skinId;
        this.selectedSkin = skinId;
        this.saveData();
        this.buildPlayer();
        this.renderSkinShopItems();
        this.sound.playVictory();
      } else {
        alert("Bạn chưa đủ xu vàng! Hãy ăn thêm xu trên đường đua nhé.");
      }
    }

    equipSkin(skinId) {
      this.savedData.selectedSkin = skinId;
      this.selectedSkin = skinId;
      this.saveData();
      this.buildPlayer();
      this.renderSkinShopItems();
      this.sound.playLaneChange();
    }

    /* =========================================================================
     * 14. VÒNG LẶP RENDER DUY NHẤT (60 FPS ZERO-ALLOCATION)
     * ========================================================================= */
    animate() {
      requestAnimationFrame(this.animate);

      const rawDelta = this.clock.getDelta();
      const dt = Math.min(rawDelta, 0.05);

      let timeScale = 1.0;
      if (this.isSlowMoActive) {
        timeScale = 0.35;
        this.slowMoEnergy = Math.max(0, this.slowMoEnergy - (25 * dt));
        if (this.slowMoEnergy <= 0) {
          this.toggleSlowMo();
        }
      } else {
        this.slowMoEnergy = Math.min(100, this.slowMoEnergy + (4 * dt));
      }

      const effectiveDt = dt * timeScale;
      const isPausedLike = (this.state === STATES.PAUSED || this.state === STATES.EXPLAIN || this.state === STATES.VICTORY || this.state === STATES.GAMEOVER);
      const speedMul = isPausedLike ? 0.15 : (this.state === STATES.MENU ? 0.45 : 1.0);
      const currentSpeed = (BASE_SPEED + Math.min(this.combo, 6) * 1.2) * speedMul;

      // 1. Cuộn phân đoạn đường đua & Cảnh quan 5 Thế Giới
      this.trackSegments.forEach(seg => {
        seg.position.z += currentSpeed * effectiveDt;
        if (seg.position.z > TRACK_SEGMENT_LENGTH) {
          seg.position.z -= NUM_TRACK_SEGMENTS * TRACK_SEGMENT_LENGTH;
        }
      });

      // 2. Cuộn Mây hoạt hình, Bầu trời & Vật thể bay (Parallax)
      this.cloudPool.forEach(cloud => {
        cloud.position.z += currentSpeed * 0.28 * effectiveDt;
        if (cloud.position.z > 18) {
          cloud.position.z -= 160;
        }
      });

      const tNow = performance.now() * 0.002;
      this.skyPropPool.forEach(orb => {
        orb.position.z += currentSpeed * 0.65 * effectiveDt;
        orb.position.y = orb.userData.baseY + Math.sin(tNow + orb.userData.phase) * 0.7;
        orb.rotation.y += 1.8 * effectiveDt;
        if (orb.position.z > 15) {
          orb.position.z -= 130;
        }
      });

      if (this.planetRing && this.planetRing.visible) {
        this.planetRing.rotation.z += 0.12 * dt;
      }

      // Hiệu ứng rung ngọn lửa động cơ cho mọi trạng thái bay
      this.playerFlames.forEach((fl, idx) => {
        const flicker = 0.75 + Math.sin(tNow * 14 + idx * 2) * 0.3;
        fl.scale.set(1, 1, flicker);
      });

      // 3. Chế độ MENU: Phi thuyền lướt và xoay khoe dáng trên đường đua sống động
      if (this.state === STATES.MENU) {
        if (this.playerGroup) {
          this.playerGroup.position.set(0, 0.8 + Math.sin(tNow * 1.6) * 0.15, 0);
          this.playerGroup.rotation.y += 1.0 * dt;
          this.playerGroup.rotation.z = 0;
        }
        if (this.camera) {
          this.camera.position.set(0, 4.4, 8.2);
          this.camera.lookAt(0, 1.4, -10);
        }
        this.renderer.render(this.scene, this.camera);
        return;
      }

      // Đảm bảo góc quay Y của người chơi chuẩn về phía trước khi bắt đầu chạy
      if (this.playerGroup) {
        this.playerGroup.rotation.y = THREE.MathUtils.lerp(this.playerGroup.rotation.y, 0, 1 - Math.exp(-12 * dt));
      }

      // 4. Vật lý Người chơi
      if (this.playerGroup) {
        this.playerGroup.position.x = THREE.MathUtils.lerp(
          this.playerGroup.position.x,
          this.playerTargetX,
          1 - Math.exp(-14 * dt)
        );

        const rollTarget = (this.playerTargetX - this.playerGroup.position.x) * -0.22;
        this.playerGroup.rotation.z = THREE.MathUtils.lerp(
          this.playerGroup.rotation.z,
          rollTarget,
          1 - Math.exp(-12 * dt)
        );

        if (this.isJumping) {
          this.playerVelY += GRAVITY * effectiveDt;
          this.playerPosY += this.playerVelY * effectiveDt;
          this.playerGroup.rotation.x = -Math.sin((this.playerPosY / 2.2) * Math.PI) * 0.45;

          if (this.playerPosY <= 0) {
            this.playerPosY = 0;
            this.playerVelY = 0;
            this.isJumping = false;
            this.playerGroup.rotation.x = 0;
          }
        } else {
          this.runAnimTimer += effectiveDt * 14;
          this.playerPosY = Math.sin(this.runAnimTimer) * 0.05;
          this.playerGroup.rotation.x = 0;

          if (this.playerArmL && this.playerArmR) {
            this.playerArmL.rotation.x = Math.sin(this.runAnimTimer) * 0.5;
            this.playerArmR.rotation.x = -Math.sin(this.runAnimTimer) * 0.5;
          }
        }

        this.playerGroup.position.y = 0.65 + this.playerPosY;

        if (this.playerAura) {
          this.playerAura.visible = (this.combo >= 2);
          if (this.playerAura.visible) {
            this.playerAura.rotation.z += 2.5 * dt;
          }
        }

        if (this.blobShadow) {
          this.blobShadow.position.x = this.playerGroup.position.x;
          const jumpFactor = Math.max(0, 1 - (this.playerPosY / 2.8));
          this.blobShadow.scale.set(jumpFactor, jumpFactor, jumpFactor);
          this.blobShadow.material.opacity = 0.45 * jumpFactor;
        }

        if (this.invulnerableTimer > 0) {
          this.invulnerableTimer -= dt;
          this.playerGroup.visible = Math.floor(Date.now() / 80) % 2 === 0;
        } else {
          this.playerGroup.visible = true;
        }
      }

      // 5. Cập nhật Camera (Cân bằng trên điện thoại dọc & máy tính)
      if (this.camera) {
        const camTargetX = this.playerGroup ? this.playerGroup.position.x * 0.42 : 0;
        this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, camTargetX, 1 - Math.exp(-8 * dt));

        const isPortrait = window.innerWidth < window.innerHeight;
        const targetFOV = isPortrait ? 78 : (this.combo >= 3 ? 68 : 60);
        const targetCamY = isPortrait ? 5.2 : 4.2;
        const targetCamZ = isPortrait ? 9.6 : 7.8;

        if (this.cameraShakeIntensity > 0) {
          this.camera.position.x += (Math.random() - 0.5) * this.cameraShakeIntensity;
          this.camera.position.y = targetCamY + (Math.random() - 0.5) * this.cameraShakeIntensity;
          this.cameraShakeIntensity = Math.max(0, this.cameraShakeIntensity - dt * 2.8);
        } else {
          this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, targetCamY, 1 - Math.exp(-6 * dt));
        }

        this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, targetCamZ, 1 - Math.exp(-6 * dt));
        this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFOV, 1 - Math.exp(-6 * dt));
        this.camera.updateProjectionMatrix();
        this.camera.lookAt(camTargetX, 1.3, -10);
      }

      // 6. Chướng Ngại Vật 1 Phút & Cổng Năng Lượng 3D
      if (this.gateWave.active) {
        if (!this.gateWave.resolved && (this.state === STATES.PLAYING || this.state === STATES.BOSS)) {
          this.questionTimeRemaining -= effectiveDt;
          const currentSec = Math.ceil(this.questionTimeRemaining);
          if (currentSec <= 10 && currentSec > 0 && currentSec !== this.lastTickSecond) {
            this.lastTickSecond = currentSec;
            this.sound.playTick();
          }
          this.updateTimerHUD();

          if (this.questionTimeRemaining <= 0) {
            this.questionTimeRemaining = 0;
            this.updateTimerHUD();
            this.handleQuestionTimeout();
          }
        }

        if (!this.gateWave.resolved) {
          const timeProgress = Math.max(0, Math.min(1, 1 - (this.questionTimeRemaining / this.questionTimeLimit)));
          this.gateWave.z = -100 + (timeProgress * 100);
        } else {
          this.gateWave.z += (currentSpeed * 2.5) * effectiveDt;
        }

        this.gateWave.meshes.forEach(m => {
          m.position.z = this.gateWave.z;
        });

        this.checkGateCollision();

        if (this.gateWave.z > 14) {
          this.gateWave.active = false;
          this.gateWave.meshes.forEach(m => m.visible = false);
        }
      }

      // 7. Xu Vàng 3D (Xoay + Nhún + Magnet)
      this.coinPool.forEach(coin => {
        if (!coin.visible) return;
        coin.position.z += currentSpeed * effectiveDt;
        coin.rotation.y += 3.8 * effectiveDt;
        coin.position.y = 0.85 + Math.sin(tNow * 2.5 + coin.position.z) * 0.12;

        if (this.playerGroup) {
          const dx = this.playerGroup.position.x - coin.position.x;
          const dz = this.playerGroup.position.z - coin.position.z;
          const dist = Math.sqrt(dx * dx + dz * dz);

          if (dist < 4.5) {
            coin.position.x += dx * 7.5 * dt;
          }

          if (dist < 1.15 && Math.abs(this.playerGroup.position.y - coin.position.y) < 1.25) {
            coin.visible = false;
            this.coins++;
            this.savedData.coins++;
            this.score += 5;
            this.sound.playCoin(this.combo);
            this.spawnExplosion(coin.position, 0xfbbf24, 12);
            this.updateHUD();
          }
        }

        if (coin.position.z > 14) coin.visible = false;
      });

      // 8. Boss 3D & Tia Laser
      if (this.state === STATES.BOSS && this.bossMesh && this.bossMesh.visible) {
        this.bossMoveTimer += effectiveDt;
        if (this.bossMoveTimer > 2.2) {
          this.bossMoveTimer = 0;
          this.bossLaneTargetX = randChoice(LANES);
        }

        this.bossMesh.position.x = THREE.MathUtils.lerp(
          this.bossMesh.position.x,
          this.bossLaneTargetX,
          1 - Math.exp(-3 * effectiveDt)
        );
        this.bossMesh.position.y = 2.0 + Math.sin(tNow * 1.4) * 0.35;
        this.bossMesh.position.z = -22;

        if (this.bossHalo) {
          this.bossHalo.rotation.z += 2.0 * dt;
        }
      }

      if (this.laserTimer > 0 && this.laserMesh) {
        this.laserTimer -= dt;
        const pulse = 0.6 + this.laserTimer * 2.5;
        this.laserMesh.scale.x = pulse;
        this.laserMesh.scale.y = pulse;
        if (this.laserTimer <= 0) {
          this.laserMesh.visible = false;
        }
      }

      // 9. Hạt nổ 3D (Particle Pool)
      this.particlePool.forEach(p => {
        if (!p.visible) return;
        p.userData.life += dt;
        if (p.userData.life >= p.userData.maxLife) {
          p.visible = false;
        } else {
          p.position.x += p.userData.vx * dt;
          p.position.y += p.userData.vy * dt;
          p.position.z += p.userData.vz * dt;
          p.userData.vy -= 11.0 * dt;
          p.scale.multiplyScalar(0.95);
        }
      });

      // 10. RENDER FRAME
      this.renderer.render(this.scene, this.camera);
    }
  }

  function launchGame3D() {
    if (!window.game3D) {
      window.game3D = new Game3DEngine();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', launchGame3D);
  } else {
    launchGame3D();
  }

})();
