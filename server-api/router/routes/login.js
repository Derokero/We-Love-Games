const express = require("express");
const router = express.Router();

/* Controllers */
const {login} = require("../../controllers/loginController");

/* Routes */
router.post("/", login);

module.exports = router;
