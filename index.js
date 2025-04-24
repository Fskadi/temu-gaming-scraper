const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/usr/bin/google-chrome-stable',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('https://www.temu.com', { waitUntil: 'domcontentloaded', timeout: 0 });

  // Accept cookies / pop-up
  try {
    await page.click('button:has-text("Accept")', { timeout: 5000 });
  } catch (e) {}

  // Scroll puțin
  await page.evaluate(() => window.scrollBy(0, 1000));
  await page.waitForTimeout(2000);

  // Selector mai sigur: linkuri cu href ce conțin "/goods"
  await page.waitForSelector('a[href*="/goods"]', { timeout: 30000 });

  const products = await page.$$eval('a[href*="/goods"]', (links) => {
    const items = [];
    for (const link of links) {
      const title = link.querySelector('div')?.innerText || 'Fără titlu';
      const price = link.innerText.match(/(\$\d+(\.\d+)?)/)?.[0] || 'Fără preț';
      const href = link.href;

      if (title && price && href && items.length < 10) {
        items.push({ title, price, link: href });
      }
    }
    return items;
  });

  console.log(products);

  await browser.close();
})();
