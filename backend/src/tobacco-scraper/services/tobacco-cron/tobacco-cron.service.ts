import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BoeScannerService } from '../boe-scanner/boe-scanner.service';

@Injectable()
export class TobaccoCronService {
  private readonly logger = new Logger(TobaccoCronService.name);

  constructor(private readonly boeScanner: BoeScannerService) {}

  // Cron se ejecuta todos los viernes a las 04:00 AM dado que el BOE suele publicarse antes del finde
  @Cron('0 4 * * 5')
  async handleCron() {
    this.logger.log(
      '📅 Ejecutando tarea programada: Escaneo Semanal del BOE de Tabacos',
    );
    try {
      const added = await this.boeScanner.parseNewTobaccoPrices();
      this.logger.log(
        `✅ Escaneo Finalizado: Se añadieron ${added} nuevos sabores al catálogo esta semana.`,
      );
    } catch (error) {
      this.logger.error('❌ Fallo crítico en el Cron del BOE', error);
    }
  }
}
