import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as cheerio from 'cheerio';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class BoeScannerService {
  private readonly logger = new Logger(BoeScannerService.name);
  // Búsqueda del BOE filtrando por "Resolución de la Presidencia del Comisionado para el Mercado de Tabacos"
  // Y el año dinámico (desde 2024 adelante).
  private readonly boeSearchBaseUrl =
    'https://www.boe.es/buscar/boe.php?campo%5B0%5D=ORI&dato%5B0%5D=Comisionado+para+el+Mercado+de+Tabacos&operador%5B0%5D=and&campo%5B1%5D=TIT&dato%5B1%5D=precios+de+las+labores+de+tabaco&operador%5B1%5D=and&campo%5B2%5D=DEM&dato%5B2%5D=&operador%5B2%5D=and&campo%5B3%5D=DOC&dato%5B3%5D=&operador%5B3%5D=and&campo%5B4%5D=NBO&dato%5B4%5D=&operador%5B4%5D=and&campo%5B5%5D=FPU&dato%5B5%5D=20240101%2D20261231&operador%5B5%5D=and&page_hits=50&sort_field%5B0%5D=FPU&sort_order%5B0%5D=desc&accion=Buscar';

  constructor(private prisma: PrismaService) { }

  @Cron('0 17 * * 5') // Se ejecuta todos los viernes a las 17:00
  async parseNewTobaccoPrices(): Promise<number> {
    let addedTastes = 0;
    this.logger.log('Iniciando exploración del BOE (Viernes actual)...');

    // Fechas a buscar (Solo el viernes actual)
    const fridays: Date[] = [];
    const d = new Date();
    // Ajustar 'd' al viernes más reciente (hoy si es viernes, o el anterior)
    while (d.getDay() !== 5) {
      d.setDate(d.getDate() - 1);
    }
    fridays.push(new Date(d.getTime()));

    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    try {
      const interceptAndFetchXmlText = async (targetUrl: string) => {
        try {
          const res = await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
          if (res) return await res.text();
        } catch (e) {
          this.logger.error(`Error nav to ${targetUrl}`, e);
        }
        return "";
      };

      for (const date of fridays) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const fDate = `${y}${m}${day}`;

        const summaryUrl = `https://www.boe.es/diario_boe/xml.php?id=BOE-S-${fDate}`;
        this.logger.log(`Consultando sumario: ${summaryUrl}`);

        const xmlText = await interceptAndFetchXmlText(summaryUrl);
        this.logger.log(`XML Text snippet: ${xmlText.substring(0, 100)}`);

        if (!xmlText || xmlText.includes('errorParametros') || xmlText.includes('Captcha')) {
          this.logger.error('WAF block or empty XML detected');
          continue;
        }

        const $ = cheerio.load(xmlText, { xmlMode: true });
        let docUrl = "";
        $('item').each((_, el) => {
          const titulo = $(el).find('titulo').text()?.toLowerCase() || '';
          if (titulo.includes('precios') && titulo.includes('tabaco')) {
            docUrl = $(el).find('url_xml').first().text().trim();
          }
        });

        if (docUrl) {
          const fullXmlUrl = docUrl.startsWith('http') ? docUrl : `https://www.boe.es${docUrl}`;
          this.logger.log(`Encontrada resolución: ${fullXmlUrl}`);
          // Enviar a la otra función (usa fetch HTML normal/txt. Ojo: La antigua usa .txt)
          const txtUrl = fullXmlUrl.replace('xml.php', 'txt.php').replace('/diario_boe/xml/', '');
          addedTastes += await this.readBoeAndExtractShisha(page, txtUrl);
        }
      }
    } catch (error) {
      this.logger.error('Error parseando BOE por fechas', error);
    } finally {
      await browser.close();
    }

    return addedTastes;
  }

  private async readBoeAndExtractShisha(
    page: any,
    urlTxt: string,
  ): Promise<number> {
    this.logger.log(`>> Leyendo resolución en texto plano: ${urlTxt}`);
    try {
      await page.goto(urlTxt, { waitUntil: 'domcontentloaded' });
      const html = await page.content();
      const $ = cheerio.load(html);
      const textContent = $('#textoxslt').text(); // el contenedor de texto principal del BOE

      // Regex o partición manual
      // El BOE suele estructurarse así: "C) Picadura para pipa de agua \n Marca Sabor (50g)... 3,50"
      // Buscamos la keyword clave
      const startToken = 'Picadura para pipa de agua';
      const startIndex = textContent.indexOf(startToken);
      if (startIndex === -1) {
        // No hay tabaco de shisha en este boletín
        return 0;
      }

      // We just parse from the start token to the end of the text
      const picaduraBlock = textContent.substring(startIndex);

      // Vamos a procesar línea a línea el bloque C) para intentar captar "Marca Sabor" -> "Precio"
      const lines = picaduraBlock
        .split('\n')
        .map((l) => l.trim())
        .filter(
          (l) =>
            l.length > 5 &&
            !l.toLowerCase().includes('picadura') &&
            !l.includes('Euros'),
        );

      let addedInThisBoe = 0;
      for (const line of lines) {
        // Stop parsing if we hit the next section, usually starting with a single capital letter and parentheses like D) or E)
        if (/^[A-Z]\)/.test(line)) break;

        // Heuristica: [Nombre largo de marca y sabor] [Formato g] [Precio]
        // Ejemplo: "Al Fakher The Double Apple (50 g) ..................... 3,50"
        const match = line.match(/(.+?)\s*\(([\d,.]+)\s*g\).*?([\d,]+)$/i);
        if (match) {
          const fullName = match[1].trim();
          const grams = match[2].trim().replace(',', '.');

          // Separamos groseramente Marca y Sabor por el primer espacio.
          // Ej "Adalya Hawaii" -> Marca "Adalya", Sabor "Hawaii"
          const words = fullName.split(' ');

          // Especial para SAYes!, 187 Tobacco, etc.
          let brandGuess = words[0];
          let flavorGuess = fullName.substring(brandGuess.length).trim();

          const lowerName = fullName.toLowerCase();
          if (lowerName.startsWith('sayes!') || lowerName.startsWith('say es!')) {
            brandGuess = 'SAYes!';
            flavorGuess = fullName.substring(fullName.indexOf('!') + 1).trim();
          } else if (lowerName.startsWith('al fakher')) {
            brandGuess = 'Al Fakher';
            flavorGuess = fullName.substring(9).trim();
          } else if (lowerName.startsWith('187 tobacco') || lowerName.startsWith('187 strassenbande')) {
            brandGuess = '187 Tobacco';
            flavorGuess = fullName.substring(words[0].length + words[1].length + 1).trim();
          } else if (lowerName.startsWith('aqua mentha')) {
            brandGuess = 'Aqua Mentha';
            flavorGuess = fullName.substring(11).trim();
          } else if (words.length > 2 && (words[0].toLowerCase() === 'al' || words[0].toLowerCase() === 'hookah')) {
            brandGuess = `${words[0]} ${words[1]}`;
            flavorGuess = fullName.substring(brandGuess.length).trim();
          }

          if (brandGuess && flavorGuess) {
            const priceStr = match[3].replace(',', '.');
            const price = parseFloat(priceStr);

            const success = await this.injectToPrisma(brandGuess, flavorGuess, price, grams);
            if (success) addedInThisBoe++;
          }
        }
      }

      return addedInThisBoe;
    } catch (e) {
      this.logger.warn(`No se pudo leer ${urlTxt}`);
      return 0;
    }
  }

  private async injectToPrisma(
    brandName: string,
    flavorName: string,
    price?: number,
    grams?: string,
  ): Promise<boolean> {
    try {
      const brandInfo = await this.prisma.brand.upsert({
        where: { name: brandName },
        update: {},
        create: { name: brandName },
      });

      let existingTaste = await this.prisma.taste.findFirst({
        where: { name: flavorName, brandId: brandInfo.id },
      });

      if (!existingTaste) {
        existingTaste = await this.prisma.taste.create({
          data: {
            name: flavorName,
            brandId: brandInfo.id,
            linea: 'Standard',
            descripcion: 'Añadido desde BOE Scanner',
          },
        });
      } else {
        await this.prisma.taste.update({
          where: { id: existingTaste.id },
          data: { descripcion: 'Actualizado vía BOE Scanner' },
        });
      }

      if (price !== undefined) {
        const formatString = grams ? `${grams}g` : '50g';

        const existingFormat = await this.prisma.tasteFormat.findFirst({
          where: { tasteId: existingTaste.id, formato: formatString }
        });

        if (!existingFormat) {
          await this.prisma.tasteFormat.create({
            data: {
              tasteId: existingTaste.id,
              formato: formatString,
              precio: price,
            }
          });
        } else {
          await this.prisma.tasteFormat.update({
            where: { id: existingFormat.id },
            data: { precio: price }
          });
        }
      }

      return true;
    } catch (e) {
      return false;
    }
  }
}
