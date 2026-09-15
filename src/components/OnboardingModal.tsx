import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { typography } from '../theme/theme';

interface OnboardingModalProps {
  visible: boolean;
  onSaveName: (name: string) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ visible, onSaveName }) => {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      setError('Please enter a valid callsign / display name.');
      return;
    }
    setError('');
    onSaveName(name.trim());
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="radio-handheld" size={48} color={theme.primary} />
          </View>
          <Text style={[styles.title, { color: theme.textPrimary }]}>HOPPER MESH</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>
            Disaster-resilient mesh communications. Choose your callsign to identify your node on the local mesh.
          </Text>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.primary }]}>NODE CALLSIGN / DISPLAY NAME</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.inputBorder,
                  color: theme.textPrimary,
                },
              ]}
              placeholder="e.g., Echo-4, Medic-1, Ranger"
              placeholderTextColor={theme.textMuted}
              value={name}
              onChangeText={(txt) => {
                setName(txt);
                if (txt.trim()) setError('');
              }}
              autoCapitalize="words"
              autoCorrect={false}
            />
            {error ? <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text> : null}
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>JOIN MESH NETWORK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 12,
  },
  title: {
    fontFamily: typography.fontMono,
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: typography.fontSans,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontFamily: typography.fontMono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  input: {
    fontFamily: typography.fontSans,
    fontSize: 16,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: {
    fontFamily: typography.fontSans,
    fontSize: 12,
    marginTop: 6,
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: typography.fontMono,
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
});
