import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async findAll(limit: number, page: number) {
    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: 'desc' },
        // Excluimos el password del resultado por seguridad
        select: {
          id: true,
          email: true,
          nombre: true,
          avatarUrl: true,
          isAdmin: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count(),
    ]);

    // Devolvemos un objeto que el frontend puede procesar con su función `extractData`
    return {
      data: users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(data: any) {
    return this.prisma.user.create({ data });
  }

  async getProfile(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        followers: true,
        following: true,
        reviewsReceived: {
          include: { comprador: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (user) {
      // Removemos la contraseña de la respuesta por seguridad
      delete (user as any).password;

      // Calculamos la puntuación media (rating) al vuelo
      const reviews = (user as any).reviewsReceived || [];
      const totalScore = reviews.reduce((acc: number, rev: any) => acc + (rev.puntuacion || 0), 0);
      (user as any).rating = reviews.length > 0 ? totalScore / reviews.length : 0;
      (user as any).reviewCount = reviews.length;
    }
    return user;
  }

  async getUserStats(id: number) {
    try {
      const totalMezclas = await this.prisma.mix.count({ where: { autorId: id } });
      const productosActivos = await this.prisma.product.count({ where: { vendedorId: id } });
      return { totalMezclas, productosActivos };
    } catch (e) {
      return { totalMezclas: 0, productosActivos: 0 };
    }
  }
}