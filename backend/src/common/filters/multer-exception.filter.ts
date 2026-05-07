import { ExceptionFilter, Catch, ArgumentsHost, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { MulterError } from 'multer';

@Catch(MulterError)
export class MulterExceptionFilter implements ExceptionFilter {
  catch(exception: MulterError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let message = 'Error al subir el archivo';
    
    switch (exception.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'El archivo es demasiado grande. Máximo permitido: 10MB para imágenes, 2MB para avatares';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Demasiados archivos';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Campo de archivo no esperado';
        break;
      default:
        message = exception.message;
    }

    response.status(400).json({
      statusCode: 400,
      message,
      error: 'Bad Request',
    });
  }
}
