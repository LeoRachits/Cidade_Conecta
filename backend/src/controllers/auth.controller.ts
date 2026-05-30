import { Request, Response, NextFunction } from "express"
import { z } from "zod"
import * as authService from "../services/auth.service"
import { prisma } from "../config/prisma"
import { AppError } from "../middleware/error-handler"

const registerSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail invalido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres").regex(/[A-Z]/, "Senha deve conter uma maiuscula").regex(/[0-9]/, "Senha deve conter um numero"),
  phone: z.string().optional(),
})

const loginSchema = z.object({
  login: z.string().min(1, "Informe e-mail ou usuario"),
  password: z.string().min(1, "Informe a senha"),
})

const changePasswordSchema = z.object({
  newPassword: z.string().min(8, "Senha deve ter pelo menos 8 caracteres").regex(/[A-Z]/, "Senha deve conter uma maiuscula").regex(/[0-9]/, "Senha deve conter um numero"),
})

const refreshSchema = z.object({ refreshToken: z.string() })

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const input = registerSchema.parse(req.body)
    const result = await authService.register(input)
    res.status(201).json(result)
  } catch (err) { next(err) }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body.login ? req.body : { ...req.body, login: req.body.email }
    const input = loginSchema.parse(body)
    const result = await authService.login(input)
    res.json(result)
  } catch (err) { next(err) }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { newPassword } = changePasswordSchema.parse(req.body)
    await authService.changePassword(req.user!.sub, newPassword)
    res.json({ message: "Senha alterada com sucesso" })
  } catch (err) { next(err) }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = refreshSchema.parse(req.body)
    const tokens = await authService.refreshTokens(refreshToken)
    res.json(tokens)
  } catch (err) { next(err) }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.sub },
      select: { id: true, name: true, email: true, username: true, phone: true, role: true, mustChangePassword: true, avatarUrl: true, createdAt: true, _count: { select: { occurrences: true } } },
    })
    res.json(user)
  } catch (err) { next(err) }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body
    if (!email) throw new AppError("E-mail e obrigatorio", 400)
    await authService.requestPasswordReset(email)
    res.json({ message: "Se o e-mail estiver cadastrado, enviaremos as instrucoes de redefinicao." })
  } catch (err) {
    next(err)
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, password } = req.body
    if (!token || !password) throw new AppError("Token e nova senha sao obrigatorios", 400)
    if (password.length < 8) throw new AppError("A senha deve ter pelo menos 8 caracteres", 400)
    if (!/[A-Z]/.test(password)) throw new AppError("A senha deve ter pelo menos uma letra maiuscula", 400)
    if (!/[0-9]/.test(password)) throw new AppError("A senha deve ter pelo menos um numero", 400)
    await authService.resetPassword(token, password)
    res.json({ message: "Senha redefinida com sucesso. Voce ja pode entrar com a nova senha." })
  } catch (err) {
    next(err)
  }
}

