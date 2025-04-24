const puppeteer = require('puppeteer'); // folosește puppeteer full, NU puppeteer-core

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('https://www.temu.com', { waitUntil: 'domcontentloaded', timeout: 0 });

  try {
    await page.click('button:has-text("Accept")', { timeout: 5000 });
  } catch (e) {}

  await page.evaluate(() => window.scrollBy(0, 1000));
  await page.waitForTimeout(2000);

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
