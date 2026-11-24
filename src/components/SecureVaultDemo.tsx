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
      await SecureStore.setItemAsync(TOKEN_KEY, inputToken.trim());
      setStatusMessage('Token berhasil disimpan ke SecureStore terenkripsi hardware.');
      setInputToken('');
    } catch (error: any) {
      setStatusMessage(`Gagal menyimpan: ${error.message}`);
    }
  };

  // 2. Ambil token dari hardware SecureStore
  const handleLoadToken = async () => {
    try {
      const stored = await SecureStore.getItemAsync(TOKEN_KEY);
      if (stored) {
        setVaultValue(stored);
        setStatusMessage('Token berhasil dimuat dari hardware SecureStore.');
      } else {
        setVaultValue(null);
        setStatusMessage('Tidak ada token yang tersimpan.');
      }
    } catch (error: any) {
      setStatusMessage(`Gagal membaca: ${error.message}`);
    }
  };

  // 3. Hapus token dari hardware SecureStore
  const handleWipeToken = async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      setVaultValue(null);
      setStatusMessage('Token berhasil dihapus dari SecureStore.');
    } catch (error: any) {
      setStatusMessage(`Gagal menghapus: ${error.message}`);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={24} color="#38bdf8" />
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
        placeholder="Masukkan token rahasia / API token..."
        placeholderTextColor="#64748b"
        value={inputToken}
        onChangeText={setInputToken}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.btnPrimary} onPress={handleSaveToken}>
          <Ionicons name="save-outline" size={16} color="#0f172a" />
          <Text style={styles.btnPrimaryText}>Simpan Token</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnSecondary} onPress={handleLoadToken}>
          <Ionicons name="download-outline" size={16} color="#f8fafc" />
          <Text style={styles.btnSecondaryText}>Muat Token</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnDanger} onPress={handleWipeToken}>
          <Ionicons name="trash-outline" size={16} color="#ef4444" />
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
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
    marginBottom: 8,
  },
  platformBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  platformText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#1e293b',
    color: '#f8fafc',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    fontSize: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  buttonGroup: {
    gap: 8,
  },
  btnPrimary: {
    backgroundColor: '#f8fafc',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  btnPrimaryText: {
    color: '#0f172a',
    fontWeight: '700',
    fontSize: 14,
  },
  btnSecondary: {
    backgroundColor: '#334155',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  btnSecondaryText: {
    color: '#f8fafc',
    fontWeight: '600',
    fontSize: 14,
  },
  btnDanger: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#ef4444',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  btnDangerText: {
    color: '#ef4444',
    fontWeight: '700',
    fontSize: 14,
  },
  statusText: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  vaultResult: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#1e293b',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#38bdf8',
  },
  vaultLabel: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
  },
  vaultToken: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
});
