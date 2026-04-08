async function testFetch() {
    console.log('Fetching BOE XML with native fetch...');
    try {
        const response = await fetch('https://www.boe.es/diario_boe/xml.php?id=BOE-S-20240112', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            }
        });

        const text = await response.text();
        console.log('Response length:', text.length);
        console.log('Starts with:', text.substring(0, 50));

        if (text.includes('sumario') || text.includes('<?xml')) {
            console.log('✅ SUCCCESS! We got the XML!');
        } else {
            console.log('❌ BOE WAF blocked us and returned an HTML page.');
        }
    } catch (e: any) {
        console.error('Error fetching:', e.message);
    }
}

testFetch();
