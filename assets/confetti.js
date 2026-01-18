/**
 * CONFETTI CELEBRATION EFFECT
 * Lightweight canvas-based confetti for achievements
 */

(function() {
  'use strict';

  if (window.TeenDeenConfetti) return;

  class ConfettiEffect {
    constructor() {
      this.enabled = this.loadSettings();
      this.canvas = null;
      this.ctx = null;
      this.particles = [];
      this.animationId = null;
    }

    loadSettings() {
      try {
        const setting = localStorage.getItem('teenDeen.animations.enabled');
        return setting === null || setting === 'true';
      } catch {
        return true;
      }
    }

    saveSettings() {
      try {
        localStorage.setItem('teenDeen.animations.enabled', this.enabled.toString());
      } catch {}
    }

    setEnabled(enabled) {
      this.enabled = enabled;
      this.saveSettings();
    }

    celebrate() {
      if (!this.enabled) return;

      if (!this.canvas) {
        this.createCanvas();
      }

      this.particles = [];
      const colors = ['#ff9f43', '#ffd166', '#06d6a0', '#118ab2', '#ef476f'];
      const particleCount = 50;

      for (let i = 0; i < particleCount; i++) {
        this.particles.push({
          x: Math.random() * this.canvas.width,
          y: this.canvas.height + 10,
          vx: (Math.random() - 0.5) * 6,
          vy: -(Math.random() * 8 + 8),
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 10,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 8 + 4,
          gravity: 0.3,
          life: 1
        });
      }

      this.canvas.style.display = 'block';
      this.animate();

      setTimeout(() => {
        this.stop();
      }, 3000);
    }

    createCanvas() {
      this.canvas = document.createElement('canvas');
      this.canvas.style.position = 'fixed';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.canvas.style.pointerEvents = 'none';
      this.canvas.style.zIndex = '9999';
      this.canvas.style.display = 'none';
      document.body.appendChild(this.canvas);

      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.ctx = this.canvas.getContext('2d');

      window.addEventListener('resize', () => {
        if (this.canvas) {
          this.canvas.width = window.innerWidth;
          this.canvas.height = window.innerHeight;
        }
      });
    }

    animate() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.particles.forEach((p, i) => {
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.life -= 0.01;

        if (p.y > this.canvas.height || p.life <= 0) {
          this.particles.splice(i, 1);
          return;
        }

        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.globalAlpha = p.life;
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        this.ctx.restore();
      });

      if (this.particles.length > 0) {
        this.animationId = requestAnimationFrame(() => this.animate());
      } else {
        this.stop();
      }
    }

    stop() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
      if (this.canvas) {
        this.canvas.style.display = 'none';
      }
      this.particles = [];
    }
  }

  window.TeenDeenConfetti = new ConfettiEffect();

})();
