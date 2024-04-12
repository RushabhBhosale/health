import client from './client';

const endpoint = '/thyrocare';

const doLogin = () => client.get(endpoint + '/login');

const getProducts = (payload) => client.post(endpoint + '/Products', payload);

const getAppointmentSlots = (payload) =>
  client.post(endpoint + '/GetAppointmentSlots', payload);

const createDASBooking = (payload) =>
  client.post(endpoint + '/DSABooking', payload);

export default {
  doLogin,
  getProducts,
  getAppointmentSlots,
  createDASBooking,
};
