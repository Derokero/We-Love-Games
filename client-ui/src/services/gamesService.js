import httpService from "./httpService";
import config from "../config/config.json";

// https://apidocs.cheapshark.com/?version=latest#b9b738bf-2916-2a13-e40d-d05bccdce2ba

async function getDeals(params) {
	let query = "";
	for (const param in params) {
		query += `${param}=${params[param]}&`;
	}
	query = query.slice(0, -1); // Remove last '&'

	const {data} = await httpService.get(`${config.CHEAPSHARK_API}/deals?${query}`);
	return data;
}

const service = {
	getDeals,
};

export default service;
