import * as db from "../db/index.js"
import bcryptjs from "bcryptjs"
import validator from "validator"

const updateUser = async (req, res, next) => {
	const id = req.params.id
	const text = "SELECT * FROM users WHERE user_id = $1;"
	const values = [id]

	if (req.body.id != req.params.id) {
		return res.status(401).json({ msg: "You can update only your account!" })
	}
	if (req.body.email) {
		if (!validator.isEmail(req.body.email)) {
			return res.status(401).json({ msg: "Please enter a valid email address" })
		}
	}
	if (req.body.firstname === "") {
		return res.status(401).json({ msg: "First name cannot be empty" })
	}
	if (req.body.username === "") {
		return res.status(401).json({ msg: "Username cannot be empty" })
	}
	if (req.body.password) {
		if (!validator.isStrongPassword(req.body.password)) {
			return res.status(401).json({ msg: "Please choose a stronger password" })
		}
		req.body.password = bcryptjs.hashSync(req.body.password, 10)
	}
	try {
		if (req.body.username) {
			const checkUsernameText = "SELECT * FROM users WHERE username = $1;"
			const checkUsernameValues = [req.body.username]
			const { rows: usernamerows } = await db.query(
				checkUsernameText,
				checkUsernameValues,
			)
			if (usernamerows[0]) {
				return res.status(401).json({
					msg: "Username already exists, please select a different username",
				})
			}
		}

		let { rows } = await db.query(text, values)

		const text1 =
			"UPDATE users SET username = $1,email = $2, password = $3,profile_pic=$4,first_name=$6,last_name=$7 WHERE user_id = $5 RETURNING *;"
		const values1 = [
			req.body.username || rows[0].username,
			req.body.email || rows[0].email,
			req.body.password || rows[0].password,
			req.body.profilePicture || rows[0].profile_pic,
			req.params.id,
			req.body.firstname || rows[0].first_name,
			req.body.lastname || rows[0].last_name,
		]

		const respo = await db.query(text1, values1)

		const { password: hashedPassword, ...rest } = respo.rows[0]
		res.status(200).json(rest)
	} catch (error) {
		res.status(500).json({ msg: "Unexpected error occurred" })
	}
}

const deleteUser = async (req, res, next) => {
	if (req.body.id != req.params.id) {
		return res.status(401).json({ msg: "You can delete only your account!" })
	}

	try {
		const id = req.params.id
		const text = "DELETE FROM users WHERE user_id = $1;"
		const values = [id]

		await db.query(text, values)
		res.status(200).json("User has been deleted...")
	} catch (error) {
		res.status(500).json({ msg: "Unexpected error occurred" })
	}
}

const signout = async (req, res) => {
	res.clearCookie("access_token").status(200).json("Signout success!")
}

export { updateUser, deleteUser, signout }
