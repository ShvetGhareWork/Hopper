import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { typography } from '../theme/theme';

interface HopBadgeProps {
  hopCount: number;
  label?: string;
}

export const HopBadge: React.FC<HopBadgeProps> = ({ hopCount, label }) => {
  const { theme } = useTheme();

  const text = label || (hopCount === 0 ? 'DIRECT' : `${hopCount} ${hopCount === 1 ? 'HOP' : 'HOPS'}`);

  return (
    <View style={[styles.badge, { backgroundColor: theme.badgeBackground, borderColor: theme.secondary }]}>
      <Text style={[styles.text, { color: theme.badgeText }]}>{text.toUpperCase()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: typography.fontMono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
