const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'https://aidivi265.github.io/myarea24-frontend/';

async function testAllButtons() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const errors = [];
  page.on('pageerror', err => errors.push(err.toString()));
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('[CONSOLE ERROR]', msg.text());
  });

  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));

  console.log('--- Scanning all clickable buttons on desktop view ---');
  const results = await page.evaluate(async () => {
    const btns = Array.from(document.querySelectorAll('button'));
    const report = [];

    for (let i = 0; i < btns.length; i++) {
      const b = btns[i];
      const rect = b.getBoundingClientRect();
      const style = window.getComputedStyle(b);
      const isVisible = rect.width > 0 && rect.height > 0 && style.display !== 'none';
      if (!isVisible) continue;

      const text = (b.innerText || b.getAttribute('aria-label') || '').trim().replace(/\n/g, ' ').substring(0, 30);

      const urlBefore = window.location.href;
      const modalBefore = !!document.querySelector('.fixed.inset-0, [role="dialog"]');

      try {
        b.click();

        const urlAfter = window.location.href;
        const modalAfter = !!document.querySelector('.fixed.inset-0, [role="dialog"]');

        report.push({
          index: i,
          text,
          disabled: b.disabled,
          urlChanged: urlBefore !== urlAfter,
          modalTriggered: !modalBefore && modalAfter,
          urlBefore,
          urlAfter
        });

        if (!modalBefore && modalAfter) {
          const closeBtn = document.querySelector('[aria-label="Close"], button.absolute');
          if (closeBtn) closeBtn.click();
        }
      } catch (err) {
        report.push({ index: i, text, error: err.message });
      }
    }
    return report;
  });

  console.log(`Tested ${results.length} visible buttons on desktop:`);
  results.forEach(r => {
    console.log(`- "${r.text}": urlChanged=${r.urlChanged}, modalTriggered=${r.modalTriggered} (urlAfter=${r.urlAfter})`);
  });

  await browser.close();
}

testAllButtons().catch(console.error);
