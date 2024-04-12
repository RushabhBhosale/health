import client from './client';

const endpoint = '/fmcuser';

const getSingleFMC = (id) => client.get(endpoint + '/' + id);

const getFMCs = () =>
  client.get(endpoint + '/find/fmc');


export default {
  getFMCs,
  getSingleFMC
};
