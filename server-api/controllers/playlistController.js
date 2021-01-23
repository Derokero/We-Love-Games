const {User} = require("../models/userModel");
const {Game} = require("../models/gameModel");

/* Add game to user's to-play list */
exports.addGameToPlaylist = async (req, res) => {
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

		const newValues = user.playlist.addToSet(game._id); // Add reference of game to user's playlist, use set to ensure no duplicates
		if (!newValues.length) return res.status(400).send("Game is already in list!");

		await user.save();

		return res.status(201).send("Added game to list!");
	} catch (err) {
		return res.status(500).send("An unexpected error has occurred!");
	}
};

/* Get user's to-play list */
exports.getToPlaylist = async (req, res) => {
	try {
		await User.findById(req.user._id)
			.populate("playlist", "-__v")
			.exec((err, user) => {
				if (err || !user) return res.status(500).send("An unexpected error has occurred!");
				res.status(200).send(user.playlist);
			});
	} catch (err) {
		return res.status(500).send("An unexpected error has occurred!");
	}
};

/* Delete game reference from user's to-play list */
exports.deleteFromToPlaylist = async (req, res) => {
	try {
		if (!req.params.lookupId) res.status(400).send("No lookup ID provided!");

		const user = await User.findById(req.user._id);
		user.playlist.pull(req.params.lookupId); // Remove from array

		await user.save();

		return res.status(200).send("Removed game from list!");
	} catch (err) {
		return res.status(500).send("An unexpected error has occurred!");
	}
};
