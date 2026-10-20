import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function OrderSuccessScreen() {
  const router = useRouter();

  // =========================================================================
  // 1. KRITERIA PENILAIAN MODUL 2: USELOCALPARAMS()
  // =========================================================================
  const {
    orderId = "KAFE-8891",
    customerName = "Tamu",
    tableNumber = "07",
    totalPaid = "0",
    method = "QRIS",
  } = useLocalSearchParams<{
    orderId: string;
    customerName: string;
    tableNumber: string;
    totalPaid: string;
    method: string;
  }>();

  // =========================================================================
  // 2. KRITERIA PENILAIAN MODUL 2: HOOK USESTATE & USEEFFECT
  // Digunakan untuk countdown estimasi penyajian pesanan
  // =========================================================================
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(12);

  useEffect(() => {
    // Interval countdown simulasi estimasi waktu
    const interval = setInterval(() => {
      setEstimatedMinutes((prev) => (prev > 1 ? prev - 1 : 1));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const formatRupiah = (val: string | number) => {
    const num = typeof val === "string" ? parseInt(val, 10) || 0 : val;
    return `Rp ${num.toLocaleString("id-ID")}`;
  };

  // =========================================================================
  // 3. KRITERIA PENILAIAN MODUL 2: ROUTER.REPLACE()
  // Mengembalikan pengguna ke root ("/") dan membersihkan riwayat stack navigasi
  // Sesuai materi Modul 2 hal. 33
  // =========================================================================
  const handleBackToHome = () => {
    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Ikon Sukses */}
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark-sharp" size={48} color="#ffffff" />
        </View>

        <Text style={styles.title}>Pesanan Berhasil Masuk!</Text>
        <Text style={styles.subtitle}>
          Barista dan Koki Kafe Koding sedang menyiapkan hidangan lezat untukmu.
        </Text>

        {/* Kartu Nota / Struk */}
        <View style={styles.receiptCard}>
          <View style={styles.receiptHeader}>
            <Text style={styles.receiptBrand}>KAFE KODING MALANG</Text>
            <Text style={styles.orderIdBadge}>{orderId}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.receiptRow}>
            <Text style={styles.rowLabel}>Nama Pelanggan</Text>
            <Text style={styles.rowValue}>{customerName}</Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={styles.rowLabel}>Nomor Meja</Text>
            <Text style={styles.rowValue}>Meja #{tableNumber}</Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={styles.rowLabel}>Metode Bayar</Text>
            <Text style={styles.rowValue}>{method}</Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={styles.rowLabel}>Total Terbayar</Text>
            <Text style={[styles.rowValue, { color: "#0284c7", fontWeight: "800" }]}>
              {formatRupiah(totalPaid)}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Estimasi Waktu */}
          <View style={styles.timeBanner}>
            <Ionicons name="timer-outline" size={20} color="#0284c7" />
            <Text style={styles.timeText}>
              Estimasi siap saji: ~{estimatedMinutes} menit
            </Text>
          </View>
        </View>

        {/* Tombol Kembali ke Menu dengan router.replace('/') */}
        <TouchableOpacity
          style={styles.homeButton}
          activeOpacity={0.85}
          onPress={handleBackToHome}
        >
          <Ionicons name="restaurant-outline" size={18} color="#ffffff" />
          <Text style={styles.homeButtonText}>Pesan Menu Lain (Kembali)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    padding: 24,
  },
  content: {
    alignItems: "center",
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  receiptCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 24,
  },
  receiptHeader: {
    alignItems: "center",
    marginBottom: 6,
  },
  receiptBrand: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94a3b8",
    letterSpacing: 1.5,
  },
  orderIdBadge: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 12,
  },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  rowLabel: {
    fontSize: 13,
    color: "#64748b",
  },
  rowValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1e293b",
  },
  timeBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f9ff",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  timeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0284c7",
  },
  homeButton: {
    width: "100%",
    backgroundColor: "#0284c7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  homeButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
});

