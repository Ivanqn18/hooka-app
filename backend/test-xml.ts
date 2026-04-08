import * as cheerio from 'cheerio';

async function fetchTitles() {
    console.log("Fetching with User-Agent...");
    const res = await fetch('https://www.boe.es/diario_boe/xml.php?id=BOE-S-20240112', {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    });
    const xml = await res.text();
    console.log(xml.substring(0, 500));

    if (xml.includes('<!DOCTYPE html>')) {
        console.log("It returned HTML instead of XML.");
    } else {
        const $ = cheerio.load(xml, { xmlMode: true });
        console.log("Items count:", $('item').length);
    }
}

fetchTitles().catch(console.error);
