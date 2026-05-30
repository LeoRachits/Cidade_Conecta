// src/components/ui/Layout.tsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function Layout() {
  const { user, logout, isAdmin, isMaster } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="text-2xl">🏙️</span>
            <span>Cidade Conectada CE</span>
          </NavLink>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <NavLink to="/" end className={({ isActive }) =>
              isActive ? 'text-blue-300 border-b-2 border-blue-300 pb-0.5' : 'hover:text-blue-300 transition-colors'
            }>
              🗺️ Mapa
            </NavLink>
            <NavLink to="/nova-ocorrencia" className={({ isActive }) =>
              isActive ? 'text-blue-300 border-b-2 border-blue-300 pb-0.5' : 'hover:text-blue-300 transition-colors'
            }>
              ➕ Nova Ocorrência
            </NavLink>
            <NavLink to="/minhas-ocorrencias" className={({ isActive }) =>
              isActive ? 'text-blue-300 border-b-2 border-blue-300 pb-0.5' : 'hover:text-blue-300 transition-colors'
            }>
              📋 Minhas Ocorrências
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={({ isActive }) =>
                isActive ? 'text-yellow-300 border-b-2 border-yellow-300 pb-0.5' : 'text-yellow-200 hover:text-yellow-300 transition-colors'
              }>
                ⚙️ Painel Admin
              </NavLink>
            )}
            {isMaster && (
              <NavLink to="/usuarios" className={({ isActive }) =>
                isActive ? 'text-purple-300 border-b-2 border-purple-300 pb-0.5' : 'text-purple-200 hover:text-purple-300 transition-colors'
              }>
                👥 Usuários
              </NavLink>
            )}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-blue-200 hidden md:block">Olá, {user?.name.split(' ')[0]}</span>
            <NavLink
              to="/trocar-senha"
              className="text-blue-200 hover:text-white transition-colors hidden md:block"
              title="Alterar senha"
            >
              🔑 Senha
            </NavLink>
            <button
              onClick={handleLogout}
              className="bg-blue-700 hover:bg-blue-600 px-3 py-1.5 rounded-lg transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>
      {/* Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>
      {/* Footer */}
      <footer className="bg-blue-900 text-blue-300 text-center py-3 text-xs mt-auto">
        Cidade Conectada CE © 2026 — Horizonte, CE | Projeto Acadêmico — Desafios do Ciberespaço
      </footer>
    </div>
  )
}
