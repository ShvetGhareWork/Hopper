import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { typography } from '../../theme/theme';
import { StorageService } from '../../services/StorageService';
import { messageService } from '../../services/MessageService';
import { discoveryService, DiscoveredPeer } from '../../services/DiscoveryService';
import { IdentityService } from '../../services/IdentityService';
import { NETWORK_CONFIG } from '../../config/network';
import { PanicButton } from '../../components/PanicButton';

export default function SettingsScreen() {
  const { mode, theme, toggleTheme } = useTheme();
  const [displayName, setDisplayName] = useState('');
  const [peerId, setPeerId] = useState('');
  const [discoveredPeers, setDiscoveredPeers] = useState<DiscoveredPeer[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    StorageService.getDisplayName().then((name) => {
      if (name) setDisplayName(name);
    });
    IdentityService.getOrCreatePeerId().then(setPeerId);

    setDiscoveredPeers(discoveryService.getDiscoveredPeers());
    const unsubscribe = discoveryService.subscribe(setDiscoveredPeers);
    return () => unsubscribe();
  }, []);

  const handleSaveName = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Callsign cannot be empty.');
      return;
    }
    await StorageService.setDisplayName(displayName.trim());
    await discoveryService.start(); // Refresh Zeroconf broadcast name
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleWipeData = async () => {
    await messageService.wipeAll();
    setDisplayName('');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        {/* APP THEME SECTION */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>APPEARANCE</Text>
        </View>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <MaterialCommunityIcons
                name={mode === 'dark' ? 'weather-night' : 'weather-sunny'}
                size={22}
                color={theme.primary}
                style={styles.icon}
              />
              <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>Dark Mode</Text>
            </View>
            <Switch
              value={mode === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: theme.primary }}
              thumbColor={mode === 'dark' ? '#000000' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* IDENTITY SECTION */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>NODE IDENTITY</Text>
        </View>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.label, { color: theme.textMuted }]}>CALLSIGN / DISPLAY NAME</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.inputBorder,
                  color: theme.textPrimary,
                },
              ]}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="e.g. Echo-1"
              placeholderTextColor={theme.textMuted}
            />
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: theme.secondary }]}
              onPress={handleSaveName}
              activeOpacity={0.8}
            >
              <Text style={styles.saveButtonText}>SAVE</Text>
            </TouchableOpacity>
          </View>
          {savedSuccess && (
            <Text style={[styles.savedText, { color: theme.secondary }]}>Callsign updated!</Text>
          )}

          <Text style={[styles.label, { color: theme.textMuted, marginTop: 12 }]}>NODE ID (UUID)</Text>
          <Text style={[styles.peerIdText, { color: theme.textPrimary }]}>{peerId || 'Generating...'}</Text>
        </View>

        {/* NETWORK DIAGNOSTICS */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>NETWORK DIAGNOSTICS (REAL)</Text>
        </View>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={styles.diagRow}>
            <Text style={[styles.diagLabel, { color: theme.textMuted }]}>mDNS Peer Discovery:</Text>
            <Text style={[styles.diagValue, { color: theme.secondary }]}>
              {discoveryService.getIsScanning() ? 'SCANNING (_hopper._tcp.)' : 'STANDBY'}
            </Text>
          </View>
          <View style={styles.diagRow}>
            <Text style={[styles.diagLabel, { color: theme.textMuted }]}>Discovered LAN Peers:</Text>
            <Text style={[styles.diagValue, { color: theme.secondary }]}>
              {discoveredPeers.length} ACTIVE PEERS
            </Text>
          </View>
          <View style={styles.diagRow}>
            <Text style={[styles.diagLabel, { color: theme.textMuted }]}>TCP Server Port:</Text>
            <Text style={[styles.diagValue, { color: theme.secondary }]}>
              LISTENING ({NETWORK_CONFIG.DEFAULT_PORT})
            </Text>
          </View>
          <View style={styles.diagRow}>
            <Text style={[styles.diagLabel, { color: theme.textMuted }]}>Internet Connection:</Text>
            <Text style={[styles.diagValue, { color: theme.danger }]}>OFFLINE (Direct LAN Only)</Text>
          </View>
        </View>

        {/* EMERGENCY / PANIC MODE */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.danger }]}>EMERGENCY ACTIONS</Text>
        </View>
        <PanicButton onWipeConfirmed={handleWipeData} variant="full" />

        {/* ABOUT INFO */}
        <View style={styles.aboutContainer}>
          <Text style={[styles.aboutTitle, { color: theme.textPrimary }]}>HOPPER MESHING ENGINE</Text>
          <Text style={[styles.aboutSub, { color: theme.textMuted }]}>v2.0.0-sprint2 • Zeroconf mDNS + TCP Transport</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: typography.fontMono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
  },
  rowLabel: {
    fontFamily: typography.fontSans,
    fontSize: 16,
    fontWeight: '500',
  },
  label: {
    fontFamily: typography.fontMono,
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    fontFamily: typography.fontSans,
    fontSize: 15,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  saveButton: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  saveButtonText: {
    fontFamily: typography.fontMono,
    fontWeight: 'bold',
    fontSize: 12,
    color: '#000000',
  },
  savedText: {
    fontFamily: typography.fontMono,
    fontSize: 11,
    marginTop: 6,
  },
  peerIdText: {
    fontFamily: typography.fontMono,
    fontSize: 12,
    fontWeight: 'bold',
  },
  diagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  diagLabel: {
    fontFamily: typography.fontMono,
    fontSize: 12,
  },
  diagValue: {
    fontFamily: typography.fontMono,
    fontSize: 12,
    fontWeight: 'bold',
  },
  aboutContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
  aboutTitle: {
    fontFamily: typography.fontMono,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  aboutSub: {
    fontFamily: typography.fontMono,
    fontSize: 10,
    marginTop: 4,
  },
});
