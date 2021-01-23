const jwt = require("jsonwebtoken");
const config = require("../config/config");

module.exports = (req, res, next) => {
	const authHeader = req.header("Authorization");
	if (!authHeader) return res.status(401).send("Access denied. No token provided!");

	const authToken = authHeader.replace(/^bearer\W/i, "").trim(); // Using Bearer scheme

	try {
		const decoded = jwt.verify(authToken, config.JWT_SECRET_KEY);
		req.user = decoded;
		next();
	} catch (err) {
		return res.status(403).send("Access denied. Invalid token!");
	}
};
