import React, {useContext, useEffect, useState} from "react";
import {Redirect} from "react-router-dom";
import Joi from "joi/dist/joi-browser.min.js";
import Swal from "sweetalert2";

import {makeStyles} from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import {CircularProgress} from "@material-ui/core";
import VpnKeyRoundedIcon from "@material-ui/icons/VpnKeyRounded";

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
	h1: {
		marginTop: "20px",
		textAlign: "center",
	},
	h4: {
		marginTop: "20px",
		textAlign: "center",
	},
	h5: {
		marginTop: "60px",
		textAlign: "center",
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
	loadingPage: {
		marginTop: "100px",
	},
	confirmationCode: {
		maxWidth: "150px",
	},
	font: {
		textAlign: "center",
		fontSize: "25px",
	},
}));

export default function EmailConfirm({match, redirect = true}) {
	const classes = useStyles();
	const {user, setUser} = useContext(UserContext);

	const [loading, setLoading] = useState(false);
	const [isValidId, setIsValidId] = useState(null);

	const {confirmId} = match.params;

	// On mount
	useEffect(() => {
		(async function () {
			try {
				await userService.validateConfirmId(confirmId); // Make sure that ID is valid
				setIsValidId(true);
			} catch (err) {
				setIsValidId(false);
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const schema = {
		confirmationCode: Joi.string().trim().length(6).required().label("Confirmation Code"),
	};

	/* Custom hook for form validation and submission */
	const {inputs, errors, setErrors, handleFormSubmit, handleFormChange} = useForm(schema, async () => {
		const userData = {...inputs};

		try {
			setLoading(true);
			await userService.confirmEmail(confirmId, userData); // Send confirmation code to server and validate
			Swal.fire({
				title: "Successfully verified!",
				text: "Your account has been verified and activated! Enjoy!",
				icon: "success",
				willClose: () => {
					setUser(userService.getCurrentUser()); // Set user on success
				},
			});
		} catch (err) {
			if (err && err.response && err.response.status === 400) {
				setErrors({confirmationCode: "Invalid confirmation code!"});
			}
			setLoading(false);
		}
	});

	if (isValidId !== null && !isValidId) return <Redirect to="/" />; // Redirect if ID is invalid

	if (user && redirect) return <Redirect to="/" />; // Already signed in

	if (!isValidId)
		return (
			<Grid container justify="center" className={classes.loadingPage}>
				<CircularProgress color="secondary" />
			</Grid>
		);

	return (
		<Container component="main" maxWidth="xs">
			<Typography component="h5" variant="h5" className={classes.h5}>
				Please confirm your email to continue. <br />
				We've sent you an email containing a confirmation code. <br />
				Check your inbox and/or spam.
			</Typography>
			<CssBaseline />
			<div className={classes.paper}>
				<Avatar className={classes.avatar}>
					<VpnKeyRoundedIcon />
				</Avatar>
				<Typography component="h1" variant="h5">
					Enter confirmation code
				</Typography>
				<form
					className={classes.form}
					noValidate
					onSubmit={handleFormSubmit}
					onChange={handleFormChange}>
					<Grid container direction="column" alignItems="center">
						<Grid item>
							<TextField
								className={classes.confirmationCode}
								InputProps={{
									classes: {
										input: classes.font,
									},
								}}
								variant="standard"
								margin="normal"
								required
								id="confirmationCode"
								label="Confirmation Code"
								name="confirmationCode"
								autoComplete="confirmationCode"
								autoFocus
								error={!!errors["confirmationCode"]}
								helperText={errors["confirmationCode"]}
							/>
						</Grid>
						<Grid item>
							<Button
								type="submit"
								variant="contained"
								color="secondary"
								className={classes.submit}
								disabled={!errors.noErrors || loading}>
								Verify
								{loading && (
									<CircularProgress
										size={24}
										color="secondary"
										className={classes.loading}
									/>
								)}
							</Button>
						</Grid>
					</Grid>
				</form>
			</div>
			<Box mt={8}>
				<Copyright />
			</Box>
		</Container>
	);
}
