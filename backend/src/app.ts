// src/app.ts
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { rateLimiter } from './middleware/rate-limiter'
import { errorHandler } from './middleware/error-handler'
import { authRoutes } from './routes/auth.routes'
import { occurrenceRoutes } from './routes/occurrence.routes'
import { adminRoutes } from './routes/admin.routes'
import { uploadRoutes } from './routes/upload.routes'
import path from 'path'

const app = express()

// ─── Segurança ───────────────────────────────────────────────
app.use(cors({
  origin: process.env.NODE_ENV === 'development'
    ? true
    : (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173').split(','),
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))
app.use(rateLimiter)

// ─── Parsing ─────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ─── Arquivos estáticos (uploads) ────────────────────────────
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

// ─── Rotas ───────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/occurrences', occurrenceRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/upload', uploadRoutes)

// ─── Health check ─────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ─── 404 ──────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' })
})

// ─── Error handler ────────────────────────────────────────────
app.use(errorHandler)

export default app
