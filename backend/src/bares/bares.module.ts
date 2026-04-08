import { Module } from '@nestjs/common';
import { BaresService } from './bares.service';
import { BaresController } from './bares.controller';

@Module({
  controllers: [BaresController],
  providers: [BaresService],
})
export class BaresModule {}
