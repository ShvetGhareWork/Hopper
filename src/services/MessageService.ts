import { Message, Conversation, Peer } from '../types/models';
import { StorageService } from './StorageService';
import { discoveryService, DiscoveredPeer } from './DiscoveryService';
import { tcpTransportService, MessageEnvelope } from './TcpTransportService';
import { IdentityService } from './IdentityService';

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'chan_sos',
    title: '#SOS',
    isChannel: true,
    isSos: true,
    lastMessageText: 'EMERGENCY BROADCAST CHANNEL',
    lastMessageTimestamp: '10:00 AM',
    unreadCount: 0,
    peerStatus: 'online',
    hopCount: 1,
  },
  {
    id: 'chan_mesh',
    title: '#mesh',
    isChannel: true,
    isMeshBroadcast: true,
    lastMessageText: 'LOCAL MESH BROADCAST CHANNEL',
    lastMessageTimestamp: '10:00 AM',
    unreadCount: 0,
    peerStatus: 'online',
    hopCount: 0,
  },
];

type MessageListener = () => void;

class MessageService {
  private conversations: Conversation[] = [];
  private messages: Record<string, Message[]> = {};
  private listeners: Set<MessageListener> = new Set();
  private initialized = false;
  private localPeerId = '';

  async init(): Promise<void> {
    if (this.initialized) return;

    this.localPeerId = await IdentityService.getOrCreatePeerId();

    const savedConvs = await StorageService.getConversations();
    const savedMsgs = await StorageService.getMessages();

    if (savedConvs && savedMsgs) {
      this.conversations = savedConvs;
      this.messages = savedMsgs;
    } else {
      this.conversations = INITIAL_CONVERSATIONS;
      this.messages = {
        chan_sos: [],
        chan_mesh: [],
      };
      await this.persist();
    }

    // Initialize network services
    await discoveryService.init();
    await tcpTransportService.init();

    // Listen for incoming TCP messages
    tcpTransportService.onMessageReceived((envelope) => {
      this.handleIncomingEnvelope(envelope);
    });

    // Listen for discovered peers to update status
    discoveryService.subscribe((peers) => {
      this.syncDiscoveredPeerStatus(peers);
    });

    this.initialized = true;
  }

  private async handleIncomingEnvelope(envelope: MessageEnvelope): Promise<void> {
    const convId = envelope.channelId || envelope.senderId;

    // Find or create peer conversation if 1:1
    let conv = this.conversations.find((c) => c.id === convId);
    if (!conv && !envelope.channelId) {
      conv = {
        id: envelope.senderId,
        title: envelope.senderName || envelope.senderId,
        isChannel: false,
        lastMessageText: envelope.body,
        lastMessageTimestamp: envelope.timestamp,
        unreadCount: 1,
        peerStatus: 'online',
        hopCount: envelope.hopCount,
      };
      this.conversations.push(conv);
    } else if (conv) {
      conv.lastMessageText = envelope.body;
      conv.lastMessageTimestamp = envelope.timestamp;
      conv.peerStatus = 'online';
    }

    const newMessage: Message = {
      id: envelope.id,
      conversationId: convId,
      senderId: envelope.senderId,
      senderName: envelope.senderName,
      text: envelope.body,
      timestamp: envelope.timestamp,
      isSentByMe: false,
      hopCount: envelope.hopCount,
      relayStatus: 'direct',
    };

    if (!this.messages[convId]) {
      this.messages[convId] = [];
    }

    // Avoid duplicate message appending
    if (!this.messages[convId].some((m) => m.id === newMessage.id)) {
      this.messages[convId].push(newMessage);
      await this.persist();
      this.notify();
    }
  }

  private syncDiscoveredPeerStatus(discoveredPeers: DiscoveredPeer[]): void {
    let changed = false;
    const discoveredIds = new Set(discoveredPeers.map((p) => p.peerId));

    for (const conv of this.conversations) {
      if (!conv.isChannel) {
        const isOnline = discoveredIds.has(conv.id);
        const newStatus = isOnline ? 'online' : 'offline';
        if (conv.peerStatus !== newStatus) {
          conv.peerStatus = newStatus;
          changed = true;
        }
      }
    }

    if (changed) {
      this.notify();
    }
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

  async createOrGetPeerConversation(peer: DiscoveredPeer): Promise<Conversation> {
    await this.init();
    let conv = this.conversations.find((c) => c.id === peer.peerId);
    if (!conv) {
      conv = {
        id: peer.peerId,
        title: peer.displayName,
        isChannel: false,
        lastMessageText: 'Connected on LAN',
        lastMessageTimestamp: 'Now',
        unreadCount: 0,
        peerStatus: 'online',
        hopCount: 1,
      };
      this.conversations.push(conv);
      this.messages[peer.peerId] = [];
      await this.persist();
      this.notify();
    }
    return conv;
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
      senderId: this.localPeerId,
      senderName: displayName,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSentByMe: true,
      hopCount: 1, // Direct LAN transmission
      relayStatus: 'direct',
    };

    if (!this.messages[conversationId]) {
      this.messages[conversationId] = [];
    }
    this.messages[conversationId].push(newMessage);

    const conv = this.conversations.find((c) => c.id === conversationId);
    if (conv) {
      conv.lastMessageText = text;
      conv.lastMessageTimestamp = newMessage.timestamp;
    }

    await this.persist();
    this.notify();

    // Deliver envelope over real TCP sockets
    const envelope: MessageEnvelope = {
      id: newMessage.id,
      senderId: this.localPeerId,
      senderName: displayName,
      channelId: conv?.isChannel ? conversationId : '',
      body: text,
      timestamp: newMessage.timestamp,
      hopCount: 1,
    };

    const activePeers = discoveryService.getDiscoveredPeers();

    if (conv?.isChannel) {
      // Broadcast channel fan-out to all active LAN peers
      for (const peer of activePeers) {
        tcpTransportService.sendEnvelopeToPeer(peer.host, peer.port, peer.peerId, envelope);
      }
    } else {
      // Direct 1:1 message to target peer
      const targetPeer = activePeers.find((p) => p.peerId === conversationId);
      if (targetPeer) {
        tcpTransportService.sendEnvelopeToPeer(targetPeer.host, targetPeer.port, targetPeer.peerId, envelope);
      }
    }

    return newMessage;
  }

  async wipeAll(): Promise<void> {
    await StorageService.wipeAllData();
    this.conversations = INITIAL_CONVERSATIONS;
    this.messages = { chan_sos: [], chan_mesh: [] };
    await this.persist();
    this.notify();
  }
}

export const messageService = new MessageService();
