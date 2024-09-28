import * as db from "../db/index.js"
import { v4 as uuidv4 } from "uuid"
import bcryptjs from "bcryptjs"
import validator from "validator"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { sendMail } from "../utils/sendEmail.js"
import otpGenerator from "otp-generator"
dotenv.config()

const signup = async (req, res) => {
	try {
		const userId = uuidv4()
		const { username, email, password, firstname, lastname } = req.body

		if (!validator.isEmail(email)) {
			return res.status(401).json({ error: "please enter a valid email address" })
		}

		if (!validator.isStrongPassword(password)) {
			return res.status(401).json({ error: "Please choose a stronger password" })
		}
		const hashedPass = bcryptjs.hashSync(password, 10)

		const currentDate = new Date()
		const formattedDate = currentDate.toISOString().split("T")[0]

		const text =
			"INSERT INTO users(user_id,username,email,password,first_name,last_name,profile_pic,last_login) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *"
		const values = [
			userId,
			username,
			email,
			hashedPass,
			firstname,
			lastname,
			"https://firebasestorage.googleapis.com/v0/b/motomaps-auth.appspot.com/o/default.jpg?alt=media&token=7179c69c-498a-4020-8408-324b95dd9a79",
			formattedDate,
		]

		const checkUsernameText = "SELECT * FROM users WHERE username = $1;"
		const checkUsernameValues = [username]
		const { rows: usernamerows } = await db.query(
			checkUsernameText,
			checkUsernameValues,
		)
		if (usernamerows[0]) {
			return res.status(401).json({
				error: "Username already exists, please select a different username",
			})
		}

		const { rows } = await db.query(text, values)

		const token = jwt.sign({ id: `${rows[0].user_id}` }, process.env.JWT_SECRET, {
			expiresIn: "48h",
		})

		const { password: hashedPassword, ...rest } = rows[0]

		return res
			.cookie("access_token", token, {
				path: "/",
				expires: new Date(Date.now() + 1000 * 60 * 60 * 48),
				httpOnly: true,
				sameSite: "none",
				secure: true,
			})
			.status(200)
			.json(rest)
	} catch (err) {
		res.status(500).json({ error: "Unexpected error occurred, signup failed" })
	}
}
const login = async (req, res) => {
	const { email, password } = req.body
	const text = "SELECT * FROM users WHERE email = $1;"
	const values = [email]
	if (!validator.isEmail(email)) {
		return res.status(401).json({ error: "please enter a valid email address" })
	}

	try {
		const { rows } = await db.query(text, values)
		if (!rows[0]) {
			return res.status(404).json({ error: "User not found" })
		}
		const validPassword = bcryptjs.compareSync(password, rows[0].password)
		if (!validPassword) {
			return res.status(401).json({ error: "Invalid credentials" })
		}

		const token = jwt.sign({ id: `${rows[0].user_id}` }, process.env.JWT_SECRET, {
			expiresIn: "48h",
		})

		const { password: hashedPassword, ...rest } = rows[0]

		return res
			.cookie("access_token", token, {
				path: "/",
				expires: new Date(Date.now() + 1000 * 60 * 60 * 48),
				httpOnly: true,
				sameSite: "none",
				secure: true,
			})
			.status(200)
			.json(rest)
	} catch (err) {
		res.status(500).json({ error: "Unexpected error occurred, login failed" })
	}
}

const verifyToken = (req, res, next) => {
	try {
		const cookies = req.headers.cookie

		const jwttoken = cookies
			.split(";")
			.find((cookie) => cookie.trim().startsWith("access_token="))
		const token = jwttoken.split("=")[1]

		if (!token) {
			return res.status(404).json({ message: "No token found" })
		}
		const user = jwt.verify(token, process.env.JWT_SECRET)

		req.id = user.id

		next()
	} catch (e) {
		res.status(500).json({ message: "Token verification failed" })
	}
}

const google = async (req, res) => {
	try {
		const { email } = req.body
		const text = "SELECT * FROM users WHERE email = $1;"
		const values = [email]
		const { rows } = await db.query(text, values)

		if (rows[0]) {
			const token = jwt.sign(
				{ id: `${rows[0].user_id}` },
				process.env.JWT_SECRET,
				{
					expiresIn: "48h",
				},
			)
			const { password: hashedPassword, ...rest } = rows[0]

			return res
				.cookie("access_token", token, {
					path: "/",
					expires: new Date(Date.now() + 1000 * 60 * 60 * 48),
					httpOnly: true,
					sameSite: "none",
					secure: true,
				})
				.status(200)
				.json(rest)
		} else {
			const generatedPassword =
				Math.random().toString(36).slice(-8) +
				Math.random().toString(36).slice(-8)

			const hashedPassword = bcryptjs.hashSync(generatedPassword, 10)
			const { name, profile_pic } = req.body
			const profilePicUrl =
				profile_pic ||
				"https://firebasestorage.googleapis.com/v0/b/motomaps-auth.appspot.com/o/default.jpg?alt=media&token=7179c69c-498a-4020-8408-324b95dd9a79"
			const [firstName, lastName] = name.split(" ")
			const username =
				firstName + lastName + Math.floor(Math.random() * 100000).toString()
			const userId = uuidv4()
			const currentDate = new Date()
			const formattedDate = currentDate.toISOString().split("T")[0]

			const insertText =
				"INSERT INTO users(user_id,username,email,password,first_name,last_name,profile_pic,last_login) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *"
			const insertValues = [
				userId,
				username,
				email,
				hashedPassword,
				firstName,
				lastName,
				profilePicUrl,
				formattedDate,
			]

			const { rows } = await db.query(insertText, insertValues)

			const token = jwt.sign(
				{ id: `${rows[0].user_id}` },
				process.env.JWT_SECRET,
				{
					expiresIn: "48h",
				},
			)

			const { password: hashedPassword2, ...rest } = rows[0]
			res.cookie("access_token", token, {
				path: "/",
				expires: new Date(Date.now() + 1000 * 60 * 60 * 48),
				httpOnly: true,
				sameSite: "none",
				secure: true,
			})
				.status(200)
				.json(rest)
		}
	} catch (err) {
		res.status(500).json({ error: "Unexpected error occurred, google auth failed" })
	}
}

const sendOTP = async (req, res) => {
	try {
		const checkEmailText = "SELECT * FROM users WHERE email = $1;"
		const checkEmailValues = [req.body.email]
		const { rows: emailrows } = await db.query(checkEmailText, checkEmailValues)
		if (emailrows[0]) {
			res.status(401).json({ error: "Email already exists, please log in" })
			return
		}

		const oneTimePass = otpGenerator.generate(6, {
			upperCaseAlphabets: false,
			lowerCaseAlphabets: false,
			specialChars: false,
		})
		const expiryTime = new Date(Date.now() + 5 * 60 * 1000)

		const insertOTPtext =
			"INSERT INTO otp_requests (email, otp, otp_expiry,attempts) VALUES ($1, $2, $3, $4);"
		const insertOTPvalues = [req.body.email, oneTimePass, expiryTime, 0]
		await db.query(insertOTPtext, insertOTPvalues)

		await sendMail(req.body.email, oneTimePass)
		res.status(200).json({ msg: "OTP sent" })
	} catch (e) {
		res.status(500).json({ error: "Unexpected error occurred" })
	}
}

const verifyOTP = async (req, res) => {
	try {
		const query = `SELECT otp, otp_expiry, attempts FROM otp_requests WHERE email = $1`
		const result = await db.query(query, [req.body.email])

		if (result.rows.length === 0) {
			throw new Error("OTP not found or expired")
		}

		const { otp, otp_expiry, attempts } = result.rows[0]

		if (new Date() > otp_expiry) {
			throw new Error("OTP has expired")
		}

		if (attempts >= 3) {
			throw new Error("Too many attempts")
		}

		if (otp !== req.body.otp) {
			const updateAttemptsQuery = `UPDATE otp_requests SET attempts = attempts + 1 WHERE email = $1`
			await db.query(updateAttemptsQuery, [req.body.email])
			throw new Error("Invalid OTP")
		}

		const clearOtpQuery = `DELETE FROM otp_requests WHERE email = $1`
		await db.query(clearOtpQuery, [req.body.email])

		res.status(200).json({ msg: "OTP Verified" })
	} catch (e) {
		res.status(500).json({ error: "Unexpected error occurred" })
	}
}

const deleteExpiredOTPs = async () => {
	const query = `DELETE FROM otp_requests WHERE otp_expiry < NOW()`
	await db.query(query)
}

export { signup, login, google, sendOTP, verifyOTP, verifyToken, deleteExpiredOTPs }
