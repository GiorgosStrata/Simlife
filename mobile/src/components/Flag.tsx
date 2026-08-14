import { StyleSheet, Text, View } from 'react-native'
import { SvgXml } from 'react-native-svg'
import * as FLAGS from 'country-flag-icons/string/3x2'
import { getCountry } from '../data/countries'
import { colors } from '../theme'

const FLAG_SVGS = FLAGS as Record<string, string>

interface FlagProps {
  /** ISO2 country code. */
  code: string
  /** Rendered width in px; height is width * 2/3 (fixed 3:2 aspect). */
  width?: number
}

/**
 * Renders a country's flag as an SVG at a fixed 3:2 aspect ratio, so
 * every flag is the same size and shape (unlike emoji flags, which
 * don't render on Android/web). Falls back to the emoji if missing.
 */
export function Flag({ code, width = 28 }: FlagProps) {
  const height = Math.round((width * 2) / 3)
  const xml = FLAG_SVGS[code]
  if (!xml) {
    return <Text style={{ fontSize: width * 0.8 }}>{getCountry(code)?.flag ?? '🏳️'}</Text>
  }
  return (
    <View style={[styles.frame, { width, height }]}>
      <SvgXml xml={xml} width={width} height={height} />
    </View>
  )
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.slate200,
  },
})
