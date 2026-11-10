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

## Referensi

- TheMealDB — API documentation: https://www.themealdb.com/api.php
- TheMealDB — API guide: https://www.themealdb.com/docs_api_guide.php
- Modul Praktikum Pemrograman Mobile UMM, Modul 3 — Pemrograman Asynchronous & API Call, Versi 2.1 (Agustus 2026).
