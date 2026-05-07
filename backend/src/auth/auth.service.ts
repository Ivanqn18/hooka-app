import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

// Store invalidated refresh tokens (in production use Redis)
const invalidatedRefreshTokens = new Set<string>();

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  private async generateTokens(user: any): Promise<TokenPair> {
    const payload = { sub: user.id, email: user.email };
    
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });
    
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'secretKey',
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  async register(data: any) {
    const existingUser = await this.usersService.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException('El correo ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.usersService.create({
      ...data,
      password: hashedPassword,
    });
    const { password: _, ...userWithoutPassword } = user;

    const tokens = await this.generateTokens(user);

    return { tokens, user: userWithoutPassword };
  }

  async login(data: any) {
    const user = await this.usersService.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);

    return {
      tokens,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        isAdmin: user.isAdmin,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    if (invalidatedRefreshTokens.has(refreshToken)) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'secretKey',
      });
      
      const user = await this.usersService.findOne(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      // Invalidate old refresh token
      invalidatedRefreshTokens.add(refreshToken);

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  invalidateRefreshToken(refreshToken: string) {
    invalidatedRefreshTokens.add(refreshToken);
  }

  async getMe(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      const user = await this.usersService.findOne(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('JWT verification error:', error);
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}

