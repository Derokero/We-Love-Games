import React from "react";
import {Link} from "react-router-dom";

import {makeStyles} from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";

const useStyles = makeStyles({
	root: {
		width: "300px",
		minHeight: "320px",
	},
	content: {
		height: "115px",
	},
	media: {
		height: "150px",
	},
});

function compareIndividualProps(prevProp, nextProp) {
	if (!(prevProp && nextProp && Array.isArray(prevProp) && Array.isArray(nextProp))) return true; // No need to re-render if prop is undefined (or not an array)

	for (let index = 0; index < prevProp.length; index++) {
		if (prevProp[index] !== nextProp[index]) return false; // Re-render as soon as we find a prop has changed
	}

	return true;
}

export default React.memo(
	function MediaCard({title, extraInfo, img, children, gameId}) {
		const classes = useStyles();

		return (
			<Card className={classes.root}>
				<CardActionArea
					component={Link}
					to={{
						pathname: `./game-reviews/${gameId}`,
						state: {title},
					}}>
					<CardMedia className={classes.media} image={img} title={title} />
					<CardContent className={classes.content}>
						<Typography gutterBottom variant="h5" component="h2">
							{title}
						</Typography>
						<Typography variant="body2" color="textSecondary" component="p">
							{extraInfo}
						</Typography>
					</CardContent>
				</CardActionArea>
				<Divider />
				<CardActions>{children}</CardActions>
			</Card>
		);
	},
	// Improve performance by rendering only on change of the following props
	(prevProps, nextProps) => {
		return (
			prevProps.title === nextProps.title &&
			prevProps.extraInfo === nextProps.extraInfo &&
			compareIndividualProps(prevProps.playlistUpdate, nextProps.playlistUpdate) &&
			compareIndividualProps(prevProps.favoritesUpdate, nextProps.favoritesUpdate) &&
			compareIndividualProps(prevProps.reviewsUpdate, nextProps.reviewsUpdate)
		);
	}
);
