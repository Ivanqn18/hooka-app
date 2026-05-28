import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { XMLParser } from 'fast-xml-parser';
import { PrismaService } from '../../../prisma/prisma.service';

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

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Devuelve el catálogo de marcas y sabores leído de la base de datos.
   * Si la base de datos está vacía, lee e inserta el XML base de forma asíncrona.
   */
  async getLightCatalog(): Promise<XmlBrandCatalog[]> {
    // 1. Intentamos leer de la base de datos
    const dbBrands = await this.prisma.brand.findMany({
      include: {
        tastes: {
          include: {
            formats: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    if (dbBrands.length >= 50) {
      return dbBrands.map((b) => {
        const tastes = b.tastes.map((t) => {
          const formats = t.formats.map((f) => ({
            grams: f.formato,
            price: f.precio.toString(),
          }));

          // Ordenar formatos por gramos (ascendente)
          formats.sort((a, b) => {
            const ga = parseInt(a.grams) || 0;
            const gb = parseInt(b.grams) || 0;
            return ga - gb;
          });

          return {
            name: t.name,
            formats,
          };
        });

        // Ordenar sabores alfabéticamente
        tastes.sort((a, b) => a.name.localeCompare(b.name));

        return {
          name: b.name,
          tastes,
        };
      });
    }

    // 2. Si la base de datos está vacía o incompleta, leemos del XML, la poblamos y retornamos el XML parseado
    this.logger.log('Base de datos de tabacos vacía o incompleta. Iniciando carga/auto-seed desde tabacosxml.xml...');
    const xmlBrands = this.parseXmlCatalog();
    if (xmlBrands.length > 0) {
      // Lanzamos el semillado en segundo plano sin bloquear el hilo principal de la petición
      this.seedDbFromXml(xmlBrands).catch((err) => {
        this.logger.error('Error semillando base de datos en segundo plano:', err);
      });
    }
    return xmlBrands;
  }

  /**
   * Parseador interno de XML para fallback
   */
  private parseXmlCatalog(): XmlBrandCatalog[] {
    const candidates = [
      path.resolve(process.cwd(), 'tabacosxml.xml'),
      path.resolve(__dirname, '..', '..', '..', '..', 'tabacosxml.xml'),
    ];

    const xmlPath = candidates.find((p) => fs.existsSync(p)) ?? '';

    if (!xmlPath) {
      this.logger.warn(
        `tabacosxml.xml no encontrado. Rutas probadas: ${candidates.join(', ')}`,
      );
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

    const catalog = brands
      .filter((b: any) => b.name)
      .map((b: any) => {
        const products: any[] = Array.isArray(b.product)
          ? b.product
          : b.product
            ? [b.product]
            : [];
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

        const tastes: XmlTaste[] = Array.from(tasteMap.values()).sort((a, b) =>
          a.name.localeCompare(b.name),
        );

        // Ordenar formatos por gramos (ascendente)
        tastes.forEach((t) => {
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
      `XML cargado para fallback: ${catalog.length} marcas, ` +
        `${catalog.reduce((acc, b) => acc + b.tastes.length, 0)} sabores.`,
    );

    return catalog;
  }

  /**
   * Poblado automático en segundo plano desde el catálogo de fallback XML
   */
  private async seedDbFromXml(brands: XmlBrandCatalog[]) {
    this.logger.log(`Semillando ${brands.length} marcas en la base de datos...`);
    for (const b of brands) {
      try {
        const brandDb = await this.prisma.brand.upsert({
          where: { name: b.name },
          update: {},
          create: { name: b.name },
        });

        for (const t of b.tastes) {
          let tasteDb = await this.prisma.taste.findFirst({
            where: { name: t.name, brandId: brandDb.id },
          });

          if (!tasteDb) {
            tasteDb = await this.prisma.taste.create({
              data: {
                name: t.name,
                brandId: brandDb.id,
                linea: 'Standard',
                descripcion: 'Cargado desde XML base',
              },
            });
          }

          for (const f of t.formats) {
            const formatDb = await this.prisma.tasteFormat.findFirst({
              where: { tasteId: tasteDb.id, formato: f.grams },
            });

            if (!formatDb) {
              await this.prisma.tasteFormat.create({
                data: {
                  tasteId: tasteDb.id,
                  formato: f.grams,
                  precio: parseFloat(f.price.replace(',', '.')),
                },
              });
            }
          }
        }
      } catch (err) {
        this.logger.error(`Error semillando marca ${b.name} desde XML`, err);
      }
    }
    this.logger.log('Semillado automático desde XML completado con éxito.');
  }

  /** Invalida el caché (mantenida por retrocompatibilidad) */
  invalidateCache() {
    // No-op ya que consultamos directamente de la base de datos
  }
}
