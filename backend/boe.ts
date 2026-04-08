import { XMLParser } from "fast-xml-parser";


const DEPARTAMENTO_CAT = 'MINISTERIO DE HACIENDA';
const EPIGRAFE_FILTER = 'Tabaco. Precios';

async function getXmlUrls(date: Date): Promise<string[]> {

    const dateFormat = date.toISOString().slice(0, 10).replaceAll('-', '');


    //const url = `https://www.boe.es/datosabiertos/api/boe/sumario/${dateFormat}`;

    const url = `https://www.boe.es/datosabiertos/api/boe/sumario/20260307`;

    const response = await fetch(url, {
        headers: {
            'Accept': 'application/xml',
        },
    });
    const data = await response.text();

    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
    });
    const parsedData = parser.parse(data);

    const xmlUrls: string[] = [];

    // Navigate to the sections array
    const sumario = parsedData.response?.data?.sumario;
    if (!sumario) {
        console.error("No sumario found in response");
        return xmlUrls;
    }

    const diario = sumario.diario;
    const secciones = Array.isArray(diario?.seccion)
        ? diario.seccion
        : [diario?.seccion].filter(Boolean);

    secciones.forEach((seccion: any) => {
        const departamentos = Array.isArray(seccion.departamento)
            ? seccion.departamento
            : [seccion.departamento].filter(Boolean);

        departamentos.forEach((dept: any) => {
            // Check for both direct 'nombre' and attribute '@_nombre'
            const deptName = dept['@_nombre'] || dept.nombre;
            if (deptName === DEPARTAMENTO_CAT) {

                const epigrafes = Array.isArray(dept.epigrafe)
                    ? dept.epigrafe
                    : [dept.epigrafe].filter(Boolean);

                epigrafes.forEach((epi: any) => {
                    const epiName = epi['@_nombre'] || epi.nombre;
                    if (epiName === EPIGRAFE_FILTER) {

                        const items = Array.isArray(epi.item)
                            ? epi.item
                            : [epi.item].filter(Boolean);

                        items.forEach((item: any) => {
                            if (item.url_xml) {
                                xmlUrls.push(item.url_xml);
                            }
                        });
                    }
                });
            }
        });
    });

    return xmlUrls;
}


async function getXmlContent(url: string): Promise<string> {
    const response = await fetch(url, {
        headers: {
            'Accept': 'application/xml',
        },
    });
    const data = await response.text();
    return data;
}

async function main() {
    const date = new Date();
    const urls = await getXmlUrls(date);
    console.log('Matching XML URLs:', urls);

    if (urls.length === 0) return;

    const xmlContent = await getXmlContent(urls[0]);

    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
    });
    const parsedXml = parser.parse(xmlContent);

    const tables = Array.isArray(parsedXml.documento?.texto?.table)
        ? parsedXml.documento.texto.table
        : [parsedXml.documento?.texto?.table].filter(Boolean);

    console.log('Tables found:', tables.length);

    const TARGET_TABLE = 'Picaduras de pipa';

    tables.forEach((table: any) => {
        // Handle different possible structures of caption
        const captionObj = table.caption;
        console.log('Caption:', captionObj.p['#text']);
        let captionText = '';

        if (typeof captionObj === 'string') {
            captionText = captionObj;
        } else if (captionObj?.p) {
            captionText = typeof captionObj.p === 'string' ? captionObj.p : captionObj.p['#text'] || '';
        }

        if (captionText.toLowerCase().includes(TARGET_TABLE.toLowerCase())) {
            console.log(`\n=== Found Table: ${captionText} ===`);

            const rows = Array.isArray(table.tbody?.tr)
                ? table.tbody.tr
                : [table.tbody?.tr].filter(Boolean);

            rows.forEach((row: any) => {
                const cells = Array.isArray(row.td) ? row.td : [row.td].filter(Boolean);
                if (cells.length >= 2) {
                    const name = typeof cells[0] === 'string' ? cells[0] : cells[0]?.['#text'] || 'Unknown';
                    const price = typeof cells[1] === 'string' ? cells[1] : cells[1]?.['#text'] || 'N/A';
                    console.log(`${name.padEnd(50)} | ${price}`);
                }
            });
        }
    });
}

main();