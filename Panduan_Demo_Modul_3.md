# Kafe Koding — Demo Modul 3 Pemrograman Mobile

Project Expo React Native ini mempertahankan fitur katalog, pencarian, filter kategori/pedas, detail resep, keranjang, dan checkout. Integrasi data katalog pada Modul 3 menggunakan **TheMealDB API**, yaitu API publik yang menyediakan data resep makanan.

## Menjalankan aplikasi

1. Pastikan Node.js dan npm sudah terpasang.
2. Ekstrak ZIP dan buka folder project yang berisi `package.json` di VS Code.
3. Jalankan `npm install`.
4. Jalankan `npx expo start --go`.
5. Pindai QR code dengan Expo Go. Perangkat dan komputer harus memiliki akses internet.

Untuk menjalankan versi web, gunakan `npx expo start --web`.

## API eksternal yang digunakan

**Provider:** TheMealDB  
**Dokumentasi resmi:** https://www.themealdb.com/api.php  
**API guide:** https://www.themealdb.com/docs_api_guide.php  
**Base URL:** `https://www.themealdb.com/api/json/v1/1`

API menggunakan test key `1` yang disediakan TheMealDB untuk pembelajaran/pengembangan.

Endpoint yang dipakai:

| Kebutuhan | HTTP GET endpoint |
|---|---|
| Memuat katalog awal | `/search.php?f=a`, `/search.php?f=b`, `/search.php?f=c` |
| Mencari resep | `/search.php?s={kata_kunci}` |

Contoh URL lengkap:

```text
https://www.themealdb.com/api/json/v1/1/search.php?f=a
https://www.themealdb.com/api/json/v1/1/search.php?s=chicken
```

TheMealDB mengembalikan response JSON dengan properti `meals`. Setiap meal berisi data seperti `idMeal`, `strMeal`, `strCategory`, `strArea`, `strInstructions`, `strMealThumb`, serta pasangan field `strIngredient1..20` dan `strMeasure1..20`.

## Perubahan yang dilakukan untuk Modul 3

### 1. Mengganti DummyJSON dengan API yang sesuai tema

- API sebelumnya mengambil produk kategori groceries dari DummyJSON. Itu kurang sesuai dengan konsep aplikasi katalog menu makanan.
- Integrasi diganti menjadi TheMealDB karena menyediakan data resep/makanan, kategori, asal masakan, foto, bahan, dan instruksi memasak.
- Katalog awal mengambil resep yang namanya diawali huruf A, B, dan C melalui tiga endpoint pencarian huruf. Hasil digabung dan dideduplikasi berdasarkan `idMeal`.
- Kolom pencarian mengirim kata kunci ke endpoint `search.php?s=...` ketika pengguna menekan tombol Search/Enter pada keyboard.

### 2. Interface dan pemetaan Object

- `src/types/api.ts` berisi interface `TheMealDBMeal` dan `TheMealDBResponse` sesuai struktur JSON TheMealDB.
- `src/services/menuService.ts` memetakan object meal dari API menjadi object `MenuItem[]` yang dipakai aplikasi.
- Bahan dan takaran API dikirim sebagai field bernomor (`strIngredient1..20` dan `strMeasure1..20`), lalu dirangkai menjadi array `ingredients`.
- Detail resep dari API diteruskan ke halaman detail melalui parameter route `itemJson`, sehingga halaman detail menampilkan asal masakan, bahan-bahan, dan instruksi.

### 3. Custom dan pre-built async function

- `fetch()` merupakan pre-built function yang mengembalikan Promise untuk HTTP request.
- `requestMeals()` dan `requestMealsByName()` adalah custom function yang membentuk Promise menggunakan `new Promise()`.
- `fetchMenuFromApi()` dan `searchMenuFromApi()` adalah custom `async function` yang menggunakan `await` untuk menunggu hasil Promise.
- `loadMenuFromApi()` dan `handleSearch()` pada `src/app/index.tsx` mengatur proses loading, hasil request, dan pesan status pada UI.

### 4. Promise, `.then()`, `resolve()`, dan `reject()`

- `requestMeals()` memanggil beberapa endpoint secara asynchronous menggunakan `Promise.all()`.
- `.then()` memproses HTTP response dan JSON.
- `resolve(meals)` menyelesaikan custom Promise dengan daftar resep ketika request berhasil.
- `reject(error)` menyelesaikan custom Promise dalam keadaan gagal ketika request gagal atau tidak ada data katalog.
- `.catch()` menangani error dari rangkaian Promise dan meneruskannya melalui `reject()`.
- `await requestMeals()` menunggu hasil Promise pada `fetchMenuFromApi()`.

### 5. Loading, error handling, dan fallback

- `useEffect` memanggil `loadMenuFromApi()` saat halaman utama dibuka.
- Indikator loading ditampilkan ketika request sedang berlangsung.
- Jika API gagal, aplikasi memakai `initialMenuData` lokal sebagai fallback agar fitur utama tetap dapat dicoba.
- Tombol **Muat ulang** mengulangi request katalog.
- Pencarian menggunakan endpoint API dan menampilkan jumlah hasil atau pesan jika tidak ditemukan.

## Catatan penting tentang data

TheMealDB adalah database resep, bukan API harga jual restoran. Karena itu:

- Nama makanan, kategori, gambar, asal masakan, bahan, dan instruksi berasal dari TheMealDB.
- TheMealDB tidak menyediakan harga jual, rating pelanggan, atau kalori pada response yang digunakan.
- Harga yang terlihat pada katalog/keranjang adalah **harga simulasi lokal** (Rp25.000 untuk Makanan dan Rp15.000 untuk Camilan) agar fitur keranjang dan checkout demo tetap dapat berjalan. Harga tersebut bukan data dari TheMealDB dan bukan harga restoran sungguhan.
- Rating tidak dibuat-buat; untuk data API, aplikasi menampilkan label `Resep` / `Data resep`.
- Waktu penyajian dan kalori tidak diklaim berasal dari API.
- Kategori API seperti Dessert, Side, dan Starter dikelompokkan ke `Camilan`; kategori lainnya ditampilkan sebagai `Makanan`. API yang dipakai tidak menyediakan kategori minuman pada alur katalog ini.

## File yang ditambahkan/diubah

| File | Perubahan |
|---|---|
| `src/types/api.ts` | Interface response dan object meal dari TheMealDB |
| `src/services/menuService.ts` | Fetch TheMealDB, custom Promise, `.then()`, `resolve()`, `reject()`, parsing bahan, dan mapping ke `MenuItem` |
| `src/data/menuData.ts` | Menambahkan properti opsional `area`, `ingredients`, `instructions`, dan `sourceUrl` pada model `MenuItem`; data lokal tetap dipakai sebagai fallback |
| `src/app/index.tsx` | Mengganti sumber API, status API, pencarian API, filter kategori, dan keterangan harga simulasi |
| `src/app/detail.tsx` | Menerima object menu dari halaman katalog dan menampilkan asal masakan, bahan, serta instruksi resep |
| `README.md` | Dokumentasi API, daftar perubahan, alur data, batasan data, dan pertanyaan aslab |
| `src/utils/delay.ts` | Utility delay dari implementasi demo sebelumnya tetap tersedia; bukan bagian utama alur fetch katalog |

## Alur data aplikasi

1. Halaman utama dibuka.
2. `useEffect` memanggil custom async function `loadMenuFromApi()`.
3. `loadMenuFromApi()` menjalankan `await fetchMenuFromApi()`.
4. `fetchMenuFromApi()` menunggu `requestMeals()`.
5. `requestMeals()` mengirim HTTP GET ke TheMealDB untuk huruf A, B, dan C. `Promise.all()` menunggu semua request selesai.
6. Response JSON diproses, digabung, dan dideduplikasi. Custom Promise memanggil `resolve()` jika berhasil atau `reject()` jika gagal.
7. `mapMealsToMenu()` mengubah object API menjadi `MenuItem[]`.
8. State `menuList` diperbarui dan `FlatList` menampilkan katalog.
9. Ketika pengguna mencari nama makanan dan menekan Enter/Search, `handleSearch()` memanggil `searchMenuFromApi()` yang menggunakan endpoint `search.php?s=...`.
10. Ketika kartu dipilih, object menu dikirim ke halaman detail agar informasi bahan dan instruksi dapat ditampilkan.

## Checklist demonstrasi aslab

- [ ] Tunjukkan dokumentasi TheMealDB dan jelaskan alasan pemilihannya: datanya memang berupa resep/makanan, bukan produk groceries.
- [ ] Tunjukkan endpoint katalog awal `search.php?f=a` (juga huruf B dan C).
- [ ] Tunjukkan endpoint pencarian `search.php?s=...`.
- [ ] Tunjukkan interface `TheMealDBMeal` dan `TheMealDBResponse`.
- [ ] Jelaskan bentuk response JSON dan properti `meals`.
- [ ] Tunjukkan penggunaan `fetch()` dan `Promise.all()`.
- [ ] Tunjukkan custom Promise `new Promise()`, `resolve()`, dan `reject()`.
- [ ] Tunjukkan `.then()` dan `.catch()`.
- [ ] Tunjukkan custom `async function` dan `await`.
- [ ] Jalankan aplikasi, tunggu data resep tampil, lalu lakukan pencarian.
- [ ] Buka detail salah satu resep dan tunjukkan bahan serta instruksi yang berasal dari API.
- [ ] Jelaskan bahwa harga hanya simulasi lokal karena TheMealDB tidak menyediakan harga.
- [ ] Coba matikan koneksi internet lalu tekan **Muat ulang** untuk memperlihatkan fallback lokal.

## Kemungkinan pertanyaan aslab dan jawaban

### Konsep asynchronous

**1. Apa perbedaan synchronous dan asynchronous?**  
Synchronous menjalankan instruksi secara berurutan dan menunggu instruksi saat ini selesai. Asynchronous memungkinkan operasi yang membutuhkan waktu berjalan tanpa menghentikan seluruh alur program; hasilnya ditangani ketika operasi selesai.

**2. Mengapa API call bersifat asynchronous?**  
Karena aplikasi perlu menunggu komunikasi jaringan dan response server. Waktu tunggunya tidak dapat dipastikan, sehingga aplikasi tidak seharusnya memblokir seluruh interaksi pengguna.

**3. Apa itu Promise?**  
Object yang merepresentasikan hasil operasi asynchronous yang mungkin belum tersedia. Promise memiliki tiga state: pending, fulfilled, dan rejected.

**4. Apa fungsi `async`?**  
Menandai sebuah fungsi sebagai async function. Fungsi tersebut selalu mengembalikan Promise.

**5. Apa fungsi `await`?**  
Menunggu Promise selesai di dalam async function sebelum melanjutkan baris berikutnya. `await` tidak mengubah operasi jaringan menjadi synchronous.

**6. Apa perbedaan `await` dan `.then()`?**  
Keduanya menangani hasil Promise. `await` membuat alur async function tampak berurutan, sedangkan `.then()` mendaftarkan callback ketika Promise berhasil.

### Promise dan error handling

**7. Apa perbedaan `resolve()` dan `reject()`?**  
`resolve(value)` menyelesaikan Promise dengan hasil sukses. `reject(error)` menyelesaikannya dengan kegagalan.

**8. Mengapa `requestMeals()` menggunakan `new Promise()`?**  
Untuk menunjukkan custom Promise sesuai kriteria modul. Hasil beberapa request diteruskan melalui `resolve`, sedangkan kesalahan diteruskan melalui `reject`.

**9. Apa fungsi `.catch()`?**  
Menangani rejection atau error pada rangkaian Promise. Di kode ini `.catch()` meneruskan error melalui `reject()`.

**10. Apa fungsi `Promise.all()`?**  
Menjalankan beberapa Promise dan menunggu semuanya selesai. Jika salah satu Promise reject, `Promise.all()` juga reject.

**11. Mengapa perlu `try/catch/finally` pada `loadMenuFromApi()`?**  
`try` menjalankan proses request, `catch` menangani kegagalan, dan `finally` memastikan indikator loading dihentikan baik request berhasil maupun gagal.

**12. Apa yang terjadi jika server mengembalikan HTTP 404 atau 500?**  
`fetch()` tetap dapat menghasilkan Response. Karena itu kode memeriksa `response.ok`; jika false, kode melempar Error agar masuk ke `.catch()`.

### API dan TypeScript

**13. Apa itu API?**  
Application Programming Interface, yaitu antarmuka yang memungkinkan aplikasi atau sistem berkomunikasi dan bertukar data.

**14. Apa itu endpoint?**  
Alamat spesifik yang digunakan client untuk mengakses resource pada API. Contohnya `/search.php?f=a` untuk mencari resep berdasarkan huruf awal.

**15. HTTP method apa yang digunakan?**  
GET, karena aplikasi hanya mengambil data. Modul 3 juga membahas POST, PUT, PATCH, dan DELETE, tetapi praktik ini berfokus pada GET.

**16. Apa itu JSON?**  
Format pertukaran data berbentuk teks yang umum digunakan API. Response dibaca dengan `response.json()`.

**17. Mengapa menggunakan TheMealDB?**  
Karena konsep aplikasi adalah katalog menu makanan. TheMealDB menyediakan nama makanan, kategori, gambar, asal masakan, bahan, dan instruksi resep sehingga lebih relevan dibanding API produk groceries.

**18. Apa isi interface `TheMealDBMeal`?**  
Interface tersebut mendefinisikan properti object meal yang dipakai aplikasi, seperti `idMeal`, `strMeal`, `strCategory`, `strArea`, `strInstructions`, dan `strMealThumb`. Index signature membantu membaca field bahan dan takaran yang bernomor.

**19. Mengapa response API tidak langsung ditampilkan?**  
Bentuk response API berbeda dari model `MenuItem` yang digunakan komponen aplikasi. Karena itu data dipetakan terlebih dahulu pada `mapMealsToMenu()`.

**20. Mengapa bahan makanan perlu diproses lagi?**  
TheMealDB mengirim bahan dan takaran dalam field terpisah yang bernomor (`strIngredient1..20` dan `strMeasure1..20`). Fungsi `getIngredients()` menggabungkan pasangan tersebut menjadi array agar mudah ditampilkan.

**21. Apakah harga berasal dari TheMealDB?**  
Tidak. TheMealDB tidak menyediakan harga jual. Harga pada demo adalah simulasi lokal agar fitur keranjang dan checkout tetap dapat dicoba.

**22. Apakah rating dan kalori berasal dari API?**  
Tidak pada endpoint yang digunakan. Aplikasi tidak mengarang rating atau kalori; informasi tersebut ditampilkan sebagai data resep/tidak tersedia.

### Pertanyaan modifikasi langsung

**23. Bagaimana mengubah huruf awal resep yang dimuat?**  
Ubah array `INITIAL_LETTERS` pada `menuService.ts`, misalnya dari `["a", "b", "c"]` menjadi `["d", "e", "f"]`.

**24. Bagaimana mengubah kata kunci pencarian?**  
Ubah nilai query yang dikirim ke `searchMenuFromApi(query)`, atau masukkan kata kunci lain pada kolom pencarian aplikasi lalu tekan Enter/Search.

**25. Bagaimana mengubah kategori Dessert agar masuk ke Makanan?**  
Ubah kondisi pada fungsi `mapCategory()` di `menuService.ts`, misalnya hapus `"dessert"` dari array kategori yang dipetakan menjadi `Camilan`.

---

## 🎯 PANDUAN LIVE CODE MODIFICATION (PETA LOKASI PERSIS & ANTI-BINGUNG)

Berikut adalah petunjuk lokasi baris dan potongan kode **SEBELUM vs SESUDAH** di file **`src/app/index.tsx`** agar kamu tidak bingung di mana harus menempelkan kodenya saat diuji Aslab:

```text
Struktur File src/app/index.tsx:
┌─────────────────────────────────────────────────────────────┐
│ Baris 4-13   : [TITIK 1] Import dari "react-native" (Alert) │
│ Baris 30-40  : Deklarasi State (menuList, cart, dll)        │
│ Baris 118-120: Format Rupiah                                │
│ Baris 123-142: Fungsi handleQuickAddToCart                  │
│ Baris 143    : [TITIK 2] TARUH FUNGSI KURANG & HAPUS DISINI │
│ Baris 180-257: Fungsi renderMenuItem                        │
│ Baris 237-253: [TITIK 3] GANTI TOMBOL KARTU DISINI          │
│ Baris 260    : Return JSX Layar Utama                       │
└─────────────────────────────────────────────────────────────┘
```

---

### 🔥 TANTANGAN 1 & 2: Mengurangi & Menghapus Pesanan Keranjang

#### 📍 TITIK 1: Tambahkan `Alert` di Bagian Import Paling Atas
Buka file **`src/app/index.tsx`**, lihat **baris 4-13**:

❌ **SEBELUM:**
```tsx
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
```

✅ **SESUDAH (Tambahkan `Alert,`):**
```tsx
import {
  ActivityIndicator,
  Alert, // <--- TAMBAHKAN KATA INI
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
```

---

#### 📍 TITIK 2: Taruh Logika Kurang & Hapus (Tepat di Baris 143)
Gulir ke bawah di file **`src/app/index.tsx`**, cari fungsi `handleQuickAddToCart`. Tepat di bawah tanda kurung kurawal tutup `};` milik `handleQuickAddToCart` (**baris 143**), sisipkan kode berikut:

```tsx
  // =========================================================================
  // TEMPEL KODE INI DI BAWAH handleQuickAddToCart (Baris 143):
  // =========================================================================

  // 1. Fungsi Mengurangi Porsi (Minus)
  const handleDecreaseCart = (itemId: string) => {
    setCart((prevCart) => {
      const existing = prevCart.find((c) => c.id === itemId);
      if (!existing) return prevCart;

      // Jika porsi lebih dari 1, kurangi 1
      if (existing.qty > 1) {
        return prevCart.map((c) =>
          c.id === itemId ? { ...c, qty: c.qty - 1 } : c
        );
      }
      // Jika porsi tinggal 1 lalu dikurangi lagi, hapus dari keranjang
      return prevCart.filter((c) => c.id !== itemId);
    });
  };

  // 2. Fungsi Menghapus Item dari Keranjang
  const handleRemoveFromCart = (itemId: string, itemName?: string) => {
    Alert.alert(
      "Hapus Pesanan",
      `Apakah kamu yakin ingin menghapus "${itemName ?? "menu ini"}" dari keranjang?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => {
            setCart((prevCart) => prevCart.filter((c) => c.id !== itemId));
          },
        },
      ]
    );
  };
```

---

#### 📍 TITIK 3: Ubah Tombol di Kartu Menu (Baris 237-253)
Cari fungsi `renderMenuItem` di dalam `src/app/index.tsx`, lihat bagian bawah kartu (**baris 237-253**):

❌ **KODE LAMA YANG DICARI (Baris 237-253):**
```tsx
            <TouchableOpacity
              style={[
                styles.addButton,
                itemInCart ? { backgroundColor: "#0284c7" } : {},
              ]}
              onPress={() => handleQuickAddToCart(item)}
            >
              <Ionicons
                name={itemInCart ? "checkmark" : "add"}
                size={18}
                color="#ffffff"
              />
              <Text style={styles.addButtonText}>
                {itemInCart ? `(${itemInCart.qty}) Tambah` : "Pesan"}
              </Text>
            </TouchableOpacity>
```

✅ **GANTI DENGAN KODE BARU INI:**
```tsx
            {/* JIKA SUDAH DI KERANJANG, MUNCULKAN [-] JUMLAH [+] [HAPUS] */}
            {itemInCart ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                {/* Tombol Kurangi Porsi (-) */}
                <TouchableOpacity
                  style={{ backgroundColor: "#e0f2fe", padding: 6, borderRadius: 6 }}
                  onPress={() => handleDecreaseCart(item.id)}
                >
                  <Ionicons name="remove" size={16} color="#0284c7" />
                </TouchableOpacity>

                {/* Jumlah Porsi */}
                <Text style={{ fontWeight: "bold", fontSize: 14, color: "#0284c7", minWidth: 18, textAlign: "center" }}>
                  {itemInCart.qty}
                </Text>

                {/* Tombol Tambah Porsi (+) */}
                <TouchableOpacity
                  style={{ backgroundColor: "#e0f2fe", padding: 6, borderRadius: 6 }}
                  onPress={() => handleQuickAddToCart(item)}
                >
                  <Ionicons name="add" size={16} color="#0284c7" />
                </TouchableOpacity>

                {/* Tombol Hapus Barang (Tong Sampah) */}
                <TouchableOpacity
                  style={{ backgroundColor: "#fee2e2", padding: 6, borderRadius: 6, marginLeft: 2 }}
                  onPress={() => handleRemoveFromCart(item.id, item.name)}
                >
                  <Ionicons name="trash-outline" size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ) : (
              /* JIKA BELUM ADA DI KERANJANG, MUNCULKAN TOMBOL PESAN BIASA */
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleQuickAddToCart(item)}
              >
                <Ionicons name="add" size={18} color="#ffffff" />
                <Text style={styles.addButtonText}>Pesan</Text>
              </TouchableOpacity>
            )}
```

---

### 🔥 TANTANGAN 3: Mengosongkan Seluruh Keranjang Sekaligus (*Clear All*)
**🗣️ Pertanyaan Aslab:**  
> *"Buatkan tombol untuk langsung mereset / mengosongkan semua isi keranjang!"*

#### 📍 Langkah Pengerjaan di `src/app/index.tsx`:

1. **Taruh fungsinya di bawah fungsi keranjang (sekitar baris 170):**
```tsx
const handleClearCart = () => {
  Alert.alert("Kosongkan Keranjang", "Batalkan semua pesanan?", [
    { text: "Batal", style: "cancel" },
    { text: "Ya, Kosongkan", style: "destructive", onPress: () => setCart([]) },
  ]);
};
```

2. **Pasang tombolnya di Floating Bar Keranjang (sekitar baris 410):**
Cari baris `<View style={styles.cartBarContainer}>`, pasang tombol sampah di samping jumlah item:
```tsx
<TouchableOpacity onPress={handleClearCart} style={{ marginRight: 10 }}>
  <Ionicons name="trash-outline" size={20} color="#f87171" />
</TouchableOpacity>
```

---

### 🔥 TANTANGAN 4: Mengubah / Menambah Huruf Awal Resep API
**🗣️ Pertanyaan Aslab:**  
> *"Saat ini aplikasi hanya mengambil resep dari huruf a, b, dan c. Coba tambahkan resep dari huruf 'd' dan 's'!"*

#### 📍 Lokasi Persis: File `src/services/menuService.ts` pada **Baris ke-5**:
❌ **SEBELUM:**
```typescript
const INITIAL_LETTERS = ["a", "b", "c"];
```
✅ **SESUDAH:**
```typescript
const INITIAL_LETTERS = ["a", "b", "c", "d", "s"];
```

---

### 🔥 TANTANGAN 5: Mengubah Logika Harga Simulasi TheMealDB
**🗣️ Pertanyaan Aslab:**  
> *"Di mana letak pengaturan harga? Coba ganti harganya jadi: Makanan Rp 30.000 dan Camilan Rp 18.000!"*

#### 📍 Lokasi Persis: File `src/services/menuService.ts` pada **Baris ke-117**:
Cari fungsi `mapMealsToMenu`, temukan baris `price:`:
❌ **SEBELUM:**
```typescript
price: category === "Camilan" ? 15000 : 25000,
```
✅ **SESUDAH:**
```typescript
price: category === "Camilan" ? 18000 : 30000,
```

---

### 🔥 TANTANGAN 6: Mengubah Pemetaan Kategori TheMealDB
**🗣️ Pertanyaan Aslab:**  
> *"Coba ubah kategori 'Breakfast' dan 'Starter' dari API agar dimasukkan ke kategori 'Camilan'!"*

#### 📍 Lokasi Persis: File `src/services/menuService.ts` pada **Baris ke-89**:
Cari fungsi `mapCategory`:
❌ **SEBELUM:**
```typescript
if (["dessert", "side", "starter"].includes(normalizedCategory)) {
  return "Camilan";
}
```
✅ **SESUDAH (Tambahkan `"breakfast"`):**
```typescript
if (["dessert", "side", "starter", "breakfast"].includes(normalizedCategory)) {
  return "Camilan";
}
```

---

### 🔥 TANTANGAN 7: Menambahkan Diskon Otomatis di Halaman Checkout
**🗣️ Pertanyaan Aslab:**  
> *"Di halaman checkout, tambahkan diskon Rp 5.000 jika total belanja di atas Rp 40.000!"*

#### 📍 Lokasi Persis: File `src/app/checkout.tsx` pada **Baris ke-53-56**:
❌ **SEBELUM:**
```tsx
const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
const tax = Math.round(subtotal * 0.1);
const total = subtotal + tax;
```
✅ **SESUDAH (Sisipkan baris discount):**
```tsx
const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
const discount = subtotal > 40000 ? 5000 : 0; // <--- TAMBAH INI
const tax = Math.round((subtotal - discount) * 0.1);
const total = subtotal - discount + tax;
```

Lalu di bagian tampilan Rincian Pembayaran (sekitar baris 210), tampilkan teks diskonnya:
```tsx
{discount > 0 && (
  <View style={styles.costRow}>
    <Text style={[styles.costLabel, { color: "#16a34a" }]}>Potongan Promo</Text>
    <Text style={[styles.costValue, { color: "#16a34a" }]}>- {formatRupiah(discount)}</Text>
  </View>
)}
```

---

## Referensi

- TheMealDB — API documentation: https://www.themealdb.com/api.php
- TheMealDB — API guide: https://www.themealdb.com/docs_api_guide.php
- Modul Praktikum Pemrograman Mobile UMM, Modul 3 — Pemrograman Asynchronous & API Call, Versi 2.1 (Agustus 2026).
