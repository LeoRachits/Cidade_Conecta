// src/routes/auth.routes.ts
import { Router } from 'express'
import * as authController from '../controllers/auth.controller'
import { authenticate } from '../middleware/auth'
import { authRateLimiter } from '../middleware/rate-limiter'

export const authRoutes = Router()

authRoutes.post('/register', authRateLimiter, authController.register)
authRoutes.post('/login', authRateLimiter, authController.login)
authRoutes.post('/refresh', authController.refresh)
authRoutes.get('/me', authenticate, authController.me)
