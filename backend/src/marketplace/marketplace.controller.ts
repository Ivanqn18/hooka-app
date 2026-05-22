import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MarketplaceService } from './marketplace.service';
import { CreateMarketplaceDto } from './dto/create-marketplace.dto';
import { UpdateMarketplaceDto } from './dto/update-marketplace.dto';
import { ImageCompressionInterceptor } from '../common/interceptors/image-compression.interceptor';

// Configuración de almacenamiento para Multer
const storage = diskStorage({
  destination: './uploads/products',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `product-${uniqueSuffix}${extname(file.originalname)}`);
  },
});

@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Post('products')
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
  createProduct(
    @Body() createProductDto: CreateMarketplaceDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const data = { ...createProductDto };

    // Convertir vendedorId a número (viene como string en multipart)
    if (data.vendedorId) data.vendedorId = Number(data.vendedorId);
    if (data.precio) data.precio = Number(data.precio);
    if (data.latitud) data.latitud = Number(data.latitud);
    if (data.longitud) data.longitud = Number(data.longitud);

    if (file) {
      (data as any).imagenUrl = `/uploads/products/${file.filename}`;
    } else {
      throw new BadRequestException('La imagen del producto es obligatoria');
    }

    return this.marketplaceService.createProduct(data as any);
  }

  @Get('products')
  findAllProducts(@Query() query: any) {
    // query parsing is handled inside service, but we could improve it here too
    return this.marketplaceService.findAllProducts(query);
  }

  @Get('products/:id')
  findOneProduct(@Param('id', ParseIntPipe) id: number) {
    return this.marketplaceService.findOneProduct(id);
  }

  @Patch('products/:id')
  updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateMarketplaceDto,
  ) {
    return this.marketplaceService.updateProduct(id, updateProductDto);
  }

  @Delete('products/:id')
  removeProduct(@Param('id', ParseIntPipe) id: number) {
    return this.marketplaceService.removeProduct(id);
  }
}
