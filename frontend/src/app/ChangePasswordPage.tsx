// src/app/ChangePasswordPage.tsx
import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../hooks/useAuth'

export default function ChangePasswordPage() {
  const { refreshUser } = useAuth()
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (newPassword !== confirm) { setError('As senhas não coincidem'); return }
    if (newPassword.length < 8) { setError('A senha deve ter pelo menos 8 caracteres'); return }
    if (!/[A-Z]/.test(newPassword)) { setError('A senha deve ter pelo menos uma letra maiúscula'); return }
    if (!/[0-9]/.test(newPassword)) { setError('A senha deve ter pelo menos um número'); return }

    setLoading(true)
    try {
      await api.post('/auth/change-password', { newPassword })
      await refreshUser()
      navigate('/')
    } catch (err: any) {
      const details = err.response?.data?.details
      setError(details ? details.map((d: any) => d.message).join(', ') : (err.response?.data?.error ?? 'Erro ao trocar senha'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🔐</div>
          <h1 className="text-2xl font-bold text-blue-900">Defina sua nova senha</h1>
          <p className="text-gray-500 text-sm mt-2">Por segurança, você precisa criar uma senha pessoal no primeiro acesso.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nova senha</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Mín. 8 caracteres, 1 maiúscula, 1 número"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar nova senha</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            {loading ? 'Salvando...' : 'Salvar nova senha'}
          </button>
        </form>
      </div>
    </div>
  )
}