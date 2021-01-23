import React, {Component} from "react";
import {Link} from "react-router-dom";

import {
	Divider,
	FormControl,
	FormGroup,
	Grid,
	InputLabel,
	MenuItem,
	Select,
	Typography,
	Button,
	withStyles,
	CircularProgress,
	Zoom,
	Tooltip,
	IconButton,
} from "@material-ui/core";

import AddCircleOutlineRoundedIcon from "@material-ui/icons/AddCircleOutlineRounded";
import RemoveCircleOutlineRoundedIcon from "@material-ui/icons/RemoveCircleOutlineRounded";
import FavoriteRoundedIcon from "@material-ui/icons/FavoriteRounded";
import RateReviewRoundedIcon from "@material-ui/icons/RateReviewRounded";
import AddCommentRoundedIcon from "@material-ui/icons/AddCommentRounded";

/* Components */
import MediaCard from "./common/mediaCard";
import FormDialog from "./common/formDialog";
import CardsContainer from "./common/cardsContainer";
import Login from "./login";
import BackToTopButton from "./common/backToTopButton";
import Review from "./review";

/* Config */
import config from "../config/config.json";

/* Context */
import UserContext from "../contexts/userContext";

/* Services */
import userDataService from "../services/userDataService";
import gamesService from "../services/gamesService";

const styles = (theme) => ({
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
	small: {
		fontSize: "12px",
		color: theme.palette.primary.main,
	},
	formGroup: {
		display: "flex",
		justifyContent: "center",
		width: "40vw",
		[theme.breakpoints.down("sm")]: {
			width: "80vw",
		},
		margin: "20px auto",
	},
	hr: {
		width: "85vw",
		margin: "0 auto",
	},
	hrShort: {
		width: "50vw",
		margin: "10px auto",
	},
	buttonProgressFavorite: {
		position: "absolute",
		right: "0",
	},
	buttonProgressPlaylist: {
		position: "absolute",
		margin: "0 auto",
	},
	joinButton: {
		fontSize: "1rem",
	},
	link: {
		color: theme.palette.primary.main,
		"&:visited": {
			color: theme.palette.primary.dark,
		},
	},
});

class Home extends Component {
	constructor(props) {
		super(props);

		this.uniques = new Set(); // Using a set to ensure uniques
	}

	state = {
		deals: [],
		nextPage: 0,
		sortBy: "metacritic",
		showLoginDialog: false,
		showReviewDialog: false,
		gameData: {},
		reviewData: false,
		toPlaylist: [],
		userFavorites: [],
		userReviews: [],
		allFavorites: [],
		allReviews: [],
		processingPlaylist: {},
		processingFavorites: {},
		processingReviews: {},
		loading: true,
	};

	async componentDidMount() {
		const {user} = this.context;

		await Promise.all([this.fetchAllFavorites(), this.fetchAllReviews()]);
		if (!user) this.setState({loading: false});

		// Logged user only
		if (user) {
			await Promise.all([this.fetchUserFavorites(), this.fetchUserReviews(), this.fetchPlaylist()]);
			this.setState({loading: false});
		}
	}

	async componentDidUpdate(prevProps, prevState) {
		const {user} = this.context;
		if (prevState.sortBy !== this.state.sortBy) {
			this.uniques.clear(); // Clear uniques
			this.setState({deals: [], nextPage: 0}); // Clear deals
			if (!this.state.deals.length) await this.fetchDeals(); // Fetch if the cards container's didn't
		}

		// Close dialog on login
		if (user && this.state.showLoginDialog) {
			this.closeLoginDialog();
			await Promise.all([this.fetchUserFavorites(), this.fetchPlaylist()]); // Get user's favorites and playlist
		}
	}

	/* Fetch helpers */
	async fetchPlaylist() {
		try {
			const toPlaylist = await userDataService.getToPlaylist();
			this.setState({toPlaylist});
		} catch (err) {
			console.log("An unexpected error has occurred!");
		}
	}

	async fetchUserReviews() {
		try {
			const userReviews = await userDataService.getUserReviews();
			this.setState({userReviews});
		} catch (err) {
			console.log("An unexpected error has occurred!");
		}
	}

	async fetchUserFavorites() {
		try {
			const userFavorites = await userDataService.getUserFavorites();
			this.setState({userFavorites});
		} catch (err) {
			console.log("An unexpected error has occurred!");
		}
	}

	async fetchAllFavorites() {
		try {
			const allFavorites = await userDataService.getAllFavorites();
			this.setState({allFavorites});
		} catch (err) {
			console.log("An unexpected error has occurred!");
		}
	}

	async fetchAllReviews() {
		try {
			const allReviews = await userDataService.getAllReviews();
			this.setState({allReviews});
		} catch (err) {
			console.log("An unexpected error has occurred!");
		}
	}

	fetchDeals = async () => {
		let deals = await gamesService.getDeals({
			pageNumber: this.state.nextPage,
			storeID: 1,
			sortBy: this.state.sortBy,
			pageSize: 30,
		});

		const uniqueDeals = [];

		// Iterate over fetched deals, insert into set if doesn't exist
		for (const deal of deals) {
			if (!this.uniques.has(deal.internalName)) {
				this.uniques.add(deal.internalName);
				uniqueDeals.push(deal);
			}
		}

		this.setState((prevState) => {
			return {
				deals: [...prevState.deals, ...uniqueDeals],
				nextPage: prevState.nextPage + 1,
			};
		});
	};

	/* Change handlers */
	handleChange = (ev) => {
		this.setState({sortBy: ev.target.value});
	};

	/* Login dialog */
	promtLogin = () => {
		this.setState({showLoginDialog: true});
	};

	closeLoginDialog = () => {
		this.setState({showLoginDialog: false});
	};

	/* Review dialog */
	promtReview = (title, gameId, image, inReviews) => {
		const {user} = this.context;
		if (!user) return this.promtLogin();

		this.setState({
			showReviewDialog: true,
			gameData: {title, gameId, image}, // Needed incase the game doesn't exist in the database
			reviewData: inReviews,
		});
	};

	closeReviewDialog = async () => {
		this.setState({showReviewDialog: false});
		await Promise.all([this.fetchUserReviews(), this.fetchAllReviews()]);
	};

	/* Card action buttons*/
	goToDeal = (dealId) => {
		window.open(`${config.CHEAPSHARK_DEAL_REDIRECT}=${dealId}`, "_blank");
	};

	toggleGameInPlaylist = async (title, gameId, image, inList) => {
		// Promt login if not logged
		const {user} = this.context;
		if (!user) return this.promtLogin();

		const {processingPlaylist} = {...this.state};

		processingPlaylist[gameId] = true;
		this.setState({processingPlaylist});
		try {
			// Add to user's playlist if doesn't exist, remove if it does
			if (!inList) {
				await userDataService.addToPlaylist({title, gameId, image});
			} else {
				await userDataService.deleteFromToPlaylist(inList._id);
			}
		} catch (err) {
			console.log("An unexpected error has occurred!");
		}

		await this.fetchPlaylist(); // Get updated playlist

		delete processingPlaylist[gameId];
		this.setState({processingPlaylist});
	};

	toggleGameInFavorites = async (title, gameId, image, inFavorites) => {
		// Promt login if not logged
		const {user} = this.context;
		if (!user) return this.promtLogin();

		const {processingFavorites} = {...this.state};

		if (processingFavorites[gameId]) return;

		processingFavorites[gameId] = true;
		this.setState({processingFavorites});

		try {
			// Add to user's favorites if doesn't exist, remove if it does
			if (!inFavorites) {
				await userDataService.addToFavorites({title, gameId, image});
			} else {
				await userDataService.deleteFromToFavorites(inFavorites._id);
			}
		} catch (err) {
			console.log("An unexpected error has occurred!");
		}

		await Promise.all([this.fetchUserFavorites(), this.fetchAllFavorites()]); // Get updated favorites

		delete processingFavorites[gameId];
		this.setState({processingFavorites});
	};

	render() {
		const {classes} = {...this.props};

		const {
			sortBy,
			deals,
			showLoginDialog,
			showReviewDialog,
			gameData,
			reviewData,
			toPlaylist,
			userFavorites,
			userReviews,
			allFavorites,
			allReviews,
			processingPlaylist,
			processingFavorites,
			loading,
		} = this.state;

		const {user} = this.context;

		return (
			<div>
				<Typography gutterBottom variant="h3" component="h1" className={classes.h1}>
					{user ? "Discover new games!" : "Love games?"}
				</Typography>
				<Divider className={classes.hrShort} />
				<Typography gutterBottom variant="h4" component="h4" className={classes.h4}>
					{!user ? (
						<>
							Here you can search for the best deals, review games,
							<br /> add them to your to-play list and more!
							<br />
							So&nbsp;
							<Button
								className={classes.joinButton}
								component={Link}
								to="/register"
								variant="contained"
								color="secondary">
								join today!
							</Button>
						</>
					) : (
						"Search for new games to play and find the best deals!"
					)}
				</Typography>
				<Typography gutterBottom variant="h5" component="h5" className={classes.h5}>
					Browse the thousands of game deals below!
				</Typography>
				<FormGroup className={classes.formGroup}>
					<FormControl>
						<InputLabel id="select-sortBy-label">Sort by</InputLabel>
						<Select id="select-sortBy" value={sortBy} onChange={this.handleChange}>
							<MenuItem value="deal rating">Deal Rating</MenuItem>
							<MenuItem value="title">Title</MenuItem>
							<MenuItem value="savings">Savings</MenuItem>
							<MenuItem value="price">Price</MenuItem>
							<MenuItem value="metacritic">Metacritic Score</MenuItem>
							<MenuItem value="reviews">Steam Reviews</MenuItem>
							<MenuItem value="release">Release Date</MenuItem>
							<MenuItem value="recent">Recent Deals</MenuItem>
						</Select>
					</FormControl>
				</FormGroup>

				<CardsContainer fetch={this.fetchDeals} fetchOnce={false}>
					{!loading &&
						deals.length > 0 &&
						deals.map((deal, index) => {
							/* TODO: Replace the abominations below with a more efficient way (hashtables??? Rewrite the whole thing??? ¯\_(ツ)_/¯ ) */
							const inList = toPlaylist.find(
								(game) => String(game.gameId) === String(deal.gameID)
							);

							const inFavorites = userFavorites.find(
								(game) => String(game.gameId) === String(deal.gameID)
							);

							const inReviews = userReviews.find(
								(game) => String(game.gameId) === String(deal.gameID)
							);

							let reviewCount = 0;
							for (const review of allReviews) {
								if (String(review.gameId) === String(deal.gameID)) {
									reviewCount++;
								}
							}

							let favoriteCount;
							for (const favorite of allFavorites) {
								if (String(favorite.gameId) === String(deal.gameID)) {
									favoriteCount = favorite.favoriteCount;
									break;
								}
							}

							return (
								<Grid key={index} item>
									<MediaCard
										title={deal.title}
										gameId={deal.gameID}
										img={deal.thumb.replace("capsule_sm_120", "header")}
										dealId={deal.dealID}
										extraInfo={reviewCount > 0 && `This game has ${reviewCount} reviews`}
										playlistUpdate={[!!processingPlaylist[deal.gameID], !!inList]}
										favoritesUpdate={[
											!!processingFavorites[deal.gameID],
											!!inFavorites,
											favoriteCount,
										]}
										reviewsUpdate={[!!inReviews, reviewCount]}>
										<Grid container justify="space-between" alignItems="center">
											<Grid item>
												<Button
													onClick={() => this.goToDeal(deal.dealID)}
													size="small"
													color="primary">
													Go to deal
												</Button>
												<Tooltip
													TransitionComponent={Zoom}
													placement="bottom"
													arrow
													title={
														inList
															? "Remove game from to-play list"
															: "Add game to to-play list"
													}>
													{/* Span needed for event triggering, disabled buttons does not trigger event needed for tooltip */}
													<span>
														<Button
															disabled={!!processingPlaylist[deal.gameID]}
															onClick={() =>
																this.toggleGameInPlaylist(
																	deal.title,
																	deal.gameID,
																	deal.thumb.replace(
																		"capsule_sm_120",
																		"header"
																	),
																	inList
																)
															}
															size="small"
															color={inList ? "secondary" : "primary"}>
															{inList ? (
																<RemoveCircleOutlineRoundedIcon />
															) : (
																<AddCircleOutlineRoundedIcon />
															)}
															{!!processingPlaylist[deal.gameID] && (
																<CircularProgress
																	size={24}
																	className={classes.buttonProgressPlaylist}
																/>
															)}
														</Button>
													</span>
												</Tooltip>
											</Grid>
											<Grid item>
												<Tooltip
													TransitionComponent={Zoom}
													placement="bottom"
													arrow
													title={inReviews ? "Edit review" : "Add review"}>
													<span>
														<IconButton
															onClick={() =>
																this.promtReview(
																	deal.title,
																	deal.gameID,
																	deal.thumb.replace(
																		"capsule_sm_120",
																		"header"
																	),
																	inReviews
																)
															}
															color="primary"
															aria-label="review game">
															{inReviews ? (
																<RateReviewRoundedIcon color="secondary" />
															) : (
																<AddCommentRoundedIcon />
															)}
														</IconButton>
													</span>
												</Tooltip>
											</Grid>
											<Grid item>
												<Tooltip
													TransitionComponent={Zoom}
													placement="bottom"
													arrow
													title={
														inFavorites
															? "Remove from favorites"
															: "Add to favorites"
													}>
													<span>
														<IconButton
															onClick={() =>
																this.toggleGameInFavorites(
																	deal.title,
																	deal.gameID,
																	deal.thumb.replace(
																		"capsule_sm_120",
																		"header"
																	),
																	inFavorites
																)
															}
															aria-label="toggle favorite"
															style={inFavorites ? {color: "red"} : {}}>
															{!!processingFavorites[deal.gameID] && (
																<CircularProgress
																	size={10}
																	color="primary"
																	className={classes.buttonProgressFavorite}
																/>
															)}
															<small className={classes.small}>
																{favoriteCount}
															</small>
															<FavoriteRoundedIcon />
														</IconButton>
													</span>
												</Tooltip>
											</Grid>
										</Grid>
									</MediaCard>
								</Grid>
							);
						})}
					<BackToTopButton />
					<FormDialog
						title="Review a game"
						description="Write a review to tell others what you think about the game!"
						showDialog={showReviewDialog}
						closeDialog={this.closeReviewDialog}>
						<Review
							gameData={gameData}
							reviewData={reviewData}
							closeDialog={this.closeReviewDialog}
						/>
					</FormDialog>
					<FormDialog
						title="Please log in"
						description="You must login to in order to perform this action"
						showDialog={showLoginDialog}
						closeDialog={this.closeLoginDialog}>
						<Login redirect={false} />
					</FormDialog>
				</CardsContainer>
			</div>
		);
	}
}

Home.contextType = UserContext;

export default withStyles(styles)(Home);
