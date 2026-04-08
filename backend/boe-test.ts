import * as puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

const boeSearchBaseUrl =
    'https://www.boe.es/buscar/boe.php?campo%5B0%5D=ORI&dato%5B0%5D=Comisionado+para+el+Mercado+de+Tabacos&operador%5B0%5D=and&campo%5B1%5D=TIT&dato%5B1%5D=precios+de+las+labores+de+tabaco&operador%5B1%5D=and&campo%5B2%5D=DEM&dato%5B2%5D=&operador%5B2%5D=and&campo%5B3%5D=DOC&dato%5B3%5D=&operador%5B3%5D=and&campo%5B4%5D=NBO&dato%5B4%5D=&operador%5B4%5D=and&campo%5B5%5D=FPU&dato%5B5%5D=20240101%2D20261231&operador%5B5%5D=and&page_hits=50&sort_field%5B0%5D=FPU&sort_order%5B0%5D=desc&accion=Buscar';

async function scan() {
    console.log('Fetching BOE list...');
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(boeSearchBaseUrl, { waitUntil: 'domcontentloaded' });
    const html = await page.content();
    const $ = cheerio.load(html);

    const linksExtraidos: string[] = [];
    $('.resultado-busqueda .enlaces a').each((_, el) => {
        const link = $(el).attr('href');
        if (link && link.includes('doc.php?id=')) {
            linksExtraidos.push(
                `https://www.boe.es/diario_boe/txt.php?id=${link.split('id=')[1]}`,
            );
        }
    });

    console.log(`Found ${linksExtraidos.length} links. Parsing all...`);

    for (const urlTxt of linksExtraidos) {
        try {
            await page.goto(urlTxt, { waitUntil: 'domcontentloaded' });
            const html = await page.content();
            const $$ = cheerio.load(html);
            const textContent = $$('#textoxslt').text();

            const startToken = 'Picadura para pipa de agua';
            const startIndex = textContent.indexOf(startToken);
            if (startIndex > -1) {
                const lines = textContent.substring(startIndex).split('\n');
                for (const line of lines) {
                    if (line.toLowerCase().includes('sayes') || line.toLowerCase().includes('say es')) {
                        console.log(`MATCH [${urlTxt.split('=')[1]}]: ${line.trim()}`);
                    }
                }
            }
        } catch (e) {
            console.log('Error in ' + urlTxt);
        }
    }

    await browser.close();
    console.log('Done scanning.');
}

scan().catch(console.error);
