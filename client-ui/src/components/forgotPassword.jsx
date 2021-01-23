import React, {useState} from "react";
import Joi from "joi/dist/joi-browser.min.js";
import Swal from "sweetalert2";

import {makeStyles} from "@material-ui/core/styles";
import {useHistory} from "react-router-dom";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Box from "@material-ui/core/Box";
import AutorenewRoundedIcon from "@material-ui/icons/AutorenewRounded";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import {CircularProgress} from "@material-ui/core";

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

export default function ForgotPassword({match}) {
	const classes = useStyles();

	const history = useHistory();
	const [loading, setLoading] = useState(false);

	const schema = {
		email: Joi.string().trim().min(5).max(254).email({tlds: false}).required().label("Email"),
	};

	/* Custom hook for form validation and submission */
	const {inputs, errors, setErrors, handleFormSubmit, handleFormChange} = useForm(schema, async () => {
		const userData = {...inputs};

		try {
			setLoading(true);
			await userService.requestPasswordChange(userData);
			setLoading(false);
			Swal.fire({
				title: "Email has been sent!",
				text: "Check your email's inbox and/or spam for the reset link!",
				icon: "success",
				willClose: () => {
					history.replace("/");
				},
			});
		} catch (err) {
			if (err && err.response && err.response.status === 400) {
				setErrors({email: "Email is not registered!"});
			}
			setLoading(false);
		}
	});

	return (
		<Container component="main" maxWidth="xs">
			<CssBaseline />
			<div className={classes.paper}>
				<Avatar className={classes.avatar}>
					<AutorenewRoundedIcon />
				</Avatar>
				<Typography component="h1" variant="h5">
					Enter your email
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
						id="email"
						label="Email Address"
						name="email"
						autoComplete="email"
						autoFocus
						error={!!errors["email"]}
						helperText={errors["email"]}
					/>
					<Button
						type="submit"
						fullWidth
						variant="contained"
						color="secondary"
						className={classes.submit}
						disabled={!errors.noErrors || loading}>
						Reset
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
