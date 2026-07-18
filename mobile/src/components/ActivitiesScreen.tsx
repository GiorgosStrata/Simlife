import { useState } from 'react'
import { ScrollView, StyleSheet, Text } from 'react-native'
import { playSfx } from '../audio/sfx'
import { getActivity } from '../data/activities'
import { getAsset, homeRent, resaleValue } from '../data/assets'
import { assetUpkeep } from '../data/economy'
import { STRINGS } from '../data/strings'
import { useGameStore } from '../store/gameStore'
import { colors } from '../theme'
import type { ActivityCategory } from '../types'
import { CrimeModal } from './CrimeModal'
import { HomeModal } from './HomeModal'
import { MindBodyModal } from './MindBodyModal'
import { PursuitModal } from './PursuitModal'
import { Row } from './Row'
import { StoreModal } from './StoreModal'

/** The "Lifestyle" hub: wellness, pursuits, crime, and your belongings/shop. */
export function ActivitiesScreen() {
  const pursuits = useGameStore((s) => s.pursuits)
  const ownedAssetIds = useGameStore((s) => s.ownedAssetIds)
  const homes = useGameStore((s) => s.homes)
  const residenceId = useGameStore((s) => s.residenceId)
  const sellAsset = useGameStore((s) => s.sellAsset)
  const [category, setCategory] = useState<ActivityCategory | null>(null)
  const [crime, setCrime] = useState(false)
  const [wellness, setWellness] = useState(false)
  const [shopping, setShopping] = useState(false)
  const [homeId, setHomeId] = useState<string | null>(null)

  const owned = ownedAssetIds
    .map((id) => getAsset(id))
    .filter((a): a is NonNullable<typeof a> => !!a)
  const netWorth =
    owned.reduce((sum, a) => sum + resaleValue(a), 0) +
    homes.reduce((sum, h) => sum + Math.round(h.price / 2), 0)
  const rentTotal = homes.reduce(
    (sum, h) => (h.id !== residenceId ? sum + homeRent(h.price) : sum),
    0,
  )

  const activeLabel = (cat: ActivityCategory): string => {
    const active = pursuits[cat]
    if (!active) return 'Nothing yet — tap to start'
    const a = getActivity(active.id)
    if (active.label) return `Learning ${active.label} · ${active.years}/${a?.durationYears} yrs`
    return `Currently: ${a?.name ?? '...'}`
  }

  const open = (cat: ActivityCategory) => () => {
    playSfx('click')
    setCategory(cat)
  }
  const tap = (fn: () => void) => () => {
    playSfx('click')
    fn()
  }

  const hasStuff = owned.length > 0 || homes.length > 0

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.sectionHeading}>WELLNESS</Text>
      <Row
        emoji="🧘"
        title={STRINGS.wellnessHub}
        subtitle="Clinic, counseling, spa — stay healthy, live longer"
        onPress={tap(() => setWellness(true))}
        chevron
      />

      <Text style={styles.sectionHeading}>PURSUITS</Text>
      <Row emoji="🏅" title="Sport" subtitle={activeLabel('sport')} onPress={open('sport')} chevron />
      <Row emoji="🧠" title="Mind" subtitle={activeLabel('mind')} onPress={open('mind')} chevron />
      <Row emoji="🎨" title="Hobbies" subtitle={activeLabel('hobby')} onPress={open('hobby')} chevron />
      <Row
        emoji="🦹"
        title="Crime"
        subtitle="Risky one-off jobs — you might get caught"
        onPress={tap(() => setCrime(true))}
        chevron
      />

      <Text style={styles.sectionHeading}>
        BELONGINGS{hasStuff ? ` · WORTH $${netWorth.toLocaleString()}` : ''}
        {rentTotal > 0 ? ` · $${rentTotal.toLocaleString()}/YR RENT` : ''}
      </Text>
      <Row
        emoji="🛍️"
        title="Go shopping"
        subtitle="Cars, phones, houses, and luxury"
        onPress={tap(() => setShopping(true))}
        chevron
      />
      {!hasStuff && (
        <Row emoji="📭" title="Nothing yet" subtitle="Buy something from the shop above" />
      )}
      {homes.map((home) => (
        <Row
          key={home.id}
          emoji={home.emoji}
          title={home.name}
          subtitle={
            home.id === residenceId
              ? '🏠 You live here · tap to manage'
              : `💰 Rented · $${homeRent(home.price).toLocaleString()}/yr · tap to manage`
          }
          onPress={tap(() => setHomeId(home.id))}
          chevron
        />
      ))}
      {owned.map((asset) => {
        const upkeep = assetUpkeep(asset.price, asset.category)
        return (
          <Row
            key={asset.id}
            emoji={asset.emoji}
            title={asset.name}
            subtitle={`Sell for $${resaleValue(asset).toLocaleString()}${upkeep > 0 ? ` · upkeep $${upkeep.toLocaleString()}/yr` : ''}`}
            onPress={tap(() => sellAsset(asset.id))}
            right={<Text style={styles.sell}>Sell</Text>}
          />
        )
      })}

      {category && <PursuitModal category={category} onClose={() => setCategory(null)} />}
      {crime && <CrimeModal onClose={() => setCrime(false)} />}
      {wellness && <MindBodyModal onClose={() => setWellness(false)} />}
      {shopping && <StoreModal onClose={() => setShopping(false)} />}
      {homeId && <HomeModal homeId={homeId} onClose={() => setHomeId(null)} />}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { gap: 8, paddingBottom: 110 },
  sectionHeading: {
    marginTop: 10,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: colors.slate400,
  },
  sell: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.rose500,
    marginRight: 4,
  },
})
