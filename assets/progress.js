/**
 * PROGRESS.JS - Progress tracking and display logic
 */

(function() {
  'use strict';

  const state = {
    allLessons: [],
    completedLessons: new Set(),
    lessonScores: {}
  };

  function loadCompletedLessons() {
    try {
      const completed = JSON.parse(localStorage.getItem('completedLessons') || '[]');
      state.completedLessons = new Set(completed);
      state.lessonScores = JSON.parse(localStorage.getItem('lessonScores') || '{}');
    } catch {
      state.completedLessons = new Set();
      state.lessonScores = {};
    }
  }

  async function loadLessons() {
    const manifestUrl = window.withBase ? window.withBase('data/lessons.json') : 'data/lessons.json';
    
    try {
      const res = await fetch(manifestUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.lessons || [];
    } catch (error) {
      console.error('[Progress] Error loading lessons:', error);
      return [];
    }
  }

  function updateStats() {
    const totalLessons = state.allLessons.length;
    const completedCount = state.completedLessons.size;
    const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    // Calculate average quiz score
    const scores = Object.values(state.lessonScores).filter(s => s.score !== null && s.total > 0);
    let average = '—';
    if (scores.length > 0) {
      const totalScore = scores.reduce((sum, s) => sum + (s.score / s.total), 0);
      average = Math.round((totalScore / scores.length) * 100) + '%';
    }

    document.getElementById('completed-count').textContent = completedCount;
    document.getElementById('completion-percentage').textContent = percentage + '%';
    document.getElementById('quiz-average').textContent = average;
  }

  function renderCompletedLessons() {
    const grid = document.getElementById('completed-lessons-grid');
    if (!grid) return;

    const completedLessonData = state.allLessons.filter(lesson => 
      state.completedLessons.has(lesson.id)
    );

    if (completedLessonData.length === 0) {
      grid.innerHTML = `
        <div class="no-lessons">
          <p class="no-lessons-title">No lessons completed yet</p>
          <p class="no-lessons-text">Start learning to track your progress here.</p>
          <a href="${window.withBase ? window.withBase('lessons/') : 'lessons/'}" class="card-btn btn-inline" style="margin-top: 16px;">Browse Lessons →</a>
        </div>
      `;
      return;
    }

    // Sort by lesson number
    completedLessonData.sort((a, b) => a.number - b.number);

    grid.innerHTML = completedLessonData.map(lesson => {
      const badge = `Lesson ${String(lesson.number).padStart(2, '0')}`;
      const lessonUrl = window.withBase ? 
        window.withBase(`lessons/lesson.html?id=${encodeURIComponent(lesson.id)}`) :
        `lessons/lesson.html?id=${encodeURIComponent(lesson.id)}`;
      
      const scoreData = state.lessonScores[lesson.id];
      const scoreText = scoreData ? 
        `Quiz: ${scoreData.score}/${scoreData.total}` : 
        'Completed';

      return `
        <a href="${lessonUrl}" class="card">
          <div class="card-header">
            <span class="card-badge">${badge}</span>
            <span style="font-size: 18px;">✓</span>
          </div>
          <h3>${lesson.title}</h3>
          <p class="card-description">${lesson.tags.join(' • ')}</p>
          <div class="card-meta">
            <span>⏱ ${lesson.minutes} min</span>
            <span>${scoreText}</span>
          </div>
        </a>
      `;
    }).join('');
  }

  async function init() {
    loadCompletedLessons();
    state.allLessons = await loadLessons();
    updateStats();
    renderCompletedLessons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
