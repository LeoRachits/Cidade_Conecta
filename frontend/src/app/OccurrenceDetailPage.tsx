// src/app/OccurrenceDetailPage.tsx
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../lib/api'
import { Occurrence, CATEGORY_LABELS, STATUS_LABELS, STATUS_COLORS, OccurrenceStatus } from '../types'
import { useAuth } from '../hooks/useAuth'

const STATUS_FLOW: OccurrenceStatus[] = ['OPEN', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED']

export default function OccurrenceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { isAdmin } = useAuth()
  const [occurrence, setOccurrence] = useState<Occurrence | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [comment, setComment] = useState('')

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
      const { data } = await api.patch<Occurrence>(`/occurrences/${id}/status`, { status, comment })
      setOccurrence(data)
      setComment('')
      // Reload to get updated history
      const refreshed = await api.get<Occurrence>(`/occurrences/${id}`)
      setOccurrence(refreshed.data)
    } catch (err: any) {
      alert(err.response?.data?.error ?? 'Erro ao atualizar status')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Carregando...</div>
  if (!occurrence) return <div className="text-center py-20 text-red-400">Ocorrência não encontrada</div>

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <Link to="/minhas-ocorrencias" className="text-blue-600 hover:underline text-sm">← Voltar</Link>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-xl font-bold text-gray-800">{occurrence.title}</h1>
          <span className={`shrink-0 text-sm px-3 py-1 rounded-full font-medium ${STATUS_COLORS[occurrence.status]}`}>
            {STATUS_LABELS[occurrence.status]}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
          <div>📂 {CATEGORY_LABELS[occurrence.category]}</div>
          {occurrence.neighborhood && <div>📍 {occurrence.neighborhood}</div>}
          {occurrence.address && <div>🏠 {occurrence.address}</div>}
          <div>🕐 {new Date(occurrence.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
          <div>👤 {occurrence.user?.name}</div>
        </div>

        <p className="text-gray-700 bg-gray-50 rounded-lg p-4 text-sm leading-relaxed">
          {occurrence.description}
        </p>

        {occurrence.photoUrl && (
  <img
    src={occurrence.photoUrl.startsWith('http')
      ? occurrence.photoUrl
      : `${import.meta.env.VITE_API_URL?.replace('/api', '')}${occurrence.photoUrl}`}
    alt="Foto da ocorrência"
    className="mt-4 rounded-xl w-full object-cover max-h-64"
  />
)}
      </div>

      {/* Admin: Atualizar status */}
      {isAdmin && (
        <div className="bg-white rounded-2xl border border-yellow-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">⚙️ Atualizar Status</h2>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Comentário sobre a atualização (opcional)..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm resize-none mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
          <div className="grid grid-cols-2 gap-2">
            {STATUS_FLOW.filter((s) => s !== occurrence.status).map((s) => (
              <button
                key={s}
                onClick={() => updateStatus(s)}
                disabled={updating}
                className="py-2 px-3 rounded-lg border text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
              >
                → {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Histórico de status */}
      {occurrence.statusHistory && occurrence.statusHistory.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">📜 Histórico de Atualizações</h2>
          <div className="space-y-3">
            {occurrence.statusHistory.map((h) => (
              <div key={h.id} className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Status alterado para:{' '}
                    <span className="font-semibold">{STATUS_LABELS[h.status]}</span>
                  </p>
                  {h.comment && <p className="text-sm text-gray-500 mt-0.5">"{h.comment}"</p>}
                  <p className="text-xs text-gray-400 mt-0.5">
                    por {h.changedBy.name} · {new Date(h.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
