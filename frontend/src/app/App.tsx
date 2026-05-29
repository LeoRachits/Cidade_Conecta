// src/app/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '../hooks/useAuth'
import LoginPage from './LoginPage'
import RegisterPage from './RegisterPage'
import ChangePasswordPage from './ChangePasswordPage'
import HomePage from './HomePage'
import NewOccurrencePage from './NewOccurrencePage'
import MyOccurrencesPage from './MyOccurrencesPage'
import OccurrenceDetailPage from './OccurrenceDetailPage'
import AdminDashboardPage from './AdminDashboardPage'
import Layout from '../components/ui/Layout'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-500">Carregando...</div>
  if (!user) return <Navigate to="/login" replace />
  if (user.mustChangePassword) return <Navigate to="/trocar-senha" replace />
  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-500">Carregando...</div>
  if (!user) return <Navigate to="/login" replace />
  if (user.mustChangePassword) return <Navigate to="/trocar-senha" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return <>{children}</>
}

function ChangePasswordRoute() {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-500">Carregando...</div>
  if (!user) return <Navigate to="/login" replace />
  return <ChangePasswordPage />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
      <Route path="/trocar-senha" element={<ChangePasswordRoute />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<HomePage />} />
        <Route path="nova-ocorrencia" element={<NewOccurrencePage />} />
        <Route path="minhas-ocorrencias" element={<MyOccurrencesPage />} />
        <Route path="ocorrencias/:id" element={<OccurrenceDetailPage />} />
        <Route path="admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
