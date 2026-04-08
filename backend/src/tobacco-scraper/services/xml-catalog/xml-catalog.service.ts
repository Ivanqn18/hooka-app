import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { XMLParser } from 'fast-xml-parser';

export interface XmlBrandCatalog {
  name: string;
  tastes: string[];
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

    // Candidatos de ruta: buscamos desde process.cwd() (backend/) y con __dirname
    const candidates = [
      path.resolve(process.cwd(), '..', 'tabacosxml.xml'),          // backend/ -> HookaApp/tabacosxml.xml
      path.resolve(process.cwd(), 'tabacosxml.xml'),                 // si cwd es ya HookaApp/
      path.resolve(__dirname, '..', '..', '..', '..', '..', 'tabacosxml.xml'), // desde dist profundo
      path.resolve(__dirname, '..', '..', '..', '..', 'tabacosxml.xml'),       // fallback
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
        const tastes = products
          .map((p: any) => (p.name ?? '').trim())
          .filter((n: string) => n.length > 0)
          .sort((a: string, b: string) => a.localeCompare(b));

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
