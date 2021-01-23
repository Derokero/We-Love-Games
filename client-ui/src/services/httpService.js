import axios from "axios";
import config from "../config/config.json";

axios.interceptors.request.use((request) => {
	if (request.url.includes(config.API_URI)) {
		try {
			const authToken = localStorage.getItem(config.STORAGE_KEY_TOKEN);
			if (!authToken) return request;
			request.headers.Authorization = `Bearer ${authToken}`;
		} catch (err) {
			console.log("Could not decode token");
		}
	}
	return request;
});

axios.interceptors.response.use(null, (error) => {
	return Promise.reject(error);
});

const service = {
	get: axios.get,
	post: axios.post,
	put: axios.put,
	patch: axios.patch,
	delete: axios.delete,
};

export default service;
