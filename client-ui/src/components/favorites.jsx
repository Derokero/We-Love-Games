import React, {Component} from "react";
import {Redirect} from "react-router-dom";

import {
	Divider,
	Grid,
	Typography,
	withStyles,
	TextField,
	FormControl,
	IconButton,
	CircularProgress,
} from "@material-ui/core";

import ClearIcon from "@material-ui/icons/Clear";
import FavoriteRoundedIcon from "@material-ui/icons/FavoriteRounded";

/* Components */
import MediaCard from "./common/mediaCard";
import CardsContainer from "./common/cardsContainer";
import BackToTopButton from "./common/backToTopButton";

/* Services */
import userDataService from "../services/userDataService";

/* Context */
import UserContext from "../contexts/userContext";

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
		marginTop: "100px",
		textAlign: "center",
	},
	small: {
		fontSize: "12px",
		color: theme.palette.primary.main,
	},
	formControl: {
		display: "flex",
		justifyContent: "center",
		width: "30vw",
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
	link: {
		color: theme.palette.primary.main,
		"&:visited": {
			color: theme.palette.primary.dark,
		},
	},
	noResultsMessage: {
		fontSize: "25px",
	},
	clearSearchButton: {
		position: "absolute",
		bottom: "5px",
		right: "0",
	},
});

class Favorites extends Component {
	state = {
		userFavorites: [],
		allFavorites: [],
		loading: true,
		filteredList: [],
		processingFavorites: {},
		searchTerm: "",
	};

	async componentDidMount() {
		const {user} = this.context;
		if (!user) return;
		await this.fetchUserFavorites();
	}

	/* Change hanlders */
	handlechange = (ev) => {
		const {allFavorites} = this.state;

		// Clear search field on escape key
		if (ev.type === "keydown" && ev.keyCode === 27)
			return this.setState({searchTerm: "", filteredList: allFavorites});

		const searchTerm = ev.target.value;
		this.setState({searchTerm});

		const filtered = allFavorites.filter((game) =>
			game.title.toLowerCase().includes(searchTerm.toLowerCase())
		);
		this.setState({filteredList: filtered});
	};

	fetchAllFavorites = async () => {
		try {
			const allFavorites = await userDataService.getAllFavorites();
			this.setState({allFavorites, filteredList: allFavorites, loading: false});
		} catch (err) {
			console.log("An unexpected error has occurred!");
		}
	};

	async fetchUserFavorites() {
		try {
			const userFavorites = await userDataService.getUserFavorites();
			this.setState({userFavorites});
		} catch (err) {
			console.log("An unexpected error has occurred!");
		}
	}

	/* Card action buttons */
	toggleGameInFavorites = async (title, gameId, image, inFavorites) => {
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

		await Promise.all([this.fetchAllFavorites(), this.fetchUserFavorites()]);

		delete processingFavorites[gameId];
		this.setState({processingFavorites});
	};
	render() {
		const {classes} = {...this.props};
		const {
			allFavorites,
			userFavorites,
			filteredList,
			processingFavorites,
			loading,
			searchTerm,
		} = this.state;

		const sortedFilteredList = filteredList.sort((game1, game2) => {
			if (game1.favoriteCount > game2.favoriteCount) return -1;
			else if (game1.favoriteCount < game2.favoriteCount) return 1;
			else return 0;
		});

		const {user} = this.context;

		if (!user) return <Redirect to="/login" />; // Only for logged in users

		return (
			<div>
				<Typography gutterBottom variant="h3" component="h1" className={classes.h1}>
					Gamer's Top Favorites
				</Typography>
				<Divider className={classes.hrShort} />
				<Typography gutterBottom variant="h4" component="h4" className={classes.h4}>
					See what other gamers like!
				</Typography>

				<FormControl className={classes.formControl}>
					<TextField
						id="standard-basic"
						label="Search"
						value={searchTerm}
						onChange={this.handlechange}
						onKeyDown={this.handlechange}
					/>
					<ClearIcon
						onClick={() => {
							this.setState({searchTerm: "", filteredList: allFavorites});
						}}
						className={classes.clearSearchButton}
					/>
				</FormControl>

				<CardsContainer fetch={this.fetchAllFavorites} fetchOnce={true}>
					{!loading &&
						sortedFilteredList.length > 0 &&
						sortedFilteredList.map((game, index) => {
							const inFavorites = userFavorites.find(
								(favorite) => String(favorite.gameId) === String(game.gameId)
							);

							let favoriteCount;
							for (const favorite of sortedFilteredList) {
								if (String(favorite.gameId) === String(game.gameId)) {
									favoriteCount = game.favoriteCount;
									break;
								}
							}

							return (
								<Grid key={index} item onClick={this.handleClick}>
									<MediaCard
										title={game.title}
										gameId={game.gameId}
										img={game.image}
										extraInfo={
											game.reviews.length > 0 &&
											`This game has ${game.reviews.length} reviews`
										}
										favoritesUpdate={[!!processingFavorites[game.gameId], !!inFavorites]}>
										<Grid item>
											<IconButton
												onClick={() =>
													this.toggleGameInFavorites(
														game.title,
														game.gameId,
														game.image,
														inFavorites
													)
												}
												style={inFavorites ? {color: "red"} : {}}
												aria-label="toggle favorite">
												{!!processingFavorites[game.gameId] && (
													<CircularProgress
														size={10}
														color="primary"
														className={classes.buttonProgressFavorite}
													/>
												)}
												<FavoriteRoundedIcon />
												<small className={classes.small}>{favoriteCount}</small>
											</IconButton>
										</Grid>
									</MediaCard>
								</Grid>
							);
						})}
					{!loading && !allFavorites.length && !sortedFilteredList.length && (
						<Grid
							container
							justify="center"
							alignItems="center"
							direction="column"
							align="center"
							className={classes.noResultsMessage}>
							<Grid item>
								<i>There doesn't seem to be any favorites yet!</i>
							</Grid>
							<Grid item>
								<i>Be the first one to add a favorite game and share your ❤️ of games!</i>
							</Grid>
						</Grid>
					)}
					{!loading && allFavorites.length > 0 && !sortedFilteredList.length && (
						<Grid
							container
							justify="center"
							alignItems="center"
							className={classes.noResultsMessage}>
							<i>No games found!</i>
						</Grid>
					)}
				</CardsContainer>
				<BackToTopButton />
			</div>
		);
	}
}

Favorites.contextType = UserContext;

export default withStyles(styles)(Favorites);
