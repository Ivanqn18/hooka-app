import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MarketplaceService {
  constructor(private prisma: PrismaService) {}

  createProduct(data: any) {
    return this.prisma.product.create({ data });
  }

  async findAllProducts(query?: any) {
    const {
      lat,
      lng,
      radius,
      page: rawPage,
      limit: rawLimit,
      ...restQuery
    } = query || {};

    const page = rawPage ? parseInt(rawPage, 10) : 1;
    const limit = rawLimit ? parseInt(rawLimit, 10) : 12;
    const skip = (page - 1) * limit;

    // Si hay filtro geográfico, necesitamos todos los resultados primero
    // para filtrar por Haversine, luego paginar manualmente
    if (lat && lng && radius) {
      let products = await this.prisma.product.findMany({
        where: restQuery,
        include: {
          seller: {
            select: {
              id: true,
              nombre: true,
              avatarUrl: true,
              reviewsReceived: { select: { puntuacion: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      products = products.map((p) => this.addSellerRating(p));

      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const radKm = parseFloat(radius);

      products = products.filter((p) => {
        if (!p.latitud || !p.longitud) return false;
        return (
          this.haversineDistance(
            userLat,
            userLng,
            Number(p.latitud),
            Number(p.longitud),
          ) <= radKm
        );
      });

      const total = products.length;
      const paginatedData = products.slice(skip, skip + limit);

      return {
        data: paginatedData,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    }

    // Sin filtro geográfico: paginación directa con Prisma
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where: restQuery,
        include: {
          seller: {
            select: {
              id: true,
              nombre: true,
              avatarUrl: true,
              reviewsReceived: { select: { puntuacion: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where: restQuery }),
    ]);

    const data = products.map((p) => this.addSellerRating(p));

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  findOneProduct(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        seller: { select: { id: true, nombre: true, avatarUrl: true } },
      },
    });
  }

  updateProduct(id: number, data: any) {
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  removeProduct(id: number) {
    return this.prisma.product.delete({ where: { id } });
  }

  // Helper: Añadir rating calculado al seller
  private addSellerRating(product: any) {
    let sellerRating = 0;
    const reviewCount = product.seller.reviewsReceived.length;
    if (reviewCount > 0) {
      sellerRating =
        product.seller.reviewsReceived.reduce(
          (acc: number, rev: any) => acc + rev.puntuacion,
          0,
        ) / reviewCount;
    }
    return {
      ...product,
      seller: {
        ...product.seller,
        rating: sellerRating,
        reviewCount,
      },
    };
  }

  // Helper: Fórmula Haversine
  private haversineDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
