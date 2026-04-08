import {
  Controller,
  Get,
  Put,
  Param,
  Query,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';

@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @Get()
  getNotificaciones(@Query('userId', ParseIntPipe) userId: number) {
    return this.notificacionesService.getNotificaciones(userId);
  }

  @Put(':id/leer')
  marcarComoLeida(
    @Param('id', ParseIntPipe) id: number,
    @Body('userId', ParseIntPipe) userId: number,
  ) {
    return this.notificacionesService.marcarComoLeida(id, userId);
  }

  @Put('leer-todas')
  marcarTodasComoLeidas(@Body('userId', ParseIntPipe) userId: number) {
    return this.notificacionesService.marcarTodasComoLeidas(userId);
  }
}
