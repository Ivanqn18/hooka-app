import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  // path debe coincidir con la regla handle /socket.io/* del Caddyfile
  path: '/socket.io',
  cors: {
    // Función dinámica para que lea FRONTEND_URL cuando ya está disponible el entorno
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      const allowed = process.env.FRONTEND_URL
        ? [process.env.FRONTEND_URL, 'http://localhost:5173']
        : true; // en dev aceptamos cualquier origen
      if (allowed === true || !origin || (Array.isArray(allowed) && allowed.includes(origin))) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by Socket.IO CORS`));
      }
    },
    credentials: true,
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('joinChat')
  handleJoinChat(
    @MessageBody() chatId: number,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`chat_${chatId}`);
    return { event: 'joinedChat', data: chatId };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: { chatId: number; emisorId: number; texto: string },
  ) {
    const message = await this.chatService.createMessage(
      data.chatId,
      data.emisorId,
      data.texto,
    );
    this.server.to(`chat_${data.chatId}`).emit('newMessage', message);
    return message;
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @MessageBody() data: { chatId: number; usuarioLecturaId: number },
  ) {
    const actCount = await this.chatService.markMessagesAsRead(
      data.chatId,
      data.usuarioLecturaId,
    );

    if (actCount > 0) {
      // Si se han actualizado mensajes, avisamos a la sala (emisor)
      this.server.to(`chat_${data.chatId}`).emit('messagesRead', {
        chatId: data.chatId,
        readBy: data.usuarioLecturaId,
      });
    }
  }
}
