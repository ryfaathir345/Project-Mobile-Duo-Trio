// =========================================================================
// CODELAB-1 (5-10 menit, kerjakan di lab) - MODUL 2 HALAMAN 17
// File: usecontext_example.tsx
// =========================================================================

import React, { createContext, useContext, useState } from "react";
import { Button, Text, View } from "react-native";

// 1. Membuat context
const ThemeContext = createContext<any>(null);

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(false);

  return (
    // 2. Memberikan value ke Provider
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      <Home />
    </ThemeContext.Provider>
  );
}

function Home() {
  return <Profile />;
}

function Profile() {
  return <UserCard />;
}

function UserCard() {
  return <UserName />;
}

function UserName() {
  // 3. Mengambil data dari Context menggunakan hook useContext
  const theme = useContext(ThemeContext);
  const darkMode = theme.darkMode;
  const setDarkMode = theme.setDarkMode;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: darkMode ? "black" : "white",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <Text
        style={{
          color: darkMode ? "white" : "black",
          fontSize: 22,
          fontWeight: "bold",
          marginBottom: 16,
        }}
      >
        {darkMode ? "Dark Mode 🌙" : "Light Mode ☀️"}
      </Text>

      <Button
        title="Toggle Theme"
        onPress={() => setDarkMode(!darkMode)}
      />
    </View>
  );
}

