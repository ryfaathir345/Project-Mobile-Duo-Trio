import React, { useCallback, useEffect, useState } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CoffeeTheme } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import {
  createMission,
  deleteMission,
  fetchMissions,
  Mission,
  toggleMissionStatus,
} from '@/services/missionService';

// ============================================================================
// Layar Tugas & Pesanan Cloud (Supabase PostgreSQL CRUD + Row Level Security)
// Menampilkan daftar data tersimpan per akun pengguna
// ============================================================================

export default function MissionsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const [missions, setMissions] = useState<Mission[]>([]);
  const [newTitle, setNewTitle] = useState<string>('');
  const [rewardPoints, setRewardPoints] = useState<string>('100');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const displayName =
    (user?.user_metadata as any)?.callsign ||
    user?.email?.split('@')[0] ||
    'Pelanggan';

  const loadMissions = useCallback(async () => {
    try {
      const data = await fetchMissions();
      setMissions(data);
    } catch (error: any) {
      console.warn('Gagal memuat tugas/pesanan:', error.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadMissions();
  }, [loadMissions]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    void loadMissions();
  }, [loadMissions]);

  // Handle penambahan tugas/pesanan dengan Optimistic UI
  const handleDispatchMission = async () => {
    const title = newTitle.trim();
    if (!title) {
      Alert.alert('Perhatian', 'Deskripsi tugas/pesanan tidak boleh kosong.');
      return;
    }

    const points = parseInt(rewardPoints, 10) || 100;
    setIsSubmitting(true);

    // Optimistic UI update
    const tempId = 'temp-' + Date.now();
    const optimisticMission: Mission = {
      id: tempId,
      user_id: user?.id || 'self',
      title,
      reward_points: points,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    setMissions((prev) => [optimisticMission, ...prev]);
    setNewTitle('');

    try {
      const created = await createMission(title, points, user?.id);
      setMissions((prev) =>
        prev.map((m) => (m.id === tempId ? created : m))
      );
    } catch (error: any) {
      setMissions((prev) => prev.filter((m) => m.id !== tempId));
      Alert.alert(
        'Gagal Menyimpan ke Cloud',
        `Pesan: ${error.message}\nPastikan tabel "missions" telah dibuat di Supabase SQL Editor.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const backup = [...missions];
    setMissions((prev) => prev.filter((m) => m.id !== id));

    try {
      await deleteMission(id);
    } catch (error: any) {
      setMissions(backup);
      Alert.alert('Gagal Menghapus', error.message);
    }
  };

  const handleToggle = async (mission: Mission) => {
    const originalStatus = mission.status;
    const nextStatus = originalStatus === 'pending' ? 'completed' : 'pending';

    setMissions((prev) =>
      prev.map((m) => (m.id === mission.id ? { ...m, status: nextStatus } : m))
    );

    try {
      await toggleMissionStatus(mission.id, originalStatus);
    } catch (error: any) {
      setMissions((prev) =>
        prev.map((m) =>
          m.id === mission.id ? { ...m, status: originalStatus } : m
        )
      );
      Alert.alert('Gagal Memperbarui', error.message);
    }
  };

  const handleSignOut = async () => {
    Alert.alert('Konfirmasi Keluar', 'Apakah Anda yakin ingin keluar dari akun?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login' as any);
        },
      },
    ]);
  };

  const renderMissionItem = ({ item }: { item: Mission }) => {
    const isCompleted = item.status === 'completed';
    return (
      <View style={styles.missionCard}>
        <TouchableOpacity
          style={[
            styles.statusBadge,
            isCompleted && styles.statusBadgeCompleted,
          ]}
          onPress={() => handleToggle(item)}
        >
          <Ionicons
            name={isCompleted ? 'checkmark-circle' : 'time-outline'}
            size={14}
            color={
              isCompleted
                ? CoffeeTheme.colors.successGreen
                : CoffeeTheme.colors.accentAmber
            }
          />
          <Text
            style={[
              styles.statusText,
              isCompleted && styles.statusTextCompleted,
            ]}
          >
            {isCompleted ? 'SELESAI' : 'ANTREAN'}
          </Text>
        </TouchableOpacity>

        <View style={styles.missionBody}>
          <Text
            style={[styles.missionTitle, isCompleted && styles.titleCompleted]}
            numberOfLines={2}
          >
            {item.title}
          </Text>
          <Text style={styles.xpText}>{item.reward_points} Poin Reward</Text>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons
            name="trash-outline"
            size={16}
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
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          {/* Top Header Card */}
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

          {/* Form Tambah Tugas / Pesanan Cloud */}
          <View style={styles.dispatchSection}>
            <Text style={styles.sectionTitle}>CATATAN PESANAN ATAU TUGAS BARU</Text>
            <TextInput
              style={styles.inputTitle}
              placeholder="Tuliskan catatan pesanan atau tugas..."
              placeholderTextColor={CoffeeTheme.colors.textMuted}
              value={newTitle}
              onChangeText={setNewTitle}
              editable={!isSubmitting}
            />
            <View style={styles.dispatchRow}>
              <TextInput
                style={styles.inputXp}
                placeholder="100"
                placeholderTextColor={CoffeeTheme.colors.textMuted}
                keyboardType="number-pad"
                value={rewardPoints}
                onChangeText={setRewardPoints}
                editable={!isSubmitting}
              />
              <TouchableOpacity
                style={[
                  styles.dispatchBtn,
                  isSubmitting && styles.dispatchBtnDisabled,
                ]}
                onPress={handleDispatchMission}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.dispatchBtnText}>Simpan ke Cloud</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* List Tugas / Pesanan */}
          <View style={styles.listSection}>
            <View style={styles.listHeaderRow}>
              <Text style={styles.sectionTitle}>DAFTAR PESANAN & TUGAS AKTIF</Text>
              <Text style={styles.queueCount}>{missions.length} DATA</Text>
            </View>

            {isLoading ? (
              <View style={styles.centerLoading}>
                <ActivityIndicator
                  size="large"
                  color={CoffeeTheme.colors.brand}
                />
                <Text style={styles.loadingText}>Memuat catatan dari cloud...</Text>
              </View>
            ) : (
              <FlatList
                data={missions}
                keyExtractor={(item) => item.id}
                renderItem={renderMissionItem}
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
                      name="receipt-outline"
                      size={40}
                      color={CoffeeTheme.colors.textMuted}
                    />
                    <Text style={styles.emptyTitle}>Belum Ada Catatan</Text>
                    <Text style={styles.emptySubtitle}>
                      Semua pesanan dan tugas yang tersimpan di cloud akan tampil di sini.
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
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    maxWidth: CoffeeTheme.layout.maxDetailWidth,
  },
  headerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: CoffeeTheme.colors.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderColor: CoffeeTheme.colors.border,
  },
  userInfo: {
    flex: 1,
  },
  statusDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  callsignText: {
    color: CoffeeTheme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  emailText: {
    color: CoffeeTheme.colors.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: '600',
  },
  dispatchSection: {
    backgroundColor: CoffeeTheme.colors.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderColor: CoffeeTheme.colors.border,
  },
  sectionTitle: {
    color: CoffeeTheme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  inputTitle: {
    backgroundColor: CoffeeTheme.colors.surfaceSubtle,
    borderRadius: CoffeeTheme.radii.md,
    borderWidth: 1,
    borderColor: CoffeeTheme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: CoffeeTheme.colors.textPrimary,
    fontSize: 13,
    marginBottom: 8,
    outlineStyle: 'none' as any,
  },
  dispatchRow: {
    flexDirection: 'row',
    gap: 8,
  },
  inputXp: {
    backgroundColor: CoffeeTheme.colors.surfaceSubtle,
    borderRadius: CoffeeTheme.radii.md,
    borderWidth: 1,
    borderColor: CoffeeTheme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: CoffeeTheme.colors.textPrimary,
    fontSize: 13,
    width: 70,
    textAlign: 'center',
    outlineStyle: 'none' as any,
  },
  dispatchBtn: {
    flex: 1,
    backgroundColor: CoffeeTheme.colors.brand,
    borderRadius: CoffeeTheme.radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 9,
  },
  dispatchBtnDisabled: {
    opacity: 0.6,
  },
  dispatchBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  listSection: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  queueCount: {
    color: CoffeeTheme.colors.brandSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 40,
  },
  missionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CoffeeTheme.colors.surface,
    borderRadius: CoffeeTheme.radii.md,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: CoffeeTheme.colors.border,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: CoffeeTheme.colors.accentAmberBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: CoffeeTheme.radii.sm,
    marginRight: 10,
  },
  statusBadgeCompleted: {
    backgroundColor: CoffeeTheme.colors.successGreenBg,
  },
  statusText: {
    color: CoffeeTheme.colors.accentAmber,
    fontSize: 10,
    fontWeight: '700',
  },
  statusTextCompleted: {
    color: CoffeeTheme.colors.successGreen,
  },
  missionBody: {
    flex: 1,
  },
  missionTitle: {
    color: CoffeeTheme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: CoffeeTheme.colors.textMuted,
  },
  xpText: {
    color: CoffeeTheme.colors.brandSecondary,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  deleteButton: {
    padding: 6,
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: CoffeeTheme.colors.textSecondary,
    fontSize: 12,
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  emptyTitle: {
    color: CoffeeTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
  },
  emptySubtitle: {
    color: CoffeeTheme.colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 280,
  },
});
