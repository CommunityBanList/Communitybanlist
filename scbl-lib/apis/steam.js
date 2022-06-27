import axios from 'axios';

import { STEAM_API_KEY } from '../config.js';

if (!STEAM_API_KEY) throw new Error('Environmental variable STEAM_API_KEY must be provided.');

export default async function (method, url, params, data = {}) {
  axios.interceptors.response.use(function (response) {
    return response;
  }, function (error) {
    //add proper Error reporting here, maybe sentry so that the error does at least show up somewhere
    return Promise.reject(error.message);
  });
  return axios({
    method,
    url: 'http://api.steampowered.com/' + url,
    params: { ...params, key: STEAM_API_KEY },
    data
  });
}
