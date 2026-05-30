// mobile/src/screens/OccurrenceDetailScreen.tsx
import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, Image, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native'
import api from '../services/api'
import { useAuth } from '../hooks/useAuth'

const STATUS_LABELS: Record<string, string> = { OPEN: 'Aberto', UNDER_REVIEW: 'Em análise', IN_PROGRESS: 'Em andamento', RESOLVED: 'Resolvido', REJECTED: 'Rejeitado' }
const STATUS_COLORS: Record<string, string> = { OPEN: '#E74C3C', UNDER_REVIEW: '#F39C12', IN_PROGRESS: '#2980B9', RESOLVED: '#27AE60', REJECTED: '#95A5A6' }
const CATEGORY_LABELS: Record<string, string> = { ROAD: '🛣️ Via/Buraco', LIGHTING: '💡 Iluminação', GARBAGE: '🗑️ Lixo', FLOODING: '🌊 Alagamento', WATER: '💧 Falta de Água', ENERGY: '⚡ Falta de Luz', OTHER: '📌 Outro' }
const ALL_STATUSES = ['OPEN', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']

export default function OccurrenceDetailScreen({ route }: any) {
  const { id } = route.params
  const { isAdmin } = useAuth()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    try { const r = await api.get(`/occurrences/${id}`); setData(r.data) }
    catch { Alert.alert('Erro', 'Não foi possível carregar a ocorrência') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [id])

  async function updateStatus(status: string) {
    try {
      await api.patch(`/occurrences/${id}/status`, { status })
      await load()
      Alert.alert('Sucesso', 'Status atualizado com sucesso!')
    } catch { Alert.alert('Erro', 'Não foi possível atualizar o status') }
  }

  if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#1A3560" /></View>
  if (!data) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Ocorrência não encontrada</Text></View>

  const photoUri = data.photoUrl
    ? (data.photoUrl.startsWith('http') ? data.photoUrl : `${(process.env.EXPO_PUBLIC_API_URL ?? '').replace('/api', '')}${data.photoUrl}`)
    : null

  return (
    <ScrollView style={{ backgroundColor: '#F4F6FA' }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      {/* Header / Info */}
      <View style={s.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <Text style={[s.title, { flex: 1 }]}>{data.title}</Text>
          <View style={[s.badge, { backgroundColor: STATUS_COLORS[data.status] + '20' }]}>
            <Text style={[s.badgeTxt, { color: STATUS_COLORS[data.status] }]}>{STATUS_LABELS[data.status]}</Text>
          </View>
        </View>
        <Text style={s.catTag}>{CATEGORY_LABELS[data.category]}</Text>
        <Text style={s.desc}>{data.description}</Text>
        <View style={s.infoRow}><Text style={s.infoLbl}>📍 Local</Text><Text style={s.infoVal}>{data.address ?? 'Não informado'}{data.neighborhood ? ` — ${data.neighborhood}` : ''}</Text></View>
        <View style={s.infoRow}><Text style={s.infoLbl}>👤 Cidadão</Text><Text style={s.infoVal}>{data.user?.name}</Text></View>
        <View style={s.infoRow}><Text style={s.infoLbl}>🕐 Data</Text><Text style={s.infoVal}>{new Date(data.createdAt).toLocaleDateString('pt-BR')}</Text></View>
      </View>

      {/* Foto */}
      {photoUri && (
        <View style={s.card}>
          <Text style={s.sectionTitle}>📷 Foto da Ocorrência</Text>
          <Image source={{ uri: photoUri }} style={s.photo} resizeMode="cover" />
        </View>
      )}

      {/* Atualizar Status — só ADMIN/MASTER */}
      {isAdmin && (
        <View style={s.card}>
          <Text style={s.sectionTitle}>⚙️ Atualizar Status</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {ALL_STATUSES.filter(st => st !== data.status).map(st => (
              <TouchableOpacity key={st}
                style={[s.statusBtn, { borderColor: STATUS_COLORS[st] }]}
                onPress={() => Alert.alert('Confirmar', `Alterar para "${STATUS_LABELS[st]}"?`, [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Confirmar', onPress: () => updateStatus(st) },
                ])}
              >
                <Text style={[s.statusBtnTxt, { color: STATUS_COLORS[st] }]}>→ {STATUS_LABELS[st]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Histórico */}
      {data.statusHistory?.length > 0 && (
        <View style={s.card}>
          <Text style={s.sectionTitle}>📜 Histórico de Atualizações</Text>
          {data.statusHistory.map((h: any) => (
            <View key={h.id} style={s.histItem}>
              <View style={[s.histDot, { backgroundColor: STATUS_COLORS[h.status] }]} />
              <View style={{ flex: 1 }}>
                <Text style={s.histStatus}>{STATUS_LABELS[h.status]}</Text>
                {h.comment && <Text style={s.histComment}>"{h.comment}"</Text>}
                <Text style={s.histMeta}>por {h.changedBy?.name} · {new Date(h.createdAt).toLocaleDateString('pt-BR')}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  )
}

const s = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 18, marginBottom: 14, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1A3560' },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, marginLeft: 8 },
  badgeTxt: { fontSize: 12, fontWeight: 'bold' },
  catTag: { fontSize: 13, color: '#555', marginBottom: 10 },
  desc: { fontSize: 14, color: '#444', lineHeight: 20, backgroundColor: '#F8F9FA', padding: 12, borderRadius: 8, marginBottom: 12 },
  infoRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  infoLbl: { fontSize: 12, color: '#888', width: 90 },
  infoVal: { fontSize: 12, color: '#333', flex: 1 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#1A3560', marginBottom: 12 },
  photo: { width: '100%', height: 220, borderRadius: 10 },
  statusBtn: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  statusBtnTxt: { fontSize: 12, fontWeight: 'bold' },
  histItem: { flexDirection: 'row', gap: 12, marginBottom: 12, alignItems: 'flex-start' },
  histDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  histStatus: { fontSize: 13, fontWeight: 'bold', color: '#333' },
  histComment: { fontSize: 12, color: '#666', fontStyle: 'italic', marginTop: 2 },
  histMeta: { fontSize: 11, color: '#999', marginTop: 2 },
})
