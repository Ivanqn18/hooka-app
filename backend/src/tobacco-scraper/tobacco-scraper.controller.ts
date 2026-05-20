import { Controller, Get, Post, Delete, Query, Body, Param, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HookymiaSeedService } from './services/hookymia-seed/hookymia-seed.service';
import { BoeScannerService } from './services/boe-scanner/boe-scanner.service';
import { XmlCatalogService } from './services/xml-catalog/xml-catalog.service';

@Controller('tobaccos')
export class TobaccoScraperController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly seedService: HookymiaSeedService,
    private readonly boeScanner: BoeScannerService,
    private readonly xmlCatalog: XmlCatalogService,
  ) { }

  // GET /tobaccos (Endpoint para la App Web Frontend -> El catalogo, con paginación)
  @Get()
  async getCatalog(
    @Query('brand') brandName?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 12;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (brandName) {
      where.name = { contains: brandName, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      this.prisma.brand.findMany({
        where,
        include: {
          tastes: {
            include: { formats: true }
          }
        },
        orderBy: { name: 'asc' },
        skip,
        take: limitNum,
      }),
      this.prisma.brand.count({ where }),
    ]);

    return {
      data,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  // GET /tobaccos/search?q=mint  (Autocomplete para ingredientes)
  @Get('search')
  async searchTastes(@Query('q') q?: string) {
    if (!q || q.length < 2) return [];

    const tastes = await this.prisma.taste.findMany({
      where: {
        name: { contains: q, mode: 'insensitive' },
      },
      include: {
        brand: { select: { name: true } },
        formats: true,
      },
      take: 20,
      orderBy: { name: 'asc' },
    });

    return tastes.map((t: any) => ({
      id: t.id,
      nombre: t.name,
      marca: t.brand?.name || 'Desconocida',
      formats: t.formats || [],
    }));
  }

  // GET /tobaccos/light-catalog (Lee marcas y sabores directamente del tabacosxml.xml)
  @Get('light-catalog')
  getLightCatalog() {
    return this.xmlCatalog.getLightCatalog();
  }

  // GET /tobaccos/brands (Retorna todas las marcas ordenadas alfabéticamente)
  @Get('brands')
  async getBrands() {
    return this.prisma.brand.findMany({
      orderBy: { name: 'asc' },
    });
  }

  // POST /tobaccos/seed
  @Post('seed')
  async forceSeed() {
    return this.seedService.scrapeAndSeed();
  }

  // POST /tobaccos/clear
  @Post('clear')
  async clearDb() {
    await this.prisma.tasteFormat.deleteMany();
    await this.prisma.taste.deleteMany();
    await this.prisma.brand.deleteMany();
    return { message: 'Tobaccos cleared from database' };
  }

  // POST /tobaccos/scan-boe
  @Post('scan-boe')
  async forceBoeScan() {
    const added = await this.boeScanner.parseNewTobaccoPrices();
    return { message: 'Escaneo forzado terminado', addedTastes: added };
  }

  // POST /tobaccos/brands
  @Post('brands')
  async createBrand(@Body('name') name: string) {
    if (!name) {
      throw new BadRequestException('El nombre de la marca es requerido');
    }
    return this.prisma.brand.create({
      data: { name },
    });
  }

  // DELETE /tobaccos/brands/:id
  @Delete('brands/:id')
  async deleteBrand(@Param('id', ParseIntPipe) id: number) {
    return this.prisma.brand.delete({
      where: { id },
    });
  }

  // POST /tobaccos/tastes
  @Post('tastes')
  async createTaste(
    @Body('name') name: string,
    @Body('brandId') brandId: number,
    @Body('linea') linea?: string,
    @Body('descripcion') descripcion?: string,
  ) {
    if (!name || !brandId) {
      throw new BadRequestException('El nombre del sabor y el brandId son requeridos');
    }
    return this.prisma.taste.create({
      data: {
        name,
        brandId,
        linea,
        descripcion,
      },
    });
  }

  // DELETE /tobaccos/tastes/:id
  @Delete('tastes/:id')
  async deleteTaste(@Param('id', ParseIntPipe) id: number) {
    return this.prisma.taste.delete({
      where: { id },
    });
  }
}
