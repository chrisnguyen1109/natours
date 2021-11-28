const axios = require("axios");

const URL = "http://localhost:3000";

axios.interceptors.request.use(
    (config) => {
        config.validateStatus = () => true;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axios.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        return Promise.reject(error);
    }
);

module.exports = async (method, endpoint, options) => {
    return await axios({
        url: `${URL}/${endpoint}`,
        method,
    });
};
