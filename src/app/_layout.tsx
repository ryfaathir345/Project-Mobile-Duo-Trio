import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// Kriteria Penilaian Modul 2: Menerapkan _layout.tsx dan <Stack.Screen>
export default function RootLayout() {
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
        {/* Screen 1: Halaman Utama (Katalog Menu & State Kafe Koding) */}
        <Stack.Screen
          name="index"
          options={{
            title: 'Kafe Koding ☕',
            headerTitleAlign: 'center',
          }}
        />

        {/* Screen 2: Halaman Detail Menu (Dynamic param reading & options) */}
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

        {/* Screen 4: Halaman Order Success (Menggunakan router.replace) */}
        <Stack.Screen
          name="order-success"
          options={{
            title: 'Pesanan Diterima',
            headerTitleAlign: 'center',
            headerBackVisible: false, // Mencegah user kembali ke proses checkout
          }}
        />

        {/* Screen Codelab 1: usecontext_example sesuai modul halaman 17 */}
        <Stack.Screen
          name="codelab1"
          options={{
            title: 'Codelab 1 - useContext',
            headerTitleAlign: 'center',
          }}
        />
      </Stack>
    </>
  );
}
