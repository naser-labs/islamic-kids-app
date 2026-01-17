// ==========================================
// MAIN.JS - Filtering & Interaction Logic
// ==========================================

(function() {
  const state = {
    allLessons: [],
    currentSearch: '',
    currentCategory: 'all',
    completedLessons: new Set(),
  };

  // Map lesson tags/categories to chip categories
  const categoryMap = {
    'foundations': ['Foundations of Faith'],
    'character': ['Role Models & Character', 'Strength of Character', 'Modesty & Personal Conduct'],
    'worship': ['Prayer & Worship', 'Purification & Cleanliness', 'Pillars of Islam & Iman'],
    'identity': ['Important Modern Topics', 'Wrap-Up & Reference'],
    'social': ['Unity & Following the Right Path'],
    'purpose': ['Pillars of Islam & Iman'],
  };

  function lessonMatchesCategory(lesson, category) {
    if (category === 'all') return true;
    const allowedTags = categoryMap[category] || [];
    return (lesson.tags || []).some(tag => allowedTags.includes(tag));
  }

  function filterLessons(search = '', category = 'all') {
    const searchLower = search.toLowerCase().trim();
    
    return state.allLessons.filter(lesson => {
      // Category filter
      if (!lessonMatchesCategory(lesson, category)) return false;
      
      // Search filter
      if (!searchLower) return true;
      
      return (
        String(lesson.number).includes(searchLower) ||
        lesson.title.toLowerCase().includes(searchLower) ||
        (lesson.tags || []).some(tag => tag.toLowerCase().includes(searchLower))
      );
    });
  }

  function renderLessonCard(lesson) {
    const isCompleted = state.completedLessons.has(lesson.id);
    const badge = `Lesson ${String(lesson.number).padStart(2, '0')}`;
    
    return `
      <a href="lessons/lesson.html?id=${encodeURIComponent(lesson.id)}" class="card">
        <div class="card-header">
          <span class="card-badge">${badge}</span>
          ${isCompleted ? '<span style="font-size: 18px;">✓</span>' : ''}
        </div>
        <h3>${lesson.title}</h3>
        <p class="card-description">${lesson.tags.join(' • ')}</p>
        <div class="card-meta">
          <span>⏱ ${lesson.minutes} min</span>
          <span>${isCompleted ? 'Completed' : 'Start'}</span>
        </div>
      </a>
    `;
  }

  function updateDisplay() {
    const filteredLessons = filterLessons(state.currentSearch, state.currentCategory);
    const grid = document.getElementById('lessons-grid');
    const statusEl = document.getElementById('filter-status');

    if (filteredLessons.length === 0) {
      grid.innerHTML = `
        <div class="no-lessons">
          <p class="no-lessons-title">No lessons found</p>
          <p class="no-lessons-text">Try adjusting your search or category filters.</p>
        </div>
      `;
      statusEl.textContent = state.currentSearch ? `No results for "${state.currentSearch}"` : '';
    } else {
      grid.innerHTML = filteredLessons.map(renderLessonCard).join('');
      const count = filteredLessons.length;
      statusEl.textContent = state.currentSearch ? `Showing ${count} result(s)` : '';
    }
  }

  function setupSearch() {
    const searchInput = document.getElementById('hero-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
      state.currentSearch = e.target.value;
      updateDisplay();
    });

    // Allow Enter key to navigate if single result
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const filtered = filterLessons(state.currentSearch, state.currentCategory);
        if (filtered.length === 1) {
          window.location.href = `lessons/lesson.html?id=${encodeURIComponent(filtered[0].id)}`;
        }
      }
    });
  }

  function setupChips() {
    const chipContainer = document.getElementById('chip-container');
    if (!chipContainer) return;

    const chips = chipContainer.querySelectorAll('.chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.currentCategory = chip.dataset.category || 'all';
        updateDisplay();
      });
    });
  }

  function setupCTA() {
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        window.location.href = 'lessons/';
      });
    }
  }

  function loadCompletedLessons() {
    try {
      const completed = JSON.parse(localStorage.getItem('completedLessons') || '[]');
      state.completedLessons = new Set(completed);
    } catch {
      state.completedLessons = new Set();
    }
  }

  function updateProgressCount() {
    const progressEl = document.getElementById('progress-count');
    if (progressEl) {
      progressEl.textContent = state.completedLessons.size;
    }
  }

  async function loadLessons() {
    const paths = ['./assets/lessons.json', 'assets/lessons.json', '../assets/lessons.json'];
    let lastError = null;

    for (const path of paths) {
      try {
        const res = await fetch(path);
        if (res.ok) {
          const data = await res.json();
          console.log(`[loadLessons] Loaded from ${path}`);
          return data.lessons || [];
        }
        lastError = `${path}: HTTP ${res.status}`;
      } catch (e) {
        lastError = `${path}: ${e.message}`;
      }
    }

    throw new Error(`Failed to load lessons. Last error: ${lastError}`);
  }

  async function init() {
    try {
      // Register service worker
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
      }

      // Load data
      state.allLessons = await loadLessons();
      loadCompletedLessons();
      updateProgressCount();

      // Setup interactive elements
      setupSearch();
      setupChips();
      setupCTA();

      // Initial render
      updateDisplay();
    } catch (err) {
      console.error('[Init Error]', err);
      const grid = document.getElementById('lessons-grid');
      if (grid) {
        grid.innerHTML = `
          <div class="no-lessons">
            <p class="no-lessons-title">Error loading lessons</p>
            <p class="no-lessons-text">Please refresh the page or check your connection.</p>
          </div>
        `;
      }
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Parent phone storage (for parents page)
  if (document.body.getAttribute('data-page') === 'parents') {
    const phoneInput = document.getElementById('parent-phone');
    if (phoneInput) {
      try {
        const saved = localStorage.getItem('parentPhone');
        if (saved) phoneInput.value = saved;
      } catch {}

      phoneInput.addEventListener('change', () => {
        try {
          localStorage.setItem('parentPhone', phoneInput.value || '');
        } catch {}
      });
    }
  }
})();
