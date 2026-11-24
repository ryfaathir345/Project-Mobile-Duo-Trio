import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import SecureVaultDemo from '@/components/SecureVaultDemo';

// ============================================================================
// Halaman Brankas Token Terenkripsi (Expo SecureStore)
// ============================================================================

export default function VaultScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.introBox}>
        <Text style={styles.introTitle}>Penyimpanan Kredensial Aman Hardware</Text>
        <Text style={styles.introDesc}>
          Fitur ini mendemonstrasikan penyimpanan token secara aman menggunakan{' '}
          <Text style={styles.boldText}>expo-secure-store</Text>. Pada Android, data disimpan di
          Android Keystore dengan enkripsi AES. Pada iOS, data disimpan di Keychain. Token
          tetap aman dan persisten bahkan setelah aplikasi ditutup atau dimuat ulang.
        </Text>
      </View>

      <SecureVaultDemo />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1d',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  introBox: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 8,
  },
  introTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  introDesc: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 18,
  },
  boldText: {
    color: '#38bdf8',
    fontWeight: '700',
  },
});
