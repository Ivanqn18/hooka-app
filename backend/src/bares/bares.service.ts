import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BaresService {
  constructor(private prisma: PrismaService) {}

  create(data: any, solicitanteId?: number) {
    return this.prisma.bar.create({
      data: {
        ...data,
        status: 'PENDING',
        solicitanteId: solicitanteId || null,
      },
    });
  }

  findAll() {
    return this.prisma.bar.findMany({
      where: {
        status: 'APPROVED',
      },
      include: {
        reviews: true,
      },
    });
  }

  findPending() {
    return this.prisma.bar.findMany({
      where: {
        status: 'PENDING',
      },
      include: {
        solicitante: {
          select: { id: true, nombre: true, email: true },
        },
      },
    });
  }

  updateStatus(id: number, status: 'APPROVED' | 'REJECTED') {
    return this.prisma.bar.update({
      where: { id },
      data: { status },
    });
  }

  findOne(id: number) {
    return this.prisma.bar.findUnique({
      where: { id },
      include: {
        reviews: {
          include: {
            user: { select: { id: true, nombre: true, avatarUrl: true } },
          },
        },
      },
    });
  }

  addReview(barId: number, data: any) {
    return this.prisma.barReview.create({
      data: {
        barId,
        ...data,
      },
    });
  }

  remove(id: number) {
    return this.prisma.bar.delete({
      where: { id },
    });
  }
}
