import React, {useContext, useEffect, useState} from "react";

import {makeStyles} from "@material-ui/core/styles";
import {
	Card,
	CardContent,
	CircularProgress,
	Divider,
	Grid,
	IconButton,
	Tooltip,
	Zoom,
} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";

import RateReviewRoundedIcon from "@material-ui/icons/RateReviewRounded";

/* Components */
import FormDialog from "./common/formDialog";

/* Services */
import userDataService from "../services/userDataService";
import Review from "./review";

/* Сontext */
import UserContext from "../contexts/userContext";
import {Redirect} from "react-router-dom";

const useStyles = makeStyles((theme) => ({
	root: {
		width: "85%",
		margin: "50px auto",
	},
	heading: {
		fontSize: theme.typography.pxToRem(15),
		fontWeight: theme.typography.fontWeightRegular,
	},
	content: {
		whiteSpace: "pre",
		margin: "20px 0",
	},
	hrShort: {
		width: "50vw",
		margin: "10px auto",
	},
	noResultsMessage: {
		fontSize: "25px",
		marginTop: "50px",
	},
	loading: {
		width: "85vw",
		margin: "50px auto",
		textAlign: "center",
	},
}));

export default function GameReviews({match, location}) {
	const classes = useStyles();

	const [reviews, setReviews] = useState([]);
	const [userReviews, setUserReviews] = useState([]);
	const [showReviewDialog, setShowReviewDialog] = useState(false);
	const [reviewData, setReviewData] = useState(null);
	const [gameData, setGameData] = useState(null);
	const [loading, setLoading] = useState(true);

	const {user} = useContext(UserContext);

	// On mount
	useEffect(() => {
		(async function init() {
			await fetchGameReviews();

			if (!user) return;
			const userReviews = await userDataService.getUserReviews();
			setUserReviews(userReviews);
		})();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (!user) return <Redirect to="/login" />;

	if (!(location && location.state)) return null;
	const title = location.state.title;

	/* Fetch helpers */
	async function fetchGameReviews() {
		if (!(match && match.params)) return;
		const gameId = match.params.gameId;

		const reviews = await userDataService.getReviewsByGameId(gameId);
		setReviews(reviews);
		setLoading(false);
	}

	/* Review dialog */
	function promtReview(gameId, inReviews) {
		setShowReviewDialog(true);

		setReviewData(inReviews);
		setGameData({title, gameId});
	}

	async function closeReviewDialog() {
		setShowReviewDialog(false);
		await fetchGameReviews();
	}

	return (
		<div className={classes.root}>
			<Typography align="center" variant="h3" component="h1">
				Showing reviews for {title}
			</Typography>

			<Divider className={classes.hrShort} />
			{reviews.map((review) => {
				const inReviews = userReviews.find((game) => String(game._id) === String(review._id));

				return (
					<Card key={review.createdAt} className={classes.root}>
						<CardContent>
							<Grid container justify="space-between">
								<Typography className={classes.title} color="textPrimary" gutterBottom>
									<strong>Author:</strong> {review.author}
									<br />
									<strong>Posted On:</strong> {new Date(review.createdAt).toUTCString()}
								</Typography>

								{inReviews && (
									<Grid item>
										<Tooltip
											TransitionComponent={Zoom}
											placement="bottom"
											arrow
											title="Edit review">
											<span>
												<IconButton
													onClick={() => promtReview(review.gameId, inReviews)}
													color="primary"
													aria-label="review game">
													<RateReviewRoundedIcon color="secondary" />
												</IconButton>
											</span>
										</Tooltip>
									</Grid>
								)}
							</Grid>
							<Divider />
							<Typography variant="h6" component="body1" className={classes.content}>
								{review.content}
							</Typography>
							<br />
							{review.lastEditedAt && (
								<Typography variant="body2" component="body2" color="textSecondary">
									Last edit at: {new Date(review.lastEditedAt).toUTCString()}
								</Typography>
							)}
						</CardContent>
					</Card>
				);
			})}

			{loading && (
				<Grid container justify="center" className={classes.loading}>
					<CircularProgress color="secondary" />
				</Grid>
			)}
			{!loading && !reviews.length && (
				<Grid
					container
					justify="center"
					alignItems="center"
					direction="column"
					align="center"
					className={classes.noResultsMessage}>
					<Grid item>
						<i>There doesn't seem to be any reviews for {title}!</i>
					</Grid>
				</Grid>
			)}
			<FormDialog
				title="Review a game"
				description="Write a review to tell others what you think about the game!"
				showDialog={showReviewDialog}
				closeDialog={closeReviewDialog}>
				<Review gameData={gameData} reviewData={reviewData} closeDialog={closeReviewDialog} />
			</FormDialog>
		</div>
	);
}
