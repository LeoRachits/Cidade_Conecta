// src/app/ForgotPasswordPage.tsx
import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Erro ao enviar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔑</div>
          <h1 className="text-2xl font-bold text-blue-900">Recuperar Senha</h1>
          <p className="text-gray-500 text-sm mt-1">Cidade Conectada CE</p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-4 rounded-lg text-sm">
              ✅ Se o e-mail informado estiver cadastrado, enviamos um link para redefinir sua senha. Verifique sua caixa de entrada (e a pasta de spam).
            </div>
            <Link to="/login" className="text-blue-700 hover:underline font-medium text-sm inline-block">
              ← Voltar para o login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}
            <p className="text-sm text-gray-600">
              Digite o e-mail cadastrado na sua conta. Enviaremos um link para você criar uma nova senha.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Enviando...' : 'Enviar link de recuperação'}
            </button>
            <p className="text-center text-sm text-gray-500">
              <Link to="/login" className="text-blue-700 hover:underline font-medium">← Voltar para o login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
