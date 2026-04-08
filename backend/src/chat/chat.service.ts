import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateChat(productoId: number, interesadoId: number) {
    let chat = await this.prisma.chat.findFirst({
      where: { productoId, interesadoId },
      include: {
        product: {
          select: {
            titulo: true,
            seller: { select: { id: true, nombre: true } },
          },
        },
      },
    });

    if (!chat) {
      chat = await this.prisma.chat.create({
        data: { productoId, interesadoId },
        include: {
          product: {
            select: {
              titulo: true,
              seller: { select: { id: true, nombre: true } },
            },
          },
        },
      });
    }
    return chat;
  }

  getUserChats(userId: number) {
    return this.prisma.chat.findMany({
      where: {
        OR: [{ interesadoId: userId }, { product: { vendedorId: userId } }],
      },
      include: {
        product: {
          select: { id: true, titulo: true, imagenUrl: true, vendedorId: true },
        },
        buyer: { select: { id: true, nombre: true, avatarUrl: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  getMessages(chatId: number) {
    return this.prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { id: true, nombre: true } } },
    });
  }

  async createMessage(chatId: number, emisorId: number, texto: string) {
    const message = await this.prisma.message.create({
      data: { chatId, emisorId, texto },
      include: { sender: { select: { id: true, nombre: true } } },
    });

    await this.prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: { product: { select: { vendedorId: true } } },
    });

    if (chat && chat.product && chat.product.vendedorId) {
      const receptorId =
        emisorId === chat.interesadoId
          ? chat.product.vendedorId
          : chat.interesadoId;

      await this.prisma.notification.create({
        data: {
          usuarioId: receptorId,
          tipo: 'NUEVO_MENSAJE',
          mensaje: `Nuevo mensaje de ${message.sender?.nombre || 'Alguien'}`,
          recursoId: chatId,
        },
      });
    }

    return message;
  }

  async markMessagesAsRead(chatId: number, usuarioLecturaId: number) {
    // Todos los mensajes de este chat donde yo (usuarioLecturaId) NO sea el emisor, los pongo como leidos
    const resul = await this.prisma.message.updateMany({
      where: {
        chatId: chatId,
        emisorId: {
          not: usuarioLecturaId,
        },
        leido: false,
      },
      data: {
        leido: true,
      },
    });
    return resul.count;
  }
}
