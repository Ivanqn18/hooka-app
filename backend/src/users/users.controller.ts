import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  findAll(@Query('limit') limit?: string, @Query('page') page?: string) {
    // Valores por defecto para la paginación
    const limitNum = limit ? parseInt(limit, 10) : 100;
    const pageNum = page ? parseInt(page, 10) : 1;

    return this.usersService.findAll(limitNum, pageNum);
  }
}