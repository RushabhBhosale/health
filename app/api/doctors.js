import client from './client';

const endpoint = '/doctor';

const getDoctor = (id) => client.get(endpoint + '/' + id);

const getDoctorFiltered = (userId, payload) =>
  client.post(endpoint + '/filter/' + userId, payload);

const getDoctorByRelevance = (userId) =>
  client.get(endpoint + '/getByRelevance/' + userId);

const getDoctorsByPatient = (userId) =>
  client.get(endpoint + '/byPatient/' + userId);

const getDoctorsForPathology = () => client.get(endpoint + '/pathology');

export default {
  getDoctor,
  getDoctorFiltered,
  getDoctorByRelevance,
  getDoctorsByPatient,
  getDoctorsForPathology,
};
