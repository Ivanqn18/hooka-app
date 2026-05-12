import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { ImageCompressionInterceptor } from '../common/interceptors/image-compression.interceptor';
import { AddStashDto } from './dto/user-actions.dto';

const avatarStorage = diskStorage({
  destination: './uploads/avatars',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `avatar-${uniqueSuffix}${extname(file.originalname)}`);
  },
});

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  findAll(@Query('limit') limit?: string, @Query('page') page?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 100;
    const pageNum = page ? parseInt(page, 10) : 1;
    return this.usersService.findAll(limitNum, pageNum);
  }

  @Get(':id')
  getProfile(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getProfile(id);
  }

  @Get(':id/stats')
  getStats(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserStats(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: any,
  ) {
    return this.usersService.update(id, data);
  }

  @Post(':id/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    ImageCompressionInterceptor,
    FileInterceptor('avatar', {
      storage: avatarStorage,
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return cb(
            new BadRequestException('Solo se permiten imágenes jpg, jpeg, png, webp'),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  async uploadAvatar(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No se ha proporcionado ningún archivo');
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    return this.usersService.update(id, { avatarUrl });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  // ========== STASH ==========

  @Get(':id/stash')
  @UseGuards(JwtAuthGuard)
  getStash(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getStash(id);
  }

  @Post('stash')
  @UseGuards(JwtAuthGuard)
  addStash(@Body() addStashDto: AddStashDto) {
    return this.usersService.addStash(addStashDto);
  }

  @Delete('stash/:id')
  @UseGuards(JwtAuthGuard)
  removeStash(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.removeStash(id);
  }

  // ========== FOLLOW ==========

  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  toggleFollow(
    @Param('id', ParseIntPipe) followingId: number,
    @Body('followerId', ParseIntPipe) followerId: number,
  ) {
    return this.usersService.toggleFollow(followerId, followingId);
  }
}