// pages/api/generate-pdf.js
import puppeteer from 'puppeteer';

export default async function handler(req, res) {
  // Ensure only GET requests are allowed
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Extract data from query parameters
  const { name, group, test, score, total, timeTaken, percentage, result, attempted, notAttempted } = req.query;

  // Basic validation (optional, but good practice)
  if (!name || !group || !test || score === undefined || total === undefined) {
    return res.status(400).json({ message: 'Missing required parameters for PDF generation.' });
  }

  let browser; // Declare browser outside try-catch to ensure it's accessible in finally
  try {
    // Launch a headless browser instance
    // Important: For Vercel or similar serverless environments, you might need
    // to configure Puppeteer differently or use a dedicated buildpack.
    // The `args` are crucial for these environments.
    browser = await puppeteer.launch({
      headless: true, // Use 'new' for Puppeteer v22+ if you want the latest headless mode
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Essential for most production/serverless environments
    });
    const page = await browser.newPage();

    // Construct the HTML content for the PDF.
    // This HTML should mirror the design you want in your PDF,
    // including any Tailwind CSS classes (though some advanced Tailwind features
    // might require a more sophisticated setup or direct CSS).
    // For simplicity, I'm using inline styles or basic class names here.
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Quiz Result</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
              body {
                  font-family: 'Arial', sans-serif;
                  margin: 0;
                  padding: 20px;
                  color: #333;
                  background-color: #f0f4f8; /* Light gray background for the page */
              }
              .container {
                  max-width: 800px;
                  margin: 20px auto;
                  padding: 30px;
                  border: 1px solid #ddd;
                  border-radius: 12px;
                  background-color: #ffffff; /* White background for the card */
                  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
              }
              h1 {
                  color: #1a202c; /* Darker text for headings */
                  text-align: center;
                  font-size: 2.2em; /* Larger heading */
                  margin-bottom: 20px;
                  border-bottom: 2px solid #edf2f7; /* Subtle separator */
                  padding-bottom: 10px;
              }
              .info-section {
                  margin-bottom: 25px;
                  padding: 15px;
                  background-color: #e2e8f0; /* Light background for info */
                  border-radius: 8px;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  flex-wrap: wrap; /* Allow wrapping on smaller screens */
              }
              .info-section p {
                  margin: 5px 0;
                  font-size: 1.1em;
                  flex: 1 1 45%; /* Flex for two columns */
              }
              .info-section strong {
                  color: #2d3748; /* Darker bold text */
              }
              .stats-grid {
                  display: grid;
                  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); /* Responsive grid */
                  gap: 20px;
                  margin-bottom: 30px;
              }
              .stat-item {
                  text-align: center;
                  padding: 20px;
                  border-radius: 10px;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
              }
              .stat-value {
                  font-size: 2em;
                  font-weight: bold;
                  margin-bottom: 5px;
              }
              .stat-label {
                  font-size: 0.9em;
                  color: #666;
              }
              .bg-blue-50 { background-color: #ebf8ff; } /* Equivalent Tailwind */
              .text-blue-600 { color: #3182ce; }
              .bg-green-50 { background-color: #f0fff4; }
              .text-green-600 { color: #38a169; }
              .bg-purple-50 { background-color: #faf5ff; }
              .text-purple-600 { color: #805ad5; }
              .bg-orange-50 { background-color: #fffaf0; }
              .text-orange-600 { color: #dd6b20; }

              .final-result {
                  text-align: center;
                  margin-top: 30px;
                  padding: 20px;
                  border-radius: 10px;
                  font-size: 2.5em;
                  font-weight: bold;
                  color: #ffffff; /* White text for result */
              }
              .pass { background-color: #38a169; } /* Green for pass */
              .fail { background-color: #e53e3e; } /* Red for fail */

              .footer {
                  text-align: center;
                  margin-top: 40px;
                  font-size: 0.85em;
                  color: #718096; /* Grayish text */
                  padding-top: 15px;
                  border-top: 1px dashed #e2e8f0;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>📊 Quiz Results</h1>

              <div class="info-section">
                  <p><strong>Candidate:</strong> ${decodeURIComponent(name)}</p>
                  <p><strong>Test:</strong> ${decodeURIComponent(group)} - ${decodeURIComponent(test)}</p>
                  <p><strong>Total Questions:</strong> ${total}</p>
                  <p><strong>Time Taken:</strong> ${timeTaken}</p>
              </div>

              <div class="stats-grid">
                  <div class="stat-item bg-blue-50">
                      <div class="stat-value text-blue-600">${score}</div>
                      <div class="stat-label">Correct Answers</div>
                  </div>

                  <div class="stat-item bg-green-50">
                      <div class="stat-value text-green-600">${percentage}%</div>
                      <div class="stat-label">Percentage</div>
                  </div>

                  <div class="stat-item bg-purple-50">
                      <div class="stat-value text-purple-600">${attempted}</div>
                      <div class="stat-label">Attempted</div>
                  </div>

                  <div class="stat-item bg-orange-50">
                      <div class="stat-value text-orange-600">${notAttempted}</div>
                      <div class="stat-label">Not Attempted</div>
                  </div>
              </div>

              <div class="final-result ${result === 'PASS' ? 'pass' : 'fail'}">
                  ${result === 'PASS' ? '✅ PASS' : '❌ FAIL'}
              </div>

              <div class="footer">
                  Generated by Quiz App on: ${new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })} at ${new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}
              </div>
          </div>
      </body>
      </html>
    `;

    // Set the HTML content of the page
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0', // Wait for the page to load completely (including fonts, images)
    });

    // Generate the PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true, // Essential to print background colors and images
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
      // You can add more options like headerTemplate, footerTemplate if needed
    });

    // Set the headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${decodeURIComponent(name)}_${decodeURIComponent(group)}_${decodeURIComponent(test)}_Result.pdf"`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('PDF generation error:', error);
    // Send an error response to the client
    res.status(500).json({ message: 'Failed to generate PDF', error: error.message });
  } finally {
    // Ensure the browser is closed even if an error occurs
    if (browser) {
      await browser.close();
    }
  }
}