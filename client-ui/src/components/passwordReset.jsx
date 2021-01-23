import React, {useEffect, useState} from "react";
import {Redirect, useHistory} from "react-router-dom";
import Swal from "sweetalert2";
import Joi from "joi/dist/joi-browser.min.js";

import {makeStyles} from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Box from "@material-ui/core/Box";
import AutorenewRoundedIcon from "@material-ui/icons/AutorenewRounded";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import {CircularProgress, Grid} from "@material-ui/core";

/* Services */
import userService from "../services/userService";

/* Hooks */
import useForm from "../hooks/form";

/* Components */
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

export default function PasswordReset({match}) {
	const classes = useStyles();

	const history = useHistory();

	const [loading, setLoading] = useState(false);
	const [isValidId, setIsValidId] = useState(null);

	const {passwordResetId} = match.params;

	// On mount
	useEffect(() => {
		(async function () {
			try {
				await userService.validateResetId(passwordResetId); // Make sure that ID is valid
				setIsValidId(true);
			} catch (err) {
				setIsValidId(false);
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const schema = {
		password: Joi.string().min(8).max(72).required().label("Password"),
		passwordConfirm: Joi.string()
			.equal(Joi.ref("password"))
			.required()
			.label("Password confirmation")
			.messages({"any.only": "Passwords do not match"}),
	};

	/* Custom hook for form validation and submission */
	const {inputs, errors, handleFormSubmit, handleFormChange} = useForm(schema, async () => {
		const userData = {...inputs};

		try {
			setLoading(true);
			await userService.resetPassword(passwordResetId, userData);
			Swal.fire({
				title: "Password successfully changed!",
				text: "Your password has been successfully changed! Don't forget it! :)",
				icon: "success",
				willClose: () => {
					history.replace("/login");
				},
			});
		} catch (err) {
			setLoading(false);
		}
	});

	if (isValidId !== null && !isValidId) return <Redirect to="/" />; // Redirect if ID is invalid

	if (!isValidId)
		return (
			<Grid container justify="center" className={classes.loadingPage}>
				<CircularProgress color="secondary" />
			</Grid>
		);

	return (
		<Container component="main" maxWidth="xs">
			<CssBaseline />
			<div className={classes.paper}>
				<Avatar className={classes.avatar}>
					<AutorenewRoundedIcon />
				</Avatar>
				<Typography component="h1" variant="h5">
					Change Password
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
						Change Password
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
