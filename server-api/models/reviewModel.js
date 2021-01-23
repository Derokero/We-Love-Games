const mongoose = require("mongoose");
const Joi = require("joi");

const reviewSchema = mongoose.Schema({
	author: {
		type: String,
		required: true,
	},
	content: {
		type: String,
		required: true,
		maxlength: 3000,
	},
	gameId: {
		type: Number,
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	lastEditedAt: {
		type: Date,
	},
});

const Review = mongoose.model("Review", reviewSchema);

function validateReview(review) {
	const validationScheme = Joi.object({
		content: Joi.string().max(3000).required(),
	});

	return validationScheme.validate(review);
}

module.exports = {Review, validateReview};
