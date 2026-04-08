const puppeteer = require('puppeteer');

(async () => {
    console.log('Test HookyMia Interaction...');
    const browser = await puppeteer.launch({ headless: false }); // Vemos qué pasa
    const page = await browser.newPage();

    // Configurar viewport grande para que Flutter dibuje todo
    await page.setViewport({ width: 1200, height: 800 });

    // Interceptar llamadas JSON de datos
    page.on('response', async (response) => {
        const url = response.url();
        // Flutter Web usa canvaskit o canvaskit.wasm, the data usually comes from Firebase/Firestore or a REST endpoint
        if (url.includes('googleapis') || url.includes('firebase') || url.includes('/api') || url.includes('graphql')) {
            console.log(`[DATA CALL] ${url} -> Status: ${response.status()}`);
            try {
                const text = await response.text();
                if (text.length > 100) {
                    console.log('Snippet:', text.substring(0, 200));
                }
            } catch (e) { }
        }
    });

    await page.goto('https://www.hookymia.es/webapp/', { waitUntil: 'networkidle2', timeout: 60000 });

    console.log('Esperando 10 segundos para ver si carga el motor grafico Flutter...');
    await new Promise(r => setTimeout(r, 10000));

    console.log('Haciendo click en coordinadas a ver si llegamos a la pestana "Tabaco"... En flutter todo es un canvas tag');
    // Flutter suele usar <flt-glass-pane> o canvas. Hacemos click en el centro aprox
    await page.mouse.click(600, 400);

    await new Promise(r => setTimeout(r, 5000));

    const layoutInfo = await page.evaluate(() => {
        return {
            tags: Array.from(document.querySelectorAll('*')).map(e => e.tagName.toLowerCase())
        };
    });
    console.log('Tags encontrados en el body flutter:', [...new Set(layoutInfo.tags)]);

    await browser.close();
})();
