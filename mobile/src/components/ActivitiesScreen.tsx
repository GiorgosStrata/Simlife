import { useState } from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { playSfx } from '../audio/sfx'
import { getActivity } from '../data/activities'
import { getAsset } from '../data/assets'
import { useGameStore } from '../store/gameStore'
import { colors } from '../theme'
import { AchievementsModal } from './AchievementsModal'
import { ACHIEVEMENTS } from '../data/achievements'
import { ActivitiesModal } from './ActivitiesModal'
import { BelongingsModal } from './BelongingsModal'
import { CrimeModal } from './CrimeModal'
import { MindBodyModal } from './MindBodyModal'
import { PhoneModal } from './PhoneModal'
import { Row } from './Row'
import { SectionHeading } from './SectionHeading'
import { StoreModal } from './StoreModal'

/** The "Lifestyle" hub — every area behind a single tappable row. */
export function ActivitiesScreen() {
  const pursuits = useGameStore((s) => s.pursuits)
  const ownedAssetIds = useGameStore((s) => s.ownedAssetIds)
  const ownedItems = useGameStore((s) => s.ownedItems)
  const homes = useGameStore((s) => s.homes)
  const unlockedCount = useGameStore((s) => s.unlockedAchievements.length)
  const [activities, setActivities] = useState(false)
  const [crime, setCrime] = useState(false)
  const [wellness, setWellness] = useState(false)
  const [shopping, setShopping] = useState(false)
  const [phoneOpen, setPhoneOpen] = useState(false)
  const [belongings, setBelongings] = useState(false)
  const [achievements, setAchievements] = useState(false)

  const hasPhone = ownedAssetIds.some((id) => getAsset(id)?.category === 'phone')
  // Cars & jewelry (incl. stolen loot) live in ownedItems — count them too.
  const itemCount = ownedAssetIds.length + ownedItems.length + homes.length

  const activeCount = Object.values(pursuits).filter(Boolean).length
  const activitiesSub = (() => {
    if (activeCount === 0) return 'Sports, hobbies, learning — take something up'
    const names = (Object.values(pursuits).filter(Boolean) as Array<{ id: string }>)
      .map((p) => getActivity(p.id)?.name)
      .filter(Boolean)
    return `Doing: ${names.join(', ')}`
  })()

  const tap = (fn: () => void) => () => {
    playSfx('click')
    fn()
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <SectionHeading color={colors.emerald700}>HEALTH</SectionHeading>
      <Row
        emoji="🩺"
        title="Health & wellness"
        subtitle="Doctor, dentist, therapy, botox — and treat any illnesses"
        onPress={tap(() => setWellness(true))}
        chevron
      />

      <SectionHeading color={colors.violet500}>ACTIVITIES</SectionHeading>
      <Row
        emoji="🎯"
        title="Activities"
        subtitle={activitiesSub}
        onPress={tap(() => setActivities(true))}
        chevron
      />

      <SectionHeading color={colors.rose500}>CRIME</SectionHeading>
      <Row
        emoji="🦹"
        title="Commit a crime"
        subtitle="Risky one-off jobs — you might get caught"
        onPress={tap(() => setCrime(true))}
        chevron
      />

      <SectionHeading color={colors.sky500}>PHONE</SectionHeading>
      <Row
        emoji="📱"
        title="Phone"
        subtitle={
          hasPhone ? 'Social media, dating & more apps' : 'Buy a phone in the shop to unlock apps'
        }
        onPress={hasPhone ? tap(() => setPhoneOpen(true)) : undefined}
        disabled={!hasPhone}
        chevron={hasPhone}
      />

      <SectionHeading color={colors.amber400}>SHOP & BELONGINGS</SectionHeading>
      <Row
        emoji="🛍️"
        title="Go shopping"
        subtitle="Cars, phones, houses, and luxury"
        onPress={tap(() => setShopping(true))}
        chevron
      />
      <Row
        emoji="🎒"
        title="My belongings"
        subtitle={itemCount > 0 ? `${itemCount} item${itemCount === 1 ? '' : 's'} — manage & sell` : 'Nothing yet'}
        onPress={tap(() => setBelongings(true))}
        chevron
      />

      <SectionHeading color={colors.amber400}>MILESTONES</SectionHeading>
      <Row
        emoji="🏆"
        title="Achievements"
        subtitle={`${unlockedCount} of ${ACHIEVEMENTS.length} unlocked`}
        onPress={tap(() => setAchievements(true))}
        chevron
      />

      {activities && <ActivitiesModal onClose={() => setActivities(false)} />}
      {achievements && <AchievementsModal onClose={() => setAchievements(false)} />}
      {crime && <CrimeModal onClose={() => setCrime(false)} />}
      {wellness && <MindBodyModal onClose={() => setWellness(false)} />}
      {shopping && <StoreModal onClose={() => setShopping(false)} />}
      {phoneOpen && <PhoneModal onClose={() => setPhoneOpen(false)} />}
      {belongings && <BelongingsModal onClose={() => setBelongings(false)} />}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { gap: 8, paddingBottom: 110 },
})
