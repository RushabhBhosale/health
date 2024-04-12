import client from './client';

const endpoint = '/medicalInsurance';

const addMedicalInsurance = (dataObj) => client.post(endpoint, dataObj);

const uploadDocument = (payload) =>
  client.post(endpoint + '/uploadDocument', payload);

const updateMedicalInsurance = (dataObj, id) =>
  client.put(endpoint + '/' + id, dataObj);

const getMedicalInsurance = (_id) => client.get(endpoint + '/' + _id);

const getUserInsurances = (userId) => client.get(endpoint + '/user/' + userId);

const deleteInsurance = (_id) => client.delete(endpoint + '/' + _id);

export default {
  addMedicalInsurance,
  uploadDocument,
  updateMedicalInsurance,
  getMedicalInsurance,
  getUserInsurances,
  deleteInsurance,
};
