import { useAuth } from "@/context/AuthContext";
import { CoffeeTheme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  createdfeedback,
  deleteFeedback,
  Feedbacks,
  fetchFeedbacks,
} from "@/services/feedbackService";

export default function FeedbackScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const [feedbacks, setFeedbacks] = useState<Feedbacks[]>([]);
  const [newFeedback, setNewFeedback] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const displayName =
    (user?.user_metadata as any)?.callsign ||
    user?.email?.split("@")[0] ||
    "Pelanggan";

  const loadFeedbacks = useCallback(async () => {
    try {
      const data = await fetchFeedbacks();
      setFeedbacks(data);
    } catch (error: any) {
      console.warn("Gagal memuat data feedback:", error.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadFeedbacks();
  }, [loadFeedbacks]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    void loadFeedbacks();
  }, [loadFeedbacks]);

  const handleSendFeedback = async () => {
    const message = newFeedback.trim();
    if (!message) {
      Alert.alert("Perhatian", "Pesan ulasan atau masukan tidak boleh kosong.");
      return;
    }

    setIsSubmitting(true);

    const tempId = "temp-" + Date.now();
    const optimisticItem: Feedbacks = {
      id: tempId,
      message,
      created_at: new Date().toISOString(),
    };
    setFeedbacks((prev) => [optimisticItem, ...prev]);
    setNewFeedback("");

    try {
      const created = await createdfeedback(message);
      setFeedbacks((prev) => prev.map((f) => (f.id === tempId ? created : f)));
    } catch (error: any) {
      setFeedbacks((prev) => prev.filter((f) => f.id !== tempId));
      Alert.alert(
        "Gagal Menyimpan",
        `Pesan: ${error.message}\nPastikan tabel "feedbacks" telah dibuat di Supabase.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const backup = [...feedbacks];
    setFeedbacks((prev) => prev.filter((f) => f.id !== id));

    try {
      await deleteFeedback(id);
    } catch (error: any) {
      setFeedbacks(backup);
      Alert.alert("Gagal Menghapus", error.message);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      "Konfirmasi Keluar",
      "Apakah Anda yakin ingin keluar dari akun?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Keluar",
          style: "destructive",
          onPress: async () => {
            await signOut();
            router.replace("/(auth)/login" as any);
          },
        },
      ]
    );
  };

  const renderFeedbackItem = ({ item }: { item: Feedbacks }) => {
    return (
      <View style={styles.card}>
        <View style={styles.iconBadge}>
          <Ionicons
            name="chatbubble-outline"
            size={14}
            color={CoffeeTheme.colors.brandSecondary}
          />
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.cardMessage} numberOfLines={3}>
            {item.message}
          </Text>
          <Text style={styles.cardTimestamp}>
            {new Date(item.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons
            name="trash-outline"
            size={15}
            color={CoffeeTheme.colors.textMuted}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.screenWrapper}>
      <View style={styles.contentContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          {/* Header Card */}
          <View style={styles.headerCard}>
            <View style={styles.userInfo}>
              <View style={styles.statusDotRow}>
                <View style={styles.greenDot} />
                <Text style={styles.statusDotText}>DATABASE CLOUD TERKONEKSI</Text>
              </View>
              <Text style={styles.callsignText}>{displayName}</Text>
              <Text style={styles.emailText}>{user?.email}</Text>
            </View>

            <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
              <Ionicons
                name="log-out-outline"
                size={14}
                color={CoffeeTheme.colors.textSecondary}
              />
              <Text style={styles.signOutText}>Keluar</Text>
            </TouchableOpacity>
          </View>

          {/* Form Input Feedback */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>TULIS ULASAN ATAU MASUKAN</Text>
            <TextInput
              style={styles.inputMessage}
              placeholder="Ceritakan pengalaman Anda di Kafe Koding..."
              placeholderTextColor={CoffeeTheme.colors.textMuted}
              value={newFeedback}
              onChangeText={setNewFeedback}
              editable={!isSubmitting}
              multiline
              numberOfLines={2}
            />
            <TouchableOpacity
              style={[
                styles.submitBtn,
                isSubmitting && styles.submitBtnDisabled,
              ]}
              onPress={handleSendFeedback}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Ionicons name="send-outline" size={14} color="#ffffff" />
                  <Text style={styles.submitBtnText}>Kirim Ulasan</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* List Feedback */}
          <View style={styles.listSection}>
            <View style={styles.listHeaderRow}>
              <Text style={styles.sectionTitle}>DAFTAR ULASAN PELANGGAN</Text>
              <Text style={styles.countText}>{feedbacks.length} ULASAN</Text>
            </View>

            {isLoading ? (
              <View style={styles.centerLoading}>
                <ActivityIndicator
                  size="large"
                  color={CoffeeTheme.colors.brand}
                />
                <Text style={styles.loadingText}>Memuat ulasan dari cloud...</Text>
              </View>
            ) : (
              <FlatList
                data={feedbacks}
                keyExtractor={(item) => item.id}
                renderItem={renderFeedbackItem}
                contentContainerStyle={styles.listContent}
                refreshControl={
                  <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={onRefresh}
                    tintColor={CoffeeTheme.colors.brand}
                  />
                }
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Ionicons
                      name="chatbubble-ellipses-outline"
                      size={40}
                      color={CoffeeTheme.colors.textMuted}
                    />
                    <Text style={styles.emptyTitle}>Belum Ada Ulasan</Text>
                    <Text style={styles.emptySubtitle}>
                      Bagikan kesan Anda tentang rasa kopi, makanan, dan suasana Kafe Koding.
                    </Text>
                  </View>
                }
              />
            )}
          </View>
        </KeyboardAvoidingView>
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
  headerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: CoffeeTheme.colors.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderColor: CoffeeTheme.colors.border,
  },
  userInfo: {
    flex: 1,
  },
  statusDotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 2,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: CoffeeTheme.colors.successGreen,
  },
  statusDotText: {
    color: CoffeeTheme.colors.textSecondary,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  callsignText: {
    color: CoffeeTheme.colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  emailText: {
    color: CoffeeTheme.colors.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: CoffeeTheme.colors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: CoffeeTheme.radii.md,
    borderWidth: 1,
    borderColor: CoffeeTheme.colors.border,
  },
  signOutText: {
    color: CoffeeTheme.colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
  },
  inputSection: {
    backgroundColor: CoffeeTheme.colors.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderColor: CoffeeTheme.colors.border,
  },
  sectionTitle: {
    color: CoffeeTheme.colors.textSecondary,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  inputMessage: {
    backgroundColor: CoffeeTheme.colors.surfaceSubtle,
    borderRadius: CoffeeTheme.radii.md,
    borderWidth: 1,
    borderColor: CoffeeTheme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: CoffeeTheme.colors.textPrimary,
    fontSize: 13,
    marginBottom: 10,
    outlineStyle: "none" as any,
  },
  submitBtn: {
    flexDirection: "row",
    backgroundColor: CoffeeTheme.colors.brand,
    borderRadius: CoffeeTheme.radii.md,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 9,
    gap: 6,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  listSection: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  listHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  countText: {
    color: CoffeeTheme.colors.brandSecondary,
    fontSize: 11,
    fontWeight: "700",
  },
  listContent: {
    paddingBottom: 40,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CoffeeTheme.colors.surface,
    borderRadius: CoffeeTheme.radii.md,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: CoffeeTheme.colors.border,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: CoffeeTheme.radii.sm,
    backgroundColor: CoffeeTheme.colors.brandSubtle,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  cardBody: {
    flex: 1,
  },
  cardMessage: {
    color: CoffeeTheme.colors.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
  cardTimestamp: {
    color: CoffeeTheme.colors.textMuted,
    fontSize: 10,
    marginTop: 2,
    fontVariant: ["tabular-nums"],
  },
  deleteButton: {
    padding: 6,
  },
  centerLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: CoffeeTheme.colors.textSecondary,
    fontSize: 12,
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
  },
  emptyTitle: {
    color: CoffeeTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 8,
  },
  emptySubtitle: {
    color: CoffeeTheme.colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
    maxWidth: 280,
  },
});
