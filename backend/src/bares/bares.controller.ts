import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BaresService } from './bares.service';
import { CreateBareDto, AddBarReviewDto } from './dto/create-bare.dto';
import { ImageCompressionInterceptor } from '../common/interceptors/image-compression.interceptor';

// Configuración de almacenamiento para Multer (Opiniones de Bares)
const storage = diskStorage({
  destination: './uploads/reviews',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
  },
});

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
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage,
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return cb(
            new BadRequestException(
              'Solo se permiten imágenes (jpg, jpeg, png, webp)',
            ),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB LIMIT
    }),
    ImageCompressionInterceptor,
  )
  addReview(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: AddBarReviewDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const finalData: any = {
      ...data,
      usuarioId: Number(data.usuarioId),
      puntuacion: Number(data.puntuacion),
    };
    if (file) {
      finalData.imagenUrl = `/uploads/reviews/${file.filename}`;
    }
    return this.baresService.addReview(id, finalData);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.baresService.remove(id);
  }
}
