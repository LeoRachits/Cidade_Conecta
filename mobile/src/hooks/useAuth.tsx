// mobile/src/hooks/useAuth.tsx
import React, { createContext, useContext, useState, useEffect } from 'react'
import * as SecureStore from 'expo-secure-store'
import api from '../services/api'

interface User {
  id: string; name: string; email: string
  role: 'CITIZEN' | 'ADMIN'
}
interface AuthCtx {
  user: User | null; loading: boolean; isAdmin: boolean
  login(email: string, password: string): Promise<void>
  logout(): Promise<void>
}

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    SecureStore.getItemAsync('accessToken').then(token => {
      if (token) {
        api.get<User>('/auth/me')
          .then(r => setUser(r.data))
          .catch(async () => {
            await SecureStore.deleteItemAsync('accessToken')
            await SecureStore.deleteItemAsync('refreshToken')
          })
          .finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })
  }, [])

  async function login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password })
    await SecureStore.setItemAsync('accessToken', data.accessToken)
    await SecureStore.setItemAsync('refreshToken', data.refreshToken)
    setUser(data.user)
  }

  async function logout() {
    await SecureStore.deleteItemAsync('accessToken')
    await SecureStore.deleteItemAsync('refreshToken')
    setUser(null)
  }

  return (
    <Ctx.Provider value={{ user, loading, isAdmin: user?.role === 'ADMIN', login, logout }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth fora de AuthProvider')
  return ctx
}
