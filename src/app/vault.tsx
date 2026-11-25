import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import SecureVaultDemo from '@/components/SecureVaultDemo';
import { CoffeeTheme } from '@/constants/theme';

// ============================================================================
// Halaman Brankas Token Terenkripsi (Expo SecureStore)
// ============================================================================

export default function VaultScreen() {
  return (
    <View style={styles.screenWrapper}>
      <View style={styles.contentContainer}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: CoffeeTheme.colors.canvas,
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 720,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  introBox: {
    backgroundColor: CoffeeTheme.colors.surface,
    borderRadius: CoffeeTheme.radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: CoffeeTheme.colors.border,
    marginBottom: 12,
  },
  introTitle: {
    color: CoffeeTheme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  introDesc: {
    color: CoffeeTheme.colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  boldText: {
    color: CoffeeTheme.colors.brandSecondary,
    fontWeight: '700',
  },
});
