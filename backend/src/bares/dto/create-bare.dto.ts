import { IsString, IsNumber, IsOptional, IsUrl, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBareDto {
  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  descripcion?: string;

  @IsString()
  @MaxLength(200)
  direccion: string;

  @IsNumber()
  @Type(() => Number)
  latitud: number;

  @IsNumber()
  @Type(() => Number)
  longitud: number;

  @IsString()
  @IsOptional()
  imagenUrl?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  solicitanteId?: number;
}

export class AddBarReviewDto {
  @IsNumber()
  @Type(() => Number)
  usuarioId: number;

  @IsNumber()
  puntuacion: number;

  @IsString()
  @IsOptional()
  comentario?: string;

  @IsString()
  @IsOptional()
  imagenUrl?: string;
}
