// src/services/occurrence.service.ts
import { OccurrenceCategory, OccurrenceStatus } from '@prisma/client'
import { prisma } from '../config/prisma'
import { AppError } from '../middleware/error-handler'
import {
  sendNewOccurrenceNotifications,
  notifyCitizenStatusUpdate,
  OccurrenceEmailData,
} from './email.service'

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

// Monta o objeto de dados para os templates de e-mail
function toEmailData(occurrence: any): OccurrenceEmailData {
  return {
    id: occurrence.id,
    title: occurrence.title,
    description: occurrence.description,
    category: occurrence.category,
    status: occurrence.status,
    latitude: occurrence.latitude,
    longitude: occurrence.longitude,
    address: occurrence.address ?? undefined,
    neighborhood: occurrence.neighborhood ?? undefined,
    photoUrl: occurrence.photoUrl ?? undefined,
    createdAt: occurrence.createdAt,
    citizen: {
      name: occurrence.user?.name ?? 'Cidadao',
      email: occurrence.user?.email ?? '',
      phone: occurrence.user?.phone ?? undefined,
    },
  }
}

export async function createOccurrence(input: CreateOccurrenceInput) {
  const occurrence = await prisma.occurrence.create({
    data: input,
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
    },
  })

  // Dispara e-mails em segundo plano (nao bloqueia a resposta nem quebra se falhar)
  sendNewOccurrenceNotifications(toEmailData(occurrence)).catch((err) => {
    console.error('Falha ao enviar e-mails de nova ocorrencia:', err)
  })

  return occurrence
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
  if (!occurrence) throw new AppError('Ocorrencia nao encontrada', 404)
  return occurrence
}

export async function updateOccurrenceStatus(input: UpdateStatusInput) {
  const occurrence = await prisma.occurrence.findUnique({ where: { id: input.occurrenceId } })
  if (!occurrence) throw new AppError('Ocorrencia nao encontrada', 404)

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

  // Notifica o cidadao sobre a mudanca de status (em segundo plano)
  const full = await prisma.occurrence.findUnique({
    where: { id: input.occurrenceId },
    include: { user: { select: { name: true, email: true, phone: true } } },
  })
  if (full) {
    notifyCitizenStatusUpdate(toEmailData(full), input.status, input.comment).catch((err) => {
      console.error('Falha ao enviar e-mail de atualizacao de status:', err)
    })
  }

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
      latitude: true,
      longitude: true,
      neighborhood: true,
      createdAt: true,
    },
  })
}
