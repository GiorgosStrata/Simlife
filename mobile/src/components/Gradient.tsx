import { useRef } from 'react'
import { StyleSheet } from 'react-native'
import Svg, { Defs, LinearGradient as SvgGradient, Rect, Stop } from 'react-native-svg'

let idCounter = 0

interface GradientFillProps {
  /** Literal hex colors (not theme vars — SVG stops can't resolve CSS vars). */
  from: string
  to: string
  /** Diagonal by default; set horizontal for a left→right sweep. */
  horizontal?: boolean
}

/**
 * An absolutely-positioned gradient background. Drop it as the first child of
 * a container with `overflow: 'hidden'` and rounded corners to give buttons and
 * cards a rich two-tone fill on both web and native.
 */
export function GradientFill({ from, to, horizontal }: GradientFillProps) {
  const id = useRef(`grad-${idCounter++}`).current
  return (
    <Svg
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      <Defs>
        <SvgGradient id={id} x1="0" y1="0" x2={horizontal ? '1' : '1'} y2={horizontal ? '0' : '1'}>
          <Stop offset="0" stopColor={from} />
          <Stop offset="1" stopColor={to} />
        </SvgGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  )
}

/** Shared brand gradients. */
export const GRADIENTS = {
  primary: ['#6366f1', '#a855f7'] as const, // indigo → violet
  gold: ['#f59e0b', '#f43f5e'] as const, // amber → rose
  ocean: ['#0ea5e9', '#22d3ee'] as const, // sky → cyan
  mint: ['#10b981', '#22d3ee'] as const, // emerald → cyan
}
