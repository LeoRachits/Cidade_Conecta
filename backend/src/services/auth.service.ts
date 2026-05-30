import crypto from "crypto"
import { sendPasswordResetEmail } from "./email.service"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { prisma } from "../config/prisma"
import { AppError } from "../middleware/error-handler"
import { UserRole } from "@prisma/client"
import { JwtPayload } from "../middleware/auth"

interface RegisterInput {
  name: string
  email: string
  password: string
  phone?: string
}

interface LoginInput {
  login: string
  password: string
}

function generateTokens(userId: string, email: string, role: UserRole) {
  const payload: JwtPayload = { sub: userId, email, role }
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? "1h") as any,
  })
  const refreshToken = jwt.sign(
    { sub: userId },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ?? "7d") as any },
  )
  return { accessToken, refreshToken }
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } })
  if (existing) throw new AppError("E-mail ja cadastrado", 409)
  const hashedPassword = await bcrypt.hash(input.password, 12)
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashedPassword,
      phone: input.phone,
      role: UserRole.CITIZEN,
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true, mustChangePassword: true },
  })
  const tokens = generateTokens(user.id, user.email, user.role)
  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })
  return { user, ...tokens }
}

export async function login(input: LoginInput) {
  const loginValue = input.login.trim()
  const user = await prisma.user.findFirst({
    where: {
      deletedAt: null,
      OR: [
        { email: loginValue.toLowerCase() },
        { username: loginValue },
      ],
    },
  })
  if (!user) throw new AppError("Usuario ou senha incorretos", 401)
  const passwordMatch = await bcrypt.compare(input.password, user.password)
  if (!passwordMatch) throw new AppError("Usuario ou senha incorretos", 401)

  const tokens = generateTokens(user.id, user.email, user.role)
  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    },
    ...tokens,
  }
}

export async function changePassword(userId: string, newPassword: string) {
  const hashedPassword = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword, mustChangePassword: false },
  })
}

export async function refreshTokens(refreshToken: string) {
  try {
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string)
  } catch {
    throw new AppError("Refresh token invalido", 401)
  }
  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  })
  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw new AppError("Refresh token expirado ou revogado", 401)
  }
  await prisma.refreshToken.update({
    where: { token: refreshToken },
    data: { revokedAt: new Date() },
  })
  const tokens = generateTokens(stored.user.id, stored.user.email, stored.user.role)
  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: stored.user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })
  return tokens
}

// ─── Recuperacao de senha ───────────────────────────────────────

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findFirst({
    where: { email: email.trim().toLowerCase(), deletedAt: null },
  })
  // Por seguranca, sempre retorna sucesso (nao revela se o e-mail existe)
  if (!user) return

  const token = crypto.randomBytes(32).toString("hex")
  await prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hora
    },
  })

  const resetUrl = `${process.env.APP_URL ?? "http://localhost:5173"}/redefinir-senha?token=${token}`
  await sendPasswordResetEmail(user.email, user.name, resetUrl)
}

export async function resetPassword(token: string, newPassword: string) {
  const record = await prisma.passwordResetToken.findUnique({ where: { token } })
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    throw new AppError("Link de redefinicao invalido ou expirado", 400)
  }
  const hashedPassword = await bcrypt.hash(newPassword, 12)
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { password: hashedPassword, mustChangePassword: false },
    }),
    prisma.passwordResetToken.update({
      where: { token },
      data: { usedAt: new Date() },
    }),
  ])
}

