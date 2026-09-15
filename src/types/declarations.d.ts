declare module 'react-native-zeroconf' {
  export default class Zeroconf {
    constructor();
    on(event: string, callback: (...args: any[]) => void): void;
    publish(
      type: string,
      protocol: string,
      domain: string,
      name: string,
      port: number,
      txt?: Record<string, string>
    ): void;
    scan(type: string, protocol: string, domain: string): void;
    stop(): void;
    unpublishService(name: string): void;
  }
}

declare module 'react-native-tcp-socket' {
  export interface TcpSocketOptions {
    port: number;
    host?: string;
  }

  export interface Socket {
    on(event: string, callback: (...args: any[]) => void): void;
    write(data: string | Uint8Array, encoding?: string): void;
    destroy(): void;
    destroyed: boolean;
  }

  export interface Server {
    on(event: string, callback: (...args: any[]) => void): void;
    listen(options: TcpSocketOptions, callback?: () => void): void;
    close(callback?: () => void): void;
  }

  export function createServer(connectionListener?: (socket: Socket) => void): Server;
  export function createConnection(options: TcpSocketOptions, callback?: () => void): Socket;
}
