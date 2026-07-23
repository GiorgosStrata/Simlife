import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { Platform } from 'react-native'

/**
 * The Supabase client — our real backend for accounts (and, later, cloud
 * saves). Auth, sessions, email confirmation and password resets are all
 * handled server-side by Supabase; the app only ever holds a session token.
 *
 * The URL and publishable ("anon") key below are *public by design* — they
 * ship in every client and are safe to commit. Data is protected by Row Level
 * Security in the database, never by hiding this key. The SECRET (service_role)
 * key must never appear in this app. Values can be overridden per-environment
 * with EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY.
 */
const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://vjyfsozpjpkmynfdalsn.supabase.co'
const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  'sb_publishable_mmrmoAVu_ouMJqWwQ5ZXgQ_XYch_zt7'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Sessions persist in local storage (localStorage on web, AsyncStorage on
    // native) so a login survives a reload / app restart.
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // On web, read the token back from the URL after an email-confirmation /
    // password-reset redirect. Native apps use deep links instead.
    detectSessionInUrl: Platform.OS === 'web',
  },
})
