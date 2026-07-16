import { Platform } from 'react-native'

/**
 * Theming. The palette keys are named after their light-mode Tailwind
 * colours but are used semantically (slate100 = app background, white =
 * card, slate800 = primary text, …). Dark mode remaps the neutral keys
 * and keeps the brand/stat colours.
 *
 * On web, every colour is emitted as a CSS variable (`var(--c-key)`) so
 * flipping `data-theme` on the root re-themes the whole app instantly
 * without re-rendering. On native we fall back to the light hex values
 * (a live native toggle would need a bigger refactor).
 */

export const LIGHT = {
  cyan900: '#164e63',
  cyan600: '#0891b2',
  cyan500: '#06b6d4',
  cyan400: '#22d3ee',
  cyan100: '#cffafe',
  cyan50: '#ecfeff',
  slate100: '#f1f5f9',
  slate200: '#e2e8f0',
  slate400: '#94a3b8',
  slate500: '#64748b',
  slate600: '#475569',
  slate800: '#1e293b',
  rose500: '#f43f5e',
  rose700: '#be123c',
  amber400: '#fbbf24',
  sky500: '#0ea5e9',
  violet500: '#8b5cf6',
  emerald50: '#ecfdf5',
  emerald700: '#047857',
  indigo700: '#4338ca',
  pink600: '#db2777',
  sky600: '#0284c7',
  white: '#ffffff',
  /** Text/icons that sit on a coloured surface — stays light in both themes. */
  onColor: '#ffffff',
  backdrop: 'rgba(15, 23, 42, 0.65)',
}

export type ThemeColors = typeof LIGHT
export type ThemeName = 'light' | 'dark'

/** Dark palette: neutrals inverted, brand/stat colours kept (brightened a touch). */
export const DARK: ThemeColors = {
  cyan900: '#a5f3fc', // was dark text-on-tint → now light text-on-tint
  cyan600: '#0e7490',
  cyan500: '#22d3ee',
  cyan400: '#67e8f9',
  cyan100: '#155e75',
  cyan50: '#0e3a4a', // light tint backgrounds → dark cyan
  slate100: '#0f172a', // app background
  slate200: '#334155', // borders / tracks / subtle fills
  slate400: '#64748b',
  slate500: '#94a3b8', // muted text
  slate600: '#cbd5e1', // secondary text
  slate800: '#f1f5f9', // primary text
  rose500: '#fb7185',
  rose700: '#e11d48',
  amber400: '#fbbf24',
  sky500: '#38bdf8',
  violet500: '#a78bfa',
  emerald50: '#064e3b', // money badge background
  emerald700: '#6ee7b7', // money badge text
  indigo700: '#818cf8',
  pink600: '#ec4899',
  sky600: '#38bdf8',
  white: '#1e293b', // card background
  onColor: '#f8fafc', // text on coloured surfaces stays light
  backdrop: 'rgba(0, 0, 0, 0.7)',
}

export const THEMES: Record<ThemeName, ThemeColors> = { light: LIGHT, dark: DARK }
const KEYS = Object.keys(LIGHT) as (keyof ThemeColors)[]

/**
 * The palette every component imports. On web these are CSS variables so
 * theme switching is instant; on native they're the light hex values.
 */
export const colors: ThemeColors =
  Platform.OS === 'web'
    ? (Object.fromEntries(KEYS.map((k) => [k, `var(--c-${k})`])) as ThemeColors)
    : LIGHT

/** CSS declaring both themes' variables; injected once into the web page. */
export function themeCss(): string {
  const decls = (theme: ThemeColors) =>
    KEYS.map((k) => `--c-${k}:${theme[k]};`).join('')
  return (
    `:root{${decls(LIGHT)}}` +
    `:root[data-theme="dark"]{${decls(DARK)}}` +
    `html,body{background:var(--c-slate100);}`
  )
}
