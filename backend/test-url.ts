import * as puppeteer from 'puppeteer';

async function verifyBoeUrl() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto("https://www.boe.es/diario_boe/", { waitUntil: 'domcontentloaded' });

    // Find the link that contains 'xml.php'
    const xmlLinks = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        return links.filter(a => a.href.includes('xml.php')).map(a => a.href);
    });

    console.log("Found XML Links on today's summary:");
    console.log(xmlLinks);

    await browser.close();
}

verifyBoeUrl().catch(console.error);
