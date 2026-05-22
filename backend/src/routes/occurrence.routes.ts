// src/routes/occurrence.routes.ts
import { Router } from 'express'
import * as occurrenceController from '../controllers/occurrence.controller'
import { authenticate, requireAdmin } from '../middleware/auth'
import { upload } from './upload.routes'

export const occurrenceRoutes = Router()

// Público — mapa
occurrenceRoutes.get('/map', occurrenceController.getMapData)

// Autenticado
occurrenceRoutes.use(authenticate)
occurrenceRoutes.get('/', occurrenceController.list)
occurrenceRoutes.post('/', upload.single('photo'), occurrenceController.create)
occurrenceRoutes.get('/mine', occurrenceController.listMine)
occurrenceRoutes.get('/:id', occurrenceController.getById)

// Admin apenas
occurrenceRoutes.patch('/:id/status', requireAdmin, occurrenceController.updateStatus)
