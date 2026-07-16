import { useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { SvgXml } from 'react-native-svg'
import { configAvatarSvg, seedAvatarSvg, type AvatarConfig } from '../data/avatar'
import type { Gender, Person } from '../types'

interface AvatarProps {
  size?: number
  alive?: boolean
  /** Player look (from character creation). Takes priority over seed. */
  config?: AvatarConfig
  /** NPC seed — a stable string, usually the person's name. */
  seed?: string
  gender?: Gender
  age?: number
}

/** A friendly DiceBear (avataaars) avatar, clipped into a circle. */
export function Avatar({ config, seed, gender = 'male', age = 25, size = 44, alive = true }: AvatarProps) {
  const xml = useMemo(() => {
    if (config) return configAvatarSvg(config)
    return seedAvatarSvg(seed ?? 'anon', gender, age)
  }, [config, seed, gender, age])

  if (!alive) {
    return (
      <View style={[styles.grave, { width: size, height: size, borderRadius: size / 2 }]}>
        <Text style={{ fontSize: size * 0.5 }}>🪦</Text>
      </View>
    )
  }

  return (
    <View style={[styles.frame, { width: size, height: size, borderRadius: size / 2 }]}>
      <SvgXml xml={xml} width={size} height={size} />
    </View>
  )
}

/** Convenience wrapper that seeds an Avatar from a Person. */
export function PersonAvatar({ person, size = 44 }: { person: Person; size?: number }) {
  const familyRole =
    person.role === 'mother' || person.role === 'father' || person.role === 'sibling'
      ? person.role
      : ''
  return (
    <Avatar
      seed={`${familyRole}${person.name}`}
      gender={person.gender}
      age={person.age}
      size={size}
      alive={person.alive}
    />
  )
}

const styles = StyleSheet.create({
  frame: { overflow: 'hidden', backgroundColor: '#e0f2fe' },
  grave: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#e2e8f0' },
})
