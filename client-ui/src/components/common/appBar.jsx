import React, {useContext} from "react";
import {NavLink} from "react-router-dom";

import {makeStyles} from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";
import Menu from "./menu";
import LockRoundedIcon from "@material-ui/icons/LockRounded";
import HomeRoundedIcon from "@material-ui/icons/HomeRounded";
import ListRoundedIcon from "@material-ui/icons/ListRounded";
import RecentActorsRoundedIcon from "@material-ui/icons/RecentActorsRounded";
import FavoriteRoundedIcon from "@material-ui/icons/FavoriteRounded";

/* Config */
import {APP_NAME} from "../../config/config.json";

/* Context */
import UserContext from "../../contexts/userContext";

const useStyles = makeStyles((theme) => ({
	root: {
		flexGrow: 1,
	},
	appBar: {
		backgroundColor: theme.palette.primary.main,
	},
	toolBar: {
		[theme.breakpoints.up("md")]: {
			width: "70vw",
			margin: "0 auto",
		},
	},
	menuButton: {
		// Mobile only
		marginRight: theme.spacing(2),
		[theme.breakpoints.up("sm")]: {
			display: "none",
		},
	},
	buttonGridLeft: {
		flexGrow: 1,
	},
	buttonGridRight: {},
	selected: {
		transitionDuration: "0ms",
		borderBottom: "3px solid",
		borderBottomColor: theme.palette.secondary.main,
	},
	divider: {
		backgroundColor: theme.palette.primary.light,
		[theme.breakpoints.down("xs")]: {
			display: "none",
		},
	},
	actionButtons: {
		[theme.breakpoints.up("sm")]: {
			marginRight: theme.spacing(4),
		},
		[theme.breakpoints.down("xs")]: {
			display: "none",
		},
	},
	title: {
		[theme.breakpoints.down("xs")]: {
			textAlign: "center",
		},
	},
}));

export default function ButtonAppBar() {
	const classes = useStyles();

	const {user} = useContext(UserContext);

	/* Navbar buttons */
	const buttonsRight = [
		{title: "Login", path: "/login", icon: <LockRoundedIcon />, visibleOnLogged: false},
		{title: "Register", path: "/register", icon: <RecentActorsRoundedIcon />, visibleOnLogged: false},
		{title: "Logout", path: "/logout", visibleOnLogged: true},
	];
	const buttonsLeft = [
		{title: "Home", path: "/", icon: <HomeRoundedIcon />},
		{title: "To-Play List", path: "/to-playlist", icon: <ListRoundedIcon />, visibleOnLogged: true},
		{title: "Top Favorites", path: "/favorites", icon: <FavoriteRoundedIcon />, visibleOnLogged: true},
	];

	return (
		<div className={classes.root}>
			<AppBar position="static" className={classes.appBar}>
				<Toolbar className={classes.toolBar}>
					<Grid container direction="row" justify="space-between" alignItems="center" wrap="nowrap">
						<Menu
							routes={[
								...buttonsLeft,
								{divider: <Divider key="divider" orientation="horizontal" />},
								...buttonsRight,
							]}
							buttonTheme={classes.menuButton}
						/>
						<Typography variant="h6" className={classes.title}>
							{APP_NAME}
						</Typography>
						<Divider
							orientation="vertical"
							variant="middle"
							flexItem
							className={classes.divider}
						/>
						<Grid item className={classes.buttonGridLeft}>
							{buttonsLeft &&
								buttonsLeft.map(({title, path, visibleOnLogged = "always"}) => {
									if (visibleOnLogged !== "always") {
										// if ((!user && visibleOnLogged) || (user && !visibleOnLogged)) return null;
										if (!user ^ !visibleOnLogged) return null; // Same as above, XOR, but shorter (using NOT for implicit boolean conversion)
									}

									return (
										<Button
											key={path}
											component={NavLink}
											to={path}
											exact
											activeClassName={classes.selected}
											className={classes.actionButtons}
											variant="text"
											color="inherit">
											{title}
										</Button>
									);
								})}
						</Grid>

						<Grid item className={classes.buttonGridRight}>
							{buttonsRight &&
								buttonsRight.map(({title, path, visibleOnLogged = "always"}) => {
									if (visibleOnLogged !== "always") {
										if (!user ^ !visibleOnLogged) return null;
									}

									return (
										<Button
											key={path}
											component={NavLink}
											to={path}
											exact
											activeClassName={classes.selected}
											className={classes.actionButtons}
											variant="text"
											color="inherit">
											{title}
										</Button>
									);
								})}
						</Grid>
						{user && (
							<>
								<Divider
									orientation="vertical"
									variant="middle"
									flexItem
									className={classes.divider}
								/>
								<Grid item>
									<Typography variant="body1">Welcome, {user.name}!</Typography>
								</Grid>
							</>
						)}
					</Grid>
				</Toolbar>
			</AppBar>
		</div>
	);
}
