import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  Alert,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import { CoffeeTheme } from '@/constants/theme';

// ============================================================================
// Brankas Terenkripsi (Penyimpanan Token Persisten via Expo SecureStore)
// Menggunakan hardware-backed Keychain (iOS) & Keystore (Android)
// ============================================================================

const TOKEN_KEY = 'user_auth_token';

export default function SecureVaultDemo() {
  const [inputToken, setInputToken] = useState<string>('');
  const [vaultValue, setVaultValue] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Penyimpanan siap digunakan.');

  // 1. Simpan token terenkripsi ke hardware SecureStore
  const handleSaveToken = async () => {
    if (!inputToken.trim()) {
      Alert.alert('Peringatan', 'Masukkan token terlebih dahulu.');
      return;
    }
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(TOKEN_KEY, inputToken.trim());
        }
        setStatusMessage('Token tersimpan di Web Storage.');
      } else {
        await SecureStore.setItemAsync(TOKEN_KEY, inputToken.trim());
        setStatusMessage('Token berhasil disimpan ke SecureStore terenkripsi hardware.');
      }
      setInputToken('');
    } catch (error: any) {
      setStatusMessage(`Gagal menyimpan: ${error.message}`);
    }
  };

  // 2. Ambil token dari hardware SecureStore
  const handleLoadToken = async () => {
    try {
      let stored: string | null = null;
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          stored = window.localStorage.getItem(TOKEN_KEY);
        }
      } else {
        stored = await SecureStore.getItemAsync(TOKEN_KEY);
      }

      if (stored) {
        setVaultValue(stored);
        setStatusMessage(
          Platform.OS === 'web'
            ? 'Token berhasil dimuat dari Web Storage.'
            : 'Token berhasil dimuat dari hardware SecureStore.'
        );
      } else {
        setVaultValue(null);
        setStatusMessage(
          Platform.OS === 'web'
            ? 'Tidak ada token di storage.'
            : 'Tidak ada token yang tersimpan di brankas.'
        );
      }
    } catch (error: any) {
      setStatusMessage(`Gagal membaca: ${error.message}`);
    }
  };

  // 3. Hapus token dari hardware SecureStore
  const handleWipeToken = async () => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(TOKEN_KEY);
        }
      } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      }
      setVaultValue(null);
      setStatusMessage(
        Platform.OS === 'web'
          ? 'Token berhasil dihapus dari storage.'
          : 'Token berhasil dihapus dari SecureStore.'
      );
    } catch (error: any) {
      setStatusMessage(`Gagal menghapus: ${error.message}`);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons
          name="shield-checkmark-outline"
          size={20}
          color={CoffeeTheme.colors.brandSecondary}
        />
        <Text style={styles.title}>Brankas Token Terenkripsi</Text>
      </View>
      <Text style={styles.subtitle}>
        Penyimpanan Kredensial Aman Hardware (Keystore & Keychain)
      </Text>

      <View style={styles.platformBadge}>
        <Text style={styles.platformText}>
          Platform: {Platform.OS.toUpperCase()} ({Platform.OS === 'web' ? 'Web LocalStorage' : 'Hardware Security Module'})
        </Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Masukkan token rahasia / sesi..."
        placeholderTextColor={CoffeeTheme.colors.textMuted}
        value={inputToken}
        onChangeText={setInputToken}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.btnPrimary} onPress={handleSaveToken}>
          <Ionicons name="save-outline" size={15} color="#ffffff" />
          <Text style={styles.btnPrimaryText}>Simpan Token</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnSecondary} onPress={handleLoadToken}>
          <Ionicons
            name="download-outline"
            size={15}
            color={CoffeeTheme.colors.textPrimary}
          />
          <Text style={styles.btnSecondaryText}>Muat Token</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnDanger} onPress={handleWipeToken}>
          <Ionicons
            name="trash-outline"
            size={15}
            color={CoffeeTheme.colors.spicyRed}
          />
          <Text style={styles.btnDangerText}>Hapus Token</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.statusText}>{statusMessage}</Text>

      {vaultValue !== null && (
        <View style={styles.vaultResult}>
          <Text style={styles.vaultLabel}>NILAI TOKEN TERSIMPAN:</Text>
          <Text style={styles.vaultToken}>{vaultValue}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CoffeeTheme.colors.surface,
    borderRadius: CoffeeTheme.radii.lg,
    padding: 18,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: CoffeeTheme.colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: CoffeeTheme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: CoffeeTheme.colors.textSecondary,
    marginTop: 2,
    marginBottom: 8,
  },
  platformBadge: {
    backgroundColor: CoffeeTheme.colors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: CoffeeTheme.radii.sm,
    alignSelf: 'flex-start',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: CoffeeTheme.colors.borderSubtle,
  },
  platformText: {
    color: CoffeeTheme.colors.brandSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  input: {
    backgroundColor: CoffeeTheme.colors.surfaceSubtle,
    color: CoffeeTheme.colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: CoffeeTheme.radii.md,
    fontSize: 13,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: CoffeeTheme.colors.border,
    outlineStyle: 'none' as any,
  },
  buttonGroup: {
    gap: 8,
  },
  btnPrimary: {
    backgroundColor: CoffeeTheme.colors.brand,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: CoffeeTheme.radii.md,
    gap: 6,
  },
  btnPrimaryText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  btnSecondary: {
    backgroundColor: CoffeeTheme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: CoffeeTheme.colors.border,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: CoffeeTheme.radii.md,
    gap: 6,
  },
  btnSecondaryText: {
    color: CoffeeTheme.colors.textPrimary,
    fontWeight: '600',
    fontSize: 13,
  },
  btnDanger: {
    backgroundColor: CoffeeTheme.colors.spicyRedBg,
    borderWidth: 1,
    borderColor: CoffeeTheme.colors.spicyRedBorder,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: CoffeeTheme.radii.md,
    gap: 6,
  },
  btnDangerText: {
    color: CoffeeTheme.colors.spicyRed,
    fontWeight: '700',
    fontSize: 13,
  },
  statusText: {
    color: CoffeeTheme.colors.textSecondary,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  vaultResult: {
    marginTop: 12,
    padding: 12,
    backgroundColor: CoffeeTheme.colors.surfaceSubtle,
    borderRadius: CoffeeTheme.radii.md,
    borderLeftWidth: 3,
    borderLeftColor: CoffeeTheme.colors.brandSecondary,
    borderWidth: 1,
    borderColor: CoffeeTheme.colors.border,
  },
  vaultLabel: {
    color: CoffeeTheme.colors.brandSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  vaultToken: {
    color: CoffeeTheme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
});
