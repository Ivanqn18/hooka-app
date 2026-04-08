import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.user.create({ data });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        reviewsReceived: {
          include: {
            comprador: { select: { id: true, nombre: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        followers: { select: { followerId: true } },
        following: { select: { followingId: true } },
      },
    });

    if (!user) return null;

    let rating = 0;
    if (user.reviewsReceived && user.reviewsReceived.length > 0) {
      rating =
        user.reviewsReceived.reduce((acc, rev) => acc + rev.puntuacion, 0) /
        user.reviewsReceived.length;
    }

    return {
      ...user,
      rating,
      reviewCount: user.reviewsReceived.length,
    };
  }

  async getStats(id: number) {
    const mixesCount = await this.prisma.mix.count({ where: { autorId: id } });
    const activeProductsCount = await this.prisma.product.count({
      where: { vendedorId: id, estado: 'DISPONIBLE' },
    });

    // We could compute average review score for mixes or something, but this is a good start.
    return {
      totalMezclas: mixesCount,
      productosActivos: activeProductsCount,
    };
  }

  async update(id: number, data: any) {
    return this.prisma.user.update({
      where: { id },
      data: {
        nombre: data.nombre,
        avatarUrl: data.avatarUrl,
        bio: data.bio,
      },
    });
  }

  // --- STASH ---
  async getStash(usuarioId: number) {
    return this.prisma.userStash.findMany({
      where: { usuarioId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addStash(data: {
    usuarioId: number;
    nombreTabaco: string;
    marca?: string;
    tipo: 'HAVE' | 'WANT';
  }) {
    return this.prisma.userStash.create({
      data: {
        usuarioId: data.usuarioId,
        nombreTabaco: data.nombreTabaco,
        marca: data.marca,
        tipo: data.tipo,
      },
    });
  }

  // --- REVIEWS MERCADILLO ---
  async addSellerReview(
    vendedorId: number,
    data: { compradorId: number; puntuacion: number; comentario?: string },
  ) {
    return this.prisma.sellerReview.create({
      data: {
        vendedorId,
        compradorId: data.compradorId,
        puntuacion: data.puntuacion,
        comentario: data.comentario,
      },
    });
  }

  async removeStash(id: number) {
    return this.prisma.userStash.delete({
      where: { id },
    });
  }

  // --- FOLLOWERS ---
  async toggleFollow(followerId: number, followingId: number) {
    if (followerId === followingId) {
      throw new Error("No puedes seguirte a ti mismo");
    }

    const existing = await this.prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existing) {
      await this.prisma.userFollow.delete({
        where: {
          followerId_followingId: {
            followerId,
            followingId,
          },
        },
      });
      return { following: false };
    } else {
      await this.prisma.userFollow.create({
        data: {
          followerId,
          followingId,
        },
      });
      return { following: true };
    }
  }
}
