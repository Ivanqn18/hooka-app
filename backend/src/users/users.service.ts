import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddSellerReviewDto } from './dto/user-actions.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (user) {
      // Removemos la contraseña de la respuesta por seguridad
      delete (user as any).password;

      // Calculamos la puntuación media (rating) al vuelo
      const reviews = (user as any).reviewsReceived || [];
      const totalScore = reviews.reduce(
        (acc: number, rev: any) => acc + (rev.puntuacion || 0),
        0,
      );
      (user as any).rating =
        reviews.length > 0 ? totalScore / reviews.length : 0;
      (user as any).reviewCount = reviews.length;
    }
    return user;
  }

  async getUserStats(id: number) {
    try {
      const totalMezclas = await this.prisma.mix.count({
        where: { autorId: id },
      });
      const productosActivos = await this.prisma.product.count({
        where: { vendedorId: id },
      });
      return { totalMezclas, productosActivos };
    } catch (e) {
      return { totalMezclas: 0, productosActivos: 0 };
    }
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

  async remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  // ========== STASH ==========

  async getStash(userId: number) {
    return this.prisma.userStash.findMany({
      where: { usuarioId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addStash(data: any) {
    const normalizedNombre = data.nombreTabaco.trim();
    const normalizedMarca =
      data.marca && data.marca.trim() !== '' ? data.marca.trim() : null;

    // Obtener los elementos actuales del stash del usuario
    const stashItems = await this.prisma.userStash.findMany({
      where: { usuarioId: data.usuarioId },
    });

    // Buscar duplicados (sin importar mayúsculas/minúsculas ni espacios)
    const duplicate = stashItems.find(
      (item) =>
        item.nombreTabaco.trim().toLowerCase() ===
          normalizedNombre.toLowerCase() &&
        (item.marca || '').trim().toLowerCase() ===
          (normalizedMarca || '').toLowerCase(),
    );

    if (duplicate) {
      if (duplicate.tipo === data.tipo) {
        if (data.tipo === 'HAVE') {
          throw new BadRequestException('Este tabaco ya está en tu estantería');
        } else {
          throw new BadRequestException(
            'Este tabaco ya está en tu lista de deseos',
          );
        }
      } else {
        if (data.tipo === 'HAVE') {
          throw new BadRequestException(
            'Este tabaco ya está en tu lista de deseos. Quítalo de allí primero.',
          );
        } else {
          throw new BadRequestException(
            'Este tabaco ya está en tu estantería. ¡Ya lo tienes!',
          );
        }
      }
    }

    return this.prisma.userStash.create({
      data: {
        usuarioId: data.usuarioId,
        nombreTabaco: normalizedNombre,
        marca: normalizedMarca,
        tipo: data.tipo,
      },
    });
  }

  async removeStash(id: number) {
    return this.prisma.userStash.delete({
      where: { id },
    });
  }

  // ========== FOLLOW ==========

  async toggleFollow(followerId: number, followingId: number) {
    if (followerId === followingId) {
      return { following: false };
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
<<<<<<< HEAD
}
=======

  async addReview(vendedorId: number, dto: AddSellerReviewDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productoId },
    });
    if (!product) {
      throw new BadRequestException('El producto no existe');
    }
    if (product.vendedorId !== vendedorId) {
      throw new BadRequestException('El producto no pertenece a este vendedor');
    }
    if (product.compradorId !== dto.compradorId) {
      throw new BadRequestException('No tienes permiso para valorar a este vendedor por este producto');
    }
    if (
      product.transaccionEstado !== 'COMPLETADO' &&
      product.transaccionEstado !== 'DISPUTADO'
    ) {
      throw new BadRequestException(
        'Solo se puede valorar al vendedor una vez finalizada o disputada la transacción',
      );
    }

    const existingReview = await this.prisma.sellerReview.findUnique({
      where: { productoId: dto.productoId },
    });
    if (existingReview) {
      throw new BadRequestException('Ya has valorado este producto');
    }

    let finalPuntuacion = dto.puntuacion;
    if (product.transaccionEstado === 'DISPUTADO') {
      finalPuntuacion = 1;
    }

    if (finalPuntuacion < 1 || finalPuntuacion > 5) {
      throw new BadRequestException('La puntuación debe estar entre 1 y 5');
    }

    return this.prisma.sellerReview.create({
      data: {
        vendedorId,
        compradorId: dto.compradorId,
        productoId: dto.productoId,
        puntuacion: finalPuntuacion,
        comentario: dto.comentario,
      },
    });
  }
}
>>>>>>> 23202954326ed6932b777c1b7cea9b27029757ed
