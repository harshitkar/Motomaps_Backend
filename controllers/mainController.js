import * as db from "../db/index.js"

const checkAuth = async (req, res) => {
	try {
		const { id } = req
		const text = "SELECT * FROM users WHERE user_id = $1;"
		const values = [id]

		const { rows } = await db.query(text, values)

		if (rows.length === 0) {
			return res.status(404).json({ error: "User not found" })
		}

		const { password: hashedPassword, ...rest } = rows[0]
		res.status(200).json(rest)
	} catch (error) {
		console.error("Error during checkAuth:", error)
		res.status(500).json({ error: "Internal Server Error" })
	}
}

export { checkAuth }
