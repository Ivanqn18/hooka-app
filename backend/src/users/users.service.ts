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
}