import React, {Component} from "react";

import {CircularProgress, Grid, withStyles} from "@material-ui/core";

const styles = (theme) => ({
	root: {},
	container: {
		marginTop: "100px",
	},
	loading: {
		width: "85vw",
		margin: "50px auto",
		textAlign: "center",
	},
});

class CardsContainer extends Component {
	constructor(props) {
		super(props);

		// Setup interection observer for triggering fetch
		this.observer = new IntersectionObserver(this.handleScroll.bind(this), {
			root: null,
			rootMargin: "0px",
			threshold: 0.5,
		});
	}

	state = {
		loading: false,
	};

	componentDidMount() {
		this.observer.observe(this.loadTrigger);
	}

	componentWillUnmount() {
		if (this.observer) this.observer.disconnect();
	}

	// Handle infinite scroll
	async handleScroll(entries) {
		if (entries[0].isIntersecting && !this.state.loading) {
			this.setState({loading: true});
			await this.props.fetch();
			this.setState({loading: false});

			if (this.props.fetchOnce === true) this.observer.disconnect(); // End inifnite scrolling if specified
		}
	}

	render() {
		const {classes, children} = {...this.props};
		const {loading} = {...this.state};

		return (
			<div className={classes.container}>
				<Grid container justify="space-between" alignItems="center">
					<Grid item />
					<Grid container item justify="center" alignItems="center" xs={12} spacing={4}>
						{children}
						<div ref={(element) => (this.loadTrigger = element)} className={classes.loading}>
							{loading && <CircularProgress color="secondary" />}
						</div>
					</Grid>
					<Grid item />
				</Grid>
			</div>
		);
	}
}

export default withStyles(styles)(CardsContainer);
