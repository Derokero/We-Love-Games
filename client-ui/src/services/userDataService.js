import httpService from "./httpService";
import config from "../config/config.json";

/* To-play list */
async function addToPlaylist(gameData) {
	await httpService.post(`${config.API_URI}/userData/playlist`, gameData);
}

async function getToPlaylist() {
	const {data} = await httpService.get(`${config.API_URI}/userData/playlist`);
	return data;
}

async function deleteFromToPlaylist(lookupId) {
	await httpService.delete(`${config.API_URI}/userData/playlist/${lookupId}`);
}

/* Favorites */
async function addToFavorites(gameData) {
	await httpService.post(`${config.API_URI}/userData/favorites`, gameData);
}

async function getUserFavorites() {
	const {data} = await httpService.get(`${config.API_URI}/userData/favorites`);
	return data;
}

async function deleteFromToFavorites(lookupId) {
	await httpService.delete(`${config.API_URI}/userData/favorites/${lookupId}`);
}

// Get favorites of all users
async function getAllFavorites() {
	const {data} = await httpService.get(`${config.API_URI}/userData/favorites/all`);
	return data;
}

/* Reviews */
async function addGameReview(data) {
	await httpService.post(`${config.API_URI}/userData/reviews`, data);
}

async function updateGameReview(data) {
	await httpService.patch(`${config.API_URI}/userData/reviews`, data);
}

async function getUserReviews() {
	const {data} = await httpService.get(`${config.API_URI}/userData/reviews`);
	return data;
}

// Get reviews of all users
async function getAllReviews() {
	const {data} = await httpService.get(`${config.API_URI}/userData/reviews/all`);
	return data;
}

// Get reviews by game ID
async function getReviewsByGameId(gameId) {
	const {data} = await httpService.get(`${config.API_URI}/userData/reviews/${gameId}`);
	return data;
}

const service = {
	addToPlaylist,
	getToPlaylist,
	deleteFromToPlaylist,
	addToFavorites,
	getUserFavorites,
	deleteFromToFavorites,
	getAllFavorites,
	addGameReview,
	getUserReviews,
	updateGameReview,
	getAllReviews,
	getReviewsByGameId,
};

export default service;
