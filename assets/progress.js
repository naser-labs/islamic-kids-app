/**
 * PROGRESS TRACKING SYSTEM
 * Handles XP, streaks, badges, completed lessons
 */

(function() {
  'use strict';

  if (window.TeenDeenProgress) return;

  const STORAGE_KEYS = {
    completedLessons: 'teenDeen.progress.completedLessons',
    xp: 'teenDeen.progress.xp',
    streak: 'teenDeen.progress.streak',
    badges: 'teenDeen.progress.badges',
    lastActivityDate: 'teenDeen.progress.lastActivityDate'
  };

  const XP_REWARDS = {
    completeLesson: 50,
    passQuiz: 50,
    perfectScore: 25,
    dailyStreak: 10
  };

  class ProgressTracker {
    constructor() {
      this.data = this.load();
    }

    load() {
      try {
        return {
          completedLessons: JSON.parse(localStorage.getItem(STORAGE_KEYS.completedLessons) || '[]'),
          xp: parseInt(localStorage.getItem(STORAGE_KEYS.xp) || '0', 10),
          streak: JSON.parse(localStorage.getItem(STORAGE_KEYS.streak) || '{"current":0,"best":0,"lastDate":null}'),
          badges: JSON.parse(localStorage.getItem(STORAGE_KEYS.badges) || '[]'),
          lastActivityDate: localStorage.getItem(STORAGE_KEYS.lastActivityDate) || null
        };
      } catch (err) {
        console.warn('[Progress] Load error:', err);
        return {
          completedLessons: [],
          xp: 0,
          streak: { current: 0, best: 0, lastDate: null },
          badges: [],
          lastActivityDate: null
        };
      }
    }

    save() {
      try {
        localStorage.setItem(STORAGE_KEYS.completedLessons, JSON.stringify(this.data.completedLessons));
        localStorage.setItem(STORAGE_KEYS.xp, this.data.xp.toString());
        localStorage.setItem(STORAGE_KEYS.streak, JSON.stringify(this.data.streak));
        localStorage.setItem(STORAGE_KEYS.badges, JSON.stringify(this.data.badges));
        if (this.data.lastActivityDate) {
          localStorage.setItem(STORAGE_KEYS.lastActivityDate, this.data.lastActivityDate);
        }
      } catch (err) {
        console.warn('[Progress] Save error:', err);
      }
    }

    addXP(amount, reason = '') {
      this.data.xp += amount;
      this.save();
      console.log(`[Progress] +${amount} XP${reason ? ` (${reason})` : ''}. Total: ${this.data.xp}`);
      this.dispatchEvent('xp-gained', { amount, total: this.data.xp, reason });
    }

    completeLesson(lessonId, score, total) {
      if (!this.data.completedLessons.includes(lessonId)) {
        this.data.completedLessons.push(lessonId);
        this.addXP(XP_REWARDS.completeLesson, 'Lesson completed');
      }

      const passed = score >= Math.ceil(total * 0.7);
      if (passed) {
        this.addXP(XP_REWARDS.passQuiz, 'Quiz passed');
      }

      if (score === total) {
        this.addXP(XP_REWARDS.perfectScore, 'Perfect score!');
      }

      this.updateStreak();
      this.checkBadges(lessonId, score, total);
      this.save();
    }

    updateStreak() {
      const today = new Date().toISOString().split('T')[0];
      const lastDate = this.data.streak.lastDate;

      if (lastDate === today) {
        return;
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastDate === yesterdayStr) {
        this.data.streak.current++;
        this.addXP(XP_REWARDS.dailyStreak, `${this.data.streak.current}-day streak!`);
      } else if (lastDate && lastDate !== today) {
        this.data.streak.current = 1;
      } else if (!lastDate) {
        this.data.streak.current = 1;
      }

      if (this.data.streak.current > this.data.streak.best) {
        this.data.streak.best = this.data.streak.current;
      }

      this.data.streak.lastDate = today;
      this.dispatchEvent('streak-updated', { current: this.data.streak.current, best: this.data.streak.best });
    }

    checkBadges(lessonId, score, total) {
      const badges = [];

      if (this.data.completedLessons.length === 1 && !this.hasBadge('first-step')) {
        badges.push({ id: 'first-step', name: 'First Step', desc: 'Complete your first lesson', icon: '👣', earnedAt: new Date().toISOString() });
      }

      if (lessonId === 'lesson-01' && score >= Math.ceil(total * 0.7) && !this.hasBadge('sincere-seeker')) {
        badges.push({ id: 'sincere-seeker', name: 'Sincere Seeker', desc: 'Pass Lesson 1: Intentions', icon: '🎯', earnedAt: new Date().toISOString() });
      }

      if (this.data.streak.current >= 3 && !this.hasBadge('streak-starter')) {
        badges.push({ id: 'streak-starter', name: 'Streak Starter', desc: '3-day learning streak', icon: '🔥', earnedAt: new Date().toISOString() });
      }

      if (this.data.streak.current >= 7 && !this.hasBadge('consistency-champ')) {
        badges.push({ id: 'consistency-champ', name: 'Consistency Champ', desc: '7-day learning streak', icon: '💪', earnedAt: new Date().toISOString() });
      }

      const perfectScores = this.getPerfectScoreCount();
      if (perfectScores >= 3 && !this.hasBadge('quiz-master')) {
        badges.push({ id: 'quiz-master', name: 'Quiz Master', desc: '3 perfect quiz scores', icon: '🏆', earnedAt: new Date().toISOString() });
      }

      if (this.data.completedLessons.length >= 10 && !this.hasBadge('dedicated-learner')) {
        badges.push({ id: 'dedicated-learner', name: 'Dedicated Learner', desc: 'Complete 10 lessons', icon: '📚', earnedAt: new Date().toISOString() });
      }

      badges.forEach(badge => {
        this.data.badges.push(badge);
        this.dispatchEvent('badge-earned', badge);
      });
    }

    hasBadge(badgeId) {
      return this.data.badges.some(b => b.id === badgeId);
    }

    getPerfectScoreCount() {
      let count = 0;
      try {
        const scores = JSON.parse(localStorage.getItem('lessonScores') || '{}');
        Object.values(scores).forEach(s => {
          if (s.score === s.total) count++;
        });
      } catch {}
      return count;
    }

    getStats() {
      return {
        completedCount: this.data.completedLessons.length,
        xp: this.data.xp,
        streak: this.data.streak,
        badges: this.data.badges,
        level: Math.floor(this.data.xp / 200) + 1
      };
    }

    dispatchEvent(name, detail) {
      window.dispatchEvent(new CustomEvent(`teendeen:${name}`, { detail }));
    }
  }

  window.TeenDeenProgress = new ProgressTracker();

})();
