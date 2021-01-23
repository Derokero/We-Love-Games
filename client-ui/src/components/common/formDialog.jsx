import React from "react";

import {makeStyles} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

const useStyles = makeStyles({
	center: {
		margin: "0 auto",
	},
});

export default function FormDialog({title, description, showDialog, closeDialog, children}) {
	const classes = useStyles();

	return (
		<div>
			<Dialog open={showDialog} onClose={closeDialog} aria-labelledby="form-dialog-title">
				<DialogTitle className={classes.center} id="form-dialog-title">
					{title}
				</DialogTitle>
				<DialogContent>
					<DialogContentText align="center">{description}</DialogContentText>
					{children}
				</DialogContent>
				<DialogActions>
					<Button
						className={classes.center}
						onClick={closeDialog}
						variant="outlined"
						color="secondary">
						Cancel
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}
