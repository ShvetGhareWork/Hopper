import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { typography } from '../theme/theme';

interface PanicButtonProps {
  onWipeConfirmed: () => void;
  variant?: 'header' | 'full';
  style?: ViewStyle;
}

export const PanicButton: React.FC<PanicButtonProps> = ({ onWipeConfirmed, variant = 'full', style }) => {
  const { theme } = useTheme();

  const handlePress = () => {
    Alert.alert(
      'PANIC MODE',
      'This will wipe all local messages and settings. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'WIPE ALL DATA',
          style: 'destructive',
          onPress: () => {
            onWipeConfirmed();
            Alert.alert('Data Wiped', 'Local data wiped');
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (variant === 'header') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        style={[styles.headerButton, { backgroundColor: theme.danger }]}
        activeOpacity={0.8}
        accessibilityLabel="Panic Button"
      >
        <MaterialCommunityIcons name="alert-octagon" size={18} color="#FFFFFF" />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.fullButton, { backgroundColor: theme.danger }, style]}
      activeOpacity={0.8}
    >
      <MaterialCommunityIcons name="alert-octagon" size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
      <Text style={styles.fullButtonText}>PANIC MODE (WIPE DATA)</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  headerButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  fullButtonText: {
    color: '#FFFFFF',
    fontFamily: typography.fontMono,
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
});
