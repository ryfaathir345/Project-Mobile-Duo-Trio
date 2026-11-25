import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { CoffeeTheme } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import type { MenuItem } from "@/data/menuData";
import { initialMenuData } from "@/data/menuData";
import { supabase } from "@/lib/supabase";
import { fetchMenuFromApi, searchMenuFromApi } from "@/services/menuService";

// Tipe data untuk item dalam keranjang belanja
export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  imageUri: string;
}

export default function IndexScreen() {
  // =========================================================================
  // 1. KRITERIA PENILAIAN MODUL 2: PENERAPAN HOOK USESTATE
  // =========================================================================
  const [menuList, setMenuList] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSpicyOnly, setIsSpicyOnly] = useState<boolean>(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiMessage, setApiMessage] = useState<string>(
    "Menghubungkan ke TheMealDB...",
  );
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(false);
  // Perhitungan total harga keranjang secara reaktif
  const totalCartPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  // Inisialisasi Expo Router untuk navigasi halaman
  const router = useRouter();
  const { width } = useWindowDimensions();

  // Responsive Grid Logic: 1 kolom di mobile, 2 kolom di tablet, 3 kolom di desktop
  const numColumns = width >= 980 ? 3 : width >= 640 ? 2 : 1;
  const isMultiColumn = numColumns > 1;

  // Autentikasi Supabase & Profil Sesi (Modul 4)
  const { user, signOut } = useAuth();
  const displayName =
    (user?.user_metadata as any)?.callsign ||
    (user?.user_metadata as any)?.name ||
    user?.email?.split("@")[0] ||
    "Pelanggan";

  // Verifikasi Codelab 2: Log Supabase URL (Modul 4 Hal. 10)
  useEffect(() => {
    console.log("Supabase URL:", (supabase as any).supabaseUrl);
  }, []);

  // Custom async function + await: tunggu API, lalu perbarui state.
  const loadMenuFromApi = useCallback(async () => {
    setIsLoading(true);
    setApiMessage("Menyegarkan resep dari TheMealDB...");
    try {
      const apiMenu = await fetchMenuFromApi();
      setMenuList(apiMenu);
      setIsUsingFallback(false);
      setApiMessage(`Tersedia ${apiMenu.length} sajian kurasi resep.`);
    } catch (error) {
      // Fallback agar aplikasi tetap dapat digunakan saat internet/API gagal.
      setMenuList(initialMenuData);
      setIsUsingFallback(true);
      setApiMessage(
        error instanceof Error
          ? `Koneksi cloud dialihkan: ${error.message}. Menampilkan menu racikan lokal.`
          : "Menampilkan menu racikan lokal.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Pencarian dikirim ke endpoint TheMealDB search.php?s=...
  const handleSearch = useCallback(async () => {
    const query = searchQuery.trim();
    if (!query) {
      await loadMenuFromApi();
      return;
    }

    setIsLoading(true);
    setApiMessage(`Mencari sajian "${query}"...`);
    try {
      const searchResults = await searchMenuFromApi(query);
      setMenuList(searchResults);
      setIsUsingFallback(false);
      setApiMessage(
        searchResults.length > 0
          ? `Ditemukan ${searchResults.length} menu yang cocok.`
          : `Tidak ada menu untuk kata kunci "${query}".`,
      );
    } catch (error) {
      setApiMessage(
        error instanceof Error
          ? `Pencarian gagal: ${error.message}`
          : "Pencarian gagal.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [loadMenuFromApi, searchQuery]);

  // [useEffect 1]: Initial Mount. Memanggil custom async function saat halaman dibuka.
  useEffect(() => {
    void loadMenuFromApi();
  }, [loadMenuFromApi]);


  // Format angka ke format mata uang Rupiah
  const formatRupiah = (price: number) => {
    return `Rp ${price.toLocaleString("id-ID")}`;
  };

  // Menambahkan item ke keranjang secara cepat dari halaman utama
  const handleQuickAddToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existing = prevCart.find((c) => c.id === item.id);
      if (existing) {
        return prevCart.map((c) =>
          c.id === item.id ? { ...c, qty: c.qty + 1 } : c,
        );
      }
      return [
        ...prevCart,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          qty: 1,
          imageUri: item.imageUri,
        },
      ];
    });
  };

  // =========================================================================
  // 3. KRITERIA PENILAIAN MODUL 2: NAVIGASI MENGGUNAKAN ROUTER.PUSH()
  // =========================================================================
  const handleOpenDetail = (item: MenuItem) => {
    router.push({
      pathname: "/detail",
      params: { id: item.id, itemJson: JSON.stringify(item) },
    });
  };

  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    router.push({
      pathname: "/checkout",
      params: {
        cartJson: JSON.stringify(cart),
        totalPrice: totalCartPrice.toString(),
      },
    });
  };

  // Filter daftar menu berdasarkan pencarian, kategori, dan toggle pedas
  const filteredMenu = menuList.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "Semua" || item.category === selectedCategory;
    const matchesSpicy = isSpicyOnly ? item.isSpicy : true;
    return matchesSearch && matchesCategory && matchesSpicy;
  });

  const categories = [
    "Semua",
    ...Array.from(new Set(menuList.map((item) => item.category))),
  ];

  // Custom render untuk setiap kartu menu (Modul 1: Custom Function + FlatList)
  const renderMenuItem = ({ item }: { item: MenuItem }) => {
    const itemInCart = cart.find((c) => c.id === item.id);

    return (
      <TouchableOpacity
        style={[
          styles.card,
          isMultiColumn ? styles.gridCard : styles.rowCard,
        ]}
        activeOpacity={0.88}
        onPress={() => handleOpenDetail(item)}
      >
        <Image
          source={{ uri: item.imageUri }}
          style={isMultiColumn ? styles.gridImage : styles.rowImage}
        />

        <View style={styles.infoContainer}>
          {/* Header Card: Nama & Rating */}
          <View style={styles.cardHeader}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={styles.ratingBadge}>
              <Ionicons
                name="star"
                size={11}
                color={CoffeeTheme.colors.accentAmber}
              />
              <Text style={styles.ratingText}>
                {item.rating > 0 ? item.rating.toFixed(1) : "Pilihan"}
              </Text>
            </View>
          </View>

          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>

          {/* Tag Bar: Waktu penyajian, Kalori, dan Pedas */}
          <View style={styles.tagRow}>
            <View style={styles.tagBadge}>
              <Ionicons
                name="time-outline"
                size={11}
                color={CoffeeTheme.colors.textSecondary}
              />
              <Text style={styles.tagText}>{item.prepTime}</Text>
            </View>

            {item.calories ? (
              <View style={styles.tagBadge}>
                <Ionicons
                  name="cafe-outline"
                  size={11}
                  color={CoffeeTheme.colors.textSecondary}
                />
                <Text style={styles.tagText}>{item.calories}</Text>
              </View>
            ) : null}

            {item.isSpicy && (
              <View style={styles.spicyBadge}>
                <Ionicons
                  name="flame-outline"
                  size={11}
                  color={CoffeeTheme.colors.spicyRed}
                />
                <Text style={styles.spicyText}>Pedas</Text>
              </View>
            )}
          </View>

          {/* Bagian Bawah: Harga & Tombol Tambah */}
          <View style={styles.bottomRow}>
            <View>
              <Text style={styles.price}>{formatRupiah(item.price)}</Text>
              <Text style={styles.priceNote}>Siap disajikan</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.addButton,
                itemInCart ? styles.addButtonActive : {},
              ]}
              onPress={() => handleQuickAddToCart(item)}
            >
              <Ionicons
                name={itemInCart ? "checkmark" : "bag-add-outline"}
                size={15}
                color="#ffffff"
              />
              <Text style={styles.addButtonText}>
                {itemInCart ? `(${itemInCart.qty}) Ditambah` : "Pesan"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screenWrapper}>
      <View style={styles.contentContainer}>
        {/* Header Bar Sesi Pengguna: Alami, Hangat, & Modern */}
        <View style={styles.authStatusBar}>
          <View style={styles.authInfoCol}>
            <View style={styles.memberStatusRow}>
              <View style={styles.activeDot} />
              <Text style={styles.memberStatusText}>PELANGGAN KAFE</Text>
            </View>
            <Text style={styles.userName} numberOfLines={1}>
              {displayName}
            </Text>
          </View>

          <View style={styles.authActionsRow}>
            <TouchableOpacity
              style={styles.headerActionBtn}
              onPress={() => router.push("/missions" as any)}
            >
              <Ionicons
                name="receipt-outline"
                size={13}
                color={CoffeeTheme.colors.brandSecondary}
              />
              <Text style={styles.headerActionText}>Pesanan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerActionBtn}
              onPress={() => router.push("/vault" as any)}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={13}
                color={CoffeeTheme.colors.textSecondary}
              />
              <Text style={styles.headerActionText}>Brankas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signOutBtn}
              onPress={async () => {
                await signOut();
              }}
            >
              <Ionicons
                name="log-out-outline"
                size={15}
                color={CoffeeTheme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Input Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons
              name="search-outline"
              size={18}
              color={CoffeeTheme.colors.textMuted}
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Cari kopi, makanan, atau racikan spesial..."
              placeholderTextColor={CoffeeTheme.colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              style={styles.searchInput}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery("");
                  void loadMenuFromApi();
                }}
              >
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={CoffeeTheme.colors.textMuted}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Status Cloud & Refresh Bar */}
        <View style={styles.apiStatusRow}>
          <View style={styles.apiStatusTextContainer}>
            <Text style={styles.apiStatusTitle}>
              {isUsingFallback ? "Koleksi Kafe Koding" : "TheMealDB Cloud"}
            </Text>
            <Text style={styles.apiStatusMessage} numberOfLines={1}>
              {apiMessage}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={loadMenuFromApi}
            disabled={isLoading}
          >
            <Ionicons
              name="refresh-outline"
              size={14}
              color={CoffeeTheme.colors.brandSecondary}
            />
            <Text style={styles.refreshButtonText}>Segarkan</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Kategori Chips & Toggle Pedas */}
        <View style={styles.filterSection}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  selectedCategory === item && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(item)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === item && styles.categoryTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.categoryList}
          />

          <TouchableOpacity
            style={[
              styles.spicyToggle,
              isSpicyOnly && styles.spicyToggleActive,
            ]}
            onPress={() => setIsSpicyOnly(!isSpicyOnly)}
          >
            <Ionicons
              name="flame-outline"
              size={13}
              color={
                isSpicyOnly
                  ? CoffeeTheme.colors.spicyRed
                  : CoffeeTheme.colors.textSecondary
              }
            />
            <Text
              style={[
                styles.spicyToggleText,
                isSpicyOnly && styles.spicyToggleTextActive,
              ]}
            >
              Pedas
            </Text>
          </TouchableOpacity>
        </View>

        {/* Konten Utama Menu / Loading Indicator */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={CoffeeTheme.colors.brand}
            />
            <Text style={styles.loadingText}>Menyiapkan sajian lezat...</Text>
          </View>
        ) : (
          <FlatList
            key={`menu-grid-${numColumns}`}
            data={filteredMenu}
            numColumns={numColumns}
            columnWrapperStyle={isMultiColumn ? styles.columnWrapper : undefined}
            keyExtractor={(item) => item.id}
            renderItem={renderMenuItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="cafe-outline"
                  size={42}
                  color={CoffeeTheme.colors.textMuted}
                />
                <Text style={styles.emptyTitle}>Sajian Tidak Ditemukan</Text>
                <Text style={styles.emptySubtitle}>
                  Silakan coba kata kunci lain atau pilih kategori &quot;Semua&quot;.
                </Text>
              </View>
            }
          />
        )}

        {/* Floating Bar Keranjang */}
        {cart.length > 0 && (
          <View style={styles.cartBarWrapper}>
            <View style={styles.cartBarContainer}>
              <View style={styles.cartBarInfo}>
                <View style={styles.cartIconBadge}>
                  <Ionicons name="bag-handle-outline" size={16} color="#ffffff" />
                </View>
                <View>
                  <Text style={styles.cartItemsCount}>
                    {cart.reduce((total, c) => total + c.qty, 0)} Pesanan Dipilih
                  </Text>
                  <Text style={styles.cartTotalPrice}>
                    {formatRupiah(totalCartPrice)}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.checkoutBarButton}
                onPress={handleOpenCheckout}
              >
                <Text style={styles.checkoutBarButtonText}>Selesaikan Order</Text>
                <Ionicons name="arrow-forward-outline" size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Footer Fitur Kafe Koding & Akses Modul */}
        <View style={styles.footerNav}>
          <Text style={styles.footerNote}>KAFE KODING — MODUL PRAKTIKUM MOBILE</Text>
          <View style={styles.footerButtonsRow}>
            <TouchableOpacity
              style={styles.footerButton}
              onPress={() => router.push("/missions" as any)}
            >
              <Ionicons
                name="receipt-outline"
                size={12}
                color={CoffeeTheme.colors.textSecondary}
              />
              <Text style={styles.footerButtonText}>Pesanan Cloud</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.footerButton}
              onPress={() => router.push("/vault" as any)}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={12}
                color={CoffeeTheme.colors.textSecondary}
              />
              <Text style={styles.footerButtonText}>Brankas Token</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.footerButton}
              onPress={() => router.push("/feedback-list")}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={12}
                color={CoffeeTheme.colors.textSecondary}
              />
              <Text style={styles.footerButtonText}>Ulasan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.footerButton}
              onPress={() => router.push("/codelab1")}
            >
              <Ionicons
                name="contrast-outline"
                size={12}
                color={CoffeeTheme.colors.textSecondary}
              />
              <Text style={styles.footerButtonText}>Mode Tampilan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

// =========================================================================
// EXTERNAL STYLES: Responsive & Artisanal Coffeehouse Aesthetic
// =========================================================================
const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: CoffeeTheme.colors.canvas,
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    width: "100%",
    maxWidth: CoffeeTheme.layout.maxContentWidth,
  },
  authStatusBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: CoffeeTheme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: CoffeeTheme.colors.border,
  },
  authInfoCol: {
    flex: 1,
    marginRight: 10,
  },
  memberStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 2,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: CoffeeTheme.colors.successGreen,
  },
  memberStatusText: {
    color: CoffeeTheme.colors.textSecondary,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  userName: {
    color: CoffeeTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  authActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CoffeeTheme.colors.surfaceSubtle,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: CoffeeTheme.radii.md,
    gap: 4,
    borderWidth: 1,
    borderColor: CoffeeTheme.colors.border,
  },
  headerActionText: {
    color: CoffeeTheme.colors.textPrimary,
    fontSize: 11,
    fontWeight: "600",
  },
  signOutBtn: {
    backgroundColor: CoffeeTheme.colors.surfaceSubtle,
    padding: 7,
    borderRadius: CoffeeTheme.radii.md,
    borderWidth: 1,
    borderColor: CoffeeTheme.colors.border,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CoffeeTheme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: CoffeeTheme.radii.lg,
    borderWidth: 1,
    borderColor: CoffeeTheme.colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: CoffeeTheme.colors.textPrimary,
    outlineStyle: "none" as any,
  },
  apiStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: CoffeeTheme.colors.surfaceSubtle,
    borderRadius: CoffeeTheme.radii.md,
    borderWidth: 1,
    borderColor: CoffeeTheme.colors.border,
    gap: 8,
  },
  apiStatusTextContainer: {
    flex: 1,
  },
  apiStatusTitle: {
    color: CoffeeTheme.colors.brandSecondary,
    fontSize: 11,
    fontWeight: "700",
  },
  apiStatusMessage: {
    color: CoffeeTheme.colors.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: CoffeeTheme.colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: CoffeeTheme.radii.sm,
    borderWidth: 1,
    borderColor: CoffeeTheme.colors.border,
  },
  refreshButtonText: {
    color: CoffeeTheme.colors.brandSecondary,
    fontSize: 11,
    fontWeight: "600",
  },
  filterSection: {
    paddingHorizontal: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryList: {
    gap: 8,
    paddingVertical: 4,
  },
  categoryChip: {
    backgroundColor: CoffeeTheme.colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: CoffeeTheme.radii.full,
    borderWidth: 1,
    borderColor: CoffeeTheme.colors.border,
  },
  categoryChipActive: {
    backgroundColor: CoffeeTheme.colors.brand,
    borderColor: CoffeeTheme.colors.brand,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "500",
    color: CoffeeTheme.colors.textSecondary,
  },
  categoryTextActive: {
    color: "#ffffff",
    fontWeight: "600",
  },
  spicyToggle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CoffeeTheme.colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: CoffeeTheme.radii.full,
    borderWidth: 1,
    borderColor: CoffeeTheme.colors.border,
    gap: 4,
    marginLeft: 8,
  },
  spicyToggleActive: {
    backgroundColor: CoffeeTheme.colors.spicyRedBg,
    borderColor: CoffeeTheme.colors.spicyRedBorder,
  },
  spicyToggleText: {
    fontSize: 11,
    color: CoffeeTheme.colors.textSecondary,
    fontWeight: "500",
  },
  spicyToggleTextActive: {
    color: CoffeeTheme.colors.spicyRed,
    fontWeight: "700",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  columnWrapper: {
    gap: 12,
  },
  card: {
    backgroundColor: CoffeeTheme.colors.surface,
    borderRadius: CoffeeTheme.radii.lg,
    borderWidth: 1,
    borderColor: CoffeeTheme.colors.border,
    overflow: "hidden",
    marginBottom: 12,
  },
  rowCard: {
    flexDirection: "row",
    padding: 12,
  },
  gridCard: {
    flex: 1,
    flexDirection: "column",
    padding: 0,
  },
  rowImage: {
    width: 90,
    height: 90,
    borderRadius: CoffeeTheme.radii.md,
    marginRight: 12,
    backgroundColor: CoffeeTheme.colors.surfaceSubtle,
  },
  gridImage: {
    width: "100%",
    height: 140,
    backgroundColor: CoffeeTheme.colors.surfaceSubtle,
  },
  infoContainer: {
    flex: 1,
    justifyContent: "space-between",
    padding: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
    color: CoffeeTheme.colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CoffeeTheme.colors.accentAmberBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: CoffeeTheme.radii.sm,
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "700",
    color: CoffeeTheme.colors.accentAmber,
    fontVariant: ["tabular-nums"],
  },
  description: {
    fontSize: 11,
    color: CoffeeTheme.colors.textSecondary,
    lineHeight: 16,
    marginTop: 4,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  tagBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CoffeeTheme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: CoffeeTheme.colors.borderSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: CoffeeTheme.radii.sm,
    gap: 3,
  },
  tagText: {
    fontSize: 10,
    color: CoffeeTheme.colors.textSecondary,
  },
  spicyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CoffeeTheme.colors.spicyRedBg,
    borderWidth: 1,
    borderColor: CoffeeTheme.colors.spicyRedBorder,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: CoffeeTheme.radii.sm,
    gap: 2,
  },
  spicyText: {
    fontSize: 10,
    color: CoffeeTheme.colors.spicyRed,
    fontWeight: "600",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 6,
    borderTopWidth: 1,
    borderColor: CoffeeTheme.colors.borderSubtle,
  },
  price: {
    fontSize: 14,
    fontWeight: "800",
    color: CoffeeTheme.colors.brand,
    fontVariant: ["tabular-nums"],
  },
  priceNote: {
    color: CoffeeTheme.colors.textMuted,
    fontSize: 9,
    marginTop: 1,
  },
  addButton: {
    backgroundColor: CoffeeTheme.colors.brand,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: CoffeeTheme.radii.md,
    gap: 4,
  },
  addButtonActive: {
    backgroundColor: CoffeeTheme.colors.brandSecondary,
  },
  addButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 11,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: CoffeeTheme.colors.textSecondary,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: CoffeeTheme.colors.textPrimary,
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 12,
    color: CoffeeTheme.colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 24,
  },
  cartBarWrapper: {
    position: "absolute",
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  cartBarContainer: {
    width: "100%",
    maxWidth: 680,
    backgroundColor: CoffeeTheme.colors.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: CoffeeTheme.radii.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: CoffeeTheme.colors.borderProminent,
  },
  cartBarInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cartIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: CoffeeTheme.colors.brandSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  cartItemsCount: {
    color: CoffeeTheme.colors.textMuted,
    fontSize: 11,
    fontWeight: "500",
  },
  cartTotalPrice: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  checkoutBarButton: {
    backgroundColor: CoffeeTheme.colors.accentAmber,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: CoffeeTheme.radii.lg,
    gap: 5,
  },
  checkoutBarButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  footerNav: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderColor: CoffeeTheme.colors.border,
    alignItems: "center",
    backgroundColor: CoffeeTheme.colors.surface,
  },
  footerNote: {
    fontSize: 9,
    fontWeight: "700",
    color: CoffeeTheme.colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  footerButtonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  footerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 3,
  },
  footerButtonText: {
    fontSize: 11,
    color: CoffeeTheme.colors.textSecondary,
    fontWeight: "500",
  },
});
