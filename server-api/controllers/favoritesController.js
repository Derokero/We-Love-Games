const {User} = require("../models/userModel");
const {Game} = require("../models/gameModel");

/* Add game to user's favorites list */
exports.addGameToFavorites = async (req, res) => {
	try {
		// Is our user valid?
		const user = await User.findById(req.user._id);
		if (!user) return res.status(400).status("Invalid user!");

		let game = await Game.findOne({gameId: req.body.gameId});

		// Create game and add to collection if doesn't exist
		if (!game) {
			game = new Game(req.body);
			await game.save();
		}

		const newValues = user.favorites.addToSet(game._id); // Add reference of game to user's favorites, use set to ensure no duplicates
		if (!newValues.length) return res.status(400).send("Game is already in list!"); // If nothing was added then there was a duplicate

		game.favoriteCount++;
		await Promise.all([game.save(), user.save()]);

		return res.status(201).send("Added game to list!");
	} catch (err) {
		return res.status(500).send("An unexpected error has occurred!");
	}
};

/* Get all favorites of logged user */
exports.getUserFavorites = async (req, res) => {
	try {
		await User.findById(req.user._id)
			.populate("favorites", "-__v")
			.exec((err, user) => {
				if (err || !user) return res.status(500).send("An unexpected error has occurred!");

				res.status(200).send(user.favorites);
			});
	} catch (err) {
		return res.status(500).send("An unexpected error has occurred!");
	}
};

/* Delete game reference from user's favorites list */
exports.deleteFromFavorites = async (req, res) => {
	try {
		if (!req.params.lookupId) res.status(400).send("No lookup ID provided!");
		const user = await User.findById(req.user._id);

		// Check if the user has the game in favorites to make sure we don't decrement more than we need to on multiple requests
		for (const game of user.favorites) {
			if (String(game._id) === String(req.params.lookupId)) {
				user.favorites.pull(req.params.lookupId); // Remove from array
				await user.save();
				await Game.findOneAndUpdate({_id: req.params.lookupId}, {$inc: {favoriteCount: -1}}); // Decrement
				return res.status(200).send("Removed game from list!");
			}
		}

		return res.status(400).send("Game doesn't exist in list!");
	} catch (err) {
		return res.status(500).send("An unexpected error has occurred!");
	}
};

/* Get all favorites */
exports.getAllFavorites = async (req, res) => {
	try {
		const data = await Game.find({favoriteCount: {$gt: 0}}).select("-__v");
		return res.status(200).send(data);
	} catch (err) {
		return res.status(500).send("An unexpected error has occurred!");
	}
};
