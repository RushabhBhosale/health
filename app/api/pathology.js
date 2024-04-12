import client from './client';

const endpoint = '/pathology';

const addPathology = (payload) => client.post(endpoint, payload);

const getPathology = (userId) => client.get(endpoint + '/user/' + userId);

const getUpcomingPathologies = (userId) =>
  client.get(endpoint + '/user/upcoming/' + userId);

export default {
  addPathology,
  getPathology,
  getUpcomingPathologies,
};
