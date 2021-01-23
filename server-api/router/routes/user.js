const express = require("express");
const router = express.Router();

/* Middlewares */
const authenticate = require("../../middlewares/authenticate");

/* Controllers */
const {createUser, getCurrentUser, changePassword} = require("../../controllers/userController");

const {confirmEmail, validateConfirmId} = require("../../controllers/confirmationController");
const {
	resetPassword,
	requestPasswordReset,
	validateResetId,
} = require("../../controllers/passwordResetController");

/* Routes */
router.post("/", createUser);
router.post("/who", authenticate, getCurrentUser);
router.patch("/change-password", authenticate, changePassword);
router.post("/validate-reset-id", validateResetId);
router.post("/request-password-reset", requestPasswordReset);
router.patch("/reset-password/:passwordResetId", resetPassword);

router.post("/validate-confirm-id", validateConfirmId);
router.post("/confirm-email/:confirmationId", confirmEmail);

module.exports = router;
