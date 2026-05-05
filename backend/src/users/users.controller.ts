import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AddStashDto, AddSellerReviewDto } from './dto/user-actions.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Get(':id/stats')
  getStats(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getStats(id);
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `avatar-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return cb(new Error('Solo se permiten imágenes jpg, jpeg, png o webp'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      (updateUserDto as any).avatarUrl = `/uploads/avatars/${file.filename}`;
    }
    return this.usersService.update(id, updateUserDto);
  }

  // --- STASH ---
  @Get(':id/stash')
  getStash(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getStash(id);
  }

  @Post('stash')
  addStash(@Body() stashData: AddStashDto) {
    return this.usersService.addStash(stashData);
  }

  @Delete('stash/:stashId')
  removeStash(@Param('stashId', ParseIntPipe) stashId: number) {
    return this.usersService.removeStash(stashId);
  }

  // --- REVIEWS MERCADILLO ---
  @Post(':id/reviews')
  addReview(
    @Param('id', ParseIntPipe) id: number,
    @Body() reviewData: AddSellerReviewDto,
  ) {
    return this.usersService.addSellerReview(id, reviewData);
  }

  // --- FOLLOWERS ---
  @Post(':id/follow')
  toggleFollow(
    @Param('id', ParseIntPipe) followingId: number,
    @Body('followerId') followerId: number,
  ) {
    return this.usersService.toggleFollow(Number(followerId), followingId);
  }
}

