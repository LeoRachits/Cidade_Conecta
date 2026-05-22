// src/app/MyOccurrencesPage.tsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { Occurrence, PaginatedResponse, CATEGORY_LABELS, STATUS_LABELS, STATUS_COLORS } from '../types'

export default function MyOccurrencesPage() {
  const [data, setData] = useState<PaginatedResponse<Occurrence> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<PaginatedResponse<Occurrence>>('/occurrences/mine?limit=20')
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-20 text-gray-400">Carregando...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">📋 Minhas Ocorrências</h1>
        <Link
          to="/nova-ocorrencia"
          className="bg-blue-700 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
        >
          + Nova
        </Link>
      </div>

      {data?.data.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-gray-500 mb-4">Você ainda não registrou nenhuma ocorrência.</p>
          <Link to="/nova-ocorrencia" className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors">
            Registrar primeira ocorrência
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {data?.data.map((occ) => (
            <Link
              key={occ.id}
              to={`/ocorrencias/${occ.id}`}
              className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{occ.title}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {CATEGORY_LABELS[occ.category]}
                    {occ.neighborhood && <> · 📍 {occ.neighborhood}</>}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(occ.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </p>
                </div>
                <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[occ.status]}`}>
                  {STATUS_LABELS[occ.status]}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {data && data.meta.totalPages > 1 && (
        <p className="text-center text-sm text-gray-400 mt-4">
          Mostrando {data.data.length} de {data.meta.total} ocorrências
        </p>
      )}
    </div>
  )
}
