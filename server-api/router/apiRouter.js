const express = require("express");
const router = express.Router();

const login = require("./routes/login");
const users = require("./routes/user");
const userData = require("./routes/userData");

/* Routes */
router.use("/login", login);
router.use("/user", users);
router.use("/userData", userData);

module.exports = router;
