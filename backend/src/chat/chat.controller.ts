import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  getOrCreateChat(@Body() body: { productoId: number; interesadoId: number }) {
    return this.chatService.getOrCreateChat(body.productoId, body.interesadoId);
  }

  @Get('user/:userId')
  getUserChats(@Param('userId') userId: string) {
    return this.chatService.getUserChats(+userId);
  }

  @Get(':chatId/messages')
  getMessages(@Param('chatId') chatId: string) {
    return this.chatService.getMessages(+chatId);
  }
}
