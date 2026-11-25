# Kafe Koding — Panduan Lengkap Demo Modul 4 (Database & Autentikasi)

Dokumen ini adalah panduan lengkap untuk pelaksanaan **Demo Praktikum Pemrograman Mobile Modul 4 (Database & Autentikasi)** di Laboratorium Informatika Universitas Muhammadiyah Malang (UMM).

Aplikasi **Kafe Koding** mengintegrasikan seluruh materi Modul 1 (UI & FlatList), Modul 2 (Navigation, Expo Router, & State), Modul 3 (External API TheMealDB), serta **Modul 4 (Penyimpanan Hardware Terenkripsi, Supabase Auth, AuthContext, Route Guards, & Cloud Database PostgreSQL dengan Row Level Security/RLS)** pada **Expo SDK 58**.

---

## 📋 Daftar Isi

1. [Kriteria Penilaian & Pemetaan Kode (100%)](#1-kriteria-penilaian--pemetaan-kode-100)
2. [Langkah Persiapan Supabase & Menjalankan Aplikasi](#2-langkah-persiapan-supabase--menjalankan-aplikasi)
3. [Penjelasan Detail Materi Modul 4 & Letak Kodingannya](#3-penjelasan-detail-materi-modul-4--letak-kodingannya)
   - [Pilar 1: Brankas Terenkripsi Hardware (Expo SecureStore)](#pilar-1-brankas-terenkripsi-hardware-expo-securestore)
   - [Pilar 2: Cloud Bridge & Custom Storage Adapter Supabase](#pilar-2-cloud-bridge--custom-storage-adapter-supabase)
   - [Pilar 3: Alur Autentikasi & 3 Aturan Emas UX Seluler](#pilar-3-alur-autentikasi--3-aturan-emas-ux-seluler)
   - [Pilar 4: Status Sesi Global (AuthContext) & Route Protection Guard](#pilar-4-status-sesi-global-authcontext--route-protection-guard)
   - [Pilar 5: Operasi Cloud Database (CRUD) & Row Level Security (RLS)](#pilar-5-operasi-cloud-database-crud--row-level-security-rls)
4. [Integrasi Tema Kafe Koding (Cloud Orders & Missions)](#4-integrasi-tema-kafe-koding-cloud-orders--missions)
5. [Bank Jawaban Pertanyaan Asisten Laboratorium (15%)](#5-bank-jawaban-pertanyaan-asisten-laboratorium-15)
6. [Bank Tantangan Live Coding 5 Menit (20%)](#6-bank-tantangan-live-coding-5-menit-20)
   - [Bagian A: 3 Soal Resmi dari Foto Proyektor Lab (Lengkap Letak & Kode)](#bagian-a-3-soal-resmi-dari-foto-proyektor-lab)
     - [Soal 1: Custom Metadata (callsign & role), Sanitasi, & Error Spesifik](#soal-1-custom-metadata-callsign--role-sanitasi-input-dan-error-spesifik)
     - [Soal 2: Sanitasi Input & Konfigurasi UX TextInput](#soal-2-sanitasi-input-emailpassword-dan-konfigurasi-ux-textinput)
     - [Soal 3: Modifikasi Query .select() Descending created_at](#soal-3-modifikasi-query-select-descending-created_at)
   - [Bagian B: 8 Soal Tambahan Variasi Kelas Lain](#bagian-b-8-soal-tambahan-variasi-kelas-lain)
     - [Variasi 1: Konfirmasi Password Saat Registrasi](#variasi-1-konfirmasi-password-saat-registrasi)
     - [Variasi 2: Validasi Panjang Password (Min 8 Karakter & Angka)](#variasi-2-validasi-panjang-password-min-8-karakter--angka)
     - [Variasi 3: Filter Query Status (.eq('status', 'pending'))](#variasi-3-filter-query-status-eqstatus-pending)
     - [Variasi 4: Pembatasan Jumlah Data (.limit(5))](#variasi-4-pembatasan-jumlah-data-limit5)
     - [Variasi 5: Konfirmasi Pop-up Alert Sebelum Logout](#variasi-5-konfirmasi-pop-up-alert-sebelum-logout)
     - [Variasi 6: Toggle Lihat/Sembunyikan Password](#variasi-6-toggle-lihatsembunyikan-password)
     - [Variasi 7: Mengambil & Menampilkan Metadata User di Header](#variasi-7-mengambil--menampilkan-metadata-user-di-header)
     - [Variasi 8: Fitur Hapus Semua Tugas Selesai (Batch Delete)](#variasi-8-fitur-hapus-semua-tugas-selesai-batch-delete)
7. [Ringkasan Pemetaan Seluruh File](#7-ringkasan-pemetaan-seluruh-file)

---

## 1. Kriteria Penilaian & Pemetaan Kode (100%)

Sesuai dengan tabel kriteria penilaian resmi pada Modul 4 (Halaman 34):

| Kriteria Penilaian | Bobot | Lokasi Implementasi dalam Proyek | Status |
|---|:---:|---|:---:|
| **Codelab 1 - 5** | **40%** | Tersedia tombol & layar uji coba untuk Codelab 1 s.d. 5 di halaman utama | ✅ Lengkap |
| **Assignment: Secure Token Storage** | **5%** | [src/lib/supabase.ts](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/lib/supabase.ts), [src/components/SecureVaultDemo.tsx](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/components/SecureVaultDemo.tsx), [src/app/vault.tsx](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/app/vault.tsx) | ✅ Lengkap |
| **Assignment: Supabase Auth Flow** | **10%** | [src/app/(auth)/login.tsx](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/app/(auth)/login.tsx) (Sign Up, Sign In, Sign Out, Loading States, Metadata) | ✅ Lengkap |
| **Assignment: Global AuthContext & Real-time Subscription** | **5%** | [src/context/AuthContext.tsx](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/context/AuthContext.tsx) (`onAuthStateChange`, `getSession`) | ✅ Lengkap |
| **Assignment: Route Protection Guards** | **5%** | [src/app/_layout.tsx](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/app/_layout.tsx) (`useSegments()`, Splash Shield, Auto-Redirect) | ✅ Lengkap |
| **Assignment: Answer Question** | **15%** | Panduan tanya-jawab teoritis dan teknis di Bagian 5 | ✅ Lengkap |
| **Assignment: Completing Challenge (Live Code 5 Min)** | **20%** | 3 Soal Resmi Foto Lab + 8 Skenario Variasi di Bagian 6 | ✅ Siap Uji |
| **TOTAL** | **100%** | | **Sempurna** |

---

## 2. Langkah Persiapan Supabase & Menjalankan Aplikasi

### A. Persiapan Akun & Project Supabase (Gratis)
1. Buka [https://supabase.com](https://supabase.com) dan masuk dengan akun GitHub Anda.
2. Buat project baru atau gunakan project yang sudah ada.
3. **PENTING (Matikan Email Confirm)**:
   - Buka menu **Authentication** ➔ **Providers** ➔ klik **Email**.
   - **Hapus centang / Matikan toggle "Confirm email"** ➔ Klik **Save**.
   - *Tujuan*: Agar akun yang baru didaftarkan bisa langsung login tanpa perlu verifikasi link di inbox email.

### B. Menjalankan Skrip SQL di Supabase SQL Editor
Buka **SQL Editor** ➔ **New Query**, lalu salin dan **Run** query berikut:

```sql
-- 1. Buat tabel missions untuk manajemen tugas cloud
CREATE TABLE IF NOT EXISTS missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL DEFAULT auth.uid(),
  title TEXT NOT NULL,
  reward_points INTEGER DEFAULT 100,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Aktifkan Row Level Security (RLS)
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;

-- 3. Kebijakan RLS (Idempotent: aman dijalankan berulang kali)
DROP POLICY IF EXISTS "Users can only view their own missions" ON missions;
CREATE POLICY "Users can only view their own missions"
ON missions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only insert their own missions" ON missions;
CREATE POLICY "Users can only insert their own missions"
ON missions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only update their own missions" ON missions;
CREATE POLICY "Users can only update their own missions"
ON missions FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only delete their own missions" ON missions;
CREATE POLICY "Users can only delete their own missions"
ON missions FOR DELETE USING (auth.uid() = user_id);

-- 4. Tabel tambahan untuk pesanan cloud Kafe Koding
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users DEFAULT auth.uid(),
  items_summary TEXT NOT NULL,
  total_price INTEGER NOT NULL,
  status TEXT DEFAULT 'diproses',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their orders" ON orders;
CREATE POLICY "Users can view their orders" ON orders FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their orders" ON orders;
CREATE POLICY "Users can insert their orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Buka izin akses dasar tabel ke role API
GRANT ALL ON TABLE public.missions TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.orders TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
```

### C. Konfigurasi File `.env`
Buka file [.env](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/.env):
```env
EXPO_PUBLIC_SUPABASE_URL=https://tlrydnycfsuxtxgsyijs.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_XOk9R7-clDN7y3SpruZODg_rP7AaBPd
```
*(Catatan: URL dasar tidak boleh memiliki akhiran `/rest/v1/`).*

### D. Menjalankan Aplikasi di Komputer & HP (Expo SDK 58)
```bash
npm install --legacy-peer-deps
npx expo start --go
```

---

## 3. Penjelasan Detail Materi Modul 4 & Letak Kodingannya

### Pilar 1: Brankas Terenkripsi Hardware (Expo SecureStore)
- **Materi yang Dipelajari:**
  - `AsyncStorage` menyimpan data berupa teks biasa (plaintext) pada file SQLite tanpa proteksi enkripsi. Sangat berbahaya untuk token JWT atau kata sandi.
  - `expo-secure-store` menggunakan enkripsi perangkat keras:
    - **Android**: Dienkripsi menggunakan AES cipher via Android Keystore.
    - **iOS**: Disimpan di Keychain terenkripsi hardware.
- **Lokasi Kodingan:**
  - [src/components/SecureVaultDemo.tsx](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/components/SecureVaultDemo.tsx):
    - Baris 27–39: `SecureStore.setItemAsync(TOKEN_KEY, inputToken.trim())` untuk menyimpan data terenkripsi.
    - Baris 42–55: `SecureStore.getItemAsync(TOKEN_KEY)` untuk membaca data.
    - Baris 58–66: `SecureStore.deleteItemAsync(TOKEN_KEY)` untuk menghapus data.
  - [src/app/vault.tsx](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/app/vault.tsx): Layar khusus untuk mendemokan brankas token hardware.

### Pilar 2: Cloud Bridge & Custom Storage Adapter Supabase
- **Materi yang Dipelajari:**
  - Library `@supabase/supabase-js` aslinya didesain untuk browser yang menggunakan `window.localStorage`.
  - Di React Native, `window.localStorage` tidak ada (`undefined`). Kita harus membuat jembatan adaptor kustom (*Custom Storage Adapter*) agar Supabase Auth menyimpan sesi JWT langsung ke hardware SecureStore.
- **Lokasi Kodingan:**
  - [src/lib/supabase.ts](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/lib/supabase.ts):
    - Baris 9–19: Objek `ExpoSecureStoreAdapter` (`getItem`, `setItem`, `removeItem`).
    - Baris 22–24: Auto-sanitizer URL (`rawUrl.replace(...)`) agar URL bersih dari `/rest/v1/`.
    - Baris 26–33: `createClient(supabaseUrl, supabaseAnonKey, { auth: { storage: ExpoSecureStoreAdapter, autoRefreshToken: true, persistSession: true } })`.
  - [src/app/index.tsx](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/app/index.tsx) Baris 53–55: `console.log("Supabase URL:", supabase.supabaseUrl)` membuktikan koneksi klien berhasil saat aplikasi dimuat.

### Pilar 3: Alur Autentikasi & 3 Aturan Emas UX Seluler
- **Materi yang Dipelajari:**
  - Alur ganda Sign In & Sign Up.
  - Metadata pengguna kustom (`callsign` dan `role`) via `options.data`.
  - 3 Aturan Emas UX Seluler (Halaman 15 Modul):
    1. **`.trim()`**: Membuang spasi tak terlihat di awal/akhir input yang sering disisipkan keyboard autocomplete.
    2. **Konfigurasi TextInput**: `keyboardType="email-address"`, `autoCapitalize="none"`, `autoCorrect={false}`.
    3. **Status Pemuatan (Loading State)**: Tombol diganti `<ActivityIndicator />` dan diberi `disabled={isLoading}` untuk mencegah double-submission.
- **Lokasi Kodingan:**
  - [src/app/(auth)/login.tsx](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/app/(auth)/login.tsx):
    - Baris 34–92: Fungsi `handleAuth()` melakukan validasi input dan memanggil `signUp` atau `signIn`.
    - Baris 140–156: Komponen `TextInput` email dengan properti UX lengkap.
    - Baris 173–186: Tombol aksi dengan `ActivityIndicator` saat `isLoading === true`.

### Pilar 4: Status Sesi Global (AuthContext) & Route Protection Guard
- **Materi yang Dipelajari:**
  - Mengelola sesi secara global menggunakan React Context API agar setiap layar mengetahui identitas pengguna tanpa *prop drilling*.
  - **Rehidrasi Startup**: Memanggil `supabase.auth.getSession()` saat cold-start untuk membaca token dari hardware SecureStore.
  - **Penyiar Real-time**: Berlangganan `supabase.auth.onAuthStateChange()` untuk menangani `SIGNED_IN`, `SIGNED_OUT`, dan `TOKEN_REFRESHED`.
  - **Route Protection Guard**: Menggunakan hook `useSegments()` dari Expo Router untuk membatasi navigasi dan menampilkan *Loading Shield* guna mencegah *layout flicker*.
- **Lokasi Kodingan:**
  - [src/context/AuthContext.tsx](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/context/AuthContext.tsx):
    - Baris 27–34: Rehidrasi awal sesi dengan `getSession()`.
    - Baris 37–42: Listener real-time `onAuthStateChange()`.
    - Baris 48–91: Fungsi `signIn`, `signUp`, dan `signOut`.
  - [src/app/_layout.tsx](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/app/_layout.tsx):
    - Baris 21–33: Evaluasi `useSegments()`: jika user belum login diarahkan ke `/(auth)/login`, jika sudah login diarahkan ke `/`.
    - Baris 36–44: Layar pemuatan halus (*Loading Shield*) saat `isLoading === true`.

### Pilar 5: Operasi Cloud Database (CRUD) & Row Level Security (RLS)
- **Materi yang Dipelajari:**
  - Operasi asinkron berbasis TypeScript ke PostgreSQL cloud: SELECT, INSERT, UPDATE, DELETE.
  - **Optimistic UI**: Memperbarui state lokal seketika (0ms) untuk responsivitas maksimal, dan melakukan *rollback* jika server gagal.
  - **Row Level Security (RLS)**: Meskipun `ANON_KEY` berada di aplikasi klien, data tetap aman karena PostgreSQL memverifikasi token JWT `auth.uid()` pada setiap baris data (`USING (auth.uid() = user_id)`).
- **Lokasi Kodingan:**
  - [src/services/missionService.ts](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/services/missionService.ts):
    - Baris 19–30: `fetchMissions()` ➔ `supabase.from('missions').select('*').order('created_at', { ascending: false })`.
    - Baris 33–59: `createMission()` ➔ `supabase.from('missions').insert([...])`.
    - Baris 62–80: `toggleMissionStatus()` ➔ `supabase.from('missions').update(...)`.
    - Baris 83–93: `deleteMission()` ➔ `supabase.from('missions').delete().eq('id', id)`.
  - [src/app/missions.tsx](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/app/missions.tsx): Implementasi Optimistic UI dan Pull-to-refresh.

---

## 4. Integrasi Tema Kafe Koding (Cloud Orders & Missions)

Sebagai bukti bahwa materi Modul 4 diterapkan pada tema aplikasi kelompok (**Kafe Koding**):
1. **Pencatatan Pesanan Otomatis ke Cloud**:
   - Di [src/app/checkout.tsx](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/app/checkout.tsx) Baris 89–98: Saat pelanggan menekan tombol **"Bayar & Selesaikan"**, pesanan otomatis tersimpan ke tabel `orders` cloud melalui `saveOrderToCloud()`, dan secara bersamaan memicu pembuatan tugas operasional barista ke tabel `missions` via `createMission()`.
2. **Header Sesi Pengguna Aktif**:
   - Di [src/app/index.tsx](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/app/index.tsx) Baris 270–308: Menampilkan banner pengguna aktif (nama & email) dengan tombol akses langsung ke *Tugas Cloud*, *Brankas Token*, dan tombol *Keluar (Sign Out)*.

---

## 5. Bank Jawaban Pertanyaan Asisten Laboratorium (15%)

### Q1: Mengapa kita tidak boleh menyimpan access token atau refresh token di AsyncStorage?
> **Jawaban:**  
> `AsyncStorage` menyimpan data dalam format teks biasa (plaintext) pada file SQLite atau direktori aplikasi tanpa enkripsi hardware. Pada perangkat yang di-root atau melalui backup ADB, siapa pun dapat menyalin data tersebut. Sebaliknya, `expo-secure-store` menggunakan **Android Keystore System** (dengan enkripsi AES) pada Android dan **iOS Keychain Service** pada iOS, di mana kunci enkripsi dikelola oleh chip keamanan perangkat keras (Hardware Security Module/Secure Enclave).

### Q2: Mengapa kita perlu membuat `ExpoSecureStoreAdapter` untuk Supabase client?
> **Jawaban:**  
> Secara bawaan, library `@supabase/supabase-js` mengasumsikan lingkungan runtime browser web yang memiliki objek `window.localStorage`. Karena React Native berjalan di atas engine JavaScript mobile (Hermes) tanpa browser DOM, `localStorage` bernilai `undefined`. Dengan menyediakan adaptor kustom yang mengimplementasikan metode `getItem`, `setItem`, dan `removeItem` menggunakan `expo-secure-store`, Supabase Auth dapat menyimpan token JWT langsung ke penyimpanan terenkripsi hardware perangkat.

### Q3: Bagaimana cara kerja Row Level Security (RLS) di Supabase, dan mengapa Anon Key aman diletakkan di aplikasi mobile?
> **Jawaban:**  
> `ANON_KEY` berfungsi sebagai pintu gerbang publik (public gateway) yang memberi tahu Supabase project mana yang dituju. Keamanan data sebenarnya tidak bergantung pada kerahasiaan `ANON_KEY`, melainkan pada **Row Level Security (RLS)** di level PostgreSQL. Setiap request yang dikirimkan oleh klien menyertakan header Authorization berisi token JWT. PostgreSQL membaca klaim `auth.uid()` dari token tersebut dan mencocokkannya dengan kebijakan RLS (misalnya `USING (auth.uid() = user_id)`). Jika token tidak cocok atau tidak ada, database otomatis menolak akses dan mengembalikan array kosong `[]`.

### Q4: Jelaskan bagaimana siklus hidup (lifecycle) sesi pengguna dihandle oleh `AuthContext`!
> **Jawaban:**  
> Terdapat dua tahap utama:
> 1. **Rehidrasi Startup (`getSession`)**: Saat aplikasi baru pertama kali dibuka (cold start), `AuthContext` memanggil `supabase.auth.getSession()` untuk membaca token dari SecureStore secara asinkron. Selama proses ini, `isLoading` bernilai `true`.
> 2. **Langganan Real-Time (`onAuthStateChange`)**: `AuthContext` mendaftarkan listener peristiwa otentikasi. Setiap kali user melakukan `SIGNED_IN`, `SIGNED_OUT`, atau `TOKEN_REFRESHED` (ketika refresh token memperbarui access token yang kedaluwarsa), event listener ini otomatis mengupdate state `session` dan `user` di seluruh aplikasi tanpa perlu reload manual.

### Q5: Mengapa kita memerlukan *Loading Shield* sebelum menjalankan pengalihan (redirect) di Route Guards?
> **Jawaban:**  
> Pada saat cold start, pembacaan token dari SecureStore memerlukan waktu beberapa milidetik. Jika Route Guard langsung memeriksa `session` sebelum rehidrasi selesai, aplikasi akan mengira user belum login (`session === null`) dan langsung me-redirect user ke halaman Login. Namun beberapa milidetik kemudian setelah token terbaca, aplikasi me-redirect lagi ke halaman Home. Efek kedipan yang mengganggu ini disebut **layout flicker**. Dengan menahan navigasi dan menampilkan `ActivityIndicator` selama `isLoading === true`, transisi antar halaman menjadi mulus dan bebas flicker.

### Q6: Apa perbedaan antara Optimistic UI dan Normal Request pada Codelab 5?
> **Jawaban:**  
> Pada *Normal Request*, UI menunggu respon dari database Supabase (biasanya 200–500ms) sebelum menambahkan item ke daftar. Pada *Optimistic UI*, kita langsung menambahkan data ke state lokal dengan temporary ID sehingga pengguna melihat item muncul seketika (0ms latency). Bersamaan dengan itu, request asynchronous dikirim ke Supabase. Jika Supabase berhasil, ID sementara diganti dengan ID asli dari server. Jika gagal (misal koneksi internet terputus), kita melakukan *rollback* dengan menghapus kembali item tersebut dari state lokal dan memunculkan notifikasi galat.

---

## 6. Bank Tantangan Live Coding 5 Menit (20%)

---

### BAGIAN A: 3 Soal Resmi dari Foto Proyektor Lab

Berikut adalah 3 soal yang ditampilkan di proyektor lab pada sesi demo, lengkap dengan kode drop-in dan lokasi barisnya:

---

#### 📌 Soal 1: Custom Metadata (callsign & role), Sanitasi Input, dan Error Spesifik
**Teks Soal:**  
*"Modifikasi fungsi autentikasi (handleAuth) agar mendukung custom user metadata (callsign dan role) saat proses Sign Up ke Supabase, lengkap dengan validasi input sanitization (.trim()) dan penanganan pesan error yang spesifik."*

**Lokasi File:**  
`src/app/(auth)/login.tsx` (di dalam fungsi `handleAuth`) dan `src/context/AuthContext.tsx`.

**Kode Lengkap Modifikasi:**
1. Di [src/app/(auth)/login.tsx](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/app/(auth)/login.tsx), cari fungsi `handleAuth`:
```typescript
const handleAuth = async () => {
  setErrorMessage(null);

  // 1. Sanitasi input dengan .trim()
  const cleanEmail = email.trim();
  const cleanPassword = password.trim();
  const cleanCallsign = callsign.trim();

  // 2. Validasi input dengan pesan error spesifik
  if (!cleanEmail) {
    setErrorMessage('Email wajib diisi.');
    return;
  }
  if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    setErrorMessage('Format email tidak valid (contoh: user@domain.com).');
    return;
  }
  if (cleanPassword.length < 6) {
    setErrorMessage('Kata sandi minimal 6 karakter.');
    return;
  }
  if (isRegistering && !cleanCallsign) {
    setErrorMessage('Nama panggilan / Callsign wajib diisi saat pendaftaran.');
    return;
  }

  setIsLoading(true);

  try {
    if (isRegistering) {
      // 3. Mengirimkan custom user metadata (callsign & role) ke Supabase Auth
      const result = await signUp(cleanEmail, cleanPassword, cleanCallsign);
      if (result.error) {
        setErrorMessage(`Pendaftaran gagal: ${result.error.message}`);
      } else {
        Alert.alert(
          'Pendaftaran Berhasil',
          `Akun ${cleanCallsign} berhasil dibuat dengan peran hero! Silakan masuk.`,
          [{ text: 'OK', onPress: () => setIsRegistering(false) }]
        );
      }
    } else {
      const result = await signIn(cleanEmail, cleanPassword);
      if (result.error) {
        setErrorMessage(
          result.error.message.includes('Invalid login credentials')
            ? 'Email atau kata sandi yang Anda masukkan salah.'
            : `Gagal masuk: ${result.error.message}`
        );
      } else {
        router.replace('/');
      }
    }
  } catch (err: any) {
    setErrorMessage(err.message || 'Terjadi kesalahan sistem.');
  } finally {
    setIsLoading(false);
  }
};
```
2. Di [src/context/AuthContext.tsx](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/context/AuthContext.tsx), pastikan fungsi `signUp` mengirimkan metadata:
```typescript
const signUp = async (email: string, password: string, callsign?: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
      options: {
        data: {
          callsign: callsign?.trim() || 'Hero',
          role: 'hero', // Metadata role khusus
        },
      },
    });
    if (error) return { error };
    return { error: null, data };
  } catch (err: any) {
    return { error: err };
  }
};
```

---

#### 📌 Soal 2: Sanitasi Input Email/Password dan Konfigurasi UX TextInput
**Teks Soal:**  
*"Tambahkan sanitasi .trim() pada input email dan password sebelum dikirim ke supabase.auth, serta perbaiki konfigurasi UX pada komponen TextInput email dengan menambahkan keyboardType="email-address", autoCapitalize="none", dan autoCorrect={false}."*

**Lokasi File:**  
`src/app/(auth)/login.tsx`

**Langkah Pengerjaan:**
1. Cari komponen `TextInput` untuk email di [src/app/(auth)/login.tsx](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/app/(auth)/login.tsx) (sekitar baris 140–155), pastikan propertinya:
```tsx
<View style={styles.inputGroup}>
  <Text style={styles.inputLabel}>EMAIL</Text>
  <TextInput
    style={styles.textInput}
    placeholder="nama@email.com"
    placeholderTextColor="#64748b"
    value={email}
    onChangeText={setEmail}
    keyboardType="email-address"   {/* Memunculkan tombol @ di keyboard ponsel */}
    autoCapitalize="none"          {/* Mencegah huruf pertama otomatis kapital */}
    autoCorrect={false}            {/* Mencegah autocorrect mengubah format email */}
    editable={!isLoading}
  />
</View>
```
2. Pastikan sebelum dikirim ke Supabase Auth, nilai email dan password disanitasi dengan `.trim()`:
```typescript
const cleanEmail = email.trim();
const cleanPassword = password.trim();

// Kirim ke supabase
await supabase.auth.signInWithPassword({
  email: cleanEmail,
  password: cleanPassword,
});
```

---

#### 📌 Soal 3: Modifikasi Query .select() Descending created_at
**Teks Soal:**  
*"Modifikasi query .select() pada tabel yang sudah ada agar data yang ditampilkan selalu terurut berdasarkan kolom created_at secara descending (data terbaru muncul paling atas)."*

**Lokasi File:**  
`src/services/missionService.ts`

**Kode Lengkap:**
Buka [src/services/missionService.ts](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/services/missionService.ts) pada fungsi `fetchMissions`:
```typescript
export async function fetchMissions(): Promise<Mission[]> {
  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .order('created_at', { ascending: false }); // <-- Modifikasi ini mengurutkan descending

  if (error) {
    console.error('Failed to fetch missions:', error.message);
    throw error;
  }
  return (data as Mission[]) || [];
}
```
*Jika aslab meminta ascending (data terlama di atas), cukup ubah `ascending: false` menjadi `ascending: true`.*

---

### BAGIAN B: 8 Soal Tambahan Variasi Kelas Lain

Berikut adalah variasi soal yang sering diberikan di kelas-kelas lain:

---

#### 🎯 Variasi 1: Konfirmasi Password Saat Registrasi
**Permintaan Aslab:**  
*"Saat mendaftar akun baru, wajib ada input konfirmasi password dan validasi bahwa password pertama dan kedua harus sama persis."*

**Langkah Pengerjaan:**
1. Buka [src/app/(auth)/login.tsx](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/app/(auth)/login.tsx).
2. Tambahkan state baru di atas:
   ```typescript
   const [confirmPassword, setConfirmPassword] = useState<string>('');
   ```
3. Di dalam `handleAuth()`, tambahkan validasi:
   ```typescript
   if (isRegistering && password.trim() !== confirmPassword.trim()) {
     setErrorMessage('Konfirmasi kata sandi tidak cocok.');
     return;
   }
   ```
4. Di bagian JSX form, tepat di bawah input `KATA SANDI`, tambahkan:
   ```tsx
   {isRegistering && (
     <View style={styles.inputGroup}>
       <Text style={styles.inputLabel}>KONFIRMASI KATA SANDI</Text>
       <TextInput
         style={styles.textInput}
         placeholder="Ulangi kata sandi..."
         placeholderTextColor="#64748b"
         value={confirmPassword}
         onChangeText={setConfirmPassword}
         secureTextEntry
         autoCapitalize="none"
         editable={!isLoading}
       />
     </View>
   )}
   ```

---

#### 🎯 Variasi 2: Validasi Panjang Password (Min 8 Karakter & Angka)
**Permintaan Aslab:**  
*"Ubah validasi password agar minimal 8 karakter dan wajib mengandung setidaknya 1 angka."*

**Langkah Pengerjaan:**
Di [src/app/(auth)/login.tsx](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/app/(auth)/login.tsx) di dalam `handleAuth()`:
```typescript
if (password.length < 8) {
  setErrorMessage('Kata sandi harus memiliki panjang minimal 8 karakter.');
  return;
}
if (!/\d/.test(password)) {
  setErrorMessage('Kata sandi wajib mengandung setidaknya 1 angka (0-9).');
  return;
}
```

---

#### 🎯 Variasi 3: Filter Query Status (.eq('status', 'pending'))
**Permintaan Aslab:**  
*"Modifikasi query SELECT agar hanya mengambil data misi yang statusnya 'pending'."*

**Langkah Pengerjaan:**
Di [src/services/missionService.ts](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/services/missionService.ts):
```typescript
export async function fetchPendingMissions(): Promise<Mission[]> {
  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .eq('status', 'pending') // Filter baris berstatus pending
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as Mission[]) || [];
}
```

---

#### 🎯 Variasi 4: Pembatasan Jumlah Data (.limit(5))
**Permintaan Aslab:**  
*"Batasi data misi yang diambil dari cloud hanya 5 data terbaru."*

**Langkah Pengerjaan:**
Di [src/services/missionService.ts](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/services/missionService.ts):
```typescript
export async function fetchMissions(): Promise<Mission[]> {
  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5); // Membatasi hanya 5 baris

  if (error) throw error;
  return (data as Mission[]) || [];
}
```

---

#### 🎯 Variasi 5: Konfirmasi Pop-up Alert Sebelum Logout
**Permintaan Aslab:**  
*"Saat tombol keluar ditekan, tampilkan Alert konfirmasi dengan tombol Batal dan Keluar."*

**Langkah Pengerjaan:**
Di [src/app/index.tsx](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/app/index.tsx) atau [src/app/missions.tsx](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/app/missions.tsx):
```typescript
const handleSignOut = () => {
  Alert.alert(
    'Konfirmasi Keluar',
    'Apakah Anda yakin ingin keluar dari akun?',
    [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]
  );
};
```

---

#### 🎯 Variasi 6: Toggle Lihat/Sembunyikan Password
**Permintaan Aslab:**  
*"Tambahkan ikon mata pada kolom password untuk melihat atau menyembunyikan kata sandi."*

**Langkah Pengerjaan:**
1. Di [src/app/(auth)/login.tsx](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/app/(auth)/login.tsx):
   ```typescript
   const [showPassword, setShowPassword] = useState<boolean>(false);
   ```
2. Ganti blok `TextInput` password menjadi:
   ```tsx
   <View style={styles.inputGroup}>
     <Text style={styles.inputLabel}>KATA SANDI</Text>
     <View style={{ flexDirection: 'row', alignItems: 'center' }}>
       <TextInput
         style={[styles.textInput, { flex: 1 }]}
         placeholder="Minimal 6 karakter..."
         placeholderTextColor="#64748b"
         value={password}
         onChangeText={setPassword}
         secureTextEntry={!showPassword}
         autoCapitalize="none"
         editable={!isLoading}
       />
       <TouchableOpacity
         style={{ position: 'absolute', right: 12 }}
         onPress={() => setShowPassword(!showPassword)}
       >
         <Ionicons
           name={showPassword ? 'eye-off-outline' : 'eye-outline'}
           size={20}
           color="#94a3af"
         />
       </TouchableOpacity>
     </View>
   </View>
   ```

---

#### 🎯 Variasi 7: Mengambil & Menampilkan Metadata User di Header
**Permintaan Aslab:**  
*"Tampilkan nama lengkap dan role user yang disimpan di user_metadata pada header halaman utama."*

**Langkah Pengerjaan:**
Di [src/app/index.tsx](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/app/index.tsx):
```typescript
const { user } = useAuth();

// Mengambil metadata dari user
const userName = user?.user_metadata?.callsign || user?.user_metadata?.name || 'Pengguna';
const userRole = user?.user_metadata?.role || 'user';
```
Di bagian JSX:
```tsx
<Text style={styles.agentName}>
  {userName} ({userRole.toUpperCase()})
</Text>
```

---

#### 🎯 Variasi 8: Fitur Hapus Semua Tugas Selesai (Batch Delete)
**Permintaan Aslab:**  
*"Tambahkan fungsi untuk menghapus semua tugas yang statusnya sudah 'completed' dari database Supabase."*

**Langkah Pengerjaan:**
1. Di [src/services/missionService.ts](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/services/missionService.ts):
   ```typescript
   export async function clearCompletedMissions(): Promise<void> {
     const { error } = await supabase
       .from('missions')
       .delete()
       .eq('status', 'completed');

     if (error) throw error;
   }
   ```
2. Di [src/app/missions.tsx](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/app/missions.tsx):
   ```typescript
   const handleClearCompleted = async () => {
     try {
       await clearCompletedMissions();
       setMissions((prev) => prev.filter((m) => m.status !== 'completed'));
       Alert.alert('Sukses', 'Semua tugas selesai telah dibersihkan.');
     } catch (err: any) {
       Alert.alert('Gagal', err.message);
     }
   };
   ```

---

## 7. Ringkasan Pemetaan Seluruh File

| File | Keterangan & Modul Terkait |
|---|---|
| [.env](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/.env) | Konfigurasi URL dan Anon Key Supabase |
| [src/lib/supabase.ts](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/lib/supabase.ts) | Klien Supabase singleton dengan `ExpoSecureStoreAdapter` |
| [src/context/AuthContext.tsx](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/context/AuthContext.tsx) | Provider sesi global, rehidrasi startup, dan listener real-time |
| [src/components/SecureVaultDemo.tsx](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/components/SecureVaultDemo.tsx) | Komponen Codelab 1 (Brankas Terenkripsi Hardware Keystore/Keychain) |
| [src/app/vault.tsx](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/app/vault.tsx) | Layar Codelab 1 untuk demo hardware token storage |
| [src/app/(auth)/login.tsx](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/app/(auth)/login.tsx) | Layar Codelab 3 Autentikasi Pengguna (Sign In, Sign Up, Metadata, UX) |
| [src/app/_layout.tsx](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/app/_layout.tsx) | Route Guard Codelab 4 navigasi dengan `useSegments()` & Loading Shield |
| [src/services/missionService.ts](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/services/missionService.ts) | Layanan CRUD PostgreSQL Supabase dengan Row Level Security (RLS) |
| [src/app/missions.tsx](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/app/missions.tsx) | Layar Codelab 5 Tugas & Pesanan Cloud dengan Optimistic UI |
| [src/app/index.tsx](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/app/index.tsx) | Katalog Kafe Koding, Header Sesi Aktif, & Akses Codelab |
| [src/app/checkout.tsx](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/app/checkout.tsx) | Pencatatan otomatis pesanan ke database cloud Supabase |
