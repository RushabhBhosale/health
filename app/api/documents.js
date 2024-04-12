import client from './client';

const endpoint = '/document';

const postDocument = (_id, payload) =>
  client.post(endpoint + '/' + _id, payload);

const getDocuments = (userId) => client.get(endpoint + '/patient/' + userId);

const deleteDocument = (_id) => client.delete(endpoint + '/' + _id);

export default {postDocument, getDocuments, deleteDocument};
