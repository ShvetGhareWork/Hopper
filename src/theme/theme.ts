import { Platform } from 'react-native';

export interface ThemeColors {
  background: string;
  card: string;
  cardBorder: string;
  primary: string; // amber/orange
  secondary: string; // cyan-green
  textPrimary: string; // main text
  textMuted: string; // secondary text
  danger: string; // red reserved for SOS/panic
  inputBackground: string;
  inputBorder: string;
  bubbleSent: string;
  bubbleReceived: string;
  badgeBackground: string;
  badgeText: string;
  statusOnline: string;
  statusRelay: string;
  statusOffline: string;
}

export const darkTheme: ThemeColors = {
  background: '#0B0F10',
  card: '#151A1C',
  cardBorder: '#232A2D',
  primary: '#FF9F43',
  secondary: '#3DDC97',
  textPrimary: '#E8ECEC',
  textMuted: '#8A9494',
  danger: '#FF4757',
  inputBackground: '#1C2225',
  inputBorder: '#2E383C',
  bubbleSent: '#1E3A3A',
  bubbleReceived: '#1B2428',
  badgeBackground: '#1C2A26',
  badgeText: '#3DDC97',
  statusOnline: '#3DDC97',
  statusRelay: '#FF9F43',
  statusOffline: '#8A9494',
};

export const lightTheme: ThemeColors = {
  background: '#F5F7F7',
  card: '#FFFFFF',
  cardBorder: '#E1E8E8',
  primary: '#E67E22',
  secondary: '#20BF6B',
  textPrimary: '#1A1F1F',
  textMuted: '#616B6B',
  danger: '#FF4757',
  inputBackground: '#EBF0F0',
  inputBorder: '#D0D8D8',
  bubbleSent: '#D2F5E3',
  bubbleReceived: '#E2E8E8',
  badgeBackground: '#E1F8ED',
  badgeText: '#0F8043',
  statusOnline: '#20BF6B',
  statusRelay: '#E67E22',
  statusOffline: '#8A9494',
};

export const typography = {
  fontSans: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  fontMono: Platform.OS === 'ios' ? 'Courier' : 'monospace',
};
