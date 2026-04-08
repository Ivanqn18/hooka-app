import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificacionesService {
  constructor(private prisma: PrismaService) {}

  async getNotificaciones(usuarioId: number) {
    return this.prisma.notification.findMany({
      where: { usuarioId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async createNotificacion(data: {
    usuarioId: number;
    tipo: NotificationType;
    mensaje: string;
    recursoId?: number;
  }) {
    // Evitar notificaciones duplicadas recientes (por ejemplo, multiples likes al mismo recurso)
    if (data.tipo === 'LIKE_MEZCLA' && data.recursoId) {
      const existing = await this.prisma.notification.findFirst({
        where: {
          usuarioId: data.usuarioId,
          tipo: data.tipo,
          recursoId: data.recursoId,
        },
      });
      if (existing) return existing;
    }

    return this.prisma.notification.create({
      data: {
        usuarioId: data.usuarioId,
        tipo: data.tipo,
        mensaje: data.mensaje,
        recursoId: data.recursoId,
      },
    });
  }

  async marcarComoLeida(id: number, usuarioId: number) {
    return this.prisma.notification.updateMany({
      where: { id, usuarioId },
      data: { leido: true },
    });
  }

  async marcarTodasComoLeidas(usuarioId: number) {
    return this.prisma.notification.updateMany({
      where: { usuarioId, leido: false },
      data: { leido: true },
    });
  }
}
