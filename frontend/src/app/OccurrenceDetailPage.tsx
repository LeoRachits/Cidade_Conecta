// src/app/OccurrenceDetailPage.tsx
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../lib/api'
import { Occurrence, CATEGORY_LABELS, STATUS_LABELS, STATUS_COLORS, OccurrenceStatus } from '../types'
import { useAuth } from '../hooks/useAuth'

const STATUS_FLOW: OccurrenceStatus[] = ['OPEN', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']

const DOT_COLORS: Record<OccurrenceStatus, string> = {
  OPEN: '#E74C3C',
  UNDER_REVIEW: '#F39C12',
  IN_PROGRESS: '#2980B9',
  RESOLVED: '#27AE60',
  REJECTED: '#95A5A6',
}

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

export default function OccurrenceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { isAdmin } = useAuth()
  const [occurrence, setOccurrence] = useState<Occurrence | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [comment, setComment] = useState('')

  async function reload() {
    if (!id) return
    const refreshed = await api.get<Occurrence>(`/occurrences/${id}`)
    setOccurrence(refreshed.data)
  }

  useEffect(() => {
    if (!id) return
    api.get<Occurrence>(`/occurrences/${id}`)
      .then((res) => setOccurrence(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  async function updateStatus(status: OccurrenceStatus) {
    if (!id) return
    setUpdating(true)
    try {
      await api.patch(`/occurrences/${id}/status`, { status, comment: comment || undefined })
      setComment('')
      await reload()
    } catch (err: any) {
      alert(err.response?.data?.error ?? 'Erro ao atualizar status')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Carregando...</div>
  if (!occurrence) return <div className="text-center py-20 text-red-400">Ocorrência não encontrada</div>

  const photoUri = occurrence.photoUrl
    ? (occurrence.photoUrl.startsWith('http') ? occurrence.photoUrl : `${(import.meta.env.VITE_API_URL ?? '').replace('/api', '')}${occurrence.photoUrl}`)
    : null

  // Linha do tempo: abertura + cada mudança de status
  const history = (occurrence.statusHistory ?? []).slice().sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
  const timeline = [
    { status: 'OPEN' as OccurrenceStatus, date: occurrence.createdAt, by: occurrence.user?.name ?? 'Cidadão', comment: null as string | null },
    ...history.map((h) => ({ status: h.status, date: h.createdAt, by: h.changedBy?.name ?? 'Sistema', comment: h.comment ?? null })),
  ]
  const timelineWithDelta = timeline.map((item, i) => ({
    ...item,
    delta: i === 0 ? null : new Date(item.date).getTime() - new Date(timeline[i - 1].date).getTime(),
  }))
  const totalMs = timeline.length > 1
    ? new Date(timeline[timeline.length - 1].date).getTime() - new Date(timeline[0].date).getTime()
    : null
  const isResolved = occurrence.status === 'RESOLVED'

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <Link to="/minhas-ocorrencias" className="text-blue-600 hover:underline text-sm">← Voltar</Link>

      {/* Cabeçalho */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h1 className="text-xl font-bold text-blue-900">{occurrence.title}</h1>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${STATUS_COLORS[occurrence.status]}`}>
            {STATUS_LABELS[occurrence.status]}
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-3">{CATEGORY_LABELS[occurrence.category]}</p>
        <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 mb-4">{occurrence.description}</p>
        <div className="space-y-1 text-sm text-gray-600">
          {occurrence.neighborhood && <div>📍 {occurrence.address ? `${occurrence.address} — ` : ''}{occurrence.neighborhood}</div>}
          <div>👤 {occurrence.user?.name}</div>
          <div>🕐 Registrada em {formatDateTime(occurrence.createdAt)}</div>
        </div>
      </div>

      {/* Foto */}
      {photoUri && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-3">📷 Foto da Ocorrência</h2>
          <img src={photoUri} alt="Foto da ocorrência" className="w-full rounded-xl object-cover max-h-80" />
        </div>
      )}

      {/* Tempo de resposta (SLA) */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-800 mb-3">⏱️ Tempo de Resposta</h2>
        {totalMs !== null ? (
          <div className="bg-gray-50 rounded-xl p-5 text-center">
            <p className="text-xs text-gray-500 mb-1">{isResolved ? 'Tempo total até a resolução' : 'Tempo decorrido desde a abertura'}</p>
            <p className={`text-3xl font-bold ${isResolved ? 'text-green-600' : 'text-yellow-600'}`}>{formatDuration(totalMs)}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">Aguardando primeira ação do órgão responsável.</p>
        )}
      </div>

      {/* Linha do tempo */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-800 mb-4">📜 Linha do Tempo do Atendimento</h2>
        <div className="space-y-0">
          {timelineWithDelta.map((item, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-3.5 h-3.5 rounded-full mt-1 shrink-0" style={{ backgroundColor: DOT_COLORS[item.status] }} />
                {i < timelineWithDelta.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 my-1" />}
              </div>
              <div className="pb-5 flex-1">
                <p className="text-sm font-bold" style={{ color: DOT_COLORS[item.status] }}>{STATUS_LABELS[item.status]}</p>
                <p className="text-xs text-gray-700 mt-0.5">{formatDateTime(item.date)}</p>
                {item.delta !== null && (
                  <p className="text-xs text-yellow-600 font-semibold mt-0.5">⏳ {formatDuration(item.delta)} após a etapa anterior</p>
                )}
                <p className="text-xs text-gray-400 mt-0.5">por {item.by}</p>
                {item.comment && <p className="text-xs text-gray-500 italic mt-1">"{item.comment}"</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Atualizar status — só admin/master */}
      {isAdmin && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">⚙️ Atualizar Status</h2>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Comentário sobre a atualização (opcional)..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm resize-none mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
          <div className="grid grid-cols-2 gap-2">
            {STATUS_FLOW.filter((st) => st !== occurrence.status).map((st) => (
              <button
                key={st}
                onClick={() => updateStatus(st)}
                disabled={updating}
                className="py-2 px-3 rounded-lg border text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
                style={{ borderColor: DOT_COLORS[st], color: DOT_COLORS[st] }}
              >
                → {STATUS_LABELS[st]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
