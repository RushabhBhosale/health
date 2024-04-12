import client from './client';

const endpoint = '/doctorDoc';

const getPatientDocs = (patientId) =>
  client.get(endpoint + '/patient/' + patientId);

export default {
  getPatientDocs,
};
