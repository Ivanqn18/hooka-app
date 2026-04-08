import * as puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

async function testSearch() {
    const url = 'https://www.boe.es/buscar/boe.php?campo%5B0%5D=ORI&dato%5B0%5D=Comisionado+para+el+Mercado+de+Tabacos&operador%5B0%5D=and&campo%5B1%5D=TIT&dato%5B1%5D=precios+de+las+labores+de+tabaco&operador%5B1%5D=and&campo%5B2%5D=DEM&dato%5B2%5D=&operador%5B2%5D=and&campo%5B3%5D=DOC&dato%5B3%5D=&operador%5B3%5D=and&campo%5B4%5D=NBO&dato%5B4%5D=&operador%5B4%5D=and&campo%5B5%5D=FPU&dato%5B5%5D=20240101%2D20261231&operador%5B5%5D=and&page_hits=50&sort_field%5B0%5D=FPU&sort_order%5B0%5D=desc&accion=Buscar';

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    console.log('Navigating to search URL...');

    let html = "";
    page.on('response', async res => {
        if (res.url() === url) html = await res.text();
    });

    await page.goto(url, { waitUntil: 'domcontentloaded' });

    if (!html) html = await page.content();

    const $ = cheerio.load(html);

    console.log('--- CONTENT PREVIEW ---');
    const txt = $('body').text().replace(/\s+/g, ' ');
    console.log(txt.substring(0, 500));
    console.log('...');
    console.log(txt.slice(-500));

    const hits = $('.resultado-busqueda').length;
    console.log('Result blocks (.resultado-busqueda):', hits);

    await browser.close();
}

testSearch().catch(console.error);
