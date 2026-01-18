/**
 * CERTIFICATE GENERATOR - PREMIUM EDITION
 * Generates beautiful HTML certificates with PNG export, print, and sharing
 */

(function() {
  'use strict';

  if (window.TeenDeenCertificate) return;

  class CertificateGenerator {
    constructor() {
      this.html2CanvasLoaded = false;
      this.loadHtml2Canvas();
    }

    loadHtml2Canvas() {
      if (typeof window.html2canvas !== 'undefined') {
        this.html2CanvasLoaded = true;
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      script.onload = () => {
        this.html2CanvasLoaded = true;
        console.log('[Certificate] html2canvas loaded');
      };
      script.onerror = () => {
        console.warn('[Certificate] html2canvas not available, PNG export disabled');
      };
      document.head.appendChild(script);
    }

    generateCertificateId() {
      const year = new Date().getFullYear();
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      return `TD-${year}-${random}`;
    }

    getBadgeTier(score, total) {
      const percentage = (score / total) * 100;
      if (percentage >= 90) return { tier: 'gold', label: 'Gold', color: '#FFD700', range: '90-100%' };
      if (percentage >= 75) return { tier: 'silver', label: 'Silver', color: '#C0C0C0', range: '75-89%' };
      if (percentage >= 60) return { tier: 'bronze', label: 'Bronze', color: '#CD7F32', range: '60-74%' };
      return null;
    }

    async generatePDF(studentName, lessonTitle, lessonTopic, score, total) {
      // Generate HTML certificate
      const badge = this.getBadgeTier(score, total);
      const certId = this.generateCertificateId();
      const completionDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const certificateHTML = `
        <div style="
          width: 1600px;
          height: 1200px;
          background: linear-gradient(135deg, #fff7ec 0%, #ffe5c1 100%);
          padding: 80px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          position: relative;
          box-sizing: border-box;
          overflow: hidden;
        ">
          <!-- Watermark background -->
          <div style="
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: radial-gradient(circle at 20% 50%, rgba(255, 159, 67, 0.03) 0%, transparent 50%),
                              radial-gradient(circle at 80% 80%, rgba(209, 250, 229, 0.03) 0%, transparent 50%);
            pointer-events: none;
          "></div>

          <!-- Decorative border -->
          <div style="
            position: absolute;
            top: 40px;
            left: 40px;
            right: 40px;
            bottom: 40px;
            border: 6px solid #ff9f43;
            border-radius: 20px;
            box-shadow: inset 0 0 40px rgba(255, 159, 67, 0.1);
          "></div>

          <div style="
            position: relative;
            z-index: 1;
            display: flex;
            flex-direction: column;
            height: 100%;
            justify-content: space-between;
            text-align: center;
          ">
            <!-- Header Banner -->
            <div style="
              background: linear-gradient(90deg, #ff9f43 0%, #ffd166 50%, #ff9f43 100%);
              padding: 40px 30px;
              border-radius: 12px;
              margin-bottom: 40px;
              box-shadow: 0 6px 20px rgba(255, 159, 67, 0.2);
            ">
              <div style="font-size: 48px; font-weight: 900; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.2); margin-bottom: 10px;">
                🌟 Teen Deen 🌟
              </div>
              <div style="font-size: 28px; color: white; font-weight: 600; opacity: 0.95;">
                Certificate of Completion
              </div>
            </div>

            <!-- Ribbon Banner -->
            <div style="
              background: linear-gradient(90deg, #FF6B35, #FF9F43, #FFD166);
              padding: 12px 40px;
              border-radius: 30px;
              color: white;
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 30px;
              box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
              display: inline-block;
              margin-left: auto;
              margin-right: auto;
            ">
              ✓ Lesson Complete
            </div>

            <!-- Main Content -->
            <div style="margin-bottom: 40px;">
              <div style="
                font-size: 20px;
                color: #6c5a4d;
                margin-bottom: 20px;
                font-weight: 500;
              ">
                This certifies that
              </div>

              <div style="
                font-size: 56px;
                font-weight: 900;
                color: #FF6B35;
                margin-bottom: 30px;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
              ">
                ${studentName}
              </div>

              <div style="
                font-size: 18px;
                color: #6c5a4d;
                margin-bottom: 25px;
              ">
                has successfully completed and demonstrated mastery in
              </div>

              <div style="
                font-size: 40px;
                font-weight: 800;
                color: #2f1b0f;
                margin-bottom: 15px;
              ">
                ${lessonTitle}
              </div>

              ${lessonTopic ? `
                <div style="
                  font-size: 18px;
                  color: #ff9f43;
                  font-weight: 600;
                  margin-bottom: 20px;
                ">
                  Topic: ${lessonTopic}
                </div>
              ` : ''}

              <div style="
                display: flex;
                justify-content: center;
                gap: 60px;
                margin: 35px 0;
                flex-wrap: wrap;
              ">
                <div>
                  <div style="font-size: 14px; color: #6c5a4d; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">Score</div>
                  <div style="font-size: 32px; font-weight: 900; color: #FF6B35;">${score}/${total}</div>
                </div>
                <div>
                  <div style="font-size: 14px; color: #6c5a4d; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">Date</div>
                  <div style="font-size: 20px; font-weight: 700; color: #2f1b0f;">${completionDate}</div>
                </div>
                <div>
                  <div style="font-size: 14px; color: #6c5a4d; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">Certificate ID</div>
                  <div style="font-size: 18px; font-weight: 700; color: #FF9F43; font-family: monospace;">${certId}</div>
                </div>
              </div>
            </div>

            <!-- Badge Tier Display -->
            ${badge ? `
              <div style="
                display: inline-block;
                margin-bottom: 40px;
                text-align: center;
              ">
                <div style="
                  width: 200px;
                  height: 200px;
                  margin: 0 auto 20px;
                  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.5), transparent),
                              linear-gradient(135deg, ${badge.color}20, ${badge.color}05);
                  border: 6px solid ${badge.color};
                  border-radius: 50%;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
                ">
                  <div style="font-size: 60px; margin-bottom: 10px;">⭐</div>
                  <div style="font-size: 28px; font-weight: 900; color: ${badge.color};">${badge.label}</div>
                  <div style="font-size: 14px; color: ${badge.color}; font-weight: 600; margin-top: 8px;">${badge.range}</div>
                </div>
              </div>
            ` : ''}

            <!-- Footer -->
            <div style="
              border-top: 3px solid #ff9f43;
              padding-top: 30px;
            ">
              <div style="
                font-size: 14px;
                color: #6c5a4d;
                margin-bottom: 15px;
                font-style: italic;
              ">
                May Allah accept your efforts and increase you in knowledge
              </div>
              <div style="
                display: flex;
                justify-content: space-around;
                margin-top: 25px;
                font-size: 12px;
                color: #6c5a4d;
              ">
                <div>
                  <div style="height: 2px; width: 150px; background: #ff9f43; margin-bottom: 8px;"></div>
                  <div style="font-weight: 600;">Teen Deen</div>
                </div>
                <div>
                  <div style="height: 2px; width: 150px; background: #ff9f43; margin-bottom: 8px;"></div>
                  <div style="font-weight: 600;">Learner</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      return certificateHTML;
    }

    async downloadPNG(studentName, lessonTitle, lessonTopic, lessonId, score, total) {
      try {
        if (!this.html2CanvasLoaded || typeof window.html2canvas === 'undefined') {
          throw new Error('html2canvas not available');
        }

        const certificateHTML = await this.generatePDF(studentName, lessonTitle, lessonTopic, score, total);
        
        // Create temporary container
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'fixed';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '-9999px';
        tempContainer.innerHTML = certificateHTML;
        document.body.appendChild(tempContainer);

        // Convert to canvas
        const canvas = await window.html2canvas(tempContainer, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#fff7ec'
        });

        // Convert to blob and download
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `TeenDeen-Certificate-${lessonId}-${studentName.replace(/\s+/g, '-')}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          document.body.removeChild(tempContainer);
          console.log('[Certificate] PNG downloaded');
        });

        return true;
      } catch (err) {
        console.error('[Certificate] PNG generation failed:', err);
        return false;
      }
    }

    checkIfPassed(lessonId, score, total) {
      const passed = score >= Math.ceil(total * 0.7);
      return passed;
    }

    async renderCertificatePanel(data) {
      const { lessonId, lessonTitle, lessonTopic, score, total, passed } = data;
      if (!passed) return;

      const container = document.getElementById('certificate-container');
      if (!container) return;

      const badge = this.getBadgeTier(score, total);

      container.innerHTML = `
        <div class="card" style="
          background: linear-gradient(135deg, #fff7ec 0%, #ffe5c1 100%);
          border: 3px solid #ff9f43;
          margin: 24px 0;
          box-shadow: 0 8px 24px rgba(255, 159, 67, 0.15);
        ">
          <div style="text-align: center; margin-bottom: 20px;">
            <h3 style="
              margin: 0 0 12px 0;
              color: #FF6B35;
              font-size: 1.5em;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 12px;
            ">
              🎓 Certificate Ready!
            </h3>
            <p style="margin: 0; color: #6c5a4d; font-size: 1.05em;">
              <strong>Congratulations!</strong> You've earned a certificate of completion.
            </p>
          </div>

          ${badge ? `
            <div style="
              text-align: center;
              background: rgba(255, 159, 67, 0.08);
              padding: 16px;
              border-radius: 12px;
              margin-bottom: 20px;
            ">
              <div style="font-size: 32px; margin-bottom: 8px;">⭐</div>
              <div style="font-weight: 700; color: #FF6B35; font-size: 1.1em;">
                ${badge.label} Badge (${badge.range})
              </div>
            </div>
          ` : ''}

          <div style="margin-bottom: 20px;">
            <label style="
              display: block;
              margin-bottom: 8px;
              font-weight: 600;
              font-size: 0.95em;
              color: #2f1b0f;
            ">Your Name (for certificate):</label>
            <input type="text" id="cert-student-name" placeholder="Enter your full name" style="
              width: 100%;
              padding: 14px;
              border: 2px solid #ff9f43;
              border-radius: 8px;
              font-family: inherit;
              font-size: 1em;
              box-sizing: border-box;
              background: white;
            " />
          </div>

          <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 16px;">
            <button id="cert-preview-btn" class="quiz-btn quiz-btn-secondary" style="flex: 1; min-width: 140px;">
              👁️ Preview
            </button>
            <button id="cert-print-btn" class="quiz-btn quiz-btn-secondary" style="flex: 1; min-width: 140px;">
              🖨️ Print
            </button>
            <button id="cert-download-png-btn" class="quiz-btn quiz-btn-secondary" style="flex: 1; min-width: 140px;">
              🖼️ PNG
            </button>
            <button id="cert-share-btn" class="quiz-btn quiz-btn-primary" style="flex: 1; min-width: 140px;">
              📤 Share
            </button>
          </div>

          <div id="cert-status" style="
            margin-top: 12px;
            font-size: 0.95em;
            color: #6c5a4d;
            text-align: center;
            min-height: 24px;
          "></div>
        </div>

        <!-- Hidden preview container -->
        <div id="certificate-preview-container" style="display: none; margin: 20px 0;"></div>
      `;

      const nameInput = document.getElementById('cert-student-name');
      const savedName = localStorage.getItem('teenDeen.studentName') || '';
      if (savedName) nameInput.value = savedName;

      const statusDiv = document.getElementById('cert-status');
      const previewContainer = document.getElementById('certificate-preview-container');

      // Preview button
      document.getElementById('cert-preview-btn').addEventListener('click', async () => {
        const name = nameInput.value.trim();
        if (!name) {
          statusDiv.textContent = '⚠️ Please enter your name first';
          statusDiv.style.color = '#ef476f';
          return;
        }

        if (previewContainer.style.display === 'block') {
          previewContainer.style.display = 'none';
          statusDiv.textContent = '';
        } else {
          const certHTML = await this.generatePDF(name, lessonTitle, lessonTopic, score, total);
          previewContainer.innerHTML = certHTML;
          previewContainer.style.display = 'block';
          previewContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
          statusDiv.textContent = '✓ Preview loaded';
          statusDiv.style.color = '#06d6a0';
        }
      });

      // Print button
      document.getElementById('cert-print-btn').addEventListener('click', async () => {
        const name = nameInput.value.trim();
        if (!name) {
          statusDiv.textContent = '⚠️ Please enter your name first';
          statusDiv.style.color = '#ef476f';
          return;
        }

        const certHTML = await this.generatePDF(name, lessonTitle, lessonTopic, score, total);
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                @media print {
                  body { margin: 0; padding: 0; }
                  * { box-sizing: border-box; }
                }
              </style>
            </head>
            <body>
              ${certHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 500);
        statusDiv.textContent = '✓ Print preview opened';
        statusDiv.style.color = '#06d6a0';
      });

      // Download PNG button
      document.getElementById('cert-download-png-btn').addEventListener('click', async () => {
        const name = nameInput.value.trim();
        if (!name) {
          statusDiv.textContent = '⚠️ Please enter your name first';
          statusDiv.style.color = '#ef476f';
          return;
        }

        localStorage.setItem('teenDeen.studentName', name);
        statusDiv.textContent = '⏳ Generating PNG...';
        statusDiv.style.color = '#ff9f43';
        const success = await this.downloadPNG(name, lessonTitle, lessonTopic, lessonId, score, total);
        if (success) {
          statusDiv.textContent = '✓ PNG downloaded!';
          statusDiv.style.color = '#06d6a0';
        } else {
          statusDiv.textContent = '⚠️ PNG export unavailable, try Print option';
          statusDiv.style.color = '#ef476f';
        }
      });

      // Share button
      document.getElementById('cert-share-btn').addEventListener('click', async () => {
        const name = nameInput.value.trim();
        if (!name) {
          statusDiv.textContent = '⚠️ Please enter your name first';
          statusDiv.style.color = '#ef476f';
          return;
        }

        localStorage.setItem('teenDeen.studentName', name);

        if (!navigator.canShare) {
          statusDiv.textContent = '⚠️ Sharing not supported on this device';
          statusDiv.style.color = '#ef476f';
          return;
        }

        try {
          statusDiv.textContent = '⏳ Preparing to share...';
          statusDiv.style.color = '#ff9f43';

          const certHTML = await this.generatePDF(name, lessonTitle, lessonTopic, score, total);
          
          // Create temporary container and convert to PNG
          if (this.html2CanvasLoaded && typeof window.html2canvas !== 'undefined') {
            const tempContainer = document.createElement('div');
            tempContainer.style.position = 'fixed';
            tempContainer.style.left = '-9999px';
            tempContainer.innerHTML = certHTML;
            document.body.appendChild(tempContainer);

            const canvas = await window.html2canvas(tempContainer, {
              scale: 2,
              useCORS: true,
              logging: false
            });

            canvas.toBlob(async (blob) => {
              const file = new File([blob], `TeenDeen-${lessonId}-${name}.png`, { type: 'image/png' });

              if (navigator.canShare({ files: [file] })) {
                await navigator.share({
                  title: 'Teen Deen Certificate',
                  text: `I just completed "${lessonTitle}" on Teen Deen! Check out my certificate.`,
                  files: [file]
                });
                statusDiv.textContent = '✓ Shared!';
                statusDiv.style.color = '#06d6a0';
              } else {
                statusDiv.textContent = '⚠️ Sharing not available';
                statusDiv.style.color = '#ef476f';
              }
              document.body.removeChild(tempContainer);
            });
          } else {
            statusDiv.textContent = '⚠️ Try Print or Download PNG option';
            statusDiv.style.color = '#ef476f';
          }
        } catch (err) {
          if (err.name === 'AbortError') {
            statusDiv.textContent = '';
          } else {
            console.error('[Certificate] Share failed:', err);
            statusDiv.textContent = '⚠️ Share failed';
            statusDiv.style.color = '#ef476f';
          }
        }
      });
    }
  }

  window.TeenDeenCertificate = new CertificateGenerator();

})();