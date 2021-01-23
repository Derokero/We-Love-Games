import React from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import Typography from "@material-ui/core/Typography";
import {makeStyles} from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";

/* Components */
import Copyright from "./copyright";

const useStyles = makeStyles((theme) => ({
	root: {
		display: "block",
		position: "fixed",
		bottom: "0",
		width: "100vw",
	},
	footer: {
		padding: theme.spacing(2, 2),
		marginTop: "auto",
		backgroundColor: theme.palette.grey[200],
	},
}));

export default function StickyFooter() {
	const classes = useStyles();

	return (
		<div className={classes.root}>
			<div className={classes.footer}>
				<Container maxWidth="sm">
					<Copyright />
				</Container>
			</div>
		</div>
	);
}
