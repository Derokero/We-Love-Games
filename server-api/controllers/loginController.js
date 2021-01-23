const Joi = require("joi");
const bcrypt = require("bcrypt");
const {User} = require("../models/userModel");

function validateCredentials(credentials) {
	const schema = Joi.object({
		email: Joi.string().trim().min(5).max(254, "utf8").email(),
		password: Joi.string().required(),
	});

	return schema.validate(credentials);
}

/* Login */
exports.login = async (req, res) => {
	const {error} = validateCredentials(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	try {
		req.body.email = req.body.email.trim().toLowerCase();
		const savedUser = await User.findOne({email: req.body.email});
		if (!savedUser) return res.status(400).send("Invalid email or password!");

		const validPassword = await bcrypt.compare(req.body.password, savedUser.password);
		if (!validPassword) return res.status(400).send("Invalid email or password!");

		// Email not confirmed yet
		if (savedUser.awaitingConfirmation)
			return res.status(202).send({confirmationId: savedUser.confirmationId}); // Send confirmation ID

		return res.status(200).send({authToken: savedUser.generateAuthToken()});
	} catch (err) {
		return res.status(500).send("An unexpected error has occurred!");
	}
};
