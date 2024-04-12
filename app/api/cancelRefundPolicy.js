import client from './client';

const endpoint = '/cancelRefundPolicy';

const getCRPolicyById = (_id) => client.get(endpoint + '/' + _id);

const getCRPolicy = (payload) => client.post(endpoint + '/latest', payload);

export default {getCRPolicyById, getCRPolicy};
