import { Module } from '@nestjs/common';
import { MezclasService } from './mezclas.service';
import { MezclasController } from './mezclas.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MezclasController],
  providers: [MezclasService],
})
export class MezclasModule {}
