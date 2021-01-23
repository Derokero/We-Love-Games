import React, {useContext, useEffect} from "react";
import {Redirect} from "react-router-dom";

/* Services */
import userService from "../services/userService";

/* Context */
import UserContext from "../contexts/userContext";

function Logout() {
	const {setUser} = useContext(UserContext);

	useEffect(() => {
		userService.logout();
		setUser(null);
	});

	return <Redirect to="/login" />;
}

export default Logout;
