import React, {useContext} from "react";
import {NavLink} from "react-router-dom";

import {makeStyles} from "@material-ui/core";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import MenuIcon from "@material-ui/icons/Menu";
import IconButton from "@material-ui/core/IconButton";
import Grid from "@material-ui/core/Grid";

/* Context */
import UserContext from "../../contexts/userContext";

const useStyles = makeStyles((theme) => ({
	selected: {
		backgroundColor: theme.palette.secondary.main,
	},
}));

export default function SimpleMenu({routes, buttonTheme}) {
	const classes = useStyles();

	const [anchorEl, setAnchorEl] = React.useState(null);

	const handleClick = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const {user} = useContext(UserContext);

	return (
		<div>
			<IconButton
				edge="start"
				className={buttonTheme}
				color="inherit"
				aria-label="menu"
				onClick={handleClick}>
				<MenuIcon aria-controls="menu" aria-haspopup="true" />
			</IconButton>

			<Menu id="menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
				{routes &&
					routes.map(({divider, title, path, icon, visibleOnLogged = "always"}) => {
						if (divider) return divider;

						if (visibleOnLogged !== "always") {
							if (!user ^ !visibleOnLogged) return null;
						}

						return (
							<MenuItem
								key={path}
								component={NavLink}
								to={path}
								exact
								onClick={handleClose}
								activeClassName={classes.selected}>
								<Grid container justify="space-between" alignItems="center">
									<Grid item>{title}</Grid>
									<Grid item>&nbsp;</Grid>
									<Grid item>{icon}</Grid>
								</Grid>
							</MenuItem>
						);
					})}
			</Menu>
		</div>
	);
}
