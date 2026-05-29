import { useEffect, useState, FormEvent } from "react"
import api from "../lib/api"

interface ManagedUser {
  id: string
  name: string
  email: string
  username: string | null
  role: string
  mustChangePassword: boolean
  createdAt: string
  _count?: { occurrences: number }
}

const ROLE_LABELS: Record<string, string> = {
  MASTER: "Master",
  ADMIN: "Administrador",
  CITIZEN: "Cidadao",
}
const ROLE_COLORS: Record<string, string> = {
  MASTER: "bg-purple-100 text-purple-700",
  ADMIN: "bg-blue-100 text-blue-700",
  CITIZEN: "bg-gray-100 text-gray-600",
}

export default function UsersPage() {
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: "", username: "", email: "", tempPassword: "" })
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  async function load() {
    try {
      const { data } = await api.get<ManagedUser[]>("/users")
      setUsers(data)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setError("")
    setSaving(true)
    try {
      await api.post("/users/admin", form)
      setForm({ name: "", username: "", email: "", tempPassword: "" })
      setShowForm(false)
      await load()
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Erro ao criar administrador")
    } finally { setSaving(false) }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remover o usuario "${name}"?`)) return
    try {
      await api.delete(`/users/${id}`)
      await load()
    } catch (err: any) {
      alert(err.response?.data?.error ?? "Erro ao remover")
    }
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Carregando...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Gerenciar Usuarios</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-700 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
        >
          {showForm ? "Cancelar" : "+ Novo Administrador"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Criar novo Administrador</h2>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuario (login)</label>
              <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required
                placeholder="ex: maria.silva"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha temporaria</label>
              <input value={form.tempPassword} onChange={(e) => setForm({ ...form, tempPassword: e.target.value })} required
                placeholder="ex: Prefeitura@123"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <p className="text-xs text-gray-500">O administrador devera trocar a senha no primeiro acesso.</p>
          <button type="submit" disabled={saving}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors">
            {saving ? "Criando..." : "Criar Administrador"}
          </button>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Nome</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Login</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Nivel</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Ocorrencias</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-700">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-800">{u.name}</div>
                  <div className="text-xs text-gray-400">{u.email}</div>
                </td>
                <td className="px-4 py-3 text-gray-600">{u.username ?? "-"}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${ROLE_COLORS[u.role]}`}>
                    {ROLE_LABELS[u.role]}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{u._count?.occurrences ?? 0}</td>
                <td className="px-4 py-3 text-right">
                  {u.role !== "MASTER" && (
                    <button onClick={() => handleDelete(u.id, u.name)}
                      className="text-red-600 hover:text-red-800 text-xs font-medium">
                      Remover
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
