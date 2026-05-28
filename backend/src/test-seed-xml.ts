import * as fs from 'fs';
import * as path from 'path';
import { XMLParser } from 'fast-xml-parser';

function main() {
  const xmlPath = path.resolve(__dirname, '../tabacosxml.xml');
  if (!fs.existsSync(xmlPath)) {
    console.error(`No se encuentra el archivo XML en: ${xmlPath}`);
    return;
  }
  
  const xmlData = fs.readFileSync(xmlPath, 'utf8');
  
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_"
  });
  
  const result = parser.parse(xmlData);
  const brands = Array.isArray(result.shisha_tobaccos.brand) 
    ? result.shisha_tobaccos.brand 
    : [result.shisha_tobaccos.brand];
    
  console.log(`Encontradas ${brands.length} marcas en el XML.`);
  
  let index = 0;
  for (const b of brands) {
    index++;
    const brandName = b['@_name'];
    if (!brandName) {
      console.log(`[${index}] Marca sin nombre`);
      continue;
    }
    
    // Simular procesamiento de productos
    if (!b.product) {
      console.log(`[${index}] Marca: ${brandName} (0 productos)`);
      continue;
    }
    
    const products = Array.isArray(b.product) ? b.product : [b.product];
    console.log(`[${index}] Marca: ${brandName} (${products.length} productos)`);
    
    for (const p of products) {
      const fullProductName = p['@_name'];
      const priceStr = p['@_price'];
      
      if (!fullProductName || !priceStr) {
        console.warn(`  Producto omitido por datos incompletos en marca ${brandName}`);
        continue;
      }
      
      const price = parseFloat(priceStr.replace(',', '.'));
      if (isNaN(price)) {
        console.error(`  ERROR: Precio inválido para ${fullProductName}: "${priceStr}"`);
      }
    }
  }
}

main();
