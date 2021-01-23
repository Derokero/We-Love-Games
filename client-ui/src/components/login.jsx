import React, {useContext, useState} from "react";
import {Link as RouterLink, Redirect, useHistory} from "react-router-dom";
import Joi from "joi/dist/joi-browser.min.js";

import {makeStyles} from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Tooltip from "@material-ui/core/Tooltip";
import Zoom from "@material-ui/core/Zoom";
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

export default function Login({redirect = true}) {
	const classes = useStyles();
	const {user, setUser} = useContext(UserContext);

	const history = useHistory();

	const [loading, setLoading] = useState(false);

	const schema = {
		email: Joi.string().trim().min(5).max(254).email({tlds: false}).required().label("Email"),
		password: Joi.string().required().label("Password"),
		stayLogged: Joi.string(),
	};

	/* Custom hook for form validation and submission */
	const {inputs, errors, setErrors, handleFormSubmit, handleFormChange} = useForm(schema, async () => {
		const userData = {...inputs};

		try {
			setLoading(true);
			const confirmationId = await userService.login(userData); // Will return a confirmation ID if account is not confirmed
			if (confirmationId) return history.replace(`/email-confirm/${confirmationId}`);

			setUser(userService.getCurrentUser());
		} catch (err) {
			if (err && err.response && err.response.status === 400) {
				setErrors({email: "Invalid email or password!"});
			}
			setLoading(false);
		}
	});

	if (user && redirect) return <Redirect to="/" />; // Already signed in

	return (
		<Container component="main" maxWidth="xs">
			<CssBaseline />
			<div className={classes.paper}>
				<Avatar className={classes.avatar}>
					<LockOutlinedIcon />
				</Avatar>
				<Typography component="h1" variant="h5">
					Login
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
					<Tooltip
						TransitionComponent={Zoom}
						placement="bottom"
						arrow
						title="Will trust this computer, and stay logged in indefinitely, unless you logout!">
						<FormControlLabel
							control={<Checkbox value="stayLogged" color="secondary" id="stayLogged" />}
							label="Stay logged in"
						/>
					</Tooltip>
					<Button
						type="submit"
						fullWidth
						variant="contained"
						color="secondary"
						className={classes.submit}
						disabled={!errors.noErrors || loading}>
						Login
						{loading && (
							<CircularProgress size={24} color="secondary" className={classes.loading} />
						)}
					</Button>
					<Grid container>
						<Grid item xs>
							<Link component={RouterLink} to="/forgot-password" variant="body2">
								Forgot password?
							</Link>
						</Grid>
						<Grid item>
							<Link component={RouterLink} to="/register" variant="body2">
								{"Don't have an account? Register here!"}
							</Link>
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
