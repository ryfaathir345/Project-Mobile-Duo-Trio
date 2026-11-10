import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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

import { initialMenuData, MenuItem } from "@/data/menuData";

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
  const [totalCartPrice, setTotalCartPrice] = useState<number>(0);

  // Inisialisasi Expo Router untuk navigasi halaman
  const router = useRouter();

  // =========================================================================
  // 2. KRITERIA PENILAIAN MODUL 2: PENERAPAN HOOK USEEFFECT
  // =========================================================================

  // [useEffect 1]: Initial Mount (Dependencies kosong [])
  // Mensimulasikan pengambilan/fetching data dari server seperti dijelaskan pada Modul 2 hal. 10
  useEffect(() => {
    const timer = setTimeout(() => {
      setMenuList(initialMenuData);
      setIsLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  // [useEffect 2]: Reactive Update (Dependencies [cart])
  // Berjalan setiap kali state `cart` berubah untuk mengkalkulasi ulang total harga
  // Sesuai materi Modul 2 hal. 9: "Jalankan fungsi setiap kali nilai state berubah"
  useEffect(() => {
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    setTotalCartPrice(total);
  }, [cart]);

  // =========================================================================
  // FUNGSI LOGIKA & HANDLERS
  // =========================================================================

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
          c.id === item.id ? { ...c, qty: c.qty + 1 } : c
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
    // Berpindah ke halaman detail sambil mengirimkan parameter dynamic (Modul hal. 32)
    router.push({
      pathname: "/detail",
      params: { id: item.id },
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

  const categories = ["Semua", "Makanan", "Minuman", "Camilan"];

  // Custom render untuk setiap kartu menu (Modul 1: Custom Function + FlatList)
  const renderMenuItem = ({ item }: { item: MenuItem }) => {
    const itemInCart = cart.find((c) => c.id === item.id);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.88}
        onPress={() => handleOpenDetail(item)}
      >
        <Image source={{ uri: item.imageUri }} style={styles.image} />

        <View style={styles.infoContainer}>
          {/* Header Card: Nama & Rating */}
          <View style={styles.cardHeader}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color="#f59e0b" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
          </View>

          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>

          {/* Tag Bar: Waktu penyajian, Kalori, dan Pedas (Kondisional) */}
          <View style={styles.tagRow}>
            <View style={styles.tagBadge}>
              <Ionicons name="time-outline" size={11} color="#64748b" />
              <Text style={styles.tagText}>{item.prepTime}</Text>
            </View>

            {/* Menerapkan Inline Style kondisional untuk label Pedas */}
            {item.isSpicy && (
              <View
                style={[
                  styles.tagBadge,
                  { backgroundColor: "#fee2e2", borderColor: "#fecaca" },
                ]}
              >
                <Ionicons name="flame" size={12} color="#dc2626" />
                <Text style={{ color: "#dc2626", fontSize: 11, fontWeight: "600", marginLeft: 2 }}>
                  Pedas
                </Text>
              </View>
            )}
          </View>

          {/* Bagian Bawah: Harga & Tombol Tambah */}
          <View style={styles.bottomRow}>
            <Text style={styles.price}>{formatRupiah(item.price)}</Text>

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
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Input Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
        <TextInput
          placeholder="Cari makanan, kopi, atau camilan..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={18} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Kategori Chips */}
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

        {/* Toggle Menu Pedas */}
        <TouchableOpacity
          style={[
            styles.spicyToggle,
            isSpicyOnly && { backgroundColor: "#fee2e2", borderColor: "#ef4444" },
          ]}
          onPress={() => setIsSpicyOnly(!isSpicyOnly)}
        >
          <Ionicons
            name="flame"
            size={14}
            color={isSpicyOnly ? "#dc2626" : "#64748b"}
          />
          <Text
            style={[
              styles.spicyToggleText,
              isSpicyOnly && { color: "#dc2626", fontWeight: "700" },
            ]}
          >
            Hanya Pedas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Konten Utama Menu / Loading Indicator */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0284c7" />
          <Text style={styles.loadingText}>Memuat sajian Kafe Koding...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredMenu}
          keyExtractor={(item) => item.id}
          renderItem={renderMenuItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="restaurant-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyTitle}>Menu Tidak Ditemukan</Text>
              <Text style={styles.emptySubtitle}>
                Coba cari dengan kata kunci lain atau pilih kategori Semua.
              </Text>
            </View>
          }
        />
      )}

      {/* Floating Bar Keranjang (Muncul reaktif saat cart terisi) */}
      {cart.length > 0 && (
        <View style={styles.cartBarContainer}>
          <View>
            <Text style={styles.cartItemsCount}>
              {cart.reduce((total, c) => total + c.qty, 0)} Item dipilih
            </Text>
            <Text style={styles.cartTotalPrice}>{formatRupiah(totalCartPrice)}</Text>
          </View>

          <TouchableOpacity
            style={styles.checkoutBarButton}
            onPress={handleOpenCheckout}
          >
            <Text style={styles.checkoutBarButtonText}>Lanjut Checkout</Text>
            <Ionicons name="arrow-forward" size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Tombol Mini Akses Codelab 1 (Mempermudah saat Aslab meminta bukti Codelab) */}
      <View style={styles.codelabLinkContainer}>
        <TouchableOpacity
          style={styles.codelabButton}
          onPress={() => router.push("/codelab1")}
        >
          <Ionicons name="code-slash" size={14} color="#64748b" />
          <Text style={styles.codelabText}>Buka Demo Codelab 1 (useContext)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// =========================================================================
// EXTERNAL STYLES (StyleSheet.create)
// =========================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1e293b",
  },
  filterSection: {
    paddingHorizontal: 16,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryList: {
    paddingVertical: 6,
    gap: 8,
  },
  categoryChip: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  categoryChipActive: {
    backgroundColor: "#0284c7",
    borderColor: "#0284c7",
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748b",
  },
  categoryTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  spicyToggle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 4,
    marginLeft: 6,
  },
  spicyToggleText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 90,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  image: {
    width: 95,
    height: 95,
    borderRadius: 12,
    marginRight: 14,
    backgroundColor: "#f1f5f9",
  },
  infoContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    flex: 1,
    marginRight: 6,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#b45309",
  },
  description: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 17,
    marginTop: 2,
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
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    color: "#64748b",
    marginLeft: 3,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  price: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0284c7",
  },
  addButton: {
    backgroundColor: "#0ea5e9",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748b",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 30,
  },
  cartBarContainer: {
    position: "absolute",
    bottom: 34,
    left: 16,
    right: 16,
    backgroundColor: "#0f172a",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  cartItemsCount: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "500",
  },
  cartTotalPrice: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  checkoutBarButton: {
    backgroundColor: "#0ea5e9",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 6,
  },
  checkoutBarButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  codelabLinkContainer: {
    alignItems: "center",
    paddingVertical: 8,
  },
  codelabButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
  },
  codelabText: {
    fontSize: 11,
    color: "#64748b",
    textDecorationLine: "underline",
  },
});
