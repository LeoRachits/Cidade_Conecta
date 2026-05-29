import { Router } from "express"
import * as userController from "../controllers/user.controller"
import { authenticate } from "../middleware/auth"
import { Request, Response, NextFunction } from "express"
import { AppError } from "../middleware/error-handler"

function requireMaster(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) throw new AppError("Nao autenticado", 401)
  if (req.user.role !== "MASTER") throw new AppError("Acesso restrito ao MASTER", 403)
  next()
}

export const userRoutes = Router()

userRoutes.use(authenticate, requireMaster)
userRoutes.get("/", userController.listUsers)
userRoutes.post("/admin", userController.createAdmin)
userRoutes.delete("/:id", userController.deleteUser)
