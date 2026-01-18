/**
 * APP.JS - Enhanced lesson loading with progress tracking and interactive features
 * 
 * IMPORTANT: Quiz rendering is handled by assets/quiz.js (TeenDeenQuiz)
 */

(function(){
  'use strict';

  if (window.__teenDeenAppInit) return;
  window.__teenDeenAppInit = true;

  const page = document.body.getAttribute('data-page');
  
  const state = {
    lessons: [],
    lastLessonId: null,
    currentLesson: null
  };

  const readLastLesson = () => {
    try { return localStorage.getItem('lastLessonId'); } catch { return null; }
  };
  
  const writeLastLesson = (id) => { 
    try { localStorage.setItem('lastLessonId', id); } catch {} 
  };

  async function loadLessons() {
    let manifestUrl;
    if (window.withBase && typeof window.withBase === 'function') {
      manifestUrl = window.withBase('data/lessons.json');
    } else {
      const base = window.BASE_PATH || '/islamic-kids-app';
      manifestUrl = `${base}/data/lessons.json`;
    }
    
    try {
      console.log('[loadLessons] Fetching from:', manifestUrl);
      const res = await fetch(manifestUrl, { cache: 'no-store' });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log('[loadLessons] Loaded', (data.lessons || []).length, 'lessons');
      
      if (window.updateDebugInfo) {
        window.updateDebugInfo({ lessonsCount: (data.lessons || []).length });
      }
      
      return data.lessons || [];
      
    } catch (error) {
      console.error('[loadLessons] Error:', error);
      
      if (window.updateDebugInfo) {
        window.updateDebugInfo({ 
          lastError: `${error.message}\n\nAttempted URL: ${manifestUrl}\nBase path: ${window.BASE_PATH || '(none)'}` 
        });
      }
      
      throw new Error(`Failed to load lessons from ${manifestUrl}: ${error.message}`);
    }
  }

  function findLessonById(id){
    return state.lessons.find(l => l.id === id);
  }

  function getQuery(){
    const params = new URLSearchParams(location.search);
    return {
      id: params.get('id') || undefined,
      q: params.get('q') || ''
    };
  }

  function renderLesson(){
    const { id } = getQuery();
    console.log('[renderLesson] Attempting to load lesson id:', id);
    
    if(!id){
      document.getElementById('lesson-title').textContent = 'Lesson not found';
      document.getElementById('lesson-body').innerHTML = 'Missing lesson id. <a href="./" class="cta-btn" style="margin-top:12px; display:inline-block;">Back to lessons</a>';
      return;
    }
    
    const lesson = findLessonById(id);
    if(!lesson){
      console.error('[renderLesson] Lesson not found in manifest:', id);
      document.getElementById('lesson-title').textContent = 'Lesson not found';
      document.getElementById('lesson-body').innerHTML = 'This lesson doesn\'t exist or hasn\'t loaded yet. <a href="./" class="cta-btn" style="margin-top:12px; display:inline-block;">Back to lessons</a>';
      return;
    }
    
    state.currentLesson = lesson;
    console.log('[renderLesson] Rendering lesson:', lesson.title);
    
    writeLastLesson(id);
    document.getElementById('lesson-title').textContent = `${lesson.number}. ${lesson.title}`;
    document.getElementById('lesson-meta').textContent = `${lesson.minutes} min • ${lesson.tags.join(', ')}`;
    
    // Build content URL with fallback
    let contentUrl;
    if (window.withBase && typeof window.withBase === 'function') {
      contentUrl = window.withBase(`lessons/content/${lesson.id}.html`);
    } else {
      const base = window.BASE_PATH || '/islamic-kids-app';
      contentUrl = `${base}/lessons/content/${lesson.id}.html`;
    }
    
    console.log('[renderLesson] Content URL:', contentUrl);
    
    if (window.updateDebugInfo) {
      window.updateDebugInfo({ lessonId: id, contentUrl });
    }
    
    // Load lesson content
    (async () => {
      try {
        const res = await fetch(contentUrl, { cache: 'no-store' });
        if (res.ok) {
          const html = await res.text();
          document.getElementById('lesson-body').innerHTML = html;
          
          // Initialize TTS after content loads
          if (window.TeenDeenTTS) {
            setTimeout(() => {
              const initialized = window.TeenDeenTTS.initialize('.lesson-content');
              if (initialized && document.getElementById('tts-container')) {
                window.TeenDeenTTS.renderControls('#tts-container');
              }
            }, 500);
          }
        } else {
          console.warn('[Content] Could not load:', contentUrl, res.status);
          document.getElementById('lesson-body').textContent = `This is a brief, friendly overview to introduce: ${lesson.title}.`;
        }
      } catch (err) {
        console.warn('[Content] Load error:', err);
        document.getElementById('lesson-body').textContent = `This is a brief, friendly overview to introduce: ${lesson.title}.`;
      }
    })();

    const tagsEl = document.getElementById('lesson-tags');
    if (tagsEl) {
      tagsEl.innerHTML = (lesson.tags||[]).map(t => `<span class=\"chip\">${t}</span>`).join('');
    }

    // Delegate to shared quiz module
    setTimeout(() => {
      if (window.TeenDeenQuiz && typeof window.TeenDeenQuiz.initialize === 'function') {
        console.log('[Quiz] Initializing quiz for lesson:', lesson.id);
        window.TeenDeenQuiz.initialize(lesson);
      } else {
        console.warn('[Quiz] TeenDeenQuiz not available; no quiz will be rendered.');
      }
    }, 250);

    // Setup key takeaways
    const pointsEl = document.getElementById('lesson-points');
    if (pointsEl) {
      if (lesson.id === 'lesson-01') {
        pointsEl.innerHTML = `
          <li>Actions are judged by intentions.</li>
          <li>Allah looks at your heart (intention) before your actions.</li>
          <li>Riya' (showing off) can destroy deeds—keep your worship sincere.</li>
          <li>Pause and ask: "Who am I really doing this for?"</li>`;
      } else {
        pointsEl.innerHTML = `
          <li>Read carefully and think critically</li>
          <li>Connect ideas to your daily life</li>
          <li>Discuss what you learned with someone you trust</li>`;
      }
    }
  }

  function init(){
    // Register service worker
    if('serviceWorker' in navigator){
      const swUrl = window.withBase ? window.withBase('sw.js') : 'sw.js';
      navigator.serviceWorker.register(swUrl).catch((err) => {
        console.warn('[SW] Registration failed:', err);
      });
    }
    
    state.lastLessonId = readLastLesson();
    
    loadLessons().then(ls => {
      state.lessons = ls;
      console.log('[init] Lessons loaded:', state.lessons.length);
      
      if(page === 'lesson'){
        try {
          renderLesson();
        } catch (err) {
          console.error('[renderLesson] Error:', err);
          const lessonTitle = document.getElementById('lesson-title');
          const lessonBody = document.getElementById('lesson-body');
          if (lessonTitle) lessonTitle.textContent = 'Error rendering lesson';
          if (lessonBody) lessonBody.innerHTML = `<p>An error occurred while loading the lesson.</p><p><strong>${err.message}</strong></p><a href=\"./\" class=\"cta-btn\" style=\"display: inline-block; margin-top: 12px;\">Back to Lessons</a>`;
        }
      }
      
      // Update progress count on home/parents page
      if(page === 'home' || page === 'parents'){
        if (window.TeenDeenProgress) {
          const stats = window.TeenDeenProgress.getStats();
          const progressCount = document.getElementById('progress-count');
          if (progressCount) {
            progressCount.textContent = stats.completedCount;
          }
        }
        
        const input = document.getElementById('parent-phone');
        if(input){
          try {
            const prev = localStorage.getItem('parentPhone');
            if(prev) input.value = prev;
          } catch {}
          input.addEventListener('change', ()=>{
            const val = input.value.trim();
            try { localStorage.setItem('parentPhone', val || ''); } catch {}
          });
        }
      }
      
    }).catch(err => {
      console.error('[loadLessons error]', err);
      const offline = !navigator.onLine;
      
      if (offline) {
        console.warn('[init] Device is offline. Service worker may still provide cached content.');
      }
      
      if (page !== 'lesson') {
        const errorMsg = err.message || 'Unknown error';
        console.error(`Could not load lessons: ${errorMsg}`);
        const grid = document.getElementById('lessons-grid');
        if (grid) {
          grid.innerHTML = `
            <div class=\"no-lessons\">
              <p class=\"no-lessons-title\">⚠️ ${offline ? 'Offline' : 'Error Loading Lessons'}</p>
              <p class=\"no-lessons-text\">${offline ? 
                'You\'re offline. Reconnect to load lessons.' : 
                'Unable to load lessons. Please check your connection and try again.'
              }</p>
              <button class=\"btn-inline\" id=\"retry-lessons\" style=\"margin-top: 12px;\">🔄 Retry</button>
            </div>
          `;
          const retryBtn = document.getElementById('retry-lessons');
          if (retryBtn) retryBtn.addEventListener('click', () => location.reload());
        }
      }
    });
  }

  // Start the app when DOM is ready
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
