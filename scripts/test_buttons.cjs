const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'https://aidivi265.github.io/myarea24-frontend/';

async function inspectPage(targetUrl) {
  console.log(`\n=== Testing Target: ${targetUrl} ===`);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const consoleLogs = [];
  const errors = [];

  page.on('console', msg => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
    if (msg.type() === 'error') {
      console.log(`[PAGE ERROR LOG] ${msg.text()}`);
    }
  });

  page.on('pageerror', err => {
    errors.push(err.toString());
    console.log(`[PAGE RUNTIME UNCAUGHT ERROR] ${err.toString()}`);
  });

  try {
    await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 });
  } catch (e) {
    console.log(`Navigation error: ${e.message}`);
  }

  // Count buttons
  const buttons = await page.$$('button');
  console.log(`Found ${buttons.length} buttons on page`);

  const buttonDetails = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.map((b, i) => ({
      index: i,
      text: b.innerText.trim().replace(/\n/g, ' '),
      ariaLabel: b.getAttribute('aria-label'),
      disabled: b.disabled,
      classes: b.className.substring(0, 50),
      onclick: !!b.onclick,
      type: b.type
    }));
  });

  console.log('Sample of buttons on page:');
  buttonDetails.slice(0, 15).forEach(b => {
    console.log(` #${b.index}: text="${b.text || b.ariaLabel || '(icon)'}" disabled=${b.disabled}`);
  });

  // Try clicking various buttons to test reactivity
  console.log('\n--- Testing button clicks ---');
  for (let i = 0; i < Math.min(buttons.length, 25); i++) {
    const btn = buttons[i];
    const detail = buttonDetails[i];
    const label = detail.text || detail.ariaLabel || `button-${i}`;
    try {
      const isVisible = await btn.evaluate(el => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).display !== 'none';
      });

      if (!isVisible || detail.disabled) {
        console.log(`Button #${i} (${label}): skipped (visible=${isVisible}, disabled=${detail.disabled})`);
        continue;
      }

      await btn.click({ timeout: 2000 });
      await new Promise(r => setTimeout(r, 300));
      console.log(`Button #${i} (${label}): Clicked successfully. Errors logged: ${errors.length}`);
    } catch (err) {
      console.log(`Button #${i} (${label}): Click failed - ${err.message}`);
    }
  }

  console.log(`\nTotal uncaught runtime errors: ${errors.length}`);
  console.log(`Total console error logs: ${consoleLogs.filter(c => c.type === 'error').length}`);

  await browser.close();
}

async function main() {
  await inspectPage(URL);
}

main().catch(console.error);
