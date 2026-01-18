/**
 * TEXT-TO-SPEECH with KARAOKE HIGHLIGHT
 * Reads lesson content aloud with visual highlighting
 */

(function() {
  'use strict';

  if (window.TeenDeenTTS) return;

  const STORAGE_KEY = 'teenDeen.tts.settings';

  class TTSEngine {
    constructor() {
      this.supported = 'speechSynthesis' in window;
      this.synth = this.supported ? window.speechSynthesis : null;
      this.utterance = null;
      this.currentIndex = 0;
      this.blocks = [];
      this.playing = false;
      this.settings = this.loadSettings();
    }

    loadSettings() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : { speed: 0.95, voice: null };
      } catch {
        return { speed: 0.95, voice: null };
      }
    }

    saveSettings() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
      } catch {}
    }

    initialize(contentSelector = '.lesson-content') {
      if (!this.supported) {
        console.warn('[TTS] Speech synthesis not supported');
        return false;
      }

      const container = document.querySelector(contentSelector);
      if (!container) {
        console.warn('[TTS] Content container not found');
        return false;
      }

      this.blocks = Array.from(container.querySelectorAll('p, li, h2, h3, h4'))
        .filter(el => el.textContent.trim().length > 0)
        .map(el => ({
          element: el,
          text: el.textContent.trim()
        }));

      console.log(`[TTS] Initialized with ${this.blocks.length} blocks`);
      return true;
    }

    play() {
      if (!this.supported || this.blocks.length === 0) return;

      this.playing = true;
      this.readBlock(this.currentIndex);
      this.dispatchEvent('play');
    }

    pause() {
      if (!this.supported) return;
      this.synth.pause();
      this.playing = false;
      this.dispatchEvent('pause');
    }

    resume() {
      if (!this.supported) return;
      this.synth.resume();
      this.playing = true;
      this.dispatchEvent('resume');
    }

    stop() {
      if (!this.supported) return;
      this.synth.cancel();
      this.playing = false;
      this.currentIndex = 0;
      this.clearHighlights();
      this.dispatchEvent('stop');
    }

    readBlock(index) {
      if (index >= this.blocks.length) {
        this.stop();
        return;
      }

      const block = this.blocks[index];
      this.clearHighlights();
      block.element.classList.add('tts-active');
      block.element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      this.utterance = new SpeechSynthesisUtterance(block.text);
      this.utterance.rate = this.settings.speed;
      
      if (this.settings.voice) {
        const voices = this.synth.getVoices();
        const voice = voices.find(v => v.name === this.settings.voice);
        if (voice) this.utterance.voice = voice;
      }

      this.utterance.onend = () => {
        if (this.playing) {
          this.currentIndex++;
          this.readBlock(this.currentIndex);
        }
      };

      this.utterance.onerror = (err) => {
        console.error('[TTS] Error:', err);
        this.stop();
      };

      this.synth.speak(this.utterance);
    }

    clearHighlights() {
      this.blocks.forEach(b => b.element.classList.remove('tts-active'));
    }

    setSpeed(speed) {
      this.settings.speed = speed;
      this.saveSettings();
      if (this.playing) {
        const wasPlaying = this.playing;
        this.stop();
        if (wasPlaying) {
          setTimeout(() => this.play(), 100);
        }
      }
    }

    setVoice(voiceName) {
      this.settings.voice = voiceName;
      this.saveSettings();
    }

    getVoices() {
      return this.supported ? this.synth.getVoices() : [];
    }

    renderControls(containerSelector) {
      if (!this.supported) return;

      const container = document.querySelector(containerSelector);
      if (!container) return;

      container.innerHTML = `
        <div class="tts-controls" style="display: flex; align-items: center; gap: 12px; padding: 16px; background: var(--color-bg-warm, #fff7ec); border-radius: var(--radius-md, 12px); border: 2px solid var(--color-border, rgba(0,0,0,0.08)); margin: 24px 0;">
          <button id="tts-play-btn" class="tts-btn" title="Play">
            <span class="tts-icon">▶️</span>
          </button>
          <button id="tts-pause-btn" class="tts-btn hidden" style="display: none;" title="Pause">
            <span class="tts-icon">⏸️</span>
          </button>
          <button id="tts-stop-btn" class="tts-btn" title="Stop">
            <span class="tts-icon">⏹️</span>
          </button>
          <div style="flex: 1; display: flex; align-items: center; gap: 8px;">
            <label for="tts-speed" style="font-size: 0.9em; font-weight: 600; white-space: nowrap;">Speed:</label>
            <input type="range" id="tts-speed" min="0.5" max="1.5" step="0.1" value="${this.settings.speed}" style="flex: 1; cursor: pointer;" />
            <span id="tts-speed-value" style="font-size: 0.9em; min-width: 40px; text-align: right;">${this.settings.speed}x</span>
          </div>
        </div>
      `;

      document.getElementById('tts-play-btn').addEventListener('click', () => this.play());
      document.getElementById('tts-pause-btn').addEventListener('click', () => this.pause());
      document.getElementById('tts-stop-btn').addEventListener('click', () => this.stop());
      
      const speedSlider = document.getElementById('tts-speed');
      const speedValue = document.getElementById('tts-speed-value');
      speedSlider.addEventListener('input', (e) => {
        const speed = parseFloat(e.target.value);
        speedValue.textContent = `${speed}x`;
        this.setSpeed(speed);
      });

      window.addEventListener('teendeen:tts-play', () => {
        document.getElementById('tts-play-btn').style.display = 'none';
        document.getElementById('tts-pause-btn').style.display = 'inline-flex';
        document.getElementById('tts-pause-btn').classList.remove('hidden');
      });

      window.addEventListener('teendeen:tts-pause', () => {
        document.getElementById('tts-play-btn').style.display = 'inline-flex';
        document.getElementById('tts-pause-btn').style.display = 'none';
      });

      window.addEventListener('teendeen:tts-stop', () => {
        document.getElementById('tts-play-btn').style.display = 'inline-flex';
        document.getElementById('tts-pause-btn').style.display = 'none';
      });
    }

    dispatchEvent(name) {
      window.dispatchEvent(new CustomEvent(`teendeen:tts-${name}`));
    }
  }

  window.TeenDeenTTS = new TTSEngine();

})();
