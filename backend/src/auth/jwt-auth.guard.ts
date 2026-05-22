import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    // Leemos el token desde las cookies (tal y como está configurada tu app)
    const token = request.cookies?.token;

    if (!token) {
      throw new UnauthorizedException('No hay sesión activa');
    }

    try {
      // Verificamos la validez del token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'secretKey',
      });

      // Obtenemos el usuario completo para que el AdminGuard pueda leer la propiedad isAdmin
      const user = await this.usersService.findOne(payload.sub);
      if (!user) throw new UnauthorizedException('Usuario no encontrado');

      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
