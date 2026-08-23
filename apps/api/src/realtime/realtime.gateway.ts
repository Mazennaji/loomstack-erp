import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Injectable } from '@nestjs/common';

@Injectable()
@WebSocketGateway({
  cors: { origin: 'http://localhost:5173' },
})
export class RealtimeGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinTenant')
  handleJoinTenant(@MessageBody() tenantId: string, client: any) {
    client.join(`tenant:${tenantId}`);
  }

  emitToTenant(tenantId: string, event: string, payload: any) {
    this.server.to(`tenant:${tenantId}`).emit(event, payload);
  }
}