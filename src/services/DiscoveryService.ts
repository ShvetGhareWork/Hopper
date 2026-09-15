import { AppState, AppStateStatus } from 'react-native';
import Zeroconf from 'react-native-zeroconf';
import { NETWORK_CONFIG } from '../config/network';
import { IdentityService } from './IdentityService';
import { StorageService } from './StorageService';

export interface DiscoveredPeer {
  peerId: string;
  displayName: string;
  host: string;
  port: number;
  lastSeen: number;
}

type DiscoveryListener = (peers: DiscoveredPeer[]) => void;

class DiscoveryService {
  private zeroconf: Zeroconf | null = null;
  private peers: Map<string, DiscoveredPeer> = new Map();
  private listeners: Set<DiscoveryListener> = new Set();
  private isScanning = false;
  private isPublishing = false;
  private appStateSubscription: any = null;
  private localPeerId = '';

  constructor() {
    try {
      this.zeroconf = new Zeroconf();
      this.setupListeners();
    } catch (err) {
      console.warn('Zeroconf init warning (e.g. running in web preview):', err);
    }
  }

  private setupListeners(): void {
    if (!this.zeroconf) return;

    this.zeroconf.on('resolved', (service: any) => {
      if (!service || !service.txt) return;

      const peerId = service.txt.peerId || service.name;
      const displayName = service.txt.displayName || service.name;
      const port = service.port ? parseInt(service.port, 10) : NETWORK_CONFIG.DEFAULT_PORT;
      const host = service.addresses && service.addresses.length > 0 ? service.addresses[0] : service.host;

      if (peerId && peerId !== this.localPeerId) {
        const peer: DiscoveredPeer = {
          peerId,
          displayName,
          host,
          port,
          lastSeen: Date.now(),
        };
        this.peers.set(peerId, peer);
        this.notify();
      }
    });

    this.zeroconf.on('remove', (name: string) => {
      for (const [id, peer] of this.peers.entries()) {
        if (peer.displayName === name || peer.peerId === name) {
          this.peers.delete(id);
          this.notify();
          break;
        }
      }
    });

    this.zeroconf.on('error', (err: any) => {
      console.error('Zeroconf error:', err);
    });
  }

  async init(): Promise<void> {
    this.localPeerId = await IdentityService.getOrCreatePeerId();

    // AppState lifecycle listener
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);

    if (AppState.currentState === 'active') {
      await this.start();
    }
  }

  private handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      await this.start();
    } else if (nextAppState.match(/inactive|background/)) {
      this.stop();
    }
  };

  async start(): Promise<void> {
    if (!this.zeroconf) return;

    const displayName = (await StorageService.getDisplayName()) || 'Unknown Node';

    if (!this.isPublishing) {
      try {
        this.zeroconf.publish(
          NETWORK_CONFIG.SERVICE_TYPE,
          'tcp',
          NETWORK_CONFIG.DOMAIN,
          `${NETWORK_CONFIG.SERVICE_NAME_PREFIX}${this.localPeerId}`,
          NETWORK_CONFIG.DEFAULT_PORT,
          {
            peerId: this.localPeerId,
            displayName,
            port: NETWORK_CONFIG.DEFAULT_PORT.toString(),
          }
        );
        this.isPublishing = true;
      } catch (err) {
        console.error('Failed to publish Zeroconf service:', err);
      }
    }

    if (!this.isScanning) {
      try {
        this.zeroconf.scan(NETWORK_CONFIG.SERVICE_TYPE, 'tcp', NETWORK_CONFIG.DOMAIN);
        this.isScanning = true;
      } catch (err) {
        console.error('Failed to scan Zeroconf:', err);
      }
    }
  }

  stop(): void {
    if (!this.zeroconf) return;

    if (this.isScanning) {
      try {
        this.zeroconf.stop();
      } catch (e) {}
      this.isScanning = false;
    }

    if (this.isPublishing) {
      try {
        this.zeroconf.unpublishService(`${NETWORK_CONFIG.SERVICE_NAME_PREFIX}${this.localPeerId}`);
      } catch (e) {}
      this.isPublishing = false;
    }
  }

  subscribe(listener: DiscoveryListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const peerList = Array.from(this.peers.values());
    this.listeners.forEach((fn) => fn(peerList));
  }

  getDiscoveredPeers(): DiscoveredPeer[] {
    return Array.from(this.peers.values());
  }

  getIsScanning(): boolean {
    return this.isScanning;
  }
}

export const discoveryService = new DiscoveryService();
