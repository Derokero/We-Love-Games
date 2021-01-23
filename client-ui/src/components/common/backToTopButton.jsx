import React from "react";

import {Fab, makeStyles, useMediaQuery, useScrollTrigger, Zoom} from "@material-ui/core";

import UpIcon from "@material-ui/icons/KeyboardArrowUp";

const useStyles = makeStyles((theme) => ({
	fab: {
		position: "fixed",
		bottom: theme.spacing(2),
		right: theme.spacing(2),
	},
}));

export default function BackToTopButton(props) {
	const smUp = useMediaQuery((theme) => theme.breakpoints.up("sm"));
	const trigger = useScrollTrigger({
		disableHysteresis: true,
		threshold: 400,
	});
	const classes = useStyles();

	return (
		<Zoom in={trigger} timeout={300} unmountOnExit>
			<Fab
				onClick={() => window.scrollTo({top: 0, behavior: "smooth"})}
				aria-label="scroll back to top"
				color="secondary"
				size={smUp ? "large" : "small"}
				className={classes.fab}>
				<UpIcon />
			</Fab>
		</Zoom>
	);
}
