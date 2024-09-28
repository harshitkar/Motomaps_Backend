import { verifyToken } from "../controllers/authController.js"
import {
	loadTrip,
	loadAllTrips,
	saveTrip,
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
} from "../controllers/tripController.js"
import express from "express"

const router = express.Router()

router.get("/load/:id", verifyToken, loadTrip)
router.get("/load-all", verifyToken, loadAllTrips)
router.get("/load-all-mostliked", verifyToken, loadAllTripsMostLiked)
router.get("/load-all-mostliked-limited", verifyToken, loadAllTripsMostLikedLimited)
router.get("/load-all-newest", verifyToken, loadAllTripsNewest)
router.get("/load-my/:id", verifyToken, loadAllMyTrips)
router.get("/load-all-oldest", verifyToken, loadAllTripsOldest)
router.get("/load-myposts/:id", verifyToken, loadMyPosts)
router.get("/load-allmylikedposts/:id", verifyToken, loadAllMyLikedTrips)
router.get("/load-mylikedposts/:id", verifyToken, loadMyLikedPosts)
router.get("/search", verifyToken, search)
router.post("/save", verifyToken, saveTrip)
router.get("/isliked", verifyToken, isLiked)
router.get("/user-details", verifyToken, userDetails)
router.post("/like", verifyToken, postLike)
router.patch("/update/:id", verifyToken, updateTrip)
router.delete("/unlike", verifyToken, postUnlike)
router.delete("/delete/:id", verifyToken, deleteTrip)

export { router as tripRoutes }
