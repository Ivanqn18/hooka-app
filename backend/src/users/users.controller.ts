import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
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
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
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

