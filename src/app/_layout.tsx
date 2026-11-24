import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../context/AuthContext';

// ============================================================================
// CODELAB 4: Penjaga Gerbang (AuthContext & Route Guard Navigation)
// Mengamankan rute aplikasi dengan useSegments() dan sesi Supabase terenkripsi
// ============================================================================

function RootLayoutNav() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // 1. Loading Shield: Hindari pengalihan prematur saat sesi sedang dihidrasi
    if (isLoading) return;

    // Periksa apakah rute saat ini berada dalam grup (auth)
    const currentSegments = segments as string[];
    const inAuthGroup = currentSegments[0] === '(auth)' || currentSegments[0] === 'login';

    // 2. Navigation Guard Rules (Modul 4 Hal. 22-24)
    if (!session && !inAuthGroup) {
      // User belum terautentikasi dan mencoba akses area privat -> Arahkan ke Login
      router.replace('/(auth)/login' as any);
    } else if (session && inAuthGroup) {
      // User sudah login dan masih di layar login -> Arahkan ke Markas Utama /
      router.replace('/' as any);
    }
  }, [session, isLoading, segments, router]);

  // Tampilkan layar loading halus untuk menghilangkan flicker tata letak
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#38bdf8" />
        <Text style={styles.loadingText}>Memeriksa Sesi Pengguna...</Text>
        <Text style={styles.loadingSubtext}>Penyimpanan Terenkripsi Hardware (SecureStore)</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#ffffff',
          },
          headerTintColor: '#1e293b',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: '#f8fafc',
          },
        }}
      >
        {/* Screen Autentikasi (Codelab 3) */}
        <Stack.Screen
          name="(auth)/login"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="login"
          options={{
            headerShown: false,
          }}
        />

        {/* Screen 1: Halaman Utama (Katalog Menu Kafe Koding & Command HQ) */}
        <Stack.Screen
          name="index"
          options={{
            title: 'Kafe Koding ☕',
            headerTitleAlign: 'center',
          }}
        />

        {/* Screen: Tugas & Pesanan Cloud Database */}
        <Stack.Screen
          name="missions"
          options={{
            title: 'Tugas & Pesanan Cloud 📋',
            headerTitleAlign: 'center',
            headerStyle: { backgroundColor: '#0f172a' },
            headerTintColor: '#f8fafc',
          }}
        />

        {/* Screen: Hardware Encrypted Vault Demo */}
        <Stack.Screen
          name="vault"
          options={{
            title: 'Brankas Token Terenkripsi 🔐',
            headerTitleAlign: 'center',
            headerStyle: { backgroundColor: '#0f172a' },
            headerTintColor: '#f8fafc',
          }}
        />

        {/* Screen 2: Halaman Detail Menu */}
        <Stack.Screen
          name="detail"
          options={{
            title: 'Detail Menu',
            headerTitleAlign: 'center',
            headerBackTitle: 'Menu',
          }}
        />

        {/* Screen 3: Halaman Konfirmasi Pesanan / Checkout */}
        <Stack.Screen
          name="checkout"
          options={{
            title: 'Konfirmasi Pesanan',
            headerTitleAlign: 'center',
            headerBackTitle: 'Kembali',
          }}
        />

        {/* Screen 4: Halaman Order Success */}
        <Stack.Screen
          name="order-success"
          options={{
            title: 'Pesanan Diterima',
            headerTitleAlign: 'center',
            headerBackVisible: false,
          }}
        />

        {/* Screen Demo Tema Dark Mode */}
        <Stack.Screen
          name="codelab1"
          options={{
            title: 'Demo Tema Dark Mode',
            headerTitleAlign: 'center',
          }}
        />

        {/* Screen Filter Hitam Putih */}
        <Stack.Screen
          name="filter"
          options={{
            title: 'Filter Hitam Putih',
            headerTitleAlign: 'center',
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0f1d',
  },
  loadingText: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 16,
  },
  loadingSubtext: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 4,
  },
});
