import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { BoeScannerService } from './src/tobacco-scraper/services/boe-scanner/boe-scanner.service';

async function bootstrap() {
  console.log('🔄 Inicializando contexto de NestJS...');
  const app = await NestFactory.createApplicationContext(AppModule);
  
  console.log('🔍 Obteniendo BoeScannerService...');
  const scanner = app.get(BoeScannerService);
  
  console.log('🚀 Ejecutando parseNewTobaccoPrices()... (Esto puede tardar un poco ya que levanta Puppeteer)');
  try {
    const added = await scanner.parseNewTobaccoPrices();
    console.log(`✅ ¡Completado! Se añadieron/actualizaron ${added} sabores/formatos en la base de datos.`);
  } catch (error) {
    console.error('❌ Error durante el escaneo del BOE:', error);
  } finally {
    console.log('🚪 Cerrando contexto...');
    await app.close();
  }
}

bootstrap();
