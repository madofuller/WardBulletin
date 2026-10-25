import { writeFile, readFile } from 'fs/promises';
import { basename, relative } from 'path';

export interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  details?: any;
  pngPath?: string;
}

export interface TestSuite {
  fixture: string;
  browser: string;
  pageSize: string;
  results: TestResult[];
}

export async function generateReport(
  testSuites: TestSuite[],
  reportPath: string,
  screenshotsDir: string
): Promise<void> {
  const reportDir = reportPath.substring(0, reportPath.lastIndexOf('/'));
  
  // Calculate summary stats
  const totalTests = testSuites.reduce((sum, suite) => sum + suite.results.length, 0);
  const passedTests = testSuites.reduce(
    (sum, suite) => sum + suite.results.filter(r => r.passed).length,
    0
  );
  const failedTests = totalTests - passedTests;
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  
  // Group by fixture for easier navigation
  const fixtureGroups = new Map<string, TestSuite[]>();
  for (const suite of testSuites) {
    if (!fixtureGroups.has(suite.fixture)) {
      fixtureGroups.set(suite.fixture, []);
    }
    fixtureGroups.get(suite.fixture)!.push(suite);
  }
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WardBulletin Print Regression Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
      padding: 20px;
    }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 8px 8px 0 0;
    }
    
    h1 {
      font-size: 2rem;
      margin-bottom: 10px;
    }
    
    .timestamp {
      opacity: 0.9;
      font-size: 0.9rem;
    }
    
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      padding: 30px;
      background: #f8f9fa;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .stat {
      text-align: center;
    }
    
    .stat-value {
      font-size: 2.5rem;
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .stat-label {
      color: #666;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .stat.passed .stat-value { color: #28a745; }
    .stat.failed .stat-value { color: #dc3545; }
    .stat.total .stat-value { color: #007bff; }
    .stat.rate .stat-value { color: #6c757d; }
    
    .content {
      padding: 30px;
    }
    
    .fixture-group {
      margin-bottom: 50px;
    }
    
    .fixture-header {
      font-size: 1.5rem;
      font-weight: bold;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #667eea;
      color: #667eea;
    }
    
    .test-suite {
      margin-bottom: 30px;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      overflow: hidden;
    }
    
    .suite-header {
      background: #f8f9fa;
      padding: 15px 20px;
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      user-select: none;
    }
    
    .suite-header:hover {
      background: #e9ecef;
    }
    
    .suite-title {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .browser-badge {
      background: #007bff;
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
    }
    
    .browser-badge.chromium { background: #4285f4; }
    .browser-badge.firefox { background: #ff7139; }
    .browser-badge.webkit { background: #147efb; }
    
    .suite-stats {
      display: flex;
      gap: 15px;
      font-size: 0.9rem;
    }
    
    .suite-stats .pass { color: #28a745; }
    .suite-stats .fail { color: #dc3545; }
    
    .suite-content {
      padding: 20px;
    }
    
    .suite-content.collapsed {
      display: none;
    }
    
    .test-results {
      display: grid;
      gap: 15px;
    }
    
    .test-result {
      display: grid;
      grid-template-columns: 30px 1fr auto;
      gap: 15px;
      align-items: start;
      padding: 15px;
      border-radius: 6px;
      background: #f8f9fa;
    }
    
    .test-result.passed {
      background: #d4edda;
      border-left: 4px solid #28a745;
    }
    
    .test-result.failed {
      background: #f8d7da;
      border-left: 4px solid #dc3545;
    }
    
    .test-icon {
      font-size: 1.5rem;
    }
    
    .test-info h4 {
      font-size: 1rem;
      margin-bottom: 5px;
    }
    
    .test-message {
      color: #666;
      font-size: 0.9rem;
    }
    
    .test-details {
      background: rgba(0,0,0,0.05);
      padding: 10px;
      border-radius: 4px;
      margin-top: 10px;
      font-size: 0.85rem;
      font-family: monospace;
      white-space: pre-wrap;
      word-break: break-all;
    }
    
    .screenshot-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 15px;
      margin-top: 20px;
    }
    
    .screenshot {
      text-align: center;
    }
    
    .screenshot img {
      max-width: 100%;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: transform 0.2s;
    }
    
    .screenshot img:hover {
      transform: scale(1.05);
    }
    
    .screenshot-label {
      margin-top: 8px;
      font-size: 0.85rem;
      color: #666;
    }
    
    .modal {
      display: none;
      position: fixed;
      z-index: 1000;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0,0,0,0.9);
      align-items: center;
      justify-content: center;
    }
    
    .modal.active {
      display: flex;
    }
    
    .modal-content {
      max-width: 90%;
      max-height: 90%;
      object-fit: contain;
    }
    
    .close {
      position: absolute;
      top: 20px;
      right: 40px;
      color: white;
      font-size: 40px;
      font-weight: bold;
      cursor: pointer;
    }
    
    .close:hover {
      color: #ccc;
    }
    
    .filter-bar {
      margin-bottom: 20px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 6px;
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
      align-items: center;
    }
    
    .filter-bar label {
      font-weight: 600;
      margin-right: 5px;
    }
    
    .filter-bar button {
      padding: 8px 16px;
      border: 1px solid #007bff;
      background: white;
      color: #007bff;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s;
    }
    
    .filter-bar button:hover {
      background: #007bff;
      color: white;
    }
    
    .filter-bar button.active {
      background: #007bff;
      color: white;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>📄 WardBulletin Print Regression Report</h1>
      <div class="timestamp">Generated: ${new Date().toLocaleString()}</div>
    </header>
    
    <div class="summary">
      <div class="stat total">
        <div class="stat-value">${totalTests}</div>
        <div class="stat-label">Total Tests</div>
      </div>
      <div class="stat passed">
        <div class="stat-value">${passedTests}</div>
        <div class="stat-label">Passed</div>
      </div>
      <div class="stat failed">
        <div class="stat-value">${failedTests}</div>
        <div class="stat-label">Failed</div>
      </div>
      <div class="stat rate">
        <div class="stat-value">${successRate}%</div>
        <div class="stat-label">Success Rate</div>
      </div>
    </div>
    
    <div class="content">
      <div class="filter-bar">
        <label>Show:</label>
        <button onclick="filterTests('all')" class="active" id="filter-all">All</button>
        <button onclick="filterTests('failed')" id="filter-failed">Failed Only</button>
        <button onclick="filterTests('passed')" id="filter-passed">Passed Only</button>
      </div>
      
      ${Array.from(fixtureGroups.entries()).map(([fixture, suites]) => `
        <div class="fixture-group">
          <div class="fixture-header">${fixture}</div>
          ${suites.map(suite => {
            const passed = suite.results.filter(r => r.passed).length;
            const failed = suite.results.length - passed;
            const screenshots = suite.results
              .filter(r => r.pngPath)
              .map(r => r.pngPath!);
            
            return `
              <div class="test-suite">
                <div class="suite-header" onclick="toggleSuite(this)">
                  <div class="suite-title">
                    <span class="browser-badge ${suite.browser}">${suite.browser}</span>
                    <span>${suite.pageSize}</span>
                  </div>
                  <div class="suite-stats">
                    <span class="pass">✓ ${passed}</span>
                    <span class="fail">✗ ${failed}</span>
                  </div>
                </div>
                <div class="suite-content">
                  <div class="test-results">
                    ${suite.results.map(result => `
                      <div class="test-result ${result.passed ? 'passed' : 'failed'}" data-status="${result.passed ? 'passed' : 'failed'}">
                        <div class="test-icon">${result.passed ? '✓' : '✗'}</div>
                        <div class="test-info">
                          <h4>${result.name}</h4>
                          <div class="test-message">${result.message}</div>
                          ${result.details ? `<div class="test-details">${JSON.stringify(result.details, null, 2)}</div>` : ''}
                        </div>
                      </div>
                    `).join('')}
                  </div>
                  
                  ${screenshots.length > 0 ? `
                    <div class="screenshot-grid">
                      ${screenshots.map((path, idx) => {
                        const relPath = relative(reportDir, path);
                        return `
                          <div class="screenshot">
                            <img src="${relPath}" alt="Page ${idx + 1}" onclick="showModal(this.src)">
                            <div class="screenshot-label">Page ${idx + 1}</div>
                          </div>
                        `;
                      }).join('')}
                    </div>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `).join('')}
    </div>
  </div>
  
  <div id="imageModal" class="modal" onclick="closeModal()">
    <span class="close">&times;</span>
    <img class="modal-content" id="modalImage">
  </div>
  
  <script>
    function toggleSuite(header) {
      const content = header.nextElementSibling;
      content.classList.toggle('collapsed');
    }
    
    function showModal(src) {
      const modal = document.getElementById('imageModal');
      const modalImg = document.getElementById('modalImage');
      modal.classList.add('active');
      modalImg.src = src;
      event.stopPropagation();
    }
    
    function closeModal() {
      document.getElementById('imageModal').classList.remove('active');
    }
    
    function filterTests(filter) {
      // Update button states
      document.querySelectorAll('.filter-bar button').forEach(btn => {
        btn.classList.remove('active');
      });
      document.getElementById('filter-' + filter).classList.add('active');
      
      // Filter test results
      const results = document.querySelectorAll('.test-result');
      results.forEach(result => {
        if (filter === 'all') {
          result.style.display = 'grid';
        } else {
          const status = result.getAttribute('data-status');
          result.style.display = status === filter ? 'grid' : 'none';
        }
      });
    }
    
    // Collapse all suites by default except those with failures
    document.querySelectorAll('.test-suite').forEach(suite => {
      const failCount = suite.querySelectorAll('.test-result.failed').length;
      if (failCount === 0) {
        suite.querySelector('.suite-content').classList.add('collapsed');
      }
    });
  </script>
</body>
</html>
  `.trim();
  
  await writeFile(reportPath, html, 'utf-8');
}
