// mobile/src/screens/OccurrenceDetailScreen.tsx
import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, Image, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native'
import api from '../services/api'
import { useAuth } from '../hooks/useAuth'

const STATUS_LABELS: Record<string, string> = { OPEN: 'Aberto', UNDER_REVIEW: 'Em análise', IN_PROGRESS: 'Em andamento', RESOLVED: 'Resolvido', REJECTED: 'Rejeitado' }
const STATUS_COLORS: Record<string, string> = { OPEN: '#E74C3C', UNDER_REVIEW: '#F39C12', IN_PROGRESS: '#2980B9', RESOLVED: '#27AE60', REJECTED: '#95A5A6' }
const CATEGORY_LABELS: Record<string, string> = { ROAD: '🛣️ Via/Buraco', LIGHTING: '💡 Iluminação', GARBAGE: '🗑️ Lixo', FLOODING: '🌊 Alagamento', WATER: '💧 Falta de Água', ENERGY: '⚡ Falta de Luz', OTHER: '📌 Outro' }
const ALL_STATUSES = ['OPEN', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']

function formatDuration(ms: number): string {
  if (ms < 0) ms = 0
  const min = Math.floor(ms / 60000)
  const h = Math.floor(min / 60)
  const d = Math.floor(h / 24)
  if (d > 0) return `${d}d ${h % 24}h`
  if (h > 0) return `${h}h ${min % 60}min`
  if (min > 0) return `${min}min`
  return 'menos de 1min'
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

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

  const history = (data.statusHistory ?? []).slice().sort(
    (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  const timeline = [
    { status: 'OPEN', label: 'Aberto', date: data.createdAt, by: data.user?.name ?? 'Cidadão', comment: null as string | null },
    ...history.map((h: any) => ({
      status: h.status,
      label: STATUS_LABELS[h.status] ?? h.status,
      date: h.createdAt,
      by: h.changedBy?.name ?? 'Sistema',
      comment: h.comment ?? null,
    })),
  ]

  const timelineWithDelta = timeline.map((item, i) => ({
    ...item,
    delta: i === 0 ? null : new Date(item.date).getTime() - new Date(timeline[i - 1].date).getTime(),
  }))

  const totalMs = timeline.length > 1
    ? new Date(timeline[timeline.length - 1].date).getTime() - new Date(timeline[0].date).getTime()
    : null

  const isResolved = data.status === 'RESOLVED'

  return (
    <ScrollView style={{ backgroundColor: '#F4F6FA' }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
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
        <View style={s.infoRow}><Text style={s.infoLbl}>🕐 Registrada</Text><Text style={s.infoVal}>{formatDateTime(data.createdAt)}</Text></View>
      </View>

      {photoUri && (
        <View style={s.card}>
          <Text style={s.sectionTitle}>📷 Foto da Ocorrência</Text>
          <Image source={{ uri: photoUri }} style={s.photo} resizeMode="cover" />
        </View>
      )}

      <View style={s.card}>
        <Text style={s.sectionTitle}>⏱️ Tempo de Resposta</Text>
        {totalMs !== null ? (
          <View style={s.slaBox}>
            <Text style={s.slaLabel}>{isResolved ? 'Tempo total até resolução' : 'Tempo desde a abertura'}</Text>
            <Text style={[s.slaValue, { color: isResolved ? '#27AE60' : '#F39C12' }]}>{formatDuration(totalMs)}</Text>
          </View>
        ) : (
          <Text style={s.slaPending}>Aguardando primeira ação do órgão responsável.</Text>
        )}
      </View>

      <View style={s.card}>
        <Text style={s.sectionTitle}>📜 Linha do Tempo do Atendimento</Text>
        {timelineWithDelta.map((item, i) => (
          <View key={i} style={s.tlItem}>
            <View style={s.tlLeft}>
              <View style={[s.tlDot, { backgroundColor: STATUS_COLORS[item.status] }]} />
              {i < timelineWithDelta.length - 1 && <View style={s.tlLine} />}
            </View>
            <View style={s.tlContent}>
              <Text style={[s.tlStatus, { color: STATUS_COLORS[item.status] }]}>{item.label}</Text>
              <Text style={s.tlDate}>{formatDateTime(item.date)}</Text>
              {item.delta !== null && (
                <Text style={s.tlDelta}>⏳ {formatDuration(item.delta)} após a etapa anterior</Text>
              )}
              <Text style={s.tlBy}>por {item.by}</Text>
              {item.comment && <Text style={s.tlComment}>"{item.comment}"</Text>}
            </View>
          </View>
        ))}
      </View>

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
  infoLbl: { fontSize: 12, color: '#888', width: 100 },
  infoVal: { fontSize: 12, color: '#333', flex: 1 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#1A3560', marginBottom: 12 },
  photo: { width: '100%', height: 220, borderRadius: 10 },
  slaBox: { backgroundColor: '#F8F9FA', borderRadius: 10, padding: 16, alignItems: 'center' },
  slaLabel: { fontSize: 12, color: '#888', marginBottom: 4 },
  slaValue: { fontSize: 24, fontWeight: 'bold' },
  slaPending: { fontSize: 13, color: '#888', fontStyle: 'italic' },
  tlItem: { flexDirection: 'row', gap: 12 },
  tlLeft: { alignItems: 'center', width: 16 },
  tlDot: { width: 14, height: 14, borderRadius: 7, marginTop: 2 },
  tlLine: { width: 2, flex: 1, backgroundColor: '#E0E0E0', marginVertical: 2 },
  tlContent: { flex: 1, paddingBottom: 18 },
  tlStatus: { fontSize: 14, fontWeight: 'bold' },
  tlDate: { fontSize: 12, color: '#333', marginTop: 2 },
  tlDelta: { fontSize: 12, color: '#F39C12', marginTop: 2, fontWeight: '600' },
  tlBy: { fontSize: 11, color: '#999', marginTop: 2 },
  tlComment: { fontSize: 12, color: '#666', fontStyle: 'italic', marginTop: 4 },
  statusBtn: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  statusBtnTxt: { fontSize: 12, fontWeight: 'bold' },
})
