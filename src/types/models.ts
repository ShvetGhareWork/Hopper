export type ConnectionStatus = 'online' | 'relay' | 'offline';

export interface Peer {
  id: string;
  displayName: string;
  status: ConnectionStatus;
  lastSeen: string;
  distanceHops: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isSentByMe: boolean;
  hopCount: number;
  relayStatus: 'pending' | 'relayed' | 'direct';
}

export interface Conversation {
  id: string;
  title: string;
  isChannel: boolean;
  isSos?: boolean;
  isMeshBroadcast?: boolean;
  lastMessageText: string;
  lastMessageTimestamp: string;
  unreadCount: number;
  peerStatus?: ConnectionStatus;
  hopCount?: number;
}

export interface UserSettings {
  displayName: string;
  isDarkMode: boolean;
  networkEnabled: boolean;
  peerId: string;
}
