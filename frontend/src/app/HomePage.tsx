// src/app/HomePage.tsx
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Link } from 'react-router-dom'
import L from 'leaflet'
import api from '../lib/api'
import { Occurrence, CATEGORY_LABELS, STATUS_LABELS, STATUS_COLORS } from '../types'
import 'leaflet/dist/leaflet.css'

// Fix leaflet default icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Horizonte - CE coordinates
const CITY_CENTER: [number, number] = [-3.8694, -38.4983]

export default function HomePage() {
  const [occurrences, setOccurrences] = useState<Occurrence[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Occurrence[]>('/occurrences/map')
      .then((res) => setOccurrences(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const stats = {
    total: occurrences.length,
    open: occurrences.filter((o) => o.status === 'OPEN').length,
    resolved: occurrences.filter((o) => o.status === 'RESOLVED').length,
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total de Ocorrências', value: stats.total, color: 'bg-blue-50 border-blue-200 text-blue-800' },
          { label: 'Abertas', value: stats.open, color: 'bg-red-50 border-red-200 text-red-800' },
          { label: 'Resolvidas', value: stats.resolved, color: 'bg-green-50 border-green-200 text-green-800' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`${color} border rounded-xl p-4 text-center`}>
            <div className="text-3xl font-bold">{value}</div>
            <div className="text-sm mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Map */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">🗺️ Mapa de Ocorrências — Horizonte, CE</h2>
          <Link
            to="/nova-ocorrencia"
            className="bg-blue-700 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-blue-800 transition-colors"
          >
            + Nova Ocorrência
          </Link>
        </div>

        {loading ? (
          <div className="h-96 flex items-center justify-center text-gray-400">Carregando mapa...</div>
        ) : (
          <MapContainer center={CITY_CENTER} zoom={14} className="h-96 w-full z-0">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {occurrences.map((occ) => (
              <Marker key={occ.id} position={[occ.latitude, occ.longitude]}>
                <Popup>
                  <div className="min-w-48">
                    <p className="font-semibold text-gray-800 mb-1">{occ.title}</p>
                    <p className="text-xs text-gray-500 mb-2">{CATEGORY_LABELS[occ.category]}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[occ.status]}`}>
                      {STATUS_LABELS[occ.status]}
                    </span>
                    {occ.neighborhood && (
                      <p className="text-xs text-gray-400 mt-2">📍 {occ.neighborhood}</p>
                    )}
                    <Link
                      to={`/ocorrencias/${occ.id}`}
                      className="block mt-3 text-center text-xs bg-blue-700 text-white py-1 rounded-md hover:bg-blue-800"
                    >
                      Ver detalhes
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  )
}
