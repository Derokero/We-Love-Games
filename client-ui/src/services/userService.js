import httpService from "./httpService";
import config from "../config/config.json";
import jwt_decode from "jwt-decode";

const STORAGE_KEY_TOKEN = config.STORAGE_KEY_TOKEN;
const STORAGE_KEY_TIMESTAMP = config.STORAGE_KEY_TIMESTAMP;
const STORAGE_EXPIRATION_TIME = config.STORAGE_EXPIRATION_TIME; // Minutes

/* Email confirmation */
async function confirmEmail(confirmationId, {confirmationCode: code}) {
	const {data} = await httpService.post(`${config.API_URI}/user/confirm-email/${confirmationId}`, {code});

	localStorage.setItem(STORAGE_KEY_TIMESTAMP, Date.now()); // Don't assume the user wants to stay logged in
	localStorage.setItem(STORAGE_KEY_TOKEN, data.authToken);
}

async function validateConfirmId(confirmationId) {
	await httpService.post(`${config.API_URI}/user/validate-confirm-id`, {confirmationId});
}

/* Password management */
async function resetPassword(passwordResetId, {password}) {
	await httpService.patch(`${config.API_URI}/user/reset-password/${passwordResetId}`, {password});
}

async function validateResetId(passwordResetId) {
	await httpService.post(`${config.API_URI}/user/validate-reset-id`, {passwordResetId});
}

async function requestPasswordChange({email}) {
	await httpService.post(`${config.API_URI}/user/request-password-reset/`, {email});
}

/* Authentication and registration */
async function register({name, email, password}) {
	const {data} = await httpService.post(`${config.API_URI}/user`, {name, email, password});
	return data.confirmationId;
}

async function login({email, password, stayLogged}) {
	const {data} = await httpService.post(`${config.API_URI}/login`, {email, password});

	// User doesn't want to stay logged in
	if (!stayLogged) {
		localStorage.setItem(STORAGE_KEY_TIMESTAMP, Date.now()); // Initial timestamp
		checkExpiration();
	}

	// Email not confirmed
	if (data.confirmationId) return data.confirmationId;

	localStorage.setItem(STORAGE_KEY_TOKEN, data.authToken); // Authenticated
}

let timerId;
function checkExpiration() {
	function heartbeat() {
		const timestamp = localStorage.getItem(STORAGE_KEY_TIMESTAMP);
		if (!timestamp) return clearInterval(timerId); // User wants to stay logged in, or has logged out. Clear heartbeat timer

		// On expiration, clear local storage user data and redirect to login
		if (Date.now() - timestamp > STORAGE_EXPIRATION_TIME * 1000 * 60) {
			logout();
			return (window.location = "/login"); // Exit to login screen
		}

		localStorage.setItem(STORAGE_KEY_TIMESTAMP, Date.now()); // Refresh expiration
	}
	// Create a heartbeat timer, refresh timestamp periodically
	if (timerId) clearInterval(timerId); // Make sure we only have one instance of the heartbeat timer
	timerId = setInterval(heartbeat, STORAGE_EXPIRATION_TIME * 1000 * 60 - 1000); // Heartbeat 1 minute before expiration

	heartbeat(); // Initial heartbeat
}

function logout() {
	localStorage.removeItem(STORAGE_KEY_TOKEN);
	localStorage.removeItem(STORAGE_KEY_TIMESTAMP);
}

function getCurrentUser() {
	try {
		const authToken = localStorage.getItem(STORAGE_KEY_TOKEN);
		return jwt_decode(authToken);
	} catch (err) {
		return null;
	}
}

const service = {
	register,
	login,
	logout,
	getCurrentUser,
	checkExpiration,
	validateConfirmId,
	confirmEmail,
	resetPassword,
	requestPasswordChange,
	validateResetId,
};

export default service;
