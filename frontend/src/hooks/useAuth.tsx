// src/hooks/useAuth.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import api from '../lib/api'
import { User, AuthResponse } from '../types'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (login: string, password: string) => Promise<User>
  logout: () => void
  refreshUser: () => Promise<void>
  isAdmin: boolean
  isMaster: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      api.get<User>('/auth/me')
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  async function login(loginValue: string, password: string): Promise<User> {
    const { data } = await api.post<AuthResponse>('/auth/login', { login: loginValue, password })
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    setUser(data.user)
    return data.user
  }

  async function refreshUser() {
    const { data } = await api.get<User>('/auth/me')
    setUser(data)
  }

  function logout() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      refreshUser,
      isAdmin: user?.role === 'ADMIN' || user?.role === 'MASTER',
      isMaster: user?.role === 'MASTER',
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}