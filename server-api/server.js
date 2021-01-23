const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const config = require("./config/config");

const apiRouter = require("./router/apiRouter");

const app = express();

/* Connect to DB */
mongoose
	.connect(config.DB_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
		useFindAndModify: false,
	})
	.then(() => {
		console.log("Successfully connected to database!");
	})
	.catch((err) => {
		console.log("Connection to database failed!\n", err);
	});

/* Setup middlewares */
app.use(
	helmet({
		contentSecurityPolicy: false,
	})
); // Setup headers for basic security

const corsOptions = {
	origin: `http://localhost:3000`, // Whitelist only React's dev server
	optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.static(path.join(__dirname, "../client-ui/build")));

/* Main Router */
app.use("/api/", apiRouter);

/* Fallback for React routing */
app.get("/*", (req, res) => {
	res.sendFile(path.join(__dirname, "../client-ui/build/index.html"), (err) => {
		if (err) res.status(500).send("An unexpected error has occurred!");
	});
});

app.listen(config.SERVER_PORT, () =>
	console.log(`Started server at: ${config.SERVER_URL}:${config.SERVER_PORT}`)
);
