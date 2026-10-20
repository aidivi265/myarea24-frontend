const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'https://aidivi265.github.io/myarea24-frontend/';

async function inspectVisible() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));

  const visibleButtons = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('button, a, input, select, [role="button"]'));
    return all.map((el, i) => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      const isVisible = rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
      return {
        i,
        tag: el.tagName,
        text: (el.innerText || el.value || el.getAttribute('aria-label') || '').trim().replace(/\n/g, ' ').substring(0, 40),
        isVisible,
        rect: { width: Math.round(rect.width), height: Math.round(rect.height), top: Math.round(rect.top), left: Math.round(rect.left) },
        pointerEvents: style.pointerEvents,
        className: el.className.substring(0, 40),
        disabled: el.disabled
      };
    }).filter(e => e.isVisible);
  });

  console.log(`Visible interactive elements on desktop (1280px): ${visibleButtons.length}`);
  console.log(JSON.stringify(visibleButtons.slice(0, 30), null, 2));

  await browser.close();
}

inspectVisible().catch(console.error);
