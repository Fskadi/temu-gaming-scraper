const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://www.temu.com/ro', { timeout: 60000, waitUntil: 'domcontentloaded' });

  // Așteaptă să încarce cardurile de produs
  await page.waitForSelector('div._6q6qVUF5._1UrrHYym', { timeout: 60000 });

  const produse = await page.evaluate(() => {
    const carduri = Array.from(document.querySelectorAll('div._6q6qVUF5._1UrrHYym'));

    return carduri.map(card => {
      const titlu = card.querySelector('h3._2BvQbnbN')?.innerText ?? 'Fără titlu';
      const pretInt = card.querySelector('div._382YgpSF span._2de9ERAH')?.innerText ?? '0';
      const pretDec = card.querySelector('div._382YgpSF span._3SrxhhHh')?.innerText ?? '00';
      const pret = `${pretInt},${pretDec} Lei`;

      const imagine = card.querySelector('img.goods-img-external')?.src ?? '';

      return { titlu, pret, imagine };
    });
  });

  console.log(produse);
  await browser.close();
})();
