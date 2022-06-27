import auth from './auth';
import axios from 'axios';

class HTTPClient {
  constructor() {
    this.axios = axios.create();

    this.axios.interceptors.response.use((response) => {
      return response;
    }, (error) => {
      // Any status codes that falls outside the range of 2xx cause this function to trigger
      return Promise.reject(error.message);
    });
  }

  get = (uri) => this.axios.get(uri, { headers: { Authorization: 'JWT ' + auth.jwtToken } });
}

export default new HTTPClient();
