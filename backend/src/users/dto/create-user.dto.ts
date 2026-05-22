<<<<<<< HEAD
import {
  IsString,
  IsEmail,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';
=======
import { IsString, IsEmail, IsOptional, MaxLength, MinLength, Matches } from 'class-validator';
>>>>>>> 23202954326ed6932b777c1b7cea9b27029757ed

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  nombre: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-+=/[\]\\|~`';])/, {
    message: 'La contraseña debe incluir al menos una letra mayúscula, un número y un carácter especial',
  })
  password: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  bio?: string;
}
