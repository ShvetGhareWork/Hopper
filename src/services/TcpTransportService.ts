import TcpSocket from 'react-native-tcp-socket';
import { NETWORK_CONFIG } from '../config/network';
import { IdentityService } from './IdentityService';

export interface MessageEnvelope {
  id: string;
  senderId: string;
  senderName: string;
  channelId: string;
  body: string;
  timestamp: string;
  hopCount: number;
}

type MessageReceivedHandler = (envelope: MessageEnvelope) => void;

class TcpTransportService {
  private server: any = null;
  private activeSockets: Map<string, any> = new Map(); // key: peerId
  private messageHandlers: Set<MessageReceivedHandler> = new Set();
  private localPeerId = '';

  async init(): Promise<void> {
    this.localPeerId = await IdentityService.getOrCreatePeerId();
    this.startServer();
  }

  private startServer(): void {
    try {
      this.server = TcpSocket.createServer((socket: any) => {
        this.setupSocketEvents(socket);
      });

      this.server.on('error', (error: any) => {
        console.error('TCP Server Error:', error);
      });

      this.server.listen({ port: NETWORK_CONFIG.DEFAULT_PORT, host: '0.0.0.0' }, () => {
        console.log(`TCP Server listening on port ${NETWORK_CONFIG.DEFAULT_PORT}`);
      });
    } catch (err) {
      console.warn('TCP Server init warning:', err);
    }
  }

  private setupSocketEvents(socket: any, peerId?: string): void {
    let buffer = '';

    socket.on('data', (data: any) => {
      buffer += data.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete trailing fragment

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const envelope: MessageEnvelope = JSON.parse(line.trim());
          if (envelope.senderId && envelope.senderId !== this.localPeerId) {
            // Track active socket by sender peerId
            this.activeSockets.set(envelope.senderId, socket);
            this.notifyMessageReceived(envelope);
          }
        } catch (e) {
          console.error('Failed to parse incoming TCP json packet:', e);
        }
      }
    });

    socket.on('error', (err: any) => {
      console.warn('TCP socket error:', err);
    });

    socket.on('close', () => {
      if (peerId) {
        this.activeSockets.delete(peerId);
      }
    });
  }

  onMessageReceived(handler: MessageReceivedHandler): () => void {
    this.messageHandlers.add(handler);
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  private notifyMessageReceived(envelope: MessageEnvelope): void {
    this.messageHandlers.forEach((fn) => fn(envelope));
  }

  async sendEnvelopeToPeer(host: string, port: number, peerId: string, envelope: MessageEnvelope): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        let socket = this.activeSockets.get(peerId);

        if (socket && !socket.destroyed) {
          socket.write(JSON.stringify(envelope) + '\n');
          resolve(true);
        } else {
          // Open new TCP client socket connection
          socket = TcpSocket.createConnection({ host, port }, () => {
            this.activeSockets.set(peerId, socket);
            this.setupSocketEvents(socket, peerId);
            socket.write(JSON.stringify(envelope) + '\n');
            resolve(true);
          });

          socket.on('error', (err: any) => {
            console.error(`TCP connection to ${host}:${port} failed:`, err);
            resolve(false);
          });
        }
      } catch (err) {
        console.error('Error sending TCP envelope:', err);
        resolve(false);
      }
    });
  }
}

export const tcpTransportService = new TcpTransportService();
