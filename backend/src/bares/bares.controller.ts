import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  ParseIntPipe,
} from '@nestjs/common';
import { BaresService } from './bares.service';
import { CreateBareDto, AddBarReviewDto } from './dto/create-bare.dto';

@Controller('bares')
export class BaresController {
  constructor(private readonly baresService: BaresService) {}

  @Post()
  create(@Body() createBareDto: CreateBareDto) {
    return this.baresService.create(createBareDto, createBareDto.solicitanteId);
  }

  @Get()
  findAll() {
    return this.baresService.findAll();
  }

  @Get('admin/pending')
  findPending() {
    // Validaremos el rol de Admin desde el Frontend o mediante Guards en el futuro
    return this.baresService.findPending();
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: 'APPROVED' | 'REJECTED',
  ) {
    return this.baresService.updateStatus(id, status);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.baresService.findOne(id);
  }

  @Post(':id/reviews')
  addReview(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: AddBarReviewDto,
  ) {
    return this.baresService.addReview(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.baresService.remove(id);
  }
}
