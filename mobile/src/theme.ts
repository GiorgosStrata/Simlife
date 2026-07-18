import { Platform } from 'react-native'

/**
 * Theming. Palette keys are still named after Tailwind-ish colours but are
 * used semantically (slate100 = app background, white = card/panel, slate800
 * = primary text, cyan* = the brand accent, …). Changing a key's *value*
 * re-skins the whole app, since every component reads these.
 *
 * The design language is "Midnight Indigo": a sleek near-black indigo canvas
 * with raised panels, an indigo→violet accent and a warm gold secondary.
 * Dark is the default; a warm "Daylight" variant is the alternate.
 *
 * On web every colour is a CSS variable (`var(--c-key)`) so flipping
 * `data-theme` re-themes instantly. Native falls back to the DARK hexes.
 */

export const DARK = {
  cyan900: '#e0e1ff', // text sitting on an accent tint (kept light)
  cyan600: '#6366f1', // primary accent (indigo)
  cyan500: '#7c6ff8', // buttons / active accent (violet-indigo)
  cyan400: '#9a8cff', // pressed / hover
  cyan100: '#c7c9ff', // faint text on accent
  cyan50: '#20244a', // accent tint background
  slate100: '#0b0d17', // app background (near-black indigo)
  slate200: '#242a49', // borders, tracks, subtle fills
  slate400: '#6a7099',
  slate500: '#9299c2', // muted text
  slate600: '#c4c9ec', // secondary text
  slate800: '#f2f4fd', // primary text
  rose500: '#fb7185',
  rose700: '#fb7185',
  amber400: '#f6b94e', // warm gold secondary accent
  sky500: '#56b7f5',
  violet500: '#a78bfa',
  emerald50: '#12271e',
  emerald700: '#5ee08a',
  indigo700: '#a5b4fc',
  pink600: '#f472b6',
  sky600: '#56b7f5',
  white: '#151933', // raised panel / card
  onColor: '#ffffff', // text on a filled accent — stays light in both themes
  backdrop: 'rgba(4, 5, 14, 0.78)',
}

export type ThemeColors = typeof DARK
export type ThemeName = 'light' | 'dark'

/** Warm "Daylight" alternate: cream paper, indigo accent (never the old teal). */
export const LIGHT: ThemeColors = {
  cyan900: '#312a8f',
  cyan600: '#5b53e0',
  cyan500: '#6d5efc',
  cyan400: '#8b8cff',
  cyan100: '#e2e0fb',
  cyan50: '#efeefe',
  slate100: '#f4f2ec', // warm paper background
  slate200: '#e5e1d6',
  slate400: '#a49d8b',
  slate500: '#6f6a5b',
  slate600: '#494436',
  slate800: '#211f17',
  rose500: '#f43f5e',
  rose700: '#be123c',
  amber400: '#d99a2b',
  sky500: '#3b82f6',
  violet500: '#8b5cf6',
  emerald50: '#eafaf0',
  emerald700: '#0f9d58',
  indigo700: '#4f46e5',
  pink600: '#db2777',
  sky600: '#2563eb',
  white: '#fffdf8', // card
  onColor: '#ffffff',
  backdrop: 'rgba(20, 18, 12, 0.55)',
}

export const THEMES: Record<ThemeName, ThemeColors> = { light: LIGHT, dark: DARK }
const KEYS = Object.keys(DARK) as (keyof ThemeColors)[]

/**
 * The palette every component imports. On web these are CSS variables so
 * theme switching is instant; on native they're the DARK hex values.
 */
export const colors: ThemeColors =
  Platform.OS === 'web'
    ? (Object.fromEntries(KEYS.map((k) => [k, `var(--c-${k})`])) as ThemeColors)
    : DARK

/** CSS declaring both themes' variables + the app font; injected once on web. */
export function themeCss(): string {
  const decls = (theme: ThemeColors) => KEYS.map((k) => `--c-${k}:${theme[k]};`).join('')
  return (
    `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');` +
    `:root{${decls(DARK)}}` +
    `:root[data-theme="light"]{${decls(LIGHT)}}` +
    `html,body{background:var(--c-slate100);font-family:'Space Grotesk',system-ui,-apple-system,Segoe UI,sans-serif;}` +
    // react-native-web renders Text in spans/divs that inherit the body font.
    `*{font-family:inherit;}`
  )
}
