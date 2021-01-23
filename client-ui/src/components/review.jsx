import React, {useEffect, useState} from "react";

import Joi from "joi/dist/joi-browser.min.js";

import {makeStyles} from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import {CircularProgress} from "@material-ui/core";

import RateReviewRoundedIcon from "@material-ui/icons/RateReviewRounded";

/* Components */
import Copyright from "./common/copyright";

/* Hooks */
import useForm from "../hooks/form";

/* Services */
import userDataService from "../services/userDataService";

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
	button: {
		margin: theme.spacing(3, 0, 2),
	},
	loading: {
		position: "absolute",
		margin: "0 auto",
	},
}));

export default function Review({gameData, reviewData, closeDialog}) {
	const classes = useStyles();
	const [loading, setLoading] = useState(false);

	const schema = {
		content: Joi.string().max(3000).required(),
	};

	const {inputs, setInputs, errors, handleFormSubmit, handleFormChange} = useForm(schema, async () => {
		const userData = {...inputs};

		const data = {
			gameData,
			userData,
		};

		if (!reviewData) {
			try {
				setLoading(true);
				await userDataService.addGameReview(data);
				closeDialog();
			} catch (err) {
				setLoading(false);
			}
		} else {
			try {
				setLoading(true);
				reviewData.content = inputs.content; // Update content
				await userDataService.updateGameReview(reviewData);
				closeDialog();
			} catch (err) {
				setLoading(false);
			}
		}
	});

	useEffect(() => {
		if (!reviewData) return;
		setInputs({content: reviewData.content});

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Container component="main" maxWidth="xs">
			<CssBaseline />
			<div className={classes.paper}>
				<Avatar className={classes.avatar}>
					<RateReviewRoundedIcon />
				</Avatar>
				<Typography align="center" component="h1" variant="h5">
					{!!reviewData ? "Editing review:" : "Reviewing: "} {gameData.title}
				</Typography>
				<form
					className={classes.form}
					noValidate
					onSubmit={handleFormSubmit}
					onChange={handleFormChange}>
					<TextField
						value={inputs.content}
						variant="outlined"
						margin="normal"
						size="medium"
						fullWidth
						multiline={true}
						rows={10}
						id="content"
						label="Tell us you think about the game"
						name="content"
						autoComplete="content"
						autoFocus
						error={!!errors["content"]}
						helperText={errors["content"]}
					/>

					<Button
						type="submit"
						fullWidth
						variant="contained"
						color="primary"
						className={classes.button}
						disabled={!errors.noErrors || loading}>
						Post Review
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
