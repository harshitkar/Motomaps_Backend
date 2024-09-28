import { verifyToken } from "../controllers/authController.js"
import { updateUser, deleteUser, signout } from "../controllers/userController.js"
import express from "express"

const router = express.Router()

router.post("/update/:id", verifyToken, updateUser)
router.delete("/delete/:id", verifyToken, deleteUser)
router.get("/signout", verifyToken, signout)

export { router as userRoutes }
