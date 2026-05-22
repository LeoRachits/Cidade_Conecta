// src/app/NewOccurrencePage.tsx
import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { OccurrenceCategory, CATEGORY_LABELS } from '../types'

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [OccurrenceCategory, string][]

export default function NewOccurrencePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '' as OccurrenceCategory,
    address: '',
    neighborhood: '',
    latitude: '',
    longitude: '',
  })
  const [photo, setPhoto] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [locating, setLocating] = useState(false)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function getLocation() {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }))
        setLocating(false)
      },
      () => {
        setError('Não foi possível obter sua localização. Digite manualmente.')
        setLocating(false)
      },
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.category) { setError('Selecione uma categoria'); return }
    if (!form.latitude || !form.longitude) { setError('Informe a localização'); return }

    setLoading(true)
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v) formData.append(k, v) })
      if (photo) formData.append('photo', photo)

      const { data } = await api.post('/occurrences', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      navigate(`/ocorrencias/${data.id}`)
    } catch (err: any) {
      const details = err.response?.data?.details
      setError(details ? details.map((d: any) => d.message).join(', ') : (err.response?.data?.error ?? 'Erro ao registrar ocorrência'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-xl font-bold text-gray-800 mb-6">➕ Nova Ocorrência</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <input
              name="title" value={form.title} onChange={handleChange} required
              placeholder="Ex: Buraco na calçada da Rua das Flores"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
            <select
              name="category" value={form.category} onChange={handleChange} required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione...</option>
              {CATEGORIES.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
            <textarea
              name="description" value={form.description} onChange={handleChange} required
              rows={4} placeholder="Descreva o problema com detalhes..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
              <input
                name="address" value={form.address} onChange={handleChange}
                placeholder="Ex: Rua das Flores, 120"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
              <input
                name="neighborhood" value={form.neighborhood} onChange={handleChange}
                placeholder="Ex: Centro"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Localização */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Localização *</label>
            <button
              type="button" onClick={getLocation} disabled={locating}
              className="w-full border-2 border-dashed border-blue-300 text-blue-700 hover:bg-blue-50 py-3 rounded-lg text-sm font-medium transition-colors mb-3"
            >
              {locating ? '📍 Obtendo localização...' : '📍 Usar minha localização atual'}
            </button>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Latitude</label>
                <input
                  name="latitude" value={form.latitude} onChange={handleChange} required
                  placeholder="-3.8694"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Longitude</label>
                <input
                  name="longitude" value={form.longitude} onChange={handleChange} required
                  placeholder="-38.4983"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Foto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Foto (opcional)</label>
            <input
              type="file" accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700"
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Enviando...' : '✅ Enviar Ocorrência'}
          </button>
        </form>
      </div>
    </div>
  )
}
