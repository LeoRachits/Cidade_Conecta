// src/services/occurrence.service.ts
import { OccurrenceCategory, OccurrenceStatus } from '@prisma/client'
import { prisma } from '../config/prisma'
import { AppError } from '../middleware/error-handler'

interface CreateOccurrenceInput {
  title: string
  description: string
  category: OccurrenceCategory
  latitude: number
  longitude: number
  address?: string
  neighborhood?: string
  photoUrl?: string
  userId: string
}

interface ListOccurrencesInput {
  page?: number
  limit?: number
  status?: OccurrenceStatus
  category?: OccurrenceCategory
  userId?: string
}

interface UpdateStatusInput {
  occurrenceId: string
  status: OccurrenceStatus
  comment?: string
  adminId: string
}

export async function createOccurrence(input: CreateOccurrenceInput) {
  return prisma.occurrence.create({
    data: input,
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  })
}

export async function listOccurrences(filters: ListOccurrencesInput) {
  const page = filters.page ?? 1
  const limit = Math.min(filters.limit ?? 20, 100)
  const skip = (page - 1) * limit

  const where = {
    ...(filters.status && { status: filters.status }),
    ...(filters.category && { category: filters.category }),
    ...(filters.userId && { userId: filters.userId }),
  }

  const [occurrences, total] = await prisma.$transaction([
    prisma.occurrence.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true } },
        _count: { select: { statusHistory: true } },
      },
    }),
    prisma.occurrence.count({ where }),
  ])

  return {
    data: occurrences,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function getOccurrenceById(id: string) {
  const occurrence = await prisma.occurrence.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true } },
      statusHistory: {
        orderBy: { createdAt: 'desc' },
        include: {
          changedBy: { select: { id: true, name: true, role: true } },
        },
      },
    },
  })

  if (!occurrence) throw new AppError('Ocorrência não encontrada', 404)
  return occurrence
}

export async function updateOccurrenceStatus(input: UpdateStatusInput) {
  const occurrence = await prisma.occurrence.findUnique({ where: { id: input.occurrenceId } })
  if (!occurrence) throw new AppError('Ocorrência não encontrada', 404)

  const [updated] = await prisma.$transaction([
    prisma.occurrence.update({
      where: { id: input.occurrenceId },
      data: { status: input.status },
    }),
    prisma.statusHistory.create({
      data: {
        occurrenceId: input.occurrenceId,
        status: input.status,
        comment: input.comment,
        changedById: input.adminId,
      },
    }),
  ])

  return updated
}

export async function getMapOccurrences() {
  return prisma.occurrence.findMany({
    where: { status: { not: OccurrenceStatus.REJECTED } },
    select: {
      id: true,
      title: true,
      category: true,
      status: true,
      // Arredonda coordenadas para nível de quarteirão (privacidade LGPD)
      latitude: true,
      longitude: true,
      neighborhood: true,
      createdAt: true,
    },
  })
}
