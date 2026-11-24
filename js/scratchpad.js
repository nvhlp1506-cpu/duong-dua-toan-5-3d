/**
 * ============================================================================
 * ĐẢO KHO BÁU TOÁN 5 - BẢNG NHÁP MINI (CANVAS SCRATCHPAD)
 * Giúp học sinh lớp 5 đặt tính, nháp phân số và vẽ hình ngay trên màn hình.
 * Hỗ trợ cảm ứng đa điểm, màn hình Retina, đổi màu bút, tẩy xóa mượt mà.
 * ============================================================================
 */

class Scratchpad {
  constructor() {
    this.modal = null;
    this.canvas = null;
    this.ctx = null;
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;
    this.currentColor = '#0284c7'; // Xanh dương mặc định
    this.lineWidth = 3;
    this.isEraser = false;
    this.isOpen = false;
  }

  init() {
    this.modal = document.getElementById('scratchpad-modal');
    this.canvas = document.getElementById('scratchpad-canvas');
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.setupListeners();
    this.resizeCanvas();

    window.addEventListener('resize', () => {
      if (this.isOpen) {
        // Lưu nội dung cũ trước khi resize
        const temp = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.resizeCanvas();
        this.ctx.putImageData(temp, 0, 0);
      }
    });
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Kích thước thực theo CSS
    const width = rect.width || (this.canvas.parentElement ? this.canvas.parentElement.clientWidth : 340);
    const height = rect.height || 360;

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.ctx.scale(dpr, dpr);

    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.applyBrushSettings();
  }

  applyBrushSettings() {
    if (!this.ctx) return;
    if (this.isEraser) {
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.lineWidth = 24;
    } else {
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.strokeStyle = this.currentColor;
      this.ctx.lineWidth = this.lineWidth;
    }
  }

  setColor(color) {
    this.currentColor = color;
    this.isEraser = false;
    this.applyBrushSettings();
    this.updateActiveTools();
  }

  setLineWidth(w) {
    this.lineWidth = w;
    this.isEraser = false;
    this.applyBrushSettings();
    this.updateActiveTools();
  }

  setEraser() {
    this.isEraser = true;
    this.applyBrushSettings();
    this.updateActiveTools();
  }

  clear() {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (window.soundEngine) window.soundEngine.playClick();
  }

  toggle() {
    if (!this.modal) this.init();
    if (!this.modal) return;

    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.modal.classList.remove('hidden');
      setTimeout(() => this.resizeCanvas(), 50);
      if (window.soundEngine) window.soundEngine.playClick();
    } else {
      this.modal.classList.add('hidden');
    }
  }

  close() {
    if (this.modal) {
      this.isOpen = false;
      this.modal.classList.add('hidden');
    }
  }

  updateActiveTools() {
    // Highlight nút màu đang chọn
    document.querySelectorAll('.sp-color-btn').forEach(btn => {
      const color = btn.getAttribute('data-color');
      if (!this.isEraser && color === this.currentColor) {
        btn.classList.add('ring-4', 'ring-offset-2', 'ring-sky-400', 'scale-110');
      } else {
        btn.classList.remove('ring-4', 'ring-offset-2', 'ring-sky-400', 'scale-110');
      }
    });

    const eraserBtn = document.getElementById('sp-eraser-btn');
    if (eraserBtn) {
      if (this.isEraser) {
        eraserBtn.classList.add('bg-amber-500', 'text-white');
        eraserBtn.classList.remove('bg-white', 'text-slate-700');
      } else {
        eraserBtn.classList.remove('bg-amber-500', 'text-white');
        eraserBtn.classList.add('bg-white', 'text-slate-700');
      }
    }
  }

  getPointerPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    let clientX = e.clientX;
    let clientY = e.clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  setupListeners() {
    if (!this.canvas) return;

    const startDraw = (e) => {
      e.preventDefault();
      this.isDrawing = true;
      const pos = this.getPointerPos(e);
      this.lastX = pos.x;
      this.lastY = pos.y;
      this.applyBrushSettings();

      // Vẽ chấm nhỏ ngay điểm bắt đầu
      this.ctx.beginPath();
      this.ctx.arc(this.lastX, this.lastY, (this.isEraser ? 12 : this.lineWidth) / 2, 0, Math.PI * 2);
      this.ctx.fill();
    };

    const draw = (e) => {
      if (!this.isDrawing) return;
      e.preventDefault();
      const pos = this.getPointerPos(e);

      this.ctx.beginPath();
      this.ctx.moveTo(this.lastX, this.lastY);
      this.ctx.lineTo(pos.x, pos.y);
      this.ctx.stroke();

      this.lastX = pos.x;
      this.lastY = pos.y;
    };

    const stopDraw = (e) => {
      if (this.isDrawing) {
        e.preventDefault();
        this.isDrawing = false;
      }
    };

    // Chuột
    this.canvas.addEventListener('mousedown', startDraw);
    this.canvas.addEventListener('mousemove', draw);
    this.canvas.addEventListener('mouseup', stopDraw);
    this.canvas.addEventListener('mouseleave', stopDraw);

    // Cảm ứng (Touch)
    this.canvas.addEventListener('touchstart', startDraw, { passive: false });
    this.canvas.addEventListener('touchmove', draw, { passive: false });
    this.canvas.addEventListener('touchend', stopDraw, { passive: false });
    this.canvas.addEventListener('touchcancel', stopDraw, { passive: false });
  }
}

// Khởi tạo toàn cục
window.scratchpad = new Scratchpad();
document.addEventListener('DOMContentLoaded', () => {
  window.scratchpad.init();
});
