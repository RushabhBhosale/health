import client from './client';

const endpoint = '/block';

const createUpdate = (payload) => client.post(endpoint, payload);

const unblockblock = (id) => client.put(endpoint + '/unblock/' + id);

export default {createUpdate, unblockblock};
