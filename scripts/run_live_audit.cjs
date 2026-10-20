const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const LIVE_URL = 'https://aidivi265.github.io/myarea24-frontend/';
const REPORT_DIR = path.join(__dirname, '..', 'audit_reports');

if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

async function runLiveAudit() {
  console.log('--- STARTING REAL BROWSER AUDIT ---');
  console.log('Target URL:', LIVE_URL);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--ignore-certificate-errors'],
  });

  const page = await browser.newPage();

  const consoleErrors = [];
  const consoleWarnings = [];
  const networkErrors = [];

  page.on('console', (msg) => {
    const text = msg.text();
    if (msg.type() === 'error') {
      consoleErrors.push({ text, location: msg.location() });
      console.log('  [Console Error]:', text);
    } else if (msg.type() === 'warning') {
      consoleWarnings.push(text);
    }
  });

  page.on('requestfailed', (req) => {
    networkErrors.push({
      url: req.url(),
      method: req.method(),
      failure: req.failure() ? req.failure().errorText : 'Unknown',
    });
    console.log('  [Request Failed]:', req.method(), req.url());
  });

  page.on('response', (res) => {
    if (res.status() >= 400) {
      networkErrors.push({
        url: res.url(),
        status: res.status(),
        statusText: res.statusText(),
      });
      console.log('  [HTTP Error]:', res.status(), res.url());
    }
  });

  const results = {
    timestamp: new Date().toISOString(),
    liveUrl: LIVE_URL,
    tests: [],
    viewports: [],
  };

  // Helper test runner
  async function testStep(id, feature, action, testFn) {
    const start = Date.now();
    try {
      const res = await testFn();
      results.tests.push({
        testId: id,
        feature,
        action,
        status: res.passed ? 'PASS' : 'FAIL',
        details: res.details || '',
        durationMs: Date.now() - start,
      });
      console.log(`[${res.passed ? 'PASS' : 'FAIL'}] ${id}: ${feature} - ${action}`);
    } catch (err) {
      results.tests.push({
        testId: id,
        feature,
        action,
        status: 'FAIL',
        details: err.message,
        durationMs: Date.now() - start,
      });
      console.log(`[FAIL] ${id}: ${feature} - ${action} (${err.message})`);
    }
  }

  // 1. Initial Load Test
  await testStep('NAV-001', 'Homepage Load', 'Navigate to root live URL', async () => {
    await page.setViewport({ width: 1366, height: 768 });
    const response = await page.goto(LIVE_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise((resolve) => setTimeout(resolve, 600));
    const status = response ? response.status() : 0;
    const title = await page.title();
    const hasRoot = await page.$('#root');
    await page.screenshot({ path: path.join(REPORT_DIR, '01_homepage.png'), fullPage: false });
    return {
      passed: status === 200 && !!hasRoot && title.includes('MyArea24'),
      details: `HTTP ${status}, Title: "${title}"`,
    };
  });

  // 2. Navigation bar and Routes
  const testRoutes = [
    { id: 'NAV-002', name: 'Businesses', path: 'businesses' },
    { id: 'NAV-003', name: 'Products', path: 'products' },
    { id: 'NAV-004', name: 'Services', path: 'services' },
    { id: 'NAV-005', name: 'Offers', path: 'offers' },
    { id: 'NAV-006', name: 'Events', path: 'events' },
    { id: 'NAV-007', name: 'Weather & AQI', path: 'weather' },
    { id: 'NAV-008', name: 'Live Traffic', path: 'traffic' },
    { id: 'NAV-009', name: 'Alerts & Notices', path: 'alerts' },
    { id: 'NAV-010', name: 'Market Rates', path: 'market-rates' },
    { id: 'NAV-011', name: 'Emergency SOS', path: 'emergency' },
  ];

  for (const r of testRoutes) {
    await testStep(r.id, `${r.name} Navigation`, `Click/Navigate to /${r.path}`, async () => {
      const url = `${LIVE_URL}${r.path}`;
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await new Promise((resolve) => setTimeout(resolve, 800));
      const currentUrl = page.url();
      const content = await page.content();
      const hasError = content.includes('Something went wrong') || content.includes('404 Not Found');
      return {
        passed: !hasError && (currentUrl.includes(r.path) || currentUrl.includes(LIVE_URL)),
        details: `Current URL: ${currentUrl}, Content Length: ${content.length}`,
      };
    });
  }

  // 3. SPA Refresh Test on Deep Route
  await testStep('NAV-012', 'Deep Link Refresh', 'Refresh browser on /weather', async () => {
    await page.goto(`${LIVE_URL}weather`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    const response = await page.reload({ waitUntil: 'domcontentloaded', timeout: 20000 });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const title = await page.title();
    const bodyText = await page.evaluate(() => document.body.innerText);
    const passed = bodyText.includes('Weather') || bodyText.includes('Air Quality') || bodyText.includes('AQI');
    return {
      passed,
      details: `Reloaded successfully, text snippet: "${bodyText.substring(0, 80)}..."`,
    };
  });

  // 4. Merchant Portal Access via Citizen Profile Dropdown
  await testStep('MERCHANT-001', 'Merchant Portal Access', 'Open Profile dropdown and click Switch to Merchant Portal', async () => {
    await page.goto(LIVE_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Look for user profile button or dropdown and click it
    const profileOpened = await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="user-profile-button"]') ||
                  Array.from(document.querySelectorAll('button')).find(b =>
                    b.innerHTML.includes('rounded-full') && (b.innerText.includes('Alex') || b.querySelector('svg'))
                  );
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Look for Switch to Merchant button in dropdown
    const clickedMerchant = await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="switch-to-merchant-button"]') ||
                  Array.from(document.querySelectorAll('button')).find(b =>
                    b.innerText.includes('Switch to Merchant') || b.innerText.includes('Register as Merchant')
                  );
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    await new Promise((resolve) => setTimeout(resolve, 1500));
    const currentUrl = page.url();
    const content = await page.content();
    const hasMerchant = currentUrl.includes('merchant') || content.includes('Merchant Portal') || content.includes('Storefront');
    await page.screenshot({ path: path.join(REPORT_DIR, '02_merchant_portal.png'), fullPage: false });
    return {
      passed: hasMerchant,
      details: `Profile opened: ${profileOpened}, Clicked merchant: ${clickedMerchant}, URL: ${currentUrl}`,
    };
  });

  // 5. Responsive Viewport Audits
  const viewports = [
    { name: 'Mobile (375x812)', width: 375, height: 812 },
    { name: 'Mobile (390x844)', width: 390, height: 844 },
    { name: 'Tablet (768x1024)', width: 768, height: 1024 },
    { name: 'Desktop (1366x768)', width: 1366, height: 768 },
    { name: 'Desktop Large (1920x1080)', width: 1920, height: 1080 },
  ];

  for (const vp of viewports) {
    await page.setViewport({ width: vp.width, height: vp.height });
    await page.goto(LIVE_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Check horizontal scrollbar
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    results.viewports.push({
      viewport: vp.name,
      dimensions: `${vp.width}x${vp.height}`,
      hasHorizontalOverflow: overflow,
    });

    await page.screenshot({
      path: path.join(REPORT_DIR, `viewport_${vp.width}x${vp.height}.png`),
      fullPage: false,
    });
  }

  // Summary
  results.consoleErrors = consoleErrors;
  results.networkErrors = networkErrors;
  results.consoleWarnings = consoleWarnings.slice(0, 20);

  fs.writeFileSync(
    path.join(REPORT_DIR, 'live_audit_results.json'),
    JSON.stringify(results, null, 2)
  );

  console.log('\n--- AUDIT SUMMARY ---');
  console.log('Total Tests Run:', results.tests.length);
  console.log('Passed:', results.tests.filter((t) => t.status === 'PASS').length);
  console.log('Failed:', results.tests.filter((t) => t.status === 'FAIL').length);
  console.log('Console Errors:', consoleErrors.length);
  console.log('Network Failures:', networkErrors.length);

  await browser.close();
}

runLiveAudit().catch((err) => {
  console.error('Audit Runner Error:', err);
  process.exit(1);
});
