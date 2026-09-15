import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const PEER_ID_KEY = '@hopper_peer_id';

export const IdentityService = {
  async getOrCreatePeerId(): Promise<string> {
    try {
      let peerId = await AsyncStorage.getItem(PEER_ID_KEY);
      if (!peerId) {
        peerId = `node_${Crypto.randomUUID().replace(/-/g, '').substring(0, 12)}`;
        await AsyncStorage.setItem(PEER_ID_KEY, peerId);
      }
      return peerId;
    } catch (e) {
      console.error('Error fetching peer ID:', e);
      return `node_${Date.now()}`;
    }
  },
};
