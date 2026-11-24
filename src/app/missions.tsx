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

  const displayName = (user?.user_metadata as any)?.callsign || user?.email?.split('@')[0] || 'Pengguna';

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
      // Ganti objek optimistik dengan data asli dari database
      setMissions((prev) =>
        prev.map((m) => (m.id === tempId ? created : m))
      );
    } catch (error: any) {
      // Rollback jika terjadi error
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
    // Optimistic delete
    setMissions((prev) => prev.filter((m) => m.id !== id));

    try {
      await deleteMission(id);
    } catch (error: any) {
      // Rollback
      setMissions(backup);
      Alert.alert('Gagal Menghapus', error.message);
    }
  };

  const handleToggle = async (mission: Mission) => {
    const originalStatus = mission.status;
    const nextStatus = originalStatus === 'pending' ? 'completed' : 'pending';

    // Optimistic update
    setMissions((prev) =>
      prev.map((m) => (m.id === mission.id ? { ...m, status: nextStatus } : m))
    );

    try {
      await toggleMissionStatus(mission.id, originalStatus);
    } catch (error: any) {
      // Rollback
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
            color={isCompleted ? '#10b981' : '#f59e0b'}
          />
          <Text
            style={[
              styles.statusText,
              isCompleted && styles.statusTextCompleted,
            ]}
          >
            {isCompleted ? 'SELESAI' : 'PROSES'}
          </Text>
        </TouchableOpacity>

        <View style={styles.missionBody}>
          <Text
            style={[styles.missionTitle, isCompleted && styles.titleCompleted]}
            numberOfLines={2}
          >
            {item.title}
          </Text>
          <Text style={styles.xpText}>{item.reward_points} Poin</Text>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="close" size={18} color="#64748b" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* Top Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.userInfo}>
          <View style={styles.statusDotRow}>
            <View style={styles.greenDot} />
            <Text style={styles.statusDotText}>DATABASE CLOUD : TERHUBUNG</Text>
          </View>
          <Text style={styles.callsignText}>{displayName}</Text>
          <Text style={styles.emailText}>{user?.email}</Text>
          <Text style={styles.uidText} numberOfLines={1}>
            UID: {user?.id}
          </Text>
        </View>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={16} color="#ef4444" />
          <Text style={styles.signOutText}>Keluar</Text>
        </TouchableOpacity>
      </View>

      {/* Form Tambah Tugas / Pesanan Cloud */}
      <View style={styles.dispatchSection}>
        <Text style={styles.sectionTitle}>TAMBAH TUGAS / CATATAN PESANAN</Text>
        <TextInput
          style={styles.inputTitle}
          placeholder="Nama tugas atau catatan pesanan..."
          placeholderTextColor="#64748b"
          value={newTitle}
          onChangeText={setNewTitle}
          editable={!isSubmitting}
        />
        <View style={styles.dispatchRow}>
          <TextInput
            style={styles.inputXp}
            placeholder="100"
            placeholderTextColor="#64748b"
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
              <ActivityIndicator color="#0f172a" size="small" />
            ) : (
              <Text style={styles.dispatchBtnText}>Tambah</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* List Tugas / Pesanan */}
      <View style={styles.listSection}>
        <View style={styles.listHeaderRow}>
          <Text style={styles.sectionTitle}>DAFTAR TUGAS & PESANAN CLOUD</Text>
          <Text style={styles.queueCount}>{missions.length} TERCATAT</Text>
        </View>

        {isLoading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color="#38bdf8" />
            <Text style={styles.loadingText}>Memuat data dari cloud...</Text>
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
                tintColor="#38bdf8"
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="clipboard-outline" size={48} color="#334155" />
                <Text style={styles.emptyTitle}>Belum Ada Tugas atau Pesanan</Text>
                <Text style={styles.emptySubtitle}>
                  Tambahkan tugas atau pesanan baru melalui form di atas.
                </Text>
              </View>
            }
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1d',
  },
  headerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#1f2937',
  },
  userInfo: {
    flex: 1,
    marginRight: 12,
  },
  statusDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  statusDotText: {
    color: '#9ca3af',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  callsignText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f9fafb',
  },
  emailText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  uidText: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  signOutText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '700',
  },
  dispatchSection: {
    padding: 16,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderColor: '#1f2937',
  },
  sectionTitle: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  inputTitle: {
    backgroundColor: '#1f2937',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#f9fafb',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#374151',
  },
  dispatchRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  inputXp: {
    width: 80,
    backgroundColor: '#1f2937',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#f9fafb',
    fontSize: 14,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  dispatchBtn: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dispatchBtnDisabled: {
    opacity: 0.6,
  },
  dispatchBtnText: {
    color: '#0f172a',
    fontWeight: '800',
    fontSize: 13,
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
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 40,
  },
  missionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 10,
  },
  statusBadgeCompleted: {
    backgroundColor: '#064e3b',
  },
  statusText: {
    color: '#f59e0b',
    fontSize: 10,
    fontWeight: '800',
  },
  statusTextCompleted: {
    color: '#10b981',
  },
  missionBody: {
    flex: 1,
  },
  missionTitle: {
    color: '#f9fafb',
    fontSize: 13,
    fontWeight: '600',
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#64748b',
  },
  xpText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
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
    color: '#64748b',
    fontSize: 12,
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    color: '#94a3af',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 10,
  },
  emptySubtitle: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});
