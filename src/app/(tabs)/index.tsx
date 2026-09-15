import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { typography } from '../../theme/theme';
import { messageService } from '../../services/MessageService';
import { Conversation } from '../../types/models';
import { ConnectionStatusDot } from '../../components/ConnectionStatusDot';
import { HopBadge } from '../../components/HopBadge';

export default function ChatsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [chats, setChats] = useState<Conversation[]>([]);

  const loadChats = async () => {
    const list = await messageService.getChatList();
    setChats(list);
  };

  useEffect(() => {
    loadChats();
    const unsubscribe = messageService.subscribe(loadChats);
    return () => unsubscribe();
  }, []);

  const renderItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.cardBorder },
      ]}
      activeOpacity={0.7}
      onPress={() => router.push(`/chat/${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.nameRow}>
          <ConnectionStatusDot status={item.peerStatus || 'offline'} size={10} />
          <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={1}>
            {item.title}
          </Text>
        </View>
        <Text style={[styles.timestamp, { color: theme.textMuted }]}>
          {item.lastMessageTimestamp}
        </Text>
      </View>

      <View style={styles.cardFooter}>
        <Text style={[styles.messagePreview, { color: theme.textMuted }]} numberOfLines={1}>
          {item.lastMessageText}
        </Text>
        {item.hopCount !== undefined && <HopBadge hopCount={item.hopCount} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <TouchableOpacity
            style={[styles.discoverBanner, { backgroundColor: theme.card, borderColor: theme.secondary }]}
            onPress={() => router.push('/nearby')}
            activeOpacity={0.8}
          >
            <View style={styles.discoverLeft}>
              <MaterialCommunityIcons name="radar" size={20} color={theme.secondary} />
              <Text style={[styles.discoverText, { color: theme.textPrimary }]}>NEARBY LAN DEVICES</Text>
            </View>
            <View style={styles.discoverRight}>
              <Text style={[styles.discoverAction, { color: theme.secondary }]}>SCAN & DISCOVER</Text>
              <MaterialCommunityIcons name="chevron-right" size={18} color={theme.secondary} />
            </View>
          </TouchableOpacity>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              NO DIRECT PEER CHATS
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
  listContent: {
    padding: 16,
    gap: 12,
  },
  discoverBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
  },
  discoverLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  discoverText: {
    fontFamily: typography.fontMono,
    fontSize: 13,
    fontWeight: 'bold',
  },
  discoverRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discoverAction: {
    fontFamily: typography.fontMono,
    fontSize: 11,
    fontWeight: 'bold',
    marginRight: 2,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontFamily: typography.fontSans,
    fontSize: 16,
    fontWeight: '600',
  },
  timestamp: {
    fontFamily: typography.fontMono,
    fontSize: 11,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messagePreview: {
    fontFamily: typography.fontSans,
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontFamily: typography.fontMono,
    fontSize: 12,
  },
});
