import {
  IsString,
  IsNumber,
  IsOptional,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

/**
 * NOTE: ingredientes y tagIds se reciben como JSON strings en multipart/form-data.
 * El parsing real se hace en el controller para evitar conflictos con forbidNonWhitelisted.
 * Por eso se declaran como 'any' aquí y se marcan como opcionales.
 */
export class CreateIngredientDto {
  nombreTabaco: string;
  marca?: string;
  porcentaje: number;
}

export class CreateMezclaDto {
  @IsString()
  @MaxLength(100)
  titulo: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  descripcion?: string;

  @IsString()
  @IsOptional()
  cazoletaRecomendada?: string;

  @IsNumber()
  @Type(() => Number)
  autorId: number;

  @IsString()
  @IsOptional()
  matices?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return false;
  })
  privada?: boolean;

  // Estos campos llegan como JSON string en multipart y se parsean en el controller
  @IsOptional()
  ingredientes?: any;

  @IsOptional()
  tagIds?: any;
}
