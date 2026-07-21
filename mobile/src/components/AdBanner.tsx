import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../theme'

/**
 * A fixed banner ad slot shown during play. On this (web) build it renders a
 * house-ad placeholder so the layout reserves the space and reads like the
 * shipped app. For the native iOS/Android builds this is where the AdMob
 * banner mounts — see docs/ADS_AND_AUTH.md:
 *
 *   import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads'
 *   <BannerAd unitId={UNIT} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
 *
 * Keep the 50px height so gameplay layout doesn't shift when real ads load.
 */
export function AdBanner() {
  return (
    <View style={styles.slot} accessibilityLabel="Advertisement">
      <View style={styles.badge}>
        <Text style={styles.badgeText}>AD</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          🌱 Enjoying Simlife?
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          Your ad could be here — go ad-free with Premium.
        </Text>
      </View>
    </View>
  )
}

export const AD_BANNER_HEIGHT = 52

const styles = StyleSheet.create({
  slot: {
    height: AD_BANNER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.slate200,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  badge: {
    backgroundColor: colors.amber400,
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: { fontSize: 10, fontWeight: '900', color: '#3a2a00', letterSpacing: 0.5 },
  body: { flex: 1 },
  title: { fontSize: 13, fontWeight: '800', color: colors.slate800 },
  sub: { fontSize: 11, color: colors.slate500, marginTop: 1 },
})
