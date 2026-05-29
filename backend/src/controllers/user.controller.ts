import { Request, Response, NextFunction } from "express"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "../config/prisma"
import { AppError } from "../middleware/error-handler"

const createAdminSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  username: z.string().min(3, "Usuario deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail invalido"),
  tempPassword: z.string().min(6, "Senha temporaria deve ter pelo menos 6 caracteres"),
})

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, email: true, username: true,
        role: true, mustChangePassword: true, createdAt: true,
        _count: { select: { occurrences: true } },
      },
    })
    res.json(users)
  } catch (err) { next(err) }
}

export async function createAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createAdminSchema.parse(req.body)
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: input.email.toLowerCase() }, { username: input.username }] },
    })
    if (existing) throw new AppError("E-mail ou usuario ja cadastrado", 409)
    const hashed = await bcrypt.hash(input.tempPassword, 12)
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        username: input.username,
        password: hashed,
        role: "ADMIN",
        mustChangePassword: true,
      },
      select: { id: true, name: true, email: true, username: true, role: true },
    })
    res.status(201).json(user)
  } catch (err) { next(err) }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    if (id === req.user!.sub) throw new AppError("Voce nao pode remover a si mesmo", 400)
    const target = await prisma.user.findUnique({ where: { id } })
    if (!target) throw new AppError("Usuario nao encontrado", 404)
    if (target.role === "MASTER") throw new AppError("Nao e possivel remover um MASTER", 403)
    await prisma.user.update({ where: { id }, data: { deletedAt: new Date() } })
    res.json({ message: "Usuario removido" })
  } catch (err) { next(err) }
}
