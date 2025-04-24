const puppeteer = require('puppeteer-core');
const chromium = require('chrome-aws-lambda'); // pentru Render sau AWS

(async () => {
  const browser = await puppeteer.launch({
    executablePath: await chromium.executablePath || '/usr/bin/google-chrome-stable',
    headless: chromium.headless,
    args: chromium.args
  });

  const page = await browser.newPage();
  await page.goto('https://www.temu.com', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  // Încearcă să închizi eventuale popup-uri (accept cookies, login modal etc)
  try {
    await page.waitForSelector('button:has-text("Accept")', { timeout: 5000 });
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }),
      page.click('button:has-text("Accept")')
    ]);
  } catch (e) {
    console.log('No cookie popup or already accepted.');
  }

  // Așteaptă să apară produsele
  await page.waitForSelector('a[href*="/goods"]', { timeout: 30000 });

  const products = await page.evaluate(() => {
    const productLinks = Array.from(document.querySelectorAll('a[href*="/goods"]'));
    const seen = new Set();
    const results = [];

    for (let link of productLinks) {
      const href = link.href;
      const title = link.innerText.trim();
      const priceMatch = link.innerText.match(/\$\d+(\.\d{2})?/);

      if (title && priceMatch && !seen.has(href)) {
        seen.add(href);
        results.push({
          title,
          price: priceMatch[0],
          link: href
        });
      }

      if (results.length >= 10) break;
    }

    return results;
  });

  console.log(products);
  await browser.close();
})();
