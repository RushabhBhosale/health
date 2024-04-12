import client from './client';

//https://beta.firstmileclinic.com/node/api

const endpoint = '/phone/';

const getUser = (phone) => client.get(endpoint + phone);

const registerPhone = (phone) => client.post(endpoint, phone);

const register = (userInfo, phone) => client.put('/users/' + phone, userInfo);

const updateSimiraId_Self = (id, simiraId) => client.put('/users/update_user/' + id, {sasmiraPatientId: simiraId});

export default {register, updateSimiraId_Self, registerPhone, getUser};
