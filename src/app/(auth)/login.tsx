import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

// ============================================================================
// Autentikasi Pengguna: Sign In & Sign Up dengan Supabase Auth + SecureStore
// ============================================================================

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();

  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [callsign, setCallsign] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAuth = async () => {
    setErrorMessage(null);

    // 1. Validasi Input Dasar
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Alamat email wajib diisi.');
      return;
    }
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('Format email tidak valid (contoh: user@email.com).');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Kata sandi minimal 6 karakter.');
      return;
    }
    if (isRegistering && !callsign.trim()) {
      setErrorMessage('Nama lengkap atau panggilan wajib diisi.');
      return;
    }

    setIsLoading(true);

    try {
      if (isRegistering) {
        // Mode 1: Registrasi Akun Baru
        const result = await signUp(cleanEmail, password, callsign.trim());
        if (result.error) {
          setErrorMessage(result.error.message || 'Gagal mendaftarkan akun baru.');
        } else {
          Alert.alert(
            'Pendaftaran Berhasil 🎉',
            'Akun Anda telah berhasil dibuat! Silakan masuk dengan email dan kata sandi Anda.',
            [{ text: 'OK', onPress: () => setIsRegistering(false) }]
          );
        }
      } else {
        // Mode 2: Masuk / Sign In Akun Terdaftar
        const result = await signIn(cleanEmail, password);
        if (result.error) {
          setErrorMessage(
            result.error.message.includes('Invalid login credentials')
              ? 'Kredensial login tidak valid. Periksa email atau kata sandi Anda.'
              : result.error.message
          );
        } else {
          router.replace('/');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem autentikasi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.authBox}>
          {/* Badge Sub-header */}
          <View style={styles.badgeRow}>
            <Ionicons name="shield-checkmark" size={14} color="#38bdf8" />
            <Text style={styles.badgeText}>AUTENTIKASI PENGGUNA</Text>
          </View>

          <Text style={styles.mainTitle}>
            {isRegistering ? 'Daftar Akun Baru' : 'Masuk ke Kafe Koding'}
          </Text>
          <Text style={styles.subTitle}>
            {isRegistering
              ? 'Daftarkan nama dan email Anda untuk memulai'
              : 'Silakan masukkan email dan kata sandi Anda'}
          </Text>

          {/* Banner Error jika autentikasi gagal */}
          {errorMessage && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color="#ef4444" />
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          )}

          {/* Input Nama (Hanya saat registrasi) */}
          {isRegistering && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>NAMA LENGKAP</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Contoh: Rizqi Maulana"
                placeholderTextColor="#64748b"
                value={callsign}
                onChangeText={setCallsign}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>
          )}

          {/* Input Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>EMAIL</Text>
            <TextInput
              style={styles.textInput}
              placeholder="nama@email.com"
              placeholderTextColor="#64748b"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          {/* Input Kata Sandi */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>KATA SANDI</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Minimal 6 karakter..."
              placeholderTextColor="#64748b"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>

          {/* Tombol Eksekusi Autentikasi */}
          <TouchableOpacity
            style={[styles.actionButton, isLoading && styles.actionButtonDisabled]}
            onPress={handleAuth}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#0f172a" />
            ) : (
              <Text style={styles.actionButtonText}>
                {isRegistering ? 'Daftar Akun' : 'Masuk Sekarang'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Switch Mode Login / Register */}
          <TouchableOpacity
            style={styles.toggleModeButton}
            onPress={() => {
              setIsRegistering(!isRegistering);
              setErrorMessage(null);
            }}
            disabled={isLoading}
          >
            <Text style={styles.toggleModeText}>
              {isRegistering ? (
                <>Sudah memiliki akun? <Text style={styles.linkText}>Masuk di sini</Text></>
              ) : (
                <>Belum memiliki akun? <Text style={styles.linkText}>Daftar di sini</Text></>
              )}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#0a0f1d',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  authBox: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1f2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeText: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f9fafb',
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  errorBanner: {
    backgroundColor: '#451a1a',
    borderColor: '#dc2626',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  errorBannerText: {
    color: '#fca5a5',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#1f2937',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#374151',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#f9fafb',
    fontSize: 14,
  },
  actionButton: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '800',
  },
  toggleModeButton: {
    marginTop: 18,
    alignItems: 'center',
  },
  toggleModeText: {
    color: '#9ca3af',
    fontSize: 13,
  },
  linkText: {
    color: '#38bdf8',
    fontWeight: '700',
  },
});
