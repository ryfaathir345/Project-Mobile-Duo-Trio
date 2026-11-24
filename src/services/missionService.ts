import { supabase } from '../lib/supabase';

// ============================================================================
// CODELAB 5: Papan Misi Taktis & Cloud Database CRUD (PostgreSQL Supabase)
// Menggunakan Row Level Security (RLS) untuk isolasi data antar pengguna
// ============================================================================

export interface Mission {
  id: string;
  user_id: string;
  title: string;
  reward_points: number;
  status: 'pending' | 'completed';
  created_at: string;
}

// 1. SELECT: Ambil semua misi untuk user yang sedang aktif
// PostgreSQL RLS otomatis menyaring hanya baris milik auth.uid()
export async function fetchMissions(): Promise<Mission[]> {
  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch missions:', error.message);
    throw error;
  }
  return (data as Mission[]) || [];
}

// 2. INSERT: Buat misi baru yang terikat ke ID pengguna
export async function createMission(
  title: string,
  rewardPoints: number = 100,
  userId?: string
): Promise<Mission> {
  const payload: any = {
    title: title.trim(),
    reward_points: rewardPoints,
    status: 'pending',
  };

  if (userId) {
    payload.user_id = userId;
  }

  const { data, error } = await supabase
    .from('missions')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('Failed to create mission:', error.message);
    throw error;
  }
  return data as Mission;
}

// 3. UPDATE: Perbarui status misi ('pending' <-> 'completed')
export async function toggleMissionStatus(
  missionId: string,
  currentStatus: 'pending' | 'completed'
): Promise<Mission> {
  const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';

  const { data, error } = await supabase
    .from('missions')
    .update({ status: newStatus })
    .eq('id', missionId)
    .select()
    .single();

  if (error) {
    console.error('Failed to toggle mission status:', error.message);
    throw error;
  }
  return data as Mission;
}

// 4. DELETE: Hapus misi dari database cloud
export async function deleteMission(missionId: string): Promise<void> {
  const { error } = await supabase
    .from('missions')
    .delete()
    .eq('id', missionId);

  if (error) {
    console.error('Failed to delete mission:', error.message);
    throw error;
  }
}

// ============================================================================
// INTEGRASI TEMA KAFE KODING: Cloud Order Storage
// Menyimpan riwayat pesanan Kafe Koding ke Supabase
// ============================================================================

export interface CloudOrder {
  id: string;
  user_id: string;
  items_summary: string;
  total_price: number;
  status: string;
  created_at: string;
}

export async function saveOrderToCloud(
  itemsSummary: string,
  totalPrice: number,
  userId?: string
) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          items_summary: itemsSummary,
          total_price: totalPrice,
          user_id: userId,
          status: 'diproses',
        },
      ])
      .select();

    if (error) {
      console.warn('Note: Cloud order insert failed (check if orders table exists):', error.message);
    }
    return { data, error };
  } catch (err) {
    console.warn('Cloud order error:', err);
    return { data: null, error: err };
  }
}
