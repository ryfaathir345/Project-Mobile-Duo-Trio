import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// 2. Menerapkan Type & Array of Objects
interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  isSpicy: boolean;
  imageUri: string;
}

const menuData: MenuItem[] = [
  {
    id: "1",
    name: "Nasi Goreng Spesial",
    price: 25000,
    description: "Nasi goreng dengan telur, sosis, dan ayam.",
    isSpicy: true,
    imageUri: "https://picsum.photos/200",
  },
  {
    id: "2",
    name: "Ayam Bakar Madu",
    price: 30000,
    description: "Ayam bakar manis dengan sambal terpisah.",
    isSpicy: false,
    imageUri: "https://picsum.photos/201",
  },
  {
    id: "3",
    name: "Mie Kuah Pedas Mampus",
    price: 20000,
    description: "Mie kuah dengan tingkat kepedasan level 5.",
    isSpicy: true,
    imageUri: "https://picsum.photos/202",
  },
  {
    id: "4",
    name: "Es Teh Manis",
    price: 5000,
    description: "Teh manis dingin menyegarkan.",
    isSpicy: false,
    imageUri: "https://picsum.photos/203",
  },
];

export default function Index() {
  // 1. Menerapkan Deklarasi Custom Function
  const handleOrder = (itemName: string) => {
    Alert.alert(
      "Pesanan Masuk",
      `Kamu telah menambahkan ${itemName} ke pesanan!`,
    );
  };

  const formatRupiah = (price: number) => {
    return `Rp ${price.toLocaleString("id-ID")}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Kafe Koding</Text>
      <Text style={styles.headerSubtitle}>Menu Spesial Hari Ini</Text>

      {/* 1. Menerapkan Loop (Menggunakan FlatList) */}
      <FlatList
        data={menuData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          // 3. Menerapkan External Styles (styles.card)
          <View style={styles.card}>
            <Image source={{ uri: item.imageUri }} style={styles.image} />
            <View style={styles.infoContainer}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.description}>{item.description}</Text>

              <View style={styles.priceRow}>
                {/* 3. Menerapkan Inline Styles (Memberi warna merah jika pedas, hijau jika tidak) */}
                <Text
                  style={[
                    styles.price,
                    { color: item.isSpicy ? "#e74c3c" : "#2ecc71" },
                  ]}
                >
                  {formatRupiah(item.price)}
                </Text>

                {/* Inline style lagi untuk bagian label pedas */}
                {item.isSpicy && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginLeft: 8,
                    }}
                  >
                    <Ionicons name="flame" size={16} color="red" />
                    <Text style={{ color: "red", fontSize: 12 }}>Pedas</Text>
                  </View>
                )}
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <TextInput
                  placeholder="Masukkan catatan (opsional)"
                  style={{
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 4,
                    padding: 4,
                    marginBottom: 8,
                  }}
                />
              </View>

              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  console.log("Button pressed");
                  alert(`Kamu telah menambahkan ${item.name} ke pesanan!`);
                }}
              >
                <Text style={styles.buttonText}>Pesan Sekarang</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

// 3. Menerapkan External Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2f3640",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#7f8fa6",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    flexDirection: "row",
    elevation: 3, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2f3640",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#7f8fa6",
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#00a8ff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
