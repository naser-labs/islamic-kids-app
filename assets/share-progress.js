/**
 * Share Progress Functionality
 * Reads quiz results from localStorage and provides share options
 */

(function() {
  'use strict';

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    loadProgress();
    setupEventListeners();
  }

  /**
   * Load progress from localStorage
   */
  function loadProgress() {
    const loadingState = document.getElementById('loading-state');
    const noResultsState = document.getElementById('no-results-state');
    const resultsState = document.getElementById('results-state');
    const resultsList = document.getElementById('results-list');

    // Scan localStorage for quiz results
    const quizResults = getQuizResults();

    // Hide loading
    if (loadingState) {
      loadingState.style.display = 'none';
    }

    if (quizResults.length === 0) {
      // No results found
      if (noResultsState) {
        noResultsState.style.display = 'block';
      }
      return;
    }

    // Show results
    if (resultsState) {
      resultsState.style.display = 'block';
    }

    // Populate results list
    if (resultsList) {
      resultsList.innerHTML = quizResults.map(result => `
        <div style="padding: 16px; margin-bottom: 12px; background: var(--color-bg-warm); border-radius: var(--radius-md); border-left: 4px solid var(--color-accent);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
            <div>
              <h4 style="margin: 0 0 4px 0; font-size: 1.0625rem; color: var(--color-text);">${result.lessonTitle}</h4>
              <p style="margin: 0; font-size: 0.9rem; color: var(--color-text-muted);">${result.date}</p>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 1.5rem; font-weight: 700; color: ${result.percentage >= 80 ? 'var(--color-accent)' : result.percentage >= 60 ? 'var(--color-primary)' : 'var(--color-text-muted)'};">
                ${result.score}/${result.total}
              </div>
              <div style="font-size: 0.85rem; color: var(--color-text-muted);">
                ${result.percentage}%
              </div>
            </div>
          </div>
        </div>
      `).join('');
    }

    // Generate and populate share message
    const shareMessage = generateShareMessage(quizResults);
    const shareMessageTextarea = document.getElementById('share-message');
    if (shareMessageTextarea) {
      shareMessageTextarea.value = shareMessage;
    }

    // Update share links
    updateShareLinks(shareMessage);

    // Show Web Share button if available
    if (navigator.share) {
      const webShareBtn = document.getElementById('share-web-btn');
      if (webShareBtn) {
        webShareBtn.style.display = 'inline-flex';
      }
    }
  }

  /**
   * Get quiz results from localStorage
   */
  function getQuizResults() {
    const results = [];
    const prefix = 'islamicKids.';
    
    // Scan all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix) && key.includes('.quizResult')) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (data && typeof data.score !== 'undefined' && typeof data.total !== 'undefined') {
            // Extract lesson number from key (e.g., "islamicKids.lesson3.quizResult" -> "3")
            const lessonMatch = key.match(/lesson(\d+)/);
            const lessonNumber = lessonMatch ? lessonMatch[1] : '?';
            
            results.push({
              lessonNumber: lessonNumber,
              lessonTitle: `Lesson ${lessonNumber}`,
              score: data.score,
              total: data.total,
              percentage: Math.round((data.score / data.total) * 100),
              timestamp: data.timestamp || Date.now(),
              date: formatDate(data.timestamp || Date.now())
            });
          }
        } catch (e) {
          console.warn('Error parsing quiz result:', key, e);
        }
      }
    }

    // Sort by lesson number
    results.sort((a, b) => {
      const numA = parseInt(a.lessonNumber, 10);
      const numB = parseInt(b.lessonNumber, 10);
      return numA - numB;
    });

    return results;
  }

  /**
   * Generate share message
   */
  function generateShareMessage(results) {
    const siteUrl = window.location.origin + (window.basePath || '/islamic-kids-app');
    
    let message = '📚 Teen Deen Progress Update\n\n';
    
    // Add individual results
    results.forEach(result => {
      message += `${result.lessonTitle}: ${result.score}/${result.total} (${result.percentage}%) - ${result.date}\n`;
    });

    // Add summary
    const totalScore = results.reduce((sum, r) => sum + r.score, 0);
    const totalQuestions = results.reduce((sum, r) => sum + r.total, 0);
    const overallPercentage = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

    message += `\n📊 Overall: ${totalScore}/${totalQuestions} (${overallPercentage}%)\n`;
    message += `✅ Quizzes Completed: ${results.length}\n\n`;
    
    message += `View Teen Deen: ${siteUrl}\n\n`;
    message += 'Keep up the great work! 🌟';

    return message;
  }

  /**
   * Format timestamp to readable date
   */
  function formatDate(timestamp) {
    const date = new Date(timestamp);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  /**
   * Update share links with message
   */
  function updateShareLinks(message) {
    const smsBtn = document.getElementById('sms-btn');
    const emailBtn = document.getElementById('email-btn');

    if (smsBtn) {
      const smsBody = encodeURIComponent(message);
      smsBtn.href = `sms:?&body=${smsBody}`;
    }

    if (emailBtn) {
      const subject = encodeURIComponent('Teen Deen Progress Update');
      const body = encodeURIComponent(message);
      emailBtn.href = `mailto:?subject=${subject}&body=${body}`;
    }
  }

  /**
   * Setup event listeners
   */
  function setupEventListeners() {
    // Web Share API
    const webShareBtn = document.getElementById('share-web-btn');
    if (webShareBtn) {
      webShareBtn.addEventListener('click', handleWebShare);
    }

    // Copy to clipboard
    const copyBtn = document.getElementById('copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', handleCopy);
    }
  }

  /**
   * Handle Web Share API
   */
  async function handleWebShare() {
    const shareMessage = document.getElementById('share-message')?.value;
    
    if (!shareMessage) {
      showFeedback('No message to share', 'error');
      return;
    }

    if (!navigator.share) {
      showFeedback('Web Share not supported', 'error');
      return;
    }

    try {
      await navigator.share({
        title: 'Teen Deen Progress Update',
        text: shareMessage
      });
      showFeedback('Shared successfully! ✓', 'success');
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error);
        showFeedback('Share cancelled or failed', 'error');
      }
    }
  }

  /**
   * Handle copy to clipboard
   */
  async function handleCopy() {
    const shareMessage = document.getElementById('share-message')?.value;
    
    if (!shareMessage) {
      showFeedback('No message to copy', 'error');
      return;
    }

    try {
      // Try modern clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareMessage);
        showFeedback('Copied to clipboard! ✓', 'success');
      } else {
        // Fallback to execCommand
        const textarea = document.getElementById('share-message');
        if (textarea) {
          textarea.select();
          textarea.setSelectionRange(0, 99999); // For mobile
          
          const successful = document.execCommand('copy');
          if (successful) {
            showFeedback('Copied to clipboard! ✓', 'success');
          } else {
            showFeedback('Copy failed - please select and copy manually', 'error');
          }
        }
      }
    } catch (error) {
      console.error('Error copying:', error);
      showFeedback('Copy failed - please try manual copy', 'error');
    }
  }

  /**
   * Show feedback message
   */
  function showFeedback(message, type) {
    const feedbackEl = document.getElementById('feedback-message');
    if (!feedbackEl) return;

    feedbackEl.textContent = message;
    feedbackEl.style.display = 'block';
    feedbackEl.style.background = type === 'success' 
      ? 'var(--color-accent)' 
      : 'var(--color-primary)';
    feedbackEl.style.color = '#ffffff';

    setTimeout(() => {
      feedbackEl.style.display = 'none';
    }, 3000);
  }

})();
