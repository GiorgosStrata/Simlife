import { Platform } from 'react-native'
import { themeCss, type ThemeName } from './theme'

let injected = false

/**
 * Apply the chosen theme on web by injecting the CSS-variable definitions
 * once and flipping `data-theme` on the document root. No-op on native.
 */
export function applyTheme(name: ThemeName): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return
  if (!injected) {
    const style = document.createElement('style')
    style.id = 'simlife-theme'
    style.textContent = themeCss()
    document.head.appendChild(style)
    // Browsers reject audio play() before the first gesture (e.g. a death
    // sound on a freshly-loaded dead save). Swallow only that so it never
    // surfaces as an unhandled error.
    window.addEventListener('unhandledrejection', (e) => {
      const msg = String((e as PromiseRejectionEvent).reason ?? '')
      if (/play\(\)|NotAllowedError|user (didn.t interact|gesture)/i.test(msg)) {
        e.preventDefault()
      }
    })
    injected = true
  }
  document.documentElement.dataset.theme = name
}
