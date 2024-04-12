import client from './client';

const endpoint = '/relationship';

const getRelationships = () => client.get(endpoint);

export default {getRelationships};
