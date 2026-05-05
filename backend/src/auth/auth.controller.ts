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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
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

// En producción (HTTPS via Caddy) las cookies necesitan secure:true y sameSite:'none'
const IS_PROD = !!process.env.FRONTEND_URL;
const COOKIE_OPTIONS = {
  httpOnly: true,
  maxAge: COOKIE_MAX_AGE,
  sameSite: (IS_PROD ? 'none' : 'lax') as 'none' | 'lax',
  secure: IS_PROD,
};

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

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
  )
  async register(
    @Body() body: RegisterDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    if (file) {
      body.avatarUrl = `/uploads/avatars/${file.filename}`;
    }
    const { token, user } = await this.authService.register(body);

    res.cookie('token', token, COOKIE_OPTIONS);

    return { user };
  }

  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const { token, user } = await this.authService.login(body);

    res.cookie('token', token, COOKIE_OPTIONS);

    return { user };
  }

  @Get('me')
  async me(@Req() req: express.Request) {
    const token = req.cookies?.token;
    if (!token) {
      throw new UnauthorizedException('No session cookie');
    }
    return this.authService.getMe(token);
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: express.Response) {
    res.clearCookie('token', {
      httpOnly: true,
      sameSite: (IS_PROD ? 'none' : 'lax') as 'none' | 'lax',
      secure: IS_PROD,
    });
    return { message: 'Sesión cerrada' };
  }
}
