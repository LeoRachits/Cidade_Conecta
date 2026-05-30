import { Router } from "express"
import * as authController from "../controllers/auth.controller"
import { authenticate } from "../middleware/auth"
import { authRateLimiter } from "../middleware/rate-limiter"

export const authRoutes = Router()

authRoutes.post("/register", authRateLimiter, authController.register)
authRoutes.post("/login", authRateLimiter, authController.login)
authRoutes.post("/refresh", authController.refresh)
authRoutes.post("/change-password", authenticate, authController.changePassword)
authRoutes.get("/me", authenticate, authController.me)
authRoutes.post("/forgot-password", authRateLimiter, authController.forgotPassword)
authRoutes.post("/reset-password", authRateLimiter, authController.resetPassword)
