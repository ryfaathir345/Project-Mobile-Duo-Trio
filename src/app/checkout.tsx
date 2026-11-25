import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CoffeeTheme } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { createMission, saveOrderToCloud } from "@/services/missionService";

interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  imageUri: string;
  note?: string;
  spicyLevel?: number;
}

export default function CheckoutScreen() {
  const router = useRouter();
  const { user } = useAuth();

  // =========================================================================
  // 1. KRITERIA PENILAIAN MODUL 2: USELOCALPARAMS()
  // =========================================================================
  const params = useLocalSearchParams<{ cartJson?: string; totalPrice?: string }>();

  let items: CheckoutItem[] = [];
  if (params.cartJson) {
    try {
      items = JSON.parse(params.cartJson);
    } catch {
      items = [];
    }
  }

  // =========================================================================
  // 2. KRITERIA PENILAIAN MODUL 2: HOOK USESTATE
  // =========================================================================
  const [customerName, setCustomerName] = useState<string>("Pelanggan Kafe");
  const [tableNumber, setTableNumber] = useState<string>("07");
  const [paymentMethod, setPaymentMethod] = useState<"QRIS" | "Tunai" | "Debit">("QRIS");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const formatRupiah = (val: number) => `Rp ${val.toLocaleString("id-ID")}`;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const tax = Math.round(subtotal * 0.1); // PPN 10%
  const total = subtotal + tax;

  // =========================================================================
  // 3. KRITERIA PENILAIAN MODUL 2: ROUTER.BACK()
  // =========================================================================
  const handleBackToMenu = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  // =========================================================================
  // 4. KRITERIA PENILAIAN MODUL 2: ROUTER.REPLACE()
  // =========================================================================
  const handleConfirmOrder = () => {
    if (!customerName.trim()) {
      Alert.alert("Data Belum Lengkap", "Silakan masukkan nama pemesan.");
      return;
    }

    setIsProcessing(true);

    // Simulasi proses transaksi perbankan / pembayaran (800ms)
    setTimeout(() => {
      setIsProcessing(false);

      const orderId = `KAFE-${Math.floor(1000 + Math.random() * 9000)}`;

      // Menyimpan pesanan ke Cloud Database Supabase (Codelab 5 Cloud CRUD)
      const summaryText = items.map((i) => `${i.qty}x ${i.name}`).join(", ");
      void saveOrderToCloud(summaryText, total, user?.id);
      void createMission(
        `Pesanan ${orderId} (Meja ${tableNumber}): ${summaryText}`,
        Math.round(total / 1000),
        user?.id
      ).catch(() => {});

      // Navigasi dengan REPLACE sehingga layar checkout dihapus dari riwayat navigasi
      router.replace({
        pathname: "/order-success",
        params: {
          orderId: orderId,
          customerName: customerName,
          tableNumber: tableNumber,
          totalPaid: total.toString(),
          method: paymentMethod,
        },
      });
    }, 800);
  };

  return (
    <View style={styles.screenWrapper}>
      <View style={styles.contentContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Ringkasan Meja & Pemesan */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Informasi Pemesan</Text>
            <View style={styles.inputRow}>
              <View style={{ flex: 2, marginRight: 10 }}>
                <Text style={styles.inputLabel}>Nama Pelanggan</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Nama Pemesan"
                  placeholderTextColor={CoffeeTheme.colors.textMuted}
                  value={customerName}
                  onChangeText={setCustomerName}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>No. Meja</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="01"
                  placeholderTextColor={CoffeeTheme.colors.textMuted}
                  value={tableNumber}
                  onChangeText={setTableNumber}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Daftar Pesanan */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Rincian Menu ({items.length} Macam)</Text>
            {items.map((item, index) => (
              <View key={`${item.id}-${index}`} style={styles.itemRow}>
                <Image source={{ uri: item.imageUri }} style={styles.itemThumb} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemSubtext}>
                    {item.qty}x @ {formatRupiah(item.price)}
                    {item.spicyLevel ? ` • Lvl ${item.spicyLevel}` : ""}
                  </Text>
                  {item.note ? (
                    <Text style={styles.itemNoteText}>Catatan: {item.note}</Text>
                  ) : null}
                </View>
                <Text style={styles.itemTotalPrice}>
                  {formatRupiah(item.price * item.qty)}
                </Text>
              </View>
            ))}
          </View>

          {/* Pilihan Metode Pembayaran */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Metode Pembayaran</Text>
            <View style={styles.paymentMethodRow}>
              {(["QRIS", "Tunai", "Debit"] as const).map((method) => (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.methodButton,
                    paymentMethod === method && styles.methodButtonActive,
                  ]}
                  onPress={() => setPaymentMethod(method)}
                >
                  <Ionicons
                    name={
                      method === "QRIS"
                        ? "qr-code-outline"
                        : method === "Tunai"
                        ? "cash-outline"
                        : "card-outline"
                    }
                    size={18}
                    color={
                      paymentMethod === method
                        ? CoffeeTheme.colors.brandSecondary
                        : CoffeeTheme.colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.methodText,
                      paymentMethod === method && styles.methodTextActive,
                    ]}
                  >
                    {method}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Rincian Biaya */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Rincian Pembayaran</Text>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Subtotal Pesanan</Text>
              <Text style={styles.costValue}>{formatRupiah(subtotal)}</Text>
            </View>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Pajak Restoran (PB1 10%)</Text>
              <Text style={styles.costValue}>{formatRupiah(tax)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.costRow}>
              <Text style={styles.totalLabel}>Total Tagihan</Text>
              <Text style={styles.totalValue}>{formatRupiah(total)}</Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Bar Konfirmasi Pembayaran */}
        <View style={styles.bottomBarWrapper}>
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleBackToMenu}
            >
              <Text style={styles.cancelButtonText}>Ubah</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmButton}
              activeOpacity={0.88}
              disabled={isProcessing}
              onPress={handleConfirmOrder}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="checkmark-outline" size={18} color="#ffffff" />
                  <Text style={styles.confirmButtonText}>
                    Bayar & Selesaikan ({formatRupiah(total)})
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: CoffeeTheme.colors.canvas,
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    width: "100%",
    maxWidth: CoffeeTheme.layout.maxDetailWidth,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  card: {
    backgroundColor: CoffeeTheme.colors.surface,
    borderRadius: CoffeeTheme.radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: CoffeeTheme.colors.border,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: CoffeeTheme.colors.textPrimary,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: "row",
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: CoffeeTheme.colors.textSecondary,
    marginBottom: 5,
  },
  textInput: {
    backgroundColor: CoffeeTheme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: CoffeeTheme.colors.border,
    borderRadius: CoffeeTheme.radii.md,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: CoffeeTheme.colors.textPrimary,
    outlineStyle: "none" as any,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: CoffeeTheme.colors.borderSubtle,
  },
  itemThumb: {
    width: 48,
    height: 48,
    borderRadius: CoffeeTheme.radii.md,
    marginRight: 12,
    backgroundColor: CoffeeTheme.colors.surfaceSubtle,
  },
  itemName: {
    fontSize: 13,
    fontWeight: "700",
    color: CoffeeTheme.colors.textPrimary,
  },
  itemSubtext: {
    fontSize: 11,
    color: CoffeeTheme.colors.textSecondary,
    marginTop: 2,
  },
  itemNoteText: {
    fontSize: 11,
    color: CoffeeTheme.colors.textMuted,
    fontStyle: "italic",
    marginTop: 2,
  },
  itemTotalPrice: {
    fontSize: 13,
    fontWeight: "700",
    color: CoffeeTheme.colors.brand,
    fontVariant: ["tabular-nums"],
  },
  paymentMethodRow: {
    flexDirection: "row",
    gap: 8,
  },
  methodButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: CoffeeTheme.radii.md,
    borderWidth: 1,
    borderColor: CoffeeTheme.colors.border,
    backgroundColor: CoffeeTheme.colors.surfaceSubtle,
    gap: 6,
  },
  methodButtonActive: {
    borderColor: CoffeeTheme.colors.brandSecondary,
    backgroundColor: CoffeeTheme.colors.brandSubtle,
  },
  methodText: {
    fontSize: 12,
    fontWeight: "600",
    color: CoffeeTheme.colors.textSecondary,
  },
  methodTextActive: {
    color: CoffeeTheme.colors.brandSecondary,
    fontWeight: "700",
  },
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  costLabel: {
    fontSize: 12,
    color: CoffeeTheme.colors.textSecondary,
  },
  costValue: {
    fontSize: 12,
    fontWeight: "600",
    color: CoffeeTheme.colors.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  divider: {
    height: 1,
    backgroundColor: CoffeeTheme.colors.border,
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: CoffeeTheme.colors.textPrimary,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "800",
    color: CoffeeTheme.colors.brand,
    fontVariant: ["tabular-nums"],
  },
  bottomBarWrapper: {
    borderTopWidth: 1,
    borderColor: CoffeeTheme.colors.border,
    backgroundColor: CoffeeTheme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: CoffeeTheme.radii.md,
    borderWidth: 1,
    borderColor: CoffeeTheme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: CoffeeTheme.colors.textSecondary,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: CoffeeTheme.colors.brand,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 11,
    borderRadius: CoffeeTheme.radii.md,
    gap: 6,
  },
  confirmButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
});
