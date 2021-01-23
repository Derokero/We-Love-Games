const {Review, validateReview} = require("../models/reviewModel");
const {User} = require("../models/userModel");
const {Game} = require("../models/gameModel");

exports.addGameReview = async (req, res) => {
	const {gameData, userData: reviewData} = req.body;

	if (!(gameData && reviewData)) return res.status(400).send("Invalid data");

	// Is our user valid?
	const user = await User.findById(req.user._id);
	if (!user) return res.status(400).status("Invalid user!");

	const {error} = validateReview(reviewData);
	if (error) return res.status(400).send(error.details[0].message);

	try {
		let game = await Game.findOne({gameId: gameData.gameId});

		// Create game and add to collection if doesn't exist
		if (!game) {
			game = new Game(gameData);
			await game.save();
		}

		reviewData.author = user.name; // Append author to review
		reviewData.gameId = gameData.gameId; // Append gameID to review

		const newReview = new Review(reviewData); // New game review

		// Append reviews
		user.reviews.addToSet(newReview._id);
		game.reviews.addToSet(newReview._id);

		// Save to database
		await Promise.all([newReview.save(), user.save(), game.save()]);

		return res.status(201).send("Successfully added a review!");
	} catch (err) {
		return res.status(500).send("An unexpected error has occurred!");
	}
};

exports.updateGameReview = async (req, res) => {
	const reviewData = {content: req.body.content};

	if (!reviewData) return res.status(400).send("No content provided!");

	const user = await User.findById(req.user._id);
	if (!(user.reviews && user.reviews.includes(req.body._id)))
		return res.status(400).send("Invalid user ID!"); // Make sure the user can only edit his own reviews

	const {error} = validateReview(reviewData);
	if (error) return res.status(400).send(error.details[0].message);

	try {
		await Review.findOneAndUpdate(
			{_id: req.body._id},
			{content: reviewData.content, lastEditedAt: Date.now()}
		);

		return res.status(200).send("Successfully updated review!");
	} catch (err) {
		return res.status(500).send("An unexpected error has occurred!");
	}
};

exports.getUserReviews = async (req, res) => {
	try {
		await User.findById(req.user._id)
			.populate("reviews", "-__v")
			.exec((err, user) => {
				if (err || !user) return res.status(500).send("An unexpected error has occurred!");

				res.status(200).send(user.reviews);
			});
	} catch (err) {
		return res.status(500).send("An unexpected error has occurred!");
	}
};

exports.getAllReviews = async (req, res) => {
	try {
		const data = await Review.find();
		return res.status(200).send(data);
	} catch (err) {
		return res.status(500).send("An unexpected error has occurred!");
	}
};

exports.getReviewsByGameId = async (req, res) => {
	try {
		if (!(req.params && req.params.gameId)) return res.status(400).send("Invalid query parameters!");

		const reviews = await Review.find({gameId: req.params.gameId}).sort({createdAt: -1}).select("-__v");

		return res.status(200).send(reviews);
	} catch (err) {
		return res.status(500).send("An unexpected error has occurred!");
	}
};
