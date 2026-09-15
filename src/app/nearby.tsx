import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { typography } from '../theme/theme';
import { discoveryService, DiscoveredPeer } from '../services/DiscoveryService';
import { messageService } from '../services/MessageService';
import { ConnectionStatusDot } from '../components/ConnectionStatusDot';

export default function NearbyDevicesScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [peers, setPeers] = useState<DiscoveredPeer[]>([]);

  useEffect(() => {
    setPeers(discoveryService.getDiscoveredPeers());
    const unsubscribe = discoveryService.subscribe((updatedPeers) => {
      setPeers(updatedPeers);
    });
    return () => unsubscribe();
  }, []);

  const handleStartChat = async (peer: DiscoveredPeer) => {
    const conv = await messageService.createOrGetPeerConversation(peer);
    router.push(`/chat/${conv.id}`);
  };

  const renderItem = ({ item }: { item: DiscoveredPeer }) => (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
      <View style={styles.cardInfo}>
        <View style={styles.titleRow}>
          <ConnectionStatusDot status="online" size={10} />
          <Text style={[styles.peerName, { color: theme.textPrimary }]}>{item.displayName}</Text>
        </View>
        <Text style={[styles.peerDetails, { color: theme.textMuted }]}>
          ID: {item.peerId} • {item.host}:{item.port}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.chatBtn, { backgroundColor: theme.secondary }]}
        onPress={() => handleStartChat(item)}
        activeOpacity={0.8}
      >
        <Text style={styles.chatBtnText}>START CHAT</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerBanner}>
        <MaterialCommunityIcons name="radar" size={20} color={theme.secondary} />
        <Text style={[styles.bannerText, { color: theme.secondary }]}>
          LAN DISCOVERY ACTIVE ({peers.length} {peers.length === 1 ? 'DEVICE' : 'DEVICES'} DISCOVERED)
        </Text>
      </View>

      <FlatList
        data={peers}
        keyExtractor={(item) => item.peerId}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="wifi-off" size={48} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>NO PEERS FOUND ON LAN</Text>
            <Text style={[styles.emptySub, { color: theme.textMuted }]}>
              Ensure other devices are connected to the same local Wi-Fi or hotspot and running Hopper.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#232A2D',
    gap: 8,
  },
  bannerText: {
    fontFamily: typography.fontMono,
    fontSize: 11,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    marginRight: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  peerName: {
    fontFamily: typography.fontSans,
    fontSize: 16,
    fontWeight: 'bold',
  },
  peerDetails: {
    fontFamily: typography.fontMono,
    fontSize: 10,
  },
  chatBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  chatBtnText: {
    fontFamily: typography.fontMono,
    fontWeight: 'bold',
    fontSize: 11,
    color: '#000000',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontFamily: typography.fontMono,
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySub: {
    fontFamily: typography.fontSans,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
});
