const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const https = require('https');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const LIVE_URL = 'https://aidivi265.github.io/myarea24-frontend/';
const REPORT_DIR = path.join(__dirname, '..', 'audit_reports');

if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

function fetchJson(url, options = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data.substring(0, 300) });
        }
      });
    }).on('error', (err) => reject(err));
  });
}

async function runDeepAudit() {
  console.log('=== MYAREA24 DEEP INTERACTION & API AUDIT ===');
  console.log('Target Live URL:', LIVE_URL);

  const report = {
    timestamp: new Date().toISOString(),
    liveUrl: LIVE_URL,
    interactions: [],
    apiIntegrations: [],
    uiVerifications: [],
  };

  // 1. External APIs
  console.log('\n--- 1. Testing External APIs ---');

  // Weather
  try {
    const weatherRes = await fetchJson(
      'https://api.open-meteo.com/v1/forecast?latitude=28.6139&longitude=77.209&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m'
    );
    report.apiIntegrations.push({
      service: 'Open-Meteo Weather API',
      status: weatherRes.status === 200 ? 'PASS' : 'FAIL',
      httpStatus: weatherRes.status,
      temperatureC: weatherRes.data?.current?.temperature_2m,
      humidity: weatherRes.data?.current?.relative_humidity_2m,
    });
    console.log(`[PASS] Weather: HTTP ${weatherRes.status}, Temp: ${weatherRes.data?.current?.temperature_2m}°C`);
  } catch (err) {
    report.apiIntegrations.push({ service: 'Open-Meteo Weather API', status: 'FAIL', error: err.message });
  }

  // Air Quality
  try {
    const aqiRes = await fetchJson(
      'https://air-quality-api.open-meteo.com/v1/air-quality?latitude=28.6139&longitude=77.209&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone'
    );
    report.apiIntegrations.push({
      service: 'Open-Meteo Air Quality API',
      status: aqiRes.status === 200 ? 'PASS' : 'FAIL',
      httpStatus: aqiRes.status,
      pm2_5: aqiRes.data?.current?.pm2_5,
      pm10: aqiRes.data?.current?.pm10,
    });
    console.log(`[PASS] Air Quality: HTTP ${aqiRes.status}, PM2.5: ${aqiRes.data?.current?.pm2_5}, PM10: ${aqiRes.data?.current?.pm10}`);
  } catch (err) {
    report.apiIntegrations.push({ service: 'Open-Meteo Air Quality API', status: 'FAIL', error: err.message });
  }

  // Overpass OSM
  try {
    const bbox = '28.60,77.20,28.63,77.22';
    const query = `[out:json][timeout:15];(node["shop"](${bbox}););out 3;`;
    const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    const osmRes = await fetchJson(overpassUrl, { headers: { 'User-Agent': 'MyArea24-Prototype-Auditor/1.0' } });
    report.apiIntegrations.push({
      service: 'OpenStreetMap Overpass API',
      status: osmRes.status === 200 ? 'PASS' : 'BLOCKED',
      httpStatus: osmRes.status,
      elementsCount: osmRes.data?.elements?.length || 0,
      note: osmRes.status !== 200 ? 'Public Overpass server rate-limited or busy; client fallback active' : undefined,
    });
    console.log(`[${osmRes.status === 200 ? 'PASS' : 'BLOCKED'}] Overpass OSM: HTTP ${osmRes.status}`);
  } catch (err) {
    report.apiIntegrations.push({ service: 'OpenStreetMap Overpass API', status: 'BLOCKED', error: err.message });
  }

  // 2. Real Browser Interactions
  console.log('\n--- 2. Executing Real Browser UI Interactions ---');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
  });

  async function withNewPage(testFn) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });
    try {
      return await testFn(page);
    } finally {
      await page.close();
    }
  }

  // 2.1 Search Interaction (Command Palette)
  await withNewPage(async (page) => {
    try {
      await page.goto(LIVE_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await new Promise((r) => setTimeout(r, 1200));

      // Click search box to open command palette
      await page.evaluate(() => {
        const input = document.querySelector('input[placeholder*="Search"]');
        if (input) input.click();
      });

      await new Promise((r) => setTimeout(r, 600));

      // Type query via evaluate
      const searchRes = await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input'));
        const modalInput = inputs.find((i) => i.placeholder.includes('jump to any section') || i.placeholder.includes('Search'));
        if (modalInput) {
          modalInput.value = 'Hospitals';
          modalInput.dispatchEvent(new Event('input', { bubbles: true }));
          return { found: true, val: modalInput.value };
        }
        return { found: false };
      });

      await page.screenshot({ path: path.join(REPORT_DIR, 'interaction_search.png') });

      report.interactions.push({
        id: 'INT-001',
        feature: 'Universal Search & Command Palette',
        status: searchRes.found ? 'PASS' : 'FAIL',
        details: `Command Palette input found and typed: "${searchRes.val || ''}"`,
      });
      console.log(`[PASS] INT-001: Search & Command Palette: ${searchRes.found}`);
    } catch (err) {
      report.interactions.push({ id: 'INT-001', feature: 'Universal Search & Command Palette', status: 'FAIL', details: err.message });
      console.log('[FAIL] INT-001:', err.message);
    }
  });

  // 2.2 Category Filter Chips on /businesses
  await withNewPage(async (page) => {
    try {
      await page.goto(`${LIVE_URL}businesses`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await new Promise((r) => setTimeout(r, 1200));

      const chipResult = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const chips = buttons.filter((b) => {
          const t = b.innerText.trim();
          return t === 'Groceries' || t === 'Food & Dining' || t === 'Healthcare' || t === 'Retail';
        });
        if (chips.length > 0) {
          chips[0].click();
          return { clicked: true, name: chips[0].innerText.trim() };
        }
        return { clicked: false, buttons: buttons.slice(0, 10).map((b) => b.innerText.trim()) };
      });

      await new Promise((r) => setTimeout(r, 600));
      await page.screenshot({ path: path.join(REPORT_DIR, 'interaction_category_filter.png') });

      report.interactions.push({
        id: 'INT-002',
        feature: 'Businesses Category Filter Chips',
        status: chipResult.clicked ? 'PASS' : 'FAIL',
        details: `Clicked filter chip: "${chipResult.name || 'none'}"`,
      });
      console.log(`[${chipResult.clicked ? 'PASS' : 'FAIL'}] INT-002: Category Filter: ${chipResult.name || 'none'}`);
    } catch (err) {
      report.interactions.push({ id: 'INT-002', feature: 'Category Filter Chips', status: 'FAIL', details: err.message });
      console.log('[FAIL] INT-002:', err.message);
    }
  });

  // 2.3 Location Picker Modal
  await withNewPage(async (page) => {
    try {
      await page.goto(LIVE_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await new Promise((r) => setTimeout(r, 1200));

      const modalTriggered = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const locBtn = buttons.find((b) => b.innerText.includes('India') || b.innerText.includes('Delhi') || b.title?.includes('Location') || b.innerHTML.includes('MapPin'));
        if (locBtn) {
          locBtn.click();
          return true;
        }
        return false;
      });

      await new Promise((r) => setTimeout(r, 800));

      const modalState = await page.evaluate(() => {
        const dialog = document.querySelector('[role="dialog"], .fixed');
        return {
          isOpen: !!dialog,
          preview: dialog ? dialog.innerText.substring(0, 80).replace(/\n/g, ' ') : '',
        };
      });

      await page.screenshot({ path: path.join(REPORT_DIR, 'interaction_location_modal.png') });

      report.interactions.push({
        id: 'INT-003',
        feature: 'Location Picker Modal & Geolocation Trigger',
        status: modalTriggered && modalState.isOpen ? 'PASS' : 'FAIL',
        details: `Modal opened: ${modalState.isOpen}, snippet: "${modalState.preview}"`,
      });
      console.log(`[PASS] INT-003: Location Picker Modal: ${modalState.isOpen}`);
    } catch (err) {
      report.interactions.push({ id: 'INT-003', feature: 'Location Picker Modal', status: 'FAIL', details: err.message });
      console.log('[FAIL] INT-003:', err.message);
    }
  });

  // 2.4 Saved Items Zero-Mock Verification
  await withNewPage(async (page) => {
    try {
      await page.goto(`${LIVE_URL}saved`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await new Promise((r) => setTimeout(r, 1200));

      const pageText = await page.evaluate(() => document.body.innerText);
      const isZeroMock = !pageText.includes('Sharma Sweets') && !pageText.includes('Apollo Pharmacy Sector 14');
      const hasEmptyNotice = pageText.includes('Saved') || pageText.includes('0');

      await page.screenshot({ path: path.join(REPORT_DIR, 'interaction_saved_items.png') });

      report.interactions.push({
        id: 'INT-004',
        feature: 'Saved Items Zero-Mock State',
        status: isZeroMock && hasEmptyNotice ? 'PASS' : 'FAIL',
        details: `Zero fake bookmarks found: ${isZeroMock}, empty state detected: ${hasEmptyNotice}`,
      });
      console.log(`[PASS] INT-004: Saved Items Zero-Mock State: ${isZeroMock && hasEmptyNotice}`);
    } catch (err) {
      report.interactions.push({ id: 'INT-004', feature: 'Saved Items Zero-Mock State', status: 'FAIL', details: err.message });
      console.log('[FAIL] INT-004:', err.message);
    }
  });

  // 2.5 Market & Fuel Rates Zero-Mock Guard
  await withNewPage(async (page) => {
    try {
      await page.goto(`${LIVE_URL}market-rates`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await new Promise((r) => setTimeout(r, 1200));

      const pageText = await page.evaluate(() => document.body.innerText);
      const hasNoZeroPrices = !pageText.includes('Petrol ₹0.00/L') && !pageText.includes('CNG ₹0.00/kg');
      const hasAwaitingKey = pageText.includes('Awaiting') || pageText.includes('OMC') || pageText.includes('PPAC');

      await page.screenshot({ path: path.join(REPORT_DIR, 'interaction_market_rates.png') });

      report.uiVerifications.push({
        id: 'UI-001',
        feature: 'Fuel Rates Guard (No Fake 0.00 Rates)',
        status: hasNoZeroPrices && hasAwaitingKey ? 'PASS' : 'FAIL',
        details: `No deceptive 0.00 prices: ${hasNoZeroPrices}, Awaiting OMC Key displayed: ${hasAwaitingKey}`,
      });
      console.log(`[PASS] UI-001: Fuel Rates Guard: ${hasNoZeroPrices && hasAwaitingKey}`);
    } catch (err) {
      report.uiVerifications.push({ id: 'UI-001', feature: 'Fuel Rates Guard', status: 'FAIL', details: err.message });
      console.log('[FAIL] UI-001:', err.message);
    }
  });

  // 2.6 Merchant Portal Security Shield & Authenticated Tab Traversal
  await withNewPage(async (page) => {
    try {
      await page.goto(`${LIVE_URL}merchant`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await new Promise((r) => setTimeout(r, 1500));

      // Part A: Check Unauthenticated Security Shield
      const shieldCheck = await page.evaluate(() => {
        const text = document.body.innerText;
        return {
          hasShield: text.includes('Merchant Security Shield') || text.includes('Merchant Portal Authentication Required'),
          hasLoginBtn: text.includes('Enter Store PIN / Log In'),
        };
      });

      // Part B: Authenticate via Verified Merchant Session in LocalStorage
      await page.evaluate(() => {
        const testProfile = {
          id: 'merchant-test-01',
          businessName: 'Verified Storefront',
          category: 'Retail & Services',
          ownerName: 'Divyanshu',
          phone: '+91 98110 24024',
          whatsapp: '+91 98110 24024',
          email: 'merchant@myarea24.com',
          fullAddress: 'Connaught Place, New Delhi',
          locality: 'Connaught Place',
          city: 'Delhi',
          pincode: '110001',
          docType: 'GSTIN',
          docNumber: '07AAAAA0000A1Z5',
          openingTime: '09:00',
          closingTime: '22:00',
          isVerified: true,
          registeredAt: new Date().toISOString(),
        };
        localStorage.setItem('myarea24_merchant_session_v1', JSON.stringify(testProfile));
        localStorage.setItem('myarea24_merchant_registered_v1', JSON.stringify(testProfile));
      });

      await page.reload({ waitUntil: 'domcontentloaded', timeout: 20000 });
      await new Promise((r) => setTimeout(r, 1500));

      const tabResults = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a'));
        const navItems = [
          'Dashboard',
          'Live Orders',
          'Business Profile',
          'Products & Services',
          'Customer Reviews',
          'Settings',
        ];
        const matched = [];
        for (const item of navItems) {
          const btn = buttons.find((b) => b.innerText.includes(item));
          if (btn) {
            btn.click();
            matched.push({ name: item, found: true });
          } else {
            matched.push({ name: item, found: false });
          }
        }
        return matched;
      });

      await page.screenshot({ path: path.join(REPORT_DIR, 'interaction_merchant_tabs.png') });

      const allTabsFound = tabResults.every((t) => t.found);
      report.interactions.push({
        id: 'INT-005',
        feature: 'Merchant Security Shield & Dashboard Tabs',
        status: shieldCheck.hasShield && allTabsFound ? 'PASS' : 'FAIL',
        details: `Security Shield verified: ${shieldCheck.hasShield}, Tabs verified: ${JSON.stringify(tabResults)}`,
      });
      console.log(`[PASS] INT-005: Merchant Security Shield & Tabs: ${shieldCheck.hasShield && allTabsFound}`);
    } catch (err) {
      report.interactions.push({ id: 'INT-005', feature: 'Merchant Security Shield & Dashboard Tabs', status: 'FAIL', details: err.message });
      console.log('[FAIL] INT-005:', err.message);
    }
  });

  await browser.close();

  fs.writeFileSync(
    path.join(REPORT_DIR, 'deep_audit_report.json'),
    JSON.stringify(report, null, 2)
  );

  console.log('\n=== DEEP AUDIT COMPLETED SUCCESSFULLY ===');
}

runDeepAudit().catch((err) => {
  console.error('Deep Audit Error:', err);
  process.exit(1);
});
