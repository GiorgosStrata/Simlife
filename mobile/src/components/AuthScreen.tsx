import { useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { playSfx } from '../audio/sfx'
import { useAuthStore } from '../store/authStore'
import { colors } from '../theme'
import { GRADIENTS, GradientFill } from './Gradient'

type Mode = 'login' | 'signup'

/** Sign-up / log-in gate shown before the game. */
export function AuthScreen() {
  const signUp = useAuthStore((s) => s.signUp)
  const logIn = useAuthStore((s) => s.logIn)

  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submit = () => {
    playSfx('click')
    const result =
      mode === 'signup' ? signUp(name, email, password) : logIn(email, password)
    if (!result.ok) {
      setError(result.error ?? 'Something went wrong.')
      playSfx('fail')
      return
    }
    playSfx('success')
  }

  const switchMode = (m: Mode) => {
    setMode(m)
    setError(null)
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <GradientFill from={GRADIENTS.primary[0]} to="#0b0d17" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brand}>
          <Text style={styles.logo}>🌱</Text>
          <Text style={styles.title}>GitLife</Text>
          <Text style={styles.tagline}>A life, one year at a time.</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.tabs}>
            <Pressable
              accessibilityRole="button"
              onPress={() => switchMode('login')}
              style={[styles.tab, mode === 'login' && styles.tabActive]}
            >
              <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>
                Log in
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => switchMode('signup')}
              style={[styles.tab, mode === 'signup' && styles.tabActive]}
            >
              <Text style={[styles.tabText, mode === 'signup' && styles.tabTextActive]}>
                Sign up
              </Text>
            </Pressable>
          </View>

          {mode === 'signup' && (
            <View style={styles.field}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                value={name}
                onChangeText={(t) => {
                  setName(t)
                  setError(null)
                }}
                placeholder="Your name"
                placeholderTextColor={colors.slate400}
                style={styles.input}
                testID="auth-name"
              />
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={(t) => {
                setEmail(t)
                setError(null)
              }}
              placeholder="you@example.com"
              placeholderTextColor={colors.slate400}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
              testID="auth-email"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={(t) => {
                setPassword(t)
                setError(null)
              }}
              placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
              placeholderTextColor={colors.slate400}
              secureTextEntry
              style={styles.input}
              testID="auth-password"
            />
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <Pressable
            accessibilityRole="button"
            onPress={submit}
            style={({ pressed }) => [styles.submit, pressed && styles.submitPressed]}
          >
            <Text style={styles.submitText}>
              {mode === 'signup' ? 'Create account' : 'Log in'}
            </Text>
          </Pressable>

          <Text style={styles.switchLine}>
            {mode === 'signup' ? 'Already have an account? ' : 'New here? '}
            <Text
              style={styles.switchLink}
              onPress={() => switchMode(mode === 'signup' ? 'login' : 'signup')}
            >
              {mode === 'signup' ? 'Log in' : 'Create one'}
            </Text>
          </Text>
        </View>

        <Text style={styles.legal}>
          Accounts are stored on this device. By continuing you agree to play responsibly. 🎮
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 22,
  },
  brand: { alignItems: 'center', gap: 4 },
  logo: { fontSize: 52 },
  title: { fontSize: 34, fontWeight: '900', color: '#ffffff', letterSpacing: 0.5 },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.75)' },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 22,
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.slate100,
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  tab: { flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  tabActive: { backgroundColor: colors.white },
  tabText: { fontSize: 14, fontWeight: '700', color: colors.slate500 },
  tabTextActive: { color: colors.cyan600 },
  field: { gap: 6 },
  label: { fontSize: 12, fontWeight: '700', color: colors.slate500 },
  input: {
    borderWidth: 1,
    borderColor: colors.slate200,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.slate800,
    backgroundColor: colors.white,
  },
  error: { fontSize: 13, color: colors.rose500, fontWeight: '600' },
  submit: {
    backgroundColor: colors.cyan500,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  submitPressed: { opacity: 0.88 },
  submitText: { fontSize: 16, fontWeight: '800', color: colors.onColor },
  switchLine: { fontSize: 13, color: colors.slate500, textAlign: 'center' },
  switchLink: { color: colors.cyan600, fontWeight: '800' },
  legal: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 16,
  },
})
