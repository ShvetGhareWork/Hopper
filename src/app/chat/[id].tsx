import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { typography } from '../../theme/theme';
import { messageService } from '../../services/MessageService';
import { Message, Conversation } from '../../types/models';
import { HopBadge } from '../../components/HopBadge';
import { ConnectionStatusDot } from '../../components/ConnectionStatusDot';

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const router = useRouter();

  const [conversation, setConversation] = useState<Conversation | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const loadData = async () => {
    if (!id) return;
    const conv = await messageService.getConversationById(id);
    setConversation(conv);
    const msgs = await messageService.getMessagesForConversation(id);
    setMessages(msgs);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = messageService.subscribe(loadData);
    return () => unsubscribe();
  }, [id]);

  const handleSend = async () => {
    if (!inputText.trim() || !id) return;
    const textToSend = inputText.trim();
    setInputText('');
    await messageService.sendMessage(id, textToSend);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.isSentByMe;

    return (
      <View style={[styles.messageRow, isMe ? styles.rowSent : styles.rowReceived]}>
        <View
          style={[
            styles.bubble,
            isMe
              ? [styles.bubbleSent, { backgroundColor: theme.bubbleSent, borderColor: theme.secondary }]
              : [styles.bubbleReceived, { backgroundColor: theme.bubbleReceived, borderColor: theme.cardBorder }],
          ]}
        >
          {!isMe && <Text style={[styles.senderName, { color: theme.primary }]}>{item.senderName}</Text>}
          <Text style={[styles.messageText, { color: theme.textPrimary }]}>{item.text}</Text>

          <View style={styles.messageMeta}>
            <Text style={[styles.timestamp, { color: theme.textMuted }]}>{item.timestamp}</Text>
            {item.relayStatus === 'pending' ? (
              <Text style={[styles.pendingText, { color: theme.primary }]}>RECOVERY HOPPING...</Text>
            ) : (
              <HopBadge hopCount={item.hopCount} />
            )}
          </View>
        </View>
      </View>
    );
  };

  const isSosChannel = conversation?.isSos;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <Stack.Screen
        options={{
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <Text
                style={[
                  styles.headerTitle,
                  { color: isSosChannel ? theme.danger : theme.textPrimary },
                ]}
                numberOfLines={1}
              >
                {conversation?.title || 'Chat'}
              </Text>
              {conversation?.peerStatus && (
                <View style={styles.headerSubtitleRow}>
                  <ConnectionStatusDot status={conversation.peerStatus} size={8} />
                  <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>
                    {conversation.peerStatus.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          ),
          headerStyle: {
            backgroundColor: theme.card,
          },
          headerTintColor: isSosChannel ? theme.danger : theme.primary,
        }}
      />

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={[styles.inputContainer, { backgroundColor: theme.card, borderTopColor: theme.cardBorder }]}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.inputBackground,
              borderColor: theme.inputBorder,
              color: theme.textPrimary,
            },
          ]}
          placeholder={isSosChannel ? 'Broadcast SOS alert...' : 'Type mesh message...'}
          placeholderTextColor={theme.textMuted}
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: isSosChannel ? theme.danger : theme.primary },
            !inputText.trim() && styles.disabledSend,
          ]}
          onPress={handleSend}
          disabled={!inputText.trim()}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="send" size={20} color="#000000" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerTitleContainer: {
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: typography.fontMono,
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  headerSubtitle: {
    fontFamily: typography.fontMono,
    fontSize: 10,
  },
  messageList: {
    padding: 16,
    gap: 12,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  rowSent: {
    justifyContent: 'flex-end',
  },
  rowReceived: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  bubbleSent: {
    borderBottomRightRadius: 2,
  },
  bubbleReceived: {
    borderBottomLeftRadius: 2,
  },
  senderName: {
    fontFamily: typography.fontMono,
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  messageText: {
    fontFamily: typography.fontSans,
    fontSize: 15,
    lineHeight: 20,
  },
  messageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 12,
  },
  timestamp: {
    fontFamily: typography.fontMono,
    fontSize: 10,
  },
  pendingText: {
    fontFamily: typography.fontMono,
    fontSize: 9,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    fontFamily: typography.fontSans,
    fontSize: 15,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledSend: {
    opacity: 0.5,
  },
});
