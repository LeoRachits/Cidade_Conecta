// src/routes/admin.routes.ts
import { Router } from 'express'
import * as adminController from '../controllers/admin.controller'
import { authenticate, requireAdmin } from '../middleware/auth'

export const adminRoutes = Router()

adminRoutes.use(authenticate, requireAdmin)
adminRoutes.get('/dashboard', adminController.getDashboard)
adminRoutes.get('/reports', adminController.getReport)
