import client from './client';

const endpoint = '/slot';

const getBookingSlots = (doctorId, payload) =>
  client.post(endpoint + '/booking/' + doctorId, payload);

export default {getBookingSlots};
