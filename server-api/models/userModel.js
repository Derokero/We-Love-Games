const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const {string} = require("joi");

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		minlength: 2,
		maxlength: 256,
	},
	email: {
		type: String,
		required: true,
		unique: true,
		minlength: 5,
		maxlength: 254, // As defined in RFC3696 https://www.rfc-editor.org/errata/eid1690
	},
	password: {
		type: String,
		required: true,
		minlength: 8,
		maxlength: 70, // https://www.npmjs.com/package/bcrypt#hash-info + some overhead just in case something changes
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	awaitingConfirmation: {
		type: Date,
		expires: "1d",
	},
	confirmationId: {
		type: String,
	},
	playlist: [{type: mongoose.SchemaTypes.ObjectId, ref: "Game"}],
	favorites: [{type: mongoose.SchemaTypes.ObjectId, ref: "Game"}],
	reviews: [{type: mongoose.SchemaTypes.ObjectId, ref: "Review"}],
});

userSchema.method("generateAuthToken", function () {
	return jwt.sign({_id: this._id, iss: "We ❤️ Games", name: this.name}, config.JWT_SECRET_KEY, {
		algorithm: "HS512",
	});
});

function validateUser(user) {
	const validationScheme = Joi.object({
		name: Joi.string().min(2).max(256).required(),
		email: Joi.string().trim().min(5).max(254, "utf8").email().required(), // As defined in RFC3696 https://www.rfc-editor.org/errata/eid1690
		password: Joi.string().min(8).max(72, "utf8").required(), // 72 bytes max https://www.npmjs.com/package/bcrypt#security-issues-and-concerns
	});

	return validationScheme.validate(user);
}

const User = mongoose.model("User", userSchema);

module.exports = {User, validateUser};
