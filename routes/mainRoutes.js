import { verifyToken } from "../controllers/authController.js"
import { checkAuth } from "../controllers/mainController.js"
import express from "express"

const router = express.Router()

router.get("/checkauth", verifyToken, checkAuth)

export { router as mainRoutes }
