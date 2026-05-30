// src/app/RegisterPage.tsx
import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { AuthResponse } from '../types'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!consent) {
      setError('Você precisa aceitar a Política de Privacidade para continuar')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('As senhas não coincidem')
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post<AuthResponse>('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
      })
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      navigate('/')
    } catch (err: any) {
      const details = err.response?.data?.details
      setError(details ? details.map((d: any) => d.message).join(', ') : (err.response?.data?.error ?? 'Erro ao criar conta'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏙️</div>
          <h1 className="text-2xl font-bold text-blue-900">Criar Conta</h1>
          <p className="text-gray-500 text-sm mt-1">Cidade Conectada CE — Horizonte</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}
          {[
            { label: 'Nome completo', name: 'name', type: 'text', placeholder: 'Seu nome' },
            { label: 'E-mail', name: 'email', type: 'email', placeholder: 'seu@email.com' },
            { label: 'Telefone (opcional)', name: 'phone', type: 'tel', placeholder: '(85) 99999-0000' },
            { label: 'Senha', name: 'password', type: 'password', placeholder: '••••••••' },
            { label: 'Confirmar senha', name: 'confirmPassword', type: 'password', placeholder: '••••••••' },
          ].map(({ label, name, type, placeholder }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type={type}
                name={name}
                value={(form as any)[name]}
                onChange={handleChange}
                placeholder={placeholder}
                required={name !== 'phone'}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

          <label className="flex items-start gap-2 text-sm text-gray-600 mt-2">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 w-4 h-4"
            />
            <span>
              Li e aceito a{' '}
              <Link to="/privacidade" target="_blank" className="text-blue-700 hover:underline font-medium">
                Política de Privacidade
              </Link>
              {' '}e autorizo o tratamento dos meus dados conforme a LGPD.
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2.5 rounded-lg transition-colors mt-2"
          >
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Já tem conta?{' '}
          <Link to="/login" className="text-blue-700 hover:underline font-medium">Entrar</Link>
        </p>
      </div>
    </div>
  )
}