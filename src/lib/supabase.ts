import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// CODELAB 2: Cloud Bridge & Custom Storage Adapter
// Mengaitkan Supabase Client dengan Expo SecureStore (Hardware Keystore/Keychain)
// ============================================================================

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    return SecureStore.deleteItemAsync(key);
  },
};

const rawUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://xxxxxxxxxxxxxx.supabase.co';
// Sanitasi otomatis: hilangkan /rest/v1 dan trailing slash agar tidak terjadi "invalid path specified in request URI"
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey = (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_token').trim();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
