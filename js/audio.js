/**
 * ============================================================================
 * ĐẢO KHO BÁU TOÁN 5 - WEB AUDIO API SOUND SYNTHESIZER
 * Không sử dụng bất kỳ file âm thanh ngoài (.mp3, .wav) nào.
 * Tất cả hiệu ứng âm thanh được tổng hợp thời gian thực bằng Oscillator và Gain!
 * ============================================================================
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('daoKhoBau_muted') === 'true';
    this.initialized = false;
  }

  // Khởi tạo AudioContext sau tương tác đầu tiên của người dùng (tránh lỗi Autoplay của Chrome)
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.initialized = true;
      }
    } else if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.init();
    this.muted = !this.muted;
    localStorage.setItem('daoKhoBau_muted', this.muted);
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  // Helper tạo nốt nhạc với ADSR envelope
  playTone(freq, type = 'sine', duration = 0.2, gain = 0.15, startTime = 0, pitchDecay = 0) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime + startTime;
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = type;
      if (pitchDecay !== 0) {
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq + pitchDecay), now + duration);
      } else {
        osc.frequency.setValueAtTime(freq, now);
      }

      // Attack - Decay - Sustain - Release (ADSR)
      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.linearRampToValueAtTime(gain, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.05);
    } catch (e) {
      console.warn("Audio playTone error:", e);
    }
  }

  // 1. Âm bấm nút
  playClick() {
    if (this.muted) return;
    this.playTone(600, 'triangle', 0.05, 0.08, 0, -200);
  }

  // 2. Âm thanh trả lời Đúng (Cheerful Major Arpeggio: C5 - E5 - G5 - C6)
  playCorrect() {
    if (this.muted) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'sine', 0.18, 0.12, idx * 0.07);
    });
  }

  // 3. Âm thanh trả lời Sai (Gentle low wobble slide - khích lệ, không gay gắt)
  playWrong() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.linearRampToValueAtTime(140, now + 0.35);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      // Lowpass filter làm dịu âm thanh
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {
      console.warn("Audio playWrong error:", e);
    }
  }

  // 4. Âm thanh Combo (Độ cao tăng dần theo chuỗi combo liên tiếp)
  playCombo(streak = 2) {
    if (this.muted) return;
    const baseFreq = 587.33; // D5
    const multiplier = 1 + Math.min(streak, 10) * 0.12;
    const freq = baseFreq * multiplier;

    this.playTone(freq, 'triangle', 0.12, 0.12, 0);
    this.playTone(freq * 1.25, 'sine', 0.18, 0.14, 0.06);
    this.playTone(freq * 1.5, 'sine', 0.25, 0.16, 0.12);
  }

  // 5. Âm thanh Vượt qua màn chơi (Level Up / Stage Clear)
  playLevelUp() {
    if (this.muted) return;
    const arpeggio = [440, 554.37, 659.25, 880, 1108.73, 1318.51]; // A major
    arpeggio.forEach((f, i) => {
      this.playTone(f, 'sine', 0.22, 0.14, i * 0.08);
    });
  }

  // 6. Âm thanh Chiến thắng hoành tráng (Victory Fanfare)
  playVictory() {
    if (this.muted) return;
    const notes = [
      { f: 523.25, d: 0.15, t: 0 },    // C5
      { f: 523.25, d: 0.15, t: 0.15 }, // C5
      { f: 523.25, d: 0.15, t: 0.30 }, // C5
      { f: 659.25, d: 0.40, t: 0.45 }, // E5
      { f: 587.33, d: 0.20, t: 0.85 }, // D5
      { f: 659.25, d: 0.20, t: 1.05 }, // E5
      { f: 783.99, d: 0.60, t: 1.25 }, // G5
      { f: 1046.50, d: 0.8, t: 1.85 }  // C6 (Grand finish)
    ];

    notes.forEach(n => {
      this.playTone(n.f, 'triangle', n.d, 0.16, n.t);
      this.playTone(n.f * 1.002, 'sine', n.d, 0.12, n.t); // tạo chorus nhẹ
    });
  }

  // 7. Âm thanh Hết mạng / Game Over
  playGameOver() {
    if (this.muted) return;
    const notes = [392, 349.23, 329.63, 261.63]; // G4, F4, E4, C4
    notes.forEach((f, i) => {
      this.playTone(f, 'sawtooth', 0.35, 0.1, i * 0.25, -20);
    });
  }

  // 8. Âm thanh Boss gầm gừ / Xuất hiện (Deep Rumble & Dramatic chord)
  playBossRoar() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Low sub rumble
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.linearRampToValueAtTime(45, now + 0.8);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.85);

      // Dramatic chords (D minor)
      setTimeout(() => {
        this.playTone(146.83, 'triangle', 0.7, 0.15, 0); // D3
        this.playTone(174.61, 'triangle', 0.7, 0.12, 0.05); // F3
        this.playTone(220.00, 'triangle', 0.7, 0.12, 0.1); // A3
      }, 200);
    } catch (e) {
      console.warn("Audio playBossRoar error:", e);
    }
  }

  // 9. Âm thanh Đánh trúng Boss (Hit impact)
  playBossHit() {
    if (this.muted) return;
    this.playTone(180, 'square', 0.12, 0.15, 0, -80);
    this.playTone(880, 'sine', 0.15, 0.1, 0.05);
  }

  // 10. Âm thanh Tích tắc đồng hồ (Speed Mode)
  playTick(urgent = false) {
    if (this.muted) return;
    if (urgent) {
      this.playTone(900, 'triangle', 0.04, 0.12);
      this.playTone(1200, 'sine', 0.04, 0.1, 0.06);
    } else {
      this.playTone(600, 'triangle', 0.03, 0.08);
    }
  }

  // 11. Âm thanh Mở khóa Huy hiệu / Kho báu
  playBadgeUnlock() {
    if (this.muted) return;
    const chime = [659.25, 830.61, 987.77, 1318.51, 1661.22]; // E major pentatonic sparkle
    chime.forEach((f, i) => {
      this.playTone(f, 'sine', 0.35, 0.12, i * 0.08);
    });
  }

  // 12. Âm thanh Bút vẽ bảng nháp
  playScratch() {
    if (this.muted) return;
    this.playTone(300 + Math.random() * 200, 'triangle', 0.02, 0.03);
  }
}

// Khởi tạo đối tượng toàn cục
window.soundEngine = new SoundEngine();

// Tự động kích hoạt AudioContext khi người dùng chạm hoặc click lần đầu vào trang
['click', 'touchstart', 'keydown'].forEach(evt => {
  window.addEventListener(evt, () => {
    if (window.soundEngine && !window.soundEngine.initialized) {
      window.soundEngine.init();
    }
  }, { once: true });
});
