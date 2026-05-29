import express from "express"
import cors from "cors"
import { rateLimiter } from "./middleware/rate-limiter"
import { errorHandler } from "./middleware/error-handler"
import { authRoutes } from "./routes/auth.routes"
import { occurrenceRoutes } from "./routes/occurrence.routes"
import { adminRoutes } from "./routes/admin.routes"
import { uploadRoutes } from "./routes/upload.routes"
import { userRoutes } from "./routes/user.routes"
import path from "path"

const app = express()

app.use(cors({
  origin: process.env.NODE_ENV === "development"
    ? true
    : (process.env.ALLOWED_ORIGINS ?? "http://localhost:5173").split(","),
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}))
app.use(rateLimiter)

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")))

app.use("/api/auth", authRoutes)
app.use("/api/occurrences", occurrenceRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/upload", uploadRoutes)
app.use("/api/users", userRoutes)

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

app.use((_req, res) => {
  res.status(404).json({ error: "Rota nao encontrada" })
})

app.use(errorHandler)

export default app
