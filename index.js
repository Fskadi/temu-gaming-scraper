const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/top-gaming', async (req, res) => {
    try {
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        const page = await browser.newPage();

        await page.goto('https://www.temu.com/ro/electronics-o3-248.html?opt_level=1&title=Electronice', {
            waitUntil: 'domcontentloaded',
            timeout: 0,
        });

        // Scroll puțin să forțăm încărcarea
        await page.evaluate(() => {
            window.scrollBy(0, window.innerHeight);
        });

        // Așteaptă selectorul cu timeout mai mare
        await page.waitForSelector('[class*=product-card]', { timeout: 30000 });

        const products = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('[class*=product-card]'));
            return items.slice(0, 10).map(el => ({
                title: el.querySelector('[class*=product-title]')?.innerText || 'Fără titlu',
                price: el.querySelector('[class*=product-price]')?.innerText || 'Fără preț',
                image: el.querySelector('img')?.src,
            }));
        });

        await browser.close();

        if (!products.length) {
            return res.status(404).json({ error: 'Nu s-au găsit produse.' });
        }

        const randomProduct = products[Math.floor(Math.random() * products.length)];
        randomProduct.link = "https://temu.to/k/esturx55zr1"; // cod afiliat

        res.json(randomProduct);
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

app.listen(PORT, () => {
    console.log(`Serverul rulează pe portul ${PORT}`);
});
