/**
 * DAILY DEEN QUESTS
 * Daily mini-challenges to encourage Islamic practice
 */

(function() {
  'use strict';

  if (window.TeenDeenQuests) return;

  const STORAGE_KEY = 'teenDeen.quests.completed';

  class QuestManager {
    constructor() {
      this.quests = [];
      this.completed = this.loadCompleted();
    }

    loadCompleted() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      } catch {
        return [];
      }
    }

    saveCompleted() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.completed));
      } catch {}
    }

    async loadQuests() {
      try {
        const base = window.getSiteBase ? window.getSiteBase() : '/islamic-kids-app/';
        const url = `${base}data/quests.json`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          this.quests = data.quests || [];
          return true;
        }
      } catch (err) {
        console.warn('[Quests] Load failed:', err);
      }
      return false;
    }

    getTodaysQuest() {
      if (this.quests.length === 0) return null;

      const today = new Date().toISOString().split('T')[0];
      const hash = this.hashString(today);
      const index = hash % this.quests.length;
      return this.quests[index];
    }

    hashString(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }
      return Math.abs(hash);
    }

    isCompleted(questId) {
      return this.completed.includes(questId);
    }

    markCompleted(questId) {
      if (!this.completed.includes(questId)) {
        this.completed.push(questId);
        this.saveCompleted();
        window.dispatchEvent(new CustomEvent('teendeen:quest-completed', { detail: { questId } }));
      }
    }

    renderQuest(containerSelector) {
      const container = document.querySelector(containerSelector);
      if (!container) return;

      const quest = this.getTodaysQuest();
      if (!quest) {
        container.style.display = 'none';
        return;
      }

      const isCompleted = this.isCompleted(quest.id);
      const today = new Date().toISOString().split('T')[0];
      const key = `${quest.id}-${today}`;

      container.innerHTML = `
        <div class="card" style="background: linear-gradient(135deg, #fff7ec 0%, #ffefd5 100%); border-left: 4px solid var(--color-primary, #ff9f43);">
          <h3 style="margin: 0 0 8px 0; font-size: 1.1em; color: var(--color-text, #2f1b0f);">🎯 Today's Deen Quest</h3>
          <p style="margin: 0 0 12px 0; font-size: 1em; line-height: 1.6;">${quest.text}</p>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none;">
            <input 
              type="checkbox" 
              id="quest-checkbox-${quest.id}"
              ${isCompleted ? 'checked' : ''}
              style="width: 20px; height: 20px; cursor: pointer;"
            />
            <span style="font-size: 0.95em; color: var(--color-text-muted, #6c5a4d);">${isCompleted ? 'Completed!' : 'Mark as completed'}</span>
          </label>
        </div>
      `;

      document.getElementById(`quest-checkbox-${quest.id}`).addEventListener('change', (e) => {
        if (e.target.checked) {
          this.markCompleted(key);
        }
      });
    }
  }

  window.TeenDeenQuests = new QuestManager();

})();
