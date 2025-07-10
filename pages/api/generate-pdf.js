// pages/api/generate-pdf.js
import puppeteer from 'puppeteer-core'; // <-- CHANGE: Use puppeteer-core
import chromium from '@sparticuz/chromium'; 

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { name, group, test, score, total, timeTaken, percentage, result, attempted, notAttempted } = req.query;

  if (!name || !group || !test || score === undefined || total === undefined) {
    return res.status(400).json({ message: 'Missing required parameters for PDF generation.' });
  }

  let browser;
  try {
    
    // CHANGE: Configure Puppeteer using @sparticuz/chromium properties
    const browserOptions = {
      args: chromium.args, // Recommended args from @sparticuz/chromium
      defaultViewport: chromium.defaultViewport,
      // CRITICAL: Use the executable path provided by the serverless package
      executablePath: await chromium.executablePath(), 
      headless: chromium.headless, 
      ignoreHTTPSErrors: true,
    };

    // CHANGE: Remove the Vercel-specific if-statement that was pointing to the wrong executablePath.

    browser = await puppeteer.launch(browserOptions);
    const page = await browser.newPage();

    // Set viewport for consistent rendering
    await page.setViewport({ width: 1200, height: 800 });

    // --- Your HTML content remains the same ---
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Quiz Result</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
              * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
              }
              body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                  margin: 0;
                  padding: 20px;
                  color: #333;
                  background-color: #f8fafc;
                  line-height: 1.6;
              }
              .container {
                  max-width: 800px;
                  margin: 0 auto;
                  padding: 40px;
                  border: 2px solid #e2e8f0;
                  border-radius: 16px;
                  background-color: #ffffff;
                  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
              }
              .header {
                  text-align: center;
                  margin-bottom: 30px;
                  padding-bottom: 20px;
                  border-bottom: 3px solid #3b82f6;
              }
              .header h1 {
                  color: #1e293b;
                  font-size: 2.5em;
                  margin-bottom: 10px;
                  font-weight: 700;
              }
              .header .subtitle {
                  color: #64748b;
                  font-size: 1.1em;
              }
              .info-section {
                  margin-bottom: 30px;
                  padding: 20px;
                  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
                  border-radius: 12px;
                  border-left: 5px solid #3b82f6;
              }
              .info-row {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 12px;
                  padding: 8px 0;
              }
              .info-row:last-child {
                  margin-bottom: 0;
              }
              .info-label {
                  font-weight: 600;
                  color: #374151;
                  flex: 1;
              }
              .info-value {
                  font-weight: 500;
                  color: #1f2937;
                  flex: 1;
                  text-align: right;
              }
              .stats-grid {
                  display: grid;
                  grid-template-columns: repeat(2, 1fr);
                  gap: 20px;
                  margin-bottom: 30px;
              }
              .stat-card {
                  text-align: center;
                  padding: 25px;
                  border-radius: 12px;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                  border: 1px solid #e5e7eb;
              }
              .stat-value {
                  font-size: 2.5em;
                  font-weight: 700;
                  margin-bottom: 8px;
                  line-height: 1;
              }
              .stat-label {
                  font-size: 0.95em;
                  color: #6b7280;
                  font-weight: 500;
              }
              .score-card { background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); }
              .score-value { color: #1d4ed8; }
              .percentage-card { background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); }
              .percentage-value { color: #065f46; }
              .attempted-card { background: linear-gradient(135deg, #fae8ff 0%, #e879f9 100%); }
              .attempted-value { color: #7c2d12; }
              .missed-card { background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%); }
              .missed-value { color: #9a3412; }
              .result-section {
                  text-align: center;
                  margin: 40px 0;
                  padding: 30px;
                  border-radius: 16px;
                  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
              }
              .result-pass {
                  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                  color: white;
              }
              .result-fail {
                  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                  color: white;
              }
              .result-text {
                  font-size: 3em;
                  font-weight: 700;
                  margin-bottom: 10px;
                  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
              }
              .result-message {
                  font-size: 1.2em;
                  opacity: 0.9;
              }
              .footer {
                  text-align: center;
                  margin-top: 40px;
                  padding-top: 20px;
                  border-top: 2px dashed #d1d5db;
                  color: #6b7280;
                  font-size: 0.9em;
              }
              .timestamp {
                  font-weight: 500;
                  color: #4b5563;
              }
              @media print {
                  body { background-color: white; }
                  .container { box-shadow: none; }
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>📊 Quiz Results Certificate</h1>
                  <div class="subtitle">Official Test Performance Report</div>
              </div>

              <div class="info-section">
                  <div class="info-row">
                      <div class="info-label">👤 Candidate Name:</div>
                      <div class="info-value">${decodeURIComponent(name)}</div>
                  </div>
                  <div class="info-row">
                      <div class="info-label">📚 Test Category:</div>
                      <div class="info-value">${decodeURIComponent(group)}</div>
                  </div>
                  <div class="info-row">
                      <div class="info-label">📝 Test Name:</div>
                      <div class="info-value">${decodeURIComponent(test)}</div>
                  </div>
                  <div class="info-row">
                      <div class="info-label">⏱️ Time Taken:</div>
                      <div class="info-value">${timeTaken}</div>
                  </div>
                  <div class="info-row">
                      <div class="info-label">📊 Total Questions:</div>
                      <div class="info-value">${total}</div>
                  </div>
              </div>

              <div class="stats-grid">
                  <div class="stat-card score-card">
                      <div class="stat-value score-value">${score}</div>
                      <div class="stat-label">Correct Answers</div>
                  </div>
                  <div class="stat-card percentage-card">
                      <div class="stat-value percentage-value">${percentage}%</div>
                      <div class="stat-label">Score Percentage</div>
                  </div>
                  <div class="stat-card attempted-card">
                      <div class="stat-value attempted-value">${attempted}</div>
                      <div class="stat-label">Questions Attempted</div>
                  </div>
                  <div class="stat-card missed-card">
                      <div class="stat-value missed-value">${notAttempted}</div>
                      <div class="stat-label">Questions Missed</div>
                  </div>
              </div>

              <div class="result-section ${result === 'PASS' ? 'result-pass' : 'result-fail'}">
                  <div class="result-text">
                      ${result === 'PASS' ? '✅ PASSED' : '❌ FAILED'}
                  </div>
                  <div class="result-message">
                      ${result === 'PASS' ? 'Congratulations! You have successfully passed the test.' : 'Unfortunately, you did not meet the passing criteria.'}
                  </div>
              </div>

              <div class="footer">
                  <div class="timestamp">
                      Generated on: ${new Date().toLocaleDateString('en-IN', { 
                          timeZone: 'Asia/Kolkata',
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                      })} at ${new Date().toLocaleTimeString('en-IN', { 
                          timeZone: 'Asia/Kolkata',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                      })}
                  </div>
                  <div style="margin-top: 10px; font-size: 0.8em; color: #9ca3af;">
                      This is a computer-generated certificate. No signature required.
                  </div>
              </div>
          </div>
      </body>
      </html>
    `;

    await page.setContent(htmlContent, {
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 30000
    });

    // Wait a bit more for fonts to load
    await page.waitForTimeout(1000);

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm',
      },
      preferCSSPageSize: true,
      displayHeaderFooter: false,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${decodeURIComponent(name)}_${decodeURIComponent(group)}_${decodeURIComponent(test)}_Result.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ 
      message: 'Failed to generate PDF', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
  }
}