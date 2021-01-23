const config = {};

/* Server config */
config.SERVER_URL = process.env.NODE_ENV === "production" ? "https://welg.herokuapp.com" : "http://localhost";
config.SERVER_PORT = process.env.PORT || 3001;

/* Database config */
config.DB_NAME = "api-data";
config.DB_URI =
	process.env.NODE_ENV === "production"
		? `mongodb+srv://owner:${process.env.DB_KEY}@welovegames.cu55f.mongodb.net/${config.DB_NAME}?retryWrites=true&w=majority`
		: `mongodb://localhost/${config.DB_NAME}`;

/* App config */
config.APP_NAME = "We ❤️ Games";
config.APP_EMAIL = "wlg.noreply@protonmail.com";

/* Email API config */
config.MJ_APIKEY_PUBLIC = process.env.MJ_APIKEY_PUBLIC;
config.MJ_APIKEY_SECRET = process.env.MJ_APIKEY_SECRET;

/* JWT config - Asymmetric signing */
// if (!(process.env.PRIVATE_KEY && process.env.PUBLIC_KEY)) {
// 	// Generate random key pair if not specified in environment
// 	const {generateKeyPairSync} = require("crypto");
// 	const {publicKey, privateKey} = generateKeyPairSync("rsa", {
// 		modulusLength: 4096,
// 		publicKeyEncoding: {
// 			type: "spki",
// 			format: "pem",
// 		},
// 		privateKeyEncoding: {
// 			type: "pkcs8",
// 			format: "pem",
// 		},
// 	});
// 	config.JWT_PRIVATE_KEY = privateKey;
// 	config.JWT_PUBLIC_KEY = publicKey;
// } else {
// 	config.JWT_PRIVATE_KEY = process.env.PRIVATE_KEY;
// 	config.JWT_PUBLIC_KEY = process.env.PUBLIC_KEY;
// }

/* JWT config - Symmetric signing */
if (!process.env.JWT_SECRET_KEY) {
	// Generate random secret key if not specified in environment
	const {randomBytes} = require("crypto");
	config.JWT_SECRET_KEY = randomBytes(4096 / 8);
} else {
	config.JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
}

module.exports = Object.freeze(config);
