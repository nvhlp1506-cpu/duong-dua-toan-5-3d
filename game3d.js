/**
 * ============================================================================
 * ĐƯỜNG ĐUA TOÁN 5 – 3D | GAME ENGINE & THREE.JS CONTROLLER
 * Chuẩn hiệu năng 60 FPS: Object Pooling, Zero-Allocation Text CanvasTexture,
 * Vật lý chuyển động 3 làn, Web Audio API Synthesizer, 3D Boss & State Machine.
 * ============================================================================
 */

(function () {
  'use strict';

  /* =========================================================================
   * 1. HẰNG SỐ & CẤU HÌNH HỆ THỐNG
   * ========================================================================= */
  const LANES = [-3.0, 0.0, 3.0];
  const TRACK_SEGMENT_LENGTH = 30;
  const NUM_TRACK_SEGMENTS = 8;
  const TRACK_WIDTH = 10.5;
  const BASE_SPEED = 11.2; // Tốc độ tiêu chuẩn phù hợp tâm sinh lý học sinh lớp 5 (~10s đọc đề và nhẩm bài)
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

  const STAGE_THEMES = {
    1: { name: "Rừng Phân Số", icon: "🌲", groundColor: 0x064e3b, laneColor: 0x059669, fogColor: 0x022c22, bossName: "VUA KHỈ RỪNG RẬM", bossColor: 0x10b981 },
    2: { name: "Sa Mạc Thập Phân", icon: "🏜️", groundColor: 0x78350f, laneColor: 0xd97706, fogColor: 0x451a03, bossName: "BỌ CẠP KHỔNG LỒ", bossColor: 0xf59e0b },
    3: { name: "Thành Phố Phần Trăm", icon: "🏙️", groundColor: 0x3b0764, laneColor: 0x7e22ce, fogColor: 0x1e1b4b, bossName: "HẢI TẶC CYBER", bossColor: 0xc084fc },
    4: { name: "Thung Lũng Hình Học", icon: "🔷", groundColor: 0x083344, laneColor: 0x0891b2, fogColor: 0x02131d, bossName: "NGƯỜI ĐÁ PHA LÊ", bossColor: 0x22d3ee },
    5: { name: "Đường Hầm Chuyển Động", icon: "🚀", groundColor: 0x4c0519, laneColor: 0xe11d48, fogColor: 0x1f0208, bossName: "RỒNG THẦN BÃO TỐ", bossColor: 0xf43f5e }
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
      this.playTone(320, 'triangle', 0.08, 0.09, 140);
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
      // Arpeggio trưởng vui tươi (C5, E5, G5, C6)
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
      this.playTone(400, 'triangle', 0.28, 0.16, 500);
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
      this.slowMoDuration = 4.0;
      this.slowMoTimer = 0;

      // Vật lý người chơi
      this.playerLaneIndex = 1; // 0: Trái, 1: Giữa, 2: Phải
      this.playerTargetX = LANES[1];
      this.playerPosY = 0;
      this.playerVelY = 0;
      this.isJumping = false;
      this.runAnimTimer = 0;
      this.invulnerableTimer = 0; // i-frames khi va chạm sai

      // Camera & Cảm giác chơi (Game Feel)
      this.cameraBaseFOV = 60;
      this.cameraTargetFOV = 60;
      this.cameraShakeIntensity = 0;

      // Đại Boss 3D
      this.bossMaxHP = 4;
      this.bossCurrentHP = 4;
      this.bossMesh = null;
      this.bossLaneTargetX = 0;
      this.bossMoveTimer = 0;
      this.bossAttackTimer = 0;

      // Khởi tạo các thành phần Three.js
      this.container = null;
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.clock = new THREE.Clock();

      // Các nhóm đối tượng Object Pooling
      this.trackSegments = [];
      this.sceneryPool = [];
      this.coinPool = [];
      this.barrierPool = [];
      this.bulletPool = [];
      this.particlePool = [];
      this.particleIndex = 0;

      // Cổng năng lượng 3D (3 Cổng tương ứng 3 Làn)
      this.gateWave = {
        active: false,
        z: -110,
        resolved: false,
        meshes: [],
        questionData: null
      };

      // ZERO-ALLOCATION TEXT ON 3D (3 Canvas 512x256 cố định)
      this.gateCanvases = [];
      this.gateContexts = [];
      this.gateTextures = [];

      // Người chơi 3D
      this.playerGroup = null;
      this.blobShadow = null;
      this.selectedSkin = this.savedData.selectedSkin || 1;

      // Bắt đầu khởi tạo
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
     * 4. KHỞI TẠO THREE.JS VÀ OBJECT POOLING
     * ========================================================================= */
    init() {
      this.container = document.getElementById('game-container');
      if (!this.container) return;

      // 1. Tạo Scene & Sương mù FogExp2
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(STAGE_THEMES[1].fogColor);
      this.scene.fog = new THREE.FogExp2(STAGE_THEMES[1].fogColor, 0.016);

      // 2. Tạo Camera (Tự động thích ứng màn hình dọc điện thoại hoặc ngang laptop)
      const isPortrait = window.innerWidth < window.innerHeight;
      const initialFOV = isPortrait ? 78 : this.cameraBaseFOV;
      const aspect = window.innerWidth / window.innerHeight;
      this.camera = new THREE.PerspectiveCamera(initialFOV, aspect, 0.1, 250);
      this.camera.position.set(0, isPortrait ? 5.2 : 4.2, isPortrait ? 9.6 : 7.8);
      this.camera.lookAt(0, 1.4, -6);

      // 3. Tạo Renderer siêu tối ưu 60 FPS
      this.renderer = new THREE.WebGLRenderer({
        powerPreference: "high-performance",
        antialias: window.devicePixelRatio <= 1,
        alpha: false,
        depth: true
      });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.outputEncoding = THREE.sRGBEncoding;
      this.container.appendChild(this.renderer.domElement);

      // 4. Ánh sáng nhẹ không dùng Shadow Map
      const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444455, 0.85);
      hemiLight.position.set(0, 40, 0);
      this.scene.add(hemiLight);

      const dirLight = new THREE.DirectionalLight(0xfff5e6, 0.75);
      dirLight.position.set(15, 30, 20);
      this.scene.add(dirLight);

      // 5. Khởi tạo Zero-Allocation CanvasTextures cho 3 Cổng
      this.initGateCanvasTextures();

      // 6. Xây dựng Object Pools
      this.buildTrackPool();
      this.buildGateMeshes();
      this.buildCoinPool();
      this.buildBarrierPool();
      this.buildBossBulletPool();
      this.buildParticlePool();

      // 7. Tạo Player Mesh & Blob Shadow
      this.buildPlayer();
      this.buildBossMesh();

      // 8. Đăng ký sự kiện
      this.setupControls();
      this.setupWindowEvents();
      this.updateMenuStats();
      this.renderSkinShopItems();

      // 9. BẬT DUY NHẤT 1 VÒNG LẶP RAF XUYÊN SUỐT
      this.animate = this.animate.bind(this);
      requestAnimationFrame(this.animate);
    }

    // Khởi tạo 3 CanvasTexture cố định cho Cổng năng lượng
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

    // Xây dựng Phân đoạn đường đua (Track Segments Pool)
    buildTrackPool() {
      const segGeo = new THREE.PlaneGeometry(TRACK_WIDTH, TRACK_SEGMENT_LENGTH, 1, 1);
      segGeo.rotateX(-Math.PI / 2);

      const trackMat = new THREE.MeshLambertMaterial({
        color: STAGE_THEMES[1].groundColor,
        flatShading: true
      });

      for (let i = 0; i < NUM_TRACK_SEGMENTS; i++) {
        const segGroup = new THREE.Group();
        const road = new THREE.Mesh(segGeo, trackMat);
        road.receiveShadow = false;
        segGroup.add(road);

        // Vạch phân làn dạ quang (Dashed lane markers)
        for (const lx of [-1.5, 1.5]) {
          const lineGeo = new THREE.PlaneGeometry(0.14, TRACK_SEGMENT_LENGTH);
          lineGeo.rotateX(-Math.PI / 2);
          const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 });
          const line = new THREE.Mesh(lineGeo, lineMat);
          line.position.set(lx, 0.015, 0);
          segGroup.add(line);
        }

        // Lan can phát sáng 2 mép
        for (const side of [-TRACK_WIDTH / 2, TRACK_WIDTH / 2]) {
          const curbGeo = new THREE.BoxGeometry(0.35, 0.25, TRACK_SEGMENT_LENGTH);
          const curbMat = new THREE.MeshLambertMaterial({ color: 0x38bdf8, flatShading: true });
          const curb = new THREE.Mesh(curbGeo, curbMat);
          curb.position.set(side, 0.12, 0);
          segGroup.add(curb);
        }

        // Cảnh quan 2 bên (Low-poly Scenery)
        this.addSceneryToSegment(segGroup);

        segGroup.position.z = -i * TRACK_SEGMENT_LENGTH;
        this.scene.add(segGroup);
        this.trackSegments.push(segGroup);
      }
    }

    addSceneryToSegment(segGroup) {
      // Cây thông Low-Poly / Kim tự tháp / Trụ Cyber
      const treeMat = new THREE.MeshLambertMaterial({ color: 0x10b981, flatShading: true });
      const trunkMat = new THREE.MeshLambertMaterial({ color: 0x78350f, flatShading: true });
      const coneGeo = new THREE.ConeGeometry(1.6, 3.2, 5);
      const trunkGeo = new THREE.CylinderGeometry(0.35, 0.45, 1.2, 5);

      for (const side of [-1, 1]) {
        for (let zOffset = -10; zOffset <= 10; zOffset += 10) {
          const itemGroup = new THREE.Group();
          const trunk = new THREE.Mesh(trunkGeo, trunkMat);
          trunk.position.y = 0.6;
          itemGroup.add(trunk);

          const foliage = new THREE.Mesh(coneGeo, treeMat);
          foliage.position.y = 2.4;
          itemGroup.add(foliage);

          itemGroup.position.set(side * (TRACK_WIDTH / 2 + 3.8 + Math.random() * 2), 0, zOffset + (Math.random() - 0.5) * 4);
          segGroup.add(itemGroup);
        }
      }
    }


    // Xây dựng 3 Cổng Năng Lượng (Màu sắc đồng bộ với 3 Thẻ HUD)
    buildGateMeshes() {
      const archColors = [0x0284c7, 0xd97706, 0x7e22ce]; // Cổng A: Xanh Cyan, Cổng B: Vàng Cam, Cổng C: Tím Violet

      for (let i = 0; i < 3; i++) {
        const gate = new THREE.Group();
        const archMat = new THREE.MeshLambertMaterial({ color: archColors[i], flatShading: true });

        // Khung vòm cổng (Arch Pillars)
        const pillarGeo = new THREE.BoxGeometry(0.25, 3.2, 0.25);
        const pLeft = new THREE.Mesh(pillarGeo, archMat);
        pLeft.position.set(-1.4, 1.6, 0);
        const pRight = new THREE.Mesh(pillarGeo, archMat);
        pRight.position.set(1.4, 1.6, 0);

        const beamGeo = new THREE.BoxGeometry(3.05, 0.35, 0.3);
        const beam = new THREE.Mesh(beamGeo, archMat);
        beam.position.set(0, 3.2, 0);

        gate.add(pLeft, pRight, beam);

        // Mặt bảng hiển thị đáp án bằng CanvasTexture
        const panelGeo = new THREE.PlaneGeometry(2.7, 1.5);
        const panelMat = new THREE.MeshBasicMaterial({
          map: this.gateTextures[i],
          transparent: true,
          side: THREE.DoubleSide
        });
        const panel = new THREE.Mesh(panelGeo, panelMat);
        panel.position.set(0, 2.0, 0);
        gate.add(panel);

        gate.position.set(LANES[i], 0, -110);
        gate.visible = false;
        this.scene.add(gate);
        this.gateWave.meshes.push(gate);
      }
    }

    // Xây dựng Pool Xu Vàng 3D
    buildCoinPool() {
      const coinGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.1, 12);
      coinGeo.rotateX(Math.PI / 2);
      const coinMat = new THREE.MeshLambertMaterial({
        color: 0xfbbf24,
        emissive: 0xd97706,
        emissiveIntensity: 0.3,
        flatShading: true
      });

      for (let i = 0; i < 15; i++) {
        const coin = new THREE.Mesh(coinGeo, coinMat);
        coin.visible = false;
        coin.position.set(0, 0.7, 0);
        this.scene.add(coin);
        this.coinPool.push(coin);
      }
    }

    // Xây dựng Pool Rào Chắn Thấp
    buildBarrierPool() {
      const barGeo = new THREE.BoxGeometry(2.6, 0.65, 0.35);
      const barMat = new THREE.MeshLambertMaterial({
        color: 0xef4444,
        emissive: 0x991b1b,
        emissiveIntensity: 0.35,
        flatShading: true
      });

      for (let i = 0; i < 6; i++) {
        const bar = new THREE.Mesh(barGeo, barMat);
        bar.position.set(0, 0.33, 0);
        bar.visible = false;
        this.scene.add(bar);
        this.barrierPool.push(bar);
      }
    }

    // Xây dựng Pool Đạn Năng Lượng Của Boss
    buildBossBulletPool() {
      const bGeo = new THREE.SphereGeometry(0.42, 8, 8);
      const bMat = new THREE.MeshBasicMaterial({ color: 0xff1e56 });

      for (let i = 0; i < 10; i++) {
        const bullet = new THREE.Mesh(bGeo, bMat);
        bullet.visible = false;
        this.scene.add(bullet);
        this.bulletPool.push(bullet);
      }
    }

    // Xây dựng Pool Hạt Vỡ 3D (Particle Pool - 60 khối)
    buildParticlePool() {
      const pGeo = new THREE.BoxGeometry(0.18, 0.18, 0.18);
      const pMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });

      for (let i = 0; i < 60; i++) {
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
        p.visible = true;

        const speed = 4 + Math.random() * 6;
        const theta = Math.random() * Math.PI * 2;
        const phi = (Math.random() - 0.5) * Math.PI;

        p.userData.vx = Math.cos(theta) * Math.cos(phi) * speed;
        p.userData.vy = Math.sin(phi) * speed + 3.0;
        p.userData.vz = Math.sin(theta) * Math.cos(phi) * speed;
        p.userData.life = 0;
        p.userData.maxLife = 0.5 + Math.random() * 0.4;
      }
    }

    /* =========================================================================
     * 5. XÂY DỰNG NHÂN VẬT 3D & BOSS 3D
     * ========================================================================= */
    buildPlayer() {
      if (this.playerGroup) this.scene.remove(this.playerGroup);
      this.playerGroup = new THREE.Group();

      const skinId = this.selectedSkin;

      if (skinId === 2) {
        // Skin 2: Rô-bốt Thám Hiểm
        const bodyGeo = new THREE.BoxGeometry(0.9, 1.1, 0.7);
        const bodyMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b, flatShading: true });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.6;
        this.playerGroup.add(body);

        const headGeo = new THREE.BoxGeometry(0.65, 0.55, 0.55);
        const headMat = new THREE.MeshLambertMaterial({ color: 0xfef08a, flatShading: true });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 1.35;
        this.playerGroup.add(head);

        // Mắt robot dạ quang
        const eyeGeo = new THREE.BoxGeometry(0.45, 0.15, 0.1);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const eye = new THREE.Mesh(eyeGeo, eyeMat);
        eye.position.set(0, 1.35, -0.3);
        this.playerGroup.add(eye);
      } else if (skinId === 3) {
        // Skin 3: Phi Thuyền Lửa Đỏ
        const hullGeo = new THREE.ConeGeometry(0.7, 2.4, 5);
        hullGeo.rotateX(-Math.PI / 2);
        const hullMat = new THREE.MeshLambertMaterial({ color: 0xe11d48, flatShading: true });
        const hull = new THREE.Mesh(hullGeo, hullMat);
        hull.position.y = 0.6;
        this.playerGroup.add(hull);

        const wingGeo = new THREE.BoxGeometry(2.4, 0.08, 0.9);
        const wingMat = new THREE.MeshLambertMaterial({ color: 0x881337, flatShading: true });
        const wings = new THREE.Mesh(wingGeo, wingMat);
        wings.position.set(0, 0.55, 0.2);
        this.playerGroup.add(wings);
      } else {
        // Skin 1: Chiến Hạm Tia Chớp (Mặc định)
        const shipGeo = new THREE.ConeGeometry(0.65, 2.2, 4);
        shipGeo.rotateX(-Math.PI / 2);
        const shipMat = new THREE.MeshLambertMaterial({ color: 0x0ea5e9, flatShading: true });
        const ship = new THREE.Mesh(shipGeo, shipMat);
        ship.position.y = 0.6;
        this.playerGroup.add(ship);

        const wingGeo = new THREE.BoxGeometry(2.1, 0.06, 0.8);
        const wingMat = new THREE.MeshLambertMaterial({ color: 0x0369a1, flatShading: true });
        const wings = new THREE.Mesh(wingGeo, wingMat);
        wings.position.set(0, 0.55, 0.15);
        this.playerGroup.add(wings);

        // Cockpit kính phát sáng
        const canopyGeo = new THREE.BoxGeometry(0.35, 0.3, 0.6);
        const canopyMat = new THREE.MeshBasicMaterial({ color: 0xbae6fd });
        const canopy = new THREE.Mesh(canopyGeo, canopyMat);
        canopy.position.set(0, 0.85, -0.15);
        this.playerGroup.add(canopy);
      }

      this.playerGroup.position.set(0, 0, 0);
      this.scene.add(this.playerGroup);

      // BLOB SHADOW DƯỚI CHÂN (GIỮ 60 FPS TRÊN MỌI GPU)
      if (this.blobShadow) this.scene.remove(this.blobShadow);
      const shadowGeo = new THREE.CircleGeometry(0.85, 14);
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

      const coreGeo = new THREE.DodecahedronGeometry(2.2, 0);
      const coreMat = new THREE.MeshLambertMaterial({ color: 0xf43f5e, flatShading: true });
      const core = new THREE.Mesh(coreGeo, coreMat);
      this.bossMesh.add(core);

      // Cánh đại bàng/phi thuyền Boss hai bên
      for (const side of [-1, 1]) {
        const wingGeo = new THREE.ConeGeometry(1.2, 3.8, 4);
        wingGeo.rotateZ(side * Math.PI / 3);
        const wingMat = new THREE.MeshLambertMaterial({ color: 0x9f1239, flatShading: true });
        const wing = new THREE.Mesh(wingGeo, wingMat);
        wing.position.set(side * 2.8, 0, 0);
        this.bossMesh.add(wing);
      }

      // Mắt Boss phát sáng đỏ
      const eyeGeo = new THREE.SphereGeometry(0.65, 8, 8);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(0, 0.5, 1.8);
      this.bossMesh.add(eye);

      this.bossMesh.position.set(0, 3.5, -38);
      this.bossMesh.visible = false;
      this.scene.add(this.bossMesh);
    }

    /* =========================================================================
     * 6. ZERO-ALLOCATION CẬP NHẬT CỔNG ĐÁP ÁN (TEXT ON 3D)
     * ========================================================================= */
    renderGateTextures(questionData) {
      const gateStyles = [
        {
          grad0: 'rgba(14, 165, 233, 0.95)',
          grad1: 'rgba(2, 132, 199, 0.88)',
          border: '#38bdf8',
          letterBg: '#0284c7',
          letterText: '#f0f9ff'
        },
        {
          grad0: 'rgba(245, 158, 11, 0.95)',
          grad1: 'rgba(217, 119, 6, 0.88)',
          border: '#fbbf24',
          letterBg: '#d97706',
          letterText: '#fffbeb'
        },
        {
          grad0: 'rgba(168, 85, 247, 0.95)',
          grad1: 'rgba(126, 34, 206, 0.88)',
          border: '#c084fc',
          letterBg: '#9333ea',
          letterText: '#faf5ff'
        }
      ];

      for (let i = 0; i < 3; i++) {
        const canvas = this.gateCanvases[i];
        const ctx = this.gateContexts[i];
        const option = questionData.options[i];
        const style = gateStyles[i];

        // Xóa canvas cũ
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Nền dạ quang chuyên biệt cho từng làn
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, style.grad0);
        grad.addColorStop(1, style.grad1);
        ctx.fillStyle = grad;
        ctx.fillRect(8, 8, canvas.width - 16, canvas.height - 16);

        // Viền neon nổi bật
        ctx.strokeStyle = style.border;
        ctx.lineWidth = 12;
        ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

        // Huy hiệu chữ cái A, B, C nổi bật ở góc trên
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

        // Vẽ nội dung đáp án chuẩn căn giữa
        const text = (option.text || '').trim();

        // 1. Kiểm tra nếu là hỗn số: "w a/b" (ví dụ: "2 3/7", "3 1/4")
        const mixedMatch = text.match(/^(\d+)\s+(\d+)\/(\d+)$/);
        // 2. Kiểm tra nếu là phân số đơn thuần: "a/b" (ví dụ: "17/7", "3/4")
        const fracMatch = text.match(/^(\d+)\/(\d+)$/);

        if (mixedMatch) {
          // Hỗn số chuẩn Việt Nam (GDPT 2018): Phần nguyên bên trái, phân số có gạch ngang ở giữa bên phải
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

          // Phần nguyên (căn giữa theo trục Y tại centerY)
          ctx.font = 'bold 64px Nunito, sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
          ctx.shadowBlur = 12;
          ctx.fillText(whole, wholeX, centerY);

          // Phân số: Tử số
          ctx.font = 'bold 46px Nunito, sans-serif';
          ctx.textBaseline = 'bottom';
          ctx.fillText(num, fracX, centerY - 4);

          // Phân số: Dấu gạch ngang phân số nằm ngang ở giữa
          ctx.shadowBlur = 0;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(fracX - fracW / 2, centerY);
          ctx.lineTo(fracX + fracW / 2, centerY);
          ctx.stroke();

          // Phân số: Mẫu số
          ctx.shadowBlur = 12;
          ctx.textBaseline = 'top';
          ctx.fillText(den, fracX, centerY + 6);
          ctx.shadowBlur = 0;

        } else if (fracMatch) {
          // Định dạng phân số chuẩn: Tử số trên, Gạch ngang, Mẫu số dưới
          const num = fracMatch[1];
          const den = fracMatch[2];
          const centerY = canvas.height / 2 + 14;

          ctx.font = 'bold 58px Nunito, sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
          ctx.shadowBlur = 12;

          // Tử số
          ctx.textBaseline = 'bottom';
          ctx.fillText(num, canvas.width / 2, centerY - 4);

          // Dấu gạch ngang phân số
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

          // Mẫu số
          ctx.shadowBlur = 12;
          ctx.textBaseline = 'top';
          ctx.fillText(den, canvas.width / 2, centerY + 6);
          ctx.shadowBlur = 0;

        } else {
          // Số thập phân, tỉ số %, đơn vị đo hoặc số nguyên
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

        // BÁO CHO THREE.JS BIẾT TEXTURE ĐÃ ĐỔI MÀ KHÔNG TẠO MỚI (ZERO VRAM LEAK)
        this.gateTextures[i].needsUpdate = true;
      }
    }

    /* =========================================================================
     * 7. ĐIỀU KHIỂN & SỰ KIỆN ĐA THIẾT BỊ (TOUCH & KEYBOARD ZERO-LATENCY)
     * ========================================================================= */
    setupControls() {
      // 1. Phím bấm bàn phím cho Laptop / PC
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

      // 2. Mở khóa AudioContext toàn cầu khi người dùng tương tác lần đầu trên mọi thiết bị
      const unlockAudio = () => {
        this.sound.init();
      };
      ['touchstart', 'touchend', 'pointerdown', 'mousedown', 'keydown'].forEach(evt => {
        window.addEventListener(evt, unlockAudio, { passive: true, once: true });
      });

      // 3. Cảm ứng vuốt trên Điện thoại / Tablet (Full-Screen Swipe Gestures)
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
        // Bỏ qua swipe nếu chạm vào các nút điều khiển ảo hoặc modal
        if (target && target.closest && (target.closest('button') || target.closest('.pointer-events-auto') || target.closest('#explain-modal') || target.closest('#menu-screen') || target.closest('#victory-modal') || target.closest('#gameover-modal') || target.closest('#pause-modal') || target.closest('#shop-modal'))) {
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

      // 4. Gắn sự kiện PointerDown cho các phím ảo và 3 Thẻ đáp án trên HUD (Độ trễ 0ms)
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

      // Gắn sự kiện chọn Cổng A, B, C trực tiếp bằng 1 chạm
      bindTouchBtn('hud-opt-0', () => this.selectLaneDirectly(0));
      bindTouchBtn('hud-opt-1', () => this.selectLaneDirectly(1));
      bindTouchBtn('hud-opt-2', () => this.selectLaneDirectly(2));
      bindTouchBtn('btn-confirm-obstacle', () => this.confirmObstaclePass());

      bindTouchBtn('btn-touch-left', () => this.moveLane(-1));
      bindTouchBtn('btn-touch-right', () => this.moveLane(1));
      bindTouchBtn('btn-touch-jump', () => this.jump());
      bindTouchBtn('btn-touch-slowmo', () => this.toggleSlowMo());
      bindTouchBtn('btn-slowmo', () => this.toggleSlowMo());
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

      // Tự động tạm dừng khi ẩn tab để tránh nhảy tọa độ đột ngột
      document.addEventListener('visibilitychange', () => {
        if (document.hidden && (this.state === STATES.PLAYING || this.state === STATES.BOSS)) {
          this.pauseGame();
        }
      });
    }

    // Chọn làn trực tiếp bằng cách bấm vào Cổng A, B, C trên HUD hoặc phím 1, 2, 3
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

    // Đồng bộ nội dung 3 thẻ đáp án trên HUD
    updateOptionsHUD(q) {
      for (let i = 0; i < 3; i++) {
        const textEl = document.getElementById(`hud-opt-text-${i}`);
        if (textEl && q && q.options && q.options[i]) {
          textEl.innerHTML = formatMathHTML(q.options[i].text);
        }
      }
      this.updateSelectedOptionUI();
    }

    // Hiệu ứng viền phát sáng nổi bật cho Cổng/Làn đang được phi thuyền chọn
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

    // Xác nhận đưa ra đáp án cuối cùng để vượt chướng ngại vật ngay (hoặc bấm Enter)
    confirmObstaclePass() {
      if ((this.state !== STATES.PLAYING && this.state !== STATES.BOSS) || !this.gateWave.active || this.gateWave.resolved) return;

      this.sound.playBoost();
      this.gateWave.resolved = true;
      const chosenLane = this.playerLaneIndex;
      const q = this.gateWave.questionData;
      const isCorrect = (chosenLane === q.correctIndex);

      // Điểm thưởng tốc độ (còn dư bao nhiêu giây thưởng bấy nhiêu điểm)
      const timeBonus = Math.max(0, Math.floor(this.questionTimeRemaining));

      // Lướt thần tốc qua cổng
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

    // Xử lý khi hết trọn vẹn 1 phút (60 giây) mà chưa vượt chướng ngại vật
    handleQuestionTimeout() {
      if (!this.gateWave.active || this.gateWave.resolved) return;
      this.gateWave.resolved = true;
      const chosenLane = this.playerLaneIndex;
      const q = this.gateWave.questionData;
      const isCorrect = (chosenLane === q.correctIndex);

      this.gateWave.z = 0;
      this.gateWave.meshes.forEach(m => m.position.z = 0);

      if (isCorrect) {
        this.handleCorrectAnswer();
      } else {
        this.handleWrongAnswer(q, true); // true = Hết giờ 1 phút
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
          badgeEl.className = 'flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-950/90 border border-rose-500/80 shadow-inner animate-pulse';
          if (timerEl) timerEl.className = 'font-mono text-xs sm:text-sm font-black text-rose-400';
        } else if (remaining <= 25) {
          badgeEl.className = 'flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-950/90 border border-amber-500/80 shadow-inner';
          if (timerEl) timerEl.className = 'font-mono text-xs sm:text-sm font-black text-amber-300';
        } else {
          badgeEl.className = 'flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-cyan-400/60 shadow-inner';
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
     * 8. QUẢN LÝ TIẾN ĐỘ & TRẠNG THÁI GAME
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

      // Cập nhật theme theo chặng
      const theme = STAGE_THEMES[stageId] || STAGE_THEMES[1];
      this.scene.background.setHex(theme.fogColor);
      this.scene.fog.color.setHex(theme.fogColor);

      // Cập nhật màu đường đua
      this.trackSegments.forEach(seg => {
        seg.children[0].material.color.setHex(theme.groundColor);
      });

      // Ẩn tất cả vật thể đang bay
      this.coinPool.forEach(c => c.visible = false);
      this.barrierPool.forEach(b => b.visible = false);
      this.bulletPool.forEach(b => b.visible = false);
      this.particlePool.forEach(p => p.visible = false);

      if (this.bossMesh) this.bossMesh.visible = false;
      const bossHud = document.getElementById('boss-hud');
      if (bossHud) bossHud.classList.add('hidden');

      // Chuyển màn hình
      this.hideAllModals();
      const hud = document.getElementById('hud-container');
      if (hud) hud.classList.remove('hidden');

      this.updateHUD();
      this.updateSelectedOptionUI();
      this.state = STATES.PLAYING;

      // Kích hoạt câu hỏi đầu tiên
      this.spawnNextQuestion();
    }

    spawnNextQuestion() {
      this.questionIndex++;

      // Kiểm tra xem đã đến lúc đấu Boss chưa (8 câu đúng trong chặng thường)
      if (!this.isEndlessMode && this.questionIndex > this.questionsPerStage) {
        this.startBossFight();
        return;
      }

      // Khởi tạo thời gian 1 phút (60 giây) cho mỗi chướng ngại vật
      this.questionTimeLimit = 60.0;
      this.questionTimeRemaining = 60.0;
      this.lastTickSecond = 60;
      this.updateTimerHUD();

      // Sinh câu hỏi từ mathEngine.js
      const q = window.MathEngine5.generate(this.currentStageId);
      this.gateWave.questionData = q;
      this.gateWave.z = -100;
      this.gateWave.resolved = false;
      this.gateWave.active = true;

      // Cập nhật 3 Texture Cổng (Zero-Allocation)
      this.renderGateTextures(q);

      // Hiển thị 3 Cổng ở z = -100
      for (let i = 0; i < 3; i++) {
        const mesh = this.gateWave.meshes[i];
        mesh.position.set(LANES[i], 0, -100);
        mesh.visible = true;
      }

      // Rải xu vàng ngẫu nhiên giữa đường đua
      this.spawnCoinsBetweenGates(-100, -25);

      // Đã loại bỏ rào chắn gây mất mạng để học sinh tập trung làm Toán

      // Cập nhật HUD câu hỏi
      this.updateQuestionCard(q);
    }

    spawnCoinsBetweenGates(startZ, endZ) {
      let poolIdx = 0;
      for (let z = startZ + 18; z < endZ; z += 12) {
        if (Math.random() > 0.3 && poolIdx < this.coinPool.length) {
          const coin = this.coinPool[poolIdx++];
          const lane = randChoice(LANES);
          coin.position.set(lane, 0.75, z);
          coin.visible = true;
        }
      }
    }


    spawnBarriersBetweenGates(startZ, endZ) {
      // Đã loại bỏ hoàn toàn rào chắn va chạm gây mất mạng
    }


    updateQuestionCard(q) {
      const qText = document.getElementById('hud-question-text');
      const qNum = document.getElementById('hud-question-number');
      const stName = document.getElementById('hud-stage-name');
      const svgBox = document.getElementById('hud-svg-container');

      if (qText) qText.innerHTML = formatMathHTML(q.question);
      if (qNum) {
        if (this.state === STATES.BOSS) {
          qNum.textContent = `💥 Thử Thách Đấu Boss (${this.bossCurrentHP} HP)`;
        } else if (this.isEndlessMode) {
          qNum.textContent = `Chướng ngại vật ${this.questionIndex}`;
        } else {
          qNum.textContent = `Chướng ngại vật ${this.questionIndex} / ${this.questionsPerStage}`;
        }
      }
      if (stName) {
        const theme = STAGE_THEMES[this.currentStageId] || STAGE_THEMES[1];
        stName.innerHTML = `<span>${theme.icon}</span> ${this.isEndlessMode ? 'ĐUA VÔ TẬN' : theme.name.toUpperCase()}`;
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

      // Cập nhật 3 Thẻ lựa chọn đáp án trực quan trên HUD cho học sinh
      this.updateOptionsHUD(q);
    }

    /* =========================================================================
     * 9. XỬ LÝ VA CHẠM CỔNG ĐÁP ÁN (FAIR HITBOX & RESOLVED ONCE)
     * ========================================================================= */
    checkGateCollision() {
      if (!this.gateWave.active || this.gateWave.resolved) return;

      // Cổng tiến gần người chơi (z = 0)
      if (this.gateWave.z >= -1.8 && this.gateWave.z <= 1.8) {
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
        // Bắn Laser 3D rút máu Boss
        this.fireLaserAtBoss();
      }

      this.updateHUD();

      // Sang câu tiếp theo sau 0.8s
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
      this.invulnerableTimer = 1.5; // Bất tử nhấp nháy 1.5s
      this.sound.playWrong();

      // Hiệu ứng đỏ màn hình
      const dmg = document.getElementById('damage-overlay');
      if (dmg) {
        dmg.style.opacity = '1';
        setTimeout(() => dmg.style.opacity = '0', 250);
      }

      this.updateHUD();

      if (this.hearts <= 0) {
        this.gameOver();
      } else {
        // Tạm dừng và hiện giải thích tức thì
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
     * 10. ĐẤU BOSS 3D (BOSS BATTLE MECHANICS)
     * ========================================================================= */
    startBossFight() {
      this.state = STATES.BOSS;
      this.bossCurrentHP = this.bossMaxHP;

      const theme = STAGE_THEMES[this.currentStageId] || STAGE_THEMES[1];
      this.bossMesh.children[0].material.color.setHex(theme.bossColor);
      this.bossMesh.visible = true;
      this.bossMesh.position.set(0, 3.5, -38);

      const bossHud = document.getElementById('boss-hud');
      const bossName = document.getElementById('boss-name');
      const bossAvatar = document.getElementById('boss-avatar');
      if (bossHud) bossHud.classList.remove('hidden');
      if (bossName) bossName.textContent = theme.bossName;
      if (bossAvatar) bossAvatar.textContent = theme.icon;

      this.updateBossHPBar();
      this.sound.playBossRoar();
      this.cameraShakeIntensity = 0.5;

      // Sinh câu hỏi đánh Boss
      this.spawnNextQuestion();
    }

    fireLaserAtBoss() {
      this.sound.playLaser();
      this.bossCurrentHP--;
      this.updateBossHPBar();

      // Bắn tia hạt va chạm vào Boss
      const bossPos = this.bossMesh.position.clone();
      this.spawnExplosion(bossPos, 0xef4444, 28);
      this.sound.playBossHit();
      this.cameraShakeIntensity = 0.45;

      if (this.bossCurrentHP <= 0) {
        // Hạ Boss -> Chiến Thắng!
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
     * 11. CẬP NHẬT GIAO DIỆN HUD & MODALS
     * ========================================================================= */
    updateHUD() {
      // Trái tim
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

      // Combo badge
      const comboBadge = document.getElementById('hud-combo-badge');
      const comboText = document.getElementById('hud-combo-text');
      if (comboBadge && comboText) {
        if (this.combo >= 2) {
          comboBadge.classList.remove('hidden');
          comboText.textContent = `COMBO x${this.combo >= 4 ? 3 : (this.combo >= 2 ? 2 : 1)}`;
        } else {
          comboBadge.classList.add('hidden');
        }
      }

      // Xu & Điểm
      const coinsEl = document.getElementById('hud-coins');
      const scoreEl = document.getElementById('hud-score');
      if (coinsEl) coinsEl.textContent = this.coins;
      if (scoreEl) scoreEl.textContent = this.score;

      // Slow-Mo Bar
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
      if (this.score > this.savedData.highScore) {
        this.savedData.highScore = this.score;
      }
      this.savedData.coins += 25; // Thưởng diệt Boss
      this.saveData();

      const modal = document.getElementById('victory-modal');
      const stName = document.getElementById('victory-stage-name');
      const scoreEl = document.getElementById('victory-score');
      const coinsEl = document.getElementById('victory-coins');

      const theme = STAGE_THEMES[this.currentStageId] || STAGE_THEMES[1];
      if (stName) stName.textContent = `Bạn đã hoàn thành xuất sắc ${theme.name}!`;
      if (scoreEl) scoreEl.textContent = `+${this.score}`;
      if (coinsEl) coinsEl.innerHTML = `<span>🪙</span> +${this.coins + 25}`;

      if (modal) modal.classList.remove('hidden');
    }

    gameOver() {
      this.state = STATES.GAMEOVER;
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

      const hud = document.getElementById('hud-container');
      if (hud) hud.classList.add('hidden');

      const menu = document.getElementById('menu-screen');
      if (menu) menu.classList.remove('hidden');

      if (this.bossMesh) this.bossMesh.visible = false;
      this.gateWave.active = false;
      this.gateWave.meshes.forEach(m => m.visible = false);
      this.coinPool.forEach(c => c.visible = false);
      this.barrierPool.forEach(b => b.visible = false);

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
     * 12. CỬA HÀNG SKIN 3D
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
        { id: 1, name: "Chiến Hạm Tia Chớp", price: 0, desc: "Phi thuyền siêu thanh xanh lam (Mặc định)", icon: "🚀" },
        { id: 2, name: "Rô-bốt Thám Hiểm", price: 50, desc: "Robot hình hộp vàng cam ngộ nghĩnh", icon: "🤖" },
        { id: 3, name: "Phi Thuyền Lửa Đỏ", price: 100, desc: "Chiến hạm vũ trụ đỏ cánh kép dũng mãnh", icon: "🛸" }
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
     * 13. VÒNG LẶP RENDER DUY NHẤT (ANIMATION LOOP - 60 FPS)
     * ========================================================================= */
    animate() {
      requestAnimationFrame(this.animate);

      // Kẹp thời gian khung hình tránh nhảy vọt delta
      const rawDelta = this.clock.getDelta();
      const dt = Math.min(rawDelta, 0.05);

      // Tính toán tốc độ game (Slow-Motion)
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
      const currentSpeed = (BASE_SPEED + Math.min(this.combo, 6) * 1.2) * (this.state === STATES.MENU ? 0.35 : 1.0);

      // 1. Cập nhật đường đua cuộn Z (Object Pooling)
      this.trackSegments.forEach(seg => {
        seg.position.z += currentSpeed * effectiveDt;
        if (seg.position.z > TRACK_SEGMENT_LENGTH) {
          seg.position.z -= NUM_TRACK_SEGMENTS * TRACK_SEGMENT_LENGTH;
        }
      });

      // 2. Chế độ MENU: Xoay nhân vật nhẹ nhàng trên bệ phóng
      if (this.state === STATES.MENU) {
        if (this.playerGroup) {
          this.playerGroup.position.set(0, 0.7, 0);
          this.playerGroup.rotation.y += 1.2 * dt;
        }
        this.renderer.render(this.scene, this.camera);
        return;
      }

      // 3. Cập nhật Vật lý Người chơi (Nội suy Lerp mượt mà độc lập FPS)
      if (this.playerGroup) {
        // Di chuyển làn ngang X
        this.playerGroup.position.x = THREE.MathUtils.lerp(
          this.playerGroup.position.x,
          this.playerTargetX,
          1 - Math.exp(-14 * dt)
        );

        // Nghiêng thân khi chuyển làn
        const rollTarget = (this.playerTargetX - this.playerGroup.position.x) * -0.22;
        this.playerGroup.rotation.z = THREE.MathUtils.lerp(
          this.playerGroup.rotation.z,
          rollTarget,
          1 - Math.exp(-12 * dt)
        );

        // Nhảy và rơi theo trọng lực Y
        if (this.isJumping) {
          this.playerVelY += GRAVITY * effectiveDt;
          this.playerPosY += this.playerVelY * effectiveDt;

          // Lộn vòng nhẹ khi nhảy
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
        }

        this.playerGroup.position.y = 0.65 + this.playerPosY;

        // Cập nhật đĩa Blob Shadow bám đất
        if (this.blobShadow) {
          this.blobShadow.position.x = this.playerGroup.position.x;
          // Thu nhỏ và mờ dần khi nhảy cao
          const jumpFactor = Math.max(0, 1 - (this.playerPosY / 2.8));
          this.blobShadow.scale.set(jumpFactor, jumpFactor, jumpFactor);
          this.blobShadow.material.opacity = 0.45 * jumpFactor;
        }

        // Nhấp nháy i-frames khi bất tử tạm thời
        if (this.invulnerableTimer > 0) {
          this.invulnerableTimer -= dt;
          this.playerGroup.visible = Math.floor(Date.now() / 80) % 2 === 0;
        } else {
          this.playerGroup.visible = true;
        }
      }

      // 4. Cập nhật Camera theo sau & Rung camera Damped Shake (Tự thích ứng đa màn hình)
      if (this.camera) {
        const camTargetX = this.playerGroup ? this.playerGroup.position.x * 0.42 : 0;
        this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, camTargetX, 1 - Math.exp(-8 * dt));

        // Tự động căn góc FOV và chiều cao camera cho màn hình dọc (điện thoại) và ngang (laptop)
        const isPortrait = window.innerWidth < window.innerHeight;
        const targetFOV = isPortrait ? 78 : (this.combo >= 3 ? 70 : 60);
        const targetCamY = isPortrait ? 5.2 : 4.2;
        const targetCamZ = isPortrait ? 9.6 : 7.8;

        // Rung camera khi gặp va chạm hoặc laser
        if (this.cameraShakeIntensity > 0) {
          this.camera.position.x += (Math.random() - 0.5) * this.cameraShakeIntensity;
          this.camera.position.y = targetCamY + (Math.random() - 0.5) * this.cameraShakeIntensity;
          this.cameraShakeIntensity = Math.max(0, this.cameraShakeIntensity - dt * 2.8);
        } else {
          this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, targetCamY, 1 - Math.exp(-6 * dt));
        }

        this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, targetCamZ, 1 - Math.exp(-6 * dt));

        // Camera FOV mượt mà
        this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFOV, 1 - Math.exp(-6 * dt));
        this.camera.updateProjectionMatrix();
      }

      // 5. Cập nhật Chướng Ngại Vật (Thời gian 1 phút & Cổng Năng Lượng tiến về người chơi)
      if (this.gateWave.active) {
        if (!this.gateWave.resolved && (this.state === STATES.PLAYING || this.state === STATES.BOSS)) {
          // Trừ thời gian làm bài của chướng ngại vật (1 phút = 60s)
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
          // Khi chưa giải quyết: Cổng tiến từ -100 về 0 theo tỷ lệ 1 phút (60 giây)
          const timeProgress = Math.max(0, Math.min(1, 1 - (this.questionTimeRemaining / this.questionTimeLimit)));
          this.gateWave.z = -100 + (timeProgress * 100);
        } else {
          // Khi đã giải quyết (chọn đúng/sai hoặc bấm Vượt ngay): cổng lướt nhanh về sau người chơi
          this.gateWave.z += (currentSpeed * 2.5) * effectiveDt;
        }

        this.gateWave.meshes.forEach(m => {
          m.position.z = this.gateWave.z;
        });

        // Kiểm tra va chạm cổng nếu học sinh di chuyển qua
        this.checkGateCollision();

        // Cập nhật thanh khoảng cách cổng trên HUD
        const proxBar = document.getElementById('hud-gate-proximity-bar');
        if (proxBar) {
          const progress = Math.max(0, Math.min(100, ((this.gateWave.z + 100) / 100) * 100));
          proxBar.style.width = `${progress}%`;
        }

        // Cổng trôi qua camera -> ẩn đi
        if (this.gateWave.z > 14) {
          this.gateWave.active = false;
          this.gateWave.meshes.forEach(m => m.visible = false);
        }
      }

      // 6. Cập nhật Xu Vàng (Xoay tròn & Hút nhẹ khi ở gần)
      this.coinPool.forEach(coin => {
        if (!coin.visible) return;
        coin.position.z += currentSpeed * effectiveDt;
        coin.rotation.y += 3.5 * effectiveDt;

        // Kiểm tra hút xu (Magnet)
        if (this.playerGroup) {
          const dx = this.playerGroup.position.x - coin.position.x;
          const dz = this.playerGroup.position.z - coin.position.z;
          const dist = Math.sqrt(dx * dx + dz * dz);

          if (dist < 4.2) {
            coin.position.x += dx * 7 * dt;
          }

          // Ăn xu
          if (dist < 1.1 && Math.abs(this.playerGroup.position.y - coin.position.y) < 1.2) {
            coin.visible = false;
            this.coins++;
            this.savedData.coins++;
            this.score += 5;
            this.sound.playCoin(this.combo);
            this.spawnExplosion(coin.position, 0xfbbf24, 10);
            this.updateHUD();
          }
        }

        if (coin.position.z > 14) coin.visible = false;
      });

      // 7. Cập nhật Rào Chắn (Đã loại bỏ va chạm gây mất mạng)
      this.barrierPool.forEach(bar => {
        if (!bar.visible) return;
        bar.position.z += currentSpeed * effectiveDt;
        if (bar.position.z > 14) bar.visible = false;
      });

      // 8. Cập nhật Boss 3D (Lướt ngang & Bắn đạn)
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
        this.bossMesh.position.y = 3.5 + Math.sin(this.runAnimTimer * 0.8) * 0.4;
      }

      // 9. Cập nhật Hạt nổ 3D (Particle Pool)
      this.particlePool.forEach(p => {
        if (!p.visible) return;
        p.userData.life += dt;
        if (p.userData.life >= p.userData.maxLife) {
          p.visible = false;
        } else {
          p.position.x += p.userData.vx * dt;
          p.position.y += p.userData.vy * dt;
          p.position.z += p.userData.vz * dt;
          p.userData.vy -= 9.8 * dt; // Rơi xuống đất
          p.scale.multiplyScalar(0.96);
        }
      });

      // 10. RENDER FRAME
      this.renderer.render(this.scene, this.camera);
    }
  }

  // Khởi tạo thực thể Game toàn cục an toàn
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
