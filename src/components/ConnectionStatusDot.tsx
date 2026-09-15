import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export type ConnectionStatusType = 'online' | 'relay' | 'offline';

interface ConnectionStatusDotProps {
  status: ConnectionStatusType;
  size?: number;
}

export const ConnectionStatusDot: React.FC<ConnectionStatusDotProps> = ({ status, size = 10 }) => {
  const { theme } = useTheme();

  let color = theme.statusOnline;
  if (status === 'relay') color = theme.statusRelay;
  if (status === 'offline') color = theme.statusOffline;

  if (status === 'offline') {
    return (
      <View
        style={[
          styles.brokenDot,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: color,
          },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  dot: {
    marginRight: 6,
  },
  brokenDot: {
    marginRight: 6,
    borderWidth: 2,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
});
