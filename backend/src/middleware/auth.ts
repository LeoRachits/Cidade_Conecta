// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { AppError } from "./error-handler"
import { UserRole } from "@prisma/client"

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
  if (!authHeader?.startsWith("Bearer ")) {
    throw new AppError("Token de autenticacao nao fornecido", 401)
  }
  const token = authHeader.slice(7)
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
    req.user = payload
    next()
  } catch {
    throw new AppError("Token invalido ou expirado", 401)
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) throw new AppError("Nao autenticado", 401)
  if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.MASTER) {
    throw new AppError("Acesso negado: apenas administradores", 403)
  }
  next()
}

export function requireMaster(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) throw new AppError("Nao autenticado", 401)
  if (req.user.role !== UserRole.MASTER) {
    throw new AppError("Acesso negado: apenas o administrador master", 403)
  }
  next()
}
