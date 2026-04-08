import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MezclasService {
  constructor(private prisma: PrismaService) { }

  async create(createMezclaDto: any) {
    const { ingredientes, tagIds, ...datos } = createMezclaDto;

    return this.prisma.mix.create({
      data: {
        ...datos,
        ingredients: {
          create: ingredientes,
        },
        ...(tagIds && tagIds.length > 0
          ? {
            tags: {
              create: tagIds.map((tagId: number) => ({ tagId })),
            },
          }
          : {}),
      },
      include: { ingredients: true, tags: { include: { tag: true } } },
    });
  }

  async update(id: number, userId: number, updateMezclaDto: any) {
    const { ingredientes, tagIds, ...datos } = updateMezclaDto;

    const mezcla = await this.prisma.mix.findUnique({ where: { id } });
    if (!mezcla) throw new ForbiddenException('Mezcla no encontrada');
    if (mezcla.autorId !== userId) {
      throw new ForbiddenException('No tienes permiso para editar esta mezcla');
    }

    // Actualizar mezcla: borrar relaciones anteriores e insertar las nuevas
    await this.prisma.mixIngredient.deleteMany({ where: { mezclaId: id } });
    await this.prisma.mixTag.deleteMany({ where: { mezclaId: id } });

    return this.prisma.mix.update({
      where: { id },
      data: {
        ...datos,
        ingredients: {
          create: ingredientes,
        },
        ...(tagIds && tagIds.length > 0
          ? {
            tags: {
              create: tagIds.map((tagId: number) => ({ tagId })),
            },
          }
          : {}),
      },
      include: { ingredients: true, tags: { include: { tag: true } } },
    });
  }


  // 1.5 Obtener Mezcla de la Semana
  async getMezclaDeLaSemana() {
    const hace7Dias = new Date();
    hace7Dias.setDate(hace7Dias.getDate() - 7);

    const mezcla = await this.prisma.mix.findFirst({
      where: {
        createdAt: { gte: hace7Dias },
      },
      include: {
        ingredients: true,
        author: { select: { nombre: true, avatarUrl: true } },
        _count: { select: { likes: true, dislikes: true } },
        tags: { include: { tag: true } },
      },
      orderBy: {
        likes: { _count: 'desc' },
      },
    });

    return mezcla;
  }

  // 2. Obtener todas (paginado, con filtro por tag)
  async findAll(page = 1, limit = 12, tag?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (tag) {
      where.tags = {
        some: { tag: { nombre: tag } },
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.mix.findMany({
        where,
        include: {
          ingredients: true,
          author: {
            select: { nombre: true, avatarUrl: true },
          },
          _count: {
            select: { likes: true, dislikes: true },
          },
          tags: { include: { tag: true } },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.mix.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // 3. Obtener una por ID
  async findOne(id: number) {
    return this.prisma.mix.findUnique({
      where: { id },
      include: {
        ingredients: true,
        author: true,
        _count: {
          select: { likes: true, dislikes: true, comments: true },
        },
        tags: { include: { tag: true } },
      },
    });
  }

  // 4. Dar o Quitar Like
  async toggleLike(usuarioId: number, mezclaId: number) {
    const existingLike = await this.prisma.mixLike.findUnique({
      where: { usuarioId_mezclaId: { usuarioId, mezclaId } },
    });

    if (existingLike) {
      await this.prisma.mixLike.delete({
        where: { usuarioId_mezclaId: { usuarioId, mezclaId } },
      });
      return { liked: false };
    }

    // Al dar like, quitamos el dislike si existe
    await this.prisma.mixDislike.deleteMany({
      where: { usuarioId, mezclaId },
    });

    await this.prisma.mixLike.create({
      data: { usuarioId, mezclaId },
    });

    // Notificar al creador de la mezcla
    const mezcla = await this.prisma.mix.findUnique({
      where: { id: mezclaId },
      select: { autorId: true, titulo: true },
    });
    if (mezcla && mezcla.autorId && mezcla.autorId !== usuarioId) {
      const existingNotif = await this.prisma.notification.findFirst({
        where: {
          usuarioId: mezcla.autorId,
          recursoId: mezclaId,
          tipo: 'LIKE_MEZCLA',
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      });
      if (!existingNotif) {
        await this.prisma.notification.create({
          data: {
            usuarioId: mezcla.autorId,
            tipo: 'LIKE_MEZCLA',
            mensaje: `A alguien le ha gustado tu mezcla "${mezcla.titulo}"`,
            recursoId: mezclaId,
          },
        });
      }
    }

    return { liked: true };
  }

  // 5. Dar o Quitar Dislike
  async toggleDislike(usuarioId: number, mezclaId: number) {
    const existingDislike = await this.prisma.mixDislike.findUnique({
      where: { usuarioId_mezclaId: { usuarioId, mezclaId } },
    });

    if (existingDislike) {
      await this.prisma.mixDislike.delete({
        where: { usuarioId_mezclaId: { usuarioId, mezclaId } },
      });
      return { disliked: false };
    }

    // Al dar dislike, quitamos el like si existe
    await this.prisma.mixLike.deleteMany({
      where: { usuarioId, mezclaId },
    });

    await this.prisma.mixDislike.create({
      data: { usuarioId, mezclaId },
    });
    return { disliked: true };
  }

  // 6. Eliminar Mezcla
  async remove(id: number) {
    return this.prisma.mix.delete({
      where: { id },
    });
  }

  // ========== COMENTARIOS ==========

  // 7. Añadir Comentario a una Mezcla
  async addComment(mezclaId: number, usuarioId: number, texto: string) {
    const comment = await this.prisma.mixComment.create({
      data: { mezclaId, usuarioId, texto },
      include: {
        user: { select: { id: true, nombre: true, avatarUrl: true } },
      },
    });

    // Notificar al autor de la mezcla
    const mezcla = await this.prisma.mix.findUnique({
      where: { id: mezclaId },
      select: { autorId: true, titulo: true },
    });
    if (mezcla && mezcla.autorId && mezcla.autorId !== usuarioId) {
      await this.prisma.notification.create({
        data: {
          usuarioId: mezcla.autorId,
          tipo: 'COMENTARIO_MEZCLA',
          mensaje: `Alguien ha comentado en tu mezcla "${mezcla.titulo}"`,
          recursoId: mezclaId,
        },
      });
    }

    return comment;
  }

  // 8. Obtener Comentarios de una Mezcla (paginado)
  async getComments(mezclaId: number, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.mixComment.findMany({
        where: { mezclaId },
        include: {
          user: { select: { id: true, nombre: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.mixComment.count({ where: { mezclaId } }),
    ]);

    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  // 9. Eliminar Comentario (solo el autor del comentario)
  async removeComment(commentId: number, userId: number) {
    const comment = await this.prisma.mixComment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.usuarioId !== userId) {
      throw new ForbiddenException('No puedes eliminar este comentario');
    }

    return this.prisma.mixComment.delete({ where: { id: commentId } });
  }

  // ========== TAGS ==========

  // 10. Obtener todos los tags
  async getAllTags() {
    return this.prisma.tag.findMany({
      orderBy: { nombre: 'asc' },
    });
  }
}
