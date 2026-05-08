import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { XMLParser } from 'fast-xml-parser';

export interface XmlFormat {
  grams: string;
  price: string;
}

export interface XmlTaste {
  name: string;
  formats: XmlFormat[];
}

export interface XmlBrandCatalog {
  name: string;
  tastes: XmlTaste[];
}

@Injectable()
export class XmlCatalogService {
  private readonly logger = new Logger(XmlCatalogService.name);
  private cachedCatalog: XmlBrandCatalog[] | null = null;

  /**
   * Devuelve el catálogo de marcas y sabores leído directamente del XML.
   * El resultado se cachea en memoria para evitar leer el fichero en cada petición.
   */
  getLightCatalog(): XmlBrandCatalog[] {
    if (this.cachedCatalog) return this.cachedCatalog;

    // Candidatos de ruta: buscamos desde process.cwd() (backend/ o /app) y con __dirname
    const candidates = [
      path.resolve(process.cwd(), 'tabacosxml.xml'),
      path.resolve(__dirname, '..', '..', '..', '..', 'tabacosxml.xml'),
    ];

    const xmlPath = candidates.find(p => fs.existsSync(p)) ?? '';

    if (!xmlPath) {
      this.logger.warn(`tabacosxml.xml no encontrado. Rutas probadas: ${candidates.join(', ')}`);
      return [];
    }

    this.logger.log(`Leyendo tabacosxml.xml desde: ${xmlPath}`);

    const rawXml = fs.readFileSync(xmlPath, 'utf-8');

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      isArray: (tagName) => tagName === 'brand' || tagName === 'product',
    });

    let parsed: any;
    try {
      parsed = parser.parse(rawXml);
    } catch (err) {
      this.logger.error('Error al parsear tabacosxml.xml', err);
      return [];
    }

    const brands: any[] = parsed?.shisha_tobaccos?.brand ?? [];

    this.cachedCatalog = brands
      .filter((b: any) => b.name)
      .map((b: any) => {
        const products: any[] = Array.isArray(b.product) ? b.product : b.product ? [b.product] : [];
        const tasteMap = new Map<string, XmlTaste>();

        products.forEach((p: any) => {
          const fullName = (p.name ?? '').trim();
          const price = (p.price ?? '').trim();
          if (!fullName) return;

          // Extraer sabor y gramos: "Nombre (200 g)" -> "Nombre" y "200 g"
          const match = fullName.match(/(.+?)\s*\(([\d,.]+)\s*g\)/i);
          const flavorName = match ? match[1].trim() : fullName;
          const grams = match ? `${match[2].trim()}g` : 'N/A';

          if (!tasteMap.has(flavorName)) {
            tasteMap.set(flavorName, { name: flavorName, formats: [] });
          }
          tasteMap.get(flavorName)!.formats.push({ grams, price });
        });

        const tastes: XmlTaste[] = Array.from(tasteMap.values())
          .sort((a, b) => a.name.localeCompare(b.name));

        // Ordenar formatos por gramos (ascendente)
        tastes.forEach(t => {
          t.formats.sort((a, b) => {
            const ga = parseInt(a.grams) || 0;
            const gb = parseInt(b.grams) || 0;
            return ga - gb;
          });
        });

        return {
          name: (b.name as string).trim(),
          tastes,
        };
      })
      .filter((b: XmlBrandCatalog) => b.tastes.length > 0)
      .sort((a, b) => a.name.localeCompare(b.name));

    this.logger.log(
      `XML cargado: ${this.cachedCatalog.length} marcas, ` +
      `${this.cachedCatalog.reduce((acc, b) => acc + b.tastes.length, 0)} sabores.`,
    );

    return this.cachedCatalog;
  }

  /** Invalida el caché (útil si el XML se recarga en caliente) */
  invalidateCache() {
    this.cachedCatalog = null;
  }
}
