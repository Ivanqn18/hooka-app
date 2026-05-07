import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ImageCompressionInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const file = request.file;

    if (file && file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
      const originalPath = file.path;
      const ext = path.extname(file.originalname).toLowerCase();
      
      // Process image with sharp
      const sharpInstance = sharp(originalPath);
      const metadata = await sharpInstance.metadata();
      
      // Resize if image is too large (max 1920px on longest side)
      const maxDimension = 1920;
      let resizeOptions: sharp.ResizeOptions = {};
      
      if (metadata.width && metadata.height) {
        if (metadata.width > maxDimension || metadata.height > maxDimension) {
          resizeOptions = { 
            width: metadata.width > metadata.height ? maxDimension : undefined,
            height: metadata.height >= metadata.width ? maxDimension : undefined,
            withoutEnlargement: true,
            fit: 'inside'
          };
        }
      }

      // Compress based on format
      if (ext === '.webp') {
        await sharpInstance
          .resize(resizeOptions)
          .webp({ quality: 80, effort: 4 })
          .toFile(originalPath + '.tmp');
      } else if (ext === '.png') {
        await sharpInstance
          .resize(resizeOptions)
          .png({ quality: 85, compressionLevel: 8 })
          .toFile(originalPath + '.tmp');
      } else {
        // jpg/jpeg
        await sharpInstance
          .resize(resizeOptions)
          .jpeg({ quality: 85, progressive: true, mozjpeg: true })
          .toFile(originalPath + '.tmp');
      }

      // Replace original with compressed version
      fs.unlinkSync(originalPath);
      fs.renameSync(originalPath + '.tmp', originalPath);
      
      // Update file size in request
      const stats = fs.statSync(originalPath);
      file.size = stats.size;
    }

    return next.handle();
  }
}
