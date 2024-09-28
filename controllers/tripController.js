import * as db from "../db/index.js"
import { v4 as uuidv4 } from "uuid"

const saveTrip = async (req, res, next) => {
	const postID = uuidv4()

	const now = new Date()
	const isoDate = now.toISOString()

	const text =
		"INSERT INTO post (user_id,post_id,title,description,location,distance,images,likes,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *"
	const values = [
		req.body.id,
		postID,
		req.body.title,
		req.body.description,
		req.body.route,
		req.body.distance,
		req.body.images,
		0,
		isoDate,
	]

	try {
		const { rows } = await db.query(text, values)

		res.status(200).json({ msg: "Success" })
	} catch (err) {
		next(err)
	}
}

const updateTrip = async (req, res, next) => {
	const now = new Date()
	const isoDate = now.toISOString()

	const text =
		"UPDATE post set title=$1,description=$2,location=$3,distance=$4,images=$5,likes=$6,created_at=$7 WHERE post_id=$8 RETURNING *"
	const values = [
		req.body.title,
		req.body.description,
		req.body.route,
		req.body.distance,
		req.body.images,
		req.body.likes,
		isoDate,
		req.params.id,
	]

	try {
		const { rows } = await db.query(text, values)

		res.status(200).json({ msg: "Success" })
	} catch (err) {
		next(err)
	}
}

const deleteTrip = async (req, res, next) => {
	const postID = req.params.id

	const text = "DELETE FROM post WHERE post_id=$1 RETURNING *"
	const values = [postID]

	try {
		const { rows } = await db.query(text, values)

		res.status(200).json({ msg: "Success" })
	} catch (err) {
		next(err)
	}
}

const loadTrip = async (req, res, next) => {
	const { id } = req.params
	const text = "SELECT * from post where post_id=$1"
	const values = [id]

	try {
		const { rows } = await db.query(text, values)

		res.status(200).json(rows[0])
	} catch (err) {
		next(err)
	}
}

const loadAllTrips = async (req, res, next) => {
	const text = "SELECT * from post"
	const values = []
	try {
		const { rows } = await db.query(text, values)

		res.status(200).json(rows)
	} catch (err) {
		next(err)
	}
}

const loadAllTripsMostLiked = async (req, res, next) => {
	const text = "SELECT * from post ORDER BY likes DESC"
	const values = []
	try {
		const { rows } = await db.query(text, values)

		res.status(200).json(rows)
	} catch (err) {
		next(err)
	}
}

const loadAllTripsMostLikedLimited = async (req, res, next) => {
	const text = "SELECT * from post ORDER BY likes DESC LIMIT 3"
	const values = []
	try {
		const { rows } = await db.query(text, values)

		res.status(200).json(rows)
	} catch (err) {
		next(err)
	}
}

const loadAllTripsNewest = async (req, res, next) => {
	const text = "SELECT * from post ORDER BY created_at DESC"
	const values = []
	try {
		const { rows } = await db.query(text, values)

		res.status(200).json(rows)
	} catch (err) {
		next(err)
	}
}

const loadAllMyTrips = async (req, res, next) => {
	const { id } = req.params
	const text = "SELECT * from post where user_id=$1 ORDER BY created_at DESC"
	const values = [id]
	try {
		const { rows } = await db.query(text, values)

		res.status(200).json(rows)
	} catch (err) {
		next(err)
	}
}

const loadAllMyLikedTrips = async (req, res, next) => {
	const { id } = req.params
	const text =
		"SELECT * FROM post WHERE post_id IN(SELECT post_id FROM post_like where user_id=$1) ORDER BY created_at DESC"
	const values = [id]
	try {
		const { rows } = await db.query(text, values)

		res.status(200).json(rows)
	} catch (err) {
		next(err)
	}
}

const loadAllTripsOldest = async (req, res, next) => {
	const text = "SELECT * from post ORDER BY created_at"
	const values = []
	try {
		const { rows } = await db.query(text, values)

		res.status(200).json(rows)
	} catch (err) {
		next(err)
	}
}

const loadMyPosts = async (req, res, next) => {
	const { id } = req.params
	const text = "SELECT * from post where user_id=$1 ORDER BY created_at DESC LIMIT 3"
	const values = [id]
	try {
		const { rows } = await db.query(text, values)

		res.status(200).json(rows)
	} catch (err) {
		next(err)
	}
}

const loadMyLikedPosts = async (req, res, next) => {
	const { id } = req.params
	const text =
		"SELECT * FROM post WHERE post_id IN(SELECT post_id FROM post_like where user_id=$1) ORDER BY created_at DESC LIMIT 3"
	const values = [id]
	try {
		const { rows } = await db.query(text, values)

		res.status(200).json(rows)
	} catch (err) {
		next(err)
	}
}

const postLike = async (req, res, next) => {
	const { user_id, post_id } = req.body
	const text =
		"INSERT INTO post_like(user_id, post_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *;"
	const values = [user_id, post_id]

	const text2 = "UPDATE post SET likes = likes + 1 WHERE post_id = $1 RETURNING *;"
	const values2 = [post_id]

	try {
		const { rows } = await db.query(text, values)
		if (rows) {
			const { rows: rows2 } = await db.query(text2, values2)
		}

		res.status(200).json(rows)
	} catch (err) {
		next(err)
	}
}

const postUnlike = async (req, res, next) => {
	const { user_id, post_id } = req.body
	const text =
		"DELETE FROM post_like WHERE user_id = $1 AND post_id = $2 RETURNING *;"
	const values = [user_id, post_id]

	const text2 = "UPDATE post SET likes = likes - 1 WHERE post_id = $1 RETURNING *;"
	const values2 = [post_id]

	try {
		const { rows } = await db.query(text, values)
		if (rows) {
			const { rows: rows2 } = await db.query(text2, values2)
		}

		res.status(200).json(rows)
	} catch (err) {
		next(err)
	}
}

const isLiked = async (req, res, next) => {
	const { user_id, post_id } = req.query
	const text = "SELECT * FROM post_like WHERE user_id = $1 AND post_id = $2"
	const values = [user_id, post_id]

	try {
		const { rows } = await db.query(text, values)

		if (rows.length > 0) {
			res.status(200).json({ liked: true })
		} else {
			res.status(200).json({ liked: false })
		}
	} catch (err) {
		next(err)
	}
}

const userDetails = async (req, res, next) => {
	const { user_id } = req.query
	const text = "SELECT * FROM users WHERE user_id = $1"
	const values = [user_id]
	try {
		const { rows } = await db.query(text, values)

		res.status(200).json(rows)
	} catch (err) {
		next(err)
	}
}

const search = async (req, res, next) => {
	const { query, radio } = req.query
	let text

	if (radio == 1) {
		text =
			"SELECT * FROM post WHERE title ILIKE $1 OR description ILIKE $1 ORDER BY likes DESC;"
	} else if (radio == 2) {
		text =
			"SELECT * FROM post WHERE title ILIKE $1 OR description ILIKE $1 ORDER BY created_at DESC;"
	} else if (radio == 3) {
		text =
			"SELECT * FROM post WHERE title ILIKE $1 OR description ILIKE $1 ORDER BY created_at ASC;"
	}

	const values = [`%${query}%`]
	try {
		const { rows } = await db.query(text, values)

		res.status(200).json(rows)
	} catch (err) {
		next(err)
	}
}
export {
	saveTrip,
	loadTrip,
	loadAllTrips,
	postLike,
	postUnlike,
	isLiked,
	userDetails,
	loadAllTripsMostLiked,
	loadAllTripsNewest,
	loadAllTripsOldest,
	loadMyPosts,
	loadAllMyTrips,
	loadMyLikedPosts,
	loadAllMyLikedTrips,
	loadAllTripsMostLikedLimited,
	search,
	updateTrip,
	deleteTrip,
}
