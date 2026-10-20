const puppeteer = require('puppeteer-core');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'https://aidivi265.github.io/myarea24-frontend/';

async function inspectLayout() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));

  await page.screenshot({ path: 'audit_reports/live_debug_desktop.png' });

  const info = await page.evaluate(() => {
    const root = document.getElementById('root');
    const body = document.body;
    const allButtons = Array.from(document.querySelectorAll('button'));

    return {
      rootHtmlLen: root ? root.innerHTML.length : 0,
      bodyChildren: Array.from(body.children).map(c => ({ tag: c.tagName, id: c.id, className: c.className })),
      buttons: allButtons.map((b, i) => {
        const rect = b.getBoundingClientRect();
        const style = window.getComputedStyle(b);
        return {
          i,
          text: b.innerText.substring(0, 30),
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left,
          display: style.display,
          visibility: style.visibility,
          opacity: style.opacity,
          pointerEvents: style.pointerEvents,
          parentDisplay: b.parentElement ? window.getComputedStyle(b.parentElement).display : null
        };
      })
    };
  });

  console.log('Root HTML Length:', info.rootHtmlLen);
  console.log('Body children:', info.bodyChildren);
  console.log('Buttons sample (first 10):');
  console.log(JSON.stringify(info.buttons.slice(0, 10), null, 2));

  await browser.close();
}

inspectLayout().catch(console.error);
