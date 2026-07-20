import { useEffect, useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import { INVESTMENTS, getInvestment, type InvestmentKind } from '../data/investments'
import { useGameStore } from '../store/gameStore'
import { colors } from '../theme'
import { Row } from './Row'
import { SectionHeading } from './SectionHeading'
import { useCloseOnAction } from './useCloseOnAction'

interface InvestingModalProps {
  onClose: () => void
}

const KIND_LABEL: Record<InvestmentKind, string> = {
  index: 'INDEX FUNDS · STEADY',
  stock: 'STOCKS · RISKY',
  crypto: 'CRYPTO · WILD',
}
const KIND_COLOR: Record<InvestmentKind, string> = {
  index: colors.emerald700,
  stock: colors.sky500,
  crypto: colors.amber400,
}

function money(n: number): string {
  const v = Math.round(n)
  return v < 0 ? `-$${Math.abs(v).toLocaleString()}` : `$${v.toLocaleString()}`
}
function price(n: number): string {
  return n >= 100 ? `$${Math.round(n).toLocaleString()}` : `$${n.toFixed(2)}`
}

/** Vestr — buy and sell index funds, stocks and crypto. */
export function InvestingModal({ onClose }: InvestingModalProps) {
  const cash = useGameStore((s) => s.money)
  const age = useGameStore((s) => s.age)
  const prices = useGameStore((s) => s.investPrices)
  const holdings = useGameStore((s) => s.investments)
  const buyInvestment = useGameStore((s) => s.buyInvestment)
  const sellInvestment = useGameStore((s) => s.sellInvestment)
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    playSfx('pop')
  }, [])
  useCloseOnAction(onClose)

  const priceOf = (id: string) => prices[id] ?? getInvestment(id)?.start ?? 0
  const held = Object.entries(holdings).filter(([, h]) => h.units > 0)
  const portfolio = held.reduce((sum, [id, h]) => sum + h.units * priceOf(id), 0)

  const detail = openId ? getInvestment(openId) : null
  const detailHolding = openId ? holdings[openId] : undefined

  const buy = (id: string, amount: number) => () => {
    buyInvestment(id, amount)
  }
  const sell = (id: string, fraction: number) => () => {
    sellInvestment(id, fraction)
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>📈 Vestr</Text>
          <View style={styles.summary}>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>CASH</Text>
              <Text style={styles.summaryValue}>{money(cash)}</Text>
            </View>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>PORTFOLIO</Text>
              <Text style={[styles.summaryValue, { color: colors.emerald700 }]}>
                {money(portfolio)}
              </Text>
            </View>
          </View>

          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {age < 18 && (
              <Text style={styles.note}>You can start investing at 18.</Text>
            )}

            {held.length > 0 && (
              <>
                <SectionHeading color={colors.violet500}>YOUR HOLDINGS</SectionHeading>
                {held.map(([id, h]) => {
                  const inv = getInvestment(id)
                  if (!inv) return null
                  const value = h.units * priceOf(id)
                  const gain = value - h.invested
                  const pct = h.invested > 0 ? (gain / h.invested) * 100 : 0
                  return (
                    <Row
                      key={id}
                      emoji={inv.emoji}
                      title={`${inv.name} · ${money(value)}`}
                      subtitle={`${gain >= 0 ? '▲' : '▼'} ${money(gain)} (${pct >= 0 ? '+' : ''}${pct.toFixed(0)}%)`}
                      onPress={() => {
                        playSfx('click')
                        setOpenId(id)
                      }}
                      chevron
                    />
                  )
                })}
              </>
            )}

            {(['index', 'stock', 'crypto'] as InvestmentKind[]).map((kind) => (
              <View key={kind}>
                <SectionHeading color={KIND_COLOR[kind]}>{KIND_LABEL[kind]}</SectionHeading>
                {INVESTMENTS.filter((i) => i.kind === kind).map((inv) => (
                  <Row
                    key={inv.id}
                    emoji={inv.emoji}
                    title={`${inv.name} (${inv.ticker})`}
                    subtitle={`${price(priceOf(inv.id))} / unit`}
                    onPress={() => {
                      playSfx('click')
                      setOpenId(inv.id)
                    }}
                    chevron
                  />
                ))}
              </View>
            ))}
          </ScrollView>

          <Pressable accessibilityRole="button" onPress={onClose} style={styles.cancel}>
            <Text style={styles.cancelText}>Close</Text>
          </Pressable>
        </View>
      </View>

      {detail && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setOpenId(null)}>
          <Pressable style={styles.detailBackdrop} onPress={() => setOpenId(null)}>
            <Pressable style={styles.detailCard} onPress={() => {}}>
              <Text style={styles.detailTitle}>
                {detail.emoji} {detail.name}
              </Text>
              <Text style={styles.detailMeta}>
                {detail.ticker} · {price(priceOf(detail.id))} / unit ·{' '}
                {detail.kind === 'index' ? 'steady' : detail.kind === 'stock' ? 'risky' : 'very risky'}
              </Text>

              {detailHolding && detailHolding.units > 0 && (
                <Text style={styles.detailHolding}>
                  You hold {money(detailHolding.units * priceOf(detail.id))} worth
                </Text>
              )}

              {age >= 18 ? (
                <>
                  <Text style={styles.detailSection}>Invest</Text>
                  <View style={styles.btnRow}>
                    {[100, 1000, 10000].map((amt) => (
                      <Pressable
                        key={amt}
                        accessibilityRole="button"
                        onPress={buy(detail.id, amt)}
                        disabled={cash < amt}
                        style={[styles.buyBtn, cash < amt && styles.btnDisabled]}
                      >
                        <Text style={styles.buyBtnText}>${amt.toLocaleString()}</Text>
                      </Pressable>
                    ))}
                    <Pressable
                      accessibilityRole="button"
                      onPress={buy(detail.id, cash)}
                      disabled={cash <= 0}
                      style={[styles.buyBtn, cash <= 0 && styles.btnDisabled]}
                    >
                      <Text style={styles.buyBtnText}>Max</Text>
                    </Pressable>
                  </View>

                  {detailHolding && detailHolding.units > 0 && (
                    <>
                      <Text style={styles.detailSection}>Sell</Text>
                      <View style={styles.btnRow}>
                        <Pressable accessibilityRole="button" onPress={sell(detail.id, 0.5)} style={styles.sellBtn}>
                          <Text style={styles.sellBtnText}>Half</Text>
                        </Pressable>
                        <Pressable accessibilityRole="button" onPress={sell(detail.id, 1)} style={styles.sellBtn}>
                          <Text style={styles.sellBtnText}>All</Text>
                        </Pressable>
                      </View>
                    </>
                  )}
                </>
              ) : (
                <Text style={styles.detailMeta}>You can start investing at 18.</Text>
              )}

              <Pressable accessibilityRole="button" onPress={() => setOpenId(null)} style={styles.detailClose}>
                <Text style={styles.cancelText}>Done</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.backdrop, justifyContent: 'flex-end' },
  card: {
    backgroundColor: colors.slate100,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '88%',
  },
  title: { fontSize: 20, fontWeight: '800', color: colors.slate800 },
  summary: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  summaryCol: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  summaryLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, color: colors.slate400 },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.slate800,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  list: { marginTop: 8 },
  listContent: { gap: 8, paddingBottom: 8 },
  note: { fontSize: 13, color: colors.slate500, paddingVertical: 4 },
  cancel: { marginTop: 8, alignItems: 'center', paddingVertical: 8 },
  cancelText: { fontSize: 14, fontWeight: '700', color: colors.slate500 },
  detailBackdrop: {
    flex: 1,
    backgroundColor: colors.backdrop,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
  },
  detailCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 340,
  },
  detailTitle: { fontSize: 18, fontWeight: '800', color: colors.slate800 },
  detailMeta: { fontSize: 13, color: colors.slate500, marginTop: 3 },
  detailHolding: { fontSize: 14, fontWeight: '700', color: colors.emerald700, marginTop: 10 },
  detailSection: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.slate400,
    marginTop: 16,
    marginBottom: 8,
  },
  btnRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  buyBtn: {
    flexGrow: 1,
    backgroundColor: colors.cyan500,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },
  buyBtnText: { color: colors.onColor, fontSize: 14, fontWeight: '700' },
  sellBtn: {
    flexGrow: 1,
    backgroundColor: colors.rose500,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },
  sellBtnText: { color: colors.onColor, fontSize: 14, fontWeight: '700' },
  btnDisabled: { opacity: 0.4 },
  detailClose: { marginTop: 18, alignItems: 'center', paddingVertical: 8 },
})
