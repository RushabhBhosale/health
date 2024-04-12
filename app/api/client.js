import {create} from 'apisauce';
import authStorage from '../auth/storage';
import cache from '../utility/cache';

import settings from '../config/settings';

const config = settings();

const apiClient = create({
  baseURL: config.apiUrl,
});

apiClient.addAsyncRequestTransform(async (request) => {
  const authToken = await authStorage.getToken();
  if (!authToken) return;
  console.log("AUTH TOKEN:", authToken);
  request.headers['x-auth-token'] = authToken;
});

apiClient.addAsyncResponseTransform(async (response) => {
  if (!response.ok && response.problem === 'NETWORK_ERROR')
    response.data = {errors: [{msg: 'No Internet Connection'}]};
});

const get = apiClient.get;

apiClient.get = async (url, params, axiosConfig) => {
  // console.log("GET REQUEST: "+url);
  const response = await get(url, params, axiosConfig);

  if (response.ok) {
    cache.store(url, response.data);
    // console.log("PINCODE CACHE:", response);
    return response;
  }

  const data = await cache.get(url);
  // console.log("PINCODE DATA:", data ? {ok: true, data} : response);
  return data ? {ok: true, data} : response;
};

export default apiClient;
