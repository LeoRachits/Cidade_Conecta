// src/routes/upload.routes.ts
import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { v4 as uuid } from 'crypto'
import fs from 'fs'

const uploadDir = process.env.UPLOAD_DIR ?? './uploads'
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`)
  },
})

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp']
  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Apenas imagens JPG, PNG ou WebP são permitidas'))
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: (parseInt(process.env.UPLOAD_MAX_SIZE_MB ?? '5')) * 1024 * 1024,
  },
})

export const uploadRoutes = Router()
// Rota de teste de upload (uso interno)
uploadRoutes.get('/health', (_req, res) => res.json({ status: 'ok' }))
