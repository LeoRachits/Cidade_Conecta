// src/app/AdminDashboardPage.tsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { Occurrence, CATEGORY_LABELS, STATUS_LABELS, STATUS_COLORS } from '../types'

interface DashboardData {
  summary: {
    total: number
    open: number
    underReview: number
    inProgress: number
    resolved: number
    rejected: number
    resolutionRate: number
    totalUsers: number
    totalCitizens: number
    totalAdmins: number
    avgResolutionMs: number
  }
  byCategory: { category: string; count: number }[]
  recentOccurrences: Occurrence[]
}

function formatDuration(ms: number): string {
  if (!ms || ms <= 0) return '—'
  const min = Math.floor(ms / 60000)
  const h = Math.floor(min / 60)
  const d = Math.floor(h / 24)
  if (d > 0) return `${d}d ${h % 24}h`
  if (h > 0) return `${h}h ${min % 60}min`
  return `${min}min`
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<DashboardData>('/admin/dashboard')
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-20 text-gray-400">Carregando painel...</div>
  if (!data) return <div className="text-center py-20 text-red-400">Erro ao carregar dados</div>

  const summaryCards = [
    { label: 'Total Ocorrências', value: data.summary.total, color: 'bg-gray-50 border-gray-200 text-gray-800' },
    { label: 'Abertos', value: data.summary.open, color: 'bg-red-50 border-red-200 text-red-800' },
    { label: 'Em análise', value: data.summary.underReview, color: 'bg-yellow-50 border-yellow-200 text-yellow-800' },
    { label: 'Em andamento', value: data.summary.inProgress, color: 'bg-blue-50 border-blue-200 text-blue-800' },
    { label: 'Resolvidos', value: data.summary.resolved, color: 'bg-green-50 border-green-200 text-green-800' },
    { label: 'Taxa Resolução', value: `${data.summary.resolutionRate}%`, color: 'bg-purple-50 border-purple-200 text-purple-800' },
    { label: '👥 Usuários', value: data.summary.totalUsers, color: 'bg-indigo-50 border-indigo-200 text-indigo-800' },
    { label: 'Cidadãos', value: data.summary.totalCitizens, color: 'bg-teal-50 border-teal-200 text-teal-800' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">⚙️ Painel Administrativo</h1>

      {/* Card destacado: Tempo médio de resolução (SLA) */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl p-6 text-white flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-blue-100 text-sm">⏱️ Tempo Médio de Resolução</p>
          <p className="text-4xl font-bold mt-1">{formatDuration(data.summary.avgResolutionMs)}</p>
          <p className="text-blue-200 text-xs mt-1">
            Média entre a abertura e a resolução das {data.summary.resolved} ocorrência(s) resolvida(s)
          </p>
        </div>
        <div className="text-right">
          <p className="text-blue-100 text-sm">Taxa de Resolução</p>
          <p className="text-4xl font-bold mt-1">{data.summary.resolutionRate}%</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        {summaryCards.map(({ label, value, color }) => (
          <div key={label} className={`${color} border rounded-xl p-3 text-center`}>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* By Category */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-800 mb-4">📊 Ocorrências por Categoria</h2>
        <div className="space-y-3">
          {data.byCategory.map(({ category, count }) => {
            const pct = data.summary.total > 0 ? Math.round((count / data.summary.total) * 100) : 0
            return (
              <div key={category} className="flex items-center gap-3">
                <div className="w-36 text-sm text-gray-600 shrink-0">
                  {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] ?? category}
                </div>
                <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <div className="text-sm font-medium text-gray-700 w-16 text-right">{count} ({pct}%)</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent occurrences */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">🕐 Ocorrências Recentes</h2>
        </div>
        <div className="space-y-2">
          {data.recentOccurrences.map((occ) => (
            <Link
              key={occ.id}
              to={`/ocorrencias/${occ.id}`}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{occ.title}</p>
                <p className="text-xs text-gray-500">
                  {CATEGORY_LABELS[occ.category] ?? occ.category} · {occ.user?.name ?? ''}
                </p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ml-3 ${STATUS_COLORS[occ.status]}`}>
                {STATUS_LABELS[occ.status]}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
