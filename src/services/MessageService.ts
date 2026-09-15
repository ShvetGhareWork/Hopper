import { Message, Conversation, Peer } from '../types/models';
import { StorageService } from './StorageService';

// Initial Mock Seed Data
const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'chan_sos',
    title: '#SOS',
    isChannel: true,
    isSos: true,
    lastMessageText: 'EMERGENCY: Need medical supplies at Base Camp 2',
    lastMessageTimestamp: '10:42 AM',
    unreadCount: 2,
    peerStatus: 'online',
    hopCount: 1,
  },
  {
    id: 'chan_mesh',
    title: '#mesh',
    isChannel: true,
    isMeshBroadcast: true,
    lastMessageText: 'Grid status check: 14 nodes active in sector 4',
    lastMessageTimestamp: '10:30 AM',
    unreadCount: 0,
    peerStatus: 'online',
    hopCount: 0,
  },
  {
    id: 'peer_scout',
    title: 'Scout Alpha (Node 802)',
    isChannel: false,
    lastMessageText: 'Bridge at River Creek is clear for transit.',
    lastMessageTimestamp: '09:15 AM',
    unreadCount: 0,
    peerStatus: 'relay',
    hopCount: 2,
  },
  {
    id: 'peer_base',
    title: 'Base Command',
    isChannel: false,
    lastMessageText: 'Awaiting radio relay heartbeat.',
    lastMessageTimestamp: 'Yesterday',
    unreadCount: 0,
    peerStatus: 'offline',
    hopCount: 3,
  },
];

const INITIAL_MESSAGES: Record<string, Message[]> = {
  chan_sos: [
    {
      id: 'm_sos_1',
      conversationId: 'chan_sos',
      senderId: 'peer_node9',
      senderName: 'Rescue Team B',
      text: 'ALERT: Flash flood warning near sector 2. Clear out immediately.',
      timestamp: '10:15 AM',
      isSentByMe: false,
      hopCount: 3,
      relayStatus: 'relayed',
    },
    {
      id: 'm_sos_2',
      conversationId: 'chan_sos',
      senderId: 'peer_node12',
      senderName: 'Medic 1',
      text: 'EMERGENCY: Need medical supplies at Base Camp 2',
      timestamp: '10:42 AM',
      isSentByMe: false,
      hopCount: 1,
      relayStatus: 'relayed',
    },
  ],
  chan_mesh: [
    {
      id: 'm_mesh_1',
      conversationId: 'chan_mesh',
      senderId: 'system',
      senderName: 'Mesh Router',
      text: 'Mesh initialized. 14 nodes connected via Bluetooth LE & Wi-Fi Direct.',
      timestamp: '10:00 AM',
      isSentByMe: false,
      hopCount: 0,
      relayStatus: 'direct',
    },
    {
      id: 'm_mesh_2',
      conversationId: 'chan_mesh',
      senderId: 'peer_node4',
      senderName: 'Node 404',
      text: 'Grid status check: 14 nodes active in sector 4',
      timestamp: '10:30 AM',
      isSentByMe: false,
      hopCount: 2,
      relayStatus: 'relayed',
    },
  ],
  peer_scout: [
    {
      id: 'm_scout_1',
      conversationId: 'peer_scout',
      senderId: 'peer_scout',
      senderName: 'Scout Alpha',
      text: 'Bridge at River Creek is clear for transit.',
      timestamp: '09:15 AM',
      isSentByMe: false,
      hopCount: 2,
      relayStatus: 'relayed',
    },
  ],
  peer_base: [
    {
      id: 'm_base_1',
      conversationId: 'peer_base',
      senderId: 'peer_base',
      senderName: 'Base Command',
      text: 'Awaiting radio relay heartbeat.',
      timestamp: 'Yesterday',
      isSentByMe: false,
      hopCount: 3,
      relayStatus: 'relayed',
    },
  ],
};

type MessageListener = () => void;

class MessageService {
  private conversations: Conversation[] = [];
  private messages: Record<string, Message[]> = {};
  private listeners: Set<MessageListener> = new Set();
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;

    const savedConvs = await StorageService.getConversations();
    const savedMsgs = await StorageService.getMessages();

    if (savedConvs && savedMsgs) {
      this.conversations = savedConvs;
      this.messages = savedMsgs;
    } else {
      this.conversations = INITIAL_CONVERSATIONS;
      this.messages = INITIAL_MESSAGES;
      await this.persist();
    }
    this.initialized = true;
  }

  private async persist(): Promise<void> {
    await StorageService.saveConversations(this.conversations);
    await StorageService.saveMessages(this.messages);
  }

  subscribe(listener: MessageListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn());
  }

  async getConversations(): Promise<Conversation[]> {
    await this.init();
    return this.conversations;
  }

  async getChannels(): Promise<Conversation[]> {
    await this.init();
    return this.conversations.filter((c) => c.isChannel);
  }

  async getChatList(): Promise<Conversation[]> {
    await this.init();
    return this.conversations.filter((c) => !c.isChannel);
  }

  async getConversationById(id: string): Promise<Conversation | undefined> {
    await this.init();
    return this.conversations.find((c) => c.id === id);
  }

  async getMessagesForConversation(conversationId: string): Promise<Message[]> {
    await this.init();
    return this.messages[conversationId] || [];
  }

  async sendMessage(conversationId: string, text: string): Promise<Message> {
    await this.init();

    const displayName = (await StorageService.getDisplayName()) || 'Me';

    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      conversationId,
      senderId: 'me',
      senderName: displayName,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSentByMe: true,
      hopCount: 0,
      relayStatus: 'pending',
    };

    if (!this.messages[conversationId]) {
      this.messages[conversationId] = [];
    }
    this.messages[conversationId].push(newMessage);

    // Update conversation last message preview
    const conv = this.conversations.find((c) => c.id === conversationId);
    if (conv) {
      conv.lastMessageText = text;
      conv.lastMessageTimestamp = newMessage.timestamp;
    }

    await this.persist();
    this.notify();

    // Simulate mesh hop relay confirmation after 1.5 seconds
    setTimeout(async () => {
      const msg = this.messages[conversationId]?.find((m) => m.id === newMessage.id);
      if (msg) {
        msg.relayStatus = 'relayed';
        msg.hopCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 hops
        await this.persist();
        this.notify();
      }
    }, 1500);

    return newMessage;
  }

  async wipeAll(): Promise<void> {
    await StorageService.wipeAllData();
    this.conversations = INITIAL_CONVERSATIONS;
    this.messages = INITIAL_MESSAGES;
    await this.persist();
    this.notify();
  }
}

export const messageService = new MessageService();
