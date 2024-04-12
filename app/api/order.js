import client from './client';

const endpoint = '/order';

const addOrder = (payload) => client.post(endpoint, payload);

const updateOrder = (dataObj, id) => client.put(endpoint + '/' + id, dataObj);

export default {addOrder, updateOrder};
