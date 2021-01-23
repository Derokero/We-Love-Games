import React, {useContext, useState} from "react";
import {Redirect, useHistory} from "react-router-dom";
import Joi from "joi/dist/joi-browser.min.js";

import {makeStyles} from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Box from "@material-ui/core/Box";
import RecentActorsOutlinedIcon from "@material-ui/icons/RecentActorsOutlined";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import {CircularProgress} from "@material-ui/core";

/* Services */
import userService from "../services/userService";

/* Hooks */
import useForm from "../hooks/form";

/* Context */
import UserContext from "../contexts/userContext";
import Copyright from "./common/copyright";

const useStyles = makeStyles((theme) => ({
	paper: {
		marginTop: theme.spacing(8),
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
	},
	avatar: {
		margin: theme.spacing(1),
		backgroundColor: theme.palette.secondary.main,
	},
	form: {
		width: "100%", // Fix IE 11 issue.
		marginTop: theme.spacing(1),
	},
	submit: {
		margin: theme.spacing(3, 0, 2),
	},
	loading: {
		position: "absolute",
		margin: "0 auto",
	},
}));

export default function Register() {
	const classes = useStyles();
	const {user} = useContext(UserContext);

	const history = useHistory();

	const [loading, setLoading] = useState(false);

	const schema = {
		name: Joi.string().min(2).max(256).required().label("Name"),
		email: Joi.string().trim().min(5).max(254).email({tlds: false}).required().label("Email"),
		password: Joi.string().min(8).max(72).required().label("Password"),
		passwordConfirm: Joi.string()
			.equal(Joi.ref("password"))
			.required()
			.label("Password confirmation")
			.messages({"any.only": "Passwords do not match"}),
	};

	/* Custom hook for form validation and submission */
	const {inputs, errors, setErrors, handleFormSubmit, handleFormChange} = useForm(schema, async () => {
		const userData = {...inputs};

		try {
			setLoading(true);
			const confirmationId = await userService.register(userData);
			if (confirmationId) return history.replace(`/email-confirm/${confirmationId}`);
		} catch (err) {
			if (err && err.response && err.response.status === 409) {
				setErrors({email: "A user with that email already exists!"});
			}
			setLoading(false);
		}
	});

	if (user) return <Redirect to="/" />; // Already signed in

	return (
		<Container component="main" maxWidth="xs">
			<CssBaseline />
			<div className={classes.paper}>
				<Avatar className={classes.avatar}>
					<RecentActorsOutlinedIcon />
				</Avatar>
				<Typography component="h1" variant="h5">
					Register
				</Typography>
				<form
					className={classes.form}
					noValidate
					onSubmit={handleFormSubmit}
					onChange={handleFormChange}>
					<TextField
						variant="outlined"
						margin="normal"
						required
						fullWidth
						id="name"
						label="Name"
						name="name"
						autoComplete="name"
						autoFocus
						error={!!errors["name"]}
						helperText={errors["name"]}
					/>
					<TextField
						variant="outlined"
						margin="normal"
						required
						fullWidth
						id="email"
						label="Email Address"
						name="email"
						autoComplete="email"
						error={!!errors["email"]}
						helperText={errors["email"]}
					/>
					<TextField
						variant="outlined"
						margin="normal"
						required
						fullWidth
						name="password"
						label="Password"
						type="password"
						id="password"
						autoComplete="current-password"
						error={!!errors["password"]}
						helperText={errors["password"]}
					/>
					<TextField
						variant="outlined"
						margin="normal"
						required
						fullWidth
						name="passwordConfirm"
						label="Confirm Password"
						type="password"
						id="passwordConfirm"
						autoComplete="current-password"
						error={!!errors["passwordConfirm"]}
						helperText={errors["passwordConfirm"]}
					/>
					<Button
						type="submit"
						fullWidth
						variant="contained"
						color="secondary"
						className={classes.submit}
						disabled={!errors.noErrors || loading}>
						Register
						{loading && (
							<CircularProgress size={24} color="secondary" className={classes.loading} />
						)}
					</Button>
				</form>
			</div>
			<Box mt={8}>
				<Copyright />
			</Box>
		</Container>
	);
}
