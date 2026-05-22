import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDecimal,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ProductCategory,
  ProductStatus,
  TransactionStatus,
} from '@prisma/client';

export class CreateMarketplaceDto {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  vendedorId?: number;

  @IsString()
  @MaxLength(100)
  titulo: string;

  @IsString()
  @MaxLength(2000)
  descripcion: string;

  @IsNumber()
  @Type(() => Number)
  precio: number;

  @IsEnum(ProductCategory)
  categoria: ProductCategory;

  @IsEnum(ProductStatus)
  @IsOptional()
  estado?: ProductStatus;

  @IsString()
  @IsOptional()
  imagenUrl?: string;

  @IsString()
  @IsOptional()
  ubicacion?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  latitud?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  longitud?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  compradorId?: number;

  @IsEnum(TransactionStatus)
  @IsOptional()
  transaccionEstado?: TransactionStatus;
}
