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

import { CoffeeTheme } from "@/constants/theme";
import { initialMenuData } from "@/data/menuData";
import type { MenuItem } from "@/data/menuData";

export default function DetailScreen() {
  const router = useRouter();

  // =========================================================================
  // 1. KRITERIA PENILAIAN MODUL 2: USELOCALPARAMS()
  // =========================================================================
  const { id, itemJson } = useLocalSearchParams<{ id: string; itemJson?: string }>();

  let apiItem: MenuItem | undefined;
  try {
    const serializedItem = Array.isArray(itemJson) ? itemJson[0] : itemJson;
    apiItem = serializedItem ? (JSON.parse(serializedItem) as MenuItem) : undefined;
  } catch {
    apiItem = undefined;
  }
  const item = apiItem ?? initialMenuData.find((m) => m.id === id) ?? initialMenuData[0];

  // =========================================================================
  // 2. KRITERIA PENILAIAN MODUL 2: HOOK USESTATE
  // =========================================================================
  const [quantity, setQuantity] = useState<number>(1);
  const [note, setNote] = useState<string>("");
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [spicyLevel, setSpicyLevel] = useState<number>(1);

  const formatRupiah = (val: number) => `Rp ${val.toLocaleString("id-ID")}`;

  // =========================================================================
  // 3. KRITERIA PENILAIAN MODUL 2: CANGOBACK() & BACK()
  // =========================================================================
  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

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
    <View style={styles.screenWrapper}>
      <View style={styles.contentContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Banner Gambar Menu */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.imageUri }} style={styles.bannerImage} />

            {/* Tombol Back & Favorite */}
            <TouchableOpacity
              style={styles.backFloatingBtn}
              onPress={handleGoBack}
            >
              <Ionicons
                name="arrow-back-outline"
                size={18}
                color={CoffeeTheme.colors.textPrimary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.favoriteFloatingBtn}
              onPress={() => setIsFavorite(!isFavorite)}
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={18}
                color={
                  isFavorite
                    ? CoffeeTheme.colors.spicyRed
                    : CoffeeTheme.colors.textSecondary
                }
              />
            </TouchableOpacity>
          </View>

          {/* Informasi Utama Menu */}
          <View style={styles.contentCard}>
            <View style={styles.headerInfo}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={styles.categoryBadge}>{item.category}</Text>
                <Text style={styles.itemName}>{item.name}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.itemPrice}>{formatRupiah(item.price)}</Text>
                <Text style={styles.priceNote}>Harga standar</Text>
              </View>
            </View>

            {/* Meta Bar: Rating, Durasi Masak, Kalori */}
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons
                  name="star"
                  size={14}
                  color={CoffeeTheme.colors.accentAmber}
                />
                <Text style={styles.metaText}>
                  {item.rating > 0 ? `${item.rating.toFixed(1)} Rating` : "Kurasi"}
                </Text>
              </View>
              <View style={styles.metaDivider} />
              <View style={styles.metaItem}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={CoffeeTheme.colors.brandSecondary}
                />
                <Text style={styles.metaText}>{item.prepTime}</Text>
              </View>
              <View style={styles.metaDivider} />
              <View style={styles.metaItem}>
                <Ionicons
                  name="cafe-outline"
                  size={14}
                  color={CoffeeTheme.colors.textSecondary}
                />
                <Text style={styles.metaText}>{item.calories || "150 kkal"}</Text>
              </View>
            </View>

            {/* Deskripsi Lengkap */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Deskripsi Menu</Text>
              <Text style={styles.descriptionText}>{item.description}</Text>
              {item.area ? (
                <Text style={styles.areaText}>Kategori Tradisi: {item.area}</Text>
              ) : null}
            </View>

            {item.ingredients && item.ingredients.length > 0 && (
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionTitle}>Bahan Racikan</Text>
                {item.ingredients.map((ingredient, index) => (
                  <Text
                    key={`${item.id}-ingredient-${index}`}
                    style={styles.descriptionText}
                  >
                    • {ingredient}
                  </Text>
                ))}
              </View>
            )}

            {item.instructions ? (
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionTitle}>Petunjuk Penyajian</Text>
                <Text style={styles.descriptionText}>{item.instructions}</Text>
              </View>
            ) : null}

            {/* Pengaturan Level Pedas */}
            {item.isSpicy && (
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionTitle}>Pilih Tingkat Kepedasan</Text>
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
              <Text style={styles.sectionTitle}>Catatan Racikan (Opsional)</Text>
              <TextInput
                style={styles.noteInput}
                placeholder="Contoh: Kurang gula, ekstra es, sajikan duluan..."
                placeholderTextColor={CoffeeTheme.colors.textMuted}
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={2}
              />
            </View>

            {/* Stepper Jumlah Porsi */}
            <View style={styles.quantitySection}>
              <Text style={styles.sectionTitle}>Jumlah Porsi</Text>
              <View style={styles.stepperContainer}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setQuantity((prev) => Math.max(1, prev - 1))}
                >
                  <Ionicons
                    name="remove"
                    size={16}
                    color={CoffeeTheme.colors.textPrimary}
                  />
                </TouchableOpacity>
                <Text style={styles.stepperValue}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setQuantity((prev) => prev + 1)}
                >
                  <Ionicons
                    name="add"
                    size={16}
                    color={CoffeeTheme.colors.textPrimary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Bar: Total & Tombol Pesan */}
        <View style={styles.bottomBarWrapper}>
          <View style={styles.bottomBar}>
            <View>
              <Text style={styles.bottomLabel}>Total Harga</Text>
              <Text style={styles.bottomPrice}>{formatRupiah(totalPrice)}</Text>
            </View>

            <TouchableOpacity
              style={styles.orderButton}
              activeOpacity={0.88}
              onPress={handleProceedToCheckout}
            >
              <Ionicons name="bag-check-outline" size={16} color="#ffffff" />
              <Text style={styles.orderButtonText}>Lanjut Pesan</Text>
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
    paddingBottom: 24,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 240,
    backgroundColor: CoffeeTheme.colors.surfaceSubtle,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  backFloatingBtn: {
    position: "absolute",
    top: 14,
    left: 14,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 8,
    borderRadius: CoffeeTheme.radii.full,
    borderWidth: 1,
    borderColor: CoffeeTheme.colors.border,
  },
  favoriteFloatingBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 8,
    borderRadius: CoffeeTheme.radii.full,
    borderWidth: 1,
    borderColor: CoffeeTheme.colors.border,
  },
  contentCard: {
    padding: 18,
    backgroundColor: CoffeeTheme.colors.surface,
    borderTopLeftRadius: CoffeeTheme.radii.lg,
    borderTopRightRadius: CoffeeTheme.radii.lg,
    marginTop: -16,
    borderWidth: 1,
    borderColor: CoffeeTheme.colors.border,
  },
  headerInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  categoryBadge: {
    fontSize: 11,
    fontWeight: "700",
    color: CoffeeTheme.colors.brandSecondary,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "800",
    color: CoffeeTheme.colors.textPrimary,
  },
  priceNote: {
    color: CoffeeTheme.colors.textMuted,
    fontSize: 9,
    marginTop: 2,
    textAlign: "right" as const,
  },
  itemPrice: {
    fontSize: 17,
    fontWeight: "800",
    color: CoffeeTheme.colors.brand,
    fontVariant: ["tabular-nums"],
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CoffeeTheme.colors.surfaceSubtle,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: CoffeeTheme.radii.md,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: CoffeeTheme.colors.border,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flex: 1,
    justifyContent: "center",
  },
  metaText: {
    fontSize: 11,
    color: CoffeeTheme.colors.textSecondary,
    fontWeight: "600",
  },
  metaDivider: {
    width: 1,
    height: 14,
    backgroundColor: CoffeeTheme.colors.border,
  },
  sectionBlock: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: CoffeeTheme.colors.textPrimary,
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 12,
    color: CoffeeTheme.colors.textSecondary,
    lineHeight: 18,
  },
  areaText: {
    fontSize: 11,
    color: CoffeeTheme.colors.textMuted,
    marginTop: 4,
    fontStyle: "italic",
  },
  levelRow: {
    flexDirection: "row",
    gap: 8,
  },
  levelChip: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: CoffeeTheme.radii.md,
    borderWidth: 1,
    borderColor: CoffeeTheme.colors.border,
    backgroundColor: CoffeeTheme.colors.surfaceSubtle,
    alignItems: "center",
  },
  levelChipActive: {
    backgroundColor: CoffeeTheme.colors.spicyRedBg,
    borderColor: CoffeeTheme.colors.spicyRedBorder,
  },
  levelText: {
    fontSize: 12,
    color: CoffeeTheme.colors.textSecondary,
    fontWeight: "600",
  },
  levelTextActive: {
    color: CoffeeTheme.colors.spicyRed,
    fontWeight: "700",
  },
  noteInput: {
    backgroundColor: CoffeeTheme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: CoffeeTheme.colors.border,
    borderRadius: CoffeeTheme.radii.md,
    padding: 10,
    fontSize: 12,
    color: CoffeeTheme.colors.textPrimary,
    outlineStyle: "none" as any,
  },
  quantitySection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: CoffeeTheme.colors.borderSubtle,
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CoffeeTheme.colors.surfaceSubtle,
    borderRadius: CoffeeTheme.radii.md,
    padding: 3,
    gap: 10,
    borderWidth: 1,
    borderColor: CoffeeTheme.colors.border,
  },
  stepperBtn: {
    backgroundColor: CoffeeTheme.colors.surface,
    width: 28,
    height: 28,
    borderRadius: CoffeeTheme.radii.sm,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: CoffeeTheme.colors.border,
  },
  stepperValue: {
    fontSize: 14,
    fontWeight: "700",
    color: CoffeeTheme.colors.textPrimary,
    minWidth: 18,
    textAlign: "center",
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
    justifyContent: "space-between",
    alignItems: "center",
  },
  bottomLabel: {
    fontSize: 10,
    color: CoffeeTheme.colors.textSecondary,
    fontWeight: "500",
  },
  bottomPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: CoffeeTheme.colors.brand,
    fontVariant: ["tabular-nums"],
  },
  orderButton: {
    backgroundColor: CoffeeTheme.colors.brand,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: CoffeeTheme.radii.md,
    gap: 6,
  },
  orderButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 13,
  },
});
