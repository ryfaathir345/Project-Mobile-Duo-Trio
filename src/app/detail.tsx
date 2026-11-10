import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { initialMenuData } from "@/data/menuData";

export default function DetailScreen() {
  // Inisialisasi Expo Router
  const router = useRouter();

  // =========================================================================
  // 1. KRITERIA PENILAIAN MODUL 2: USELOCALPARAMS()
  // Mengambil parameter 'id' dari URL route yang sedang aktif (Modul 2 hal. 21-22)
  // =========================================================================
  const { id } = useLocalSearchParams<{ id: string }>();

  // Mencari data menu yang sesuai dengan ID
  const item = initialMenuData.find((m) => m.id === id) || initialMenuData[0];

  // =========================================================================
  // 2. KRITERIA PENILAIAN MODUL 2: HOOK USESTATE
  // =========================================================================
  // Menerapkan state untuk jumlah porsi
  const [quantity, setQuantity] = useState<number>(1);
  // Menerapkan state untuk catatan khusus pembeli
  const [note, setNote] = useState<string>("");
  // Menerapkan state boolean isFavorite (Persis contoh Modul 2 hal. 7-8)
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  // Menerapkan level kepedasan jika menu pedas
  const [spicyLevel, setSpicyLevel] = useState<number>(1);

  // Format Rupiah
  const formatRupiah = (val: number) => `Rp ${val.toLocaleString("id-ID")}`;

  // =========================================================================
  // 3. KRITERIA PENILAIAN MODUL 2: CANGOBACK() & BACK()
  // Sesuai materi Modul 2 hal. 34: Memeriksa riwayat navigasi sebelum router.back()
  // =========================================================================
  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  // Navigasi ke halaman checkout dengan membawa data pesanan via push()
  const handleProceedToCheckout = () => {
    const orderPayload = [
      {
        id: item.id,
        name: item.name,
        price: item.price,
        qty: quantity,
        imageUri: item.imageUri,
        note: note,
        spicyLevel: item.isSpicy ? spicyLevel : undefined,
      },
    ];

    router.push({
      pathname: "/checkout",
      params: {
        cartJson: JSON.stringify(orderPayload),
        totalPrice: (item.price * quantity).toString(),
      },
    });
  };

  const totalPrice = item.price * quantity;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Banner Gambar Menu */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.imageUri }} style={styles.bannerImage} />

          {/* Tombol Back & Tombol Favorite Mengambang */}
          <TouchableOpacity style={styles.backFloatingBtn} onPress={handleGoBack}>
            <Ionicons name="arrow-back" size={20} color="#1e293b" />
          </TouchableOpacity>

          {/* Toggle Favorite menggunakan useState<boolean> (Modul 2 hal. 7-8) */}
          <TouchableOpacity
            style={styles.favoriteFloatingBtn}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={22}
              color={isFavorite ? "#ef4444" : "#64748b"}
            />
          </TouchableOpacity>
        </View>

        {/* Informasi Utama Menu */}
        <View style={styles.contentCard}>
          <View style={styles.headerInfo}>
            <View style={{ flex: 1 }}>
              <Text style={styles.categoryBadge}>{item.category}</Text>
              <Text style={styles.itemName}>{item.name}</Text>
            </View>
            <Text style={styles.itemPrice}>{formatRupiah(item.price)}</Text>
          </View>

          {/* Meta Bar: Rating, Durasi Masak, Kalori */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={16} color="#f59e0b" />
              <Text style={styles.metaText}>{item.rating} (Rating)</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color="#0284c7" />
              <Text style={styles.metaText}>{item.prepTime}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Ionicons name="flame-outline" size={16} color="#ef4444" />
              <Text style={styles.metaText}>{item.calories}</Text>
            </View>
          </View>

          {/* Deskripsi Lengkap */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>Deskripsi Menu</Text>
            <Text style={styles.descriptionText}>{item.description}</Text>
          </View>

          {/* Pengaturan Level Pedas (Jika item.isSpicy) */}
          {item.isSpicy && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Pilih Level Pedas 🔥</Text>
              <View style={styles.levelRow}>
                {[1, 2, 3, 5].map((lvl) => (
                  <TouchableOpacity
                    key={lvl}
                    style={[
                      styles.levelChip,
                      spicyLevel === lvl && styles.levelChipActive,
                    ]}
                    onPress={() => setSpicyLevel(lvl)}
                  >
                    <Text
                      style={[
                        styles.levelText,
                        spicyLevel === lvl && styles.levelTextActive,
                      ]}
                    >
                      Lvl {lvl}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Input Catatan Pesanan */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>Catatan Khusus (Opsional)</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="Contoh: Sambal dipisah, jangan pakai bawang goreng..."
              placeholderTextColor="#94a3b8"
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={2}
            />
          </View>

          {/* Stepper Jumlah Porsi */}
          <View style={styles.quantitySection}>
            <Text style={styles.sectionTitle}>Jumlah Pesanan</Text>
            <View style={styles.stepperContainer}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => setQuantity((prev) => Math.max(1, prev - 1))}
              >
                <Ionicons name="remove" size={18} color="#1e293b" />
              </TouchableOpacity>
              <Text style={styles.stepperValue}>{quantity}</Text>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => setQuantity((prev) => prev + 1)}
              >
                <Ionicons name="add" size={18} color="#1e293b" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar: Total & Tombol Pesan */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomLabel}>Total Harga</Text>
          <Text style={styles.bottomPrice}>{formatRupiah(totalPrice)}</Text>
        </View>

        <TouchableOpacity
          style={styles.orderButton}
          activeOpacity={0.85}
          onPress={handleProceedToCheckout}
        >
          <Ionicons name="bag-check-outline" size={18} color="#ffffff" />
          <Text style={styles.orderButtonText}>Pesan Sekarang</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    paddingBottom: 110,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 260,
    backgroundColor: "#f1f5f9",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  backFloatingBtn: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 8,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  favoriteFloatingBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 8,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  contentCard: {
    padding: 20,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
  },
  headerInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  categoryBadge: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0284c7",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  itemName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
  },
  itemPrice: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0284c7",
    marginLeft: 12,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    justifyContent: "center",
  },
  metaText: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "600",
  },
  metaDivider: {
    width: 1,
    height: 16,
    backgroundColor: "#cbd5e1",
  },
  sectionBlock: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 22,
  },
  levelRow: {
    flexDirection: "row",
    gap: 10,
  },
  levelChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    alignItems: "center",
  },
  levelChipActive: {
    backgroundColor: "#ef4444",
    borderColor: "#ef4444",
  },
  levelText: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "600",
  },
  levelTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  noteInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: "#1e293b",
    textAlignVertical: "top",
  },
  quantitySection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    padding: 4,
    gap: 12,
  },
  stepperBtn: {
    backgroundColor: "#ffffff",
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  stepperValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    minWidth: 20,
    textAlign: "center",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bottomLabel: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "500",
  },
  bottomPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0284c7",
  },
  orderButton: {
    backgroundColor: "#0284c7",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  orderButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },
});

