const bcrypt = require("bcrypt");
const {nanoid} = require("nanoid");
const Joi = require("joi");
const {User, validateUser} = require("../models/userModel");

/* Create user */
exports.createUser = async (req, res) => {
	const {error} = validateUser(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	try {
		// Trim whitespaces and lowercase email
		req.body.name = req.body.name.trim();
		req.body.email = req.body.email.trim().toLowerCase();

		const userExists = await User.exists({email: req.body.email});
		if (userExists) return res.status(409).send("A user with that email already exists!");

		const newUser = new User(req.body);

		newUser.password = await bcrypt.hash(newUser.password, 12);

		// Generate temporary confirmation data
		newUser.awaitingConfirmation = Date.now();
		newUser.confirmationId = nanoid(60);

		await newUser.save();

		return res.status(201).send({confirmationId: newUser.confirmationId});
	} catch (err) {
		return res.status(500).send("An unexpected error has occurred!");
	}
};

/* Get user */
exports.getCurrentUser = async (req, res) => {
	try {
		const savedUser = await User.findOne({_id: req.user._id});
		const {_id, name, email} = savedUser;
		return res.status(200).send({_id, name, email});
	} catch (err) {
		return res.status(500).send("An unexpected error has occurred!");
	}
};

/* Change password */
exports.changePassword = async (req, res) => {
	const passwordSchema = Joi.string().min(8).max(72, "utf8").required();
	const {error} = passwordSchema.validate(req.body.password);
	if (error) return res.status(400).send(error.details[0].message);

	try {
		const hashedPassword = await bcrypt.hash(req.body.password, 12);
		await User.findOneAndUpdate({_id: req.user._id}, {password: hashedPassword});

		return res.status(200).send("Successfully changed password!");
	} catch (err) {
		return res.status(500).send("An unexpected error has occurred!");
	}
};
