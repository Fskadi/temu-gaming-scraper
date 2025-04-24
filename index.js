const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: '/usr/bin/google-chrome-stable' // sau lasă gol dacă e local
  });

  const page = await browser.newPage();
  await page.goto('https://www.temu.com', { waitUntil: 'domcontentloaded', timeout: 60000 });

  // Ignorăm popup-urile dacă există
  try {
    await page.waitForSelector('button:has-text("Accept")', { timeout: 5000 });
    await page.click('button:has-text("Accept")');
  } catch (e) {
    console.log('No popup to accept.');
  }

  // Așteaptă să apară produsele
  await page.waitForSelector('a[href*="/goods"]', { timeout: 30000 });

  const products = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href*="/goods"]'));
    const seen = new Set();
    const results = [];

    for (let link of links) {
      const href = link.href;
      const title = link.innerText.trim();
      const priceMatch = title.match(/\$\d+(\.\d{2})?/);

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
