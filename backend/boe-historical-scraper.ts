import * as cheerio from 'cheerio';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getFridaysSince(startDate: Date, endDate: Date): Date[] {
    const fridays: Date[] = [];
    let d = new Date(startDate.getTime());
    while (d.getDay() !== 5) {
        d.setDate(d.getDate() + 1);
    }
    while (d <= endDate) {
        fridays.push(new Date(d.getTime()));
        d.setDate(d.getDate() + 7);
    }
    return fridays;
}

function formatDateToYYYYMMDD(date: Date): string {
    const yyyy = date.getFullYear().toString();
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    return `${yyyy}${mm}${dd}`;
}

async function runScraper() {
    console.log('--- Iniciando scraper histórico BOE (via Response Interception) ---');

    const startDate = new Date('2024-01-01T00:00:00Z');
    const endDate = new Date();
    const fridays = getFridaysSince(startDate, endDate);

    console.log(`Calculados ${fridays.length} viernes desde 2024 hasta hoy.`);
    const allResults: any[] = [];

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Set headers
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'es-ES,es;q=0.9',
    });

    console.log("Navegando a la home del BOE para obtener cookies/pasar WAF...");
    await page.goto("https://www.boe.es", { waitUntil: 'domcontentloaded' });
    await delay(2000);

    for (const date of fridays) {
        const fDate = formatDateToYYYYMMDD(date);
        const summaryUrl = `https://www.boe.es/diario_boe/xml.php?id=BOE-A-${fDate}`;

        console.log(`\n[${fDate}] Fetching sumario diario...`);

        let xmlText = "";

        // Setup response interception for this specific request
        const responseHandler = async (response: puppeteer.HTTPResponse) => {
            if (response.url() === summaryUrl) {
                try {
                    xmlText = await response.text();
                } catch (e) { }
            }
        };
        page.on('response', responseHandler);

        try {
            await page.goto(summaryUrl, { waitUntil: 'domcontentloaded' });
        } catch (e: any) {
            console.error(`  -> Error execute navigation a sumario:`, e.message);
        }

        page.off('response', responseHandler);

        if (!xmlText || xmlText.includes('errorParametros') || xmlText.includes('Error en la informac')) {
            console.log(`  -> Sumario no publicado este día o error BOE (WAF/404).`);
            continue;
        }

        const $ = cheerio.load(xmlText, { xmlMode: true });

        let targetXmlUrl = "";
        let resolucionEncontrada = false;

        $('item').each((_, el) => {
            const titulo = $(el).find('titulo').text() || '';
            const tLower = titulo.toLowerCase();
            if (tLower.includes('precios') && tLower.includes('tabaco')) {
                resolucionEncontrada = true;
                const urlNode = $(el).find('url_xml').first();
                if (urlNode.length > 0) {
                    targetXmlUrl = urlNode.text().trim();
                }
            }
        });

        if (!resolucionEncontrada || !targetXmlUrl) {
            console.log(`  -> No hay resolución de precios en este BOE.`);
            continue;
        }

        const documentUrl = targetXmlUrl.startsWith('http') ? targetXmlUrl : `https://www.boe.es${targetXmlUrl}`;
        console.log(`  -> Encontrada resolución de precios! Obteniendo doc XML: ${documentUrl}`);

        let docXmlText = "";
        const docResponseHandler = async (response: puppeteer.HTTPResponse) => {
            if (response.url() === documentUrl) {
                try {
                    docXmlText = await response.text();
                } catch (e) { }
            }
        };
        page.on('response', docResponseHandler);

        try {
            await page.goto(documentUrl, { waitUntil: 'domcontentloaded' });
        } catch (e: any) {
            console.error(`  -> Error browser navigation a doc XML:`, e.message);
        }

        page.off('response', docResponseHandler);

        if (!docXmlText) {
            console.log('  -> Falló la intercepción del doc XML.');
            continue;
        }

        const $doc = cheerio.load(docXmlText, { xmlMode: true });

        const textoHtml = $doc('texto').text() || $doc('texto').html();
        if (!textoHtml) {
            console.log('  -> Nodo <texto> vacío o no encontrado en el Documento XML.');
            continue;
        }

        const $html = cheerio.load(textoHtml);
        let extractedCount = 0;

        $html('table').each((_, table) => {
            $html(table).find('tr').each((_, tr) => {
                const tds = $html(tr).find('td');
                if (tds.length >= 2) {
                    const name = $html(tds[0]).text().trim();
                    const priceStr = $html(tds[1]).text().trim();

                    if (name && priceStr && /\d/.test(priceStr)) {
                        if (name.toLowerCase() !== 'euros/unidad' && name.toLowerCase() !== 'euros/envase') {
                            const cleanName = name.replace(/\s+/g, ' ');
                            allResults.push({
                                fecha: fDate,
                                producto: cleanName,
                                precio: priceStr
                            });
                            extractedCount++;
                        }
                    }
                }
            });
        });

        console.log(`  -> ¡Extraídos ${extractedCount} registros de la tabla!`);
    }

    await browser.close();

    console.log(`\n--- Extracción Histórica Completada ---`);
    console.log(`Total de fechas procesadas: ${fridays.length}`);
    console.log(`Cantidad de registros finales: ${allResults.length}`);

    fs.writeFileSync('boe_historico_precios.json', JSON.stringify(allResults, null, 2), 'utf-8');
    console.log('Todos los datos han sido guardados en "boe_historico_precios.json" en tu directorio actual.');
}

runScraper().catch(console.error);
