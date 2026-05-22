import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../prisma/prisma.module';
import { HookymiaSeedService } from './services/hookymia-seed/hookymia-seed.service';
import { BoeScannerService } from './services/boe-scanner/boe-scanner.service';
import { TobaccoCronService } from './services/tobacco-cron/tobacco-cron.service';
import { TobaccoScraperController } from './tobacco-scraper.controller';
import { XmlCatalogService } from './services/xml-catalog/xml-catalog.service';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule],
  controllers: [TobaccoScraperController],
  providers: [
    HookymiaSeedService,
    BoeScannerService,
    TobaccoCronService,
    XmlCatalogService,
  ],
})
export class TobaccoScraperModule {}
