import {
	signup,
	login,
	google,
	sendOTP,
	verifyOTP,
} from "../controllers/authController.js"
import express from "express"

const router = express.Router()

router.post("/signup", signup)
router.post("/login", login)
router.post("/google", google)
router.post("/verifyotp", verifyOTP)
router.post("/sendotp", sendOTP)

export { router as authRoutes }
