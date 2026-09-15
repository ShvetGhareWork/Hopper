import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message, Conversation, UserSettings } from '../types/models';

const KEYS = {
  DISPLAY_NAME: '@hopper_display_name',
  THEME_MODE: '@hopper_theme_mode',
  CONVERSATIONS: '@hopper_conversations',
  MESSAGES: '@hopper_messages',
};

export const StorageService = {
  async getDisplayName(): Promise<string | null> {
    return await AsyncStorage.getItem(KEYS.DISPLAY_NAME);
  },

  async setDisplayName(name: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.DISPLAY_NAME, name);
  },

  async getConversations(): Promise<Conversation[] | null> {
    const raw = await AsyncStorage.getItem(KEYS.CONVERSATIONS);
    return raw ? JSON.parse(raw) : null;
  },

  async saveConversations(conversations: Conversation[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.CONVERSATIONS, JSON.stringify(conversations));
  },

  async getMessages(): Promise<Record<string, Message[]> | null> {
    const raw = await AsyncStorage.getItem(KEYS.MESSAGES);
    return raw ? JSON.parse(raw) : null;
  },

  async saveMessages(messages: Record<string, Message[]>): Promise<void> {
    await AsyncStorage.setItem(KEYS.MESSAGES, JSON.stringify(messages));
  },

  async wipeAllData(): Promise<void> {
    await AsyncStorage.clear();
  },
};
