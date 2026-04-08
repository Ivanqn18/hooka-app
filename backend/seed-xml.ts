import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { XMLParser } from 'fast-xml-parser';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando carga de tabacos desde XML...');
  
  console.log('Borrando catálogo anterior de tabacos para dejar solo los del XML...');
  await prisma.brand.deleteMany({});
  console.log('Catálogo anterior borrado.');
  
  // 1. Leer archivo XML
  const xmlPath = path.resolve(__dirname, '../tabacosxml.xml');
  if (!fs.existsSync(xmlPath)) {
    console.error(`No se encuentra el archivo XML en: ${xmlPath}`);
    process.exit(1);
  }
  
  const xmlData = fs.readFileSync(xmlPath, 'utf8');
  
  // 2. Configurar el parser para que los atributos sean accesibles (para extraer <brand name="X">)
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_"
  });
  
  const result = parser.parse(xmlData);
  
  if (!result.shisha_tobaccos || !result.shisha_tobaccos.brand) {
    console.error('El formato del XML no es el esperado. Se esperaba <shisha_tobaccos><brand>...');
    process.exit(1);
  }
  
  // 3. Procesar las marcas (asegurando que siempre sea un array aunque solo haya una etiqueta)
  const brands = Array.isArray(result.shisha_tobaccos.brand) 
    ? result.shisha_tobaccos.brand 
    : [result.shisha_tobaccos.brand];
    
  let brandCount = 0;
  let productCount = 0;
  
  for (const b of brands) {
    const brandName = b['@_name'];
    if (!brandName) continue;
    
    // Insertar o recuperar Marca en la BDD
    const brandDb = await prisma.brand.upsert({
      where: { name: brandName },
      update: {},
      create: { name: brandName }
    });
    brandCount++;
    console.log(`\nMarca procesada: ${brandName}`);
    
    // Procesar los productos (si existen)
    if (!b.product) continue;
    
    const products = Array.isArray(b.product) ? b.product : [b.product];
    
    for (const p of products) {
      const fullProductName = p['@_name']; // Ej: "Nash Bali (100 g)"
      const priceStr = p['@_price']; // Ej: "15,95"
      
      if (!fullProductName || !priceStr) continue;
      
      // Parsear nombre, gramaje y precio
      // Se asume el formato: Nombre del Sabor (XX g)
      const match = fullProductName.match(/(.+?)\s*\(([\d,.]+)\s*g\)/i);
      let flavorName = fullProductName;
      let gramsStr = '50g'; // Default fallback
      
      if (match) {
        // En tu XML a veces el nombre del producto incluye la marca al principio, vamos a intentar limpiarlo
        // Ej: "Nash Bali" -> Si la marca es "Nash", el sabor puro es "Bali"
        let rawFlavor = match[1].trim();
        if (rawFlavor.toLowerCase().startsWith(brandName.toLowerCase())) {
            rawFlavor = rawFlavor.substring(brandName.length).trim();
        }
        
        flavorName = rawFlavor || match[1].trim(); 
        gramsStr = `${match[2].trim().replace(',', '.')}g`;
      }
      
      const price = parseFloat(priceStr.replace(',', '.'));
      
      // Insertar o recuperar Sabor (Taste)
      // Buscamos si ya existe el sabor para esa marca
      let tasteDb = await prisma.taste.findFirst({
        where: { name: flavorName, brandId: brandDb.id }
      });
      
      if (!tasteDb) {
        tasteDb = await prisma.taste.create({
          data: {
            name: flavorName,
            brandId: brandDb.id,
            linea: 'Standard',
            descripcion: 'Cargado desde XML base'
          }
        });
      }
      
      // Añadir o actualizar el formato y precio
      const formatDb = await prisma.tasteFormat.findFirst({
        where: { tasteId: tasteDb.id, formato: gramsStr }
      });
      
      if (!formatDb) {
        await prisma.tasteFormat.create({
          data: {
            tasteId: tasteDb.id,
            formato: gramsStr,
            precio: price
          }
        });
      } else {
        await prisma.tasteFormat.update({
          where: { id: formatDb.id },
          data: { precio: price }
        });
      }
      
      productCount++;
    }
  }
  
  console.log('\n=============================================');
  console.log('CARGA COMPLETADA CON ÉXITO');
  console.log(`Marcas creadas/verificadas: ${brandCount}`);
  console.log(`Formatos (Productos) importados: ${productCount}`);
  console.log('=============================================');
}

main()
  .catch((e) => {
    console.error('Error durante la ejecución del script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
