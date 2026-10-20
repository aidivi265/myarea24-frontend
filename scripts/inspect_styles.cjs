const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'https://aidivi265.github.io/myarea24-frontend/';

async function inspectStyles() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));

  const details = await page.evaluate(() => {
    const root = document.getElementById('root');
    const firstChild = root ? root.firstElementChild : null;

    // Check stylesheets
    const styleSheets = Array.from(document.styleSheets).map(s => {
      try {
        return { href: s.href, rulesCount: s.cssRules ? s.cssRules.length : 0 };
      } catch (e) {
        return { href: s.href, error: e.message };
      }
    });

    function getChain(el) {
      const chain = [];
      let curr = el;
      while (curr && curr !== document.documentElement) {
        const rect = curr.getBoundingClientRect();
        const style = window.getComputedStyle(curr);
        chain.push({
          tag: curr.tagName,
          id: curr.id,
          class: curr.className,
          rect: { width: rect.width, height: rect.height, top: rect.top, left: rect.left },
          display: style.display,
          width: style.width,
          height: style.height,
          visibility: style.visibility,
          overflow: style.overflow
        });
        curr = curr.parentElement;
      }
      return chain;
    }

    const firstBtn = document.querySelector('button');

    return {
      styleSheets,
      rootChain: firstChild ? getChain(firstChild) : [],
      buttonChain: firstBtn ? getChain(firstBtn) : []
    };
  });

  console.log('StyleSheets:', JSON.stringify(details.styleSheets, null, 2));
  console.log('\nRoot Chain:', JSON.stringify(details.rootChain, null, 2));
  console.log('\nButton Chain:', JSON.stringify(details.buttonChain, null, 2));

  await browser.close();
}

inspectStyles().catch(console.error);
