import client from './client';

const endpoint = '/appointment';

const addAppointment = (dataObj) => client.post(endpoint, dataObj);

const refundAppointment = (id) =>
  client.delete(endpoint + '/patient/refund/' + id);

const cancelAppointment = (id) => client.delete(endpoint + '/patient/' + id);

const getAppointment = (userId) => client.get(endpoint + '/user/' + userId);

const getAppointmentById = (appointment_id) =>
  client.get(endpoint + '/' + appointment_id);

const patchAppointment = (dataObj, id) =>
  client.put(endpoint + '/update/' + id, dataObj);

const getUpcomingAppointments = (id) =>
  client.get(endpoint + '/user/upcoming/' + id);

const getCompletedAppointment = (userId) =>
  client.get(endpoint + '/user/completed/' + userId);

const confirmAppointmentExists = (patientId, doctorId) =>
  client.get(endpoint + '/exists/' + patientId + '/' + doctorId);

export default {
  addAppointment,
  refundAppointment,
  cancelAppointment,
  getAppointment,
  getAppointmentById,
  patchAppointment,
  getUpcomingAppointments,
  getCompletedAppointment,
  confirmAppointmentExists,
};
