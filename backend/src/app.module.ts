import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MezclasModule } from './mezclas/mezclas.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { PrismaModule } from './prisma/prisma.module';
import { BaresModule } from './bares/bares.module';
import { ChatModule } from './chat/chat.module';
import { TobaccoScraperModule } from './tobacco-scraper/tobacco-scraper.module';

@Module({
  imports: [
    MezclasModule,
    UsersModule,
    AuthModule,
    MarketplaceModule,
    PrismaModule,
    BaresModule,
    ChatModule,
    NotificacionesModule,
    TobaccoScraperModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
