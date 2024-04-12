import client from './client';

const endpoint = '/appointmentFeedback';

const addFeedback = (dataObj) => client.post(endpoint, dataObj);

const getAppointmentFeedback = (apntId) =>
  client.get(endpoint + '/appointment/' + apntId);

export default {addFeedback, getAppointmentFeedback};
