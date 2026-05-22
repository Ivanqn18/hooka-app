import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ImageCompressionInterceptor } from '../common/interceptors/image-compression.interceptor';
import * as express from 'express';

// Configuración de almacenamiento para Multer
const storage = diskStorage({
  destination: './uploads/avatars',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `avatar-${uniqueSuffix}${extname(file.originalname)}`);
  },
});

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
const ACCESS_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

function getCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    path: '/',
    maxAge,
    sameSite: 'lax' as const,
    secure: true, // Always true - browsers reject secure cookies on HTTP anyway
  };
}

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  private setAuthCookies(
    res: express.Response,
    accessToken: string,
    refreshToken: string,
  ) {
    res.cookie('token', accessToken, getCookieOptions(ACCESS_TOKEN_MAX_AGE));
    res.cookie('refresh_token', refreshToken, getCookieOptions(COOKIE_MAX_AGE));
  }

  private clearAuthCookies(res: express.Response) {
    res.clearCookie('token', {
      httpOnly: true,
      path: '/',
      sameSite: 'lax' as const,
      secure: true,
    });
    res.clearCookie('refresh_token', {
      httpOnly: true,
      path: '/',
      sameSite: 'lax' as const,
      secure: true,
    });
  }

  @Post('register')
  @UseInterceptors(
    FileInterceptor('avatar', {
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
      limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB limit para avatares
    }),
    ImageCompressionInterceptor,
  )
  async register(
    @Body() body: RegisterDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    if (file) {
      body.avatarUrl = `/uploads/avatars/${file.filename}`;
    }
    const { tokens, user } = await this.authService.register(body);

    this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    return { user };
  }

  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const { tokens, user } = await this.authService.login(body);

    this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    return { user };
  }

  @Post('refresh')
  async refresh(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token');
    }

    const tokens = await this.authService.refreshTokens(refreshToken);
    this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    return { message: 'Token refrescado' };
  }

  @Get('me')
  async me(@Req() req: express.Request) {
    this.logger.log(`Cookies received: ${JSON.stringify(req.cookies)}`);
    const token = req.cookies?.token;
    if (!token) {
      this.logger.warn('No token cookie found');
      throw new UnauthorizedException('No session cookie');
    }
    return this.authService.getMe(token);
  }

  @Post('logout')
  async logout(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const refreshToken = req.cookies?.refresh_token;
    if (refreshToken) {
      this.authService.invalidateRefreshToken(refreshToken);
    }
    this.clearAuthCookies(res);
    return { message: 'Sesión cerrada' };
  }
}
