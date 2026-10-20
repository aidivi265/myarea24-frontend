const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'https://aidivi265.github.io/myarea24-frontend/';

async function testClicks() {
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
    if (msg.type() === 'error') console.log('[BROWSER ERR]', msg.text());
  });

  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));

  // Test 1: Click "Businesses" sidebar button
  console.log('\n--- 1. Testing sidebar tab: Businesses ---');
  const bizBtn = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Businesses');
  });
  if (bizBtn) {
    await bizBtn.click();
    await new Promise(r => setTimeout(r, 500));
    const activeHeader = await page.evaluate(() => document.querySelector('h1, h2')?.innerText);
    console.log('After clicking Businesses, Header is:', activeHeader);
  } else {
    console.log('Businesses button not found!');
  }

  // Test 2: Click "Products" tab
  console.log('\n--- 2. Testing sidebar tab: Products ---');
  const prodBtn = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Products');
  });
  if (prodBtn) {
    await prodBtn.click();
    await new Promise(r => setTimeout(r, 500));
    const activeHeader = await page.evaluate(() => document.querySelector('h1, h2')?.innerText);
    console.log('After clicking Products, Header is:', activeHeader);
  }

  // Test 3: Click a product item card to see if modal opens
  console.log('\n--- 3. Testing product card click (modal trigger) ---');
  const cardClicked = await page.evaluate(() => {
    // Find any clickable card or button inside main content
    const cards = Array.from(document.querySelectorAll('div[role="button"], div.cursor-pointer, button.cursor-pointer'));
    const target = cards.find(c => c.innerText && c.innerText.includes('₹'));
    if (target) {
      target.click();
      return target.innerText.substring(0, 30);
    }
    return null;
  });
  await new Promise(r => setTimeout(r, 500));
  const modalOpen = await page.evaluate(() => {
    const modal = document.querySelector('[role="dialog"], .fixed.inset-0');
    return modal ? modal.innerText.substring(0, 100) : null;
  });
  console.log('Card clicked:', cardClicked, '| Modal opened:', !!modalOpen);
  if (modalOpen) {
    console.log('Modal text preview:', modalOpen.replace(/\n/g, ' '));
    // Find and click close button on modal
    const closed = await page.evaluate(() => {
      const closeBtn = document.querySelector('[aria-label="Close"], button.absolute');
      if (closeBtn) {
        closeBtn.click();
        return true;
      }
      return false;
    });
    console.log('Modal close button clicked:', closed);
    await new Promise(r => setTimeout(r, 500));
  }

  // Test 4: Location Picker Button
  console.log('\n--- 4. Testing Location Picker button ---');
  const locBtn = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('Select Location'));
  });
  if (locBtn) {
    await locBtn.click();
    await new Promise(r => setTimeout(r, 500));
    const locModal = await page.evaluate(() => {
      const modal = document.querySelector('.fixed.inset-0');
      return modal ? modal.innerText.substring(0, 80) : null;
    });
    console.log('Location modal opened:', !!locModal, locModal?.replace(/\n/g, ' '));
  }

  // Test 5: What about mobile viewport?
  console.log('\n--- 5. Testing on Mobile Viewport (390x844) ---');
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));

  const mobileNavButtons = await page.evaluate(() => {
    const nav = document.querySelector('nav, .fixed.bottom-0');
    if (!nav) return [];
    return Array.from(nav.querySelectorAll('button')).map(b => b.innerText.trim());
  });
  console.log('Mobile bottom nav buttons:', mobileNavButtons);

  // Click on mobile bottom nav "Intelligence" or "Explore"
  const clickedNav = await page.evaluate(() => {
    const nav = document.querySelector('.fixed.bottom-0');
    if (!nav) return false;
    const btns = Array.from(nav.querySelectorAll('button'));
    if (btns.length > 1) {
      btns[1].click();
      return btns[1].innerText.trim();
    }
    return false;
  });
  await new Promise(r => setTimeout(r, 500));
  console.log('Clicked mobile nav item:', clickedNav);

  console.log(`\nTotal page errors encountered: ${errors.length}`);
  if (errors.length > 0) {
    console.log('Errors:', errors);
  }

  await browser.close();
}

testClicks().catch(console.error);
