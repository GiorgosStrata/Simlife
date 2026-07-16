import { StyleSheet, Text, View } from 'react-native'
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg'
import { avatarFor, type AvatarLook, type HairStyle } from '../data/avatar'
import type { Gender, Person } from '../types'

interface AvatarProps {
  seed: string
  gender: Gender
  age?: number
  size?: number
  alive?: boolean
}

const SHADOW = 'rgba(0,0,0,0.16)'

/** Hair drawn behind the head (frames the sides / drapes to the shoulders). */
function backHair(style: HairStyle, hair: string) {
  switch (style) {
    case 'long':
      return <Ellipse cx={50} cy={56} rx={33} ry={37} fill={hair} />
    case 'bob':
      return <Ellipse cx={50} cy={50} rx={31} ry={32} fill={hair} />
    case 'medium':
      return <Ellipse cx={50} cy={49} rx={30} ry={31} fill={hair} />
    case 'curly':
      return <Ellipse cx={50} cy={40} rx={32} ry={28} fill={hair} />
    case 'ponytail':
      return (
        <G>
          <Ellipse cx={50} cy={49} rx={30} ry={31} fill={hair} />
          <Ellipse cx={75} cy={46} rx={6.5} ry={16} fill={hair} />
        </G>
      )
    default:
      return null
  }
}

/** Hair drawn over the forehead (the cap / hairline) and top accents. */
function topHair(style: HairStyle, hair: string) {
  const cap = (d: string) => <Path d={d} fill={hair} />
  switch (style) {
    case 'bald':
      return null
    case 'buzz':
      return cap('M27,43 C27,27 73,27 73,43 C69,35 60,31 50,31 C40,31 31,35 27,43 Z')
    case 'curly':
      return <Ellipse cx={50} cy={27} rx={27} ry={17} fill={hair} />
    case 'bun':
      return (
        <G>
          {cap('M25,44 C24,24 76,24 75,44 C72,32 62,27 50,27 C38,27 28,32 25,44 Z')}
          <Circle cx={50} cy={19} r={8} fill={hair} />
        </G>
      )
    case 'sidePart':
      return (
        <G>
          {cap('M25,44 C24,24 76,24 75,42 C72,34 66,30 50,30 C44,30 30,28 25,44 Z')}
          <Path d="M26,42 C30,30 44,30 50,31 C40,33 33,39 30,48 Z" fill={hair} />
        </G>
      )
    case 'medium':
    case 'long':
    case 'bob':
    case 'ponytail':
      return cap('M24,46 C24,22 76,22 76,46 C72,32 62,28 50,28 C38,28 28,32 24,46 Z')
    default:
      return cap('M25,44 C24,24 76,24 75,44 C72,32 62,27 50,27 C38,27 28,32 25,44 Z')
  }
}

function eyes(style: number, female: boolean) {
  const ry = style === 0 ? 4 : style === 1 ? 4.6 : 3.2
  const rx = style === 2 ? 2.6 : 3.2
  return (
    <G>
      <Ellipse cx={41} cy={50} rx={rx} ry={ry} fill="#3a2e2a" />
      <Ellipse cx={59} cy={50} rx={rx} ry={ry} fill="#3a2e2a" />
      <Circle cx={42} cy={48.5} r={0.9} fill="#fff" />
      <Circle cx={60} cy={48.5} r={0.9} fill="#fff" />
      {female && (
        <G>
          <Path d="M36.5,48 L34.5,46.5 M37,50.5 L34.8,50.5" stroke="#3a2e2a" strokeWidth={1} strokeLinecap="round" />
          <Path d="M63.5,48 L65.5,46.5 M63,50.5 L65.2,50.5" stroke="#3a2e2a" strokeWidth={1} strokeLinecap="round" />
        </G>
      )}
    </G>
  )
}

function brows(style: number, hair: string) {
  const d =
    style === 0
      ? ['M36,42 Q41,40 46,42', 'M54,42 Q59,40 64,42'] // straight
      : ['M36,43 Q41,39 46,41', 'M54,41 Q59,39 64,43'] // raised
  return (
    <G>
      <Path d={d[0]} stroke={hair} strokeWidth={2} strokeLinecap="round" fill="none" />
      <Path d={d[1]} stroke={hair} strokeWidth={2} strokeLinecap="round" fill="none" />
    </G>
  )
}

function mouth(style: number, female: boolean) {
  const color = female ? '#d6567a' : '#9c4a3a'
  const w = female ? 2.4 : 2
  if (style === 0) return <Path d="M43,63 Q50,69 57,63" stroke={color} strokeWidth={w} strokeLinecap="round" fill="none" />
  if (style === 1) return <Path d="M44,64 L56,64" stroke={color} strokeWidth={w} strokeLinecap="round" fill="none" />
  return <Path d="M42,62 Q50,71 58,62 Z" fill="#fff" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
}

function facialHair(kind: AvatarLook['facialHair'], hair: string) {
  const jaw = 'M27,50 C27,73 40,80 50,80 C60,80 73,73 73,50 C73,63 66,71 50,71 C34,71 27,63 27,50 Z'
  switch (kind) {
    case 'stubble':
      return <Path d={jaw} fill={hair} opacity={0.3} />
    case 'beard':
      return <Path d={jaw} fill={hair} />
    case 'mustache':
      return <Path d="M40,60 Q50,64 60,60 Q50,62.5 40,60 Z" fill={hair} />
    default:
      return null
  }
}

function Face({ look }: { look: AvatarLook }) {
  return (
    <>
      {/* Background */}
      <Rect x={0} y={0} width={100} height={100} fill={look.bg} />
      {/* Shoulders / shirt */}
      <Ellipse cx={50} cy={102} rx={34} ry={26} fill={look.shirt} />
      {/* Hair behind the head */}
      {backHair(look.hairStyle, look.hair)}
      {/* Neck */}
      <Rect x={44} y={70} width={12} height={16} rx={5} fill={look.skin} />
      <Rect x={44} y={70} width={12} height={6} fill={SHADOW} opacity={0.25} />
      {/* Ears */}
      <Circle cx={24} cy={52} r={5.5} fill={look.skin} />
      <Circle cx={76} cy={52} r={5.5} fill={look.skin} />
      {/* Head */}
      <Ellipse cx={50} cy={50} rx={26} ry={29} fill={look.skin} />
      {/* Cheeks */}
      {look.blush && (
        <G>
          <Ellipse cx={35} cy={59} rx={4} ry={2.6} fill="#f9a8b4" opacity={0.55} />
          <Ellipse cx={65} cy={59} rx={4} ry={2.6} fill="#f9a8b4" opacity={0.55} />
        </G>
      )}
      {/* Features */}
      {brows(look.brows, look.hair)}
      {eyes(look.eyes, look.female)}
      {/* Nose */}
      <Path d="M50,51 L47,60 Q50,62 53,60" stroke="rgba(0,0,0,0.15)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {facialHair(look.facialHair, look.hair)}
      {mouth(look.mouth, look.female)}
      {/* Hair over the forehead */}
      {topHair(look.hairStyle, look.hair)}
    </>
  )
}

/** A deterministic flat-vector face for a character (BitLife style). */
export function Avatar({ seed, gender, age = 25, size = 44, alive = true }: AvatarProps) {
  if (!alive) {
    return (
      <View style={[styles.grave, { width: size, height: size, borderRadius: size / 2 }]}>
        <Text style={{ fontSize: size * 0.5 }}>🪦</Text>
      </View>
    )
  }
  const look = avatarFor(seed, gender, age)
  return (
    <View style={[styles.frame, { width: size, height: size, borderRadius: size / 2 }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Face look={look} />
      </Svg>
    </View>
  )
}

/**
 * Convenience wrapper that seeds an Avatar from a Person. Seeding on the
 * name (plus family role, which never collides) keeps a face stable and
 * lets a Cinder match keep the same look once they become your partner.
 */
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
