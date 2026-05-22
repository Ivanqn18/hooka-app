import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { StashType } from '@prisma/client';

export class AddStashDto {
  @IsNumber()
  @Type(() => Number)
  usuarioId: number;

  @IsString()
  @MaxLength(100)
  nombreTabaco: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  marca?: string;

  @IsEnum(StashType)
  tipo: StashType;
}

export class AddSellerReviewDto {
  @IsNumber()
  @Type(() => Number)
  compradorId: number;

  @IsNumber()
  @Type(() => Number)
  productoId: number;

  @IsNumber()
  puntuacion: number;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  comentario?: string;
}
