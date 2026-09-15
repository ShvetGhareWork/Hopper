import React, { useEffect, useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { typography } from '../../theme/theme';
import { PanicButton } from '../../components/PanicButton';
import { OnboardingModal } from '../../components/OnboardingModal';
import { StorageService } from '../../services/StorageService';
import { messageService } from '../../services/MessageService';

export default function TabLayout() {
  const { theme } = useTheme();
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    StorageService.getDisplayName().then((name) => {
      if (!name || !name.trim()) {
        setShowOnboarding(true);
      }
    });
  }, []);

  const handleSaveOnboardingName = async (name: string) => {
    await StorageService.setDisplayName(name);
    setShowOnboarding(false);
  };

  const handleWipeData = async () => {
    await messageService.wipeAll();
    setShowOnboarding(true);
  };

  return (
    <>
      <OnboardingModal
        visible={showOnboarding}
        onSaveName={handleSaveOnboardingName}
      />
      <Tabs
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.card,
          },
          headerTitleStyle: {
            fontFamily: typography.fontMono,
            fontWeight: 'bold',
            fontSize: 16,
            color: theme.textPrimary,
            letterSpacing: 1,
          },
          headerRight: () => (
            <View style={{ marginRight: 16 }}>
              <PanicButton onWipeConfirmed={handleWipeData} variant="header" />
            </View>
          ),
          tabBarStyle: {
            backgroundColor: theme.card,
            borderTopColor: theme.cardBorder,
            height: 60,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.textMuted,
          tabBarLabelStyle: {
            fontFamily: typography.fontMono,
            fontSize: 11,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'CHATS',
            headerTitle: 'HOPPER // MESH CHATS',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="message-text-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="channels"
          options={{
            title: 'CHANNELS',
            headerTitle: 'HOPPER // CHANNELS',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="pound-box-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'SETTINGS',
            headerTitle: 'HOPPER // SETTINGS',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="cog-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
