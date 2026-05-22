// mobile/src/screens/MyOccurrencesScreen.tsx
import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import api from '../services/api'

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Aberto', UNDER_REVIEW: 'Em análise',
  IN_PROGRESS: 'Em andamento', RESOLVED: 'Resolvido', REJECTED: 'Rejeitado',
}
const STATUS_COLORS: Record<string, string> = {
  OPEN: '#E74C3C', UNDER_REVIEW: '#F39C12',
  IN_PROGRESS: '#2980B9', RESOLVED: '#27AE60', REJECTED: '#95A5A6',
}
const CATEGORY_ICONS: Record<string, string> = {
  ROAD: '🛣️', LIGHTING: '💡', GARBAGE: '🗑️', FLOODING: '🌊', OTHER: '📌',
}

export default function MyOccurrencesScreen() {
  const navigation = useNavigation<any>()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function load(showRefresh = false) {
    if (showRefresh) setRefreshing(true)
    try {
      const r = await api.get('/occurrences/mine?limit=30')
      setData(r.data.data ?? [])
    } catch { /* ignore */ }
    finally { setLoading(false); setRefreshing(false) }
  }

  useFocusEffect(useCallback(() => { load() }, []))

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#1A3560" /></View>

  return (
    <FlatList
      style={{ backgroundColor: '#F4F6FA' }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      data={data}
      keyExtractor={i => i.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={['#1A3560']} />}
      ListHeaderComponent={<Text style={s.title}>📋 Minhas Ocorrências</Text>}
      ListEmptyComponent={
        <View style={s.empty}>
          <Text style={{ fontSize: 40 }}>📭</Text>
          <Text style={s.emptyTxt}>Nenhuma ocorrência registrada ainda.</Text>
          <TouchableOpacity style={s.newBtn} onPress={() => navigation.navigate('NewOccurrence')}>
            <Text style={s.newBtnTxt}>Registrar primeira ocorrência</Text>
          </TouchableOpacity>
        </View>
      }
      renderItem={({ item }) => (
        <TouchableOpacity style={s.card} onPress={() => navigation.navigate('OccurrenceDetail', { id: item.id })}>
          <View style={s.cardRow}>
            <Text style={s.catIcon}>{CATEGORY_ICONS[item.category] ?? '📌'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={s.cardDate}>{new Date(item.createdAt).toLocaleDateString('pt-BR')}</Text>
            </View>
            <View style={[s.badge, { backgroundColor: STATUS_COLORS[item.status] + '20' }]}>
              <Text style={[s.badgeTxt, { color: STATUS_COLORS[item.status] }]}>
                {STATUS_LABELS[item.status]}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      )}
    />
  )
}

const s = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1A3560', marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  catIcon: { fontSize: 28 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#222', flex: 1 },
  cardDate: { fontSize: 11, color: '#999', marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeTxt: { fontSize: 11, fontWeight: 'bold' },
  empty: { alignItems: 'center', padding: 40 },
  emptyTxt: { color: '#888', marginTop: 12, fontSize: 14, textAlign: 'center' },
  newBtn: { marginTop: 20, backgroundColor: '#1A3560', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  newBtnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
})
