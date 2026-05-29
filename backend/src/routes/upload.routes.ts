import { Router } from "express"
import multer from "multer"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { cloudinary } from "../config/cloudinary"

const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: "cidade-conectada",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1280, height: 1280, crop: "limit", quality: "auto" }],
  }),
})

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"]
  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error("Apenas imagens JPG, PNG ou WebP sao permitidas"))
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
})

export const uploadRoutes = Router()
uploadRoutes.get("/health", (_req, res) => res.json({ status: "ok" }))
