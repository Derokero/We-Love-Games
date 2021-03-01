const {nanoid} = require("nanoid");
const {changePassword} = require("./userController");
const {User} = require("../models/userModel");

const {sendResetPassword} = require("../utils/mailer");
const config = require("../config/config");

const PASSWORD_ID_EXPIRATION = 900000; // 15(minutes) * 1000 * 60
const resetIds = {};

/* Check if password id is valid and not expired */
function isValidId(passwordResetId) {
	const _resetId = resetIds[passwordResetId];

	// No ID exits in resetIds
	if (!_resetId) return false;

	// Expired
	if (_resetId && _resetId.timestamp && Date.now() - _resetId.timestamp >= PASSWORD_ID_EXPIRATION) {
		delete resetIds[passwordResetId]; // Remove from resetIds
		return false;
	}

	// Valid
	return true;
}

/* Request password reset */
exports.requestPasswordReset = async (req, res) => {
	if (!(req.body && req.body.email)) return res.status(400).send("Invalid email!");

	const {email} = req.body;
	try {
		const savedUser = await User.findOne({email});
		if (!savedUser) return res.status(400).send("Invalid email!");

		// Generate new password reset ID
		const passwordResetId = nanoid(60);
		resetIds[passwordResetId] = {email, timestamp: Date.now()}; // Save with timestamp

		const passwordResetLink = `${config.SERVER_URL}/password-reset/${passwordResetId}`;

		await sendResetPassword(savedUser.name, savedUser.email, passwordResetLink);
		return res.status(200).send("Email sent!");
	} catch (err) {
		return res.status(500).send("An unexpected error has occurred!");
	}
};

/* Reset password */
exports.resetPassword = async (req, res) => {
	if (!(req.params && req.params.passwordResetId))
		return res.status(400).send("Invalid password reset ID!");
	if (!(req.body && req.body.password)) return res.status(400).send("No password provided!");

	const {passwordResetId} = req.params;
	if (!isValidId(passwordResetId)) return res.status(400).send("Invalid password reset ID!");

	const savedUser = await User.findOne({email: resetIds[passwordResetId].email});
	req.user = savedUser; // Pass user to change password

	try {
		await changePassword(req, res);
		delete resetIds[passwordResetId]; // Remove reset ID on success
	} catch (err) {
		return res.status(500).send("An unexpected error has occurred!");
	}
};

/* Validate password reset request ID */
exports.validateResetId = async (req, res) => {
	if (!(req.body && req.body.passwordResetId)) return res.status(400).send("Invalid password reset ID!");

	const {passwordResetId} = req.body;
	if (!isValidId(passwordResetId)) return res.status(400).send("Invalid password reset ID!");

	return res.status(200).send("Success!");
};
