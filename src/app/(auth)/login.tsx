import { useAuth } from "@/context/AuthContext";
import { CoffeeTheme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ============================================================================
// Autentikasi Pengguna: Sign In & Sign Up dengan Supabase Auth + SecureStore
// ============================================================================

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();

  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [callsign, setCallsign] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAuth = async () => {
    setErrorMessage(null);

    // 1. Validasi Input Dasar & Sanitasi (.trim())
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    const cleanCallsign = callsign.trim();

    if (!cleanEmail) {
      setErrorMessage("Alamat email wajib diisi.");
      return;
    }
    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setErrorMessage("Format email tidak valid (contoh: user@email.com).");
      return;
    }
    if (cleanPassword.length < 6) {
      setErrorMessage("Kata sandi minimal 6 karakter.");
      return;
    }
    if (isRegistering && !cleanCallsign) {
      setErrorMessage("Nama lengkap atau panggilan wajib diisi.");
      return;
    }

    setIsLoading(true);

    try {
      if (isRegistering) {
        // Mode 1: Registrasi Akun Baru (Custom Metadata: callsign & role)
        const result = await signUp(cleanEmail, cleanPassword, cleanCallsign, 'hero');
        if (result.error) {
          const rawMsg = result.error.message || "";
          if (rawMsg.toLowerCase().includes("already registered")) {
            setErrorMessage("Alamat email sudah terdaftar. Silakan masuk atau gunakan email lain.");
          } else if (rawMsg.toLowerCase().includes("password")) {
            setErrorMessage("Kata sandi tidak valid. Pastikan minimal 6 karakter.");
          } else {
            setErrorMessage(rawMsg || "Gagal mendaftarkan akun baru.");
          }
        } else {
          Alert.alert(
            "Pendaftaran Berhasil",
            "Akun Anda berhasil dibuat. Silakan masuk dengan email dan kata sandi Anda.",
            [{ text: "OK", onPress: () => setIsRegistering(false) }],
          );
        }
      } else {
        // Mode 2: Masuk / Sign In Akun Terdaftar
        const result = await signIn(cleanEmail, cleanPassword);
        if (result.error) {
          const rawMsg = result.error.message || "";
          if (rawMsg.includes("Invalid login credentials")) {
            setErrorMessage("Email atau kata sandi tidak sesuai.");
          } else if (rawMsg.includes("Email not confirmed")) {
            setErrorMessage("Email belum dikonfirmasi di Supabase Dashboard.");
          } else {
            setErrorMessage(rawMsg || "Gagal masuk. Periksa koneksi internet Anda.");
          }
        } else {
          router.replace("/");
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan sistem autentikasi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.authBoxWrapper}>
          <View style={styles.authBox}>
            {/* Logo / Badge Alami Kafe Koding */}
            <View style={styles.badgeRow}>
              <Ionicons
                name="cafe-outline"
                size={16}
                color={CoffeeTheme.colors.brandSecondary}
              />
              <Text style={styles.badgeText}>KAFE KODING</Text>
            </View>

            <Text style={styles.mainTitle}>
              {isRegistering ? "Daftar Akun" : "Selamat Datang"}
            </Text>
            <Text style={styles.subTitle}>
              {isRegistering
                ? "Daftarkan identitas Anda untuk menikmati sajian"
                : "Masuk untuk menikmati aroma kopi dan sajian spesial"}
            </Text>

            {/* Banner Error jika autentikasi gagal */}
            {errorMessage && (
              <View style={styles.errorBanner}>
                <Ionicons
                  name="alert-circle-outline"
                  size={16}
                  color={CoffeeTheme.colors.spicyRed}
                />
                <Text style={styles.errorBannerText}>{errorMessage}</Text>
              </View>
            )}

            {/* Input Nama (Hanya saat registrasi) */}
            {isRegistering && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>NAMA LENGKAP</Text>
                <View style={styles.inputFieldWrapper}>
                  <Ionicons
                    name="person-outline"
                    size={16}
                    color={CoffeeTheme.colors.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Contoh: Budi Santoso"
                    placeholderTextColor={CoffeeTheme.colors.textMuted}
                    value={callsign}
                    onChangeText={setCallsign}
                    autoCapitalize="words"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                </View>
              </View>
            )}

            {/* Input Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>EMAIL</Text>
              <View style={styles.inputFieldWrapper}>
                <Ionicons
                  name="mail-outline"
                  size={16}
                  color={CoffeeTheme.colors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="nama@email.com"
                  placeholderTextColor={CoffeeTheme.colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Input Kata Sandi */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>KATA SANDI</Text>
              <View style={styles.inputFieldWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={16}
                  color={CoffeeTheme.colors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Minimal 6 karakter..."
                  placeholderTextColor={CoffeeTheme.colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Tombol Eksekusi Autentikasi */}
            <TouchableOpacity
              style={[
                styles.actionButton,
                isLoading && styles.actionButtonDisabled,
              ]}
              onPress={handleAuth}
              disabled={isLoading}
              activeOpacity={0.88}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.actionButtonText}>
                  {isRegistering ? "Daftar Akun Baru" : "Masuk ke Kafe"}
                </Text>
              )}
            </TouchableOpacity>

            {/* Switch Mode Login / Register */}
            <TouchableOpacity
              style={styles.toggleModeButton}
              onPress={() => {
                setIsRegistering(!isRegistering);
                setErrorMessage(null);
              }}
              disabled={isLoading}
            >
              <Text style={styles.toggleModeText}>
                {isRegistering ? (
                  <>
                    Sudah memiliki akun?{" "}
                    <Text style={styles.linkText}>Masuk di sini</Text>
                  </>
                ) : (
                  <>
                    Belum memiliki akun?{" "}
                    <Text style={styles.linkText}>Daftar di sini</Text>
                  </>
                )}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: CoffeeTheme.colors.canvas,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    alignItems: "center",
  },
  authBoxWrapper: {
    width: "100%",
    maxWidth: CoffeeTheme.layout.maxFormWidth,
  },
  authBox: {
    backgroundColor: CoffeeTheme.colors.surface,
    borderRadius: CoffeeTheme.radii.lg,
    padding: 24,
    borderWidth: 1,
    borderColor: CoffeeTheme.colors.border,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "center",
    backgroundColor: CoffeeTheme.colors.surfaceSubtle,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: CoffeeTheme.radii.full,
    borderWidth: 1,
    borderColor: CoffeeTheme.colors.border,
    marginBottom: 14,
  },
  badgeText: {
    color: CoffeeTheme.colors.brandSecondary,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: CoffeeTheme.colors.textPrimary,
    textAlign: "center",
  },
  subTitle: {
    fontSize: 12,
    color: CoffeeTheme.colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 20,
    lineHeight: 18,
  },
  errorBanner: {
    backgroundColor: CoffeeTheme.colors.spicyRedBg,
    borderColor: CoffeeTheme.colors.spicyRedBorder,
    borderWidth: 1,
    borderRadius: CoffeeTheme.radii.md,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  errorBannerText: {
    color: CoffeeTheme.colors.spicyRed,
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    color: CoffeeTheme.colors.textSecondary,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  inputFieldWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CoffeeTheme.colors.surfaceSubtle,
    borderRadius: CoffeeTheme.radii.md,
    borderWidth: 1,
    borderColor: CoffeeTheme.colors.border,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    paddingVertical: 10,
    color: CoffeeTheme.colors.textPrimary,
    fontSize: 13,
    outlineStyle: "none" as any,
  },
  actionButton: {
    backgroundColor: CoffeeTheme.colors.brand,
    borderRadius: CoffeeTheme.radii.md,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  toggleModeButton: {
    marginTop: 16,
    alignItems: "center",
  },
  toggleModeText: {
    color: CoffeeTheme.colors.textSecondary,
    fontSize: 12,
  },
  linkText: {
    color: CoffeeTheme.colors.brandSecondary,
    fontWeight: "700",
  },
});
