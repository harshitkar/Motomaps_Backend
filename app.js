import express from "express"
import bodyParser from "body-parser"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import cors from "cors"
import { userRoutes } from "./routes/userRoutes.js"
import { authRoutes } from "./routes/authRoutes.js"
import { mainRoutes } from "./routes/mainRoutes.js"
import { tripRoutes } from "./routes/tripRoutes.js"
import { deleteExpiredOTPs } from "./controllers/authController.js"
import cron from "node-cron"

dotenv.config()

const app = express()

app.use((req, res, next) => {
	res.setHeader("Cross-Origin-Opener-Policy", "same-origin")
	next()
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(
	cors({
		credentials: true,
		origin: ["http://localhost:5173", "https://motomaps.vercel.app"],
	}),
)

app.use(cookieParser())

app.get("/", (req, res) => {
	res.json({ msg: "OK" })
})

app.use("/", mainRoutes)
app.use("/trip", tripRoutes)
app.use("/users", userRoutes)
app.use("/auth", authRoutes)

cron.schedule("*/10 * * * *", async () => {
	console.log("Running cleanup job to remove expired OTPs")
	try {
		await deleteExpiredOTPs()
		console.log("Expired OTPs removed")
	} catch (error) {
		console.error("Error during OTP cleanup:", error)
	}
})

app.listen(process.env.PORT, () => {
	console.log(`Listening on port ${process.env.PORT}`)
})
