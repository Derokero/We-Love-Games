const nanoid = require("nanoid").customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 6);

const {sendConfirmationEmail} = require("../utils/mailer");
const config = require("../config/config");
const {User} = require("../models/userModel");

const codes = {};

/* Validate confirmation ID */
exports.validateConfirmId = async (req, res) => {
	if (!(req.body && req.body.confirmationId)) return res.status(400).send("Invalid confirmation ID!");

	const {confirmationId} = req.body;

	try {
		const savedUser = await User.findOne({confirmationId});
		if (!savedUser) return res.status(400).send("Invalid ID");

		// Generate a new random code
		const confirmCode = nanoid();
		codes[confirmationId] = confirmCode; // Save code

		sendConfirmationEmail(savedUser.name, savedUser.email, confirmCode); // Send email to user

		return res.status(200).send("Email sent!");
	} catch (err) {
		return res.status(500).send("An unexpected error has occurred!");
	}
};

/* Confirm email */
exports.confirmEmail = async (req, res) => {
	if (!(req.params && req.params.confirmationId)) return res.status(400).send("Invalid confirmation ID!");
	if (!(req.body && req.body.code)) return res.status(400).send("Invalid code!");

	const {confirmationId} = req.params;
	const {code} = req.body;

	if (codes[confirmationId] !== code.toLowerCase()) return res.status(400).send("Invalid code!");

	try {
		const savedUser = await User.findOne({confirmationId});

		// Delete confirmation fields, account has been verified
		savedUser.awaitingConfirmation = undefined;
		savedUser.confirmationId = undefined;
		await savedUser.save();

		delete code[confirmationId]; // Remove code, we don't need it anymore

		return res.status(200).send({authToken: savedUser.generateAuthToken()}); // Send authentication token to user
	} catch (err) {
		console.log(err);
		return res.status(500).send("An unexpected error has occurred!");
	}
};
