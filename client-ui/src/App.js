import {ThemeProvider} from "@material-ui/core";
import {Redirect, Route, Switch} from "react-router-dom";

/* Styling and themes */
import "./App.css";
import customTheme from "./themes/customTheme";

/* Components */
import ButtonAppBar from "./components/common/appBar";
import Register from "./components/register";
import Login from "./components/login";
import Logout from "./components/logout";
import Home from "./components/home";
import ToPlaylist from "./components/toPlaylist";
import Favorites from "./components/favorites";
import GameReviews from "./components/gameReviews";
import EmailConfirm from "./components/emailConfirm";
import PasswordReset from "./components/passwordReset";
import ForgotPassword from "./components/forgotPassword";

/* Context */
import UserContext from "./contexts/userContext";

/* Services */
import userService from "./services/userService";
import {useEffect, useState} from "react";

function App() {
	const [user, setUser] = useState(userService.getCurrentUser());

	// On mount
	useEffect(() => {
		userService.checkExpiration();
		setUser(userService.getCurrentUser());
	}, []);

	return (
		<UserContext.Provider value={{user, setUser}}>
			<ThemeProvider theme={customTheme}>
				<header>
					<ButtonAppBar />
				</header>
				<main>
					<Switch>
						<Route path="/game-reviews/:gameId" component={GameReviews} />
						<Route path="/favorites" component={Favorites} />
						<Route path="/to-playlist" component={ToPlaylist} />
						<Route path="/email-confirm/:confirmId" component={EmailConfirm} />
						<Route path="/password-reset/:passwordResetId" component={PasswordReset} />
						<Route path="/forgot-password" component={ForgotPassword} />
						<Route path="/register" component={Register} />
						<Route path="/login" component={Login} />
						<Route path="/logout" component={Logout} />
						<Route exact path="/" component={Home} />
						<Route path="*" render={() => <Redirect to="/" />} />
						{/* Might add a 404 page, redirect to home for now */}
					</Switch>
				</main>
				{/* <footer>
					<StickyFooter />
				</footer> */}
			</ThemeProvider>
		</UserContext.Provider>
	);
}

export default App;
