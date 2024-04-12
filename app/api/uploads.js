import client from './client';

const endpoint = '/uploads';

const uploadFiles = (payload) => client.post(endpoint + '/files', payload);

export default {
  uploadFiles,
};
