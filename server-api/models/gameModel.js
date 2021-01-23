const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	gameId: {
		type: Number,
		required: true,
		unique: true,
	},
	image: {
		type: String,
		required: true,
	},
	favoriteCount: {
		type: Number,
		required: true,
		default: 0,
	},
	reviews: [{type: mongoose.SchemaTypes.ObjectId, ref: "Review"}],
});

const Game = mongoose.model("Game", gameSchema);

module.exports = {Game};
