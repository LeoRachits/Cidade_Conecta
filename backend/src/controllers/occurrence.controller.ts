import { Request, Response, NextFunction } from "express"
import { z } from "zod"
import { OccurrenceCategory, OccurrenceStatus } from "@prisma/client"
import * as occurrenceService from "../services/occurrence.service"

const createSchema = z.object({
  title: z.string().min(5, "Titulo deve ter pelo menos 5 caracteres").max(100),
  description: z.string().min(10, "Descricao muito curta").max(1000),
  category: z.nativeEnum(OccurrenceCategory),
  latitude: z.coerce.number().min(-33).max(5),
  longitude: z.coerce.number().min(-74).max(-34),
  address: z.string().max(200).optional(),
  neighborhood: z.string().max(100).optional(),
})

const listSchema = z.object({
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  status: z.nativeEnum(OccurrenceStatus).optional(),
  category: z.nativeEnum(OccurrenceCategory).optional(),
})

const updateStatusSchema = z.object({
  status: z.nativeEnum(OccurrenceStatus),
  comment: z.string().max(500).optional(),
})

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createSchema.parse(req.body)
    const photoUrl = req.file ? (req.file as any).path : undefined
    const occurrence = await occurrenceService.createOccurrence({
      ...input,
      photoUrl,
      userId: req.user!.sub,
    })
    res.status(201).json(occurrence)
  } catch (err) {
    next(err)
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = listSchema.parse(req.query)
    const result = await occurrenceService.listOccurrences(filters)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function listMine(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = listSchema.parse(req.query)
    const result = await occurrenceService.listOccurrences({
      ...filters,
      userId: req.user!.sub,
    })
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const occurrence = await occurrenceService.getOccurrenceById(req.params.id)
    res.json(occurrence)
  } catch (err) {
    next(err)
  }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, comment } = updateStatusSchema.parse(req.body)
    const occurrence = await occurrenceService.updateOccurrenceStatus({
      occurrenceId: req.params.id,
      status,
      comment,
      adminId: req.user!.sub,
    })
    res.json(occurrence)
  } catch (err) {
    next(err)
  }
}

export async function getMapData(req: Request, res: Response, next: NextFunction) {
  try {
    const occurrences = await occurrenceService.getMapOccurrences()
    res.json(occurrences)
  } catch (err) {
    next(err)
  }
}
