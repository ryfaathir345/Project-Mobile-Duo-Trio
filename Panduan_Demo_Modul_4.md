# Kafe Koding — Panduan Lengkap Demo Modul 4 (Database & Autentikasi)

Dokumen ini adalah panduan lengkap untuk pelaksanaan **Demo Praktikum Pemrograman Mobile Modul 4 (Database & Autentikasi)** di Laboratorium Informatika Universitas Muhammadiyah Malang (UMM).

Aplikasi **Kafe Koding** mengintegrasikan seluruh materi Modul 1 (UI & FlatList), Modul 2 (Navigation, Expo Router, & State), Modul 3 (External API TheMealDB), serta **Modul 4 (Penyimpanan Hardware Terenkripsi, Supabase Auth, AuthContext, Route Guards, & Cloud Database PostgreSQL dengan Row Level Security/RLS)**.

---

## 📋 Daftar Isi

1. [Kriteria Penilaian & Pemetaan Kode (100%)](#1-kriteria-penilaian--pemetaan-kode-100)
2. [Langkah Persiapan Supabase & Menjalankan Aplikasi](#2-langkah-persiapan-supabase--menjalankan-aplikasi)
3. [Penjelasan Arsitektur & 5 Codelab](#3-penjelasan-arsitektur--5-codelab)
   - [Codelab 1: Brankas Terenkripsi (Expo SecureStore)](#codelab-1-brankas-terenkripsi-expo-securestore)
   - [Codelab 2: Cloud Bridge & Custom Storage Adapter](#codelab-2-cloud-bridge--custom-storage-adapter)
   - [Codelab 3: Perekrutan Pahlawan & Alur Autentikasi](#codelab-3-perekrutan-pahlawan--alur-autentikasi)
   - [Codelab 4: Penjaga Gerbang (AuthContext & Route Guards)](#codelab-4-penjaga-gerbang-authcontext--route-guards)
   - [Codelab 5: Papan Misi Taktis & Cloud PostgreSQL CRUD + RLS](#codelab-5-papan-misi-taktis--cloud-postgresql-crud--rls)
4. [Integrasi Tema Kafe Koding (Cloud Orders)](#4-integrasi-tema-kafe-koding-cloud-orders)
5. [Bank Jawaban Pertanyaan Asisten Laboratorium (15%)](#5-bank-jawaban-pertanyaan-asisten-laboratorium-15)
6. [Bank Tantangan Live Coding 5 Menit (20%)](#6-bank-tantangan-live-coding-5-menit-20)

---

## 1. Kriteria Penilaian & Pemetaan Kode (100%)

Sesuai dengan tabel kriteria penilaian resmi pada Modul 4 (Halaman 34):

| Kriteria Penilaian | Bobot | Lokasi Implementasi dalam Proyek | Status |
|---|:---:|---|:---:|
| **Codelab 1 - 5** | **40%** | Disediakan tombol & layar uji coba interaktif untuk Codelab 1 s.d. 5 | ✅ Lengkap |
| **Assignment: Secure Token Storage** | **5%** | `src/lib/supabase.ts`, `src/components/SecureVaultDemo.tsx`, `src/app/vault.tsx` | ✅ Lengkap |
| **Assignment: Supabase Auth Flow** | **10%** | `src/app/(auth)/login.tsx` (Sign Up, Sign In, Sign Out, Loading States, Callsign) | ✅ Lengkap |
| **Assignment: Global AuthContext & Real-time Subscription** | **5%** | `src/context/AuthContext.tsx` (`onAuthStateChange`, `getSession`) | ✅ Lengkap |
| **Assignment: Route Protection Guards** | **5%** | `src/app/_layout.tsx` (`useSegments()`, Splash Shield, Auto-Redirect) | ✅ Lengkap |
| **Assignment: Answer Question** | **15%** | Panduan tanya-jawab teoritis dan teknis di Bagian 5 | ✅ Lengkap |
| **Assignment: Completing Challenge (Live Code 5 Min)** | **20%** | 5 Skenario modifikasi kode beserta solusinya di Bagian 6 | ✅ Siap Uji |
| **TOTAL** | **100%** | | **Sempurna** |

---

## 2. Langkah Persiapan Supabase & Menjalankan Aplikasi

### A. Persiapan Akun & Project Supabase (Gratis)
1. Buka [https://supabase.com](https://supabase.com) dan masuk dengan akun GitHub Anda.
2. Klik **New Project**, beri nama (misalnya `Kafe-Koding`), masukkan password database, dan pilih region terdekat (misal `Singapore`).
3. **PENTING (Matikan Email Confirm)**:
   - Di sidebar kiri Supabase, buka menu **Authentication** ➔ **Providers** ➔ klik **Email**.
   - **Hapus centang / Matikan toggle "Confirm email"**.
   - Klik **Save**.
   - *Tujuan*: Agar akun yang baru didaftarkan bisa langsung login tanpa perlu verifikasi link di inbox email (Sesuai panduan Modul Hal. 16–17).

### B. Menjalankan Skrip SQL untuk Tabel & RLS (Codelab 5)
1. Di sidebar kiri Supabase, buka **SQL Editor** ➔ klik **New Query**.
2. Salin dan tempelkan skrip SQL berikut, lalu klik tombol **Run**:

```sql
-- 1. Buat tabel missions untuk Codelab 5
CREATE TABLE missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL DEFAULT auth.uid(),
  title TEXT NOT NULL,
  reward_points INTEGER DEFAULT 100,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Aktifkan Row Level Security (RLS)
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;

-- 3. Kebijakan RLS (Hanya pemilik baris data yang berhak mengakses)
CREATE POLICY "Users can only view their own missions"
ON missions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own missions"
ON missions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own missions"
ON missions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own missions"
ON missions FOR DELETE
USING (auth.uid() = user_id);

-- 4. Tabel tambahan untuk pesanan cloud Kafe Koding (Tema Integrasi)
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users DEFAULT auth.uid(),
  items_summary TEXT NOT NULL,
  total_price INTEGER NOT NULL,
  status TEXT DEFAULT 'diproses',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their orders"
ON orders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their orders"
ON orders FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### C. Konfigurasi File `.env`
Buka file `.env` di direktori proyek:
```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
*Isi URL dan Anon Key didapat dari Supabase Dashboard ➔ Project Settings ➔ API.*

### D. Menjalankan Aplikasi di Komputer & HP (Expo SDK 58)
Aplikasi telah menggunakan **Expo SDK 58** (`React Native 0.88`, `React 19.3`):
```bash
# Di terminal folder Project-Mobile-Duo-Trio:
npm install --legacy-peer-deps
npx expo start --go
```
- Pindai QR Code menggunakan aplikasi **Expo Go** di HP Android/iOS.
- Atau jalankan versi web dengan menekan huruf `w` di terminal (`npx expo start --web`).

---

## 3. Penjelasan Arsitektur & 5 Codelab

### Codelab 1: Brankas Terenkripsi (Expo SecureStore)
- **File:** `src/components/SecureVaultDemo.tsx` dan `src/app/vault.tsx`
- **Konsep Inti:**
  - `AsyncStorage` menyimpan data dalam bentuk string teks biasa (plaintext) pada file SQLite tanpa proteksi enkripsi. Sangat berbahaya untuk token JWT atau kata sandi.
  - `expo-secure-store` menggunakan enkripsi perangkat keras:
    - **Android**: Dienkripsi menggunakan AES cipher via Android Keystore.
    - **iOS**: Disimpan di Keychain terenkripsi hardware.
- **Tiga Metode Utama:**
  1. `SecureStore.setItemAsync(key, value)`: Menyimpan data terenkripsi.
  2. `SecureStore.getItemAsync(key)`: Mendekripsi dan mengambil data.
  3. `SecureStore.deleteItemAsync(key)`: Menghapus data dari brankas.

### Codelab 2: Cloud Bridge & Custom Storage Adapter
- **File:** `src/lib/supabase.ts`
- **Konsep Inti:**
  - Library `@supabase/supabase-js` aslinya didesain untuk browser yang menggunakan `window.localStorage`.
  - Di React Native, `window.localStorage` tidak tersedia, dan kita ingin token sesi disimpan dalam penyimpanan terenkripsi hardware.
  - Solusinya adalah membuat **`ExpoSecureStoreAdapter`**:
    ```typescript
    const ExpoSecureStoreAdapter = {
      getItem: (key: string) => SecureStore.getItemAsync(key),
      setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
      removeItem: (key: string) => SecureStore.deleteItemAsync(key),
    };
    ```
  - Adapter ini disuntikkan ke konfigurasi `createClient`:
    ```typescript
    export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: ExpoSecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
    ```
  - **Verifikasi**: Di `src/app/index.tsx`, terdapat `console.log("Supabase URL:", supabase.supabaseUrl);` membuktikan inisialisasi berhasil.

### Codelab 3: Perekrutan Pahlawan & Alur Autentikasi
- **File:** `src/app/(auth)/login.tsx`
- **Konsep Inti:**
  - Mengimplementasikan alur ganda: **Sign In** (Masuk) & **Sign Up** (Daftar Hero Baru).
  - Pendaftaran mengirimkan metadata khusus `callsign` (nama sandi operasional) via `options.data.callsign`.
  - **3 Aturan Emas UX Seluler (Halaman 15 Modul):**
    1. **`.trim()`**: Menghapus spasi gaib di awal/akhir email yang sering ditambahkan keyboard autocomplete.
    2. **Keyboard Config**: Menggunakan `keyboardType="email-address"`, `autoCapitalize="none"`, dan `autoCorrect={false}`.
    3. **Status Pemuatan (Loading State)**: Tombol diganti dengan `<ActivityIndicator />` dan diberi properti `disabled={isLoading}` untuk mencegah double-submission saat sinyal lambat.
  - **Error Handling**: Menampilkan pesan kesalahan ramah ("Kredensial login tidak valid") tanpa menyebabkan crash aplikasi.

### Codelab 4: Penjaga Gerbang (AuthContext & Route Guards)
- **File:** `src/context/AuthContext.tsx` dan `src/app/_layout.tsx`
- **Konsep Inti:**
  - **`AuthContext`**: Mengelola state global sesi (`session`), user aktif (`user`), dan status muat (`isLoading`).
  - **Rehidrasi Otomatis Startup**: Saat aplikasi pertama kali dibuka, memanggil `supabase.auth.getSession()` yang membaca token terenkripsi dari `SecureStore`.
  - **Penyiar Real-Time**: Berlangganan `supabase.auth.onAuthStateChange()`. Ketika user sign-in, token refresh, atau sign-out, seluruh layar otomatis diperbarui.
  - **Route Protection Guard (`_layout.tsx`)**:
    - Menggunakan hook `useSegments()` dari Expo Router untuk mendeteksi rute aktif.
    - **Rule 1**: Jika `isLoading === true`, tahan navigasi dan tampilkan layar loading perisai (mencegah *layout flicker*).
    - **Rule 2**: Jika belum login (`!session`) dan mencoba masuk ke halaman selain auth ➔ Redirect ke `/(auth)/login`.
    - **Rule 3**: Jika sudah login (`session`) dan masih di halaman login ➔ Redirect ke Markas Utama `/`.
    - **Rule 4**: Jika user menekan tombol Keluar (`signOut()`) ➔ Otomatis dikunci kembali ke `/(auth)/login`.

### Codelab 5: Papan Misi Taktis & Cloud PostgreSQL CRUD + RLS
- **File:** `src/services/missionService.ts` dan `src/app/missions.tsx`
- **Konsep Inti:**
  - **CRUD PostgreSQL Lengkap**:
    - `fetchMissions()` ➔ `supabase.from('missions').select('*').order(...)`
    - `createMission()` ➔ `supabase.from('missions').insert([...])`
    - `toggleMissionStatus()` ➔ `supabase.from('missions').update(...)`
    - `deleteMission()` ➔ `supabase.from('missions').delete().eq('id', id)`
  - **Optimistic UI**: State lokal diperbarui seketika sebelum respon Supabase kembali agar UI terasa responsif (60 FPS), dan di-rollback otomatis jika terjadi galat jaringan.
  - **Row Level Security (RLS) & Multitenancy**:
    - Meskipun kunci `EXPO_PUBLIC_SUPABASE_ANON_KEY` berada di sisi klien seluler, data tetap 100% aman karena mesin PostgreSQL di server memverifikasi token JWT (`auth.uid()`).
    - **Uji Coba Multi-Akun**:
      - Agen A (misal `shadow@hiro.command`) membuat misi.
      - Logout, lalu login dengan Agen B (misal `cyber_hawk@hiro.command`).
      - Agen B mendapatkan array kosong `[]` karena kebijakan RLS mencegah akses ke baris milik Agen A.

---

## 4. Integrasi Tema Kafe Koding (Cloud Orders)

Sebagai bukti penerapan materi Modul 4 pada tema proyek kelompok (**Kafe Koding**):
- Pada halaman **Checkout** (`src/app/checkout.tsx`):
  - Saat pelanggan menekan tombol **"Bayar & Selesaikan"**:
    1. Pesanan dicatat ke database cloud Supabase pada tabel `orders` via `saveOrderToCloud()`.
    2. Pesanan secara otomatis dibuatkan **Misi Operasional Barista** ke tabel `missions` via `createMission("Pesanan KAFE-xxxx...", points, user.id)`.
  - Ketika membuka menu **Misi (Codelab 5)**, barista/agen dapat melihat riwayat pesanan yang masuk secara real-time dan menandainya sebagai *COMPLETED* saat kopi sudah disajikan!
  - Pada halaman katalog utama (`src/app/index.tsx`), terdapat **Operative Session Bar** di bagian paling atas yang menampilkan nama sandi user aktif serta tombol cepat ke *Brankas (Codelab 1)*, *Misi (Codelab 5)*, dan *Keluar (Sign Out)*.

---

## 5. Bank Jawaban Pertanyaan Asisten Laboratorium (15%)

Berikut adalah daftar pertanyaan yang paling sering ditanyakan asisten lab saat sesi tanya-jawab individu beserta jawaban teknis yang tepat:

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

Berikut adalah skenario modifikasi langsung yang biasanya diminta aslab saat demo, beserta petunjuk letak file dan kode yang harus diubah:

---

### 🎯 Tantangan 1: Tambahkan Tombol "Hapus Semua Misi" (Clear All Completed)
**Permintaan Aslab:**  
*"Tambahkan satu tombol di layar Papan Misi untuk menghapus seluruh misi yang statusnya sudah COMPLETED sekaligus."*

**Langkah Pengerjaan:**
1. Buka file [src/services/missionService.ts](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/services/missionService.ts) dan tambahkan fungsi berikut di bagian bawah:
   ```typescript
   export async function clearCompletedMissions(): Promise<void> {
     const { error } = await supabase
       .from('missions')
       .delete()
       .eq('status', 'completed');
     if (error) throw error;
   }
   ```
2. Buka file [src/app/missions.tsx](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/app/missions.tsx):
   - Tambahkan import `clearCompletedMissions` dari `@/services/missionService`.
   - Di dalam komponen `MissionsScreen`, buat fungsi handler:
     ```typescript
     const handleClearCompleted = async () => {
       try {
         await clearCompletedMissions();
         setMissions((prev) => prev.filter((m) => m.status !== 'completed'));
         Alert.alert('Sukses', 'Semua misi selesai telah dibersihkan.');
       } catch (err: any) {
         Alert.alert('Gagal', err.message);
       }
     };
     ```
   - Pasang tombol di samping teks `TACTICAL MISSIONS`:
     ```tsx
     <TouchableOpacity onPress={handleClearCompleted}>
       <Text style={{ color: '#ef4444', fontSize: 11, fontWeight: '700' }}>Bersihkan Selesai</Text>
     </TouchableOpacity>
     ```

---

### 🎯 Tantangan 2: Tambahkan Konfirmasi Password pada Halaman Sign Up
**Permintaan Aslab:**  
*"Saat mendaftar akun baru, wajib ada input konfirmasi password dan validasi bahwa password pertama dan kedua harus sama persis."*

**Langkah Pengerjaan:**
1. Buka file [src/app/(auth)/login.tsx](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/app/(auth)/login.tsx):
2. Tambahkan state baru di atas:
   ```typescript
   const [confirmPassword, setConfirmPassword] = useState<string>('');
   ```
3. Di dalam fungsi `handleAuth()`, tambahkan pengecekan:
   ```typescript
   if (isRegistering && password !== confirmPassword) {
     setErrorMessage('Konfirmasi password tidak cocok dengan password yang dimasukkan.');
     return;
   }
   ```
4. Di bagian JSX formulir, tepat di bawah input `ACCESS PASSWORD`, tambahkan:
   ```tsx
   {isRegistering && (
     <View style={styles.inputGroup}>
       <Text style={styles.inputLabel}>CONFIRM PASSWORD</Text>
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

### 🎯 Tantangan 3: Filter Misi Berdasarkan Status (All / Active / Completed)
**Permintaan Aslab:**  
*"Tambahkan filter tab pada daftar misi untuk menampilkan hanya misi yang ACTIVE atau hanya yang COMPLETED."*

**Langkah Pengerjaan:**
1. Buka file [src/app/missions.tsx](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/app/missions.tsx):
2. Tambahkan state filter di dalam komponen:
   ```typescript
   const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
   ```
3. Filter daftar misi sebelum di-render:
   ```typescript
   const displayedMissions = missions.filter((m) => {
     if (filterStatus === 'all') return true;
     return m.status === filterStatus;
   });
   ```
4. Ubah properti `data={missions}` pada `<FlatList>` menjadi `data={displayedMissions}`.
5. Tambahkan barisan tombol tab sederhana di atas FlatList:
   ```tsx
   <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
     {(['all', 'pending', 'completed'] as const).map((tab) => (
       <TouchableOpacity
         key={tab}
         onPress={() => setFilterStatus(tab)}
         style={{
           paddingHorizontal: 12,
           paddingVertical: 4,
           borderRadius: 6,
           backgroundColor: filterStatus === tab ? '#38bdf8' : '#1e293b',
         }}
       >
         <Text style={{ color: filterStatus === tab ? '#0f172a' : '#94a3b8', fontSize: 11, fontWeight: '700' }}>
           {tab.toUpperCase()}
         </Text>
       </TouchableOpacity>
     ))}
   </View>
   ```

---

### 🎯 Tantangan 4: Ubah Default Reward Points Misi Menjadi Random / Bertingkat
**Permintaan Aslab:**  
*"Ubah nilai reward points saat dispatch misi agar otomatis mendapatkan nilai acak antara 100 s.d. 500 XP jika tidak diisi pengguna."*

**Langkah Pengerjaan:**
1. Buka file [src/app/missions.tsx](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/app/missions.tsx).
2. Di dalam fungsi `handleDispatchMission()`, cari baris:
   ```typescript
   const points = parseInt(rewardPoints, 10) || 100;
   ```
   Ganti menjadi:
   ```typescript
   const randomPoints = Math.floor(Math.random() * (500 - 100 + 1)) + 100;
   const points = parseInt(rewardPoints, 10) || randomPoints;
   ```

---

### 🎯 Tantangan 5: Menyimpan Catatan Meja Khusus pada Pesanan Cloud
**Permintaan Aslab:**  
*"Saat checkout, kirimkan informasi metode pembayaran dan nomor meja ke dalam catatan tabel orders cloud Supabase."*

**Langkah Pengerjaan:**
1. Buka file [src/app/checkout.tsx](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/app/checkout.tsx).
2. Cari pemanggilan `saveOrderToCloud` di dalam fungsi `handleConfirmOrder()`:
   ```typescript
   const summaryText = items.map((i) => `${i.qty}x ${i.name}`).join(", ");
   void saveOrderToCloud(summaryText, total, user?.id);
   ```
3. Ubah format `summaryText` agar menyertakan data tambahan:
   ```typescript
   const summaryText = `[Meja ${tableNumber} | ${paymentMethod}] ` + items.map((i) => `${i.qty}x ${i.name}`).join(", ");
   void saveOrderToCloud(summaryText, total, user?.id);
   ```

---

## 7. Ringkasan File Baru & Modifikasi

| File | Keterangan |
|---|---|
| [.env](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/.env) | Konfigurasi Supabase Project URL & Anon Key |
| [src/lib/supabase.ts](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/lib/supabase.ts) | Supabase Singleton Client dengan `ExpoSecureStoreAdapter` |
| [src/context/AuthContext.tsx](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/context/AuthContext.tsx) | Provider Sesi Global & Real-time Subscription |
| [src/components/SecureVaultDemo.tsx](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/components/SecureVaultDemo.tsx) | Komponen Codelab 1 (Brankas Terenkripsi Hardware) |
| [src/app/(auth)/login.tsx](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/app/(auth)/login.tsx) | Layar Autentikasi Sign In / Sign Up + Callsign |
| [src/app/_layout.tsx](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/app/_layout.tsx) | Route Guard Navigasi dengan `useSegments()` & Anti-Flicker Shield |
| [src/services/missionService.ts](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/services/missionService.ts) | Layanan Cloud CRUD PostgreSQL Supabase + RLS |
| [src/app/missions.tsx](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/app/missions.tsx) | Layar Codelab 5 (Papan Misi Taktis & Optimistic UI) |
| [src/app/vault.tsx](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/app/vault.tsx) | Layar Codelab 1 (Brankas Hardware Kredensial) |
| [src/app/index.tsx](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/app/index.tsx) | Operative Session Bar, Verifikasi URL Supabase, & Tombol Codelab |
| [src/app/checkout.tsx](file:///c:/Users/Rizqi%20Maulana/OneDrive/Documents/Demo%20Mobile/Project-Mobile-Duo-Trio/src/app/checkout.tsx) | Integrasi Pesanan Otomatis ke Cloud Database Supabase |
