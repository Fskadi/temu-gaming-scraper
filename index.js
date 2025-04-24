const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/top-gaming', async (req, res) => {
    try {
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        const page = await browser.newPage();

        await page.goto('https://www.temu.com/ro/electronics-o3-248.html?opt_level=1&title=Electronice&_x_enter_scene_type=cate_tab&leaf_type=son&show_search_type=3&refer_page_el_sn=216619&refer_page_name=home&refer_page_id=10005_1745397497163_u92ov0k7cd&refer_page_sn=10005&_x_sessn_id=1c8n7rcxvu&filter_items=101%3A355%7C101%3A1816%7C101%3A1105%7C101%3A2884%7C101%3A1814%7C101%3A717%7C101%3A2872%7C0%3A1', {
            waitUntil: 'networkidle2',
            timeout: 0,
        });

        try {
            await page.waitForSelector('[class*=product-card]', { timeout: 20000 });
        } catch (err) {
            throw new Error('Produsele nu au fost încărcate în timp util.');
        }

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
