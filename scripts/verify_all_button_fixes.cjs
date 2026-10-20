const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://127.0.0.1:4173/';

async function testAllFixedButtons() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('[PAGE ERROR]', msg.text());
  });

  console.log('Navigating to', BASE_URL);
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1200));

  // Helper to click visible button/element
  async function clickVisible(selector, textMatch) {
    return await page.evaluate(({ selector, textMatch }) => {
      const els = Array.from(document.querySelectorAll(selector));
      for (const el of els) {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        if (rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden') {
          const text = (el.innerText || el.getAttribute('aria-label') || '').trim();
          if (!textMatch || text.includes(textMatch)) {
            el.click();
            return { found: true, text: text.substring(0, 50) };
          }
        }
      }
      return { found: false };
    }, { selector, textMatch });
  }

  // Helper to close open modals
  async function closeModal() {
    await page.evaluate(() => {
      const closeBtn = document.querySelector('[aria-label="Close"], button.absolute, .fixed.inset-0');
      if (closeBtn) closeBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));
  }

  console.log('\n--- 1. Testing Desktop Explore Category: Cafes ---');
  const cafeClick = await clickVisible('button', 'Cafes');
  console.log('Clicked Cafes:', cafeClick);
  await new Promise(r => setTimeout(r, 600));
  const urlAfterCafe = page.url();
  console.log('URL after clicking Cafes:', urlAfterCafe);
  if (!urlAfterCafe.includes('cat=Caf')) throw new Error('Explore Category Cafes did not pass query params!');

  console.log('\n--- 2. Testing Desktop Explore Category: Gyms ---');
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 600));
  const gymClick = await clickVisible('button', 'Gyms');
  console.log('Clicked Gyms:', gymClick);
  await new Promise(r => setTimeout(r, 600));
  const urlAfterGym = page.url();
  console.log('URL after clicking Gyms:', urlAfterGym);
  if (!urlAfterGym.includes('cat=Fitness')) throw new Error('Explore Category Gyms did not pass query params!');

  console.log('\n--- 3. Testing Cart Drawer & "Explore Products" Button ---');
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 600));
  const cartClick = await clickVisible('button', 'Cart');
  console.log('Clicked Cart button:', cartClick);
  await new Promise(r => setTimeout(r, 800));
  // Verify drawer is open
  const drawerText = await page.evaluate(() => document.querySelector('aside, .fixed.inset-y-0')?.innerText);
  console.log('Cart Drawer opened:', !!drawerText);
  // Click "Explore Products" button inside empty cart drawer
  const exploreProdClick = await clickVisible('button', 'Explore Products');
  console.log('Clicked "Explore Products" in Cart:', exploreProdClick);
  await new Promise(r => setTimeout(r, 800));
  const urlAfterCartExplore = page.url();
  console.log('URL after Explore Products in Cart:', urlAfterCartExplore);
  if (!urlAfterCartExplore.includes('products')) throw new Error('Cart "Explore Products" did not navigate to /products!');

  console.log('\n--- 4. Testing Action Modal Primary Action Button (Emergency SOS) ---');
  await page.goto(BASE_URL + 'emergency', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 800));
  const sosClick = await clickVisible('button', 'Call 112');
  console.log('Clicked Call 112 button:', sosClick);
  await new Promise(r => setTimeout(r, 800));
  const modalInfo = await page.evaluate(() => {
    const modal = document.querySelector('.fixed.inset-0');
    if (!modal) return null;
    const primaryBtn = Array.from(modal.querySelectorAll('button')).find(b => b.innerText.includes('Dial 112'));
    const callLink = modal.querySelector('a[href^="tel:112"]');
    return {
      hasModal: true,
      hasPrimaryBtn: !!primaryBtn,
      primaryBtnText: primaryBtn?.innerText,
      hasCallLink: !!callLink,
      callHref: callLink?.getAttribute('href')
    };
  });
  console.log('Emergency Modal info:', modalInfo);
  if (!modalInfo || !modalInfo.hasPrimaryBtn || !modalInfo.hasCallLink) {
    throw new Error('Action Modal missing primary action button or telephone link!');
  }
  await closeModal();

  console.log('\n--- 5. Testing Mobile Viewport (390x844) Category Chips ---');
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(BASE_URL + 'businesses', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1000));

  // Click "☕ Cafes" category chip on mobile
  const mobileCafeChip = await clickVisible('button', '☕ Cafes');
  console.log('Mobile clicked ☕ Cafes chip:', mobileCafeChip);
  await new Promise(r => setTimeout(r, 600));

  // Verify that active chip is styled active
  const isCafeActive = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Cafes'));
    return btn ? btn.className.includes('bg-blue-600') : false;
  });
  console.log('Mobile Cafes chip is active (bg-blue-600):', isCafeActive);
  if (!isCafeActive) throw new Error('Mobile category chip did not update active state!');

  // Click "🍴 Restaurants" chip
  const mobileRestChip = await clickVisible('button', '🍴 Restaurants');
  console.log('Mobile clicked 🍴 Restaurants chip:', mobileRestChip);
  await new Promise(r => setTimeout(r, 600));

  const isRestActive = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Restaurants'));
    return btn ? btn.className.includes('bg-blue-600') : false;
  });
  console.log('Mobile Restaurants chip is active (bg-blue-600):', isRestActive);
  if (!isRestActive) throw new Error('Mobile Restaurants chip did not update active state!');

  console.log('\n--- 6. Testing Mobile Services Category Grid ---');
  await page.goto(BASE_URL + 'services', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1000));
  const mobileRepairClick = await clickVisible('button', 'Repairs');
  console.log('Mobile clicked Repairs button:', mobileRepairClick);
  await new Promise(r => setTimeout(r, 600));

  const isRepairActive = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Repairs'));
    return btn ? btn.querySelector('div')?.className.includes('bg-blue-600') : false;
  });
  console.log('Mobile Repairs category is active:', isRepairActive);
  if (!isRepairActive) throw new Error('Mobile Repairs category button did not update active state!');

  console.log('\n--- 7. Testing Mobile 1-Tap SOS Dispatch Direct Phone Linking ---');
  await page.goto(BASE_URL + 'emergency', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1000));
  const mobileSosClick = await clickVisible('button', '108 Med');
  console.log('Mobile clicked 108 Med SOS:', mobileSosClick);
  await new Promise(r => setTimeout(r, 800));

  const mobileSosModal = await page.evaluate(() => {
    const modal = document.querySelector('.fixed.inset-0');
    if (!modal) return null;
    const callLink = modal.querySelector('a[href="tel:108"]');
    const primaryBtn = Array.from(modal.querySelectorAll('button')).find(b => b.innerText.includes('Dial 108'));
    return {
      hasModal: true,
      hasCallLink: !!callLink,
      callHref: callLink?.getAttribute('href'),
      hasPrimaryBtn: !!primaryBtn
    };
  });
  console.log('Mobile SOS Modal result:', mobileSosModal);
  if (!mobileSosModal || !mobileSosModal.hasCallLink || !mobileSosModal.hasPrimaryBtn) {
    throw new Error('Mobile SOS Modal failed to link phone 108!');
  }

  await browser.close();
  console.log('\n======================================================');
  console.log('ALL BUTTON TESTS PASSED WITH 100% ACCURACY & FIDELITY!');
  console.log('======================================================');
}

testAllFixedButtons().catch(err => {
  console.error('\nTEST FAILED:', err);
  process.exit(1);
});
