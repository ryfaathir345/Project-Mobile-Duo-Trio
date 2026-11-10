# Menjalankan Project di Expo Go

## 1. Persiapan
- Pastikan Node.js versi LTS sudah terpasang.
- Laptop dan HP terhubung ke jaringan Wi-Fi yang sama.
- Pasang aplikasi Expo Go dari Play Store.

## 2. Instal dependensi
Buka terminal di folder project (folder yang berisi `package.json`), lalu jalankan:

```bash
npm ci
```

Jika `npm ci` gagal karena lockfile/dependensi, coba:

```bash
npm install
npx expo install --fix
```

## 3. Jalankan aplikasi

```bash
npx expo start --clear
```

Pindai QR code dengan Expo Go. Jika jaringan Wi-Fi tidak bisa menghubungkan HP ke laptop:

```bash
npx expo start --tunnel --clear
```

## Catatan perbaikan
Import CSS global dari `src/constants/theme.ts` dihapus dari jalur bundle bersama karena file CSS tersebut hanya berisi variabel CSS untuk web dan tidak diperlukan pada Android/iOS. Perubahan ini menghindari CSS web ikut diproses saat bundling aplikasi native.

Jika masih muncul error, salin teks error merah dari terminal atau kirim screenshot layar Expo Go. Error yang berbeda bisa membutuhkan perbaikan berbeda.
