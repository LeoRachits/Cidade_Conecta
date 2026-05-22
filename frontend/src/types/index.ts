// src/types/index.ts

export type UserRole = 'CITIZEN' | 'ADMIN'

export type OccurrenceStatus =
  | 'OPEN'
  | 'UNDER_REVIEW'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REJECTED'

export type OccurrenceCategory =
  | 'ROAD'
  | 'LIGHTING'
  | 'GARBAGE'
  | 'FLOODING'
  | 'OTHER'

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: UserRole
  avatarUrl?: string
  createdAt: string
  _count?: { occurrences: number }
}

export interface Occurrence {
  id: string
  title: string
  description: string
  category: OccurrenceCategory
  status: OccurrenceStatus
  latitude: number
  longitude: number
  address?: string
  neighborhood?: string
  photoUrl?: string
  userId: string
  createdAt: string
  updatedAt: string
  user?: { id: string; name: string }
  statusHistory?: StatusHistory[]
}

export interface StatusHistory {
  id: string
  occurrenceId: string
  status: OccurrenceStatus
  comment?: string
  createdAt: string
  changedBy: { id: string; name: string; role: UserRole }
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export const CATEGORY_LABELS: Record<OccurrenceCategory, string> = {
  ROAD: '🛣️ Via / Buraco',
  LIGHTING: '💡 Iluminação',
  GARBAGE: '🗑️ Lixo',
  FLOODING: '🌊 Alagamento',
  OTHER: '📌 Outro',
}

export const STATUS_LABELS: Record<OccurrenceStatus, string> = {
  OPEN: 'Aberto',
  UNDER_REVIEW: 'Em análise',
  IN_PROGRESS: 'Em andamento',
  RESOLVED: 'Resolvido',
  REJECTED: 'Rejeitado',
}

export const STATUS_COLORS: Record<OccurrenceStatus, string> = {
  OPEN: 'bg-red-100 text-red-700',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  RESOLVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-gray-100 text-gray-600',
}
