import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { createContext, useContext, useState } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// =========================================================================
// CODELAB-1 (MODUL 2 HALAMAN 17)
// Materi: useContext & createContext untuk State Management Dark Mode
// =========================================================================

// 1. Membuat ThemeContext
const ThemeContext = createContext<{
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

export default function Codelab1Screen() {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const router = useRouter();

  return (
    // 2. Membungkus component tree dengan Provider
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      <View style={[styles.wrapper, { backgroundColor: darkMode ? "#0f172a" : "#f8fafc" }]}>
        {/* Tombol Kembali ke Menu Kafe */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={18} color={darkMode ? "#ffffff" : "#0f172a"} />
          <Text style={[styles.backText, { color: darkMode ? "#ffffff" : "#0f172a" }]}>
            Kembali ke Menu Kafe Koding
          </Text>
        </TouchableOpacity>

        <Home />
      </View>
    </ThemeContext.Provider>
  );
}

// Komponen perantara untuk membuktikan tidak terjadinya Prop Drilling
function Home() {
  return <Profile />;
}

function Profile() {
  return <UserCard />;
}

function UserCard() {
  return <UserName />;
}

// Komponen terdalam yang mengonsumsi ThemeContext langsung menggunakan useContext
function UserName() {
  // 3. Mengambil value dari ThemeContext dengan useContext Hook
  const theme = useContext(ThemeContext);

  if (!theme) return null;

  const { darkMode, setDarkMode } = theme;

  return (
    <View style={styles.cardContainer}>
      <Text style={styles.badge}>Materi Modul 2: Prop Drilling Solved</Text>

      <Text
        style={[
          styles.titleText,
          { color: darkMode ? "#38bdf8" : "#0284c7" },
        ]}
      >
        {darkMode ? "Mode Gelap (Dark Mode) 🌙" : "Mode Terang (Light Mode) ☀️"}
      </Text>

      <Text
        style={[
          styles.descText,
          { color: darkMode ? "#94a3b8" : "#64748b" },
        ]}
      >
        Komponen ini terletak di dalam hierarki{"\n"}
        Home → Profile → UserCard → UserName{"\n"}
        tanpa perlu meneruskan props secara manual!
      </Text>

      <View style={styles.btnBox}>
        <Button
          title={darkMode ? "Ubah ke Light Mode" : "Ubah ke Dark Mode"}
          color={darkMode ? "#38bdf8" : "#0284c7"}
          onPress={() => setDarkMode(!darkMode)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  backBtn: {
    position: "absolute",
    top: 20,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    zIndex: 10,
  },
  backText: {
    fontSize: 14,
    fontWeight: "600",
  },
  cardContainer: {
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
  },
  badge: {
    backgroundColor: "#e0f2fe",
    color: "#0369a1",
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 16,
  },
  titleText: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 10,
    textAlign: "center",
  },
  descText: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  btnBox: {
    width: 220,
    borderRadius: 10,
    overflow: "hidden",
  },
});

