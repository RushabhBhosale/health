import client from './client';

const endpoint = '/familyMember';

const addFamilyMember = (dataObj) => client.post(endpoint, dataObj);

const updateFamilyMember = (dataObj, id) =>
  client.put(endpoint + '/' + id, dataObj);

const getFamilyMember = (_id) => client.get(endpoint + '/' + _id);

const getUserFlyMembers = (userId) => client.get(endpoint + '/user/' + userId);

const deleteFamilyMember = (_id) => client.delete(endpoint + '/' + _id);

const updateSimiraId_family = (id, simiraId) => client.put(endpoint + "/" + id, {sasmiraPatientId: simiraId});

export default {
  addFamilyMember,
  updateFamilyMember,
  updateSimiraId_family,
  getFamilyMember,
  getUserFlyMembers,
  deleteFamilyMember,
};
