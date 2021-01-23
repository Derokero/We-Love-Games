import React, {Component} from "react";
import {Link, Redirect} from "react-router-dom";
import Swal from "sweetalert2";

import {
	Divider,
	Grid,
	Typography,
	Button,
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
	swal2: {
		color: "red",
	},
});

class ToPlaylist extends Component {
	state = {
		toPlaylist: [],
		userFavorites: [],
		processingFavorites: {},
		loading: true,
		filteredList: [],
		searchTerm: "",
	};

	async componentDidMount() {
		const {user} = this.context;
		if (!user) return;
		await this.fetchUserFavorites();
	}

	/* Change hanlders */
	handlechange = (ev) => {
		const {toPlaylist} = this.state;

		// Clear search field on escape key
		if (ev.type === "keydown" && ev.keyCode === 27)
			return this.setState({searchTerm: "", filteredList: toPlaylist});

		const searchTerm = ev.target.value;
		this.setState({searchTerm});

		const filtered = toPlaylist.filter((game) =>
			game.title.toLowerCase().includes(searchTerm.toLowerCase())
		);
		this.setState({filteredList: filtered});
	};

	/* Fetch helpers */
	async fetchUserFavorites() {
		try {
			const userFavorites = await userDataService.getUserFavorites();
			this.setState({userFavorites});
		} catch (err) {
			console.log("An unexpected error has occurred!");
		}
	}

	fetchPlaylist = async () => {
		const toPlaylist = await userDataService.getToPlaylist();
		this.setState({toPlaylist, filteredList: toPlaylist, loading: false});
	};

	/* Card action buttons*/
	removeFromList = (_id) => {
		const {toPlaylist, searchTerm} = this.state;

		Swal.fire({
			title: "Are you sure?",
			text: "You won't be able to revert this!",
			icon: "warning",
			showCancelButton: true,
			showLoaderOnConfirm: true,
			confirmButtonColor: "#1976d2",
			cancelButtonColor: "#d84315",
			confirmButtonText: "Yes, delete it!",
			preConfirm: async () => {
				await userDataService.deleteFromToPlaylist(_id);
			},
		}).then(async (result) => {
			if (result.isConfirmed) {
				try {
					const newList = toPlaylist.filter((game) => game._id !== _id);
					const newFilteredList = newList.filter((game) =>
						game.title.toLowerCase().includes(searchTerm.toLowerCase())
					);
					this.setState({toPlaylist: newList, filteredList: newFilteredList});
				} catch (err) {
					console.log("An unexpected error has occurred!");
				}
				Swal.fire("Deleted!", "Game deleted from to-play list!", "success");
			}
		});
	};

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

		await Promise.all([this.fetchPlaylist(), this.fetchUserFavorites()]);

		delete processingFavorites[gameId];
		this.setState({processingFavorites});
	};

	render() {
		const {classes} = {...this.props};
		const {
			toPlaylist,
			filteredList,
			userFavorites,
			processingFavorites,
			loading,
			searchTerm,
		} = this.state;

		const {user} = this.context;

		if (!user) return <Redirect to="/login" />; // Only for logged in users

		return (
			<div>
				<Typography gutterBottom variant="h3" component="h1" className={classes.h1}>
					To-Play List
				</Typography>
				<Divider className={classes.hrShort} />
				<Typography gutterBottom variant="h4" component="h4" className={classes.h4}>
					Here you can decide which games to play next!
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
							this.setState({searchTerm: "", filteredList: toPlaylist});
						}}
						className={classes.clearSearchButton}
					/>
				</FormControl>

				<CardsContainer fetch={this.fetchPlaylist} fetchOnce={true}>
					{!loading &&
						filteredList.length > 0 &&
						filteredList.map((game, index) => {
							const inFavorites = userFavorites.find(
								(favorite) => String(favorite.gameId) === String(game.gameId)
							);

							let favoriteCount;
							for (const favorite of filteredList) {
								if (String(favorite.gameId) === String(game.gameId)) {
									favoriteCount = game.favoriteCount || null;
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
										favoritesUpdate={[
											!!processingFavorites[game.gameId],
											!!inFavorites,
											favoriteCount,
										]}>
										<Grid container justify="space-between" alignItems="center">
											<Grid item>
												<Button
													onClick={() => this.removeFromList(game._id)}
													size="small"
													color={true ? "secondary" : "primary"}>
													Remove From List
												</Button>
											</Grid>

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
													<small className={classes.small}>{favoriteCount}</small>
													<FavoriteRoundedIcon />
												</IconButton>
											</Grid>
										</Grid>
									</MediaCard>
								</Grid>
							);
						})}
					{!loading && !toPlaylist.length && !filteredList.length && (
						<Grid
							container
							justify="center"
							alignItems="center"
							direction="column"
							align="center"
							className={classes.noResultsMessage}>
							<Grid item>
								<i>Your list is empty!</i>
							</Grid>
							<Grid item>
								<i>
									Discover more games{" "}
									<Link to="/" className={classes.link}>
										here!
									</Link>
								</i>
							</Grid>
						</Grid>
					)}
					{!loading && toPlaylist.length > 0 && !filteredList.length && (
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

ToPlaylist.contextType = UserContext;

export default withStyles(styles)(ToPlaylist);
