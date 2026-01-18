/**
 * CERTIFICATE GENERATOR
 * Generates PDF and PNG certificates with sharing capability
 */

(function() {
  'use strict';

  if (window.TeenDeenCertificate) return;

  class CertificateGenerator {
    constructor() {
      this.jsPDFLoaded = false;
      this.loadJsPDF();
    }

    loadJsPDF() {
      if (typeof window.jspdf !== 'undefined') {
        this.jsPDFLoaded = true;
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = () => {
        this.jsPDFLoaded = true;
        console.log('[Certificate] jsPDF loaded');
      };
      script.onerror = () => {
        console.error('[Certificate] Failed to load jsPDF');
      };
      document.head.appendChild(script);
    }

    checkIfPassed(lessonId, score, total) {
      const passed = score >= Math.ceil(total * 0.7);
      return passed;
    }

    async generatePDF(studentName, lessonTitle, score, total) {
      if (!this.jsPDFLoaded || typeof window.jspdf === 'undefined') {
        throw new Error('jsPDF not loaded');
      }

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setFillColor(255, 247, 236);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      doc.setDrawColor(255, 159, 67);
      doc.setLineWidth(3);
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20, 'S');

      doc.setFontSize(32);
      doc.setTextColor(47, 27, 15);
      doc.text('Teen Deen', pageWidth / 2, 30, { align: 'center' });

      doc.setFontSize(18);
      doc.setTextColor(108, 90, 77);
      doc.text('Certificate of Completion', pageWidth / 2, 45, { align: 'center' });

      doc.setLineWidth(1);
      doc.setDrawColor(255, 159, 67);
      doc.line(60, 50, pageWidth - 60, 50);

      doc.setFontSize(14);
      doc.setTextColor(47, 27, 15);
      doc.text('This certifies that', pageWidth / 2, 70, { align: 'center' });

      doc.setFontSize(24);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(255, 159, 67);
      doc.text(studentName, pageWidth / 2, 85, { align: 'center' });

      doc.setFontSize(14);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(47, 27, 15);
      doc.text('has successfully completed', pageWidth / 2, 100, { align: 'center' });

      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text(lessonTitle, pageWidth / 2, 115, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(108, 90, 77);
      doc.text(`Score: ${score}/${total}`, pageWidth / 2, 130, { align: 'center' });

      const dateStr = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      doc.text(dateStr, pageWidth / 2, 140, { align: 'center' });

      doc.setFontSize(10);
      doc.setTextColor(108, 90, 77);
      doc.text('May Allah accept your efforts and increase you in knowledge', pageWidth / 2, 160, { align: 'center' });

      return doc;
    }

    async downloadPDF(studentName, lessonTitle, lessonId, score, total) {
      try {
        const doc = await this.generatePDF(studentName, lessonTitle, score, total);
        const fileName = `TeenDeen-Certificate-${lessonId}-${studentName.replace(/\s+/g, '-')}.pdf`;
        doc.save(fileName);
        console.log('[Certificate] PDF downloaded:', fileName);
        return true;
      } catch (err) {
        console.error('[Certificate] PDF generation failed:', err);
        return false;
      }
    }

    async sharePDF(studentName, lessonTitle, lessonId, score, total) {
      if (!navigator.canShare) {
        console.warn('[Certificate] Web Share API not supported');
        return this.downloadPDF(studentName, lessonTitle, lessonId, score, total);
      }

      try {
        const doc = await this.generatePDF(studentName, lessonTitle, score, total);
        const pdfBlob = doc.output('blob');
        const fileName = `TeenDeen-Certificate-${lessonId}-${studentName.replace(/\s+/g, '-')}.pdf`;
        const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Teen Deen Certificate',
            text: `${studentName} completed ${lessonTitle}`,
            files: [file]
          });
          console.log('[Certificate] Shared successfully');
          return true;
        } else {
          console.warn('[Certificate] Cannot share files, downloading instead');
          return this.downloadPDF(studentName, lessonTitle, lessonId, score, total);
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('[Certificate] Share cancelled');
          return false;
        }
        console.error('[Certificate] Share failed:', err);
        return this.downloadPDF(studentName, lessonTitle, lessonId, score, total);
      }
    }

    renderCertificatePanel(data) {
      const { lessonId, lessonTitle, score, total, passed } = data;
      if (!passed) return;

      const container = document.getElementById('certificate-container');
      if (!container) return;

      container.innerHTML = `
        <div class="card" style="background: linear-gradient(135deg, #fff7ec 0%, #ffe5c1 100%); border: 2px solid var(--color-primary, #ff9f43); margin: 24px 0;">
          <h3 style="margin: 0 0 12px 0; color: var(--color-primary, #ff9f43); font-size: 1.2em;">🎓 Certificate Available!</h3>
          <p style="margin: 0 0 16px 0; color: var(--color-text-muted, #6c5a4d);">Congratulations on passing! Generate your certificate below.</p>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 4px; font-weight: 600; font-size: 0.9em;">Your Name (for certificate)</label>
            <input type="text" id="cert-student-name" placeholder="Enter your name" style="width: 100%; padding: 12px; border: 2px solid var(--color-border, rgba(0,0,0,0.08)); border-radius: var(--radius-sm, 8px); font-family: inherit; font-size: 1em;" />
          </div>
          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            <button id="cert-download-btn" class="quiz-btn quiz-btn-primary">📄 Download PDF</button>
            <button id="cert-share-btn" class="quiz-btn quiz-btn-secondary">📤 Share Certificate</button>
          </div>
          <div id="cert-status" style="margin-top: 12px; font-size: 0.9em; color: var(--color-text-muted, #6c5a4d);"></div>
        </div>
      `;

      const nameInput = document.getElementById('cert-student-name');
      const savedName = localStorage.getItem('teenDeen.studentName') || '';
      if (savedName) nameInput.value = savedName;

      document.getElementById('cert-download-btn').addEventListener('click', async () => {
        const name = nameInput.value.trim();
        if (!name) {
          document.getElementById('cert-status').textContent = '⚠️ Please enter your name';
          return;
        }
        localStorage.setItem('teenDeen.studentName', name);
        document.getElementById('cert-status').textContent = '⏳ Generating PDF...';
        const success = await this.downloadPDF(name, lessonTitle, lessonId, score, total);
        document.getElementById('cert-status').textContent = success ? '✓ Downloaded!' : '✗ Generation failed';
      });

      document.getElementById('cert-share-btn').addEventListener('click', async () => {
        const name = nameInput.value.trim();
        if (!name) {
          document.getElementById('cert-status').textContent = '⚠️ Please enter your name';
          return;
        }
        localStorage.setItem('teenDeen.studentName', name);
        document.getElementById('cert-status').textContent = '⏳ Preparing to share...';
        const success = await this.sharePDF(name, lessonTitle, lessonId, score, total);
        if (success) {
          document.getElementById('cert-status').textContent = '✓ Shared!';
        }
      });
    }
  }

  window.TeenDeenCertificate = new CertificateGenerator();

})();
