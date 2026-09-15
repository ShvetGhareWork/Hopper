import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { typography } from '../../theme/theme';
import { messageService } from '../../services/MessageService';
import { Conversation } from '../../types/models';
import { HopBadge } from '../../components/HopBadge';

export default function ChannelsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [channels, setChannels] = useState<Conversation[]>([]);

  const loadChannels = async () => {
    const list = await messageService.getChannels();
    setChannels(list);
  };

  useEffect(() => {
    loadChannels();
    const unsubscribe = messageService.subscribe(loadChannels);
    return () => unsubscribe();
  }, []);

  const pinnedChannels = channels.filter((c) => c.isSos || c.isMeshBroadcast);
  const regularChannels = channels.filter((c) => !c.isSos && !c.isMeshBroadcast);

  const renderChannelCard = (item: Conversation) => {
    let accentColor = theme.primary;
    let iconName: keyof typeof MaterialCommunityIcons.glyphMap = 'pound';

    if (item.isSos) {
      accentColor = theme.danger;
      iconName = 'alert';
    } else if (item.isMeshBroadcast) {
      accentColor = theme.secondary;
      iconName = 'rss';
    }

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.card,
          {
            backgroundColor: theme.card,
            borderColor: item.isSos ? theme.danger : theme.cardBorder,
            borderLeftWidth: 4,
            borderLeftColor: accentColor,
          },
        ]}
        activeOpacity={0.7}
        onPress={() => router.push(`/chat/${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <MaterialCommunityIcons name={iconName} size={18} color={accentColor} style={styles.icon} />
            <Text style={[styles.title, { color: item.isSos ? theme.danger : theme.textPrimary }]}>
              {item.title}
            </Text>
          </View>
          <Text style={[styles.timestamp, { color: theme.textMuted }]}>
            {item.lastMessageTimestamp}
          </Text>
        </View>

        <Text style={[styles.preview, { color: theme.textMuted }]} numberOfLines={2}>
          {item.lastMessageText}
        </Text>

        <View style={styles.cardFooter}>
          {item.isSos ? (
            <View style={[styles.sosTag, { backgroundColor: theme.danger }]}>
              <Text style={styles.sosTagText}>EMERGENCY CHANNEL</Text>
            </View>
          ) : item.isMeshBroadcast ? (
            <View style={[styles.meshTag, { backgroundColor: theme.badgeBackground, borderColor: theme.secondary }]}>
              <Text style={[styles.meshTagText, { color: theme.badgeText }]}>GLOBAL BROADCAST</Text>
            </View>
          ) : (
            <View />
          )}
          {item.hopCount !== undefined && <HopBadge hopCount={item.hopCount} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={regularChannels}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.pinnedSection}>
            <Text style={[styles.sectionTitle, { color: theme.primary }]}>PINNED MESH CHANNELS</Text>
            {pinnedChannels.map(renderChannelCard)}
            {regularChannels.length > 0 && (
              <Text style={[styles.sectionTitle, { color: theme.primary, marginTop: 16 }]}>
                PRIVATE CHANNELS
              </Text>
            )}
          </View>
        }
        renderItem={({ item }) => renderChannelCard(item)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          regularChannels.length === 0 ? null : (
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>NO CHANNELS FOUND</Text>
          )
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
  pinnedSection: {
    gap: 12,
  },
  sectionTitle: {
    fontFamily: typography.fontMono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  card: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 6,
  },
  title: {
    fontFamily: typography.fontSans,
    fontSize: 17,
    fontWeight: 'bold',
  },
  timestamp: {
    fontFamily: typography.fontMono,
    fontSize: 11,
  },
  preview: {
    fontFamily: typography.fontSans,
    fontSize: 14,
    marginBottom: 10,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sosTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sosTagText: {
    fontFamily: typography.fontMono,
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  meshTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  meshTagText: {
    fontFamily: typography.fontMono,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  emptyText: {
    fontFamily: typography.fontMono,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
  },
});
