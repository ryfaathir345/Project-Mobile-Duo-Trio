# ☕ Panduan Demo Modul 2: State, Hooks, & Navigasi Page (Kafe Koding)

Dokumen ini adalah panduan lengkap untuk menghadapi **Pekan Demo Modul 2**, mencakup ringkasan implementasi kriteria penilaian (100%), penjelasan teori untuk menjawab pertanyaan Asisten Lab (Aslab), serta cheat-sheet **Live Code Modification** (tantangan modifikasi langsung di tempat).

---

## 🏆 Checklist Kriteria Penilaian Tugas Pekan Demo (Bobot 60%)

| Kriteria Penilaian | Bobot | Lokasi Implementasi dalam Proyek | Status |
| :--- | :---: | :--- | :---: |
| **Hook `useState` & `useEffect`** | 10% | `src/app/index.tsx`, `detail.tsx`, `checkout.tsx`, `order-success.tsx` | ✅ Lengkap |
| **`push()`, `back()`, dan 1 fungsi Expo Router lainnya** | 10% | `router.push()` (buka detail & checkout), `router.back()` (tombol kembali), `router.replace()` (setelah checkout), `router.canGoBack()` (fallback aman), `useLocalSearchParams()` | ✅ Lengkap |
| **`_layout.tsx` dan `<Stack.Screen>`** | 10% | `src/app/_layout.tsx` (Menggunakan Stack Navigator & Stack.Screen) | ✅ Lengkap |
| **Menjawab Pertanyaan Aslab** | 15% | Bab 2 panduan ini (Q&A Konsep) | 💡 Siap |
| **Menyelesaikan Modifikasi Kode** | 15% | Bab 3 panduan ini (Prediksi Live Coding) | 💡 Siap |

---

## 🧭 Arsitektur Navigasi & File Proyek

```text
src/
├── app/
│   ├── _layout.tsx         -> Root Stack Layout dengan <Stack.Screen>
│   ├── index.tsx           -> Halaman Utama Kafe (Katalog, Filter, useState, useEffect, router.push)
│   ├── detail.tsx          -> Halaman Detail Menu (useLocalSearchParams, stepper qty, router.back)
│   ├── checkout.tsx        -> Halaman Checkout & Pembayaran (router.replace)
│   ├── order-success.tsx   -> Nota Pesanan Sukses (router.replace ke home)
│   └── codelab1.tsx        -> Screen interaktif untuk Codelab 1 (useContext Dark Mode)
├── data/
│   └── menuData.ts         -> Interface MenuItem & Array of Objects data menu kafe
└── usecontext_example.tsx  -> File Codelab-1 (sesuai instruksi Modul 2 hal. 17)
```

---

## 🗣️ Bagian 1: Jawaban Pertanyaan Teori Aslab (Bobot 15%)

### 1. Apa perbedaan variabel biasa dengan `useState`?
> **Jawaban:**
> Variabel biasa jika nilainya diubah **tidak akan memicu re-render** pada komponen, sehingga perubahan nilai tidak langsung terlihat di layar (UI).
> Sedangkan `useState` adalah hook React yang ketika fungsi setter-nya dipanggil (misal: `setCart(...)` atau `setQuantity(...)`), React Native secara otomatis akan **me-render ulang (re-render) komponen** agar tampilan UI selalu mencerminkan nilai data terbaru secara real-time.

### 2. Bagaimana cara kerja `useEffect()` dan apa arti dependency array `[]`?
> **Jawaban:**
> `useEffect` digunakan untuk menjalankan efek samping (*side effect*) pada komponen.
> - **Dependency kosong `[]`**: Fungsi di dalam `useEffect` hanya dieksekusi **satu kali** setelah komponen selesai di-render untuk pertama kali (*initial mount*), sangat ideal untuk inisialisasi atau simulasi data fetching (seperti di `index.tsx`).
> - **Dependency berisi variabel `[cart]`**: Fungsi akan dieksekusi setiap kali nilai state `cart` berubah (digunakan di `index.tsx` untuk menghitung ulang total belanja).
> - **Tanpa dependency array**: Efek akan dijalankan terus-menerus pada setiap render.

### 3. Kapan kita menggunakan `router.push()` vs `router.replace()`?
> **Jawaban:**
> - **`router.push()`**: Menambahkan screen baru ke **paling atas tumpukan (stack)**. Halaman sebelumnya tetap tersimpan di riwayat, sehingga pengguna bisa menekan tombol **Back** untuk kembali. Cocok untuk navigasi dari daftar menu ke halaman detail (`index.tsx` -> `detail.tsx`).
> - **`router.replace()`**: **Menggantikan** screen saat ini dan menghapus halaman lama dari riwayat stack navigasi. Pengguna tidak bisa menekan tombol back untuk kembali ke halaman sebelumnya. Sangat penting digunakan pada proses checkout (`checkout.tsx` -> `order-success.tsx`) agar pengguna tidak bisa kembali ke formulir checkout yang sudah dibayar.

### 4. Untuk apa fungsi `router.canGoBack()`?
> **Jawaban:**
> `router.canGoBack()` mengembalikan boolean (`true` / `false`) untuk memeriksa apakah ada riwayat halaman sebelumnya di dalam stack. Jika ada, aman memanggil `router.back()`. Jika tidak ada (misal dibuka lewat tautan langsung/deep link), kita bisa mengarahkannya kembali ke beranda dengan fallback `router.replace('/')`.

### 5. Apa fungsi `useLocalSearchParams()`?
> **Jawaban:**
> `useLocalSearchParams()` adalah hook dari Expo Router untuk membaca parameter URL atau parameter route dinamis yang dikirimkan saat navigasi (misalnya membaca parameter `id` menu di `detail.tsx`, atau membaca `cartJson` di `checkout.tsx`).

### 6. Apa fungsi `_layout.tsx` dan `<Stack.Screen>`?
> **Jawaban:**
> `_layout.tsx` adalah private route yang berfungsi sebagai parent layout pembungkus untuk seluruh halaman di dalam foldernya. Dengan menggunakan `<Stack>`, kita mengaktifkan Stack Navigator. Komponen `<Stack.Screen>` digunakan untuk mengatur opsi tiap layar secara deklaratif, seperti judul header (`title`), visibilitas header (`headerShown`), tombol kembali (`headerBackVisible`), dan gaya tampilan.

---

## ⚡ Bagian 2: Prediksi Live Code Modification Aslab (Bobot 15%)

Saat sesi demo, aslab akan meminta kamu memodifikasi kode secara langsung. Berikut perkiraan tantangan yang paling sering keluar beserta kodenya:

---

### 🎯 Tantangan 1: Menambah Filter Baru (Misal: Filter Menu Murah < Rp 20.000)
**🗣️ Aslab:** *"Coba tambahkan tombol filter untuk menampilkan hanya menu yang harganya di bawah 20 ribu!"*

**Langkah Pengerjaan di `src/app/index.tsx`:**
1. Tambahkan state baru di atas:
```tsx
const [isUnder20k, setIsUnder20k] = useState<boolean>(false);
```
2. Update filter logika `filteredMenu`:
```tsx
const filteredMenu = menuList.filter((item) => {
  const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
  const matchesCategory = selectedCategory === "Semua" || item.category === selectedCategory;
  const matchesSpicy = isSpicyOnly ? item.isSpicy : true;
  const matchesPrice = isUnder20k ? item.price < 20000 : true; // <--- TAMBAHKAN INI
  return matchesSearch && matchesCategory && matchesSpicy && matchesPrice;
});
```
3. Tambahkan tombol di samping toggle pedas:
```tsx
<TouchableOpacity
  style={[styles.spicyToggle, isUnder20k && { backgroundColor: "#dcfce7", borderColor: "#22c55e" }]}
  onPress={() => setIsUnder20k(!isUnder20k)}
>
  <Text style={{ fontSize: 12, color: isUnder20k ? "#15803d" : "#64748b" }}>
    &lt; 20 Ribu
  </Text>
</TouchableOpacity>
```

---

### 🎯 Tantangan 2: Menampilkan Alert Konfirmasi Saat Tombol Back Ditekan
**🗣️ Aslab:** *"Di halaman detail, saat user menekan tombol kembali, tampilkan konfirmasi Alert 'Yakin ingin kembali?'"*

**Langkah Pengerjaan di `src/app/detail.tsx`:**
Pastikan `Alert` diimpor dari `"react-native"`, lalu ubah fungsi `handleGoBack`:
```tsx
const handleGoBack = () => {
  Alert.alert(
    "Konfirmasi Kembali",
    "Apakah kamu yakin ingin kembali ke daftar menu?",
    [
      { text: "Batal", style: "cancel" },
      {
        text: "Ya, Kembali",
        onPress: () => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace("/");
          }
        },
      },
    ]
  );
};
```

---

### 🎯 Tantangan 3: Menambahkan Diskon atau Kode Promo di Halaman Checkout
**🗣️ Aslab:** *"Coba tambahkan diskon Rp 5.000 jika total belanja lebih dari Rp 50.000!"*

**Langkah Pengerjaan di `src/app/checkout.tsx`:**
1. Hitung nilai diskon:
```tsx
const discount = subtotal > 50000 ? 5000 : 0;
const total = subtotal + tax - discount;
```
2. Tampilkan baris diskon di Rincian Pembayaran:
```tsx
{discount > 0 && (
  <View style={styles.costRow}>
    <Text style={[styles.costLabel, { color: "#16a34a" }]}>Potongan Promo (> 50rb)</Text>
    <Text style={[styles.costValue, { color: "#16a34a" }]}>- {formatRupiah(discount)}</Text>
  </View>
)}
```

---

### 🎯 Tantangan 4: Mengubah Judul Header Halaman Secara Dinamis
**🗣️ Aslab:** *"Di halaman Detail, ganti judul headernya agar menampilkan nama menu yang sedang dibuka, bukan tulisan 'Detail Menu'!"*

**Langkah Pengerjaan di `src/app/detail.tsx`:**
Gunakan komponen `<Stack.Screen />` bawaan Expo Router di dalam `DetailScreen`:
```tsx
import { Stack } from "expo-router";

// Di dalam return DetailScreen:
return (
  <View style={styles.container}>
    {/* Mengubah title header secara dinamis sesuai nama menu */}
    <Stack.Screen options={{ title: item.name }} />
    ...
```

---

### 🎯 Tantangan 5: Menambahkan Tombol Reset Pencarian / Reset Filter
**🗣️ Aslab:** *"Buat tombol satu kali klik untuk mereset semua pencarian dan filter kategori kembali ke default!"*

**Langkah Pengerjaan di `src/app/index.tsx`:**
```tsx
const handleResetFilter = () => {
  setSearchQuery("");
  setSelectedCategory("Semua");
  setIsSpicyOnly(false);
};

// Panggil di UI:
<TouchableOpacity onPress={handleResetFilter}>
  <Text style={{ color: "#0284c7", fontWeight: "600", fontSize: 12 }}>Reset</Text>
</TouchableOpacity>
```

---

## 💡 Kunci Sukses Saat Demo
1. **Pahami letak baris kode**: Jika aslab menanyakan *"Mana useEffect kamu?"*, langsung buka `src/app/index.tsx` baris 48 dan 59.
2. **Jelaskan secara percaya diri**: Gunakan istilah teknis yang tepat seperti *re-render*, *initial mount*, *dependency array*, *stack history*, dan *parameter passing*.
3. **Codelab 1**: Jika aslab meminta melihat Codelab 1 (`usecontext_example.tsx`), file tersebut sudah tersedia di root proyek dan dapat didemokan langsung lewat tombol di aplikasi (`/codelab1`).

