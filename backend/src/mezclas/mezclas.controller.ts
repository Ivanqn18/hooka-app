import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MezclasService } from './mezclas.service';
import { CreateMezclaDto } from './dto/create-mezcla.dto';

// Configuración de almacenamiento para Multer
const storage = diskStorage({
  destination: './uploads/mezclas',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
  },
});

@Controller('mezclas')
export class MezclasController {
  constructor(private readonly mezclasService: MezclasService) { }

  @Post()
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
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB LIMIT
    }),
  )
  create(
    @Body() createMezclaDto: CreateMezclaDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // Parsear campos JSON que vienen como string en multipart/form-data
    const ingredientes = typeof (createMezclaDto as any).ingredientes === 'string'
      ? JSON.parse((createMezclaDto as any).ingredientes)
      : createMezclaDto.ingredientes;

    const tagIds = typeof (createMezclaDto as any).tagIds === 'string'
      ? JSON.parse((createMezclaDto as any).tagIds)
      : (createMezclaDto.tagIds ?? []);

    const data: any = {
      ...createMezclaDto,
      ingredientes,
      tagIds,
    };

    if (file) {
      data.imagenUrl = `/uploads/mezclas/${file.filename}`;
    }

    return this.mezclasService.create(data);
  }

  @Put(':id')
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
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB LIMIT
    }),
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMezclaDto: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const ingredientes = typeof updateMezclaDto.ingredientes === 'string'
      ? JSON.parse(updateMezclaDto.ingredientes)
      : updateMezclaDto.ingredientes;

    const tagIds = typeof updateMezclaDto.tagIds === 'string'
      ? JSON.parse(updateMezclaDto.tagIds)
      : (updateMezclaDto.tagIds ?? []);

    const data: any = {
      ...updateMezclaDto,
      ingredientes,
      tagIds,
    };
    
    // Convertir autorId a numero (viene como string en form-data)
    if (data.autorId) {
      data.autorId = Number(data.autorId);
    }

    if (file) {
      data.imagenUrl = `/uploads/mezclas/${file.filename}`;
    }

    // Le pasamos id y autorId para verificar en el servicio
    return this.mezclasService.update(id, data.autorId, data);
  }

  // GET /mezclas/tags — Listar todos los tags disponibles
  @Get('tags')
  getAllTags() {
    return this.mezclasService.getAllTags();
  }

  @Get('semana')
  getMezclaDeLaSemana() {
    return this.mezclasService.getMezclaDeLaSemana();
  }

  @Get()
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 12,
    @Query('tag') tag?: string,
  ) {
    return this.mezclasService.findAll(page, limit, tag);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.mezclasService.findOne(id);
  }

  // ========== LIKES / DISLIKES ==========

  @Post(':id/like')
  toggleLike(
    @Param('id', ParseIntPipe) id: number,
    @Body('userId', ParseIntPipe) userId: number,
  ) {
    return this.mezclasService.toggleLike(userId, id);
  }

  @Post(':id/dislike')
  toggleDislike(
    @Param('id', ParseIntPipe) id: number,
    @Body('userId', ParseIntPipe) userId: number,
  ) {
    return this.mezclasService.toggleDislike(userId, id);
  }

  // ========== COMENTARIOS ==========

  @Post(':id/comments')
  addComment(
    @Param('id', ParseIntPipe) id: number,
    @Body('userId', ParseIntPipe) userId: number,
    @Body('texto') texto: string,
  ) {
    return this.mezclasService.addComment(id, userId, texto);
  }

  @Get(':id/comments')
  getComments(
    @Param('id', ParseIntPipe) id: number,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    return this.mezclasService.getComments(id, page, limit);
  }

  @Delete('comments/:commentId')
  removeComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body('userId', ParseIntPipe) userId: number,
  ) {
    return this.mezclasService.removeComment(commentId, userId);
  }

  // ========== DELETE MEZCLA ==========

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.mezclasService.remove(id);
  }
}

