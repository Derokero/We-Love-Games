const express = require("express");
const router = express.Router();

/* Middlewares */
const authenticate = require("../../middlewares/authenticate");

/* Controllers */
const {
	addGameToPlaylist,
	getToPlaylist,
	deleteFromToPlaylist,
} = require("../../controllers/playlistController");

const {
	addGameToFavorites,
	getUserFavorites,
	getAllFavorites,
	deleteFromFavorites,
} = require("../../controllers/favoritesController");

const {
	addGameReview,
	updateGameReview,
	getUserReviews,
	getAllReviews,
	getReviewsByGameId,
} = require("../../controllers/reviewsController");
/* Routes */

/* To-play list */
router.post("/playlist", authenticate, addGameToPlaylist);
router.get("/playlist", authenticate, getToPlaylist);
router.delete("/playlist/:lookupId", authenticate, deleteFromToPlaylist);

/* Favorites */
router.post("/favorites", authenticate, addGameToFavorites);
router.get("/favorites", authenticate, getUserFavorites);
router.delete("/favorites/:lookupId", authenticate, deleteFromFavorites);

// All favorites
router.get("/favorites/all", getAllFavorites);

/* Reviews */
router.post("/reviews", authenticate, addGameReview);
router.patch("/reviews", authenticate, updateGameReview);
router.get("/reviews", authenticate, getUserReviews);

// All reviews
router.get("/reviews/all", getAllReviews);

// Reviews by game ID
router.get("/reviews/:gameId", authenticate, getReviewsByGameId);

module.exports = router;
