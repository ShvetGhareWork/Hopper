import React from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider, useTheme } from '../theme/ThemeContext';
import { StatusBar } from 'expo-status-bar';

function RootLayoutNav() {
  const { mode, theme } = useTheme();

  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.card,
          },
          headerTintColor: theme.textPrimary,
          headerTitleStyle: {
            fontFamily: 'monospace',
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: theme.background,
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="chat/[id]" options={{ title: 'Chat' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutNav />
    </ThemeProvider>
  );
}
