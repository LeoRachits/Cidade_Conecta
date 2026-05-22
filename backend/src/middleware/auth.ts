// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AppError } from './error-handler'
import { UserRole } from '@prisma/client'

export interface JwtPayload {
  sub: string
  email: string
  role: UserRole
  iat?: number
  exp?: number
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('Token de autenticação não fornecido', 401)
  }

  const token = authHeader.slice(7)
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
    req.user = payload
    next()
  } catch {
    throw new AppError('Token inválido ou expirado', 401)
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) throw new AppError('Não autenticado', 401)
  if (req.user.role !== UserRole.ADMIN) {
    throw new AppError('Acesso negado: apenas administradores', 403)
  }
  next()
}
