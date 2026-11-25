import { supabase } from "../lib/supabase";

// ============================================================================
// CODELAB 5: Papan Misi Taktis & Cloud Database CRUD (PostgreSQL Supabase)
// Menggunakan Row Level Security (RLS) untuk isolasi data antar pengguna
// ============================================================================

export interface Feedbacks {
  id: string;
  message: string;
  created_at: string;
}

// 1. SELECT: Ambil semua misi untuk user yang sedang aktif
// PostgreSQL RLS otomatis menyaring hanya baris milik auth.uid()
export async function fetchFeedbacks(): Promise<Feedbacks[]> {
  const { data, error } = await supabase
    .from("feedbacks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch missions:", error.message);
    throw error;
  }
  return (data as Feedbacks[]) || [];
}

// 2. INSERT: Buat misi baru yang terikat ke ID pengguna
export async function createdfeedback(message: string): Promise<Feedbacks> {
  const payload: any = {
    message: message.trim(),
  };

  const { data, error } = await supabase
    .from("feedbacks")
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("Failed to create mission:", error.message);
    throw error;
  }
  return data as Feedbacks;
}

export async function deleteFeedback(id: string): Promise<void> {
  const { error } = await supabase.from("feedbacks").delete().eq("id", id);
  if (error) {
    console.error("Failed to delete feedback:", error.message);
    throw error;
  }
}

export async function saveOrderToCloud(message: string) {
  try {
    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          message: message,
        },
      ])
      .select();

    if (error) {
      console.warn(
        "Note: Cloud order insert failed (check if orders table exists):",
        error.message,
      );
    }
    return { data, error };
  } catch (err) {
    console.warn("Cloud feedbacks:", err);
    return { data: null, error: err };
  }
}
